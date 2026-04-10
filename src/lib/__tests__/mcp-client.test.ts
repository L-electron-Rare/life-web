import { describe, it, expect, vi, beforeEach } from "vitest";
import { MCPClientPool } from "../mcp-client";

const mockCallTool = vi.fn();
const mockConnect = vi.fn().mockResolvedValue(undefined);

vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    callTool: mockCallTool,
  })),
}));

vi.mock("@modelcontextprotocol/sdk/client/sse.js", () => ({
  SSEClientTransport: vi.fn(),
}));

describe("MCPClientPool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new client on first call for a server", async () => {
    const pool = new MCPClientPool();
    mockCallTool.mockResolvedValue({ content: [{ type: "text", text: "ok" }] });

    await pool.callTool(
      "datasheet",
      "http://localhost:8021/sse",
      "search_datasheet",
      { query: "STM32" }
    );

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockCallTool).toHaveBeenCalledWith({
      name: "search_datasheet",
      arguments: { query: "STM32" },
    });
  });

  it("reuses the same client on subsequent calls", async () => {
    const pool = new MCPClientPool();
    mockCallTool.mockResolvedValue({ content: [] });

    await pool.callTool("datasheet", "http://localhost:8021/sse", "search_datasheet", { query: "A" });
    await pool.callTool("datasheet", "http://localhost:8021/sse", "search_datasheet", { query: "B" });

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockCallTool).toHaveBeenCalledTimes(2);
  });

  it("returns the tool call result", async () => {
    const pool = new MCPClientPool();
    const expected = { content: [{ type: "text", text: "result" }] };
    mockCallTool.mockResolvedValue(expected);

    const result = await pool.callTool(
      "datasheet",
      "http://localhost:8021/sse",
      "search_datasheet",
      { query: "q" }
    );

    expect(result).toEqual(expected);
  });
});
