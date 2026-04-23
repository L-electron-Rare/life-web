/**
 * Client for the f4l-engine workflow API (engine.saillant.cc).
 *
 * Reads (deliverables list/detail) are public.
 * Writes (intake create, gate advance) require a bearer token stored
 * in localStorage under `f4l_workflow_token`.
 */

const ENGINE_URL =
  (import.meta.env.VITE_ENGINE_URL as string | undefined) ??
  "https://engine.saillant.cc";

export const TOKEN_KEY = "f4l_workflow_token";

export const getWorkflowToken = (): string =>
  localStorage.getItem(TOKEN_KEY) ?? "";

export const setWorkflowToken = (t: string): void => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

const authHeader = (): Record<string, string> => {
  const t = getWorkflowToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export interface Deliverable {
  id?: number;
  deliverable_id: string;
  slug: string;
  type: "A" | "B";
  title: string;
  current_state: string;
  compliance_profile: string;
  owner: string;
  /** Epoch seconds (float) per Grist DateTime column. May be null. */
  last_transition_at?: number | null;
  created_at?: number | null;
}

export interface Gate {
  id?: number;
  gate_id: string;
  deliverable_slug: string;
  gate_name: string;
  verdict: string;
  reasons?: string;
  decided_by?: string;
  /** Epoch seconds (float) per Grist DateTime column. */
  decided_at?: number | null;
  attempt?: number;
}

/** Format a Grist epoch-seconds datetime for display. */
export const formatGristDate = (v: number | null | undefined): string =>
  v ? new Date(v * 1000).toLocaleString() : "—";

/** Compare two Grist epoch-seconds timestamps (nullable). Descending order. */
export const byRecentFirst = (
  a: number | null | undefined,
  b: number | null | undefined
): number => (b ?? 0) - (a ?? 0);

export interface Project {
  id?: number;
  project_id: string;
  slug: string;
  name: string;
  client_slug: string;
  compliance_profile: string;
  repo_url?: string;
  description?: string;
  has_hardware?: boolean;
  has_firmware?: boolean;
  firmware_target?: string;
  created_at?: number | null;
  created_by?: string;
}

export interface Client {
  id?: number;
  client_id: string;
  slug: string;
  name: string;
  contact_email?: string;
  notes?: string;
}

export interface CreateProjectPayload {
  name: string;
  slug: string;
  client_slug: string;
  client_name?: string;
  description?: string;
  compliance_profile: "prototype" | "iot_wifi_eu" | "iot_bt_fcc";
  has_hardware: boolean;
  has_firmware: boolean;
  firmware_target: "esp32" | "stm32" | "rp2040" | "native" | "none";
}

export const workflowProjectsApi = {
  async createProject(payload: CreateProjectPayload): Promise<{
    slug: string;
    repo: string;
    clone_url: string;
    deliverables: string[];
  }> {
    const t = getWorkflowToken();
    const r = await fetch(`${ENGINE_URL}/api/project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`HTTP ${r.status}: ${txt}`);
    }
    return r.json();
  },
};

export interface ForgejoRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at?: string;
  updated_at?: string;
  head_sha?: string;
  html_url: string;
}

export interface ArtifactFile {
  artifact_id: number;
  artifact_name: string;
  path: string;
  size: number;
  content_type: string;
}

export interface ArtifactBundle {
  run?: {
    id: number;
    status: string;
    conclusion: string | null;
    html_url: string;
  };
  artifacts: Array<{ id: number; name: string; size: number }>;
  files: ArtifactFile[];
}

export const workflowArtifactsApi = {
  async listRuns(slug: string): Promise<ForgejoRun[]> {
    const r = await fetch(`${ENGINE_URL}/deliverables/${slug}/runs`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  async listArtifacts(slug: string): Promise<ArtifactBundle> {
    const r = await fetch(`${ENGINE_URL}/deliverables/${slug}/artifacts`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  fileUrl(slug: string, artifactId: number, path: string): string {
    const params = new URLSearchParams({
      artifact_id: String(artifactId),
      path,
    });
    return `${ENGINE_URL}/deliverables/${slug}/artifact-file?${params.toString()}`;
  },

  async fetchFileText(
    slug: string,
    artifactId: number,
    path: string
  ): Promise<string> {
    const r = await fetch(this.fileUrl(slug, artifactId, path));
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  },

  async fetchFileBlob(
    slug: string,
    artifactId: number,
    path: string
  ): Promise<Blob> {
    const r = await fetch(this.fileUrl(slug, artifactId, path));
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.blob();
  },
};

/** Classify a file by its extension for viewer dispatch. */
export function fileKind(path: string):
  | "kicad"
  | "json"
  | "csv"
  | "markdown"
  | "text"
  | "pdf"
  | "image"
  | "binary" {
  const lower = path.toLowerCase();
  const ext = lower.split(".").pop() ?? "";
  if (ext === "kicad_sch" || ext === "kicad_pcb") return "kicad";
  if (ext === "kicad_pro" || ext === "json") return "json";
  if (ext === "csv") return "csv";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["txt", "log", "yml", "yaml", "xml", "net", "sh", "py", "ts", "tsx", "js"].includes(ext))
    return "text";
  return "binary";
}

export const workflowApi = {
  engineBase: ENGINE_URL,

  async listDeliverables(): Promise<Deliverable[]> {
    const r = await fetch(`${ENGINE_URL}/deliverables`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  async getDeliverable(slug: string): Promise<{
    deliverable: Deliverable;
    gates: Gate[];
  }> {
    const r = await fetch(`${ENGINE_URL}/deliverables/${slug}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },

  async createIntake(body: {
    title: string;
    deliverable_type: "A" | "B";
    details?: string;
    compliance_profile?: "prototype" | "iot_wifi_eu";
  }): Promise<{ slug?: string; deliverable_id?: number; intake_id: string }> {
    const r = await fetch(`${ENGINE_URL}/api/intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`HTTP ${r.status}: ${err}`);
    }
    return r.json();
  },

  async advanceGate(body: {
    deliverable_id: string;
    gate: string;
    verdict: "pass" | "fail" | "skipped";
    reasons?: string;
  }): Promise<{ previous_state: string; current_state: string }> {
    const r = await fetch(`${ENGINE_URL}/gate/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`HTTP ${r.status}: ${err}`);
    }
    return r.json();
  },
};
