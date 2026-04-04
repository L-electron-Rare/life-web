import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock react-markdown (may not be installed yet in test env)
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));

// Mock fetch for catalog endpoint
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({
      models: [{ id: "openai/qwen-32b-awq", name: "Qwen 32B AWQ (GPU)", domain: "general" }],
      domains: { general: "Général" },
    }),
    body: null,
    ok: true,
  } as unknown as Response);
});

// Lazy import to avoid module resolution issues when react-markdown is not yet installed
describe("ChatNew", () => {
  it("exports a function component", async () => {
    const mod = await import("../ChatNew");
    expect(typeof mod.ChatNew).toBe("function");
  });

  it("renders model selector and RAG toggle", async () => {
    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("checkbox")).toBeDefined();
  });

  it("renders new chat button", async () => {
    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    expect(screen.getByText("+ Nouvelle conversation")).toBeDefined();
  });

  it("renders message input and send button", async () => {
    const { ChatNew } = await import("../ChatNew");
    render(<ChatNew />);
    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByText("Envoyer")).toBeDefined();
  });
});
