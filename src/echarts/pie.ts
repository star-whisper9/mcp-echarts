import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ToolInput } from "../models/schema";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../utils/fileOutput.js";
import * as echarts from "echarts";
import merge from "lodash/merge.js";
import { DefaultChartOptions } from "../models/schema.js";

const schema = z.object({
  width: z.number().default(800).describe("图表宽度"),
  height: z.number().default(600).describe("图表高度"),
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z
    .object({
      title: z
        .object({
          text: z.string().default("饼图").describe("主标题"),
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
      series: z.array(
        z.object({
          type: z.literal("pie"),
          name: z
            .string()
            .optional()
            .describe("当需要使用自定义 legend 时，建议填写系列名称"),
          radius: z
            .union([
              z.string(),
              z.number(),
              z.array(z.union([z.string(), z.number()])),
            ])
            .optional()
            .describe(
              "可选：饼图半径，可以是单个值或数组，当是数组时，首个值为内半径，第二个值为外半径"
            ),
          roseType: z
            .enum(["radius", "area"])
            .optional()
            .describe(
              "可选：玫瑰图类型，设置此项时绘制为南丁格尔玫瑰图。可选'radius' 或 'area'"
            ),
          itemStyle: z
            .object({
              borderRadius: z
                .number()
                .optional()
                .describe("数据项圆角半径，适用于南丁格尔玫瑰图"),
            })
            .describe("可选：数据项样式")
            .optional(),
          data: z
            .array(
              z.union([
                z.number(),
                z
                  .object({
                    value: z.number(),
                    name: z.string().optional(),
                    itemStyle: z
                      .object({
                        color: z.string().describe("单个数据项颜色"),
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
  name: "pie",
  description: "创建饼图或南丁格尔玫瑰图",
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

  const defaultOptions = merge({}, DefaultChartOptions, {
    backgroundColor: dark ? "#333" : "#fff",
  });

  const mergedOptions = merge({}, options, defaultOptions);

  chart.setOption(mergedOptions);

  const buffer = canvas.toBuffer("image/png");
  return await savePNG(buffer);
}

export const pie = {
  tool,
  schema,
  create,
};
