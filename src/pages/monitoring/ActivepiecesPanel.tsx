import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

const RUN_COLORS: Record<string, string> = {
  SUCCEEDED: "text-accent-green",
  FAILED:    "text-accent-red",
  RUNNING:   "text-accent-amber animate-pulse",
  UNKNOWN:   "text-text-muted",
};
const STATUS_COLORS: Record<string, string> = {
  ENABLED:  "bg-accent-green/10 text-accent-green",
  DISABLED: "bg-surface-hover text-text-muted",
  ERROR:    "bg-accent-red/10 text-accent-red",
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }); }
  catch { return iso; }
}

export function ActivepiecesPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["infra-activepieces"],
    queryFn: api.monitoring.activepieces,
    refetchInterval: 30_000,
  });

  const flows = data?.flows ?? [];

  return (
    <div className="terminal-box p-4">
      <h3 className="mb-3 text-xs uppercase text-text-muted font-semibold tracking-widest">
        Automation <span className="text-text-muted font-normal normal-case">(auto.saillant.cc)</span>
      </h3>
      {isLoading && <p className="py-4 text-xs text-text-muted animate-pulse">Chargement flows…</p>}
      {isError && <p className="py-2 text-xs text-accent-red">Erreur Activepieces</p>}
      {data?.error && <p className="py-2 text-xs text-accent-amber">{data.error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-glass text-[10px] uppercase text-text-muted">
              <th className="pb-1 text-left">Flow</th>
              <th className="pb-1 text-center">Status</th>
              <th className="pb-1 text-right">Last run</th>
              <th className="pb-1 text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((f) => (
              <tr key={f.id} className="border-b border-border-glass/30">
                <td className="py-1.5 text-text-primary">{f.name}</td>
                <td className="py-1.5 text-center">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[f.status] ?? STATUS_COLORS.DISABLED}`}>
                    {f.status}
                  </span>
                </td>
                <td className="py-1.5 text-right text-text-muted">{fmtDate(f.last_run_at)}</td>
                <td className={`py-1.5 text-center font-medium ${RUN_COLORS[f.last_run_status] ?? RUN_COLORS.UNKNOWN}`}>
                  {f.last_run_status}
                </td>
              </tr>
            ))}
            {flows.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="py-4 text-center text-text-muted">Aucun flow</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
