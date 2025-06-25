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
  scatterOnSingleAxis: "scatterOnSingleAxis",
  scatterOnCalendar: "scatterOnCalendar",
} as const;

/**
 * 全局图表默认选项，用于和具体坐标系图混合
 */
export const DefaultChartOptions = {
  title: {
    left: "center",
    top: 20,
  },
  legend: {
    icon: "roundRect",
    top: "bottom",
    bottom: 20,
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

/**
 * 单轴坐标系默认选项
 */
export const DefaultSingleAxisOptions = {
  ...DefaultChartOptions,
  singleAxis: {
    bottom: "15%",
    show: true,
  },
};

/**
 * 日历坐标系默认选项
 */
export const DefaultCalendarOptions = {
  ...DefaultChartOptions,
  calendar: {
    top: 140,
    left: 45,
    dayLabel: {
      firstDay: 1,
      margin: 12,
    },
    monthLabel: {
      margin: 12,
    },
    yearLabel: {
      margin: 38,
      position: "top",
    },
  },
};

// TODO 平行坐标系
