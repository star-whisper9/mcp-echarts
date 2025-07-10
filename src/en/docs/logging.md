---
title: Logging Output
icon: ix:log
order: 3
footer: Translated by GPT-4.1
---

# Logging Output

## Logging Module

In version `1.2.0`, we refactored the project's logging module and chose `log4js` as the project's logging module, implementing a simple wrapper at `utils/log.ts`.

This wrapper exports an `initLogger()` method, which is called in the main module to initialize the logging system. It then exports a singleton `log` object, which you should use for logging output.

Example code:

```typescript
import { log } from "@/utils/log.js";
// 随后直接像你自己使用 log4js 一样使用 log 对象即可
// Then you can use the log object just like you would use log4js
log.debug("这是一个调试日志"); // This is a debug log
log.info("这是一个信息日志"); // This is an info log
log.warn("这是一个警告日志"); // This is a warning log
log.error("这是一个错误日志"); // This is an error log
```

### Logs in STDIO

Due to the nature of STDIO transport, developers should not output any STDOUT logs in an MCP service that transports via STDIO (STDOUT is used for transport messages). **We follow this convention, and you should also adhere to it during development.**

In short: **Do not output any information to STDOUT in code running in STDIO mode. If necessary, use STDERR.**

### Default Behavior

In our logging wrapper, the service mode is detected and **STDIO and file appenders** are configured. By default, logs follow these output rules:

- File log level: `WARN`
- STDIO log level: `INFO`

| Transport Mode | Enabled Appenders |
| -------------- | ----------------- |
| STDIO          | File only         |
| Other Modes    | File and STDIO    |

You can override the log levels in the application configuration, but **you cannot enable the STDIO appender in STDIO mode**. (If you must do so, you need to modify the code in `utils/log.ts`.)

### Log File Location

Log files are stored in different locations depending on the operating system. We do not provide a configuration option for this; you need to modify the TypeScript source code.

- Windows: `%LOCALAPPDATA%/mcp-echarts/logs` or `os.homedir()/mcp-echarts/logs`
- macOS: `os.homedir()/Library/Logs/mcp-echarts`
- Linux: `os.homedir()/.mcp-echarts/logs`
