---
title: Module Overview
icon: codicon:file-submodule
order: 2
footer: Translated by GPT-4.1
---

# Module Overview

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

- `echarts/`: Chart implementations
- `index.ts`: Module entry point
- `models/`
  - `config.ts`: Configuration module
  - `schema.ts`: General schema
- `servers/`: All server implementations
  - `http.ts`: Streamable HTTP implementation
  - `resourceServer.ts`: Built-in resource server implementation
  - `server.ts`: Basic server entry point
  - `sse.ts`: Server-Sent Events implementation (deprecated)
  - `stdio.ts`: stdio implementation
- `utils/`:
  - `callbackUtil.ts`: Callback handling utilities (mainly sandbox invocation entry)
  - `fileOutput.ts`: File output utilities
  - `httpUtil.ts`: HTTP utilities
  - `log.ts`: Logging utilities (**You should use this module for [logging](./logging#logging-module)**)
  - `map.ts`: ECharts map utilities
  - `vmUtil.ts`: Sandbox utilities
