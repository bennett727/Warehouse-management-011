/**
 * IndexedDB日志存储类
 *
 * 功能说明：
 * 使用IndexedDB替代localStorage存储日志，提供更大的存储空间和更好的查询性能
 *
 * 特性：
 * - 支持大量日志存储（默认10000条）
 * - 支持按时间、级别、模块查询
 * - 自动清理过期日志
 * - 异步操作，不阻塞主线程
 *
 * @author 前端开发团队
 * @version 1.0
 * @since 2026-02-19
 */

const DB_NAME = 'WMS_LOGS';
const DB_VERSION = 1;
const STORE_NAME = 'logs';
const MAX_RECORDS = 10000;
const MAX_AGE_DAYS = 7;

class LogStorage {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.pendingLogs = [];
  }

  async init() {
    if (this.isInitialized) {
      return true;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[LogStorage] IndexedDB打开失败:', request.error);
        this.isInitialized = false;
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('[LogStorage] IndexedDB初始化成功');
        this._flushPendingLogs();
        this._cleanupOldLogs();
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });

          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('level', 'level', { unique: false });
          store.createIndex('module', 'module', { unique: false });
          store.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };
    });
  }

  /**
   * 安全序列化任意值，确保可被IndexedDB结构化克隆
   * @param {any} value - 需要序列化的值
   * @param {number} depth - 当前递归深度
   * @returns {any} 可序列化的值
   */
  _safeSerialize(value, depth = 0) {
    if (depth > 5) {
      return String(value);
    }

    if (value === null || value === undefined) {
      return value;
    }

    const type = typeof value;

    if (type === 'string' || type === 'number' || type === 'boolean') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (type === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }

    if (type === 'symbol') {
      return value.toString();
    }

    if (type === 'object') {
      if (Array.isArray(value)) {
        return value.map((item) => this._safeSerialize(item, depth + 1));
      }

      if (value instanceof Map || value instanceof Set || value instanceof WeakMap || value instanceof WeakSet) {
        return `[${value.constructor.name}]`;
      }

      if (value instanceof ArrayBuffer || value instanceof DataView) {
        return `[${value.constructor.name}]`;
      }

      if (
        typeof window !== 'undefined' &&
        (value instanceof Window || value instanceof Document || value instanceof Element)
      ) {
        return `[DOM ${value.constructor.name}]`;
      }

      try {
        const result = {};
        for (const key of Object.keys(value)) {
          try {
            result[key] = this._safeSerialize(value[key], depth + 1);
          } catch (_e) {
            result[key] = `[Unable to serialize: ${_e.message}]`;
          }
        }
        return result;
      } catch (_e) {
        return `[Object: ${String(value)}]`;
      }
    }

    return String(value);
  }

  /**
   * 序列化日志条目，确保数据可被IndexedDB结构化克隆
   * @param {Object} logEntry - 原始日志条目
   * @returns {Object} 可序列化的日志条目
   */
  _serializeEntry(logEntry) {
    try {
      const serialized = {
        timestamp: logEntry.timestamp || Date.now(),
        sessionId: this._getSessionId(),
        level: logEntry.level,
        module: logEntry.module,
        message: typeof logEntry.message === 'string' ? logEntry.message : String(logEntry.message),
      };

      if (logEntry.data !== undefined) {
        serialized.data = this._safeSerialize(logEntry.data);
      }

      if (logEntry.error) {
        serialized.error = this._safeSerialize(logEntry.error);
      }

      if (logEntry.isoTimestamp) {
        serialized.isoTimestamp = logEntry.isoTimestamp;
      }

      if (logEntry.userAgent) {
        serialized.userAgent = logEntry.userAgent;
      }

      if (logEntry.url) {
        serialized.url = logEntry.url;
      }

      return serialized;
    } catch (e) {
      return {
        timestamp: Date.now(),
        sessionId: this._getSessionId(),
        level: logEntry.level || 'info',
        module: logEntry.module || 'unknown',
        message: 'Failed to serialize log entry',
        originalError: String(e),
      };
    }
  }

  async addLog(logEntry) {
    const entry = this._serializeEntry(logEntry);

    if (!this.isInitialized || !this.db) {
      this.pendingLogs.push(entry);
      if (this.pendingLogs.length > 100) {
        this.pendingLogs.shift();
      }
      return;
    }

    try {
      await this._addToStore(entry);
      await this._checkAndCleanup();
    } catch (error) {
      console.error('[LogStorage] 添加日志失败:', error);
    }
  }

  async _addToStore(entry) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLogs(options = {}) {
    if (!this.isInitialized || !this.db) {
      return [];
    }

    const { level, module, startTime, endTime, limit = 100, offset = 0 } = options;

    return new Promise((resolve, _reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const results = [];
      let skipped = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor && results.length < limit) {
          const log = cursor.value;

          let matches = true;

          if (level && log.level !== level) {
            matches = false;
          }

          if (module && log.module !== module) {
            matches = false;
          }

          if (startTime && log.timestamp < startTime) {
            matches = false;
          }

          if (endTime && log.timestamp > endTime) {
            matches = false;
          }

          if (matches) {
            if (skipped >= offset) {
              results.push(log);
            } else {
              skipped++;
            }
          }

          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        console.error('[LogStorage] 查询日志失败:', request.error);
        resolve([]);
      };
    });
  }

  async getLogStats() {
    if (!this.isInitialized || !this.db) {
      return null;
    }

    return new Promise((resolve, _reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      const stats = {
        total: 0,
        byLevel: {},
        byModule: {},
        byHour: {},
        oldestTimestamp: null,
        newestTimestamp: null,
      };

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          const log = cursor.value;
          stats.total++;

          if (!stats.byLevel[log.level]) {
            stats.byLevel[log.level] = 0;
          }
          stats.byLevel[log.level]++;

          if (log.module) {
            if (!stats.byModule[log.module]) {
              stats.byModule[log.module] = 0;
            }
            stats.byModule[log.module]++;
          }

          const hour = new Date(log.timestamp).getHours();
          if (!stats.byHour[hour]) {
            stats.byHour[hour] = 0;
          }
          stats.byHour[hour]++;

          if (!stats.oldestTimestamp || log.timestamp < stats.oldestTimestamp) {
            stats.oldestTimestamp = log.timestamp;
          }
          if (!stats.newestTimestamp || log.timestamp > stats.newestTimestamp) {
            stats.newestTimestamp = log.timestamp;
          }

          cursor.continue();
        } else {
          resolve(stats);
        }
      };

      request.onerror = () => {
        console.error('[LogStorage] 获取统计失败:', request.error);
        resolve(null);
      };
    });
  }

  async clearLogs() {
    if (!this.isInitialized || !this.db) {
      return false;
    }

    return new Promise((resolve, _reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[LogStorage] 日志已清空');
        resolve(true);
      };

      request.onerror = () => {
        console.error('[LogStorage] 清空日志失败:', request.error);
        resolve(false);
      };
    });
  }

  async exportLogs(format = 'json') {
    const logs = await this.getLogs({ limit: MAX_RECORDS });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'module', 'message', 'data', 'error'];
      const rows = logs.map((log) =>
        headers.map((h) => {
          const value = log[h];
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return String(value || '');
        })
      );

      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (format === 'excel') {
      return this._generateExcelData(logs);
    }

    if (format === 'html') {
      return this._generateHtmlReport(logs);
    }

    return logs;
  }

  _generateExcelData(logs) {
    const headers = ['时间戳', '级别', '模块', '消息', '数据', '错误'];
    const rows = logs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.level || '',
      log.module || '',
      (log.message || '').replace(/"/g, '""'),
      log.data ? JSON.stringify(log.data).replace(/"/g, '""') : '',
      log.error ? String(log.error).replace(/"/g, '""') : '',
    ]);

    const csvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    return csvContent;
  }

  _generateHtmlReport(logs) {
    const stats = this._calculateStats(logs);

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>WMS日志报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #333; border-bottom: 2px solid #409eff; padding-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #409eff; }
        .stat-label { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f5f7fa; font-weight: bold; }
        .level-DEBUG { color: #909399; }
        .level-INFO { color: #67c23a; }
        .level-WARN { color: #e6a23c; }
        .level-ERROR { color: #f56c6c; }
        .level-FATAL { color: #f56c6c; font-weight: bold; }
        .timestamp { white-space: nowrap; color: #666; }
        .message { max-width: 400px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <h1>WMS仓库管理系统 - 日志报告</h1>
        <p>生成时间: ${new Date().toLocaleString()}</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">总日志数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.errors}</div>
                <div class="stat-label">错误数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.warnings}</div>
                <div class="stat-label">警告数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.info}</div>
                <div class="stat-label">信息数</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>时间</th>
                    <th>级别</th>
                    <th>模块</th>
                    <th>消息</th>
                </tr>
            </thead>
            <tbody>
                ${logs
                  .slice(0, 500)
                  .map(
                    (log) => `
                <tr>
                    <td class="timestamp">${new Date(log.timestamp).toLocaleString()}</td>
                    <td class="level-${log.level}">${log.level}</td>
                    <td>${log.module || '-'}</td>
                    <td class="message">${this._escapeHtml(log.message || '')}</td>
                </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
  }

  _calculateStats(logs) {
    return {
      total: logs.length,
      errors: logs.filter((l) => l.level === 'ERROR' || l.level === 'FATAL').length,
      warnings: logs.filter((l) => l.level === 'WARN').length,
      info: logs.filter((l) => l.level === 'INFO').length,
    };
  }

  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  downloadLogs(format = 'json') {
    this.exportLogs(format).then((content) => {
      let mimeType;
      let extension;

      if (format === 'html') {
        mimeType = 'text/html';
        extension = 'html';
      } else if (format === 'csv') {
        mimeType = 'text/csv';
        extension = 'csv';
      } else {
        mimeType = 'application/json';
        extension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wms-logs-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  async _checkAndCleanup() {
    const count = await this._getCount();

    if (count > MAX_RECORDS) {
      await this._removeOldest(count - MAX_RECORDS);
    }
  }

  async _getCount() {
    return new Promise((resolve, _reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }

  async _removeOldest(count) {
    return new Promise((resolve, _reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor();

      let deleted = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor && deleted < count) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };

      request.onerror = () => resolve(0);
    });
  }

  async _cleanupOldLogs() {
    const cutoffTime = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    return new Promise((resolve, _reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      let deleted = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          if (deleted > 0) {
            console.log(`[LogStorage] 清理了 ${deleted} 条过期日志`);
          }
          resolve(deleted);
        }
      };

      request.onerror = () => resolve(0);
    });
  }

  async _flushPendingLogs() {
    if (this.pendingLogs.length === 0) {
      return;
    }

    const logs = [...this.pendingLogs];
    this.pendingLogs = [];

    for (const log of logs) {
      await this.addLog(log);
    }
  }

  _getSessionId() {
    let sessionId = sessionStorage.getItem('log_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('log_session_id', sessionId);
    }
    return sessionId;
  }
}

const logStorage = new LogStorage();

export const initLogStorage = async () => {
  return await logStorage.init();
};

export const addLog = async (logEntry) => {
  return await logStorage.addLog(logEntry);
};

export const getLogs = async (options) => {
  return await logStorage.getLogs(options);
};

export const getLogStats = async () => {
  return await logStorage.getLogStats();
};

export const clearLogs = async () => {
  return await logStorage.clearLogs();
};

export const exportLogs = async (format) => {
  return await logStorage.exportLogs(format);
};

export const downloadLogs = (format) => {
  return logStorage.downloadLogs(format);
};

export default logStorage;
