import { describe, it, expect } from "vitest";

describe("layout exports", () => {
  it("Sidebar exports", async () => {
    const mod = await import("../Sidebar");
    expect(typeof mod.Sidebar).toBe("function");
  });

  it("SubTabs exports", async () => {
    const mod = await import("../SubTabs");
    expect(typeof mod.SubTabs).toBe("function");
  });

  it("AppShell exports", async () => {
    const mod = await import("../AppShell");
    expect(typeof mod.AppShell).toBe("function");
  });
});
