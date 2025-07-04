import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "MCP-ECharts 文档",
      description: "MCP-ECharts 的使用和开发文档",
    },
    "/en/": {
      lang: "en-US",
      title: "MCP-ECharts Docs",
      description: "Documentation for using and developing MCP-ECharts",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
