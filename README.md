# MCP-ECharts

MCP-ECharts 是一个基于 [ECharts](https://echarts.apache.org/) 的图表生成服务，支持通过 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 协议远程调用生成各类图表，并以图片形式输出（Server-Side Rendering）。

## 功能特性

- 支持柱状图、折线图、饼图、散点图（直角坐标系/地理坐标系）等多种常用图表类型
- 图表参数基于 [zod](https://zod.dev/) 校验，自动生成 JSON Schema
- 支持暗色/亮色主题切换
- 生成的图片自动保存并返回可访问的 URL，由内置静态资源服务器托管
- 支持 MCP 协议（stdio、SSE，预留 HTTP），适用于 AI Agent
- 支持自定义地图 GeoJSON 动态注册

## 目录结构

```
├── src/                # TypeScript 源码
│   ├── echarts/        # 各类图表实现
│   ├── servers/        # 服务器实现（stdio、sse、resourceServer等）
│   ├── models/         # 配置与 schema 定义
│   └── utils/          # 工具函数
├── build/              # 编译后的 JS 文件
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## 安装依赖

```bash
npm install
```

## 构建项目

```bash
npm run build
```

## 启动服务

```bash
npm start
```

默认以 stdio 方式启动 MCP 服务器。你可以通过环境变量配置通信方式、端口、资源路径等：

- `MCP_TRANSPORT`：通信方式（stdio/sse/http），默认 stdio
- `MCP_PORT`：服务端口，默认 1122
- `MCP_HOST`：服务主机，默认 127.0.0.1
- `MCP_CORS`：CORS 策略，支持 JSON 数组或文件路径，默认 []
- `RES_PATH`：静态资源目录，默认 ./static
- `RES_ENABLED`：是否启用静态资源服务器，默认 false
- `RES_PORT`：静态资源服务器端口，默认 1123
- `RES_HOST`：静态资源服务器主机，默认 127.0.0.1
- `RES_BASE_URL`：图片访问基础 URL，默认 http://127.0.0.1:1123
- `GEOJSON_PATH`：GeoJSON 地图目录，默认 ./static/geojson/

## 安全建议

- 强烈建议生产环境下配置合理的 `MCP_CORS`，避免使用 `"*"`，防止 DNS rebinding 攻击
- 建议仅绑定到 `127.0.0.1`
- 推荐为所有连接实现身份认证

## 依赖

- [ECharts](https://echarts.apache.org/)
- [canvas](https://github.com/Automattic/node-canvas)
- [zod](https://zod.dev/)
- [lodash](https://lodash.com/)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

## 许可证

[Apache-2.0](./LICENSE)
