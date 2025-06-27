# MCP-ECharts

<a href="https://www.npmjs.com/package/@starwhisper9/mcp-echarts" target="_blank"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40starwhisper9%2Fmcp-echarts"><img alt="NPM Last Update" src="https://img.shields.io/npm/last-update/%40starwhisper9%2Fmcp-echarts"></a>

MCP-ECharts 是一个基于 [ECharts](https://echarts.apache.org/) 的图表生成服务，支持通过 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 协议远程调用生成各类图表，并以图片形式输出（Server-Side Rendering）。

## 功能特性

- 支持柱状图、折线图、饼图、散点图（直角坐标系/地理坐标系）等多种常用图表类型
- 图表参数基于 [zod](https://zod.dev/) 校验，自动生成 JSON Schema
- 支持暗色/亮色主题切换
- 生成的图片自动保存并返回可访问的 URL，由内置静态资源服务器托管
- 支持 MCP 协议（stdio、SSE(弃用)、Streamable HTTP），适用于 AI Agent
- 支持自定义地图 GeoJSON 动态注册

## 本地使用

1. 按照 Stdio MCP 服务在你使用的客户端中进行配置，你需要关注以下配置：
   - 启动指令：`npx -y @starwhisper9/mcp-echarts`
   - 通过命令行参数传入应用配置，下表为推荐修改的配置，你也可以前往 [应用配置](#应用配置) 查看所有可用配置。
   - _由于 MacOS 低端口号限制，在 MacOS 上使用时，你将有可能无法访问默认的 1123 资源端口，建议修改为高端口号。_

| 需要修改 | 命令行参数       | 描述                              | 默认值                  |
| -------- | ---------------- | --------------------------------- | ----------------------- |
| ✅       | `--res-path`     | 生成的图片的本地存储位置          | `./static`              |
| ✅       | `--geojson-path` | 地图坐标系使用的 GeoJSON 文件路径 | `./geojson`             |
| ❓       | `--res-port`     | 内置 HTTP 图像服务端口            | `1123`                  |
| ❓       | `--res-base-url` | 内置 HTTP 图像服务的基础 URL      | `http://127.0.0.1:1123` |

**若修改了 `res-port`，请确保 `res-base-url` 的端口号与之匹配。否则返回的图像链接将无法打开。**

2. (可选) 由于版权问题，发布版本身将不带有任何 GeoJSON，若需要使用地图图表，请自行下载需要的 GeoJSON 并放置在 `geojson-path` 指定的目录下。JSON 文件的文件名将被注册为地图名称，_建议使用可读名称（例如中国地图可以使用 `china.json`，美国地图可以使用 `usa.json` 等）_。

作为 HTTP 服务部署请参考 [应用配置](#应用配置)。

## 常见问题

1. 服务启动失败

   - 优先尝试使用 `npm i -g canvas` 安装 canvas。如果安装失败，请搜索你所使用的系统如何安装 `node-canvas`。**不要发送安装 canvas 问题的 Issue**。
   - 其余问题请发送 Issue 或自行搜索 npx 日志中的错误。

2. 启动后地图系图表无地图

   - 由于版权问题，**发布包不带有任何 GeoJSON，你需要自行准备合法的 GeoJSON**。
   - 确保你的 `geojson-path` 指定的目录下有合法的 GeoJSON 文件。
   - 确保你的配置路径正确（_检查路径转义，路径是否正确_）。

3. 在部分客户端（**尤其是 VSCode**）中提示有非法工具（Schema 不合法）

   - 这是由于地图系图表的地图注册是动态的，当地图全部注册失败（例如没有合法的 GeoJSON 文件，或地图参数配置错误）时，服务器将会返回一个空的枚举参数。
   - 如果你不使用地图系图表，可以忽略这个错误；否则请确保你的 `geojson-path` 指定的目录下有合法的 GeoJSON 文件。

## 应用配置

应用配置具有以下传入方式：

- 命令行参数，参见下表
- YAML 配置文件，通过 `--config-path` 参数传入配置路径。示例参见 [config.yaml.example](./config.yaml.example)
- **(已弃用)** 环境变量

在当前版本(1.2.0)，出于兼容性考虑仍保留了环境变量参数，不建议继续使用，未来版本可能会移除环境变量配置。

配置的优先级为：**YAML > 命令行参数 > 环境变量 > 默认**。

| 命令行           | 描述                                                          | 默认值                  | 必需 | 可选值                                                                                                                     |
| ---------------- | ------------------------------------------------------------- | ----------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `--transport`    | 传输方式                                                      | `stdio`                 | 否   | `stdio`, `sse`, `http`                                                                                                     |
| `--mcp-port`     | MCP 服务端口                                                  | `1122`                  | 否   | 1-65535                                                                                                                    |
| `--mcp-host`     | MCP 服务监听主机                                              | `127.0.0.1`             | 否   | IPv4 地址或域名                                                                                                            |
| `--cors`         | CORS 策略，当传入策略包含 "\*" 时将无视其余规则，允许全部跨域 | `[]`                    | 否   | 包含允许的地址的 JSON 数组字符串 / 每行一个允许地址的 CORS 文本文件路径                                                    |
| `--res-path`     | 生成的图片存储路径，建议使用绝对路径                          | `./static`              | 否   | 有写权限的合法的文件系统路径                                                                                               |
| `--res-enabled`  | 是否启用内置 HTTP 静态资源服务                                | `true`                  | 否   | `true`, `false`                                                                                                            |
| `--res-port`     | 内置 HTTP 静态资源服务端口                                    | `1123`                  | 否   | 1-65535                                                                                                                    |
| `--res-host`     | 内置 HTTP 静态资源服务监听主机                                | `127.0.0.1`             | 否   | IPv4 地址或域名                                                                                                            |
| `--res-base-url` | 内置 HTTP 静态资源服务的基础 URL                              | `http://127.0.0.1:1123` | 否   | 有效的 URL，指向部署的静态服务的地址（MCP 生成内容将返回此地址）                                                           |
| `--geojson-path` | 地图坐标系使用的 GeoJSON 文件路径                             | `./geojson`             | 否   | 有读权限的合法的文件系统路径，内含有效的 GeoJSON 文件。**文件推荐命名为可读的地区名称** ，模型将会获得文件名作为可选地图。 |

---

# 开发

## Todo（优先级排序）

- [x] npm 包发布
- [ ] 文档
- [ ] 更多图表类型支持
- [ ] 更多输出格式支持（优先 SVG 和 HTML）
- [ ] 图表结构优化和默认外观样式优化
- [ ] 可选身份验证
- [ ] _SVG 地图支持_

欢迎提交 PR 或 Issue！

## 开始开发

- 安装依赖

```bash
npm install
```

- 构建项目

```bash
npm run build
```

- 运行服务

```bash
npm run start
```

### 杂项

#### 日志

日志从 `1.2.0` 开始不再使用基础的 `console`，而是选用了 `log4js`。默认情况下，日志将进行以下输出：

- STDIO 模式：仅输出到文件。
- 其他模式：同时输出到 STDOUT 和文件。

- 文件记录等级：WARN
- 控制台记录等级：INFO

- 文件默认存储到：
  - Windows: `%LOCALAPPDATA%/mcp-echarts/logs` / `os.homedir()/mcp-echarts/logs`
  - macOS: `os.homedir()/Library/Logs/mcp-echarts`
  - Linux: `os.homedir()/.mcp-echarts/logs`

目前没有提供配置入口，需要修改 [log.ts](./src/utils/log.ts) 的硬编码代码。

**你应避免在 STDIO 传输时输出任何 STDOUT 日志。如有必要在控制台输出日志请输出 STDERR。**

## 安全建议

- 合理配置 CORS 策略，防止 DNS rebinding 攻击
- HTTP 服务建议仅绑定到本机，使用反向代理
- _推荐为所有连接自行实现身份认证_
- 在客户端支持的情况下，避免使用已经弃用的 SSE 连接，而是使用 Streamable HTTP。

---

# 许可证

[Apache-2.0](./LICENSE)
