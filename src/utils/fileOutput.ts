/**
 * 导出文件管理工具
 * @module utils/fileOutput
 */
import fs from "fs/promises";
import path from "path";
import { config } from "../models/config.js";

const { staticPath, baseUrl } = config.resource;

/**
 * 保存 PNG buffer 到文件，随后返回访问 URL
 *
 * @param content PNG图片内容
 * @returns 保存后的图片URL(Base URL 来自服务器设定，硬编码)
 */
export function savePNG(content: Buffer): string {
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.png`;
  const filePath = path.join(staticPath, fileName);
  fs.mkdir(staticPath, { recursive: true })
    .then(() => fs.writeFile(filePath, content))
    .catch((error) => {
      console.error("[util] PNG save failed: ", error);
      throw new Error("Failed to save PNG file");
    });
  return `${baseUrl}/${fileName}`;
}
