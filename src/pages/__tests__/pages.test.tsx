import { describe, it, expect } from "vitest";

// Test that page modules export correctly — no rendering, no router dependency needed.
describe("page exports", () => {
  it("DashboardOverview exports", async () => {
    const mod = await import("../../pages/dashboard/DashboardOverview");
    expect(typeof mod.DashboardOverview).toBe("function");
  });

  it("DashboardMetrics exports", async () => {
    const mod = await import("../../pages/dashboard/DashboardMetrics");
    expect(typeof mod.DashboardMetrics).toBe("function");
  });

  it("DashboardLogs exports", async () => {
    const mod = await import("../../pages/dashboard/DashboardLogs");
    expect(typeof mod.DashboardLogs).toBe("function");
  });

  it("ChatNew exports", async () => {
    const mod = await import("../../pages/chat/ChatNew");
    expect(typeof mod.ChatNew).toBe("function");
  });

  it("ChatConversations exports", async () => {
    const mod = await import("../../pages/chat/ChatConversations");
    expect(typeof mod.ChatConversations).toBe("function");
  });

  it("ProvidersStatus exports", async () => {
    const mod = await import("../../pages/providers/ProvidersStatus");
    expect(typeof mod.ProvidersStatus).toBe("function");
  });

  it("ProvidersConfig exports", async () => {
    const mod = await import("../../pages/providers/ProvidersConfig");
    expect(typeof mod.ProvidersConfig).toBe("function");
  });

  it("ProvidersBenchmark exports", async () => {
    const mod = await import("../../pages/providers/ProvidersBenchmark");
    expect(typeof mod.ProvidersBenchmark).toBe("function");
  });

  it("RagDocuments exports", async () => {
    const mod = await import("../../pages/rag/RagDocuments");
    expect(typeof mod.RagDocuments).toBe("function");
  });

  it("RagSearch exports", async () => {
    const mod = await import("../../pages/rag/RagSearch");
    expect(typeof mod.RagSearch).toBe("function");
  });

  it("RagStats exports", async () => {
    const mod = await import("../../pages/rag/RagStats");
    expect(typeof mod.RagStats).toBe("function");
  });

  it("TracesRequests exports", async () => {
    const mod = await import("../../pages/traces/TracesRequests");
    expect(typeof mod.TracesRequests).toBe("function");
  });

  it("TracesMetrics exports", async () => {
    const mod = await import("../../pages/traces/TracesMetrics");
    expect(typeof mod.TracesMetrics).toBe("function");
  });

  it("InfraContainers exports", async () => {
    const mod = await import("../../pages/infra/InfraContainers");
    expect(typeof mod.InfraContainers).toBe("function");
  });

  it("InfraNetwork exports", async () => {
    const mod = await import("../../pages/infra/InfraNetwork");
    expect(typeof mod.InfraNetwork).toBe("function");
  });

  it("InfraStorage exports", async () => {
    const mod = await import("../../pages/infra/InfraStorage");
    expect(typeof mod.InfraStorage).toBe("function");
  });
});
