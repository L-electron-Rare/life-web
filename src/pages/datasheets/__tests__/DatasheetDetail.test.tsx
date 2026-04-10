import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { DatasheetDetail } from "../DatasheetDetail";
import { api } from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  api: {
    datasheets: {
      getComponentSpecs: vi.fn(),
    },
  },
}));

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    createElement(QueryClientProvider, { client }, ui)
  );
}

describe("DatasheetDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows placeholder when no mpn selected", () => {
    wrap(<DatasheetDetail mpn={null} pages={[]} />);
    expect(screen.getByText(/select a datasheet/i)).toBeDefined();
  });

  it("shows specs after fetch", async () => {
    (api.datasheets.getComponentSpecs as any).mockResolvedValue({
      mpn: "STM32G431",
      raw_text: "Voltage: 3.3V, Clock: 170MHz",
      extracted_at: "2026-04-08T00:00:00Z",
    });
    wrap(<DatasheetDetail mpn="STM32G431" pages={[]} />);
    await screen.findByText(/STM32G431/);
    expect(screen.getByText(/170MHz/)).toBeDefined();
  });
});
