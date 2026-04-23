import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

export function MarkdownViewer({ slug, artifactId, path }: Props) {
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
    <article className="prose prose-invert max-h-[60vh] max-w-none overflow-auto rounded-lg border border-border-glass bg-surface-bg p-4 text-sm">
      <ReactMarkdown>{text}</ReactMarkdown>
    </article>
  );
}
