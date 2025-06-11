import fs from "fs";

const ALLOWED_TRANSPORTS = ["stdio", "sse", "http"] as const;
type TransportType = (typeof ALLOWED_TRANSPORTS)[number];

/**
 * 检查并返回合法的 MCP 传输方式
 *
 * @returns 合法的 MCP 传输方式
 */
function getTransport(): TransportType {
  const t = process.env.MCP_TRANSPORT || "stdio";
  if (ALLOWED_TRANSPORTS.includes(t as TransportType)) {
    return t as TransportType;
  }
  console.warn(
    `[config] MCP_TRANSPORT is illegal, falling back to "stdio". Possible values: ${ALLOWED_TRANSPORTS.join(
      ", "
    )}`
  );
  return "stdio";
}

/**
 * 检查并返回合法的端口号
 *
 * @param input - 需要校验的端口号字符串
 * @param defaultPort - 默认端口号，如果输入无效则返回此值
 * @returns 合法端口号
 */
function getPort(input: string | undefined, defaultPort: number): number {
  const port = input ? parseInt(input, 10) : defaultPort;
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    console.warn("[config] MCP_PORT is illegal, falling back to 1122");
    return defaultPort;
  }
  return port;
}

/**
 * 获取 CORS 策略
 * 可以是一个 JSON 数组字符串，或者一个文本文件路径，每行一个允许的域名
 * 当包含 "*" 时，将忽略其他域名，允许所有跨域请求
 *
 * @returns CORS 策略列表
 */
function getCorsPolicy(): string[] {
  const cors = process.env.MCP_CORS;
  if (cors) {
    try {
      const parsedCors = JSON.parse(cors);
      if (
        Array.isArray(parsedCors) &&
        parsedCors.every((item) => typeof item === "string")
      ) {
        if (parsedCors.includes("*")) {
          console.warn(
            "[config] CORS policy allows all origins, this may not be secure in production!"
          );
        }
        return parsedCors;
      }
    } catch (e) {
      console.log(
        "[config] Cors policy parsing failed, trying to read as a file"
      );
      try {
        const corsFileContent = fs.readFileSync(cors, "utf-8").trim();
        return corsFileContent
          .split(/\r?\n/)
          .filter((line: string) => line.trim() !== "");
      } catch (fileError) {
        console.error("[config] Cors file read failed:", fileError);
      }
    }
  }
  console.log(
    "[config] MCP_CORS is not set or malformed, falling back to empty CORS policy"
  );
  return [];
}

export const config = {
  server: {
    transport: getTransport(),
    port: getPort(process.env.MCP_PORT, 1122),
    host: process.env.MCP_HOST || "127.0.0.1",
    cors: getCorsPolicy() || [],
  },
  resource: {
    staticPath: process.env.RES_PATH || "./static",
    enabled: process.env.RES_ENABLED === "true",
    port: getPort(process.env.RES_PORT, 1123),
    host: process.env.RES_HOST || "127.0.0.1",
    baseUrl: process.env.RES_BASE_URL || "http://127.0.0.1:1123",
    geoJsonPath: process.env.GEOJSON_PATH || "./static/geojson/",
  },
};
