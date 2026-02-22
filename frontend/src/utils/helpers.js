/**
 * 通用工具函数集合
 */

import { createLogger } from './logger.js';

const logger = createLogger('helpers');

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {string[]} allowedTypes - 允许的文件类型数组，如['jpg', 'png', 'pdf']
 * @returns {boolean} 是否为允许的文件类型
 */
export function isValidFileType(file, allowedTypes) {
  if (!file || !file.name) {
    return false;
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
export function generateRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }

  const clonedObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * 判断两个对象是否相等
 * @param {Object} obj1 - 第一个对象
 * @param {Object} obj2 - 第二个对象
 * @returns {boolean} 是否相等
 */
export function isEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (obj1 === null || obj2 === null) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => isEqual(item, obj2[index]));
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1.every((key) => keys2.includes(key) && isEqual(obj1[key], obj2[key]));
  }

  return false;
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代API
      await navigator.clipboard.writeText(text);
      return true;
    }
    // 回退到传统方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch (error) {
    logger.error('复制失败:', error);
    return false;
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
export function getUrlParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

/**
 * 设置URL参数
 * @param {string} name - 参数名
 * @param {string} value - 参数值
 */
export function setUrlParam(name, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url);
}

/**
 * 移除URL参数
 * @param {string} name - 参数名
 */
export function removeUrlParam(name) {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.pushState({}, '', url);
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否为有效的手机号
 */
export function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱
 * @returns {boolean} 是否为有效的邮箱
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 隐藏敏感信息（如手机号、邮箱）
 * @param {string} text - 要隐藏的文本
 * @param {number} start - 开始显示的字符数
 * @param {number} end - 结尾显示的字符数
 * @param {string} mask - 掩码字符
 * @returns {string} 隐藏后的文本
 */
export function maskSensitiveInfo(text, start = 3, end = 4, mask = '*') {
  if (!text) {
    return '';
  }
  if (text.length <= start + end) {
    return text;
  }

  const maskLength = text.length - start - end;
  const masked = mask.repeat(maskLength);
  return text.substring(0, start) + masked + text.substring(text.length - end);
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 判断是否为空值
 * @param {any} value - 要检查的值
 * @returns {boolean} 是否为空
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * 延迟函数
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 安全地访问嵌套对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径，如 'a.b.c'
 * @param {any} defaultValue - 默认值
 * @returns {any} 属性值或默认值
 */
export function getNestedProperty(obj, path, defaultValue = undefined) {
  if (!obj || !path) {
    return defaultValue;
  }

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

/**
 * 数组分组函数
 * @param {Array} array - 要分组的数组
 * @param {Function|string} key - 分组的键或函数
 * @returns {Object} 分组后的对象
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * 安全地获取窗口宽度
 * @returns {number} 窗口宽度，如果不可用则返回 1920
 */
export function getWindowWidth() {
  if (typeof window !== 'undefined' && window.innerWidth) {
    return window.innerWidth;
  }
  return 1920;
}

/**
 * 安全地获取窗口高度
 * @returns {number} 窗口高度，如果不可用则返回 1080
 */
export function getWindowHeight() {
  if (typeof window !== 'undefined' && window.innerHeight) {
    return window.innerHeight;
  }
  return 1080;
}

/**
 * 判断是否为移动设备
 * @param {number} breakpoint - 断点宽度，默认 767
 * @returns {boolean} 是否为移动设备
 */
export function isMobile(breakpoint = 767) {
  return getWindowWidth() <= breakpoint;
}

/**
 * 判断是否为平板设备
 * @param {number} breakpoint - 断点宽度，默认 1023
 * @returns {boolean} 是否为平板设备
 */
export function isTablet(breakpoint = 1023) {
  return getWindowWidth() <= breakpoint && getWindowWidth() > 767;
}

/**
 * 判断是否为桌面设备
 * @param {number} breakpoint - 断点宽度，默认 1023
 * @returns {boolean} 是否为桌面设备
 */
export function isDesktop(breakpoint = 1023) {
  return getWindowWidth() > breakpoint;
}
