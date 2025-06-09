import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./servers/mcpServer.js";
import { registerMaps } from "./utils/map.js";

console.log("[main] Server Starting...");

async function main() {
  // init mcp server
  const transport = new StdioServerTransport();
  const { server, cleanup } = createServer();

  await server.connect(transport);

  // init echarts maps
  let mapRegStatus = await registerMaps();
  if (!mapRegStatus) {
    console.warn(
      "[main] Map registration failed, some features may not work properly."
    );
  }

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
