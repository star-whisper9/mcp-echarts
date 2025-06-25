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
 * 定义折线图的输入参数
 */
const schema = z.object({
  width: z.number().default(800).describe("图表宽度"),
  height: z.number().default(600).describe("图表高度"),
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z
    .object({
      title: z
        .object({
          text: z.string().default("折线图").describe("图表标题"),
          subtext: z.string().optional().describe("图表副标题"),
        })
        .optional()
        .describe("可选的标题配置"),
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
        .describe("可选的图例配置"),
      xAxis: z.object({
        type: z
          .enum(["category", "value", "time"])
          .default("category")
          .describe("X轴类型"),
        name: z.string().optional().describe("X轴名称"),
        axisLabel: z
          .object({
            rotate: z.number().default(0).describe("标签旋转角度"),
          })
          .optional()
          .describe("可选：标签样式"),
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
      visualMap: z
        .object({
          type: z.literal("piecewise"),
          show: z.literal(false),
          dimension: z.number().default(0).describe("视觉映射维度"),
          seriesIndex: z.number().default(0).describe("数据系列索引"),
          pieces: z.array(
            z.object({
              gt: z.number().optional().describe("大于某值"),
              lt: z.number().optional().describe("小于某值"),
              color: z
                .string()
                .default("rgba(0,0,180,0.4)")
                .describe("填充颜色，使用 rgba(r, g, b, a) 格式"),
            })
          ),
        })
        .optional()
        .describe("可选的折线图区域填充配置"),
      series: z.array(
        z.object({
          type: z.literal("line"),
          name: z
            .string()
            .optional()
            .describe("当需要使用自定义 legend 时，建议填写系列名称"),
          stack: z
            .string()
            .optional()
            .describe("系列堆叠名称，若需要堆叠时必填"),
          smooth: z
            .union([
              z.number().default(0.6).describe("平滑度，0-1 之间的值"),
              z.boolean().default(false).describe("是否使用自动平滑"),
            ])
            .optional()
            .describe("可选的平滑曲线配置"),
          lineStyle: z
            .object({
              color: z.string().describe("单条线条颜色（覆盖默认颜色）"),
            })
            .optional()
            .describe("可选的线条样式配置"),
          data: z
            .array(
              z.union([
                z.number().describe("数据值"),
                z
                  .object({
                    value: z.number().describe("数据值"),
                    name: z.string().optional().describe("数据名称"),
                    label: z
                      .object({
                        show: z
                          .boolean()
                          .default(false)
                          .describe("是否显示数据标签"),
                      })
                      .optional(),
                    labelLine: z
                      .object({
                        show: z
                          .boolean()
                          .default(false)
                          .describe("是否显示标签的视觉引导线"),
                      })
                      .optional(),
                  })
                  .describe("对象形式数据项"),
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
  name: "lineOnGrid",
  description: "创建直角坐标系折线图",
  inputSchema: zodToJsonSchema(schema) as ToolInput,
};

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
  return await savePNG(buffer);
}

export const lineOnGrid = {
  schema,
  tool,
  create,
};
