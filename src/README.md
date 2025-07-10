---
home: true
icon: chart-simple
title: 主页
heroImage: https://echarts.apache.org/zh/images/favicon.png
bgImage: https://theme-hope-assets.vuejs.press/bg/6-light.svg
bgImageDark: https://theme-hope-assets.vuejs.press/bg/6-dark.svg
bgImageStyle:
  background-attachment: fixed
heroText: MCP-ECharts
tagline: 文档更新于 v1.5.0
actions:
  - text: 快速开始
    icon: solar:play-bold-duotone
    link: ./guide/
    type: primary

  - text: 文档
    icon: material-symbols:book-rounded
    link: ./docs/

highlights:
  - header: 简单易用
    image: /assets/image/box.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/3-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/3-dark.svg
    highlights:
      - title: 支持 <code>npx</code> 一键本地使用
      - title: 支持服务端快速部署 HTTP 版，满足多用户需求

  - header: 丰富的图表类型
    description: 支持多种常用图表类型，满足各种数据可视化需求
    image: /assets/image/features.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/2-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: 柱状图
        icon: ant-design:bar-chart-outlined
        details: 支持基础柱状图、堆叠柱状图等多种样式

      - title: 折线图
        icon: ant-design:line-chart-outlined
        details: 支持平滑折线图、面积图等多种配置

      - title: 饼图
        icon: ant-design:pie-chart-outlined
        details: 支持环形图、玫瑰图等多种饼图样式

      - title: 散点图
        icon: ant-design:dot-chart-outlined
        details: 支持单轴、直角、地理等多种坐标系的散点图

      - title: 日历图
        icon: ant-design:calendar-outlined
        details: 支持日历散点图，展示时间序列数据

      - title: 自定义地图
        icon: material-symbols:map-outline
        details: 支持自定义地图 GeoJSON 动态注册

      - title: 主题切换
        icon: material-symbols:palette-outline
        details: 支持暗色/亮色主题切换

  - header: 重要特性
    description: 参数校验、图片托管、服务端渲染
    image: /assets/image/highlight.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/4-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/4-dark.svg
    highlights:
      - title: 参数校验
        icon: iconamoon:shield-yes-duotone
        details: 基于 zod 校验，自动生成 JSON Schema

      - title: 图片托管
        icon: line-md:image-twotone
        details: 内置基础静态托管服务，开箱即用

      - title: 服务端渲染
        icon: mdi:server-outline
        details: 使用服务端渲染，客户端无需额外配置

copyright: false
footer: 基于 <a href="https://theme-hope.vuejs.press/" target="_blank">Vuepress Theme Hope</a> | Apache-2.0 Licensed
---
