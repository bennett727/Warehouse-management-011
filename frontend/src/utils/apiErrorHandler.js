/**
 * API错误处理工具类
 * @file: apiErrorHandler.js
 * @description: 提供统一的API错误处理和响应标准化
 * @author: 开发团队
 * @createTime: 2026-02-08
 * @version: 1.0
 */

import { ElMessage, ElMessageBox } from 'element-plus';

import { createLogger } from './logger';
import tokenManager from './tokenManager';

const logger = createLogger('APIErrorHandler');

/**
 * API错误类
 * 统一封装API错误信息
 */
export class APIError extends Error {
  constructor(code, message, data = null, originalError = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.data = data;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  /**
   * 检查是否为认证错误
   */
  isAuthError() {
    return this.code === 401 || this.code === 403;
  }

  /**
   * 检查是否为服务器错误
   */
  isServerError() {
    return this.code >= 500 && this.code < 600;
  }

  /**
   * 检查是否为客户端错误
   */
  isClientError() {
    return this.code >= 400 && this.code < 500;
  }

  /**
   * 获取友好的错误信息
   */
  getFriendlyMessage() {
    const friendlyMessages = {
      400: '请求参数错误，请检查输入内容',
      401: '登录已过期，请重新登录',
      403: '权限不足，请联系管理员',
      404: '请求的资源不存在，请确认后重试',
      408: '请求超时，请稍后重试',
      409: '资源冲突，请刷新页面后重试',
      422: '数据验证失败，请检查输入内容',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误，请稍后重试或联系技术支持',
      502: '网关错误，请稍后重试',
      503: '服务暂时不可用，请稍后重试',
      504: '网关超时，请稍后重试',
    };

    return friendlyMessages[this.code] || this.message || '操作失败，请稍后重试';
  }

  /**
   * 转换为JSON对象
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * HTTP状态码错误映射
 */
const HTTP_ERROR_MAP = {
  400: '请求参数错误',
  401: '未授权',
  403: '禁止访问',
  404: '资源不存在',
  405: '方法不允许',
  408: '请求超时',
  409: '资源冲突',
  410: '资源已删除',
  413: '请求实体过大',
  415: '不支持的媒体类型',
  422: '验证错误',
  429: '请求过于频繁',
  500: '服务器内部错误',
  501: '功能未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

/**
 * 业务错误码映射
 * @deprecated 预留供将来使用
 */
// eslint-disable-next-line no-unused-vars
const BUSINESS_ERROR_MAP = {
  // 认证相关
  AUTH_INVALID_CREDENTIALS: '用户名或密码错误',
  AUTH_TOKEN_EXPIRED: '登录已过期，请重新登录',
  AUTH_TOKEN_INVALID: '登录状态无效，请重新登录',
  AUTH_ACCESS_DENIED: '权限不足，无法访问',
  AUTH_ACCOUNT_LOCKED: '账户已被锁定，请联系管理员',
  AUTH_ACCOUNT_DISABLED: '账户已被禁用，请联系管理员',

  // 数据相关
  DATA_NOT_FOUND: '数据不存在',
  DATA_ALREADY_EXISTS: '数据已存在',
  DATA_VALIDATION_FAILED: '数据验证失败',
  DATA_INTEGRITY_VIOLATION: '数据完整性约束违反',

  // 业务逻辑
  BUSINESS_RULE_VIOLATION: '违反业务规则',
  OPERATION_NOT_ALLOWED: '当前状态不允许此操作',
  RESOURCE_IN_USE: '资源正在使用中',
  INSUFFICIENT_STOCK: '库存不足',
  DEVICE_NOT_AVAILABLE: '设备不可用',

  // 系统错误
  SYSTEM_ERROR: '系统错误，请联系技术支持',
  SERVICE_UNAVAILABLE: '服务暂时不可用',
  EXTERNAL_SERVICE_ERROR: '外部服务调用失败',
};

/**
 * 处理API错误
 * @param {Error} error - 原始错误对象
 * @param {Object} options - 处理选项
 * @returns {APIError} 标准化的API错误对象
 */
export const handleAPIError = (error, options = {}) => {
  const { showMessage = true, redirectOnAuthError = true, logError = true } = options;

  // 如果是已处理的APIError，直接返回
  if (error instanceof APIError) {
    if (showMessage) {
      showErrorMessage(error.getFriendlyMessage());
    }
    return error;
  }

  // 处理Axios错误
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || HTTP_ERROR_MAP[status] || '请求失败';

    const apiError = new APIError(status, message, data, error);

    // 处理认证错误
    if (status === 401 && redirectOnAuthError) {
      handleAuthError(apiError);
      return apiError;
    }

    // 处理权限错误
    if (status === 403) {
      handlePermissionError(apiError);
      return apiError;
    }

    // 显示错误消息
    if (showMessage) {
      showErrorMessage(apiError.getFriendlyMessage());
    }

    // 记录错误日志
    if (logError) {
      logger.error('[API Error]', apiError.toJSON());
    }

    return apiError;
  }

  // 处理网络错误
  if (error.request) {
    const message = error.message?.includes('timeout') ? '请求超时，请检查网络连接' : '网络连接失败，请检查网络';

    const apiError = new APIError(0, message, null, error);

    if (showMessage) {
      showErrorMessage(message);
    }

    return apiError;
  }

  // 处理其他错误
  const apiError = new APIError(-1, error.message || '未知错误', null, error);

  if (showMessage) {
    showErrorMessage('操作失败，请稍后重试');
  }

  return apiError;
};

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 * @param {Object} options - 显示选项
 */
export const showErrorMessage = (message, options = {}) => {
  const { duration = 5000, type = 'error' } = options;

  ElMessage({
    message,
    type,
    duration,
    showClose: true,
  });
};

/**
 * 处理认证错误
 * @param {APIError} error - API错误对象
 */
const handleAuthError = (error) => {
  // 清除token
  tokenManager.clearTokens();

  // 显示确认对话框
  ElMessageBox.confirm(error.getFriendlyMessage(), '系统提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
    closeOnClickModal: false,
    closeOnPressEscape: false,
  })
    .then(() => {
      redirectToLogin();
    })
    .catch(() => {
      redirectToLogin();
    });
};

/**
 * 处理权限错误
 * @param {APIError} error - API错误对象
 */
const handlePermissionError = (error) => {
  showErrorMessage(error.getFriendlyMessage());

  // 可以在这里添加权限申请逻辑
  logger.warn('[Permission Error]', error.toJSON());
};

/**
 * 跳转到登录页
 */
const redirectToLogin = () => {
  // 清除用户信息
  const userStore = useUserStore();
  if (userStore) {
    userStore.logoutUser();
  }

  // 跳转到登录页
  window.location.href = '/login';
};

/**
 * 获取用户存储（延迟加载避免循环依赖）
 */
let userStoreInstance = null;
const useUserStore = () => {
  if (!userStoreInstance) {
    try {
      const { useUserStore: getUserStore } = require('../stores/user.js');
      userStoreInstance = getUserStore();
    } catch (e) {
      logger.warn('无法加载userStore:', e);
    }
  }
  return userStoreInstance;
};

/**
 * 创建API响应包装器
 * 统一包装成功的API响应
 * @param {*} data - 响应数据
 * @param {string} message - 成功消息
 * @returns {Object} 标准化的响应对象
 */
export const createSuccessResponse = (data, message = '操作成功') => {
  return {
    code: 200,
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 创建API错误响应包装器
 * 统一包装失败的API响应
 * @param {string} message - 错误消息
 * @param {number} code - 错误码
 * @param {string} errorCode - 业务错误码
 * @param {*} details - 错误详情
 * @returns {Object} 标准化的错误响应对象
 */
export const createErrorResponse = (message, code = 500, errorCode = null, details = null) => {
  return {
    code,
    success: false,
    message,
    errorCode,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 验证API响应是否成功
 * @param {Object} response - API响应对象
 * @returns {boolean} 是否成功
 */
export const isSuccessResponse = (response) => {
  return response && (response.code === 200 || response.code === 0 || response.success === true);
};

/**
 * 安全地获取响应数据
 * @param {Object} response - API响应对象
 * @param {*} defaultValue - 默认值
 * @returns {*} 响应数据或默认值
 */
export const safeGetData = (response, defaultValue = null) => {
  if (isSuccessResponse(response) && response.data !== undefined) {
    return response.data;
  }
  return defaultValue;
};

/**
 * API错误监控
 * 用于收集和分析API错误
 */
export class APIErrorMonitor {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  /**
   * 记录错误
   * @param {APIError} error - API错误对象
   */
  record(error) {
    this.errors.push({
      error: error.toJSON(),
      timestamp: new Date().toISOString(),
    });

    // 限制错误记录数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 触发错误告警检查
    this.checkAlert();
  }

  /**
   * 检查是否需要触发告警
   */
  checkAlert() {
    const recentErrors = this.getRecentErrors(5); // 最近5分钟

    // 如果最近5分钟错误超过10次，触发告警
    if (recentErrors.length >= 10) {
      logger.warn(`[API Error Alert] 最近5分钟发生${recentErrors.length}次API错误`);
      // 可以在这里添加更多告警逻辑，如发送邮件、短信等
    }
  }

  /**
   * 获取最近N分钟的错误
   * @param {number} minutes - 分钟数
   * @returns {Array} 错误列表
   */
  getRecentErrors(minutes) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.errors.filter((e) => e.timestamp >= cutoff);
  }

  /**
   * 获取错误统计
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const stats = {
      total: this.errors.length,
      byCode: {},
      byEndpoint: {},
      recent: this.getRecentErrors(60),
    };

    this.errors.forEach((e) => {
      const { code } = e.error;
      const endpoint = e.error.data?.config?.url || 'unknown';

      stats.byCode[code] = (stats.byCode[code] || 0) + 1;
      stats.byEndpoint[endpoint] = (stats.byEndpoint[endpoint] || 0) + 1;
    });

    return stats;
  }

  /**
   * 清除所有错误记录
   */
  clear() {
    this.errors = [];
  }
}

// 创建全局错误监控实例
export const apiErrorMonitor = new APIErrorMonitor();

export default {
  APIError,
  handleAPIError,
  showErrorMessage,
  createSuccessResponse,
  createErrorResponse,
  isSuccessResponse,
  safeGetData,
  APIErrorMonitor,
  apiErrorMonitor,
};
