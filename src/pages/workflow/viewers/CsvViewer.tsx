import { useEffect, useState } from "react";
import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

export function CsvViewer({ slug, artifactId, path }: Props) {
  const [rows, setRows] = useState<string[][] | null>(null);
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
        if (!cancelled) setRows(parseCsv(text));
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, artifactId, path]);

  if (err) return <p className="text-accent-red text-sm">Error: {err}</p>;
  if (!rows) return <p className="text-text-muted text-sm">Loading…</p>;
  if (rows.length === 0)
    return <p className="text-text-muted text-sm">Empty CSV.</p>;

  const [header, ...body] = rows;
  return (
    <div className="max-h-[60vh] overflow-auto rounded-lg border border-border-glass bg-surface-bg">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="sticky top-0 bg-surface-card">
            {(header ?? []).map((c, i) => (
              <th
                key={i}
                className="border-b border-border-glass px-2 py-1.5 text-left font-semibold text-text-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.slice(0, 500).map((r, i) => (
            <tr key={i} className="hover:bg-surface-hover/50">
              {r.map((c, j) => (
                <td
                  key={j}
                  className="border-b border-border-glass/50 px-2 py-1 text-text-primary"
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {body.length > 500 && (
        <p className="p-2 text-xs text-text-muted">
          Showing first 500 rows of {body.length}.
        </p>
      )}
    </div>
  );
}
