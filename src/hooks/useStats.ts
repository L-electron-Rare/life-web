import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: api.stats, refetchInterval: 30_000 });
}
