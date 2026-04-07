import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGooseStream, type GooseEvent } from "../../hooks/useGooseStream";
import { api } from "../../lib/api";
import ReactMarkdown from "react-markdown";

function EventBubble({ event }: { event: GooseEvent }) {
  if (event.method === "UserMessage") {
    return (
      <div className="flex justify-end">
        <div className="glass-card max-w-[70%] rounded-xl px-4 py-3 border border-accent-green/20">
          <p className="text-text-primary text-sm whitespace-pre-wrap">{event.content}</p>
        </div>
      </div>
    );
  }
  if (event.method === "AgentMessageChunk") {
    return (
      <div className="flex justify-start">
        <div className="glass-card max-w-[70%] rounded-xl px-4 py-3 prose prose-invert prose-sm prose-p:my-1 prose-pre:bg-surface-bg prose-pre:border prose-pre:border-border-glass prose-code:text-accent-green prose-headings:text-text-primary">
          <ReactMarkdown>{event.content || ""}</ReactMarkdown>
        </div>
      </div>
    );
  }
  if (event.method === "ToolCall") {
    return (
      <div className="flex justify-start">
        <div className="terminal-box max-w-[70%] rounded-lg px-3 py-2 text-xs font-mono">
          <span className="text-accent-amber">Tool:</span>{" "}
          <span className="text-accent-blue">{event.toolName}</span>
          {event.content && (
            <pre className="text-text-muted mt-1 overflow-x-auto">{event.content}</pre>
          )}
        </div>
      </div>
    );
  }
  if (event.method === "ToolCallUpdate") {
    return (
      <div className="flex justify-start">
        <div className="terminal-box max-w-[70%] rounded-lg px-3 py-2 text-xs font-mono">
          <span className="text-accent-green">{event.toolStatus}</span>{" "}
          <span className="text-accent-blue">{event.toolName}</span>
        </div>
      </div>
    );
  }
  if (event.method === "Error") {
    return (
      <div className="flex justify-center">
        <div className="glass-card max-w-[80%] rounded-xl px-4 py-3 border border-accent-red/30 bg-accent-red/5">
          <p className="text-accent-red text-xs font-mono">{event.content}</p>
        </div>
      </div>
    );
  }
  return null;
}

export function GooseChat() {
  const { events, streaming, sessionId, createSession, sendPrompt, clearEvents } = useGooseStream();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: sessionsData } = useQuery({
    queryKey: ["goose-sessions"],
    queryFn: api.goose.listSessions,
    refetchInterval: 30_000,
  });

  void sessionsData; // available for future use

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    let sid = sessionId;
    if (!sid) {
      sid = await createSession();
    }
    await sendPrompt(text, sid ?? undefined);
    queryClient.invalidateQueries({ queryKey: ["goose-sessions"] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-glass">
        <div className="flex items-center gap-2">
          <h3 className="text-text-primary font-mono text-sm">Goose Agent</h3>
          {sessionId && (
            <span className="text-text-dim text-xs font-mono">{sessionId.slice(0, 8)}...</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={clearEvents} className="text-text-muted hover:text-text-primary text-xs font-mono px-2 py-1 rounded border border-border-glass hover:border-border-active transition-colors">Clear</button>
          <button onClick={() => createSession()} className="text-text-muted hover:text-accent-green text-xs font-mono px-2 py-1 rounded border border-border-glass hover:border-accent-green/30 transition-colors">New Session</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 && (
          <div className="text-text-dim text-sm text-center mt-8 font-mono">
            Start a conversation with Goose. It has access to FineFab tools (RAG, CAD, monitoring).
          </div>
        )}
        {events.map((event, i) => (<EventBubble key={i} event={event} />))}
        {streaming && (
          <div className="flex justify-start">
            <div className="text-accent-green text-xs font-mono animate-pulse">thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border-glass p-4">
        <div className="flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask Goose..." rows={1} className="flex-1 bg-surface-card text-text-primary border border-border-glass rounded-lg px-3 py-2 text-sm font-mono focus:border-accent-green/50 focus:outline-none resize-none placeholder:text-text-dim" />
          <button onClick={handleSend} disabled={streaming || !input.trim()} className="px-4 py-2 bg-accent-green/10 text-accent-green border border-accent-green/30 rounded-lg text-sm font-mono hover:bg-accent-green/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Send</button>
        </div>
      </div>
    </div>
  );
}
