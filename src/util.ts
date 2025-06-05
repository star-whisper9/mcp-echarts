import fs from "fs/promises";
import path from "path";
import { config } from "./config.js";

const { resource } = config;
const { staticPath, baseUrl } = resource;

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

export const chartTypes = {
  createBarChart: "bar",
} as const;
