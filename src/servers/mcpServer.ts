/**
 * MCP 服务器实现
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

export const createServer = () => {
  // 初始化服务器实例（无连接状态）
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

  server.onerror = (error) => console.error("[MCP Server] error: ", error);
  server.onclose = () => console.log("[MCP Server] Server Closed");

  registerTools(server);

  // 资源清理
  const cleanup = async () => {
    try {
      await server.close();
    } catch (error: any) {
      console.error("[MCP Server] Cleanup failed: ", error);
    }
  };

  return { server, cleanup };
};

/**
 * 注册工具
 * @param server MCP 服务器实例
 */
function registerTools(server: Server) {
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
