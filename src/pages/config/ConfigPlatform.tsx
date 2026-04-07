import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { StatusDot } from "@finefab/ui";

type ServiceHealth = {
  name: string;
  ok: boolean;
  url: string;
  memory: string | null;
  error: string | null;
};

const SERVICE_ICONS: Record<string, string> = {
  redis: "⚡",
  qdrant: "🔍",
  ollama: "🦙",
  vllm: "🚀",
  langfuse: "📊",
};

function ServiceCard({ svc }: { svc: ServiceHealth }) {
  return (
    <div
      className={`glass-card rounded-xl border p-4 ${
        svc.ok
          ? "border-accent-green/20 bg-accent-green/5"
          : "border-accent-red/20 bg-accent-red/5"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{SERVICE_ICONS[svc.name] ?? "●"}</span>
          <span className="font-mono text-sm font-semibold capitalize text-text-primary">
            {svc.name}
          </span>
        </div>
        <StatusDot status={svc.ok ? "healthy" : "unhealthy"} />
      </div>
      {svc.url && (
        <p className="mb-1 truncate font-mono text-[11px] text-text-dim" title={svc.url}>
          {svc.url}
        </p>
      )}
      {svc.memory && (
        <p className="font-mono text-[11px] text-text-muted">{svc.memory}</p>
      )}
      {svc.error && (
        <p className="mt-1 font-mono text-[11px] text-accent-red" title={svc.error}>
          {svc.error.length > 60 ? `${svc.error.slice(0, 60)}…` : svc.error}
        </p>
      )}
    </div>
  );
}

export function ConfigPlatform() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["config-platform"],
    queryFn: api.config.platform,
    refetchInterval: 30_000,
  });

  const services = data?.services ?? [];
  const healthyCount = services.filter((s) => s.ok).length;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-sm font-semibold text-text-primary">Platform Health</h2>
          <span className="rounded-full border border-border-glass bg-surface-hover px-2 py-0.5 font-mono text-[11px] text-text-muted">
            {isLoading ? "…" : `${healthyCount}/${services.length} ok`}
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-border-glass px-3 py-1.5 text-xs text-text-muted hover:border-accent-green/40 hover:text-accent-green transition-colors disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {isLoading && (
        <div className="text-xs text-text-muted animate-pulse">Checking services…</div>
      )}
      {isError && (
        <div className="text-xs text-accent-red">Failed to fetch platform health</div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => (
          <ServiceCard key={svc.name} svc={svc} />
        ))}
      </div>
    </div>
  );
}
