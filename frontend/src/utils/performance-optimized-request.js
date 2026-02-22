/**
 * 性能优化的请求工具类
 * @file: performance-optimized-request.js
 * @description: 优化数据加载性能，支持缓存、防抖、批量请求等
 * @author: Trae AI
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import axios from 'axios';
import { ElMessage } from 'element-plus';

// import { useUserStore } from '../stores/user.js'; // 保留以备将来使用
import { createLogger } from './logger';
import tokenManager from './tokenManager';

const logger = createLogger('PerformanceRequest');

/**
 * 请求缓存管理器
 */
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 60000; // 默认缓存1分钟
  }

  /**
   * 生成缓存键
   */
  generateKey(url, params) {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramsStr}`;
  }

  /**
   * 获取缓存数据
   */
  get(url, params) {
    const key = this.generateKey(url, params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 设置缓存数据
   */
  set(url, params, data, ttl = this.defaultTTL) {
    const key = this.generateKey(url, params);
    this.cache.set(key, {
      data,
      expireTime: Date.now() + ttl,
    });
  }

  /**
   * 清除缓存
   */
  clear(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取缓存大小
   */
  size() {
    return this.cache.size;
  }
}

/**
 * 请求去重管理器
 */
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * 生成请求键
   */
  generateKey(url, params) {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramsStr}`;
  }

  /**
   * 添加待处理请求
   */
  add(url, params, promise) {
    const key = this.generateKey(url, params);
    this.pendingRequests.set(key, promise);

    // 请求完成后移除
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });

    return promise;
  }

  /**
   * 获取待处理请求
   */
  get(url, params) {
    const key = this.generateKey(url, params);
    return this.pendingRequests.get(key);
  }

  /**
   * 是否有待处理请求
   */
  has(url, params) {
    const key = this.generateKey(url, params);
    return this.pendingRequests.has(key);
  }
}

/**
 * 批量请求管理器
 * @class BatchRequestManager
 * @description 保留以备将来使用
 */
// eslint-disable-next-line no-unused-vars
class BatchRequestManager {
  constructor() {
    this.batchQueue = [];
    this.batchTimer = null;
    this.batchDelay = 50; // 50ms内合并请求
  }

  /**
   * 添加批量请求
   */
  add(requestFn) {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ requestFn, resolve, reject });

      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.executeBatch();
        }, this.batchDelay);
      }
    });
  }

  /**
   * 执行批量请求
   */
  async executeBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;

    // 使用 Promise.all 并行执行
    await Promise.all(
      batch.map(async ({ requestFn, resolve, reject }) => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
    );
  }
}

// 创建全局实例
const requestCache = new RequestCache();
const requestDeduplicator = new RequestDeduplicator();
// const batchRequestManager = new BatchRequestManager(); // 保留以备将来使用

/**
 * 性能优化配置
 */
const PERFORMANCE_CONFIG = {
  // 缓存配置
  cache: {
    enabled: true,
    defaultTTL: 60000, // 1分钟
    maxSize: 100, // 最大缓存条目数
  },
  // 请求去重配置
  deduplication: {
    enabled: true,
  },
  // 批量请求配置
  batch: {
    enabled: true,
    delay: 50,
  },
  // 超时配置
  timeout: {
    default: 10000,
    long: 30000,
    upload: 60000,
  },
  // 重试配置
  retry: {
    count: 3,
    delay: 1000,
  },
};

/**
 * 创建优化的Axios实例
 */
const createOptimizedService = () => {
  const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: PERFORMANCE_CONFIG.timeout.default,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });

  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      // 添加认证令牌
      const token = tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 性能监控开始
      config.metadata = { startTime: Date.now() };

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  service.interceptors.response.use(
    (response) => {
      // 计算请求耗时
      if (response.config.metadata) {
        const duration = Date.now() - response.config.metadata.startTime;

        // 记录慢请求
        if (duration > 3000) {
          logger.warn(`慢请求警告: ${response.config.url} 耗时 ${duration}ms`);
        }
      }

      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return service;
};

const optimizedService = createOptimizedService();

/**
 * 优化的GET请求
 * @param {string} url - 请求地址
 * @param {object} params - 请求参数
 * @param {object} options - 配置选项
 * @returns {Promise}
 */
export const optimizedGet = async (url, params = {}, options = {}) => {
  const {
    useCache = PERFORMANCE_CONFIG.cache.enabled,
    cacheTTL = PERFORMANCE_CONFIG.cache.defaultTTL,
    useDeduplication = PERFORMANCE_CONFIG.deduplication.enabled,
    showError = true,
    timeout = PERFORMANCE_CONFIG.timeout.default,
  } = options;

  // 检查缓存
  if (useCache) {
    const cached = requestCache.get(url, params);
    if (cached) {
      logger.debug(`缓存命中: ${url}`);
      return cached;
    }
  }

  // 检查是否有相同请求正在进行
  if (useDeduplication && requestDeduplicator.has(url, params)) {
    logger.debug(`请求去重: ${url}`);
    return requestDeduplicator.get(url, params);
  }

  // 创建请求
  const requestPromise = (async () => {
    try {
      const response = await optimizedService.get(url, {
        params,
        timeout,
      });

      const { data } = response;

      // 缓存响应
      if (useCache && data.code === 200) {
        requestCache.set(url, params, data, cacheTTL);

        // 清理过期缓存
        if (requestCache.size() > PERFORMANCE_CONFIG.cache.maxSize) {
          requestCache.clear();
        }
      }

      return data;
    } catch (error) {
      if (showError) {
        const message = error.response?.data?.message || error.message || '请求失败';
        ElMessage.error(message);
      }
      throw error;
    }
  })();

  // 添加到去重管理器
  if (useDeduplication) {
    return requestDeduplicator.add(url, params, requestPromise);
  }

  return requestPromise;
};

/**
 * 优化的POST请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @param {object} options - 配置选项
 * @returns {Promise}
 */
export const optimizedPost = async (url, data = {}, options = {}) => {
  const {
    showError = true,
    timeout = PERFORMANCE_CONFIG.timeout.default,
    invalidateCache = null, // 失效缓存的模式
  } = options;

  try {
    const response = await optimizedService.post(url, data, { timeout });

    // 清除相关缓存
    if (invalidateCache) {
      requestCache.clear(invalidateCache);
    }

    return response.data;
  } catch (error) {
    if (showError) {
      const message = error.response?.data?.message || error.message || '请求失败';
      ElMessage.error(message);
    }
    throw error;
  }
};

/**
 * 优化的PUT请求
 */
export const optimizedPut = async (url, data = {}, options = {}) => {
  const { showError = true, timeout = PERFORMANCE_CONFIG.timeout.default, invalidateCache = null } = options;

  try {
    const response = await optimizedService.put(url, data, { timeout });

    if (invalidateCache) {
      requestCache.clear(invalidateCache);
    }

    return response.data;
  } catch (error) {
    if (showError) {
      const message = error.response?.data?.message || error.message || '请求失败';
      ElMessage.error(message);
    }
    throw error;
  }
};

/**
 * 优化的DELETE请求
 */
export const optimizedDelete = async (url, options = {}) => {
  const { showError = true, timeout = PERFORMANCE_CONFIG.timeout.default, invalidateCache = null } = options;

  try {
    const response = await optimizedService.delete(url, { timeout });

    if (invalidateCache) {
      requestCache.clear(invalidateCache);
    }

    return response.data;
  } catch (error) {
    if (showError) {
      const message = error.response?.data?.message || error.message || '请求失败';
      ElMessage.error(message);
    }
    throw error;
  }
};

/**
 * 批量获取数据
 * @param {Array} requests - 请求配置数组 [{url, params, options}]
 * @returns {Promise<Array>}
 */
export const batchGet = async (requests) => {
  const promises = requests.map(({ url, params = {}, options = {} }) => optimizedGet(url, params, options));

  return Promise.all(promises);
};

/**
 * 预加载数据
 * @param {Array} requests - 请求配置数组
 */
export const prefetchData = (requests) => {
  // 使用 requestIdleCallback 在浏览器空闲时预加载
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      requests.forEach(({ url, params = {}, options = {} }) => {
        optimizedGet(url, params, { ...options, useCache: true });
      });
    });
  } else {
    // 降级处理：使用 setTimeout
    setTimeout(() => {
      requests.forEach(({ url, params = {}, options = {} }) => {
        optimizedGet(url, params, { ...options, useCache: true });
      });
    }, 100);
  }
};

/**
 * 清除请求缓存
 * @param {string} pattern - 缓存键模式，为空则清除所有
 */
export const clearRequestCache = (pattern) => {
  requestCache.clear(pattern);
  logger.info(`清除缓存: ${pattern || '全部'}`);
};

/**
 * 获取缓存统计
 */
export const getCacheStats = () => {
  return {
    size: requestCache.size(),
    maxSize: PERFORMANCE_CONFIG.cache.maxSize,
  };
};

/**
 * 创建防抖请求函数
 * @param {Function} fn - 请求函数
 * @param {number} delay - 防抖延迟
 */
export const createDebouncedRequest = (fn, delay = 300) => {
  let timeoutId = null;
  let pendingPromise = null;

  return (...args) => {
    if (pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = new Promise((resolve, reject) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
        }
      }, delay);
    });

    return pendingPromise;
  };
};

/**
 * 创建节流请求函数
 * @param {Function} fn - 请求函数
 * @param {number} interval - 节流间隔
 */
export const createThrottledRequest = (fn, interval = 1000) => {
  let lastExecution = 0;
  let pendingPromise = null;

  return async (...args) => {
    const now = Date.now();

    if (now - lastExecution < interval) {
      if (pendingPromise) {
        return pendingPromise;
      }
    }

    lastExecution = now;
    pendingPromise = fn(...args).finally(() => {
      pendingPromise = null;
    });

    return pendingPromise;
  };
};

export default {
  get: optimizedGet,
  post: optimizedPost,
  put: optimizedPut,
  delete: optimizedDelete,
  batchGet,
  prefetchData,
  clearCache: clearRequestCache,
  getCacheStats,
  createDebouncedRequest,
  createThrottledRequest,
};
