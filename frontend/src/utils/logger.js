/**
 * 日志记录工具类
 * 提供统一的日志记录功能，支持不同级别的日志输出
 */

import { addLog as addToIndexedDB, initLogStorage } from './logStorage';

/**
 * 日志级别枚举
 */
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',
};

/**
 * 日志配置
 */
export const LogConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  storageKey: 'app_logs',
  maxLogs: 100,
  enableRemote: false,
  remoteUrl: null,
  useIndexedDB: true,
};

let indexedDBInitialized = false;

initLogStorage().then((success) => {
  indexedDBInitialized = success;
});

/**
 * 日志记录器类
 */
class Logger {
  constructor(moduleName) {
    this.moduleName = moduleName;
  }

  /**
   * 记录调试信息
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  debug(message, data = null) {
    this._log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  info(message, data = null) {
    this._log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  warn(message, data = null) {
    this._log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误
   * @param {string} message - 日志消息
   * @param {Error|Object} error - 错误对象
   * @param {Object} data - 附加数据
   */
  error(message, error = null, data = null) {
    this._log(LogLevel.ERROR, message, data, error);
  }

  /**
   * 记录致命错误
   * @param {string} message - 日志消息
   * @param {Error|Object} error - 错误对象
   * @param {Object} data - 附加数据
   */
  fatal(message, error = null, data = null) {
    this._log(LogLevel.FATAL, message, data, error);
  }

  /**
   * 内部日志记录方法
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Error|Object} error - 错误对象
   */
  _log(level, message, data = null, error = null) {
    if (!this._shouldLog(level)) {
      return;
    }

    const logEntry = this._createLogEntry(level, message, data, error);

    if (LogConfig.enableConsole) {
      this._logToConsole(logEntry);
    }

    if (LogConfig.enableStorage) {
      this._logToStorage(logEntry);
    }

    if (LogConfig.enableRemote && LogConfig.remoteUrl) {
      this._logToRemote(logEntry);
    }
  }

  /**
   * 判断是否应该记录日志
   * @param {string} level - 日志级别
   * @returns {boolean} 是否应该记录
   */
  _shouldLog(level) {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(LogConfig.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * 创建日志条目
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   * @param {Error|Object} error - 错误对象
   * @returns {Object} 日志条目
   */
  _createLogEntry(level, message, data = null, error = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (data) {
      entry.data = data;
    }

    if (error) {
      entry.error = this._formatError(error);
    }

    return entry;
  }

  /**
   * 格式化错误对象
   * @param {Error|Object} error - 错误对象
   * @returns {Object} 格式化后的错误信息
   */
  _formatError(error) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    if (typeof error === 'object') {
      return error;
    }
    return { message: String(error) };
  }

  /**
   * 输出到控制台
   * @param {Object} logEntry - 日志条目
   */
  _logToConsole(logEntry) {
    const { level, timestamp, module, message, data, error } = logEntry;
    const prefix = `[${timestamp}] [${level}] [${module}]`;

    const args = [prefix, message];
    if (data !== null && data !== undefined) {
      args.push(data);
    }
    if (error !== null && error !== undefined) {
      args.push(error);
    }

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(...args);
        break;
      default:
        console.log(...args);
    }
  }

  /**
   * 保存到本地存储
   * @param {Object} logEntry - 日志条目
   */
  _logToStorage(logEntry) {
    if (LogConfig.useIndexedDB && indexedDBInitialized) {
      addToIndexedDB({
        ...logEntry,
        timestamp: Date.now(),
        isoTimestamp: logEntry.timestamp,
      }).catch(() => {
        this._logToLocalStorage(logEntry);
      });
    } else {
      this._logToLocalStorage(logEntry);
    }
  }

  /**
   * 保存到localStorage（降级方案）
   * @param {Object} logEntry - 日志条目
   */
  _logToLocalStorage(logEntry) {
    try {
      const logs = this._getStoredLogs();
      logs.push(logEntry);

      if (logs.length > LogConfig.maxLogs) {
        logs.shift();
      }

      localStorage.setItem(LogConfig.storageKey, JSON.stringify(logs));
    } catch (e) {
      // 静默处理localStorage保存失败
    }
  }

  /**
   * 获取存储的日志
   * @returns {Array} 日志数组
   */
  _getStoredLogs() {
    try {
      const logs = localStorage.getItem(LogConfig.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 发送到远程服务器
   * @param {Object} logEntry - 日志条目
   */
  async _logToRemote(logEntry) {
    try {
      await fetch(LogConfig.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (e) {
      // 静默处理远程日志发送失败
    }
  }
}

/**
 * 创建日志记录器实例
 * @param {string} moduleName - 模块名称
 * @returns {Logger} 日志记录器实例
 */
export const createLogger = (moduleName) => {
  return new Logger(moduleName);
};

/**
 * 配置日志系统
 * @param {Object} config - 配置对象
 */
export const configureLogger = (config) => {
  Object.assign(LogConfig, config);
};

/**
 * 获取所有日志
 * @param {Object} options - 查询选项
 * @returns {Promise<Array>} 日志数组
 */
export const getAllLogs = async (options = {}) => {
  if (LogConfig.useIndexedDB && indexedDBInitialized) {
    const { getLogs } = await import('./logStorage');
    return await getLogs(options);
  }
  try {
    const logs = localStorage.getItem(LogConfig.storageKey);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    return [];
  }
};

/**
 * 清除所有日志
 */
export const clearLogs = async () => {
  if (LogConfig.useIndexedDB && indexedDBInitialized) {
    const { clearLogs: clearIndexedDBLogs } = await import('./logStorage');
    return await clearIndexedDBLogs();
  }
  try {
    localStorage.removeItem(LogConfig.storageKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 导出日志
 * @param {string} format - 导出格式 ('json' | 'csv')
 * @returns {Promise<string>} 日志字符串
 */
export const exportLogs = async (format = 'json') => {
  if (LogConfig.useIndexedDB && indexedDBInitialized) {
    const { exportLogs: exportIndexedDBLogs } = await import('./logStorage');
    return await exportIndexedDBLogs(format);
  }
  const logs = await getAllLogs();
  return JSON.stringify(logs, null, 2);
};

/**
 * 获取日志统计信息
 * @returns {Promise<Object|null>} 统计信息
 */
export const getLogStats = async () => {
  if (LogConfig.useIndexedDB && indexedDBInitialized) {
    const { getLogStats: getIndexedDBStats } = await import('./logStorage');
    return await getIndexedDBStats();
  }
  return null;
};

export default Logger;
