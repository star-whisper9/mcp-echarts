import * as echarts from "echarts";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../utils/fileOutput.js";
import type { ToolInput } from "../models/schema.js";
import { DefaultGridOptions } from "../models/schema.js";
import merge from "lodash/merge.js";

const schema = z.object({
  width: z.number().default(800).describe("图表宽度"),
  height: z.number().default(600).describe("图表高度"),
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z.object({
    title: z
      .object({
        text: z.string().default("面积图").describe("主标题"),
        subtext: z.string().optional().describe("副标题"),
      })
      .optional()
      .describe("可选：标题配置"),
    legend: z
      .object({
        data: z.array(
          z.object({
            name: z.string().describe("图例名称"),
          })
        ),
      })
      .optional()
      .describe("可选：单独配置图例"),
    xAxis: z
      .object({
        type: z
          .enum(["category", "value", "time"])
          .default("category")
          .describe("轴类型"),
        name: z.string().optional().describe("可选：名称"),
        axisLabel: z
          .object({
            rotate: z.number().default(0).describe("标签旋转角度"),
          })
          .optional()
          .describe("可选：标签样式"),
        data: z
          .array(z.string().describe("分类数据"))
          .optional()
          .describe("轴分类数据，若 `type` 为 'category' 时必填"),
      })
      .describe("X轴配置"),
    yAxis: z
      .object({
        type: z
          .enum(["value", "category", "time"])
          .default("value")
          .describe("轴类型"),
        name: z.string().optional().describe("可选：名称"),
      })
      .describe("Y轴配置"),
    series: z.array(
      z.object({
        type: z.literal("line"),
        name: z
          .string()
          .optional()
          .describe("当需要使用自定义 legend 时，建议填写系列名称"),
        stack: z.string().optional().describe("系列堆叠名称，若需要堆叠时必填"),
        smooth: z
          .union([
            z.number().default(0.6).describe("平滑度，0-1 之间的值"),
            z.boolean().default(false).describe("是否使用自动平滑"),
          ])
          .optional()
          .describe("可选：平滑曲线样式"),
        lineStyle: z
          .object({
            color: z.string().describe("单条线条颜色（覆盖默认颜色）"),
          })
          .optional()
          .describe("可选：线条样式"),
        areaStyle: z.object({}),
        data: z
          .array(
            z.union([
              z.number(),
              z
                .object({
                  value: z.number(),
                  name: z.string().optional(),
                  label: z
                    .object({
                      show: z.boolean().default(false),
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
  }),
});

/**
 * Tool 导出
 */
const tool: Tool = {
  name: "area",
  description: "创建面积图",
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

export const area = {
  schema,
  tool,
  create,
};
