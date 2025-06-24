import ivm from "isolated-vm";
import { randomUUID, UUID } from "node:crypto";

interface ContextInfo {
  context: ivm.Context;
  createdAt: number;
  lastUsed: number;
}

class IsolatedContextManager {
  private isolatedVM: ivm.Isolate;
  private contextSet: Map<UUID, ContextInfo> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly CONTEXT_TIMEOUT = 2 * 60 * 1000;
  private readonly CLEANUP_INTERVAL = 60 * 1000;

  constructor() {
    this.isolatedVM = new ivm.Isolate({ memoryLimit: 64 });
    this.startCleanupTimer();
  }

  /**
   * 创建新的隔离上下文
   */
  private createContext(): UUID {
    const contextId = randomUUID();
    const context = this.isolatedVM.createContextSync();

    context.global.setSync("ivm", ivm);

    // 加入维护集
    this.contextSet.set(contextId, {
      context,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    });

    return contextId;
  }

  /**
   * 移除指定的上下文
   */
  private removeContext(contextId: UUID): void {
    const contextInfo = this.contextSet.get(contextId);
    if (contextInfo) {
      contextInfo.context.release();
      this.contextSet.delete(contextId);
    }
  }

  /**
   * 清理超时的上下文
   */
  private cleanupExpiredContexts(): void {
    const now = Date.now();
    const expiredContexts: UUID[] = [];

    this.contextSet.forEach((contextInfo, contextId) => {
      if (now - contextInfo.lastUsed > this.CONTEXT_TIMEOUT) {
        expiredContexts.push(contextId);
      }
    });

    expiredContexts.forEach((contextId) => {
      this.removeContext(contextId);
    });

    if (expiredContexts.length > 0) {
      console.log(`Cleaned up ${expiredContexts.length} expired contexts`);
    }
  }

  /**
   * 启动定时清理
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredContexts();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 在隔离环境中执行函数字符串
   */
  reviveFunction(fnStr: string): Function | string {
    fnStr = fnStr.trim();

    if (typeof fnStr !== "string" || !fnStr.startsWith("function")) {
      return fnStr;
    }

    // 基本安全检查
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /eval\s*\(/,
      /Function\s*\(/,
      /constructor/,
      /prototype/,
      /process\./,
      /global\./,
      /__proto__/,
      /this\./,
    ];

    if (dangerousPatterns.some((pattern) => pattern.test(fnStr))) {
      console.warn("Potentially dangerous function detected");
      return fnStr;
    }

    try {
      // 为每个函数创建独立的上下文
      const contextId = this.createContext();
      const contextInfo = this.contextSet.get(contextId)!;

      const scriptText = `
        (function(){
          const userFn = ${fnStr};
          return new ivm.Reference(userFn);
        })()
      `;
      const script = this.isolatedVM.compileScriptSync(scriptText);
      const isolatedFunc = script.runSync(contextInfo.context, {
        timeout: 1000,
      });

      // 创建包装函数，在调用时执行
      const wrappedFunction = (...args: any[]) => {
        try {
          // 更新最后使用时间
          const currentContextInfo = this.contextSet.get(contextId);
          if (!currentContextInfo) {
            console.warn("Context not found");
            return undefined;
          }
          currentContextInfo.lastUsed = Date.now();

          // 将参数传入隔离环境
          const copiedArgs = args.map((arg) =>
            new ivm.ExternalCopy(arg).copyInto()
          );

          const result = isolatedFunc.applySync(undefined, copiedArgs, {
            timeout: 1000,
          });

          return result;
        } catch (error) {
          console.error("Error executing isolated function:", error);
          return undefined;
        }
      };

      // 添加清理方法到函数对象上
      (wrappedFunction as any).__cleanup = () => {
        this.removeContext(contextId);
      };

      return wrappedFunction;
    } catch (error) {
      console.error("Error when reviving function:", error);
      return fnStr;
    }
  }

  /**
   * 清理所有上下文
   */
  cleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.contextSet.forEach((contextInfo, contextId) => {
      contextInfo.context.release();
    });
    this.contextSet.clear();

    this.isolatedVM.dispose();
  }
}

// 单例模式
const contextManager = new IsolatedContextManager();

function reviveFunction(fnStr: string): Function | string {
  return contextManager.reviveFunction(fnStr);
}

export function symbolSizeFunc(options: any) {
  options.series.forEach((series: any) => {
    if (typeof series.symbolSize === "string") {
      series.symbolSize = reviveFunction(series.symbolSize);
    }
  });
}

export function itemStyleFunc(options: any) {
  options.series.forEach((series: any) => {
    if (series.itemStyle) {
      series.itemStyle.color = reviveFunction(series.itemStyle.color);
    }
  });
}

export function cleanupContexts(): void {
  contextManager.cleanup();
}
