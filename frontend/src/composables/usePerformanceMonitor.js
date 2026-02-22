import logger from '@/utils/logger';

/**
 * 获取性能评分
 * @param {number} value - 性能指标值
 * @param {number} goodThreshold - 良好阈值
 * @param {number} poorThreshold - 较差阈值
 * @returns {string} - 'good' | 'needs-improvement' | 'poor'
 */
const getPerformanceScore = (value, goodThreshold, poorThreshold) => {
  if (value < goodThreshold) {
    return 'good';
  }
  if (value < poorThreshold) {
    return 'needs-improvement';
  }
  return 'poor';
};

export function usePerformanceMonitor() {
  const measurePageLoad = () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    const firstPaint = perfData.responseStart - perfData.navigationStart;
    const firstContentfulPaint = perfData.domInteractive - perfData.navigationStart;

    return {
      pageLoadTime,
      domReadyTime,
      firstPaint,
      firstContentfulPaint,
    };
  };

  const measureResourceTiming = () => {
    const resources = window.performance.getEntriesByType('resource');
    return resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: resource.initiatorType,
    }));
  };

  const measureLCP = () => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.renderTime || lastEntry.loadTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });
  };

  const measureFID = () => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          resolve(entry.processingStart - entry.startTime);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    });
  };

  const measureCLS = () => {
    let clsValue = 0;
    let observer = null;

    if ('LayoutShift' in window) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }

    return {
      getValue: () => clsValue,
      disconnect: () => observer?.disconnect(),
    };
  };

  const measureTTFB = () => {
    const perfData = window.performance.timing;
    return perfData.responseStart - perfData.navigationStart;
  };

  const generatePerformanceReport = async () => {
    const pageMetrics = measurePageLoad();
    const resourceMetrics = measureResourceTiming();
    const lcp = await measureLCP();
    const fid = await measureFID();
    const cls = measureCLS();
    const ttfb = measureTTFB();

    const report = {
      timestamp: new Date().toISOString(),
      pageMetrics: {
        ...pageMetrics,
        lcp,
        fid,
        cls: cls.getValue(),
        ttfb,
      },
      resourceMetrics: {
        totalResources: resourceMetrics.length,
        slowResources: resourceMetrics.filter((r) => r.duration > 1000),
        largeResources: resourceMetrics.filter((r) => r.size > 1024 * 1024),
      },
      scores: {
        lcp: getPerformanceScore(lcp, 2500, 4000),
        fid: getPerformanceScore(fid, 100, 300),
        cls: getPerformanceScore(cls.getValue(), 0.1, 0.25),
        ttfb: getPerformanceScore(ttfb, 600, 1500),
      },
    };

    cls.disconnect();
    return report;
  };

  const sendPerformanceReport = async (report) => {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(report)], { type: 'application/json' });
        navigator.sendBeacon('/performance-report', blob);
      } else {
        await fetch('/performance-report', {
          method: 'POST',
          body: JSON.stringify(report),
          keepalive: true,
        });
      }
    } catch (error) {
      logger.error('Failed to send performance report:', error);
    }
  };

  const startPerformanceMonitoring = () => {
    window.addEventListener('load', async () => {
      setTimeout(async () => {
        const report = await generatePerformanceReport();
        logger.debug('Performance Report:', report);
        await sendPerformanceReport(report);
      }, 0);
    });
  };

  return {
    measurePageLoad,
    measureResourceTiming,
    measureLCP,
    measureFID,
    measureCLS,
    measureTTFB,
    generatePerformanceReport,
    sendPerformanceReport,
    startPerformanceMonitoring,
  };
}
