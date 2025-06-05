import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./servers/mcpServer.js";

console.log("[main] Server Starting...");

async function main() {
  const transport = new StdioServerTransport();
  const { server, cleanup } = createServer();

  await server.connect(transport);

  process.on("SIGINT", async () => {
    console.log("[main] Received SIGINT, shutting down now...");
    await cleanup();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(
    "[main] Error when running or starting, shutting down now...",
    error
  );
  process.exit(1);
});
