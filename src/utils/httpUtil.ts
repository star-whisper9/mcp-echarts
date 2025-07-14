import { NextFunction, Request, Response } from "express";
import http from "http";

/**
 * 检查 CORS 策略并设置响应头
 *
 * @param req request 对象
 * @param res response 对象
 * @param cors cors 策略列表
 * @returns 如果不允许跨域，则返回 403 Forbidden
 *          如果允许跨域，则设置响应头并返回 undefined
 */
export function corsCheck(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  cors: string[]
): http.ServerResponse | void {
  const origin = req.headers.origin;
  if (!cors.includes("*")) {
    // 只允许列表中的域
    if (origin && !cors.includes(origin)) {
      res.writeHead(403);
      return res.end("Forbidden");
    } else {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
}

/**
 * 简单 Api Key 验证中间件
 * @param req Request 对象
 * @param res Response 对象
 * @param next Next 函数
 * @returns
 */
export function validation(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.API_KEY;
  const key = req.headers["x-api-key"];

  // 支持不设置 API key 的情况
  if (!apiKey) {
    next();
  }

  if (!key) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Unauthorized: Missing API key",
      },
      id: req?.body?.id || null,
    });
    return;
  }

  // Bearer token格式检查
  if (key !== process.env.API_KEY) {
    res.status(403).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Forbidden: Invalid API key",
      },
      id: req?.body?.id || null,
    });
    return;
  }

  next();
}
