import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { StatusDot } from "../../components/ui/StatusDot";

export function InfraContainers() {
  const containers = useQuery({
    queryKey: ["infra-containers"],
    queryFn: api.infra.containers,
    refetchInterval: 10_000,
  });

  const rows = containers.data?.containers ?? [];

  return (
    <div className="p-4">
      <div className="terminal-box">
        <div className="grid grid-cols-[1fr_80px_80px_100px] gap-2 border-b border-border-glass pb-2 text-[10px] uppercase text-text-muted">
          <span>Container</span><span>CPU</span><span>MEM</span><span>Status</span>
        </div>
        {containers.isLoading && (
          <p className="py-4 text-xs text-text-muted">Chargement…</p>
        )}
        {containers.isError && (
          <p className="py-4 text-xs text-accent-red">Erreur : {String(containers.error)}</p>
        )}
        {rows.map((c) => (
          <div key={c.name} className="grid grid-cols-[1fr_80px_80px_100px] gap-2 py-1.5 text-xs">
            <span className="text-text-primary font-mono">{c.name}</span>
            <span className="text-accent-blue">{c.cpu}</span>
            <span className="text-accent-amber">{c.memory}</span>
            <StatusDot status={c.status === "healthy" ? "healthy" : "unknown"} label={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
