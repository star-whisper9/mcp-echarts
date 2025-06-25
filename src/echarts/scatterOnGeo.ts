import * as echarts from "echarts";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../utils/fileOutput.js";
import type { ToolInput } from "../models/schema.js";
import merge from "lodash/merge.js";
import { DefaultGeoOptions } from "../models/schema.js";
import { registerMaps } from "../utils/map.js";
import { symbolSizeFunc, itemStyleFunc } from "../utils/isolatedVM.js";

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
        text: z.string().default("地图散点图").describe("主标题"),
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
    geo: z
      .object({
        // FIXME 模块顶层使用 await 可能有问题
        map: z.enum((await registerMaps()) as [string, ...string[]]),
      })
      .describe("选用的地图底图"),
    series: z.array(
      z.object({
        type: z.literal("scatter"),
        name: z
          .string()
          .optional()
          .describe("当需要使用自定义 legend 时，建议填写系列名称"),
        coordinateSystem: z.literal("geo"),
        symbolSize: z
          .union([
            z.number().describe("散点大小"),
            z
              .string()
              .describe(
                "动态计算散点大小：必须是包含 function 关键字的 JavaScript 函数。例如 `function(value) {return value[1];}` ，传入的是数据值数组，返回大小数值"
              ),
          ])
          .describe("散点大小，建议至少大于 5，否则可能难以辨认"),
        itemStyle: z
          .object({
            color: z.union([
              z.string().describe("散点颜色"),
              z
                .string()
                .describe(
                  "动态计算散点颜色：必须是包含 function 关键字的 JavaScript 函数。例如 `function(value) {return value['data'][1] > 100 ? 'red' : 'blue';}` ，传入的是完整的 series 项，返回颜色字符串"
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
                  value: z.array(z.number()),
                  name: z.string().optional(),
                  label: z
                    .object({
                      show: z.boolean().default(true).describe("是否显示标签"),
                      position: z
                        .enum(["inside", "top", "bottom", "left", "right"])
                        .describe("标签位置")
                        .default("top"),
                      formatter: z.string().describe("标签格式化字符串"),
                    })
                    .optional()
                    .describe("可选：单个点的标签配置"),
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
  symbolSizeFunc(mergedOptions);
  itemStyleFunc(mergedOptions);

  chart.setOption(mergedOptions);

  const buffer = canvas.toBuffer("image/png");
  return await savePNG(buffer);
}

export const scatterOnGeo = {
  tool,
  schema,
  create,
};
