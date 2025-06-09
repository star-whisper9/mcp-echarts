import { z } from "zod";
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";

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
} as const;

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
export const DefaultMapOptions = {
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
