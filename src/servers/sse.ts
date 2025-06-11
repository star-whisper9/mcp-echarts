import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import http from "http";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { config } from "../models/config.js";
const { port, host, cors } = config.server;

/**
 * 检查 CORS 策略并设置响应头
 *
 * @param req request 对象
 * @param res response 对象
 * @param cors cors 策略列表
 * @returns 如果不允许跨域，则返回 403 Forbidden
 *          如果允许跨域，则设置响应头并返回 undefined
 */
function corsCheck(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  cors: string[]
): http.ServerResponse | void {
  const origin = req.headers.origin;
  if (!cors.includes("*")) {
    // 只允许列表中的域
    if (origin && !cors.includes(origin)) {
      res.writeHead(403);
      return res.end("Forbidden");
    } else {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
}

/**
 * 运行 SSE Server
 * @param mcpServer MCP 服务器实例
 * @param endpoint SSE 端点 (例如 /sse)
 * @param port 监听端口
 * @param host 监听地址
 */
export async function run(mcpServer: Server, endpoint: string): Promise<void> {
  // client 连接列表
  const clients: Record<string, SSEServerTransport> = {};

  // 创建 HTTP 服务
  const server = http.createServer(async (req, res) => {
    corsCheck(req, res, cors);

    if (!req.url) {
      res.writeHead(400).end("No URL");
      return;
    }

    // Get 建立连接
    if (req.url === endpoint && req.method === "GET") {
      const transport = new SSEServerTransport("/messages", res);
      clients[transport.sessionId] = transport;

      // 未实现异常断开的会话恢复，在 MCP 标准中应实现此功能
      let closed = false;
      res.on("close", async () => {
        closed = true;

        try {
          // 客户端断连后断开对应 transport
          mcpServer.close();
        } catch (error) {
          console.error("[SSE] Error closing connection:", error);
        }
        delete clients[transport.sessionId];
      });

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
          console.error("[SSE] Error during connection:", error);
          res.writeHead(500);
          return res.end("Internal Server Error");
        }
      }

      return;
    }

    // 处理客户端 POST 消息
    if (req.url && req.method === "POST" && req.url.startsWith("/messages")) {
      const sessionId = new URL(
        req.url,
        `http://${host}:${port}`
      ).searchParams.get("sessionId");

      if (!sessionId || !clients[sessionId]) {
        res.writeHead(400);
        return res.end("Invalid session ID");
      }

      await clients[sessionId].handlePostMessage(req, res);
      return;
    }

    // 任何不匹配请求返回 404
    console.info(
      `[SSE] Unhandled request: ${req.method} ${req.url} from ${req.socket.remoteAddress}`
    );
    res.writeHead(404);
    return res.end("Not Found");
  });

  server.listen(port, host, () => {
    console.log(`[SSE] Server running at http://${host}:${port}${endpoint}`);
  });
}
