/**
 * Server 实现
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import * as Charts from "../echarts/index.js";
import { ChartTypes } from "../models/schema.js";

/**
 * stdio 传输调用
 */
export async function runStdioServer(): Promise<void> {
  const server = createServer();
  const { run } = await import("./stdio.js");
  await run(server);
}

/**
 * SSE 传输调用
 * TODO dummy method now
 */
export async function runSSEServer(endpoint: string = "/sse"): Promise<void> {
  const server = createServer();
  const { run } = await import("./sse.js");
  await run(server, endpoint);
}

/**
 * Streamable HTTP 传输调用
 * TODO dummy method now
 */
export async function runHTTPServer(
  endpoint: string = "/mcp",
  port: number = 1122,
  host: string = "127.0.0.1",
  cors: string[] = []
): Promise<void> {
  // const server = createServer();
  // const { run } = await import("./http.js");
  // await run(server, endpoint, port, host, cors);
}

const createServer = (): Server => {
  const server = new Server(
    {
      name: "ECharts",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 监听事件
  server.onerror = (error) => {
    console.error("[MCP Server] error: ", error);
  };
  process.on("SIGINT", () => {
    console.log("[MCP Server] Received SIGINT, shutting down now...");
    server.close();
    process.exit(0);
  });

  registerTools(server);

  return server;
};

/**
 * 注册工具
 * @param server MCP 服务器实例
 */
function registerTools(server: Server): void {
  // 工具列表处理器
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(Charts).map((chart) => chart.tool),
  }));

  // 工具请求处理器
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const chartType =
      ChartTypes[request.params.name as keyof typeof ChartTypes];

    if (!chartType) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `工具 "${request.params.name}" 不存在或未注册`
      );
    }

    try {
      const args = request.params.arguments || {};
      const schema = Charts[chartType].schema;

      if (schema) {
        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `参数验证失败: ${parseResult.error.message}`
          );
        }
      }
      const url = await Charts[chartType].create(args);

      return {
        content: [
          {
            type: "text",
            text: url,
          },
        ],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `生成失败：${error?.message || "未知错误"}`
      );
    }
  });
}
