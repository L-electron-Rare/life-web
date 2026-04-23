import { fileKind, workflowArtifactsApi, type ArtifactFile } from "../../../lib/workflowApi";
import { CsvViewer } from "./CsvViewer";
import { HexDumpViewer } from "./HexDumpViewer";
import { ImageViewer } from "./ImageViewer";
import { JsonViewer } from "./JsonViewer";
import { KiCadViewer } from "./KiCadViewer";
import { MarkdownViewer } from "./MarkdownViewer";
import { TextViewer } from "./TextViewer";

interface Props {
  slug: string;
  file: ArtifactFile;
}

export function ArtifactViewer({ slug, file }: Props) {
  const { artifact_id: artifactId, path } = file;
  const kind = fileKind(path);
  const common = { slug, artifactId, path };
  switch (kind) {
    case "json":
      return <JsonViewer {...common} />;
    case "csv":
      return <CsvViewer {...common} />;
    case "markdown":
      return <MarkdownViewer {...common} />;
    case "text":
      return <TextViewer {...common} />;
    case "kicad":
      return <KiCadViewer {...common} />;
    case "image":
      return <ImageViewer {...common} />;
    case "pdf": {
      const url = workflowArtifactsApi.fileUrl(slug, artifactId, path);
      return (
        <object
          data={url}
          type="application/pdf"
          className="h-[70vh] w-full rounded-lg border border-border-glass bg-surface-bg"
        >
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="text-accent-green hover:underline"
          >
            Download {path}
          </a>
        </object>
      );
    }
    case "binary":
    default:
      return <HexDumpViewer {...common} />;
  }
}
