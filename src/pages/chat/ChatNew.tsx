import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { GlassCard } from "../../components/ui/GlassCard";
import { useChatStream, type Message } from "../../hooks/useChatStream";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3210";
const LS_KEY = "chat_history";

interface Session {
  id: string;
  title: string;
  messages: Message[];
}

export function ChatNew() {
  const [model, setModel] = useState("openai/qwen-32b-awq");
  const [useRag, setUseRag] = useState(false);
  const [input, setInput] = useState("");
  const [catalog, setCatalog] = useState<{ id: string; name: string; domain?: string }[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string>(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages, streaming, send } = useChatStream(API);

  // Load model catalog
  useEffect(() => {
    fetch(`${API}/models/catalog`)
      .then((r) => r.json())
      .then((data: { models: { id: string; name: string; domain?: string }[] }) =>
        setCatalog(data.models ?? []),
      )
      .catch(() => {});
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        setSessions(JSON.parse(saved) as Session[]);
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Update session in history when messages change
  useEffect(() => {
    if (!messages.length) return;
    setSessions((prev) => {
      const copy = prev.filter((s) => s.id !== activeId);
      return [
        {
          id: activeId,
          title: messages[0].content.slice(0, 40),
          messages,
        },
        ...copy,
      ];
    });
  }, [messages, activeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!input.trim() || streaming) return;
    send(input.trim(), model, useRag);
    setInput("");
  };

  const startNewChat = () => {
    setActiveId(crypto.randomUUID());
    setMessages([]);
  };

  const loadSession = (s: Session) => {
    setActiveId(s.id);
    setMessages(s.messages);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0 border-r border-border-glass flex flex-col gap-2 p-3 overflow-y-auto">
        <button
          onClick={startNewChat}
          className="rounded-lg bg-accent-green/20 px-3 py-1.5 text-xs font-medium text-accent-green hover:bg-accent-green/30"
        >
          + Nouvelle conversation
        </button>
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => loadSession(s)}
            className={`text-left text-xs truncate p-2 rounded-lg transition-colors ${
              s.id === activeId
                ? "bg-surface-hover text-text-primary"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            {s.title || "Sans titre"}
          </button>
        ))}
      </aside>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border-glass">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-border-glass bg-surface-card px-3 py-1.5 text-xs text-text-primary"
          >
            {catalog.length === 0 ? (
              <option value="openai/qwen-32b-awq">Qwen 32B AWQ (GPU)</option>
            ) : (
              catalog.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))
            )}
          </select>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer text-text-muted hover:text-text-primary">
            <input
              type="checkbox"
              checked={useRag}
              onChange={(e) => setUseRag(e.target.checked)}
              className="accent-accent-green"
            />
            RAG
          </label>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.map((m, i) => (
            <GlassCard key={i} className={m.role === "user" ? "ml-12" : "mr-12"}>
              <p className="mb-1 text-[9px] uppercase text-text-muted">
                {m.role === "user" ? "Vous" : model}
              </p>
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none text-text-primary">
                  <ReactMarkdown>
                    {m.content || (streaming && i === messages.length - 1 ? "▌" : "")}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              )}
            </GlassCard>
          ))}
          {streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
            <GlassCard className="mr-12">
              <p className="animate-pulse text-sm text-text-muted">▌</p>
            </GlassCard>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 p-4 border-t border-border-glass">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Votre message… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border-glass bg-surface-card px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={streaming || !input.trim()}
            className="self-end rounded-lg bg-accent-green/20 px-4 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-accent-green/30 disabled:opacity-50"
          >
            {streaming ? "…" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}
