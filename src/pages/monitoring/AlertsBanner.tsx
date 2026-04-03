import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Info, X, Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";

type Alert = {
  id: string; severity: "critical" | "warning" | "info";
  title: string; message: string; source: string; timestamp: string;
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-accent-red/30 bg-accent-red/10 text-accent-red",
  warning:  "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
  info:     "border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
};
const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  critical: <AlertCircle size={14} />,
  warning:  <AlertTriangle size={14} />,
  info:     <Info size={14} />,
};

export function AlertsBanner() {
  const wsBase = (import.meta.env.VITE_WS_URL || "wss://api.saillant.cc").replace(/^http/, "ws");
  const { messages, status } = useWebSocket<Alert>(`${wsBase}/ws/alerts`);
  const [visible, setVisible] = useState<Alert[]>([]);

  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];
    setVisible((prev) => [...prev.filter((a) => a.id !== latest.id), latest]);
    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((a) => a.id !== latest.id));
    }, 30_000);
    return () => clearTimeout(timer);
  }, [messages]);

  if (visible.length === 0 && status === "open") return null;

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-1 px-4 pt-2 pb-1">
      {/* Connection status */}
      {status !== "open" && (
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
          {status === "connecting" ? <Wifi size={10} className="animate-pulse text-accent-amber" /> : <WifiOff size={10} className="text-accent-red" />}
          <span>Alerts WS: {status}</span>
        </div>
      )}
      {visible.map((a) => (
        <div key={a.id} className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs ${SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.info}`}>
          {SEVERITY_ICONS[a.severity]}
          <span className="font-semibold">{a.title}</span>
          <span className="flex-1 text-[11px] opacity-80">— {a.message}</span>
          <button onClick={() => setVisible((p) => p.filter((x) => x.id !== a.id))} className="ml-2 opacity-60 hover:opacity-100">
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
