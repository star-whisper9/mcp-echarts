const ALLOWED_TRANSPORTS = ["stdio", "sse", "http"] as const;
type TransportType = (typeof ALLOWED_TRANSPORTS)[number];

function getTransport(): TransportType {
  const t = process.env.MCP_TRANSPORT || "stdio";
  if (ALLOWED_TRANSPORTS.includes(t as TransportType)) {
    return t as TransportType;
  }
  console.warn(
    `[config] MCP_TRANSPORT 非法，已回退为 "stdio"。允许值: ${ALLOWED_TRANSPORTS.join(
      ", "
    )}`
  );
  return "stdio";
}

function getPort(): number {
  const portStr = process.env.MCP_PORT;
  const port = portStr ? parseInt(portStr, 10) : 1122;
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    console.warn("[config] MCP_PORT 非法，已回退为 1122");
    return 1122;
  }
  return port;
}

export const config = {
  server: {
    // MCP 通信方式，stdio、sse 或 http
    // 分别对应 stdio，sse(Deprecated)，streamable http
    transport: getTransport(),
    // MCP 监听端口，sse/http 时有效
    port: getPort(),
    // MCP 监听地址，sse/http 时有效
    host: process.env.MCP_HOST || "127.0.0.1",
  },
  resource: {
    // 导出内容存储路径
    staticPath: process.env.RES_PATH || "./static",
    // 导出内容访问 URL 前缀（内置 http 资源服务器路径或外部资源托管路径）
    baseUrl: process.env.RES_BASE_URL || "http://127.0.0.1:1123",
    // GeoJson 文件路径，服务器启动时会注册所有此路径下的 JSON 文件为 ECharts 地图资源
    geoJsonPath: process.env.GEOJSON_PATH || "./static/geojson/",
  },
};
