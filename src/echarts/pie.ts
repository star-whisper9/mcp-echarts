import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ToolInput } from "../schema";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../util.js";
import * as echarts from "echarts";
import merge from "lodash/merge.js";
import { DefaultChartOptions } from "../schema.js";

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
      series: z.array(
        z.object({
          type: z.literal("pie"),
          name: z.string().describe("系列名称"),
          radius: z
            .union([
              z.string(),
              z.number(),
              z.array(z.union([z.string(), z.number()])),
            ])
            .optional()
            .describe(
              "饼图半径，可以是单个值或数组，当是数组时，首个值为内半径，第二个值为外半径"
            ),
          data: z
            .array(
              z.union([
                z.number().describe("数据值"),
                z
                  .object({
                    value: z.number().describe("数据值"),
                    name: z.string().optional().describe("数据名称"),
                    itemStyle: z
                      .object({
                        color: z.string().optional().describe("数据项颜色"),
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
  description: "创建饼图",
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
  return savePNG(buffer);
}

export const pie = {
  tool,
  schema,
  create,
};
