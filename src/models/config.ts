/**
 * 配置管理
 *
 * 优先级：yaml 文件(--config-path传入) > 命令行参数 > 环境变量
 */
import fs from "fs";
import minimist from "minimist";
import yaml from "js-yaml";
import merge from "lodash/merge.js";

const argv = minimist(process.argv.slice(2), {
  alias: {
    "mcp-port": "mcpPort",
    "mcp-host": "mcpHost",
    "res-path": "resourcePath",
    "res-enabled": "resourceEnabled",
    "res-port": "resourcePort",
    "res-host": "resourceHost",
    "res-base-url": "resourceBaseUrl",
    "geojson-path": "geoJsonPath",
    "config-path": "configPath",
  },
});

const ALLOWED_TRANSPORTS = ["stdio", "sse", "http"] as const;
type TransportType = (typeof ALLOWED_TRANSPORTS)[number];

/**
 * 检查并返回合法的 MCP 传输方式
 *
 * @returns 合法的 MCP 传输方式
 */
function getTransport(): TransportType {
  const t = argv.transport || process.env.MCP_TRANSPORT || "stdio";
  if (ALLOWED_TRANSPORTS.includes(t as TransportType)) {
    return t as TransportType;
  }
  console.error(
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
    console.error("[config] MCP_PORT is illegal, falling back to 1122");
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
  const cors = argv.cors || process.env.MCP_CORS;
  if (cors) {
    try {
      const parsedCors = JSON.parse(cors);
      if (
        Array.isArray(parsedCors) &&
        parsedCors.every((item) => typeof item === "string")
      ) {
        if (parsedCors.includes("*")) {
          console.error(
            "[config] CORS policy allows all origins, this may not be secure in production!"
          );
        }
        return parsedCors;
      }
    } catch (e) {
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
  console.error(
    "[config] MCP_CORS is not set or malformed, falling back to empty CORS policy"
  );
  return [];
}

/**
 * 获取默认配置
 * @returns 默认配置对象
 */
function getDefaultConfig(): any {
  return {
    server: {
      transport: getTransport(),
      port: getPort(argv.mcpPort || process.env.MCP_PORT, 1122),
      host: argv.mcpHost || process.env.MCP_HOST || "127.0.0.1",
      cors: getCorsPolicy() || [],
    },
    resource: {
      resourcePath: argv.resourcePath || process.env.RES_PATH || "./static",
      enabled: argv.resourceEnabled || process.env.RES_ENABLED === "true",
      port: getPort(argv.resourcePort || process.env.RES_PORT, 1123),
      host: argv.resourceHost || process.env.RES_HOST || "127.0.0.1",
      baseUrl:
        argv.resourceBaseUrl ||
        process.env.RES_BASE_URL ||
        "http://127.0.0.1:1123",
      geoJsonPath:
        argv.geoJsonPath || process.env.GEOJSON_PATH || "./static/geojson/",
    },
  };
}

/**
 * 读取自定义配置 YAML
 * @returns 合并的配置
 */
function loadConfigFile(): any | null {
  const configPath = argv.configPath || process.env.CONFIG_PATH;
  if (!configPath) {
    return null;
  }

  let config: any | null = null;
  try {
    config = yaml.load(fs.readFileSync(configPath, "utf-8"));
    return config === null ? null : merge({}, getDefaultConfig(), config);
  } catch (error) {
    return null;
  }
}

export const config = loadConfigFile() || getDefaultConfig();
