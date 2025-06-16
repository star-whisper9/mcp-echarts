/**
 * SSE 传输（Legacy）已被弃用
 * 此类传输的实现保留以支持旧版客户端
 * 新的传输应使用 Streamable HTTP 实现
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { log } from "../utils/log.js";
import { config } from "../models/config.js";
const { port, host, cors } = config.server;
import { corsCheck } from "../utils/httpUtil.js";

/**
 * 运行 SSE Server
 * @param mcpServer MCP 服务器实例
 * @param endpoint SSE 端点 (例如 /sse)
 */
export async function run(mcpServer: Server, endpoint: string): Promise<void> {
  const clients: Record<string, SSEServerTransport> = {};
  const app = express();

  // 跨域检查
  app.use((req, res, next) => {
    corsCheck(req, res, cors);
    next();
  });

  // SSE 建立连接
  app.get(endpoint, async (req: Request, res: Response) => {
    const transport = new SSEServerTransport("/messages", res);
    clients[transport.sessionId] = transport;

    // 尚未实现会话恢复
    let closed = false;
    req.on("close", async () => {
      closed = true;
      try {
        mcpServer.close();
      } catch (error) {
        log.error("[SSE] Error closing connection:", error);
      }
      delete clients[transport.sessionId];
    });

    (async () => {
      try {
        await mcpServer.connect(transport);
        await transport.send({
          jsonrpc: "2.0",
          method: "sse/connection",
          params: {
            message: "SSE Connection Established",
          },
        });
      } catch (error) {
        if (!closed) {
          log.error("[SSE] Error during connection:", error);
          res.writeHead(500);
          return res.json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal Server Error, connection failed",
            },
          });
        }
      }
    })();
  });

  // POST 消息处理
  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string | undefined;
    if (!sessionId || !clients[sessionId]) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid sessionId or session not found",
        },
      });
      return;
    }
    await clients[sessionId].handlePostMessage(req, res);
  });

  // 404 处理
  app.use((req, res) => {
    log.info(
      `[SSE] Unhandled request: ${req.method} ${req.url} from ${req.socket.remoteAddress}`
    );
    res.status(404).json({
      jsonrpc: "2.0",
      error: {
        code: -32601,
        message: "Method not found",
      },
    });
  });

  app.listen(port, host, () => {
    log.info(`[SSE] Server running at http://${host}:${port}${endpoint}`);
  });
}
