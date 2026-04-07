import { useState, Component, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GooseChat } from "./GooseChat";
import { GooseRecipes } from "./GooseRecipes";

type Tab = "chat" | "recipes";

class GooseErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="glass-card rounded-xl p-6 border border-accent-red/30 max-w-md text-center">
            <p className="text-accent-red font-mono text-sm mb-2">Goose Error</p>
            <p className="text-text-muted text-xs font-mono mb-4">{this.state.error.message}</p>
            <button onClick={() => this.setState({ error: null })} className="px-4 py-2 text-xs font-mono rounded border border-accent-green/30 text-accent-green hover:bg-accent-green/10 transition-colors">Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GoosePage() {
  const [tab, setTab] = useState<Tab>("chat");

  const { data: health } = useQuery({
    queryKey: ["goose-health"],
    queryFn: api.goose.health,
    refetchInterval: 30_000,
    retry: false,
  });

  const isOnline = health?.status === "ok";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-glass">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? "bg-accent-green" : "bg-accent-red"}`} />
            <span className="text-text-muted text-xs font-mono">goosed {isOnline ? "ready" : "offline"}</span>
          </div>
          <div className="flex gap-1">
            {(["chat", "recipes"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 text-xs font-mono rounded transition-colors ${tab === t ? "bg-surface-hover text-text-primary border border-border-active" : "text-text-muted hover:text-text-primary"}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <GooseErrorBoundary>
          {tab === "chat" && <GooseChat />}
          {tab === "recipes" && <GooseRecipes />}
        </GooseErrorBoundary>
      </div>
    </div>
  );
}
