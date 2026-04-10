import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasheetPagePreview } from "../DatasheetPagePreview";
import type { DatasheetHit } from "../../../lib/datasheet-types";

const mockHits: DatasheetHit[] = [
  { id: "STM32_p1", mpn: "STM32", manufacturer: "ST", category: "mcu", page: 1, score: 0.9, text: "Page 1 content" },
  { id: "STM32_p2", mpn: "STM32", manufacturer: "ST", category: "mcu", page: 2, score: 0.8, text: "Page 2 content" },
];

describe("DatasheetPagePreview", () => {
  it("renders ColPali pages in default mode", () => {
    render(<DatasheetPagePreview mpn="STM32" pages={mockHits} />);
    expect(screen.getByText(/Page 1 content/)).toBeDefined();
    expect(screen.getByText(/Page 2 content/)).toBeDefined();
  });

  it("shows toggle button for PDF mode", () => {
    render(<DatasheetPagePreview mpn="STM32" pages={mockHits} />);
    expect(screen.getByRole("button", { name: /full pdf/i })).toBeDefined();
  });

  it("switches to PDF mode on toggle", () => {
    render(<DatasheetPagePreview mpn="STM32" pages={mockHits} />);
    const toggleButton = screen.getByRole("button", { name: /full pdf/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: /colpali/i })).toBeDefined();
  });

  it("shows empty state when no pages", () => {
    render(<DatasheetPagePreview mpn="STM32" pages={[]} />);
    expect(screen.getByText(/no pages/i)).toBeDefined();
  });
});
