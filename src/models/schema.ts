import { z } from "zod";
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Mcp Tool Input 类型封装
 */
export type ToolInput = z.infer<typeof ToolSchema.shape.inputSchema>;

/**
 * 图表对照
 */
export const ChartTypes = {
  barOnGrid: "barOnGrid",
  lineOnGrid: "lineOnGrid",
  pie: "pie",
  scatterOnGrid: "scatterOnGrid",
  scatterOnGeo: "scatterOnGeo",
  area: "area",
} as const;

/**
 * 全局图表默认选项，用于和具体坐标系图混合
 */
export const DefaultChartOptions = {
  title: {
    left: "center",
    top: "top",
  },
  legend: {
    icon: "roundRect",
    top: "bottom",
  },
};

/**
 * 直角坐标系默认选项
 */
export const DefaultGridOptions = {
  ...DefaultChartOptions,
  grid: {
    show: true,
  },
  xAxis: {
    axisLine: {
      show: true,
    },
  },
  yAxis: {
    axisLine: {
      show: true,
    },
  },
};

/**
 * 极坐标系默认选项
 */
export const DefaultPolarOptions = {
  ...DefaultChartOptions,
  radiusAxis: {
    axisLine: {
      show: true,
    },
  },
  angleAxis: {
    axisLine: {
      show: true,
    },
  },
};

/**
 * 雷达图默认选项
 */
export const DefaultRadarOptions = {
  ...DefaultChartOptions,
  radar: {
    axisLine: {
      show: true,
    },
  },
};

/**
 * 地图默认选项
 */
export const DefaultGeoOptions = {
  ...DefaultChartOptions,
  geo: {
    roam: true,
    itemStyle: {
      areaColor: "#eee",
      borderColor: "#444",
    },
  },
};

// TODO 平行坐标系，单轴坐标系，日历坐标系
