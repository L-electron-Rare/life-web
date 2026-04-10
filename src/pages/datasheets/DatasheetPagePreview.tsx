import { useState, lazy, Suspense } from "react";
import { GlassCard } from "@finefab/ui";
import type { DatasheetHit } from "../../lib/datasheet-types";

const PdfViewerLazy = lazy(() =>
  import("./PdfViewer").then((m) => ({ default: m.PdfViewer }))
);

export interface DatasheetPagePreviewProps {
  mpn: string;
  pages: DatasheetHit[];
}

type Mode = "colpali" | "pdf";

export function DatasheetPagePreview({ mpn, pages }: DatasheetPagePreviewProps) {
  const [mode, setMode] = useState<Mode>("colpali");

  if (pages.length === 0 && mode === "colpali") {
    return (
      <div className="p-4">
        <p className="text-text-muted text-sm">No pages available for {mpn}.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("colpali")}
          className={`rounded-lg px-3 py-1 text-xs ${
            mode === "colpali"
              ? "bg-accent-blue/30 text-accent-blue"
              : "bg-surface-card text-text-muted"
          }`}
        >
          ColPali pages
        </button>
        <button
          onClick={() => setMode("pdf")}
          className={`rounded-lg px-3 py-1 text-xs ${
            mode === "pdf"
              ? "bg-accent-blue/30 text-accent-blue"
              : "bg-surface-card text-text-muted"
          }`}
        >
          Full PDF
        </button>
      </div>

      {mode === "colpali" && (
        <div className="grid grid-cols-1 gap-2">
          {pages.map((p) => (
            <GlassCard key={p.id}>
              <p className="text-[9px] uppercase text-text-muted">
                Page {p.page} — score {p.score.toFixed(2)}
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{p.text}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {mode === "pdf" && (
        <Suspense fallback={<p className="text-text-muted text-sm">Loading PDF viewer...</p>}>
          <PdfViewerLazy mpn={mpn} />
        </Suspense>
      )}
    </div>
  );
}
