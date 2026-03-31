import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";
import { Terminal } from "../../components/ui/Terminal";

type LogLevel = "INFO" | "WARN" | "ERROR";

function parseTraceLevel(trace: Record<string, unknown>): LogLevel {
  const status = String((trace.status ?? trace.statusCode ?? "")).toLowerCase();
  if (status.includes("error") || status.startsWith("5") || status.startsWith("4")) return "ERROR";
  if (status.includes("warn")) return "WARN";
  return "INFO";
}

function traceToLine(trace: Record<string, unknown>) {
  const ts = trace.startTime
    ? new Date(Number(trace.startTime) / 1000).toISOString().slice(11, 19)
    : "--:--:--";
  const op = String(trace.operationName ?? trace.operation ?? "unknown");
  const duration = trace.duration ? `${Math.round(Number(trace.duration) / 1000)}ms` : "";
  const process = trace.process as Record<string, unknown> | undefined;
  const service = String(process?.serviceName ?? trace.serviceName ?? "");
  return {
    timestamp: ts,
    level: parseTraceLevel(trace),
    message: [service, op, duration].filter(Boolean).join(" "),
  };
}

export function TracesRequests() {
  const traces = useQuery({
    queryKey: ["traces-recent"],
    queryFn: () => api.traces.recent("life-core", 20),
    refetchInterval: 15_000,
  });

  const rawData = (traces.data as { data?: Record<string, unknown>[] } | undefined)?.data ?? [];
  const lines = rawData.length > 0
    ? rawData.map((t) => traceToLine(t))
    : [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <GlassCard>
        <p className="text-xs text-text-muted mb-2">
          Requêtes LLM récentes — live via /traces/recent
          {traces.isError && <span className="ml-2 text-accent-amber">(erreur de chargement — backend non connecté)</span>}
        </p>
      </GlassCard>
      <Terminal
        title="$ recent LLM calls"
        lines={lines.length > 0 ? lines : [{ timestamp: "--:--:--", level: "INFO" as const, message: "En attente de données live…" }]}
        className="h-[calc(100vh-200px)]"
      />
    </div>
  );
}
