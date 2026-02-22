/**
 * API监控工具
 * @file: apiMonitor.js
 * @description: 监控API调用成功率、响应时间和错误率
 * @author: 前端开发团队
 * @createTime: 2026-02-20
 * @version: 1.0.0
 */

import { createLogger } from './logger';
import { isSuccessResponse } from './responseParser';

const logger = createLogger('apiMonitor');

/**
 * 监控配置
 */
const MONITOR_CONFIG = {
  // 上报地址
  reportUrl: '/api/metrics/report',
  // 采样率 (0-1)
  sampleRate: 1.0,
  // 慢请求阈值 (ms)
  slowRequestThreshold: 1000,
  // 错误率告警阈值 (0-1)
  errorRateThreshold: 0.05,
  // 存储上限
  maxStorageSize: 1000,
  // 上报间隔 (ms)
  reportInterval: 60000,
  // 是否启用本地存储
  enableLocalStorage: true,
  // 存储键名
  storageKey: 'api_monitor_metrics',
};

/**
 * 指标存储
 */
class MetricsStorage {
  constructor() {
    this.metrics = [];
    this.loadFromStorage();
  }

  /**
   * 添加指标
   */
  add(metric) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // 限制存储大小
    if (this.metrics.length > MONITOR_CONFIG.maxStorageSize) {
      this.metrics = this.metrics.slice(-MONITOR_CONFIG.maxStorageSize);
    }

    this.saveToStorage();
  }

  /**
   * 获取所有指标
   */
  getAll() {
    return [...this.metrics];
  }

  /**
   * 清空指标
   */
  clear() {
    this.metrics = [];
    this.saveToStorage();
  }

  /**
   * 获取统计信息
   */
  getStats(timeRange = 3600000) {
    const now = Date.now();
    const filtered = this.metrics.filter((m) => now - m.timestamp <= timeRange);

    if (filtered.length === 0) {
      return null;
    }

    const total = filtered.length;
    const success = filtered.filter((m) => m.success).length;
    const errors = total - success;
    const errorRate = errors / total;

    const durations = filtered.map((m) => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / total;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    // 计算P50, P90, P95, P99
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const p50 = sortedDurations[Math.floor(total * 0.5)];
    const p90 = sortedDurations[Math.floor(total * 0.9)];
    const p95 = sortedDurations[Math.floor(total * 0.95)];
    const p99 = sortedDurations[Math.floor(total * 0.99)];

    // 慢请求统计
    const slowRequests = filtered.filter((m) => m.duration > MONITOR_CONFIG.slowRequestThreshold).length;

    // 按API分组统计
    const apiStats = {};
    filtered.forEach((m) => {
      if (!apiStats[m.apiName]) {
        apiStats[m.apiName] = {
          total: 0,
          success: 0,
          errors: 0,
          durations: [],
        };
      }
      apiStats[m.apiName].total++;
      if (m.success) {
        apiStats[m.apiName].success++;
      } else {
        apiStats[m.apiName].errors++;
      }
      apiStats[m.apiName].durations.push(m.duration);
    });

    // 计算每个API的平均响应时间
    Object.keys(apiStats).forEach((api) => {
      const { durations } = apiStats[api];
      apiStats[api].avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      delete apiStats[api].durations;
    });

    return {
      total,
      success,
      errors,
      errorRate,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      p50,
      p90,
      p95,
      p99,
      slowRequests,
      slowRequestRate: slowRequests / total,
      apiStats,
      timeRange,
    };
  }

  /**
   * 保存到本地存储
   */
  saveToStorage() {
    if (MONITOR_CONFIG.enableLocalStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(MONITOR_CONFIG.storageKey, JSON.stringify(this.metrics));
      } catch (e) {
        logger.warn('保存监控指标到本地存储失败', e);
      }
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromStorage() {
    if (MONITOR_CONFIG.enableLocalStorage && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(MONITOR_CONFIG.storageKey);
        if (stored) {
          this.metrics = JSON.parse(stored);
        }
      } catch (e) {
        logger.warn('从本地存储加载监控指标失败', e);
        this.metrics = [];
      }
    }
  }
}

// 全局存储实例
const metricsStorage = new MetricsStorage();

/**
 * 监控API调用
 * @param {string} apiName - API名称
 * @param {Function} apiPromise - API调用Promise
 * @returns {Promise} API响应
 */
export const monitorAPICall = async (apiName, apiPromise) => {
  // 采样检查
  if (Math.random() > MONITOR_CONFIG.sampleRate) {
    return apiPromise;
  }

  const startTime = performance.now();
  let success = false;
  let error = null;
  let response = null;

  try {
    response = await apiPromise;
    success = isSuccessResponse(response);

    // 检查响应结构
    if (success && response) {
      const hasData = response.data !== undefined;
      const hasCode = response.code !== undefined;

      if (!hasData || !hasCode) {
        logger.warn(`API ${apiName} 响应结构不符合规范`, {
          hasData,
          hasCode,
          response,
        });
      }
    }

    return response;
  } catch (e) {
    error = e;
    success = false;
    throw e;
  } finally {
    const duration = Math.round(performance.now() - startTime);

    // 记录指标
    metricsStorage.add({
      apiName,
      success,
      duration,
      error: error
        ? {
            message: error.message,
            code: error.code,
            status: error.response?.status,
          }
        : null,
      timestamp: Date.now(),
    });

    // 慢请求警告
    if (duration > MONITOR_CONFIG.slowRequestThreshold) {
      logger.warn(`慢请求警告: ${apiName} 耗时 ${duration}ms`);
    }
  }
};

/**
 * 创建监控包装函数
 * @param {Function} apiFunction - API函数
 * @param {string} apiName - API名称
 * @returns {Function} 包装后的函数
 */
export const createMonitoredAPI = (apiFunction, apiName) => {
  return async (...args) => {
    return monitorAPICall(apiName, apiFunction(...args));
  };
};

/**
 * 获取监控统计
 * @param {number} timeRange - 时间范围 (ms), 默认1小时
 * @returns {Object} 统计信息
 */
export const getMonitorStats = (timeRange = 3600000) => {
  return metricsStorage.getStats(timeRange);
};

/**
 * 获取API性能报告
 * @returns {Object} 性能报告
 */
export const getPerformanceReport = () => {
  const stats = metricsStorage.getStats();

  if (!stats) {
    return {
      summary: '暂无数据',
      recommendations: [],
    };
  }

  const recommendations = [];

  // 错误率检查
  if (stats.errorRate > MONITOR_CONFIG.errorRateThreshold) {
    recommendations.push({
      type: 'error',
      priority: 'high',
      message: `错误率过高: ${(stats.errorRate * 100).toFixed(2)}%，建议检查API稳定性`,
    });
  }

  // 慢请求检查
  if (stats.slowRequestRate > 0.1) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: `慢请求占比: ${(stats.slowRequestRate * 100).toFixed(2)}%，建议优化API性能`,
    });
  }

  // 找出性能最差的API
  const slowAPIs = Object.entries(stats.apiStats)
    .filter(([_, api]) => api.avgDuration > MONITOR_CONFIG.slowRequestThreshold)
    .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
    .slice(0, 5);

  if (slowAPIs.length > 0) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      message: `性能较差的API: ${slowAPIs.map(([name]) => name).join(', ')}`,
    });
  }

  // 找出错误率最高的API
  const errorAPIs = Object.entries(stats.apiStats)
    .filter(([_, api]) => api.errors / api.total > MONITOR_CONFIG.errorRateThreshold)
    .sort((a, b) => b[1].errors / b[1].total - a[1].errors / a[1].total)
    .slice(0, 5);

  if (errorAPIs.length > 0) {
    recommendations.push({
      type: 'error',
      priority: 'high',
      message: `错误率较高的API: ${errorAPIs.map(([name]) => name).join(', ')}`,
    });
  }

  return {
    summary: `过去${stats.timeRange / 60000}分钟内，共${stats.total}次API调用，成功率${((1 - stats.errorRate) * 100).toFixed(2)}%，平均响应时间${stats.avgDuration}ms`,
    stats,
    recommendations,
    timestamp: Date.now(),
  };
};

/**
 * 上报监控数据
 */
export const reportMetrics = async () => {
  const stats = metricsStorage.getStats();

  if (!stats || stats.total === 0) {
    return;
  }

  try {
    const response = await fetch(MONITOR_CONFIG.reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'api_metrics',
        data: stats,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });

    if (response.ok) {
      logger.info('监控指标上报成功');
      // 上报成功后清空本地数据
      metricsStorage.clear();
    } else {
      logger.warn('监控指标上报失败', response.status);
    }
  } catch (error) {
    logger.error('监控指标上报异常', error);
  }
};

/**
 * 启动定时上报
 */
export const startAutoReport = () => {
  // 立即上报一次
  reportMetrics();

  // 定时上报
  const intervalId = setInterval(() => {
    reportMetrics();
  }, MONITOR_CONFIG.reportInterval);

  // 页面卸载前上报
  window.addEventListener('beforeunload', () => {
    reportMetrics();
  });

  return () => clearInterval(intervalId);
};

/**
 * 导出监控数据
 * @returns {Object} 监控数据
 */
export const exportMetrics = () => {
  return {
    config: MONITOR_CONFIG,
    metrics: metricsStorage.getAll(),
    stats: metricsStorage.getStats(),
    exportTime: new Date().toISOString(),
  };
};

/**
 * 清空监控数据
 */
export const clearMetrics = () => {
  metricsStorage.clear();
  logger.info('监控数据已清空');
};

/**
 * 更新监控配置
 * @param {Object} config - 配置对象
 */
export const updateMonitorConfig = (config) => {
  Object.assign(MONITOR_CONFIG, config);
  logger.info('监控配置已更新', MONITOR_CONFIG);
};

/**
 * 获取监控配置
 * @returns {Object} 当前配置
 */
export const getMonitorConfig = () => {
  return { ...MONITOR_CONFIG };
};

/**
 * Vue插件 - 全局API监控
 */
export const APIMonitorPlugin = {
  install(app, options = {}) {
    // 更新配置
    if (options.config) {
      updateMonitorConfig(options.config);
    }

    // 添加到全局属性
    app.config.globalProperties.$apiMonitor = {
      monitor: monitorAPICall,
      createMonitoredAPI,
      getStats: getMonitorStats,
      getReport: getPerformanceReport,
      report: reportMetrics,
      export: exportMetrics,
      clear: clearMetrics,
      updateConfig: updateMonitorConfig,
      getConfig: getMonitorConfig,
    };

    // 自动启动上报
    if (options.autoReport !== false) {
      startAutoReport();
    }

    logger.info('API监控插件已安装');
  },
};

export default {
  monitorAPICall,
  createMonitoredAPI,
  getMonitorStats,
  getPerformanceReport,
  reportMetrics,
  startAutoReport,
  exportMetrics,
  clearMetrics,
  updateMonitorConfig,
  getMonitorConfig,
  APIMonitorPlugin,
};
