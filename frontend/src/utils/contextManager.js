/**
 * 上下文管理器
 * 用于跨模块数据传递和上下文保持
 * 支持TTL过期机制和自动清理
 */

import { reactive, ref, watch } from 'vue';

import { createLogger } from './logger';

const logger = createLogger('ContextManager');

// 上下文存储（保留以备将来使用）
const _contextStore = reactive(new Map());

// 上下文监听器
const listeners = new Map();

// 默认TTL：24小时
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

// 最大存储条目数
const MAX_STORAGE_ITEMS = 100;

/**
 * 敏感数据键名列表
 */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'credential', 'auth', 'privateKey', 'creditCard', 'ssn'];

/**
 * 检查是否为敏感数据键名
 * @param {string} key - 键名
 * @returns {boolean}
 */
function isSensitiveKey(key) {
  return SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()));
}

/**
 * 上下文管理器类
 */
export class ContextManager {
  constructor(namespace = 'default') {
    this.namespace = namespace;
    this.context = reactive({});
    this.persistKey = `context_${namespace}`;
    this.cleanupInterval = null;

    // 尝试恢复持久化的上下文
    this.restore();

    // 启动定期清理
    this.startCleanupInterval();

    // 监听变化并自动保存
    watch(
      () => this.context,
      () => {
        this.persist();
      },
      { deep: true }
    );
  }

  /**
   * 设置上下文值
   * @param {string} key - 键名
   * @param {any} value - 值
   * @param {Object} options - 选项
   * @param {boolean} options.temporary - 是否临时（不持久化）
   * @param {number} options.ttl - 过期时间（毫秒）
   * @param {boolean} options.sensitive - 是否为敏感数据（自动设为temporary）
   */
  set(key, value, options = {}) {
    // 自动检测敏感数据
    const isSensitive = options.sensitive || isSensitiveKey(key);

    // 敏感数据自动设为临时（不持久化）
    const temporary = isSensitive ? true : options.temporary || false;

    if (isSensitive) {
      logger.warn(`[${this.namespace}] 敏感数据不会持久化:`, key);
    }

    const data = {
      value,
      timestamp: Date.now(),
      temporary,
      ttl: options.ttl || DEFAULT_TTL,
      isSensitive,
    };

    this.context[key] = data;

    // 通知监听器
    this.notify(key, value);

    logger.debug(`[${this.namespace}] 设置上下文:`, { key, value, temporary });
    return this;
  }

  /**
   * 获取上下文值
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any}
   */
  get(key, defaultValue = null) {
    const data = this.context[key];

    if (!data) {
      return defaultValue;
    }

    // 检查是否过期
    if (data.ttl && Date.now() - data.timestamp > data.ttl) {
      this.remove(key);
      return defaultValue;
    }

    return data.value;
  }

  /**
   * 获取完整上下文数据
   * @param {string} key - 键名
   * @returns {Object|null}
   */
  getRaw(key) {
    return this.context[key] || null;
  }

  /**
   * 移除上下文值
   * @param {string} key - 键名
   */
  remove(key) {
    delete this.context[key];
    logger.debug(`[${this.namespace}] 移除上下文:`, key);
    return this;
  }

  /**
   * 检查是否存在
   * @param {string} key - 键名
   * @returns {boolean}
   */
  has(key) {
    return key in this.context;
  }

  /**
   * 获取所有键
   * @returns {Array}
   */
  keys() {
    return Object.keys(this.context);
  }

  /**
   * 获取所有值
   * @returns {Array}
   */
  values() {
    return Object.values(this.context).map((data) => data.value);
  }

  /**
   * 获取所有条目
   * @returns {Array}
   */
  entries() {
    return Object.entries(this.context).map(([key, data]) => [key, data.value]);
  }

  /**
   * 清空上下文
   * @param {Object} options - 选项
   * @param {boolean} options.keepPersistent - 是否保留持久化数据
   */
  clear(options = {}) {
    if (options.keepPersistent) {
      // 只清除临时数据
      Object.keys(this.context).forEach((key) => {
        if (this.context[key].temporary) {
          delete this.context[key];
        }
      });
    } else {
      Object.keys(this.context).forEach((key) => {
        delete this.context[key];
      });
    }

    this.persist();
    logger.debug(`[${this.namespace}] 清空上下文`);
    return this;
  }

  /**
   * 持久化到本地存储
   */
  persist() {
    try {
      const dataToPersist = {};
      Object.entries(this.context).forEach(([key, data]) => {
        if (!data.temporary) {
          dataToPersist[key] = data;
        }
      });

      localStorage.setItem(this.persistKey, JSON.stringify(dataToPersist));
      logger.debug(`[${this.namespace}] 上下文已持久化`);
    } catch (error) {
      logger.error(`[${this.namespace}] 持久化上下文失败:`, error);
    }
  }

  /**
   * 从本地存储恢复
   */
  restore() {
    try {
      const stored = localStorage.getItem(this.persistKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        Object.entries(data).forEach(([key, value]) => {
          // 检查是否过期
          if (value.ttl && now - value.timestamp > value.ttl) {
            logger.debug(`[${this.namespace}] 跳过过期数据:`, key);
            return;
          }
          this.context[key] = value;
        });
        logger.debug(`[${this.namespace}] 上下文已恢复:`, this.context);
      }
    } catch (error) {
      logger.error(`[${this.namespace}] 恢复上下文失败:`, error);
    }
  }

  /**
   * 启动定期清理定时器
   */
  startCleanupInterval() {
    // 每小时清理一次过期数据
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpired();
      },
      60 * 60 * 1000
    );
  }

  /**
   * 停止定期清理定时器
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 清理过期数据
   * @returns {number} 清理的条目数
   */
  cleanupExpired() {
    const now = Date.now();
    let cleanedCount = 0;

    Object.keys(this.context).forEach((key) => {
      const data = this.context[key];
      if (data.ttl && now - data.timestamp > data.ttl) {
        delete this.context[key];
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      this.persist();
      logger.debug(`[${this.namespace}] 清理了 ${cleanedCount} 条过期数据`);
    }

    return cleanedCount;
  }

  /**
   * 检查存储限制
   */
  checkStorageLimit() {
    const keys = Object.keys(this.context);
    if (keys.length > MAX_STORAGE_ITEMS) {
      // 按时间戳排序，删除最旧的数据
      const sortedKeys = keys
        .filter((key) => this.context[key].temporary)
        .sort((a, b) => this.context[a].timestamp - this.context[b].timestamp);

      const toRemove = sortedKeys.slice(0, keys.length - MAX_STORAGE_ITEMS);
      toRemove.forEach((key) => {
        delete this.context[key];
      });

      logger.warn(`[${this.namespace}] 超出存储限制，已删除 ${toRemove.length} 条旧数据`);
      this.persist();
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.stopCleanupInterval();
    this.clear();
    logger.debug(`[${this.namespace}] 上下文管理器已销毁`);
  }

  /**
   * 订阅变化
   * @param {string} key - 键名（支持通配符 *）
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(key, callback) {
    if (!listeners.has(this.namespace)) {
      listeners.set(this.namespace, new Map());
    }

    const namespaceListeners = listeners.get(this.namespace);
    if (!namespaceListeners.has(key)) {
      namespaceListeners.set(key, new Set());
    }

    namespaceListeners.get(key).add(callback);

    // 返回取消订阅函数
    return () => {
      namespaceListeners.get(key).delete(callback);
    };
  }

  /**
   * 通知监听器
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  notify(key, value) {
    const namespaceListeners = listeners.get(this.namespace);
    if (!namespaceListeners) {
      return;
    }

    // 通知精确匹配的监听器
    if (namespaceListeners.has(key)) {
      namespaceListeners.get(key).forEach((callback) => {
        try {
          callback(value, key);
        } catch (error) {
          logger.error('通知监听器失败:', error);
        }
      });
    }

    // 通知通配符监听器
    if (namespaceListeners.has('*')) {
      namespaceListeners.get('*').forEach((callback) => {
        try {
          callback(value, key);
        } catch (error) {
          logger.error('通知监听器失败:', error);
        }
      });
    }
  }

  /**
   * 批量设置
   * @param {Object} data - 数据对象
   * @param {Object} options - 选项
   */
  setMultiple(data, options = {}) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, options);
    });
    return this;
  }

  /**
   * 批量获取
   * @param {Array} keys - 键名数组
   * @returns {Object}
   */
  getMultiple(keys) {
    const result = {};
    keys.forEach((key) => {
      result[key] = this.get(key);
    });
    return result;
  }
}

// 全局上下文管理器实例
const globalContext = new ContextManager('global');

// 模块特定的上下文管理器缓存
const moduleContexts = new Map();

/**
 * 获取全局上下文管理器
 * @returns {ContextManager}
 */
export function getGlobalContext() {
  return globalContext;
}

/**
 * 获取模块上下文管理器
 * @param {string} moduleName - 模块名称
 * @returns {ContextManager}
 */
export function getModuleContext(moduleName) {
  if (!moduleContexts.has(moduleName)) {
    moduleContexts.set(moduleName, new ContextManager(moduleName));
  }
  return moduleContexts.get(moduleName);
}

/**
 * 创建上下文管理器
 * @param {string} namespace - 命名空间
 * @returns {ContextManager}
 */
export function createContext(namespace) {
  return new ContextManager(namespace);
}

/**
 * 跨模块传递数据
 * @param {string} fromModule - 源模块
 * @param {string} toModule - 目标模块
 * @param {string} key - 键名
 * @param {any} value - 值
 */
export function transferContext(fromModule, toModule, key, _value) {
  const sourceContext = getModuleContext(fromModule);
  const targetContext = getModuleContext(toModule);

  const data = sourceContext.getRaw(key);
  if (data) {
    targetContext.set(key, data.value, {
      temporary: data.temporary,
      ttl: data.ttl,
    });
    logger.debug(`上下文传递: ${fromModule}.${key} -> ${toModule}.${key}`);
  }
}

/**
 * 保持路由上下文
 * 在路由切换时保持数据
 * @param {Object} router - Vue Router实例
 * @param {string} moduleName - 模块名称
 */
export function keepRouteContext(router, moduleName) {
  const context = getModuleContext(moduleName);

  router.beforeEach((to, from, next) => {
    // 保存当前路由的上下文标记
    context.set('__lastRoute', from.path, { temporary: true });
    context.set('__currentRoute', to.path, { temporary: true });
    next();
  });

  return context;
}

/**
 * 使用上下文（Vue Composition API）
 * @param {string} namespace - 命名空间
 * @returns {Object}
 */
export function useContext(namespace = 'default') {
  const context = new ContextManager(namespace);

  return {
    context,
    get: context.get.bind(context),
    set: context.set.bind(context),
    remove: context.remove.bind(context),
    clear: context.clear.bind(context),
    subscribe: context.subscribe.bind(context),
  };
}

/**
 * 上下文组合式函数（用于Vue组件）
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @param {string} namespace - 命名空间
 * @returns {Object}
 */
export function useContextValue(key, defaultValue = null, namespace = 'default') {
  const context = new ContextManager(namespace);
  const value = ref(context.get(key, defaultValue));

  // 订阅变化
  const unsubscribe = context.subscribe(key, (newValue) => {
    value.value = newValue;
  });

  // 设置值
  const setValue = (newValue, options) => {
    context.set(key, newValue, options);
    value.value = newValue;
  };

  return {
    value,
    set: setValue,
    unsubscribe,
  };
}

// 仓库管理系统专用上下文工具
export const wmsContext = {
  // 保存仓库选择上下文
  setWarehouseContext(warehouseId, warehouseData) {
    const ctx = getModuleContext('warehouse');
    ctx.set('currentWarehouseId', warehouseId);
    ctx.set('currentWarehouse', warehouseData);
    ctx.set('warehouseSelectedAt', Date.now(), { temporary: true });
  },

  // 获取仓库选择上下文
  getWarehouseContext() {
    const ctx = getModuleContext('warehouse');
    return {
      warehouseId: ctx.get('currentWarehouseId'),
      warehouse: ctx.get('currentWarehouse'),
      selectedAt: ctx.get('warehouseSelectedAt'),
    };
  },

  // 保存功能区选择上下文
  setZoneContext(zoneId, zoneData) {
    const ctx = getModuleContext('zone');
    ctx.set('currentZoneId', zoneId);
    ctx.set('currentZone', zoneData);
  },

  // 获取功能区选择上下文
  getZoneContext() {
    const ctx = getModuleContext('zone');
    return {
      zoneId: ctx.get('currentZoneId'),
      zone: ctx.get('currentZone'),
    };
  },

  // 保存创建流程上下文
  setCreationContext(entityType, data) {
    const ctx = getModuleContext('creation');
    ctx.set(`creating_${entityType}`, data, { temporary: true });
  },

  // 获取创建流程上下文
  getCreationContext(entityType) {
    const ctx = getModuleContext('creation');
    return ctx.get(`creating_${entityType}`);
  },

  // 清除创建流程上下文
  clearCreationContext(entityType) {
    const ctx = getModuleContext('creation');
    ctx.remove(`creating_${entityType}`);
  },

  // 保存列表筛选上下文
  setFilterContext(moduleName, filters) {
    const ctx = getModuleContext('filter');
    ctx.set(`filters_${moduleName}`, filters);
  },

  // 获取列表筛选上下文
  getFilterContext(moduleName) {
    const ctx = getModuleContext('filter');
    return ctx.get(`filters_${moduleName}`, {});
  },

  // 清除所有临时上下文
  clearTemporaryContext() {
    const modules = ['warehouse', 'zone', 'creation'];
    modules.forEach((moduleName) => {
      const ctx = getModuleContext(moduleName);
      ctx.clear({ keepPersistent: true });
    });
  },
};

export default {
  ContextManager,
  getGlobalContext,
  getModuleContext,
  createContext,
  transferContext,
  keepRouteContext,
  useContext,
  useContextValue,
  wmsContext,
};
