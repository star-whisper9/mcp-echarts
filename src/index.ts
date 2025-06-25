#!/usr/bin/env node
import "dotenv/config";

import {
  runSSEServer,
  runStdioServer,
  runHTTPServer,
  activeServers,
} from "./servers/server.js";
import { initLogger, log } from "./utils/log.js";
import { cleanupContexts } from "./utils/isolatedVM.js";

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

  const cleanup = async () => {
    log.info("[main] Starting cleanup...");

    // 清理 isolated-vm 上下文
    try {
      cleanupContexts();
      log.info("[main] Cleaned up isolated VM contexts");
    } catch (error) {
      log.error("[main] Error cleaning up contexts:", error);
    }

    // 关闭服务器
    for (const server of activeServers) {
      try {
        await server.close();
        log.info("[main] Server closed successfully");
      } catch (error) {
        log.error("[main] Error closing server connection:", error);
      }
    }
  };

  // 统一处理维护的服务器实例，避免每次服务器都注册监听器
  process.on("SIGINT", async () => {
    log.info("[main] Received SIGINT, shutting down servers...");
    await cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    log.info("[main] Received SIGTERM, shutting down servers...");
    await cleanup();
    process.exit(0);
  });

  process.on("uncaughtException", async (error) => {
    log.error("[main] Uncaught exception:", error);
    await cleanup();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    log.error("[main] Unhandled rejection at:", promise, "reason:", reason);
    await cleanup();
    process.exit(1);
  });
}

main().catch(async (error) => {
  log.error(
    "[main] Error when running or starting, shutting down now...",
    error
  );
  try {
    const { cleanupContexts } = await import("./utils/isolatedVM.js");
    cleanupContexts();
  } catch (cleanupError) {
    log.error("[main] Error during cleanup:", cleanupError);
  }
  process.exit(1);
});
