/**
 * 简易静态资源服务器
 * 用于演示/测试，不建议在生产环境使用
 */
import http from "http";
import fs from "fs";
import path from "path";
import { config } from "../models/config.js";

const { port, host, staticPath } = config.resource;

export async function runResourceServer(): Promise<void> {
  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.writeHead(400);
      return res.end("Bad Request");
    }

    // 路径穿越攻击检查
    const safePath = path
      .normalize(decodeURIComponent(req.url))
      .replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(staticPath, safePath);
    const relativePath = path.relative(staticPath, filePath);
    if (relativePath.startsWith("..")) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        return res.end("Not Found");
      }

      const stream = fs.createReadStream(filePath);
      stream.on("open", () => {
        // 服务器应只会生成如下类型的静态资源，因此未处理额外 MIME 类型
        const mimeType =
          {
            ".html": "text/html",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
          }[path.extname(filePath)] || "application/octet-stream";
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.writeHead(200, { "Content-Type": mimeType });
        stream.pipe(res);
      });
      stream.on("error", () => {
        res.writeHead(500);
        res.end("Internal Server Error");
      });
    });
  });

  server.listen(port, host, () => {
    console.log(`[resource] Static server running at http://${host}:${port}/`);
  });
}
