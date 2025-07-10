---
title: 输出日志
icon: ix:log
order: 3
---

# 输出日志

## 日志模块

在 `1.2.0` 版本，我们重构了项目的日志模块，选用了 `log4js` 作为项目的日志模块，实现了一个简单的封装 `utils/log.ts`。

此封装导出了一个 `initLogger()` 方法，被在主模块中调用，初始化日志系统。随后导出了一个单例的 `log` 对象，你应使用这个导出进行日志输出。

示例代码：

```typescript
import { log } from "@/utils/log.js";
// 随后直接像你自己使用 log4js 一样使用 log 对象即可
log.debug("这是一个调试日志");
log.info("这是一个信息日志");
log.warn("这是一个警告日志");
log.error("这是一个错误日志");
```

### STDIO 中的日志

由于 STDIO 通信的特性，开发者不应该在一个 STDIO 通信的 MCP 服务中输出任何 STDOUT 日志（STDOUT 被用作通信消息）。**我们遵循这个规范，你进行开发时也应该遵循这个规范。**

简单来说：**不要在 STDIO 模式的代码中使用任何 STDOUT 输出信息，若有必要，使用 STDERR。**

### 默认情况

在我们的日志封装中，对服务模式进行了判断，并配置了 **STDIO 和文件记录器**。默认情况下，日志将会遵循这样的输出规则：

- 文件记录等级：`WARN`
- STDIO 记录等级：`INFO`

| 传输模式 | 启用的记录器 |
| -------- | ------------ |
| STDIO    | 仅文件       |
| 其他模式 | 文件和 STDIO |

你可以在应用配置中覆写记录等级，但**不能为 STDIO 模式启用 STDIO 记录器**。（如果你必须要这么做，你需要修改 `utils/log.ts` 中的代码。）

### 日志文件位置

日志文件将会根据操作系统的不同，存储在不同的位置。我们没有在配置中提供修改功能，你需要修改 TypeScript 源码。

- Windows: `%LOCALAPPDATA%/mcp-echarts/logs` 或 `os.homedir()/mcp-echarts/logs`
- macOS: `os.homedir()/Library/Logs/mcp-echarts`
- Linux: `os.homedir()/.mcp-echarts/logs`
