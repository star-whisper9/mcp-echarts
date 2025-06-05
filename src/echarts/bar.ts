import * as echarts from "echarts";
import { z } from "zod";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../util.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

/**
 * 定义柱状图的输入参数
 * - title: 图表标题
 * - width: 渲染宽度，默认 800
 * - height: 渲染高度，默认 600
 * - xAxis: x 轴数据，String 数组
 * - series: 数据系列，包含名称、类型（固定为 "bar"）和数据数组
 * - dark: 是否使用暗色主题，默认 false
 */
const schema = z.object({
  title: z.string().optional(),
  width: z.number().optional().default(800),
  height: z.number().optional().default(600),
  xAxis: z.array(z.string()),
  series: z.array(
    z.object({
      name: z.string(),
      type: z.literal("bar"),
      data: z.array(z.number()),
    })
  ),
  dark: z.boolean().optional().default(false),
});

/**
 * Tool 导出
 */
const tool: Tool = {
  name: "createBarChart",
  description: "创建一个简单柱状图，不支持堆叠",
  inputSchema: zodToJsonSchema(schema) as ToolInput,
};

async function create(options: Record<string, any>): Promise<string> {
  const { title, width, height, xAxis, series, dark } = schema.parse(options);

  const canvas = createCanvas(width, height);
  const chart = echarts.init(
    canvas as unknown as HTMLElement,
    dark ? "dark" : null
  );

  chart.setOption({
    title: {
      text: title || "柱状图",
    },
    tooltip: {},
    xAxis: {
      type: "category",
      data: xAxis,
    },
    yAxis: {
      type: "value",
    },
    series: series,
  });

  const buffer = canvas.toBuffer("image/png");
  return savePNG(buffer);
}

export const bar = {
  schema,
  tool,
  create,
};
