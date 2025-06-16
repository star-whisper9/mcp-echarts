/**
 * 地图管理工具
 * @module utils/map
 */
import * as echarts from "echarts";
import fs from "fs/promises";
import path from "path";
import { config } from "../models/config.js";

const { geoJsonPath } = config.resource;

/**
 * 注册所有地图
 */
export async function registerMaps(): Promise<string[]> {
  console.log("[util] Registering maps from GeoJSON files...");
  try {
    let availableMaps: string[] = [];
    const files = await fs.readdir(geoJsonPath);
    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const geoName = path.basename(file, ".json");
          const geoData = await loadGeoJson(geoName);
          echarts.registerMap(geoName, geoData);
          availableMaps.push(geoName);
          console.log(`[util] Registered map: ${geoName}`);
        } catch (error) {
          console.error(
            `[util] Failed to register map from ${file}.json: `,
            error
          );
        }
      }
    }
    if (availableMaps.length === 0) {
      throw new Error(
        "[util] No valid GeoJSON file found or all maps failed to register."
      );
    }
    return availableMaps;
  } catch (error) {
    console.error("[util] Register maps failed: ", error);
    return [];
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
