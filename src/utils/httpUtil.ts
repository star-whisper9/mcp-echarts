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
