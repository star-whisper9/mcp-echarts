import "dotenv/config";
import {
  runSSEServer,
  runStdioServer,
  runHTTPServer,
} from "./servers/server.js";
import { registerMaps } from "./utils/map.js";
import { config } from "./models/config.js";

const { transport, port, host, cors } = config.server;

console.log("[main] Server Starting...");

async function main() {
  // init mcp server
  // TODO other transports implementation
  switch (transport) {
    case "stdio":
      await runStdioServer();
      break;
    case "sse":
      await runSSEServer(`/sse`, port, host, cors);
      break;
    case "http":
      // not implemented yet
      // await runHTTPServer(`/mcp`, port, host, cors);
      // break;
      console.warn("[main] HTTP transport is not implemented yet.");
    default:
      console.warn(
        `[main] Unknown transport "${transport}", falling back to stdio transport.`
      );
      await runStdioServer();
      break;
  }

  // init echarts maps
  let mapRegStatus = await registerMaps();
  if (!mapRegStatus) {
    console.warn(
      "[main] Map registration failed, some features may not work properly."
    );
  }
}

main().catch((error) => {
  console.error(
    "[main] Error when running or starting, shutting down now...",
    error
  );
  process.exit(1);
});
