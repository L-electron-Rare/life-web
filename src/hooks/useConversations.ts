import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: api.conversations.list });
}

export function useConversation(id: string) {
  return useQuery({ queryKey: ["conversations", id], queryFn: () => api.conversations.get(id), enabled: !!id });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.conversations.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }) });
}
