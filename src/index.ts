import "dotenv/config";

// init echarts maps before importing servers
// this is required for correct schema generation
import { registerMaps } from "./utils/map.js";
let mapRegStatus = await registerMaps();
if (!mapRegStatus) {
  console.warn(
    "[main] Map registration failed, some features may not work properly."
  );
}

import {
  runSSEServer,
  runStdioServer,
  runHTTPServer,
} from "./servers/server.js";

import { config } from "./models/config.js";

console.log("[main] Server Starting...");

async function main() {
  // init mcp server
  // TODO other transports implementation
  switch (config.server.transport) {
    case "stdio":
      await runStdioServer();
      break;
    case "sse":
      await runSSEServer(`/sse`);
      break;
    case "http":
      await runHTTPServer(`/mcp`);
      break;
    default:
      console.warn(
        `[main] Unknown transport "${config.server.transport}", falling back to stdio transport.`
      );
      await runStdioServer();
      break;
  }

  if (config.resource.enabled) {
    const { runResourceServer } = await import("./servers/resourceServer.js");
    await runResourceServer();
  }
}

main().catch((error) => {
  console.error(
    "[main] Error when running or starting, shutting down now...",
    error
  );
  process.exit(1);
});
