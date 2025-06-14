/**
 * 地图管理工具
 * @module utils/map
 */
import * as echarts from "echarts";
import fs from "fs/promises";
import path from "path";
import { config } from "../models/config.js";

const { geoJsonPath } = config.resource;

export const availableMaps: string[] = [];

/**
 * 注册所有地图，设计上应只在服务器启动时执行一次
 */
export async function registerMaps(): Promise<boolean> {
  try {
    const files = await fs.readdir(geoJsonPath);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const geoName = path.basename(file, ".json");
        const geoData = await loadGeoJson(geoName);
        echarts.registerMap(geoName, geoData);
        availableMaps.push(geoName);
        console.log(`[util] Registered map: ${geoName}`);
      }
    }
    return true;
  } catch (error) {
    console.error("[util] Register maps failed: ", error);
    return false;
  }
}

/**
 * 加载 GeoJson 数据
 *
 * @param geoName 地理区域数据名称
 * @returns 加载的 GeoJson 数据
 * @throws 如果加载失败，抛出错误
 */
async function loadGeoJson(geoName: string): Promise<any> {
  const filePath = path.join(geoJsonPath, `${geoName}.json`);
  return fs
    .readFile(filePath, "utf-8")
    .then((data) => JSON.parse(data))
    .catch((error) => {
      console.error(`[util] Load GeoJson failed for ${geoName}: `, error);
      throw new Error(`Failed to load GeoJson for ${geoName}`);
    });
}
