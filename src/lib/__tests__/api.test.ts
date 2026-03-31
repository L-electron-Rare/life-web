import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing the module under test
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// api.ts reads import.meta.env.VITE_API_URL at module load time;
// with no env var set it falls back to "/api".
const { api } = await import("../api");

describe("api client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("health returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", providers: ["ollama"], cache_available: true }),
    });

    const result = await api.health();
    expect(result.status).toBe("ok");
    expect(result.providers).toContain("ollama");
    expect(mockFetch).toHaveBeenCalledWith("/api/health", undefined);
  });

  it("health throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(api.health()).rejects.toThrow("500");
  });

  it("chat sends POST with correct body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          content: "hello",
          model: "qwen3:4b",
          provider: "ollama",
          usage: {},
        }),
    });

    const result = await api.chat({
      messages: [{ role: "user", content: "hi" }],
      provider: "ollama",
      model: "qwen3:4b",
    });

    expect(result.content).toBe("hello");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("models returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ models: ["qwen3:4b", "mistral:7b"] }),
    });

    const result = await api.models();
    expect(result.models).toHaveLength(2);
  });

  it("rag.stats returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ documents: 26, chunks: 184, vectors: 184 }),
    });

    const result = await api.rag.stats();
    expect(result.documents).toBe(26);
    expect(result.vectors).toBe(184);
  });

  it("stats returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ uptime: 1234, requests: 42 }),
    });

    const result = await api.stats();
    expect(result).toMatchObject({ uptime: 1234, requests: 42 });
  });

  it("providers returns parsed response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ providers: ["ollama", "openai"] }),
    });

    const result = await api.providers();
    expect(result.providers).toContain("openai");
  });

  it("conversations.list returns list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          conversations: [{ id: "abc", title: "Test", created_at: "2026-01-01", provider: "ollama", message_count: 3 }],
        }),
    });

    const result = await api.conversations.list();
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].id).toBe("abc");
  });

  it("conversations.delete calls DELETE", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(undefined) });

    await api.conversations.delete("abc");
    expect(mockFetch).toHaveBeenCalledWith("/api/conversations/abc", { method: "DELETE" });
  });
});
