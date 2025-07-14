import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

import { corsCheck, validation } from "../utils/httpUtil.js";
import { log } from "../utils/log.js";
import { config } from "../models/config.js";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
const { port, host, cors } = config.server;

export async function run(
  createServer: () => Server,
  endpoint: string
): Promise<void> {
  const clients: Record<
    string,
    { server: Server; transport: StreamableHTTPServerTransport }
  > = {};
  const app = express();

  app.use((req, res, next) => {
    corsCheck(req, res, cors);
    next();
  });

  app.use(validation);

  app.post(endpoint, async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;
    const mcpServer = createServer();

    if (sessionId && clients[sessionId]) {
      // 会话 Id 存在并且已经连接
      transport = clients[sessionId].transport;
      await transport.handleRequest(req, res);
      return;
    } else if (!sessionId) {
      // 会话 Id 不存在，创建新的会话
      const eventStore = new InMemoryEventStore();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        eventStore, // Enable resumability
        onsessioninitialized: (sessionId: string) => {
          // 连接建立之后再保存会话信息
          clients[sessionId] = { server: mcpServer, transport: transport };
        },
      });

      transport.onclose = async () => {
        const sid = transport.sessionId;
        if (sid && clients[sid]) {
          try {
            // 先删除客户端记录，防止重复关闭
            const client = clients[sid];
            delete clients[sid];

            // 然后关闭服务器
            await client.server?.close();
          } catch (error) {
            log.error("[HTTP] Error closing connection:", error);
          }
        }
      };

      await mcpServer.connect(transport);

      await transport.handleRequest(req, res);
      return;
    } else {
      // 会话 Id 存在但无效
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: Invalid session ID",
        },
        id: req?.body?.id || null,
      });
      return;
    }
  });

  app.get(endpoint, async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !clients[sessionId]) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: Invalid session ID",
        },
        id: req?.body?.id || null,
      });
      return;
    }

    const lastEvent = req.headers["last-event-id"] as string | undefined;
    if (lastEvent) {
      log.info(
        `[HTTP] Client ${sessionId} reconnecting with last event ID: ${lastEvent}`
      );
    }

    const transport = clients[sessionId].transport;
    await transport.handleRequest(req, res);
  });

  app.delete(endpoint, async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !clients[sessionId]) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: Invalid session ID",
        },
        id: req?.body?.id || null,
      });
      return;
    }

    try {
      const transport = clients[sessionId].transport;
      await transport!.handleRequest(req, res);
    } catch (error) {
      log.error("[HTTP] Error handling termination request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Error handling session termination",
          },
          id: req?.body?.id,
        });
        return;
      }
    }
  });

  app.use((req, res) => {
    log.info(
      `[HTTP] Unhandled request: ${req.method} ${req.url} from ${req.socket.remoteAddress}`
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
    log.info(`[HTTP] Server is running at http://${host}:${port}${endpoint}`);
  });
}
