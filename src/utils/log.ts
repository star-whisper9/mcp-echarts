import log4js, { Logger } from "log4js";
import { config } from "../models/config.js";
import path from "path";
import os from "os";

const { transport } = config.server;
const { logging } = config;

export function initLogger() {
  // 日志目录文件建立
  let logDir: string;
  if (process.platform === "win32") {
    logDir = path.join(
      process.env.LOCALAPPDATA || os.homedir(),
      "mcp-echarts",
      "logs"
    );
  } else if (process.platform === "darwin") {
    logDir = path.join(os.homedir(), "Library", "Logs", "mcp-echarts");
  } else {
    logDir = path.join(os.homedir(), ".mcp-echarts", "logs");
  }
  const logFile = path.join(logDir, "mcp.log");

  // 实际日志器配置
  if (transport === "stdio") {
    // Stdio 模式避免使用 console 输出
    log4js.configure({
      appenders: {
        file: {
          type: "dateFile",
          filename: logFile,
          pattern: ".yyyy-MM-dd",
          compress: true,
          numBackups: 30,
          keepFileExt: true,
        },
      },
      categories: {
        default: { appenders: ["file"], level: logging.fileLevel },
      },
    });
  } else {
    log4js.configure({
      appenders: {
        file: {
          type: "dateFile",
          filename: logFile,
          pattern: ".yyyy-MM-dd",
          compress: true,
          numBackups: 30,
          keepFileExt: true,
        },
        fileFilter: {
          type: "logLevelFilter",
          appender: "file",
          level: logging.fileLevel,
        },
        console: { type: "console" },
        consoleFilter: {
          type: "logLevelFilter",
          appender: "console",
          level: logging.consoleLevel,
        },
      },
      categories: {
        default: {
          appenders: ["fileFilter", "consoleFilter"],
          level: "trace",
        },
      },
    });
  }
}

export const log: Logger = log4js.getLogger();
