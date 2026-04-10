import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { useDatasheetDetail } from "../useDatasheetDetail";
import { api } from "../../../../lib/api";

vi.mock("../../../../lib/api", () => ({
  api: {
    datasheets: {
      getComponentSpecs: vi.fn(),
    },
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useDatasheetDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is disabled when mpn is null", () => {
    renderHook(() => useDatasheetDetail(null), { wrapper });
    expect(api.datasheets.getComponentSpecs).not.toHaveBeenCalled();
  });

  it("fetches when mpn is provided", async () => {
    (api.datasheets.getComponentSpecs as any).mockResolvedValue({
      mpn: "STM32G431",
      raw_text: "specs",
      extracted_at: "2026-04-08T00:00:00Z",
    });
    const { result } = renderHook(() => useDatasheetDetail("STM32G431"), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.mpn).toBe("STM32G431");
  });
});
