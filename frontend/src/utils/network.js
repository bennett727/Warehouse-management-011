/**
 * @file: network.js
 * @description: 网络状态检测和请求重试工具
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';

import { createLogger } from './logger';

const logger = createLogger('Network');

// 网络状态管理
const networkState = {
  isOnline: navigator.onLine,
  lastOnlineTime: Date.now(),
  offlineDuration: 0,
  listeners: [],
};

/**
 * 初始化网络状态监听
 */
export function initNetworkMonitor() {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 定期检查网络状态
  setInterval(checkNetworkHealth, 30000);
}

/**
 * 处理网络恢复
 */
function handleOnline() {
  networkState.isOnline = true;
  networkState.offlineDuration = Date.now() - networkState.lastOnlineTime;

  ElMessage.success({
    message: `网络已恢复${networkState.offlineDuration > 60000 ? `（离线 ${Math.round(networkState.offlineDuration / 60000)} 分钟）` : ''}`,
    duration: 3000,
  });

  notifyListeners('online', {
    offlineDuration: networkState.offlineDuration,
  });
}

/**
 * 处理网络断开
 */
function handleOffline() {
  networkState.isOnline = false;
  networkState.lastOnlineTime = Date.now();

  ElMessage.warning({
    message: '网络连接已断开，部分功能可能无法使用',
    duration: 5000,
  });

  notifyListeners('offline', {});
}

/**
 * 检查网络健康状态
 */
async function checkNetworkHealth() {
  if (!navigator.onLine) {
    return;
  }

  try {
    const startTime = Date.now();
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    const latency = Date.now() - startTime;

    notifyListeners('health-check', {
      healthy: response.ok,
      latency,
    });
  } catch (_error) {
    notifyListeners('health-check', {
      healthy: false,
      latency: -1,
    });
  }
}

/**
 * 添加网络状态监听器
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听的函数
 */
export function addNetworkListener(callback) {
  networkState.listeners.push(callback);
  return () => {
    const index = networkState.listeners.indexOf(callback);
    if (index > -1) {
      networkState.listeners.splice(index, 1);
    }
  };
}

/**
 * 通知所有监听器
 */
function notifyListeners(event, data) {
  networkState.listeners.forEach((callback) => {
    try {
      callback(event, data);
    } catch (error) {
      logger.error('网络状态监听器错误', error);
    }
  });
}

/**
 * 获取当前网络状态
 * @returns {Object} 网络状态对象
 */
export function getNetworkState() {
  return {
    isOnline: networkState.isOnline,
    offlineDuration: networkState.offlineDuration,
  };
}

/**
 * 检查是否在线
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine;
}

// 默认重试配置
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryDelayMultiplier: 2,
  maxRetryDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'NETWORK_ERROR'],
};

/**
 * 执行带重试的请求
 * @param {Function} requestFn - 请求函数
 * @param {Object} config - 重试配置
 * @returns {Promise} 请求结果
 */
export async function withRetry(requestFn, config = {}) {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError = null;
  let attempt = 0;

  while (attempt <= retryConfig.maxRetries) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      attempt++;

      // 检查是否应该重试
      if (!shouldRetry(error, retryConfig) || attempt > retryConfig.maxRetries) {
        throw error;
      }

      // 计算延迟时间
      const delay = Math.min(
        retryConfig.retryDelay * Math.pow(retryConfig.retryDelayMultiplier, attempt - 1),
        retryConfig.maxRetryDelay
      );

      logger.warn(`请求失败，${delay}ms 后进行第 ${attempt} 次重试`, { error: error.message });

      // 等待后重试
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * 判断是否应该重试
 * @param {Error} error - 错误对象
 * @param {Object} config - 重试配置
 * @returns {boolean}
 */
function shouldRetry(error, config) {
  // 检查HTTP状态码
  if (error.response?.status) {
    return config.retryableStatuses.includes(error.response.status);
  }

  // 检查错误代码
  if (error.code) {
    return config.retryableErrors.includes(error.code);
  }

  // 检查错误消息
  const errorMessage = error.message?.toLowerCase() || '';
  return errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('connection');
}

/**
 * 延迟函数
 * @param {number} ms - 毫秒数
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建带重试的API请求包装器
 * @param {Function} apiFn - API函数
 * @param {Object} retryConfig - 重试配置
 * @returns {Function} 包装后的函数
 */
export function createRetryableApi(apiFn, retryConfig = {}) {
  return async (...args) => {
    // 检查网络状态
    if (!isOnline()) {
      throw new Error('网络已断开，请检查网络连接');
    }

    return withRetry(() => apiFn(...args), retryConfig);
  };
}

export default {
  initNetworkMonitor,
  addNetworkListener,
  getNetworkState,
  isOnline,
  withRetry,
  createRetryableApi,
};
