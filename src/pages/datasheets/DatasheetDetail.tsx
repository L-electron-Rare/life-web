import { GlassCard } from "@finefab/ui";
import { DatasheetPagePreview } from "./DatasheetPagePreview";
import { useDatasheetDetail } from "./hooks/useDatasheetDetail";
import type { DatasheetHit } from "../../lib/datasheet-types";

export interface DatasheetDetailProps {
  mpn: string | null;
  pages: DatasheetHit[];
}

export function DatasheetDetail({ mpn, pages }: DatasheetDetailProps) {
  const { data, isLoading, isError } = useDatasheetDetail(mpn);

  if (!mpn) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-text-muted text-sm">
          Select a datasheet from the sidebar to view details.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-text-muted text-sm">Loading specs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <GlassCard>
          <p className="text-accent-red text-sm">Failed to load datasheet for {mpn}.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div className="border-b border-border-glass pb-3">
        <h2 className="font-mono text-lg text-text-primary">{mpn}</h2>
        {data?.extracted_at && (
          <p className="text-[9px] uppercase text-text-muted mt-1">
            Extracted: {new Date(data.extracted_at).toLocaleString()}
          </p>
        )}
      </div>

      {data?.raw_text && (
        <GlassCard>
          <p className="text-[9px] uppercase text-text-muted">Specs</p>
          <pre className="mt-2 text-xs whitespace-pre-wrap text-text-primary">
            {data.raw_text}
          </pre>
        </GlassCard>
      )}

      {pages.length > 0 && <DatasheetPagePreview mpn={mpn} pages={pages} />}
    </div>
  );
}
