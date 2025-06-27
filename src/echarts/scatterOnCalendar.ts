import * as echarts from "echarts";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createCanvas } from "canvas";
import { savePNG } from "../utils/fileOutput.js";
import type { ToolInput } from "../models/schema.js";
import { DefaultCalendarOptions } from "../models/schema.js";
import merge from "lodash/merge.js";
import dayjs from "dayjs";
import { processCallback, releaseCallbacks } from "../utils/callbackUtil.js";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function getMonthCount(start: string, end: string): number {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return endDate.diff(startDate, "month") + 1;
}

const schema = z.object({
  dark: z.boolean().default(false).describe("是否使用暗色主题"),
  options: z.object({
    title: z
      .object({
        text: z.string().default("日历散点图").describe("主标题"),
        subtext: z.string().optional().describe("副标题"),
      })
      .optional()
      .describe("可选：标题配置"),
    calendar: z.object({
      orient: z
        .enum(["horizontal", "vertical"])
        .default("vertical")
        .describe(
          "日历方向，当需要展示超过 6 个月的范围时，建议使用 'horizontal'"
        ),
      range: z
        .tuple([
          z
            .string()
            .regex(dateRegex, "必须是 yyyy-MM-dd 格式的日期")
            .describe("开始日期"),
          z
            .string()
            .regex(dateRegex, "必须是 yyyy-MM-dd 格式的日期")
            .describe("结束日期"),
        ])
        .describe(
          "日期范围，必须是两个 `yyyy-MM-dd` 格式的字符串，表示开始和结束日期"
        ),
      cellSize: z.number().default(40).describe("单元格大小"),
      dayLabel: z.object({
        nameMap: z.enum(["ZH", "EN"]).default("ZH").describe("日期标签语言"),
      }),
      monthLabel: z.object({
        nameMap: z.enum(["ZH", "EN"]).default("ZH").describe("月份标签语言"),
      }),
    }),
    series: z.array(
      z.object({
        type: z.literal("scatter"),
        coordinateSystem: z.literal("calendar"),
        symbolSize: z
          .union([
            z.number(),
            z
              .string()
              .describe(
                "动态计算散点大小：必须是包含 function 关键字的 JavaScript 函数。例如 `function(value) {return value[1];}` ，传入的是数据值数组，返回大小数值"
              ),
          ])
          .describe("散点大小，建议最终数值在 5~cellSize 之间"),
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
          .describe("可选：散点样式配置"),
        data: z.array(
          z
            .array(z.union([z.string(), z.number()]))
            .describe(
              "数据数组，必须是首项为 `yyyy-MM-dd` 日期字符串，第二项为数值的数组"
            )
        ),
      })
    ),
  }),
});

const tool: Tool = {
  name: "scatterOnCalendar",
  description: "创建日历散点图",
  inputSchema: zodToJsonSchema(schema) as ToolInput,
};

async function create(input: Record<string, any>): Promise<string> {
  const { dark, options } = schema.parse(input);

  // 计算画布大小
  let width: number;
  let height: number;
  const months = getMonthCount(
    options.calendar.range[0],
    options.calendar.range[1]
  );

  if (options.calendar.orient === "horizontal") {
    width = 4.6 * options.calendar.cellSize * months + 80; // 80 - 画面左右留白
    height = 7 * options.calendar.cellSize + 190; // 190 - 画面底留白、标题预留
  } else {
    width = 7 * options.calendar.cellSize + 80; // 80 - 画面左右留白
    height = 4.6 * options.calendar.cellSize * months + 190; // 190 - 画面底留白、标题预留
  }

  const canvas = createCanvas(width, height);
  const chart = echarts.init(
    canvas as unknown as HTMLElement,
    dark ? "dark" : null
  );

  const defaultOptions = merge({}, DefaultCalendarOptions, {
    backgroundColor: dark ? "#333" : "#fff",
  });

  // merge and process callback functions
  const mergedOptions = merge({}, options, defaultOptions);
  const paths = (mergedOptions: any) => {
    const paths: string[] = [];
    if (mergedOptions.series) {
      mergedOptions.series.forEach((series: any, index: number) => {
        if (series.itemStyle?.color?.includes("function")) {
          paths.push(`series.${index}.itemStyle.color`);
        }
        if (
          typeof series.symbolSize === "string" &&
          series.symbolSize.includes("function")
        ) {
          paths.push(`series.${index}.symbolSize`);
        }
      });
    }
    return paths;
  };
  const ids = await processCallback(paths(mergedOptions), mergedOptions);

  chart.setOption(mergedOptions);
  const buffer = canvas.toBuffer("image/png");

  releaseCallbacks(ids);
  return await savePNG(buffer);
}

export const scatterOnCalendar = {
  tool,
  create,
  schema,
};
