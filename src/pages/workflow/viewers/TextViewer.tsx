import { useEffect, useState } from "react";
import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

export function TextViewer({ slug, artifactId, path }: Props) {
  const [text, setText] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await workflowArtifactsApi.fetchFileText(
          slug,
          artifactId,
          path
        );
        if (!cancelled) setText(t);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, artifactId, path]);

  if (err) return <p className="text-accent-red text-sm">Error: {err}</p>;
  if (!text) return <p className="text-text-muted text-sm">Loading…</p>;

  return (
    <pre className="max-h-[60vh] overflow-auto rounded-lg border border-border-glass bg-surface-bg p-3 text-xs font-mono text-text-primary whitespace-pre-wrap">
      {text}
    </pre>
  );
}
