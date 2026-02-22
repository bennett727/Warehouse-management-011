/*
  @file: cache.js
  @description: 数据缓存工具，提供内存缓存和本地存储缓存功能
  @author: 开发团队
  @createTime: 2026-01-31
  @version: 1.0
*/

import { createLogger } from './logger';

const logger = createLogger('cache');

const CACHE_PREFIX = 'wms_cache_';
const MEMORY_CACHE = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

const NON_CACHEABLE_URLS = ['/api/v1/other-endpoint'];

class CacheItem {
  constructor(value, ttl = DEFAULT_TTL) {
    this.value = value;
    this.expiry = Date.now() + ttl;
  }

  isExpired() {
    return Date.now() > this.expiry;
  }
}

class CacheManager {
  constructor() {
    this.memoryCache = MEMORY_CACHE;
  }

  set(key, value, ttl = DEFAULT_TTL) {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const item = new CacheItem(value, ttl);
    this.memoryCache.set(cacheKey, item);
    this.setLocalStorage(cacheKey, value, ttl);
  }

  get(key) {
    const cacheKey = `${CACHE_PREFIX}${key}`;

    const memoryItem = this.memoryCache.get(cacheKey);
    if (memoryItem && !memoryItem.isExpired()) {
      return memoryItem.value;
    }

    if (memoryItem && memoryItem.isExpired()) {
      this.memoryCache.delete(cacheKey);
    }

    const localStorageItem = this.getLocalStorage(cacheKey);
    if (localStorageItem !== null) {
      return localStorageItem;
    }

    return null;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    this.memoryCache.delete(cacheKey);
    this.removeLocalStorage(cacheKey);
  }

  clear() {
    this.memoryCache.clear();
    this.clearLocalStorage();
  }

  setLocalStorage(key, value, ttl) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      logger.warn('LocalStorage set failed:', error);
    }
  }

  getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        this.removeLocalStorage(key);
        return null;
      }
      return parsed.value;
    } catch (error) {
      logger.warn('LocalStorage get failed:', error);
      return null;
    }
  }

  removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.warn('LocalStorage remove failed:', error);
    }
  }

  clearLocalStorage() {
    try {
      const keys = localStorage.keys ? localStorage.keys : Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      logger.warn('LocalStorage clear failed:', error);
    }
  }

  cleanExpired() {
    const keys = Array.from(this.memoryCache.keys());
    keys.forEach((key) => {
      const item = this.memoryCache.get(key);
      if (item && item.isExpired()) {
        this.memoryCache.delete(key);
      }
    });
  }
}

const cacheManager = new CacheManager();

setInterval(() => {
  cacheManager.cleanExpired();
}, 60 * 1000);

export default cacheManager;

export const createCacheKey = (prefix, ...params) => {
  return `${prefix}_${params.join('_')}`;
};

export const cacheApiResponse = async (key, apiCall, ttl = DEFAULT_TTL) => {
  const cachedData = cacheManager.get(key);
  if (cachedData !== null) {
    return cachedData;
  }

  const response = await apiCall();
  if (response && response.code === 200) {
    cacheManager.set(key, response.data, ttl);
  }
  return response;
};

export const getLocalItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }
    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch (error) {
    logger.warn('LocalStorage get failed:', error);
    return null;
  }
};

export const setLocalItem = (key, value, ttl = DEFAULT_TTL) => {
  try {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    logger.warn('LocalStorage set failed:', error);
  }
};

export const removeLocalItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.warn('LocalStorage remove failed:', error);
  }
};

export const clearLocalItems = () => {
  try {
    const keys = localStorage.keys ? localStorage.keys : Object.keys(localStorage);
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    logger.warn('LocalStorage clear failed:', error);
  }
};

export const setCache = (keyOrConfig, value, ttl = DEFAULT_TTL) => {
  if (typeof keyOrConfig === 'string') {
    cacheManager.set(keyOrConfig, value, ttl);
  } else if (typeof keyOrConfig === 'object' && keyOrConfig !== null) {
    const method = keyOrConfig.method?.toLowerCase() || 'get';
    if (method === 'get') {
      if (keyOrConfig.cache === false) {
        return;
      }
      if (NON_CACHEABLE_URLS.some((url) => keyOrConfig.url.includes(url))) {
        return;
      }
      const params = keyOrConfig.params ? JSON.stringify(keyOrConfig.params) : '';
      const data = keyOrConfig.data ? JSON.stringify(keyOrConfig.data) : '';
      const key = createCacheKey(keyOrConfig.url, params, data);
      const customTTL = keyOrConfig.cacheTTL || ttl;
      cacheManager.set(key, value, customTTL);
    }
  }
};

export const getCache = (keyOrConfig) => {
  if (typeof keyOrConfig === 'string') {
    return cacheManager.get(keyOrConfig);
  }
  if (typeof keyOrConfig === 'object' && keyOrConfig !== null) {
    const params = keyOrConfig.params ? JSON.stringify(keyOrConfig.params) : '';
    const data = keyOrConfig.data ? JSON.stringify(keyOrConfig.data) : '';
    const key = createCacheKey(keyOrConfig.url, params, data);
    return cacheManager.get(key);
  }
  return null;
};

export const clearCache = (key) => {
  if (key && typeof key === 'string') {
    if (key.includes(':')) {
      const url = key.split(':')[1];
      const keys = Array.from(cacheManager.memoryCache.keys());
      keys.forEach((cacheKey) => {
        if (cacheKey.includes(url)) {
          cacheManager.memoryCache.delete(cacheKey);
        }
      });
    } else {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      cacheManager.memoryCache.delete(cacheKey);
    }
  } else {
    cacheManager.clear();
  }
};

export const clearExpiredCache = () => {
  let clearedCount = 0;
  const keys = Array.from(cacheManager.memoryCache.keys());
  keys.forEach((key) => {
    const item = cacheManager.memoryCache.get(key);
    if (item && item.isExpired()) {
      cacheManager.memoryCache.delete(key);
      clearedCount++;
    }
  });
  return clearedCount;
};

export const hasCache = (keyOrConfig) => {
  if (typeof keyOrConfig === 'string') {
    return cacheManager.has(keyOrConfig);
  }
  if (typeof keyOrConfig === 'object' && keyOrConfig !== null) {
    const method = keyOrConfig.method?.toLowerCase() || 'get';
    if (method === 'get') {
      const params = keyOrConfig.params ? JSON.stringify(keyOrConfig.params) : '';
      const data = keyOrConfig.data ? JSON.stringify(keyOrConfig.data) : '';
      const key = createCacheKey(keyOrConfig.url, params, data);
      return cacheManager.has(key);
    }
    return false;
  }
  return false;
};

export const getCacheSize = () => {
  return cacheManager.memoryCache.size;
};

export const clearRelatedCacheByConfig = (config) => {
  if (!config || !config.url) {
    return;
  }

  const method = config.method?.toLowerCase() || 'get';

  if (method !== 'get') {
    cacheManager.clear();
  }
};
