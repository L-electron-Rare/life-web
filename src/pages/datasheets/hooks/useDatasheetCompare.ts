import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export function useDatasheetCompare() {
  return useMutation({
    mutationFn: ({ mpns, criteria }: { mpns: string[]; criteria: string[] }) =>
      api.datasheets.compare(mpns, criteria),
  });
}
