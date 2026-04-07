import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { StatusDot } from "@finefab/ui";

type Provider = {
  name: string;
  source: "env" | "redis" | "unconfigured";
  masked_key: string | null;
  active: boolean;
  priority: number;
};

function SourceBadge({ source }: { source: Provider["source"] }) {
  const styles: Record<Provider["source"], string> = {
    env: "bg-accent-green/10 text-accent-green border-accent-green/30",
    redis: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    unconfigured: "bg-surface-hover text-text-dim border-border-glass",
  };
  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${styles[source]}`}>
      {source}
    </span>
  );
}

function EditKeyModal({
  name,
  onClose,
  onSave,
}: {
  name: string;
  onClose: () => void;
  onSave: (key: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-bg/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-xl border border-border-glass p-6 shadow-xl">
        <h3 className="mb-4 font-mono text-sm text-text-primary">
          Update API key — <span className="text-accent-green">{name}</span>
        </h3>
        <input
          type="password"
          placeholder="sk-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-border-glass bg-surface-hover px-3 py-2 font-mono text-sm text-text-primary placeholder-text-dim focus:border-accent-green focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border-glass px-4 py-1.5 text-sm text-text-muted hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (value.trim()) { onSave(value.trim()); onClose(); } }}
            className="rounded-lg bg-accent-green/10 border border-accent-green/30 px-4 py-1.5 text-sm text-accent-green hover:bg-accent-green/20 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderRow({ provider }: { provider: Provider }) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latency_ms: number | null; error: string | null } | null>(null);
  const [testing, setTesting] = useState(false);

  const update = useMutation({
    mutationFn: (data: { api_key?: string; active?: boolean }) =>
      api.config.updateProvider(provider.name, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["config-providers"] }),
  });

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.config.testProvider(provider.name);
      setTestResult(result);
    } catch {
      setTestResult({ ok: false, latency_ms: null, error: "Request failed" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <>
      {editOpen && (
        <EditKeyModal
          name={provider.name}
          onClose={() => setEditOpen(false)}
          onSave={(key) => update.mutate({ api_key: key })}
        />
      )}
      <tr className="border-t border-border-glass transition-colors hover:bg-surface-hover/40">
        <td className="px-4 py-3 font-mono text-sm text-text-primary">{provider.name}</td>
        <td className="px-4 py-3">
          <SourceBadge source={provider.source} />
        </td>
        <td className="px-4 py-3 font-mono text-xs text-text-muted">
          {provider.masked_key ?? <span className="text-text-dim italic">not set</span>}
          <button
            onClick={() => setEditOpen(true)}
            className="ml-2 rounded border border-border-glass px-2 py-0.5 text-[10px] text-text-muted hover:border-accent-green/40 hover:text-accent-green transition-colors"
          >
            Edit
          </button>
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => update.mutate({ active: !provider.active })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              provider.active ? "bg-accent-green/40" : "bg-surface-hover"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                provider.active ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="rounded border border-border-glass px-2.5 py-1 text-xs text-text-muted hover:border-accent-green/40 hover:text-accent-green transition-colors disabled:opacity-50"
            >
              {testing ? "Testing…" : "Test"}
            </button>
            {testResult && (
              <span className={`flex items-center gap-1 text-xs ${testResult.ok ? "text-accent-green" : "text-accent-red"}`}>
                <StatusDot status={testResult.ok ? "healthy" : "unhealthy"} />
                {testResult.ok
                  ? `${testResult.latency_ms?.toFixed(0)}ms`
                  : (testResult.error ?? "error")}
              </span>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

export function ConfigProviders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["config-providers"],
    queryFn: api.config.providers,
  });

  if (isLoading) return <div className="p-4 text-xs text-text-muted animate-pulse">Loading providers…</div>;
  if (isError) return <div className="p-4 text-xs text-accent-red">Failed to load providers</div>;

  return (
    <div className="p-4">
      <div className="terminal-box overflow-hidden rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-glass">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Provider</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Source</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">API Key</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Active</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Test</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <ProviderRow key={p.name} provider={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
