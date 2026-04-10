import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { useDatasheetSearch } from "../useDatasheetSearch";
import { api } from "../../../../lib/api";

vi.mock("../../../../lib/api", () => ({
  api: {
    datasheets: {
      search: vi.fn(),
    },
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useDatasheetSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is disabled when query is shorter than 2 chars", () => {
    renderHook(() => useDatasheetSearch("a"), { wrapper });
    expect(api.datasheets.search).not.toHaveBeenCalled();
  });

  it("fetches when query is 2+ chars", async () => {
    (api.datasheets.search as any).mockResolvedValue([
      { id: "x_p1", mpn: "STM32", manufacturer: "", category: "", page: 1, score: 0.9, text: "t" },
    ]);
    const { result } = renderHook(() => useDatasheetSearch("STM32"), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toHaveLength(1);
    expect(api.datasheets.search).toHaveBeenCalledWith("STM32", 10);
  });
});
