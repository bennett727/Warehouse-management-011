/**
 * 性能优化配置
 * @file: performance.js
 * @description: 统一管理应用性能优化配置
 * @version: 1.0.0
 */

/**
 * 页面加载超时配置（毫秒）
 */
export const PAGE_LOAD_TIMEOUT = {
  // 默认页面加载超时
  DEFAULT: 10000,
  // 数据密集型页面（如报表、大数据表格）
  DATA_INTENSIVE: 15000,
  // 简单页面
  SIMPLE: 5000,
  // 首次加载（考虑缓存预热）
  FIRST_LOAD: 20000,
};

/**
 * API请求超时配置
 */
export const API_TIMEOUT = {
  // 默认API超时
  DEFAULT: 10000,
  // 导出操作
  EXPORT: 30000,
  // 批量操作
  BATCH: 20000,
  // 文件上传
  UPLOAD: 60000,
  // 报表查询
  REPORT: 15000,
};

/**
 * 数据加载配置
 */
export const DATA_LOADING = {
  // 表格默认分页大小
  DEFAULT_PAGE_SIZE: 20,
  // 最大分页大小
  MAX_PAGE_SIZE: 100,
  // 虚拟滚动阈值
  VIRTUAL_SCROLL_THRESHOLD: 50,
  // 防抖延迟（毫秒）
  DEBOUNCE_DELAY: 300,
  // 节流延迟（毫秒）
  THROTTLE_DELAY: 100,
};

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  // 本地存储前缀
  STORAGE_PREFIX: 'wms_',
  // 缓存过期时间（毫秒）
  EXPIRATION: {
    // 用户信息
    USER_INFO: 24 * 60 * 60 * 1000, // 24小时
    // 字典数据
    DICT_DATA: 60 * 60 * 1000, // 1小时
    // 系统配置
    SYSTEM_CONFIG: 30 * 60 * 1000, // 30分钟
    // 页面状态
    PAGE_STATE: 15 * 60 * 1000, // 15分钟
  },
};

/**
 * 懒加载配置
 */
export const LAZY_LOAD_CONFIG = {
  // 组件懒加载超时
  COMPONENT_TIMEOUT: 5000,
  // 图片懒加载偏移量
  IMAGE_OFFSET: 200,
  // 路由预加载延迟
  ROUTE_PRELOAD_DELAY: 2000,
};

/**
 * 骨架屏配置
 */
export const SKELETON_CONFIG = {
  // 默认行数
  DEFAULT_ROWS: 10,
  // 默认列数
  DEFAULT_COLUMNS: 8,
  // 动画类型
  ANIMATION: 'pulse', // 'pulse' | 'wave'
};

/**
 * 性能监控配置
 */
export const PERFORMANCE_MONITOR = {
  // 是否启用性能监控
  ENABLED: process.env.NODE_ENV === 'production',
  // 采样率（0-1）
  SAMPLE_RATE: 0.1,
  // 慢请求阈值（毫秒）
  SLOW_REQUEST_THRESHOLD: 3000,
  // 慢渲染阈值（毫秒）
  SLOW_RENDER_THRESHOLD: 100,
  // 内存警告阈值（MB）
  MEMORY_WARNING_THRESHOLD: 500,
};

/**
 * 获取页面加载超时时间
 * @param {string} pageType - 页面类型
 * @returns {number} - 超时时间（毫秒）
 */
export function getPageLoadTimeout(pageType = 'DEFAULT') {
  return PAGE_LOAD_TIMEOUT[pageType] || PAGE_LOAD_TIMEOUT.DEFAULT;
}

/**
 * 获取API超时时间
 * @param {string} apiType - API类型
 * @returns {number} - 超时时间（毫秒）
 */
export function getApiTimeout(apiType = 'DEFAULT') {
  return API_TIMEOUT[apiType] || API_TIMEOUT.DEFAULT;
}

/**
 * 获取缓存过期时间
 * @param {string} cacheType - 缓存类型
 * @returns {number} - 过期时间（毫秒）
 */
export function getCacheExpiration(cacheType = 'DEFAULT') {
  return CACHE_CONFIG.EXPIRATION[cacheType] || 60 * 60 * 1000;
}

export default {
  PAGE_LOAD_TIMEOUT,
  API_TIMEOUT,
  DATA_LOADING,
  CACHE_CONFIG,
  LAZY_LOAD_CONFIG,
  SKELETON_CONFIG,
  PERFORMANCE_MONITOR,
  getPageLoadTimeout,
  getApiTimeout,
  getCacheExpiration,
};
