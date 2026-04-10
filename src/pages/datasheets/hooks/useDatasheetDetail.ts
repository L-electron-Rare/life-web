import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export function useDatasheetDetail(mpn: string | null) {
  return useQuery({
    queryKey: ["datasheets", "detail", mpn],
    queryFn: () => api.datasheets.getComponentSpecs(mpn!),
    enabled: !!mpn,
  });
}
