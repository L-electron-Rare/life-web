import { useEffect, useState } from "react";
import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

/**
 * KiCad viewer using the KiCanvas web component.
 * The <kicanvas-embed> element is loaded globally via CDN (see index.html).
 *
 * KiCanvas expects a URL or inline source. Since our artifact is served
 * through the engine, we pass the engine URL directly — KiCanvas will
 * fetch it. The file is already served with a text/plain Content-Type,
 * which KiCanvas accepts.
 */
export function KiCadViewer({ slug, artifactId, path }: Props) {
  const url = workflowArtifactsApi.fileUrl(slug, artifactId, path);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Re-mount the <kicanvas-embed> when inputs change by cycling a key.
    setLoaded(false);
    const id = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(id);
  }, [url]);

  return (
    <div className="max-h-[70vh] w-full overflow-auto rounded-lg border border-border-glass bg-surface-bg">
      {loaded && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <kicanvas-embed
          {...({ src: url, controls: "full" } as any)}
          style={{
            width: "100%",
            height: "70vh",
            display: "block",
          }}
        />
      )}
      <div className="flex items-center justify-between border-t border-border-glass px-3 py-2 text-xs text-text-muted">
        <span className="font-mono">{path}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="text-accent-green hover:underline"
        >
          raw ↗
        </a>
      </div>
    </div>
  );
}
