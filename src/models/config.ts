/**
 * 配置管理
 *
 * 优先级：yaml 文件 (--config-path传入) > 命令行参数 > 环境变量
 *
 * IMPORTANT: 我们在配置模块中使用了 console 输出日志，这在理论上是没
 * 有违反 MCP 设计规范的，这个模块的初始化是在 MCP 服务器初始化前的。但
 * 仍然选用了 error 输出，而不是 STDOUT。
 */
import fs from "fs";
import minimist from "minimist";
import yaml from "js-yaml";
import merge from "lodash/merge.js";

// 命令行参数解析
const argv = minimist(process.argv.slice(2), {
  alias: {
    // 应用配置项
    // "transport": "transport",
    "mcp-port": "mcpPort",
    "mcp-host": "mcpHost",
    // "cors": "cors",
    "res-path": "resourcePath",
    "res-enabled": "resourceEnabled",
    "res-port": "resourcePort",
    "res-host": "resourceHost",
    "res-base-url": "resourceBaseUrl",
    "geojson-path": "geoJsonPath",
    "log-console": "consoleLevel",
    "log-file": "fileLevel",
    // 配置文件项
    "config-path": "configPath",
  },
});

//#region 类型定义

const ALLOWED_TRANSPORTS = ["stdio", "sse", "http"] as const;
type TransportType = (typeof ALLOWED_TRANSPORTS)[number];

const ALLOWED_LOG_LEVELS = ["trace", "debug", "info", "warn", "error"] as const;
type LogLevelType = (typeof ALLOWED_LOG_LEVELS)[number];

interface ConfigInterface {
  server: {
    transport: TransportType;
    port: number;
    host: string;
    cors: string[];
  };
  resource: {
    resourcePath: string;
    enabled: boolean;
    port: number;
    host: string;
    baseUrl: string;
    geoJsonPath: string;
  };
  logging: {
    consoleLevel: LogLevelType;
    fileLevel: LogLevelType;
  };
}

//#endregion

class ConfigValidator {
  /**
   * 校验传输方式
   * @param value - 待校验的传输方式
   * @returns 有效的传输方式 | undefined
   */
  static validateTransport(value?: string): TransportType | undefined {
    const validTransport = value;
    if (validTransport === undefined) {
      console.error(`[config] Transport is not set`);
      return undefined;
    }

    if (ALLOWED_TRANSPORTS.includes(validTransport as TransportType)) {
      return validTransport as TransportType;
    }

    console.error(
      `[config] Transport "${value}" is invalid. Allowed values: ${ALLOWED_TRANSPORTS.join(
        ", "
      )}`
    );
    return undefined;
  }

  /**
   * 校验端口号
   * @param value - 待校验的端口号
   * @param defaultPort - 默认端口号
   * @returns 有效的端口号 | undefined
   */
  static validatePort(value?: string | number): number | undefined {
    const port =
      typeof value === "string" ? parseInt(value, 10) : value || undefined;
    if (port === undefined || Number.isNaN(port) || port < 1 || port > 65535) {
      console.error(`[config] Port "${port}" is invalid.`);
      return undefined;
    }
    return port;
  }

  /**
   * 校验 CORS 配置。
   *
   * 此方法并不进行"*"跨域的预处理，仅返回原始策略数组。
   * 即使有多个项但包含了"*"也交由 corsCheck() 处理。
   *
   * @param value - CORS 配置，可以是字符串、字符串数组或文件路径
   * @returns 有效的 CORS 配置数组 | undefined
   */
  static validateCors(value?: string | string[]): string[] | undefined {
    if (!value) {
      console.error(`[config] CORS is not set`);
      return undefined;
    }

    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    ) {
      if (value.includes("*")) {
        console.error(
          `[config] CORS policy allows all origins, this may not be secure in production!`
        );
      }
      return value;
    }

    try {
      const parsed = JSON.parse(value as string);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        if (parsed.includes("*")) {
          console.error(
            `[config] CORS policy allows all origins, this may not be secure in production!`
          );
        }
        return parsed;
      }
    } catch (e) {
      try {
        const content = fs.readFileSync(value as string, "utf-8").trim();
        const lines = content
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
        if (lines.includes("*")) {
          console.error(
            `[config] CORS policy allows all origins, this may not be secure in production!`
          );
        }
        return lines;
      } catch (fileError) {
        console.error(`[config] Failed to read CORS file:`, fileError);
      }
    }

    console.error(`[config] CORS value is malformed`);
    return undefined;
  }

  /**
   * 校验布尔值
   * @param value - 待校验的布尔值或字符串
   * @param defaultValue - 默认值
   * @returns 有效的布尔值 | undefined
   */
  static validateBoolean(value?: string | boolean): boolean | undefined {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return undefined;
  }

  /**
   * 校验日志等级
   * @param value 日志等级设置
   * @param defaultLevel 默认日志等级
   * @param fieldName 字段名(用于日志输出)
   * @returns 有效的日志等级 | undefined
   */
  static validateLogLevel(
    value?: string,
    fieldName: string = "log level"
  ): LogLevelType | undefined {
    if (
      value &&
      ALLOWED_LOG_LEVELS.includes(value.toLowerCase() as LogLevelType)
    ) {
      return value.toLowerCase() as LogLevelType;
    }
    if (value) {
      console.error(
        `[config] ${fieldName} "${value}" is invalid. Allowed values: ${ALLOWED_LOG_LEVELS.join(
          ", "
        )}`
      );
    }
    return undefined;
  }

  static validateString(value?: string): string | undefined {
    return value || undefined;
  }
}

class ConfigLoader {
  private static loadDefaultConfig(): ConfigInterface {
    return {
      server: {
        transport: "stdio",
        port: 11222,
        host: "127.0.0.1",
        cors: [],
      },
      resource: {
        resourcePath: "./static/output",
        enabled: true,
        port: 11223,
        host: "127.0.0.1",
        baseUrl: "http://localhost:11223",
        geoJsonPath: "./static/geo",
      },
      logging: {
        consoleLevel: "info",
        fileLevel: "warn",
      },
    };
  }

  /**
   * 校验 YAML 内容
   *
   * 使用 any 类型返回，后续由 merge 处理非法项
   *
   * @param yamlContent - 解析后的 YAML 内容
   * @returns 校验后的配置对象
   */
  private static validateYaml(yamlContent: any): any {
    const validated: any = {};

    if (yamlContent.server) {
      validated.server = {
        transport: ConfigValidator.validateTransport(
          yamlContent.server.transport
        ),
        port: ConfigValidator.validatePort(yamlContent.server.port),
        host: ConfigValidator.validateString(yamlContent.server.host),
        cors: ConfigValidator.validateCors(yamlContent.server.cors),
      };
    }

    if (yamlContent.resource) {
      validated.resource = {
        resourcePath: ConfigValidator.validateString(
          yamlContent.resource.resourcePath
        ),
        enabled: ConfigValidator.validateBoolean(yamlContent.resource.enabled),
        port: ConfigValidator.validatePort(yamlContent.resource.port),
        host: ConfigValidator.validateString(yamlContent.resource.host),
        baseUrl: ConfigValidator.validateString(yamlContent.resource.baseUrl),
        geoJsonPath: ConfigValidator.validateString(
          yamlContent.resource.geoJsonPath
        ),
      };
    }

    if (yamlContent.logging) {
      validated.logging = {
        consoleLevel: ConfigValidator.validateLogLevel(
          yamlContent.logging.consoleLevel,
          "console log level"
        ),
        fileLevel: ConfigValidator.validateLogLevel(
          yamlContent.logging.fileLevel,
          "file log level"
        ),
      };
    }

    return validated;
  }

  private static isConfigHasValidValue(config: any): boolean {
    let isValid = false;
    for (const key in config) {
      if (Object.values(config[key]).some((v) => v !== undefined)) {
        isValid = true;
        break;
      }
    }
    return isValid;
  }

  /**
   * 加载 yaml 配置文件
   *
   * @returns 配置对象或 null
   */
  private static loadConfigFile(): ConfigInterface | null {
    const configPath = argv.configPath;
    if (!configPath) {
      return null;
    }

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      const yamlContent = yaml.load(content);

      if (!yamlContent) {
        return null;
      }

      const validatedConfig = this.validateYaml(yamlContent as any);
      const isValid = this.isConfigHasValidValue(validatedConfig);

      return isValid
        ? merge({}, this.loadDefaultConfig(), validatedConfig)
        : null;
    } catch (error) {
      console.error(`[config] Failed to load config file:`, error);
      return null;
    }
  }

  private static loadCommandLineConfig(): ConfigInterface | null {
    const config: any = {
      server: {
        transport: ConfigValidator.validateTransport(argv.transport),
        port: ConfigValidator.validatePort(argv.mcpPort),
        host: ConfigValidator.validateString(argv.mcpHost),
        cors: ConfigValidator.validateCors(argv.cors),
      },
      resource: {
        resourcePath: ConfigValidator.validateString(argv.resourcePath),
        enabled: ConfigValidator.validateBoolean(argv.resourceEnabled),
        port: ConfigValidator.validatePort(argv.resourcePort),
        host: ConfigValidator.validateString(argv.resourceHost),
        baseUrl: ConfigValidator.validateString(argv.resourceBaseUrl),
        geoJsonPath: ConfigValidator.validateString(argv.geoJsonPath),
      },
      logging: {
        consoleLevel: ConfigValidator.validateLogLevel(
          argv.consoleLevel,
          "console log level"
        ),
        fileLevel: ConfigValidator.validateLogLevel(
          argv.fileLevel,
          "file log level"
        ),
      },
    };

    const isValid = this.isConfigHasValidValue(config);

    return isValid ? merge({}, this.loadDefaultConfig(), config) : null;
  }

  private static loadEnvConfig(): ConfigInterface {
    const config: any = {
      server: {
        transport: ConfigValidator.validateTransport(process.env.MCP_TRANSPORT),
        port: ConfigValidator.validatePort(process.env.MCP_PORT),
        host: ConfigValidator.validateString(process.env.MCP_HOST),
        cors: ConfigValidator.validateCors(process.env.MCP_CORS),
      },
      resource: {
        resourcePath: ConfigValidator.validateString(process.env.RES_PATH),
        enabled: ConfigValidator.validateBoolean(process.env.RES_ENABLED),
        port: ConfigValidator.validatePort(process.env.RES_PORT),
        host: ConfigValidator.validateString(process.env.RES_HOST),
        baseUrl: ConfigValidator.validateString(process.env.RES_BASE_URL),
        geoJsonPath: ConfigValidator.validateString(process.env.GEOJSON_PATH),
      },
    };

    return merge({}, this.loadDefaultConfig(), config);
  }

  static loadConfig(): ConfigInterface {
    return (
      this.loadConfigFile() ||
      this.loadCommandLineConfig() ||
      this.loadEnvConfig()
    );
  }
}

export const config: ConfigInterface = ConfigLoader.loadConfig();
console.error(`[config] Loaded configuration:`, config);
