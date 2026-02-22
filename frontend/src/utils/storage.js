/**
 * @file: storage.js
 * @description: 安全的本地存储工具，支持敏感数据加密
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import CryptoJS from 'crypto-js';

import { createLogger } from './logger';

const logger = createLogger('Storage');

// 加密密钥（实际项目中应从环境变量或安全存储获取）
const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_KEY || 'warehouse-management-secure-key-2026';

// 存储前缀，用于区分应用数据
const STORAGE_PREFIX = 'wms_';

/**
 * 加密数据
 * @param {string} data - 要加密的数据
 * @returns {string} 加密后的数据
 */
function encrypt(data) {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    logger.error('加密失败', error);
    return data;
  }
}

/**
 * 解密数据
 * @param {string} encryptedData - 加密的数据
 * @returns {string} 解密后的数据
 */
function decrypt(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    logger.error('解密失败', error);
    return null;
  }
}

/**
 * 生成存储键名
 * @param {string} key - 原始键名
 * @returns {string} 带前缀的键名
 */
function getStorageKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * 安全存储 - 加密存储敏感数据
 * @param {string} key - 键名
 * @param {any} value - 要存储的值
 * @param {boolean} encryptData - 是否加密
 */
export function setSecureItem(key, value, encryptData = false) {
  try {
    const storageKey = getStorageKey(key);
    const data = JSON.stringify({
      value,
      timestamp: Date.now(),
      encrypted: encryptData,
    });

    const finalData = encryptData ? encrypt(data) : data;
    localStorage.setItem(storageKey, finalData);
  } catch (error) {
    logger.error('存储失败', error);
  }
}

/**
 * 安全读取 - 解密读取敏感数据
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的值
 */
export function getSecureItem(key, defaultValue = null) {
  try {
    const storageKey = getStorageKey(key);
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
      return defaultValue;
    }

    // 尝试解密
    let data = decrypt(storedData);
    if (!data) {
      // 解密失败，可能是未加密的数据
      data = storedData;
    }

    const parsed = JSON.parse(data);
    return parsed.value ?? defaultValue;
  } catch (error) {
    logger.error('读取失败', error);
    return defaultValue;
  }
}

/**
 * 移除存储项
 * @param {string} key - 键名
 */
export function removeSecureItem(key) {
  try {
    const storageKey = getStorageKey(key);
    localStorage.removeItem(storageKey);
  } catch (error) {
    logger.error('移除失败', error);
  }
}

/**
 * 清空所有应用存储
 */
export function clearSecureStorage() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    logger.error('清空失败', error);
  }
}

/**
 * 存储表单草稿
 * @param {string} formId - 表单ID
 * @param {Object} formData - 表单数据
 * @param {boolean} encrypt - 是否加密敏感字段
 */
export function saveFormDraft(formId, formData, encrypt = true) {
  const draftKey = `draft_${formId}`;
  setSecureItem(
    draftKey,
    {
      data: formData,
      savedAt: Date.now(),
    },
    encrypt
  );
}

/**
 * 读取表单草稿
 * @param {string} formId - 表单ID
 * @param {number} maxAge - 最大有效时间（毫秒），默认24小时
 * @returns {Object|null} 表单草稿数据
 */
export function loadFormDraft(formId, maxAge = 24 * 60 * 60 * 1000) {
  const draftKey = `draft_${formId}`;
  const draft = getSecureItem(draftKey);

  if (!draft) {
    return null;
  }

  // 检查是否过期
  if (Date.now() - draft.savedAt > maxAge) {
    removeSecureItem(draftKey);
    return null;
  }

  return draft.data;
}

/**
 * 清除表单草稿
 * @param {string} formId - 表单ID
 */
export function clearFormDraft(formId) {
  const draftKey = `draft_${formId}`;
  removeSecureItem(draftKey);
}

/**
 * 存储用户偏好设置
 * @param {string} key - 设置键名
 * @param {any} value - 设置值
 */
export function setUserPreference(key, value) {
  const prefKey = `pref_${key}`;
  setSecureItem(prefKey, value, false); // 偏好设置不加密
}

/**
 * 获取用户偏好设置
 * @param {string} key - 设置键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 设置值
 */
export function getUserPreference(key, defaultValue = null) {
  const prefKey = `pref_${key}`;
  return getSecureItem(prefKey, defaultValue);
}

/**
 * 存储缓存数据
 * @param {string} cacheKey - 缓存键名
 * @param {any} data - 缓存数据
 * @param {number} ttl - 有效时间（毫秒）
 */
export function setCache(cacheKey, data, ttl = 5 * 60 * 1000) {
  const key = `cache_${cacheKey}`;
  setSecureItem(
    key,
    {
      data,
      expiresAt: Date.now() + ttl,
    },
    false
  );
}

/**
 * 获取缓存数据
 * @param {string} cacheKey - 缓存键名
 * @returns {any|null} 缓存数据
 */
export function getCache(cacheKey) {
  const key = `cache_${cacheKey}`;
  const cached = getSecureItem(key);

  if (!cached) {
    return null;
  }

  // 检查是否过期
  if (Date.now() > cached.expiresAt) {
    removeSecureItem(key);
    return null;
  }

  return cached.data;
}

/**
 * 清除过期缓存
 */
export function clearExpiredCache() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`${STORAGE_PREFIX}cache_`)) {
      try {
        const cached = getSecureItem(key.replace(STORAGE_PREFIX, ''));
        if (cached && Date.now() > cached.expiresAt) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        logger.error('清理缓存失败', error);
      }
    }
  });
}

/**
 * 获取存储统计信息
 * @returns {Object} 存储统计
 */
export function getStorageStats() {
  let totalSize = 0;
  let itemCount = 0;

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      totalSize += key.length + (value?.length || 0);
      itemCount++;
    }
  });

  return {
    itemCount,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    totalBytes: totalSize,
  };
}

// 定期清理过期缓存
setInterval(clearExpiredCache, 60 * 60 * 1000); // 每小时清理一次

export default {
  setSecureItem,
  getSecureItem,
  removeSecureItem,
  clearSecureStorage,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  setUserPreference,
  getUserPreference,
  setCache,
  getCache,
  clearExpiredCache,
  getStorageStats,
};
