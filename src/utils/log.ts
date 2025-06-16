import log4js, { Logger } from "log4js";
import { config } from "../models/config.js";
import path from "path";
import os from "os";

const { transport } = config.server;

export function initLogger() {
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
        default: { appenders: ["file"], level: "warn" },
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
          level: "warn",
        },
        console: { type: "console" },
      },
      categories: {
        default: { appenders: ["file", "console"], level: "info" },
      },
    });
  }
}

export const log: Logger = log4js.getLogger();
