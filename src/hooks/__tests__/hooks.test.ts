import { describe, it, expect, vi } from "vitest";

// Test that hooks exist and export the right functions
describe("hooks exports", () => {
  it("useHealth exports correctly", async () => {
    const mod = await import("../../hooks/useHealth");
    expect(typeof mod.useHealth).toBe("function");
  });

  it("useStats exports correctly", async () => {
    const mod = await import("../../hooks/useStats");
    expect(typeof mod.useStats).toBe("function");
  });

  it("useConversations exports correctly", async () => {
    const mod = await import("../../hooks/useConversations");
    expect(typeof mod.useConversations).toBe("function");
    expect(typeof mod.useDeleteConversation).toBe("function");
  });
});
