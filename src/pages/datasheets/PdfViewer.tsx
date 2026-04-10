export interface PdfViewerProps {
  mpn: string;
}

export function PdfViewer({ mpn }: PdfViewerProps) {
  return (
    <div className="p-4 text-sm text-text-muted">
      PDF viewer for {mpn} — integration with react-pdf deferred.
    </div>
  );
}
