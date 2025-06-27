import ivm from "isolated-vm";
import { randomUUID } from "node:crypto";
import { log } from "./log.js";

interface VMContext {
  context: ivm.Context;
  createdAt: number;
}

interface SerializedFunction {
  contextId: string;
  func: Function;
}

class VMManager {
  private vm: ivm.Isolate;
  private contextSet: Map<string, VMContext> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private readonly CONTEXT_TIMEOUT = 3 * 60 * 1000; // 3 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  constructor() {
    this.vm = new ivm.Isolate({ memoryLimit: 128 });
    this.startCleanupTimer();
  }

  /**
   * 完全资源清理
   */
  cleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    for (const [id, vmContext] of this.contextSet.entries()) {
      try {
        vmContext.context.release();
      } catch (error) {
        log.warn(`[ivm] Cleanup error for context ${id}: ${error}`);
      }
    }
    this.contextSet.clear();
    try {
      this.vm.dispose();
    } catch (error) {
      log.warn(`[ivm] Failed to dispose VM: ${error}`);
    }
  }

  /**
   * 移除单个上下文
   * @param id context ID
   * @returns 移除成功时 true，其余 false
   */
  removeContext(id: string): boolean {
    const vmContext = this.contextSet.get(id);
    if (!vmContext) {
      return false;
    }

    try {
      vmContext.context.release();
      this.contextSet.delete(id);
      return true;
    } catch (error) {
      log.warn(`[ivm] Failed to remove context ${id}: ${error}`);
      this.contextSet.delete(id);
      return false;
    }
  }

  async executeScript(script: string): Promise<SerializedFunction> {
    if (!this.detect(script)) {
      // 初筛检查失败直接抛错，避免出图出出来有问题
      throw new Error("Script contains potentially dangerous code");
    }

    const id = randomUUID();

    try {
      const context = await this.vm.createContext();

      const jail = context.global;
      await jail.set("global", jail.derefInto());

      this.contextSet.set(id, {
        context,
        createdAt: Date.now(),
      });

      const ivmScript = `(${script})`;
      const compiled = await this.vm.compileScript(ivmScript);
      const isolatedFunc = await compiled.run(context, { timeout: 3000 });

      const wrappedFunc = (...args: any[]) => {
        const result = isolatedFunc.apply(
          undefined,
          args.map((arg) => new ivm.ExternalCopy(arg).copyInto())
        );

        // 检查 result 是否是 ivm.Reference
        if (result && typeof result.copy === "function") {
          return result.copy();
        } else {
          // 如果是基本类型，直接返回
          return result;
        }
      };

      return {
        contextId: id,
        func: wrappedFunc,
      };
    } catch (error) {
      this.removeContext(id);
      throw new Error(`Script execution failed: ${error}`);
    }
  }

  /**
   * 代码初筛。
   * 强制要求以 function 开头，并使用简单正则初筛明显危险代码。
   * @param script 脚本内容
   * @returns 是否通过初筛
   */
  private detect(script: string): boolean {
    script = script.trim();

    if (script.length === 0 || !script.startsWith("function")) {
      return false;
    }

    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /process\b/,
      /global\b/,
      /constructor/i,
      /\bnew\s+Function\s*\(/,
      /eval\s*\(/,
      /arguments/i,
      /callee/i,
      /\[\s*['"`]/, // 防止属性访问
      /String\.fromCharCode/i,
      /unescape/i,
      /\\u[0-9a-f]{4}/i, // Unicode转义
      /this\./,
      /window\./,
    ];

    if (dangerousPatterns.some((pattern) => pattern.test(script))) {
      log.warn("[ivm] Potentially dangerous function detected");
      return false;
    }

    return true;
  }

  /**
   * 超时清理器
   */
  private cleanupExpiredContexts() {
    const now = Date.now();
    for (const [id, vmContext] of this.contextSet.entries()) {
      if (now - vmContext.createdAt > this.CONTEXT_TIMEOUT) {
        this.removeContext(id);
      }
    }
  }

  /**
   * 构建清理定时器
   */
  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredContexts();
    }, this.CLEANUP_INTERVAL);
  }
}

export const vmManager = new VMManager();

/**
 * 反序列化函数。
 * @param options echarts option 项
 * @param path 需要处理的函数路径，使用点分隔的字符串表示法
 * @returns 沙盒的 Context id，用于资源释放
 */
export async function reviveFunction(
  options: any,
  path: string
): Promise<string> {
  let contextId: string = "";
  const segments = parsePath(path);

  try {
    const target = getNestedValue(options, segments);

    if (typeof target === "string") {
      const result = await vmManager.executeScript(target);
      setNestedValue(options, segments, result.func);
      contextId = result.contextId;
    }
  } catch (error) {
    log.error(`[vmUtil] Failed to process function at path ${path}: ${error}`);
  }

  return contextId;
}

/**
 * 处理参数路径
 * @param path 用点分隔的路径字符串，支持索引
 * @returns 路径段数组
 */
function parsePath(path: string): Array<string | number> {
  return path.split(".").map((segment) => {
    // 如果是数字，转换为索引
    const num = parseInt(segment);
    return isNaN(num) ? segment : num;
  });
}

/**
 * 获取对象特定路径的值
 * @param obj 对象
 * @param segments 路径段
 * @returns 对象中路径所指项的值
 */
function getNestedValue(obj: any, segments: Array<string | number>): any {
  return segments.reduce((current, segment) => {
    return current?.[segment];
  }, obj);
}

/**
 * 设置对象指定路径项的值
 * @param obj 对象
 * @param segments 路径段
 * @param value 需要设置的值
 */
function setNestedValue(
  obj: any,
  segments: Array<string | number>,
  value: any
): void {
  const lastSegment = segments.pop()!;
  const parent = segments.reduce((current, segment) => {
    return current[segment];
  }, obj);

  if (parent) {
    parent[lastSegment] = value;
  }
}
