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
    transport: getTransport(),
    port: getPort(),
    host: process.env.MCP_HOST || "127.0.0.1",
  },
  resource: {
    staticPath: process.env.RES_PATH || "./static",
    baseUrl: process.env.RES_BASE_URL || "http://127.0.0.1:1123",
  },
};
