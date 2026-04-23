import { useEffect, useState } from "react";
import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

const MAX_BYTES = 2048;

function hexDump(bytes: Uint8Array, max: number): string {
  const n = Math.min(bytes.byteLength, max);
  const lines: string[] = [];
  for (let i = 0; i < n; i += 16) {
    const slice = bytes.subarray(i, Math.min(i + 16, n));
    const hex = [...slice]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")
      .padEnd(16 * 3 - 1, " ");
    const ascii = [...slice]
      .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : "."))
      .join("");
    lines.push(`${i.toString(16).padStart(8, "0")}  ${hex}  ${ascii}`);
  }
  return lines.join("\n");
}

export function HexDumpViewer({ slug, artifactId, path }: Props) {
  const [dump, setDump] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blob = await workflowArtifactsApi.fetchFileBlob(
          slug,
          artifactId,
          path
        );
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        if (!cancelled) {
          setTotal(bytes.byteLength);
          setDump(hexDump(bytes, MAX_BYTES));
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
  if (!dump) return <p className="text-text-muted text-sm">Loading…</p>;

  return (
    <>
      <p className="mb-2 text-xs text-text-muted">
        Binary · {total.toLocaleString()} bytes · showing first{" "}
        {Math.min(total, MAX_BYTES).toLocaleString()}{" "}
        <a
          href={workflowArtifactsApi.fileUrl(slug, artifactId, path)}
          className="text-accent-green hover:underline"
          download
        >
          download full ↓
        </a>
      </p>
      <pre className="max-h-[60vh] overflow-auto rounded-lg border border-border-glass bg-surface-bg p-3 text-[11px] font-mono text-text-primary whitespace-pre">
        {dump}
      </pre>
    </>
  );
}
