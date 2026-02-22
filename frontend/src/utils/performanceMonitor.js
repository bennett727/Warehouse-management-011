/**
 * 性能监控工具
 * @file: performanceMonitor.js
 * @description: 监控前端性能指标，包括页面加载时间、资源加载、渲染性能等
 * @author: 前端开发团队
 * @createTime: 2026-02-20
 * @version: 1.0.0
 */

import { createLogger } from './logger';

const logger = createLogger('performanceMonitor');

/**
 * 性能监控配置
 */
const PERF_CONFIG = {
  // 上报地址
  reportUrl: '/api/performance/report',
  // 采样率
  sampleRate: 0.1,
  // 慢加载阈值 (ms)
  slowLoadThreshold: 3000,
  // 长任务阈值 (ms)
  longTaskThreshold: 50,
  // 内存警告阈值 (MB)
  memoryWarningThreshold: 500,
  // 上报间隔 (ms)
  reportInterval: 300000, // 5分钟
  // 是否启用
  enabled: true,
};

/**
 * 性能指标存储
 */
class PerformanceMetrics {
  constructor() {
    this.metrics = [];
    this.observers = [];
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
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
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
  }

  /**
   * 获取统计信息
   */
  getStats() {
    if (this.metrics.length === 0) {
      return null;
    }

    const pageLoads = this.metrics.filter((m) => m.type === 'page_load');
    const apiCalls = this.metrics.filter((m) => m.type === 'api_call');
    const longTasks = this.metrics.filter((m) => m.type === 'long_task');

    return {
      totalMetrics: this.metrics.length,
      pageLoads: {
        count: pageLoads.length,
        avgLoadTime:
          pageLoads.length > 0 ? pageLoads.reduce((sum, m) => sum + (m.loadTime || 0), 0) / pageLoads.length : 0,
        slowLoads: pageLoads.filter((m) => (m.loadTime || 0) > PERF_CONFIG.slowLoadThreshold).length,
      },
      apiCalls: {
        count: apiCalls.length,
        avgDuration:
          apiCalls.length > 0 ? apiCalls.reduce((sum, m) => sum + (m.duration || 0), 0) / apiCalls.length : 0,
      },
      longTasks: {
        count: longTasks.length,
        totalDuration: longTasks.reduce((sum, m) => sum + (m.duration || 0), 0),
      },
    };
  }
}

// 全局实例
const perfMetrics = new PerformanceMetrics();

/**
 * 获取导航计时指标
 */
export const getNavigationTiming = () => {
  if (!window.performance || !window.performance.timing) {
    return null;
  }

  const { timing } = window.performance;

  // 计算关键指标
  const metrics = {
    // DNS查询时间
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    // TCP连接时间
    tcpConnect: timing.connectEnd - timing.connectStart,
    // 服务器响应时间
    serverResponse: timing.responseEnd - timing.requestStart,
    // DOM解析时间
    domParse: timing.domComplete - timing.domLoading,
    // 资源加载时间
    resourceLoad: timing.loadEventEnd - timing.domContentLoadedEventEnd,
    // 首字节时间 (TTFB)
    ttfb: timing.responseStart - timing.navigationStart,
    // DOM准备时间
    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
    // 页面完全加载时间
    loadComplete: timing.loadEventEnd - timing.navigationStart,
  };

  // 使用 PerformanceNavigationTiming (新版 API)
  if (window.performance.getEntriesByType) {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      metrics.dnsLookup = nav.domainLookupEnd - nav.domainLookupStart;
      metrics.tcpConnect = nav.connectEnd - nav.connectStart;
      metrics.serverResponse = nav.responseEnd - nav.requestStart;
      metrics.domParse = nav.domComplete - nav.domLoading;
      metrics.resourceLoad = nav.loadEventEnd - nav.domContentLoadedEventEnd;
      metrics.ttfb = nav.responseStart - nav.startTime;
      metrics.domReady = nav.domContentLoadedEventEnd - nav.startTime;
      metrics.loadComplete = nav.loadEventEnd - nav.startTime;
    }
  }

  return metrics;
};

/**
 * 获取资源加载性能
 */
export const getResourceTiming = () => {
  if (!window.performance || !window.performance.getEntriesByType) {
    return [];
  }

  const resources = window.performance.getEntriesByType('resource');

  return resources.map((resource) => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize,
    startTime: resource.startTime,
  }));
};

/**
 * 获取Web Vitals指标
 */
export const getWebVitals = async () => {
  const vitals = {};

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = {
          value: lastEntry.startTime,
          element: lastEntry.element?.tagName || 'unknown',
        };
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      logger.warn('LCP监控不支持', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.fid = {
            value: entry.processingStart - entry.startTime,
            target: entry.target?.tagName || 'unknown',
          };
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      logger.warn('FID监控不支持', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.cls = { value: clsValue };
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      logger.warn('CLS监控不支持', e);
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = { value: entry.startTime };
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      logger.warn('FCP监控不支持', e);
    }
  }

  // 等待一段时间收集数据
  await new Promise((resolve) => setTimeout(resolve, 100));

  return vitals;
};

/**
 * 监控长任务
 */
export const observeLongTasks = () => {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > PERF_CONFIG.longTaskThreshold) {
          perfMetrics.add({
            type: 'long_task',
            duration: entry.duration,
            startTime: entry.startTime,
          });

          logger.warn(`长任务警告: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    perfMetrics.observers.push(observer);
  } catch (e) {
    logger.warn('长任务监控不支持', e);
  }
};

/**
 * 监控内存使用
 */
export const monitorMemory = () => {
  if (!performance.memory) {
    return;
  }

  const { memory } = performance;
  const usedMB = memory.usedJSHeapSize / 1048576;
  const totalMB = memory.totalJSHeapSize / 1048576;
  const limitMB = memory.jsHeapSizeLimit / 1048576;

  perfMetrics.add({
    type: 'memory',
    usedMB,
    totalMB,
    limitMB,
    usage: (usedMB / limitMB) * 100,
  });

  // 内存警告
  if (usedMB > PERF_CONFIG.memoryWarningThreshold) {
    logger.warn(`内存使用过高: ${usedMB.toFixed(2)}MB`);
  }

  return { usedMB, totalMB, limitMB };
};

/**
 * 记录页面加载性能
 */
export const recordPageLoad = () => {
  if (!PERF_CONFIG.enabled) {
    return;
  }

  // 等待页面加载完成
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      setTimeout(recordPageLoad, 0);
    });
    return;
  }

  const timing = getNavigationTiming();
  if (!timing) {
    return;
  }

  perfMetrics.add({
    type: 'page_load',
    url: window.location.href,
    ...timing,
  });

  // 慢加载警告
  if (timing.loadComplete > PERF_CONFIG.slowLoadThreshold) {
    logger.warn(`页面加载缓慢: ${timing.loadComplete}ms`);
  }

  logger.info('页面加载性能', timing);
};

/**
 * 记录API调用性能
 */
export const recordAPICall = (apiName, duration, success = true) => {
  if (!PERF_CONFIG.enabled) {
    return;
  }

  perfMetrics.add({
    type: 'api_call',
    apiName,
    duration,
    success,
  });
};

/**
 * 记录组件渲染性能
 */
export const recordComponentRender = (componentName, renderTime) => {
  if (!PERF_CONFIG.enabled) {
    return;
  }

  perfMetrics.add({
    type: 'component_render',
    componentName,
    renderTime,
  });

  // 慢渲染警告
  if (renderTime > 16) {
    // 超过一帧时间 (60fps)
    logger.warn(`组件渲染缓慢: ${componentName} - ${renderTime.toFixed(2)}ms`);
  }
};

/**
 * 获取性能报告
 */
export const getPerformanceReport = () => {
  const stats = perfMetrics.getStats();
  const timing = getNavigationTiming();

  return {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    timing,
    stats,
    resources: getResourceTiming().slice(0, 50), // 只取前50个资源
  };
};

/**
 * 上报性能数据
 */
export const reportPerformance = async () => {
  if (!PERF_CONFIG.enabled) {
    return;
  }

  // 采样检查
  if (Math.random() > PERF_CONFIG.sampleRate) {
    return;
  }

  const report = getPerformanceReport();

  try {
    // 使用 sendBeacon 确保数据发送
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(report)], {
        type: 'application/json',
      });
      navigator.sendBeacon(PERF_CONFIG.reportUrl, blob);
    } else {
      // 降级使用 fetch
      await fetch(PERF_CONFIG.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
        keepalive: true,
      });
    }

    logger.info('性能数据上报成功');
    perfMetrics.clear();
  } catch (error) {
    logger.error('性能数据上报失败', error);
  }
};

/**
 * 启动性能监控
 */
export const startPerformanceMonitoring = () => {
  if (!PERF_CONFIG.enabled) {
    logger.info('性能监控已禁用');
    return;
  }

  // 记录页面加载
  recordPageLoad();

  // 监控长任务
  observeLongTasks();

  // 定时监控内存
  setInterval(monitorMemory, 30000);

  // 定时上报
  setInterval(reportPerformance, PERF_CONFIG.reportInterval);

  // 页面卸载前上报
  window.addEventListener('beforeunload', () => {
    reportPerformance();
  });

  // 页面可见性变化时上报
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportPerformance();
    }
  });

  logger.info('性能监控已启动');
};

/**
 * 更新配置
 */
export const updatePerfConfig = (config) => {
  Object.assign(PERF_CONFIG, config);
  logger.info('性能监控配置已更新', PERF_CONFIG);
};

/**
 * 获取配置
 */
export const getPerfConfig = () => {
  return { ...PERF_CONFIG };
};

/**
 * Vue插件
 */
export const PerformanceMonitorPlugin = {
  install(app, options = {}) {
    if (options.config) {
      updatePerfConfig(options.config);
    }

    app.config.globalProperties.$perfMonitor = {
      recordAPICall,
      recordComponentRender,
      getReport: getPerformanceReport,
      report: reportPerformance,
      getTiming: getNavigationTiming,
      getWebVitals,
      updateConfig: updatePerfConfig,
      getConfig: getPerfConfig,
    };

    // 启动监控
    if (options.start !== false) {
      startPerformanceMonitoring();
    }

    logger.info('性能监控插件已安装');
  },
};

export default {
  getNavigationTiming,
  getResourceTiming,
  getWebVitals,
  observeLongTasks,
  monitorMemory,
  recordPageLoad,
  recordAPICall,
  recordComponentRender,
  getPerformanceReport,
  reportPerformance,
  startPerformanceMonitoring,
  updatePerfConfig,
  getPerfConfig,
  PerformanceMonitorPlugin,
};
