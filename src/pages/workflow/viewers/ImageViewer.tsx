import { workflowArtifactsApi } from "../../../lib/workflowApi";

interface Props {
  slug: string;
  artifactId: number;
  path: string;
}

export function ImageViewer({ slug, artifactId, path }: Props) {
  const url = workflowArtifactsApi.fileUrl(slug, artifactId, path);
  return (
    <div className="flex max-h-[60vh] items-center justify-center overflow-auto rounded-lg border border-border-glass bg-surface-bg p-2">
      <img src={url} alt={path} className="max-h-full max-w-full object-contain" />
    </div>
  );
}
