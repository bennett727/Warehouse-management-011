/**
 * 请求合并与去重管理器
 * @file: requestMerger.js
 * @description: 合并相同请求，避免重复发送，优化网络性能
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0
 */

import { createLogger } from './logger';

const logger = createLogger('requestMerger');

/**
 * 请求合并管理器类
 */
class RequestMerger {
  constructor() {
    // 存储进行中的请求
    this.pendingRequests = new Map();
    // 请求去重时间窗口（毫秒）
    this.dedupWindow = 100;
    // 最近请求记录
    this.recentRequests = new Map();
    // 清理定时器
    this.cleanupInterval = null;

    this.startCleanup();
  }

  /**
   * 生成请求唯一标识
   * @param {string} method - HTTP方法
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @returns {string}
   */
  generateRequestKey(method, url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${method}:${url}:${sortedParams}`;
  }

  /**
   * 检查是否是重复请求
   * @param {string} requestKey - 请求标识
   * @returns {boolean}
   */
  isDuplicateRequest(requestKey) {
    const lastRequest = this.recentRequests.get(requestKey);
    if (!lastRequest) {
      return false;
    }

    // 检查是否在去重时间窗口内
    return Date.now() - lastRequest.timestamp < this.dedupWindow;
  }

  /**
   * 记录请求
   * @param {string} requestKey - 请求标识
   */
  recordRequest(requestKey) {
    this.recentRequests.set(requestKey, {
      timestamp: Date.now(),
      count: (this.recentRequests.get(requestKey)?.count || 0) + 1,
    });
  }

  /**
   * 添加待处理请求
   * @param {string} requestKey - 请求标识
   * @param {Promise} promise - 请求Promise
   */
  addPendingRequest(requestKey, promise) {
    this.pendingRequests.set(requestKey, promise);

    // 请求完成后移除
    promise.then(() => this.removePendingRequest(requestKey)).catch(() => this.removePendingRequest(requestKey));
  }

  /**
   * 移除待处理请求
   * @param {string} requestKey - 请求标识
   */
  removePendingRequest(requestKey) {
    this.pendingRequests.delete(requestKey);
  }

  /**
   * 获取待处理请求
   * @param {string} requestKey - 请求标识
   * @returns {Promise|null}
   */
  getPendingRequest(requestKey) {
    return this.pendingRequests.get(requestKey) || null;
  }

  /**
   * 执行请求（带合并和去重）
   * @param {string} method - HTTP方法
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @param {Function} requestFn - 实际请求函数
   * @returns {Promise}
   */
  async execute(method, url, params, requestFn) {
    const requestKey = this.generateRequestKey(method, url, params);

    // 1. 检查是否有相同的请求正在进行中
    const pendingRequest = this.getPendingRequest(requestKey);
    if (pendingRequest) {
      logger.debug(`Request merged: ${requestKey}`);
      return pendingRequest;
    }

    // 2. 检查是否是重复请求（短时间内）
    if (this.isDuplicateRequest(requestKey)) {
      logger.warn(`Duplicate request detected: ${requestKey}`);
    }

    // 3. 记录请求
    this.recordRequest(requestKey);

    // 4. 执行请求
    const promise = requestFn();
    this.addPendingRequest(requestKey, promise);

    return promise;
  }

  /**
   * 启动清理定时器
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 清理过期记录
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    // 清理过期的最近请求记录
    for (const [key, value] of this.recentRequests.entries()) {
      if (now - value.timestamp > this.dedupWindow * 10) {
        this.recentRequests.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} expired request records`);
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.pendingRequests.clear();
    this.recentRequests.clear();
    logger.info('RequestMerger destroyed');
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      recentRequests: this.recentRequests.size,
      dedupWindow: this.dedupWindow,
    };
  }
}

// 创建单例实例
const requestMerger = new RequestMerger();

export default requestMerger;

/**
 * 创建可合并的请求函数
 * @param {Function} requestFn - 原始请求函数
 * @returns {Function}
 */
export function createMergeableRequest(requestFn) {
  return async (method, url, params, ...args) => {
    return requestMerger.execute(method, url, params, () => {
      return requestFn(method, url, params, ...args);
    });
  };
}

/**
 * 请求防抖装饰器
 * @param {Function} fn - 原始函数
 * @param {number} wait - 等待时间
 * @returns {Function}
 */
export function debounceRequest(fn, wait = 300) {
  let timeout = null;
  let pendingPromise = null;

  return function (...args) {
    if (pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
          timeout = null;
        }
      }, wait);
    });

    return pendingPromise;
  };
}

/**
 * 请求节流装饰器
 * @param {Function} fn - 原始函数
 * @param {number} limit - 限制时间
 * @returns {Function}
 */
export function throttleRequest(fn, limit = 1000) {
  let inThrottle = false;
  let pendingPromise = null;

  return function (...args) {
    if (pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = new Promise((resolve, reject) => {
      const executeFn = async () => {
        if (!inThrottle) {
          inThrottle = true;

          try {
            const result = await fn.apply(this, args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            setTimeout(() => {
              inThrottle = false;
            }, limit);
          }
        } else {
          // 如果在节流期间，等待后重试
          setTimeout(async () => {
            try {
              const result = await fn.apply(this, args);
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              pendingPromise = null;
            }
          }, limit);
        }
      };
      executeFn();
    });

    return pendingPromise;
  };
}

/**
 * 批量请求管理器
 */
export class BatchRequestManager {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 50;
    this.pendingBatches = new Map();
    this.timers = new Map();
  }

  /**
   * 添加请求到批次
   * @param {string} batchKey - 批次标识
   * @param {any} requestData - 请求数据
   * @param {Function} batchProcessor - 批量处理函数
   * @returns {Promise}
   */
  addToBatch(batchKey, requestData, batchProcessor) {
    return new Promise((resolve, reject) => {
      // 获取或创建批次
      if (!this.pendingBatches.has(batchKey)) {
        this.pendingBatches.set(batchKey, []);
      }

      const batch = this.pendingBatches.get(batchKey);
      const requestItem = {
        data: requestData,
        resolve,
        reject,
      };

      batch.push(requestItem);

      // 如果达到批次大小，立即处理
      if (batch.length >= this.batchSize) {
        this.processBatch(batchKey, batchProcessor);
      } else {
        // 否则设置延迟处理
        this.scheduleBatch(batchKey, batchProcessor);
      }
    });
  }

  /**
   * 设置批次处理定时器
   * @param {string} batchKey - 批次标识
   * @param {Function} batchProcessor - 批量处理函数
   */
  scheduleBatch(batchKey, batchProcessor) {
    // 清除现有的定时器
    if (this.timers.has(batchKey)) {
      clearTimeout(this.timers.get(batchKey));
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.processBatch(batchKey, batchProcessor);
    }, this.batchDelay);

    this.timers.set(batchKey, timer);
  }

  /**
   * 处理批次
   * @param {string} batchKey - 批次标识
   * @param {Function} batchProcessor - 批量处理函数
   */
  async processBatch(batchKey, batchProcessor) {
    // 清除定时器
    if (this.timers.has(batchKey)) {
      clearTimeout(this.timers.get(batchKey));
      this.timers.delete(batchKey);
    }

    const batch = this.pendingBatches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    // 清空当前批次
    this.pendingBatches.delete(batchKey);

    try {
      // 提取所有请求数据
      const requests = batch.map((item) => item.data);

      // 批量处理
      const results = await batchProcessor(requests);

      // 分发结果
      batch.forEach((item, index) => {
        if (results && results[index] !== undefined) {
          item.resolve(results[index]);
        } else {
          item.resolve(results);
        }
      });

      logger.debug(`Batch processed: ${batchKey}, count: ${batch.length}`);
    } catch (error) {
      // 批量处理失败，所有请求都reject
      batch.forEach((item) => {
        item.reject(error);
      });

      logger.error(`Batch processing failed: ${batchKey}`, error);
    }
  }

  /**
   * 清空所有待处理批次
   */
  clearAll() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // 拒绝所有待处理的请求
    this.pendingBatches.forEach((batch) => {
      batch.forEach((item) => {
        item.reject(new Error('Batch processing cancelled'));
      });
    });
    this.pendingBatches.clear();

    logger.info('All pending batches cleared');
  }
}

// 创建批量请求管理器单例
export const batchRequestManager = new BatchRequestManager();
