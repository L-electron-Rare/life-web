import { useEffect, useState } from "react";
import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

export function JsonViewer({ slug, artifactId, path }: Props) {
  const [raw, setRaw] = useState<string>("");
  const [pretty, setPretty] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const text = await workflowArtifactsApi.fetchFileText(
          slug,
          artifactId,
          path
        );
        if (cancelled) return;
        setRaw(text);
        try {
          setPretty(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setPretty(text);
        }
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, artifactId, path]);

  if (err) return <p className="text-accent-red text-sm">Error: {err}</p>;
  if (!raw) return <p className="text-text-muted text-sm">Loading…</p>;

  return (
    <pre className="max-h-[60vh] overflow-auto rounded-lg bg-surface-bg p-3 text-xs font-mono text-text-primary border border-border-glass">
      {pretty}
    </pre>
  );
}
