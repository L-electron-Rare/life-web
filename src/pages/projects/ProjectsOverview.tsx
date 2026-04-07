import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@finefab/ui";
import { api } from "../../lib/api";

const EDA_URL = import.meta.env.VITE_EDA_URL || "https://eda.saillant.cc";

const GATE_KEYS = ["s0", "s1", "s2", "s3", "s4"] as const;

function gateColor(status: string): string {
  switch (status) {
    case "pass":
      return "bg-accent-green";
    case "in-review":
      return "bg-accent-amber";
    case "blocked":
      return "bg-accent-red";
    default:
      return "bg-surface-hover";
  }
}

export function ProjectsOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: api.projects.list,
    refetchInterval: 30_000,
    retry: false,
  });

  const projects = data?.projects ?? [];
  const total = data?.count ?? 0;
  const active = projects.filter((p) =>
    Object.values(p.gates).some((g) => g.status === "in-review")
  ).length;
  const completed = projects.filter((p) =>
    Object.values(p.gates).every((g) => g.status === "pass")
  ).length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total" value={total} subtitle="projets" color="text-accent-blue" />
        <MetricCard label="Active" value={active} subtitle="en cours" color="text-accent-green" />
        <MetricCard label="Completed" value={completed} subtitle="terminés" color="text-accent-amber" />
      </div>

      {isLoading && (
        <p className="text-text-muted animate-pulse text-sm">Chargement des projets…</p>
      )}

      {isError && (
        <p className="text-accent-red text-sm">Impossible de charger les projets.</p>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <p className="text-text-muted text-sm">Aucun projet trouvé.</p>
      )}

      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <button
            key={project.name}
            type="button"
            onClick={() => window.open(`${EDA_URL}/projects/${project.name}`, "_blank")}
            className="glass-card rounded-lg border border-border-glass bg-surface-card p-4 text-left transition-colors hover:border-border-active hover:bg-surface-hover"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-text-primary">
                {project.name}
              </span>
              <span className="text-xs text-text-muted">{project.client}</span>
            </div>

            <div className="flex gap-1">
              {GATE_KEYS.map((key) => {
                const gate = project.gates[key];
                const status = gate?.status ?? "pending";
                return (
                  <div
                    key={key}
                    title={`${key}: ${status}${gate?.date ? ` (${gate.date})` : ""}`}
                    className={`h-2 flex-1 rounded-sm ${gateColor(status)}`}
                  />
                );
              })}
            </div>

            <div className="mt-1 flex gap-1">
              {GATE_KEYS.map((key) => (
                <span key={key} className="flex-1 text-center font-mono text-[9px] text-text-dim">
                  {key}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
