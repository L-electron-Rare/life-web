import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowProjectsApi } from "../lib/workflowApi";

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workflowProjectsApi.createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflow", "deliverables"] });
    },
  });
}
