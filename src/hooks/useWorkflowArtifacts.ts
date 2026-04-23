import { useQuery } from "@tanstack/react-query";
import { workflowArtifactsApi } from "../lib/workflowApi";

export function useWorkflowArtifacts(slug: string) {
  return useQuery({
    queryKey: ["workflow", "artifacts", slug],
    queryFn: () => workflowArtifactsApi.listArtifacts(slug),
    enabled: Boolean(slug),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
}

export function useWorkflowRuns(slug: string) {
  return useQuery({
    queryKey: ["workflow", "runs", slug],
    queryFn: () => workflowArtifactsApi.listRuns(slug),
    enabled: Boolean(slug),
    refetchInterval: 20_000,
  });
}
