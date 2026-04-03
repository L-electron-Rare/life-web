import { useQuery } from "@tanstack/react-query";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../../lib/api";

function GaugeBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-14 w-14">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="60%" outerRadius="100%"
            data={[{ value: pct, fill: color }]} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#1e2030" }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <span className="text-[10px] text-text-muted uppercase">{label}</span>
      <span className="text-xs font-mono" style={{ color }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function formatUptime(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`;
}

export function MachinesPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["infra-machines"],
    queryFn: api.monitoring.machines,
    refetchInterval: 10_000,
  });

  if (isLoading) return <div className="terminal-box p-4 text-xs text-text-muted animate-pulse">Chargement machines…</div>;
  if (isError) return <div className="terminal-box p-4 text-xs text-accent-red">Erreur machines</div>;

  return (
    <div className="terminal-box p-4">
      <h3 className="mb-3 text-xs uppercase text-text-muted font-semibold tracking-widest">Machines</h3>
      <div className="grid grid-cols-2 gap-3">
        {(data?.machines ?? []).map((m) => (
          <div key={m.name} className={`rounded-lg border p-3 ${m.error ? "border-accent-red/30 bg-accent-red/5" : "border-border-glass bg-surface-hover"}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">{m.name}</span>
              <span className="rounded bg-surface-bg px-1.5 py-0.5 text-[10px] font-mono text-text-muted">{m.ip}</span>
            </div>
            <div className="flex justify-around">
              <GaugeBar value={m.cpu_percent} max={100} label="CPU" />
              <GaugeBar value={m.ram_used_gb} max={m.ram_total_gb} label="RAM" />
              <GaugeBar value={m.disk_used_gb} max={m.disk_total_gb} label="Disk" />
            </div>
            <div className="mt-2 text-center text-[10px] text-text-muted">
              uptime: {formatUptime(m.uptime_hours)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
