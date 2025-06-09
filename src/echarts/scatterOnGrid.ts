import * as echarts from "echarts";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../utils/fileOutput.js";
import type { ToolInput } from "../models/schema.js";
import { DefaultGridOptions } from "../models/schema.js";
import merge from "lodash/merge.js";

/**
 * 定义散点图的输入参数
 */
const schema = z.object({
  width: z.number().default(800).describe("图表宽度"),
  height: z.number().default(600).describe("图表高度"),
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z
    .object({
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
      xAxis: z.object({
        type: z
          .enum(["category", "value", "time"])
          .default("category")
          .describe("X轴类型"),
        name: z.string().optional().describe("X轴名称"),
        axisLabel: z.object({
          rotate: z.number().default(0).optional().describe("X轴标签旋转角度"),
        }),
        data: z
          .array(z.string())
          .optional()
          .describe("X轴分类数据，若 type 为 'category' 时必填"),
      }),
      yAxis: z.object({
        type: z
          .enum(["value", "category", "time"])
          .default("value")
          .describe("Y轴类型"),
        name: z.string().optional().describe("Y轴名称"),
      }),
      series: z.array(
        z.object({
          type: z.literal("scatter"),
          name: z.string().describe("系列名称"),
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
          data: z
            .array(
              z.union([
                z.array(z.number()).describe("数据值数组"),
                z
                  .object({
                    value: z.array(z.number()).describe("数据值数组"),
                    name: z.string().optional().describe("数据名称"),
                  })
                  .describe("对象形式的数据项"),
              ])
            )
            .describe("数据数组，支持数据数组或对象形式"),
        })
      ),
    })
    .describe("图表配置选项"),
});

/**
 * Tool 导出
 */
const tool: Tool = {
  name: "scatterOnGrid",
  description: "创建直角坐标系散点图",
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

  const defaultOptions = merge({}, DefaultGridOptions, {
    backgroundColor: dark ? "#333" : "#fff",
  });

  const mergedOptions = merge({}, options, defaultOptions);

  chart.setOption(mergedOptions);

  const buffer = canvas.toBuffer("image/png");
  return savePNG(buffer);
}

export const scatterOnGrid = {
  tool,
  schema,
  create,
};
