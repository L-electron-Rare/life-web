import { useState, useCallback } from "react";
import { getAccessToken } from "../lib/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3210";

export interface GooseEvent {
  method: string;
  content?: string;
  toolName?: string;
  toolStatus?: string;
}

export function useGooseStream() {
  const [events, setEvents] = useState<GooseEvent[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (workingDir = ".") => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/goose/sessions`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ working_dir: workingDir }),
    });
    if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
    const data = await res.json();
    setSessionId(data.session_id);
    return data.session_id;
  }, []);

  const sendPrompt = useCallback(
    async (prompt: string, sid?: string) => {
      const targetSession = sid || sessionId;
      if (!targetSession) throw new Error("No active session");

      setStreaming(true);
      setEvents((prev) => [
        ...prev,
        { method: "UserMessage", content: prompt },
      ]);

      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/goose/prompt`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            session_id: targetSession,
            prompt,
          }),
        });

        if (!res.ok) throw new Error(`Prompt failed: ${res.status}`);
        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") break;
            try {
              const event = JSON.parse(payload);
              const method = event.method || "";
              if (method === "AgentMessageChunk") {
                setEvents((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.method === "AgentMessageChunk") {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...last,
                      content: (last.content || "") + (event.params?.content || ""),
                    };
                    return updated;
                  }
                  return [
                    ...prev,
                    { method: "AgentMessageChunk", content: event.params?.content || "" },
                  ];
                });
              } else if (method === "ToolCall") {
                setEvents((prev) => [
                  ...prev,
                  {
                    method: "ToolCall",
                    toolName: event.params?.name || "unknown",
                    content: JSON.stringify(event.params?.arguments || {}),
                  },
                ]);
              } else if (method === "ToolCallUpdate") {
                setEvents((prev) => [
                  ...prev,
                  {
                    method: "ToolCallUpdate",
                    toolName: event.params?.name || "unknown",
                    toolStatus: event.params?.status || "done",
                    content: event.params?.result || "",
                  },
                ]);
              }
            } catch { /* skip malformed */ }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Connection failed";
        setError(message);
        setEvents((prev) => [...prev, { method: "Error", content: message }]);
      } finally {
        setStreaming(false);
      }
    },
    [sessionId],
  );

  const clearEvents = useCallback(() => setEvents([]), []);
  const clearError = useCallback(() => setError(null), []);

  return { events, streaming, sessionId, createSession, sendPrompt, clearEvents, error, clearError };
}
