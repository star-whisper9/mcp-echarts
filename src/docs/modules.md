---
title: 模块结构
icon: codicon:file-submodule
order: 2
---

# 模块结构

```bash
.
├── echarts
│   ├── area.ts
│   ├── barOnGrid.ts
│   ├── index.ts
│   ├── lineOnGrid.ts
│   ├── pie.ts
│   ├── scatterOnCalendar.ts
│   ├── scatterOnGeo.ts
│   ├── scatterOnGrid.ts
│   └── scatterOnSingleAxis.ts
├── index.ts
├── models
│   ├── config.ts
│   └── schema.ts
├── servers
│   ├── http.ts
│   ├── resourceServer.ts
│   ├── server.ts
│   ├── sse.ts
│   └── stdio.ts
└── utils
    ├── callbackUtil.ts
    ├── fileOutput.ts
    ├── httpUtil.ts
    ├── log.ts
    ├── map.ts
    └── vmUtil.ts
```

- `echarts/`: 图表实现
- `index.ts`: 模块入口
- `models/`
  - `config.ts`: 配置模块
  - `schema.ts`: 通用 Schema
- `servers/`: 所有服务器实现
  - `http.ts`: Streamable HTTP 实现
  - `resourceServer.ts`: 内置资源服务器实现
  - `server.ts`: 基础服务器入口
  - `sse.ts`: Server-Sent Events 实现(已弃用)
  - `stdio.ts`: stdio 实现
- `utils/`:
  - `callbackUtil.ts`: 回调函数处理工具（主要是沙盒调用入口）
  - `fileOutput.ts`: 文件输出工具
  - `httpUtil.ts`: HTTP 工具
  - `log.ts`: 日志工具（日志的封装，**你应使用这个模块[输出日志](./logging#日志模块)**）
  - `map.ts`: ECharts 地图工具
  - `vmUtil.ts`: 沙盒工具
