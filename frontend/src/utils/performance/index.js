import { createLogger } from '../logger';

const logger = createLogger('performanceMonitor');

const PERFORMANCE_CONFIG = {
  enabled: false,
  reportUrl: '/api/performance-report',
  batchSize: 5,
  reportInterval: 30000,
  maxRetries: 2,
  retryDelay: 3000,
  sampleRate: 0.1,
  collectPageLoad: true,
  collectResourceTiming: true,
  collectPaintTiming: true,
  collectMemory: true,
  collectLongTasks: true,
  longTaskThreshold: 50,
  slowRequestThreshold: 1000,
  verySlowRequestThreshold: 3000,
  budget: {
    fcp: 1800,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 800,
    tti: 3800,
  },
};

let performanceQueue = [];
let reportTimer = null;
let reportRetryCount = 0;
const observers = [];

export function initPerformanceMonitor(config = {}) {
  Object.assign(PERFORMANCE_CONFIG, config);

  if (!PERFORMANCE_CONFIG.enabled) {
    logger.info('性能监控已禁用');
    return;
  }

  if (!shouldSample()) {
    logger.info('性能监控采样跳过');
    return;
  }

  logger.info('初始化性能监控');

  if (PERFORMANCE_CONFIG.collectPageLoad) {
    collectPageLoadMetrics();
  }

  if (PERFORMANCE_CONFIG.collectResourceTiming) {
    setupResourceTimingObserver();
  }

  if (PERFORMANCE_CONFIG.collectPaintTiming) {
    setupPaintTimingObserver();
    collectCoreWebVitals();
  }

  if (PERFORMANCE_CONFIG.collectLongTasks) {
    setupLongTaskObserver();
  }

  startReportTimer();

  window.addEventListener('beforeunload', () => {
    if (performanceQueue.length > 0) {
      reportPerformanceData(true);
    }
  });
}

function shouldSample() {
  return Math.random() < PERFORMANCE_CONFIG.sampleRate;
}

function collectPageLoadMetrics() {
  if (!performance || !performance.timing) {
    logger.warn('Performance API不可用，无法收集页面加载指标');
    return;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const { timing } = performance;

      const metrics = {
        type: 'page_load',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        metrics: {
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          tcpConnection: timing.connectEnd - timing.connectStart,
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          domProcessing: timing.domComplete - timing.domLoading,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
          totalLoadTime: timing.loadEventEnd - timing.navigationStart,
          ttfb: navigation ? Math.round(navigation.responseStart - navigation.startTime) : 0,
        },
      };

      capturePerformance(metrics);
      logger.info('页面加载性能指标已收集');

      if (navigation) {
        checkPerformanceBudget('ttfb', metrics.metrics.ttfb);
      }
    }, 0);
  });
}

function collectCoreWebVitals() {
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      if (fcp) {
        const value = Math.round(fcp.startTime);
        capturePerformance({
          type: 'fcp',
          timestamp: new Date().toISOString(),
          value,
          rating: getRating('fcp', value),
        });
        checkPerformanceBudget('fcp', value);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    observers.push(fcpObserver);

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp) {
        const value = Math.round(lcp.startTime);
        capturePerformance({
          type: 'lcp',
          timestamp: new Date().toISOString(),
          value,
          rating: getRating('lcp', value),
          element: lcp.element?.tagName || 'unknown',
        });
        checkPerformanceBudget('lcp', value);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    observers.push(lcpObserver);

    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const value = Math.round(entry.processingStart - entry.startTime);
        capturePerformance({
          type: 'fid',
          timestamp: new Date().toISOString(),
          value,
          rating: getRating('fid', value),
        });
        checkPerformanceBudget('fid', value);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    observers.push(fidObserver);

    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    observers.push(clsObserver);

    window.addEventListener('beforeunload', () => {
      capturePerformance({
        type: 'cls',
        timestamp: new Date().toISOString(),
        value: Math.round(clsValue * 1000) / 1000,
        rating: getRating('cls', clsValue),
      });
      checkPerformanceBudget('cls', clsValue);
    });
  } catch (error) {
    logger.error('收集Core Web Vitals失败:', error);
  }
}

function setupResourceTimingObserver() {
  if (!PerformanceObserver) {
    logger.warn('PerformanceObserver不可用，无法监控资源加载时间');
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const metrics = {
          type: 'resource',
          timestamp: new Date().toISOString(),
          url: entry.name,
          metrics: {
            duration: entry.duration,
            startTime: entry.startTime,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          },
        };

        capturePerformance(metrics);
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    observers.push(observer);

    logger.info('资源加载时间观察器已设置');
  } catch (error) {
    logger.error('设置资源加载时间观察器失败:', error);
  }
}

function setupPaintTimingObserver() {
  if (!PerformanceObserver) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const metrics = {
          type: 'paint',
          timestamp: new Date().toISOString(),
          name: entry.name,
          metrics: {
            startTime: entry.startTime,
            duration: entry.duration,
          },
        };

        capturePerformance(metrics);
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    observers.push(observer);
  } catch (error) {
    logger.error('设置绘制时间观察器失败:', error);
  }
}

function setupLongTaskObserver() {
  if (!PerformanceObserver) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.duration >= PERFORMANCE_CONFIG.longTaskThreshold) {
          const metrics = {
            type: 'long_task',
            timestamp: new Date().toISOString(),
            metrics: {
              duration: entry.duration,
              startTime: entry.startTime,
              attribution: entry.attribution || [],
            },
          };

          capturePerformance(metrics);
          logger.warn(`检测到长任务: ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
    observers.push(observer);

    logger.info('长任务观察器已设置');
  } catch (error) {
    logger.error('设置长任务观察器失败:', error);
  }
}

export function capturePerformance(metrics) {
  if (!PERFORMANCE_CONFIG.enabled) {
    return;
  }

  const enrichedMetrics = enrichPerformanceMetrics(metrics);

  performanceQueue.push(enrichedMetrics);

  logger.debug('[PerformanceMonitor] 捕获性能指标:', enrichedMetrics);

  if (performanceQueue.length >= PERFORMANCE_CONFIG.batchSize) {
    reportPerformanceData();
  }
}

export function captureAPIPerformance(url, duration, status, result) {
  const metrics = {
    type: 'api_request',
    timestamp: new Date().toISOString(),
    url,
    metrics: {
      duration,
      status,
      result,
    },
  };

  capturePerformance(metrics);

  if (duration > PERFORMANCE_CONFIG.verySlowRequestThreshold) {
    logger.error(`API请求耗时过长: ${url} - ${duration}ms`);
  } else if (duration > PERFORMANCE_CONFIG.slowRequestThreshold) {
    logger.warn(`API请求耗时较长: ${url} - ${duration}ms`);
  }
}

export function captureCustomMetric(name, value, context = {}) {
  const metrics = {
    type: 'custom_metric',
    timestamp: new Date().toISOString(),
    name,
    metrics: {
      value,
      ...context,
    },
  };

  capturePerformance(metrics);
}

export function markPerformance(name, detail = {}) {
  if (window.performance && window.performance.mark) {
    window.performance.mark(name);
  }

  capturePerformance({
    type: 'custom-mark',
    name,
    detail,
  });
}

export function measurePerformance(name, startMark, endMark) {
  if (window.performance && window.performance.measure) {
    try {
      window.performance.measure(name, startMark, endMark);
      const entries = window.performance.getEntriesByName(name);
      const duration = entries[entries.length - 1]?.duration;

      if (duration) {
        capturePerformance({
          type: 'measure',
          name,
          duration: Math.round(duration),
        });
      }
    } catch (e) {
      logger.error('Performance measurement failed:', e);
    }
  }
}

function enrichPerformanceMetrics(metrics) {
  const enriched = { ...metrics };

  if (PERFORMANCE_CONFIG.collectMemory && performance.memory) {
    enriched.memory = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }

  enriched.userAgent = navigator.userAgent;
  enriched.screenResolution = `${window.screen.width}x${window.screen.height}`;
  enriched.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
  enriched.connection = getConnectionInfo();

  return enriched;
}

function getConnectionInfo() {
  if (navigator.connection) {
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData,
    };
  }
  return null;
}

function getRating(metric, value) {
  const budgets = {
    fcp: { good: 1800, needsImprovement: 3000 },
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
  };

  const budget = budgets[metric];
  if (!budget) {
    return 'unknown';
  }

  if (value <= budget.good) {
    return 'good';
  }
  if (value <= budget.needsImprovement) {
    return 'needs-improvement';
  }
  return 'poor';
}

function checkPerformanceBudget(metric, value) {
  const budget = PERFORMANCE_CONFIG.budget[metric];
  if (!budget) {
    return;
  }

  if (value > budget) {
    logger.warn(`[Performance] ${metric} 超出性能预算: ${value}ms (预算: ${budget}ms)`);

    capturePerformance({
      type: 'budget-exceeded',
      metric,
      value,
      budget,
    });
  }
}

function startReportTimer() {
  if (reportTimer) {
    clearInterval(reportTimer);
  }

  reportTimer = setInterval(() => {
    if (performanceQueue.length > 0) {
      reportPerformanceData();
    }
  }, PERFORMANCE_CONFIG.reportInterval);

  logger.info(`性能上报定时器已启动，间隔: ${PERFORMANCE_CONFIG.reportInterval}ms`);
}

function stopReportTimer() {
  if (reportTimer) {
    clearInterval(reportTimer);
    reportTimer = null;
  }
}

async function reportPerformanceData(isSync = false) {
  if (performanceQueue.length === 0) {
    return;
  }

  const metricsToReport = [...performanceQueue];
  performanceQueue = [];

  logger.info(`[PerformanceMonitor] 上报 ${metricsToReport.length} 条性能数据`);

  try {
    if (isSync && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(metricsToReport)], {
        type: 'application/json',
      });
      const success = navigator.sendBeacon(PERFORMANCE_CONFIG.reportUrl, blob);

      if (success) {
        logger.info('[PerformanceMonitor] 性能数据已通过sendBeacon上报');
        reportRetryCount = 0;
        return;
      }
    }

    const response = await fetch(PERFORMANCE_CONFIG.reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricsToReport),
      keepalive: isSync,
    });

    if (response.ok) {
      logger.info('[PerformanceMonitor] 性能数据上报成功');
      reportRetryCount = 0;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('[PerformanceMonitor] 性能数据上报失败:', error);

    if (reportRetryCount < PERFORMANCE_CONFIG.maxRetries) {
      reportRetryCount++;
      setTimeout(() => {
        performanceQueue.unshift(...metricsToReport);
        reportPerformanceData();
      }, PERFORMANCE_CONFIG.retryDelay);
    } else {
      logger.error('[PerformanceMonitor] 性能数据上报重试次数已达上限');
      reportRetryCount = 0;
    }
  }
}

export function reportPerformanceImmediately() {
  if (performanceQueue.length > 0) {
    reportPerformanceData();
  }
}

export function getPerformanceQueue() {
  return [...performanceQueue];
}

export function clearPerformanceQueue() {
  performanceQueue = [];
}

export function getPerformanceSummary() {
  return {
    dataCount: performanceQueue.length,
    lastReport: performanceQueue[performanceQueue.length - 1],
    config: PERFORMANCE_CONFIG,
  };
}

export function getPerformanceStatistics() {
  const statistics = {
    total: performanceQueue.length,
    byType: {},
    apiRequests: {
      total: 0,
      success: 0,
      error: 0,
      avgDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      slowRequests: 0,
      verySlowRequests: 0,
    },
  };

  performanceQueue.forEach((metric) => {
    statistics.byType[metric.type] = (statistics.byType[metric.type] || 0) + 1;

    if (metric.type === 'api_request') {
      const { duration } = metric.metrics;
      statistics.apiRequests.total++;
      statistics.apiRequests.avgDuration += duration;
      statistics.apiRequests.maxDuration = Math.max(statistics.apiRequests.maxDuration, duration);
      statistics.apiRequests.minDuration = Math.min(statistics.apiRequests.minDuration, duration);

      if (metric.metrics.result === 'success') {
        statistics.apiRequests.success++;
      } else {
        statistics.apiRequests.error++;
      }

      if (duration > PERFORMANCE_CONFIG.verySlowRequestThreshold) {
        statistics.apiRequests.verySlowRequests++;
      } else if (duration > PERFORMANCE_CONFIG.slowRequestThreshold) {
        statistics.apiRequests.slowRequests++;
      }
    }
  });

  if (statistics.apiRequests.total > 0) {
    statistics.apiRequests.avgDuration /= statistics.apiRequests.total;
    if (statistics.apiRequests.minDuration === Infinity) {
      statistics.apiRequests.minDuration = 0;
    }
  }

  return statistics;
}

export function getPerformanceScore() {
  const statistics = getPerformanceStatistics();
  const scores = {
    overall: 0,
    apiPerformance: 0,
    pageLoadPerformance: 0,
  };

  if (statistics.apiRequests.total > 0) {
    const { avgDuration } = statistics.apiRequests;
    const slowRate = statistics.apiRequests.slowRequests / statistics.apiRequests.total;
    const errorRate = statistics.apiRequests.error / statistics.apiRequests.total;

    let apiScore = 100;
    apiScore -= Math.min(avgDuration / 100, 50);
    apiScore -= slowRate * 30;
    apiScore -= errorRate * 20;

    scores.apiPerformance = Math.max(0, Math.round(apiScore));
  }

  scores.overall = scores.apiPerformance;

  return scores;
}

export function exportPerformanceData() {
  return JSON.stringify(performanceQueue, null, 2);
}

export function destroyPerformanceMonitor() {
  logger.info('销毁性能监控');

  stopReportTimer();

  observers.forEach((observer) => {
    observer.disconnect();
  });
  observers.length = 0;

  if (performanceQueue.length > 0) {
    reportPerformanceData(true);
  }
}

export default {
  initPerformanceMonitor,
  capturePerformance,
  captureAPIPerformance,
  captureCustomMetric,
  markPerformance,
  measurePerformance,
  reportPerformanceImmediately,
  getPerformanceQueue,
  clearPerformanceQueue,
  getPerformanceSummary,
  getPerformanceStatistics,
  getPerformanceScore,
  exportPerformanceData,
  destroyPerformanceMonitor,
};
