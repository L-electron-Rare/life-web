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
    args: Record<string, unknown>
  ): Promise<unknown> {
    const client = await this.get(serverName, url);
    return client.callTool({ name, arguments: args });
  }
}

export const mcpPool = new MCPClientPool();
