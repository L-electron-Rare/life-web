import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export function useDatasheetSearch(query: string, topK = 10) {
  return useQuery({
    queryKey: ["datasheets", "search", query, topK],
    queryFn: () => api.datasheets.search(query, topK),
    enabled: query.length >= 2,
    staleTime: 60_000,
  });
}
