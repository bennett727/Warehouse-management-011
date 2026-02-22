/**
 * IndexedDB 缓存管理器
 * @file: indexedDB.js
 * @description: 提供基于IndexedDB的本地数据缓存，支持大数据量存储和高效查询
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0
 */

import { createLogger } from './logger';

const logger = createLogger('indexedDB');

/**
 * 数据库配置
 */
const DB_CONFIG = {
  name: 'WarehouseManagementDB',
  version: 1,
  stores: {
    devices: { keyPath: 'id', indexes: ['deviceCode', 'status', 'deviceType'] },
    deviceTypes: { keyPath: 'id', indexes: ['code'] },
    areas: { keyPath: 'id', indexes: ['code', 'parentId'] },
    stockOrders: { keyPath: 'id', indexes: ['orderNo', 'status', 'type'] },
    users: { keyPath: 'id', indexes: ['username'] },
    cache: { keyPath: 'key' },
  },
};

/**
 * IndexedDB管理器类
 */
class IndexedDBManager {
  constructor() {
    this.db = null;
    this.isOpen = false;
    this.initPromise = null;
  }

  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => {
        logger.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isOpen = true;
        logger.info('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        logger.info('Upgrading IndexedDB to version', DB_CONFIG.version);

        // 创建对象存储
        Object.entries(DB_CONFIG.stores).forEach(([storeName, config]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: config.keyPath });

            // 创建索引
            if (config.indexes) {
              config.indexes.forEach((indexName) => {
                store.createIndex(indexName, indexName, { unique: false });
              });
            }

            logger.info(`Object store '${storeName}' created`);
          }
        });
      };
    });

    return this.initPromise;
  }

  /**
   * 确保数据库已打开
   */
  async ensureOpen() {
    if (!this.isOpen) {
      await this.init();
    }
  }

  /**
   * 获取事务
   * @param {string} storeName - 存储名称
   * @param {string} mode - 事务模式 (readonly/readwrite)
   * @returns {IDBObjectStore}
   */
  getTransaction(storeName, mode = 'readonly') {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  /**
   * 添加或更新数据
   * @param {string} storeName - 存储名称
   * @param {Object} data - 数据对象
   * @returns {Promise<any>}
   */
  async put(storeName, data) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName, 'readwrite');
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 批量添加或更新数据
   * @param {string} storeName - 存储名称
   * @param {Array} dataArray - 数据数组
   * @returns {Promise<void>}
   */
  async putBatch(storeName, dataArray) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      const total = dataArray.length;

      dataArray.forEach((data) => {
        const request = store.put(data);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * 根据ID获取数据
   * @param {string} storeName - 存储名称
   * @param {any} id - 数据ID
   * @returns {Promise<Object|null>}
   */
  async get(storeName, id) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据索引获取数据
   * @param {string} storeName - 存储名称
   * @param {string} indexName - 索引名称
   * @param {any} value - 索引值
   * @returns {Promise<Array>}
   */
  async getByIndex(storeName, indexName, value) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有数据
   * @param {string} storeName - 存储名称
   * @returns {Promise<Array>}
   */
  async getAll(storeName) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除数据
   * @param {string} storeName - 存储名称
   * @param {any} id - 数据ID
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName, 'readwrite');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清空存储
   * @param {string} storeName - 存储名称
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName, 'readwrite');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 游标查询
   * @param {string} storeName - 存储名称
   * @param {Function} callback - 回调函数
   * @returns {Promise<void>}
   */
  async cursor(storeName, callback) {
    await this.ensureOpen();

    return new Promise((resolve, reject) => {
      const store = this.getTransaction(storeName);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          callback(cursor.value);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 关闭数据库
   */
  close() {
    if (this.db) {
      this.db.close();
      this.isOpen = false;
      this.db = null;
      this.initPromise = null;
      logger.info('IndexedDB closed');
    }
  }
}

// 创建单例实例
const indexedDBManager = new IndexedDBManager();

export default indexedDBManager;

/**
 * 缓存管理器 - 基于IndexedDB的高级缓存
 */
export class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 默认5分钟
  }

  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {Object} params - 参数
   * @returns {string}
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 数据
   * @param {number} ttl - 过期时间(毫秒)
   */
  async set(key, data, ttl = this.defaultTTL) {
    const cacheData = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    };

    // 内存缓存
    this.memoryCache.set(key, cacheData);

    // IndexedDB缓存
    try {
      await indexedDBManager.put('cache', cacheData);
    } catch (error) {
      logger.warn('Failed to cache in IndexedDB:', error);
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any|null}
   */
  async get(key) {
    // 先检查内存缓存
    const memoryData = this.memoryCache.get(key);
    if (memoryData && this.isValid(memoryData)) {
      return memoryData.data;
    }

    // 检查IndexedDB缓存
    try {
      const dbData = await indexedDBManager.get('cache', key);
      if (dbData && this.isValid(dbData)) {
        // 同步到内存缓存
        this.memoryCache.set(key, dbData);
        return dbData.data;
      }
    } catch (error) {
      logger.warn('Failed to get cache from IndexedDB:', error);
    }

    return null;
  }

  /**
   * 检查缓存是否有效
   * @param {Object} cacheData - 缓存数据
   * @returns {boolean}
   */
  isValid(cacheData) {
    return Date.now() - cacheData.timestamp < cacheData.ttl;
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  async delete(key) {
    this.memoryCache.delete(key);
    try {
      await indexedDBManager.delete('cache', key);
    } catch (error) {
      logger.warn('Failed to delete cache from IndexedDB:', error);
    }
  }

  /**
   * 清空缓存
   */
  async clear() {
    this.memoryCache.clear();
    try {
      await indexedDBManager.clear('cache');
    } catch (error) {
      logger.warn('Failed to clear cache from IndexedDB:', error);
    }
  }

  /**
   * 获取或设置缓存
   * @param {string} key - 缓存键
   * @param {Function} fetchFn - 数据获取函数
   * @param {number} ttl - 过期时间
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    let data = await this.get(key);

    if (data === null) {
      data = await fetchFn();
      await this.set(key, data, ttl);
    }

    return data;
  }
}

// 创建缓存管理器单例
export const cacheManager = new CacheManager();

/**
 * 设备数据缓存工具
 */
export const deviceCache = {
  /**
   * 缓存设备列表
   * @param {Array} devices - 设备列表
   */
  async cacheDevices(devices) {
    await indexedDBManager.putBatch('devices', devices);
    logger.info(`Cached ${devices.length} devices`);
  },

  /**
   * 获取缓存的设备列表
   * @returns {Promise<Array>}
   */
  async getCachedDevices() {
    return await indexedDBManager.getAll('devices');
  },

  /**
   * 根据ID获取设备
   * @param {string|number} id - 设备ID
   * @returns {Promise<Object|null>}
   */
  async getDeviceById(id) {
    return await indexedDBManager.get('devices', id);
  },

  /**
   * 根据设备编码获取设备
   * @param {string} deviceCode - 设备编码
   * @returns {Promise<Array>}
   */
  async getDevicesByCode(deviceCode) {
    return await indexedDBManager.getByIndex('devices', 'deviceCode', deviceCode);
  },

  /**
   * 清空设备缓存
   */
  async clearDevices() {
    await indexedDBManager.clear('devices');
    logger.info('Device cache cleared');
  },
};

/**
 * 库存数据缓存工具
 */
export const inventoryCache = {
  /**
   * 缓存库存订单
   * @param {Array} orders - 订单列表
   */
  async cacheOrders(orders) {
    await indexedDBManager.putBatch('stockOrders', orders);
    logger.info(`Cached ${orders.length} stock orders`);
  },

  /**
   * 获取缓存的订单
   * @returns {Promise<Array>}
   */
  async getCachedOrders() {
    return await indexedDBManager.getAll('stockOrders');
  },

  /**
   * 根据订单号获取订单
   * @param {string} orderNo - 订单号
   * @returns {Promise<Array>}
   */
  async getOrdersByNo(orderNo) {
    return await indexedDBManager.getByIndex('stockOrders', 'orderNo', orderNo);
  },

  /**
   * 清空库存缓存
   */
  async clearInventory() {
    await indexedDBManager.clear('stockOrders');
    logger.info('Inventory cache cleared');
  },
};
