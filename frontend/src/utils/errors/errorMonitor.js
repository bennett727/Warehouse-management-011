import { createLogger } from '../logger';

import { parseErrorPosition } from './sourceMapParser';

const logger = createLogger('ErrorMonitor');

const ERROR_LOG_CONFIG = {
  MAX_LOG_SIZE: 100,
  MAX_LOG_AGE: 24 * 60 * 60 * 1000,
  ENABLE_LOGGING: true,
  ENABLE_REPORTING: false,
  REPORT_ENDPOINT: '/api/logs/error',
  ENABLE_SOURCEMAP_PARSING: true,
};

class ErrorMonitor {
  constructor() {
    this.errorQueue = [];
    this.errorLogs = [];
    this.maxQueueSize = 100;
    this.reportUrl = '/error-report';
    this.reportInterval = 30000;
    this.isReporting = false;
    this.errorStats = new Map();
    this.sessionId = this.generateSessionId();
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.cleanupOldLogs();
    this.startPeriodicReport();
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', async (event) => {
        const errorInfo = {
          type: 'runtime',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: new Date().toISOString(),
        };

        if (ERROR_LOG_CONFIG.ENABLE_SOURCEMAP_PARSING) {
          const originalPosition = await parseErrorPosition(errorInfo);
          if (originalPosition) {
            errorInfo.originalPosition = originalPosition;
            errorInfo.originalSource = originalPosition.source;
            errorInfo.originalLine = originalPosition.line;
            errorInfo.originalColumn = originalPosition.column;
          }
        }

        this.captureError(errorInfo);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          type: 'promise',
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLogId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    const { sessionId: instanceSessionId } = this;
    if (!sessionId) {
      sessionId = instanceSessionId;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  captureError(errorInfo) {
    const error = {
      ...errorInfo,
      id: this.generateErrorId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    this.errorQueue.push(error);
    this.updateErrorStats(error);
    this.logError(errorInfo);

    if (this.errorQueue.length >= this.maxQueueSize) {
      this.reportErrors();
    }
  }

  captureApiError(error, context) {
    const errorInfo = {
      type: 'api',
      message: error.message || 'API Error',
      code: error.code || error.response?.data?.code,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      responseData: error.response?.data,
      context,
      timestamp: new Date().toISOString(),
    };

    this.captureError(errorInfo);
  }

  captureNetworkError(error, config) {
    const errorInfo = {
      type: 'network',
      message: error.message || 'Network Error',
      code: error.code,
      url: config?.url,
      method: config?.method,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    this.captureError(errorInfo);
  }

  captureBusinessError(errorCode, message, context) {
    const errorInfo = {
      type: 'business',
      message: message || 'Business Error',
      code: errorCode,
      context,
      timestamp: new Date().toISOString(),
    };

    this.captureError(errorInfo);
  }

  updateErrorStats(error) {
    const key = `${error.type}_${error.code || 'unknown'}`;
    const current = this.errorStats.get(key) || {
      count: 0,
      firstOccurrence: error.timestamp,
      lastOccurrence: error.timestamp,
    };

    current.count++;
    current.lastOccurrence = error.timestamp;
    this.errorStats.set(key, current);
  }

  async reportErrors() {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;
    const errorsToReport = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch(this.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToReport,
          stats: this.getErrorStatsSummary(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      logger.error('Failed to report errors:', error);
      this.errorQueue.unshift(...errorsToReport);
    } finally {
      this.isReporting = false;
    }
  }

  startPeriodicReport() {
    setInterval(() => {
      this.reportErrors();
    }, this.reportInterval);
  }

  getErrorStatsSummary() {
    const summary = {};
    this.errorStats.forEach((value, key) => {
      summary[key] = value;
    });
    return summary;
  }

  getErrorStats() {
    return this.getErrorStatsSummary();
  }

  getErrorCountByCode(errorCode) {
    const key = `business_${errorCode}`;
    return this.errorStats.get(key)?.count || 0;
  }

  getTopErrors(limit = 10) {
    const sorted = Array.from(this.errorStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit);

    return sorted.map(([key, value]) => ({
      key,
      ...value,
    }));
  }

  clearErrorStats() {
    this.errorStats.clear();
  }

  clearErrorQueue() {
    this.errorQueue = [];
  }

  logError(errorInfo) {
    if (!ERROR_LOG_CONFIG.ENABLE_LOGGING) {
      return;
    }

    const logEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...errorInfo,
    };

    this.errorLogs.push(logEntry);
    this.cleanupOldLogs();

    if (this.errorLogs.length > ERROR_LOG_CONFIG.MAX_LOG_SIZE) {
      this.errorLogs.shift();
    }

    this.saveToStorage();

    if (ERROR_LOG_CONFIG.ENABLE_REPORTING) {
      this.reportError(logEntry);
    }
  }

  cleanupOldLogs() {
    const now = Date.now();
    this.errorLogs = this.errorLogs.filter((log) => {
      return now - log.timestamp < ERROR_LOG_CONFIG.MAX_LOG_AGE;
    });
  }

  saveToStorage() {
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.errorLogs));
    } catch (error) {
      logger.warn('保存错误日志失败', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('error_logs');
      if (stored) {
        this.errorLogs = JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('加载错误日志失败', error);
    }
  }

  async reportError(logEntry) {
    try {
      const response = await fetch(ERROR_LOG_CONFIG.REPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });

      if (!response.ok) {
        logger.warn('上报错误日志失败', response.status);
      }
    } catch (error) {
      logger.warn('上报错误日志异常', error);
    }
  }

  getErrorLogs(filters = {}) {
    let logs = [...this.errorLogs];

    if (filters.type) {
      logs = logs.filter((log) => log.type === filters.type);
    }

    if (filters.startTime) {
      logs = logs.filter((log) => log.timestamp >= filters.startTime);
    }

    if (filters.endTime) {
      logs = logs.filter((log) => log.timestamp <= filters.endTime);
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  getErrorLogStats() {
    const stats = {
      total: this.errorLogs.length,
      byType: {},
      byHour: {},
      recentErrors: [],
    };

    this.errorLogs.forEach((log) => {
      if (!stats.byType[log.type]) {
        stats.byType[log.type] = 0;
      }
      stats.byType[log.type]++;

      const hour = new Date(log.timestamp).getHours();
      if (!stats.byHour[hour]) {
        stats.byHour[hour] = 0;
      }
      stats.byHour[hour]++;
    });

    stats.recentErrors = this.errorLogs.slice(-10).reverse();

    return stats;
  }

  clearLogs() {
    this.errorLogs = [];
    this.saveToStorage();
  }

  exportLogs() {
    return JSON.stringify(this.errorLogs, null, 2);
  }
}

const errorMonitor = new ErrorMonitor();

export const initErrorMonitor = (config = {}) => {
  if (config.enabled !== false) {
    errorMonitor.reportUrl = config.reportUrl || '/error-report';
    errorMonitor.maxQueueSize = config.batchSize || 100;
    errorMonitor.reportInterval = config.reportInterval || 30000;
    logger.debug('[ErrorMonitor] Initialized with config:', config);
  }
};

export const logApiError = (apiName, error, context = {}) => {
  errorMonitor.logError({
    type: 'api',
    apiName,
    message: error.message || String(error),
    status: error.response?.status,
    code: error.code,
    stack: error.stack,
    context,
  });
};

export const logBusinessError = (operation, error, context = {}) => {
  errorMonitor.logError({
    type: 'business',
    operation,
    message: error.message || String(error),
    code: error.code,
    stack: error.stack,
    context,
  });
};

export const logUiError = (component, error, context = {}) => {
  errorMonitor.logError({
    type: 'ui',
    component,
    message: error.message || String(error),
    stack: error.stack,
    context,
  });
};

export const logNetworkError = (url, error, context = {}) => {
  errorMonitor.logError({
    type: 'network',
    url,
    message: error.message || String(error),
    code: error.code,
    context,
  });
};

export const captureNetworkError = (error, config) => {
  errorMonitor.captureNetworkError(error, config);
};

export const getErrorLogs = (filters) => {
  return errorMonitor.getErrorLogs(filters);
};

export const getErrorLogStats = () => {
  return errorMonitor.getErrorLogStats();
};

export const clearErrorLogs = () => {
  errorMonitor.clearLogs();
};

export const exportErrorLogs = () => {
  return errorMonitor.exportLogs();
};

export const useErrorMonitor = () => {
  const captureApiError = (error, context) => {
    errorMonitor.captureApiError(error, context);
  };

  const captureNetworkError = (error, config) => {
    errorMonitor.captureNetworkError(error, config);
  };

  const captureBusinessError = (errorCode, message, context) => {
    errorMonitor.captureBusinessError(errorCode, message, context);
  };

  const getErrorStats = () => {
    return errorMonitor.getErrorStats();
  };

  const getTopErrors = (limit) => {
    return errorMonitor.getTopErrors(limit);
  };

  return {
    captureApiError,
    captureNetworkError,
    captureBusinessError,
    getErrorStats,
    getTopErrors,
  };
};

export default errorMonitor;
