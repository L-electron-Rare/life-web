import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";

type Prefs = {
  default_model: string;
  rag_enabled: boolean;
  language: string;
};

export function ConfigPreferences() {
  const { data, isLoading } = useQuery({
    queryKey: ["config-preferences"],
    queryFn: api.config.preferences,
  });

  const [form, setForm] = useState<Prefs>({
    default_model: "",
    rag_enabled: false,
    language: "FR",
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.config.savePreferences(form),
  });

  return (
    <div className="p-4">
      <div className="terminal-box mx-auto max-w-lg rounded-xl p-6">
        <h2 className="mb-6 font-mono text-sm font-semibold text-text-primary">User Preferences</h2>

        {isLoading ? (
          <p className="text-xs text-text-muted animate-pulse">Loading…</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Default model */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Default Model
              </label>
              <input
                type="text"
                value={form.default_model}
                onChange={(e) => setForm((f) => ({ ...f, default_model: e.target.value }))}
                placeholder="openai/gpt-4o"
                className="rounded-lg border border-border-glass bg-surface-hover px-3 py-2 font-mono text-sm text-text-primary placeholder-text-dim focus:border-accent-green focus:outline-none transition-colors"
              />
            </div>

            {/* RAG toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-text-primary">RAG</p>
                <p className="font-mono text-[11px] text-text-dim">Enable retrieval-augmented generation by default</p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, rag_enabled: !f.rag_enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.rag_enabled ? "bg-accent-green/40 border border-accent-green/40" : "bg-surface-hover border border-border-glass"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.rag_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Language selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Language
              </label>
              <div className="flex gap-2">
                {["FR", "EN"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setForm((f) => ({ ...f, language: lang }))}
                    className={`rounded-lg border px-5 py-2 font-mono text-sm transition-colors ${
                      form.language === lang
                        ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                        : "border-border-glass text-text-muted hover:border-border-glass/80 hover:bg-surface-hover"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="rounded-lg border border-accent-green/40 bg-accent-green/10 px-6 py-2 font-mono text-sm text-accent-green hover:bg-accent-green/20 transition-colors disabled:opacity-50"
              >
                {save.isPending ? "Saving…" : "Save"}
              </button>
              {save.isSuccess && (
                <span className="font-mono text-xs text-accent-green">Saved!</span>
              )}
              {save.isError && (
                <span className="font-mono text-xs text-accent-red">Save failed</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
