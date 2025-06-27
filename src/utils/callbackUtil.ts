import { vmManager, reviveFunction } from "./vmUtil.js";

export async function processCallback(
  paths: string[],
  options: any
): Promise<string[]> {
  const contextIds: string[] = [];

  for (const path of paths) {
    const contextId = await reviveFunction(options, path);
    if (contextId) {
      contextIds.push(contextId);
    }
  }

  return contextIds;
}

export async function releaseCallbacks(contextIds: string[]): Promise<void> {
  for (const contextId of contextIds) {
    try {
      vmManager.removeContext(contextId);
    } catch (error) {
      console.error(
        `[callbackUtil] Failed to release context ${contextId}:`,
        error
      );
    }
  }
}
