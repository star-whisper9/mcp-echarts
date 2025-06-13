# MCP-ECharts

MCP-ECharts 是一个基于 [ECharts](https://echarts.apache.org/) 的图表生成服务，支持通过 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 协议远程调用生成各类图表，并以图片形式输出（Server-Side Rendering）。

## 功能特性

- 支持柱状图、折线图、饼图、散点图（直角坐标系/地理坐标系）等多种常用图表类型
- 图表参数基于 [zod](https://zod.dev/) 校验，自动生成 JSON Schema
- 支持暗色/亮色主题切换
- 生成的图片自动保存并返回可访问的 URL，由内置静态资源服务器托管
- 支持 MCP 协议（stdio、SSE，预留 HTTP），适用于 AI Agent
- 支持自定义地图 GeoJSON 动态注册

## 使用

由于 canvas 依赖于平台，在发布 npm 包前仅支持自编译使用。

1. 在本地安装并编译
2. 按照 Stdio MCP 服务在你使用的客户端中进行配置，你需要关注以下配置：
   - 启动指令：`node path/to/build/index.js`
   - 环境变量配置：查阅下表

| 建议修改 | 环境变量     | 描述                              | 默认值                  |
| -------- | ------------ | --------------------------------- | ----------------------- |
| ✅       | RES_PATH     | 生成的图片的本地存储位置          | `./static`              |
| ❓       | RES_PORT     | 内置 HTTP 图像服务端口            | `1123`                  |
| ❓       | RES_BASE_URL | 内置 HTTP 图像服务的基础 URL      | `http://127.0.0.1:1123` |
| ✅       | GEOJSON_PATH | 地图坐标系使用的 GeoJSON 文件路径 | `./geojson`             |

**若修改了 RES_PORT，请确保 RES_BASE_URL 的端口号与之匹配。否则返回的图像链接将无法打开。**

3. (可选) 由于版权问题，发布版本身将不带有任何 GeoJSON，若需要使用地图图表，请自行下载需要的 GeoJSON 并放置在 `GEOJSON_PATH` 指定的目录下。JSON 文件的文件名将被注册为地图名称，_建议使用可读名称（例如中国地图可以使用 `china.json`，美国地图可以使用 `usa.json` 等）_。

作为 HTTP 服务部署请查阅开发相关。

---

# 开发

## Todo

- [ ] npm 包发布
- [ ] 更多图表类型支持
- [ ] 身份验证
- [ ] 图表结构优化和默认外观样式优化
- [ ] _SVG 地图支持_

欢迎提交 PR 或 Issue！

## 目录结构

```
├── src/                # TypeScript 源码
│   ├── echarts/        # 各类图表实现
│   ├── servers/        # 服务器实现
│   ├── models/         # 模型
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

_项目使用到了 node-canvas 作为服务端渲染库，这个库是平台相关的。_

## 构建项目

```bash
npm run build
```

## 所有配置

参与 [.env.example](./.env.example) 文件的注释。

## 安全建议

- 合理配置 CORS 策略，防止 DNS rebinding 攻击
- HTTP 服务建议仅绑定到本机，使用反向代理
- _推荐为所有连接自行实现身份认证_
- 在客户端支持的情况下，避免使用已经弃用的 SSE 连接，而是使用 Streamable HTTP。

---

# 许可证

[Apache-2.0](./LICENSE)
