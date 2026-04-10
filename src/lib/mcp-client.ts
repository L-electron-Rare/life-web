import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export class MCPClientPool {
  private clients = new Map<string, Client>();

  async get(serverName: string, url: string): Promise<Client> {
    if (!this.clients.has(serverName)) {
      const transport = new SSEClientTransport(new URL(url));
      const client = new Client(
        { name: "life-web", version: "1.0.0" },
        { capabilities: {} }
      );
      await client.connect(transport);
      this.clients.set(serverName, client);
    }
    return this.clients.get(serverName)!;
  }

  async callTool(
    serverName: string,
    url: string,
    name: string,
    args: Record<string, unknown>,
    maxRetries = 3
  ): Promise<unknown> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const client = await this.get(serverName, url);
        return await client.callTool({ name, arguments: args });
      } catch (e) {
        lastError = e as Error;
        // Invalidate client on failure so we reconnect next time
        this.clients.delete(serverName);
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
        }
      }
    }
    throw lastError;
  }
}

export const mcpPool = new MCPClientPool();
