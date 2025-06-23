#!/usr/bin/env node
import "dotenv/config";

import {
  runSSEServer,
  runStdioServer,
  runHTTPServer,
  activeServers,
} from "./servers/server.js";
import { initLogger, log } from "./utils/log.js";

initLogger();

import { config } from "./models/config.js";

log.info("[main] Server Starting...");

async function main() {
  // init mcp server
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
      log.warn(
        `[main] Unknown transport "${config.server.transport}", falling back to stdio transport.`
      );
      await runStdioServer();
      break;
  }

  if (config.resource.enabled) {
    const { runResourceServer } = await import("./servers/resourceServer.js");
    await runResourceServer();
  }

  // 统一处理维护的服务器实例，避免每次服务器都注册监听器
  process.on("SIGINT", () => {
    log.info("[main] Received SIGINT, shutting down servers...");
    for (const server of activeServers) {
      server.close().catch((error) => {
        log.error("[main] Error closing  connection:", error);
      });
    }
  });
}

main().catch((error) => {
  log.error(
    "[main] Error when running or starting, shutting down now...",
    error
  );
  process.exit(1);
});
