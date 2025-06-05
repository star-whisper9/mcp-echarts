# MCP-ECharts

MCP-ECharts 是一个基于 [ECharts](https://echarts.apache.org/) 的图表生成服务，支持通过 [Model Context Protocol (MCP)](https://github.com/modelcontext/modelcontext-protocol) 协议远程调用生成各类图表，并以图片形式输出(Server-Side Rendering)。

## 功能特性

- 支持柱状图、折线图、饼图等多种常用图表类型
- 图表参数基于 [zod](https://zod.dev/) 校验，自动生成 JSON Schema
- 支持暗色/亮色主题切换
- 生成的图片自动保存并返回可访问的 URL，URL 由自身一体的静态资源服务器托管
- 可通过 MCP 协议进行远程调用，适用于 AI Agent

## 目录结构

```
├── src/                # TypeScript 源码
│   ├── echarts/        # 各类图表实现
│   ├── servers/        # 服务器实现
│   ├── config.ts       # 配置文件
│   ├── schema.ts       # 共用 schema 定义
│   └── util.ts         # 工具函数
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

## 启动服务（构建测试）

```bash
npm start
```

默认以 stdio 方式启动 MCP 服务器。你也可以通过环境变量配置端口、资源路径等：

- `MCP_TRANSPORT`：通信方式（stdio/sse/http），默认 stdio
- `MCP_PORT`：服务端口，默认 1122
- `MCP_HOST`：服务主机，默认 127.0.0.1
- `RES_PATH`：静态资源目录，默认 ./static
- `RES_BASE_URL`：图片访问基础 URL，默认 http://127.0.0.1:1123

## 依赖

- [ECharts](https://echarts.apache.org/)
- [canvas](https://github.com/Automattic/node-canvas)
- [zod](https://zod.dev/)
- [lodash](https://lodash.com/)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

## 许可证

[Apache-2.0](./LICENSE)
