import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GooseChat } from "./GooseChat";
import { GooseRecipes } from "./GooseRecipes";

type Tab = "chat" | "recipes";

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
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-accent-green" : "bg-accent-red"}`} />
            <span className="text-text-muted text-xs font-mono">goosed {isOnline ? "online" : "offline"}</span>
          </div>
          <div className="flex gap-1">
            {(["chat", "recipes"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 text-xs font-mono rounded transition-colors ${tab === t ? "bg-surface-hover text-text-primary border border-border-active" : "text-text-muted hover:text-text-primary"}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "chat" && <GooseChat />}
        {tab === "recipes" && <GooseRecipes />}
      </div>
    </div>
  );
}
