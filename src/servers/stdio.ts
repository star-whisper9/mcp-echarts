/**
 * Stdio 传输 Server
 */
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export async function run(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
