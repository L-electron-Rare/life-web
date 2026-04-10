import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DatasheetSearchBar } from "../DatasheetSearchBar";

describe("DatasheetSearchBar", () => {
  it("renders input with placeholder", () => {
    render(<DatasheetSearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
  });

  it("calls onSearch with debounce", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<DatasheetSearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "STM32" } });

    // Initial render calls onSearch("") immediately then debounces changes
    // Advance by 300ms to trigger debounced call
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledWith("STM32");
    vi.useRealTimers();
  });
});
