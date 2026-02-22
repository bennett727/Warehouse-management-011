/**
 * 工作流上下文管理器
 * 用于管理跨模块的数据传递和默认值设置
 */

import { createLogger } from './logger';

const logger = createLogger('WorkflowContext');

// 存储键名
const STORAGE_KEY = 'workflow_context';
const HISTORY_KEY = 'workflow_history';

/**
 * 工作流上下文管理器
 */
class WorkflowContextManager {
  constructor() {
    this.context = this.loadContext();
    this.history = this.loadHistory();
  }

  // ========== 上下文管理 ==========

  loadContext() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('加载工作流上下文失败:', error);
      return {};
    }
  }

  saveContext() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.context));
    } catch (error) {
      logger.error('保存工作流上下文失败:', error);
    }
  }

  /**
   * 设置上下文值
   * @param {string} key - 键名
   * @param {*} value - 值
   * @param {Object} options - 选项
   * @param {string} options.module - 所属模块
   * @param {number} options.expires - 过期时间（毫秒）
   */
  set(key, value, options = {}) {
    this.context[key] = {
      value,
      module: options.module || 'global',
      timestamp: Date.now(),
      expires: options.expires || null,
    };
    this.saveContext();
    logger.debug(`设置上下文: ${key}`, value);
  }

  /**
   * 获取上下文值
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 值
   */
  get(key, defaultValue = null) {
    const item = this.context[key];

    if (!item) {
      return defaultValue;
    }

    // 检查是否过期
    if (item.expires && Date.now() - item.timestamp > item.expires) {
      this.remove(key);
      return defaultValue;
    }

    return item.value;
  }

  /**
   * 移除上下文值
   * @param {string} key - 键名
   */
  remove(key) {
    delete this.context[key];
    this.saveContext();
  }

  /**
   * 获取模块相关的上下文
   * @param {string} module - 模块名
   * @returns {Object} 上下文对象
   */
  getByModule(module) {
    const result = {};
    for (const [key, item] of Object.entries(this.context)) {
      if (item.module === module) {
        result[key] = item.value;
      }
    }
    return result;
  }

  /**
   * 清理过期数据
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of Object.entries(this.context)) {
      if (item.expires && now - item.timestamp > item.expires) {
        delete this.context[key];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.saveContext();
      logger.debug(`清理了 ${cleaned} 个过期上下文项`);
    }
  }

  /**
   * 清空上下文
   */
  clear() {
    this.context = {};
    this.saveContext();
  }

  // ========== 智能默认值 ==========

  /**
   * 获取智能默认值
   * 优先顺序：URL参数 > 上下文 > 历史记录 > 系统默认
   * @param {string} key - 键名
   * @param {Object} options - 选项
   * @returns {*} 默认值
   */
  getSmartDefault(key, options = {}) {
    const { urlParam = null, contextKey = key, historyKey = key, defaultValue = null, transform = null } = options;

    let value = null;

    // 1. 从URL参数获取
    if (urlParam) {
      const urlValue = this.getUrlParam(urlParam);
      if (urlValue !== null) {
        value = urlValue;
        logger.debug(`从URL参数获取默认值: ${key} = ${value}`);
      }
    }

    // 2. 从上下文获取
    if (value === null) {
      value = this.get(contextKey);
      if (value !== null) {
        logger.debug(`从上下文获取默认值: ${key} = ${value}`);
      }
    }

    // 3. 从历史记录获取
    if (value === null && historyKey) {
      value = this.getLastUsed(historyKey);
      if (value !== null) {
        logger.debug(`从历史记录获取默认值: ${key} = ${value}`);
      }
    }

    // 4. 使用系统默认值
    if (value === null) {
      value = defaultValue;
    }

    // 应用转换函数
    if (transform && value !== null) {
      value = transform(value);
    }

    return value;
  }

  /**
   * 获取URL参数
   * @param {string} name - 参数名
   * @returns {string|null} 参数值
   */
  getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // ========== 历史记录管理 ==========

  loadHistory() {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('加载历史记录失败:', error);
      return {};
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      logger.error('保存历史记录失败:', error);
    }
  }

  /**
   * 记录使用历史
   * @param {string} key - 键名
   * @param {*} value - 值
   * @param {Object} options - 选项
   */
  recordUse(key, value, options = {}) {
    const { maxHistory = 10, metadata = {} } = options;

    if (!this.history[key]) {
      this.history[key] = [];
    }

    // 移除重复项
    this.history[key] = this.history[key].filter((item) => {
      if (typeof value === 'object') {
        return JSON.stringify(item.value) !== JSON.stringify(value);
      }
      return item.value !== value;
    });

    // 添加到开头
    this.history[key].unshift({
      value,
      timestamp: Date.now(),
      metadata,
    });

    // 限制数量
    if (this.history[key].length > maxHistory) {
      this.history[key] = this.history[key].slice(0, maxHistory);
    }

    this.saveHistory();
    logger.debug(`记录使用历史: ${key}`, value);
  }

  /**
   * 获取最近使用的值
   * @param {string} key - 键名
   * @returns {*} 最近使用的值
   */
  getLastUsed(key) {
    const history = this.history[key];
    if (history && history.length > 0) {
      return history[0].value;
    }
    return null;
  }

  /**
   * 获取使用历史列表
   * @param {string} key - 键名
   * @param {number} limit - 限制数量
   * @returns {Array} 历史记录列表
   */
  getHistory(key, limit = 5) {
    const history = this.history[key] || [];
    return history.slice(0, limit);
  }

  /**
   * 获取常用值（按使用频率排序）
   * @param {string} key - 键名
   * @param {number} limit - 限制数量
   * @returns {Array} 常用值列表
   */
  getFrequentlyUsed(key, limit = 5) {
    const history = this.history[key] || [];

    // 统计频率
    const frequency = {};
    history.forEach((item) => {
      const valueKey = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value);

      if (!frequency[valueKey]) {
        frequency[valueKey] = { value: item.value, count: 0 };
      }
      frequency[valueKey].count++;
    });

    // 按频率排序
    return Object.values(frequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => item.value);
  }

  /**
   * 清空历史记录
   * @param {string} key - 键名，为空则清空所有
   */
  clearHistory(key = null) {
    if (key) {
      delete this.history[key];
    } else {
      this.history = {};
    }
    this.saveHistory();
  }
}

// 创建单例实例
const workflowContext = new WorkflowContextManager();

// 命名导出
export { workflowContext };

// ========== 快捷方法 ==========

/**
 * 设置上下文（快捷方法）
 */
export const setContext = (key, value, options) => {
  workflowContext.set(key, value, options);
};

/**
 * 获取上下文（快捷方法）
 */
export const getContext = (key, defaultValue) => {
  return workflowContext.get(key, defaultValue);
};

/**
 * 获取智能默认值（快捷方法）
 */
export const getSmartDefault = (key, options) => {
  return workflowContext.getSmartDefault(key, options);
};

/**
 * 记录使用历史（快捷方法）
 */
export const recordUse = (key, value, options) => {
  workflowContext.recordUse(key, value, options);
};

/**
 * 获取最近使用（快捷方法）
 */
export const getLastUsed = (key) => {
  return workflowContext.getLastUsed(key);
};

/**
 * 获取使用历史（快捷方法）
 */
export const getHistory = (key, limit) => {
  return workflowContext.getHistory(key, limit);
};

// ========== 业务专用方法 ==========

/**
 * 设置创建行政区划的上下文
 */
export const setDivisionContext = (division) => {
  setContext('lastCreatedDivision', division, { module: 'division' });
  recordUse('division', division.id, { metadata: { name: division.name, level: division.level } });
};

/**
 * 获取创建仓库的默认值
 */
export const getWarehouseDefaults = () => {
  return {
    provinceId: getSmartDefault('provinceId', {
      urlParam: 'provinceId',
      contextKey: 'lastCreatedDivision',
      transform: (v) => (v?.level === 1 ? v.id : null),
    }),
    cityId: getSmartDefault('cityId', {
      urlParam: 'cityId',
      contextKey: 'lastCreatedDivision',
      transform: (v) => (v?.level === 2 ? v.id : null),
    }),
    districtId: getSmartDefault('districtId', {
      urlParam: 'districtId',
      contextKey: 'lastCreatedDivision',
      transform: (v) => (v?.level === 3 ? v.id : null),
    }),
  };
};

/**
 * 设置创建仓库的上下文
 */
export const setWarehouseContext = (warehouse) => {
  setContext('lastCreatedWarehouse', warehouse, { module: 'warehouse' });
  recordUse('warehouse', warehouse.id, { metadata: { name: warehouse.warehouseName } });
};

/**
 * 获取创建功能区的默认值
 */
export const getZoneDefaults = () => {
  return {
    warehouseId: getSmartDefault('warehouseId', {
      urlParam: 'warehouseId',
      contextKey: 'lastCreatedWarehouse',
      transform: (v) => (typeof v === 'object' ? v.id : v),
    }),
  };
};

/**
 * 设置创建功能区的上下文
 */
export const setZoneContext = (zone) => {
  setContext('lastCreatedZone', zone, { module: 'zone' });
  recordUse('zone', zone.id, { metadata: { name: zone.name, warehouseId: zone.warehouseId } });
};

/**
 * 获取创建货位的默认值
 */
export const getBinDefaults = () => {
  return {
    zoneId: getSmartDefault('zoneId', {
      urlParam: 'zoneId',
      contextKey: 'lastCreatedZone',
      transform: (v) => (typeof v === 'object' ? v.id : v),
    }),
  };
};

/**
 * 设置创建货位的上下文
 */
export const setBinContext = (bin) => {
  setContext('lastCreatedBin', bin, { module: 'bin' });
  recordUse('bin', bin.id, { metadata: { name: bin.name, zoneId: bin.zoneId } });
};

/**
 * 清理工作流上下文
 */
export const cleanupContext = () => {
  workflowContext.cleanup();
};

/**
 * 清空所有上下文和历史
 */
export const clearAllContext = () => {
  workflowContext.clear();
  workflowContext.clearHistory();
};

export default workflowContext;
