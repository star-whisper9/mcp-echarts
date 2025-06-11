import * as echarts from "echarts";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../utils/fileOutput.js";
import type { ToolInput } from "../models/schema.js";
import merge from "lodash/merge.js";
import { DefaultGeoOptions } from "../models/schema.js";
import { availableMaps } from "../utils/map.js";

/**
 * 定义散点图在地理坐标系上的输入参数
 */
const schema = z.object({
  width: z.number().default(800).describe("图表宽度"),
  height: z.number().default(600).describe("图表高度"),
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z.object({
    title: z
      .object({
        text: z.string().optional().describe("图表标题"),
        subtext: z.string().optional().describe("图表副标题"),
      })
      .optional(),
    legend: z
      .object({
        data: z
          .array(
            z.object({
              name: z.string().describe("图例名称"),
            })
          )
          .optional(),
      })
      .optional()
      .describe("图例配置，可选"),
    geo: z.object({
      map: z.enum(availableMaps as [string, ...string[]]),
    }),
    series: z.array(
      z.object({
        type: z.literal("scatter"),
        coordinateSystem: z.literal("geo"),
        symbolSize: z.union([
          z.number().describe("散点大小"),
          z
            .array(z.number())
            .describe("散点大小数组，首项为宽度，第二项为高度"),
          z
            .string()
            .describe(
              "回调函数：`(value: Array|number, params: Object) => number|Array`，其中第一个参数是 `data` 中的数据值，第二个参数是其他的数据项参数。用于动态计算散点大小"
            ),
        ]),
        itemStyle: z
          .object({
            color: z.union([
              z.string().describe("散点颜色"),
              z
                .string()
                .describe(
                  "回调函数：`(params: Object) => string`，用于动态计算散点颜色，传入的是数据项参数"
                ),
            ]),
          })
          .optional()
          .describe("散点样式配置"),
        label: z
          .object({
            show: z.boolean().default(true).describe("是否显示标签"),
            position: z
              .enum(["inside", "top", "bottom", "left", "right"])
              .optional()
              .describe("标签位置")
              .default("top"),
            formatter: z.string().describe("标签格式化字符串函数，"),
          })
          .optional()
          .describe("散点标签配置"),
        data: z
          .array(
            z.union([
              z.array(z.number()).describe("数据值数组"),
              z
                .object({
                  value: z.array(z.number()).describe("数据值数组"),
                  name: z.string().optional().describe("数据名称"),
                  label: z
                    .object({
                      show: z.boolean().default(true).describe("是否显示标签"),
                      position: z
                        .enum(["inside", "top", "bottom", "left", "right"])
                        .optional()
                        .describe("标签位置")
                        .default("top"),
                      formatter: z.string().describe("标签格式化字符串"),
                    })
                    .optional()
                    .describe("单个点的标签配置"),
                })
                .describe("对象形式的数据项"),
            ])
          )
          .describe("数据数组，支持数据数组或对象形式"),
      })
    ),
  }),
});

/**
 * Tool 导出
 */
const tool: Tool = {
  name: "scatterOnGeo",
  description: "创建地图散点图",
  inputSchema: zodToJsonSchema(schema) as ToolInput,
};

/**
 * 创建图表函数导出
 * @param input 输入参数，应符合 schema 定义
 * @returns 图片 URL
 */
async function create(input: Record<string, any>): Promise<string> {
  const { width, height, dark, options } = schema.parse(input);

  const canvas = createCanvas(width, height);
  const chart = echarts.init(
    canvas as unknown as HTMLElement,
    dark ? "dark" : null
  );

  const defaultOptions = merge({}, DefaultGeoOptions, {
    backgroundColor: dark ? "#333" : "#fff",
  });

  const mergedOptions = merge({}, options, defaultOptions);

  chart.setOption(mergedOptions);

  const buffer = canvas.toBuffer("image/png");
  return savePNG(buffer);
}

export const scatterOnGeo = {
  tool,
  schema,
  create,
};
