import * as echarts from "echarts";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../util.js";
import type { ToolInput } from "../schema.js";
import { DefaultGridOptions } from "../schema.js";
import merge from "lodash/merge.js";

/**
 * 定义柱状图的输入参数
 */
const schema = z.object({
  width: z.number().default(800).describe("图表宽度"),
  height: z.number().default(600).describe("图表高度"),
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z
    .object({
      title: z.object({
        text: z.string().default("柱状图").describe("图表标题"),
        subtext: z.string().optional().describe("图表副标题"),
      }),
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
          .array(z.string().describe("X轴分类数据"))
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
          type: z.literal("bar").describe("系列类型，固定为 'bar'"),
          name: z.string().describe("系列名称"),
          stack: z.string().optional().describe("系列堆叠ID"),
          barWidth: z
            .union([z.string(), z.number()])
            .optional()
            .describe("柱状图宽度，可以是百分比或具体像素值"),
          barGap: z
            .union([z.string(), z.number()])
            .optional()
            .describe("柱状图间距，可以是百分比或具体像素值"),
          data: z
            .array(
              z.union([
                z.number().describe("数据值"),
                z.object({
                  value: z.number().describe("数据值"),
                  name: z.string().optional().describe("数据名称"),
                  itemStyle: z
                    .object({
                      color: z.string().optional().describe("数据项颜色"),
                    })
                    .optional(),
                }),
              ])
            )
            .describe("数据数组，支持单个数值或对象形式"),
        })
      ),
    })
    .describe("图表配置选项"),
});

/**
 * Tool 导出
 */
const tool: Tool = {
  name: "barOnGrid",
  description: "创建直角坐标系柱状图",
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

export const barOnGrid = {
  schema,
  tool,
  create,
};
