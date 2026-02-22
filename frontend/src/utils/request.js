/**
 * 请求工具类
 * @file: request.js
 * @description: 封装Axios实例，处理请求和响应拦截
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 2.0
 */

import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

import { useUserStore } from '../stores/user.js';

import { getCache } from './cache';
import { REQUEST } from './constants.js';
import { convertPageParams } from './dataTransform';
import { captureNetworkError } from './errors/errorMonitor';
import { configureLogger, createLogger, LogLevel } from './logger';
import { isOnline, withRetry } from './network';
import { captureAPIPerformance } from './performance';
import tokenManager from './tokenManager';

const logger = createLogger('request');

configureLogger({
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  enableConsole: true,
  enableStorage: import.meta.env.DEV,
  enableRemote: !import.meta.env.DEV,
  remoteUrl: import.meta.env.VITE_LOG_REMOTE_URL || null,
});

/**
 * 错误码映射
 */
const ERROR_CODE_MAP = {
  200: '操作成功',
  400: '请求参数错误，请检查输入内容',
  401: '登录已过期，请重新登录',
  403: '权限不足，请联系管理员',
  404: '请求的资源不存在，请确认后重试',
  405: '请求方法不支持，请检查请求方式',
  408: '请求超时，请检查网络连接后重试',
  500: '服务器内部错误，请稍后重试或联系技术支持',
  501: '服务未实现，请联系技术支持',
  502: '网关错误，请稍后重试',
  503: '服务暂时不可用，请稍后重试',
  504: '网关超时，请稍后重试',
  505: 'HTTP版本不支持，请升级浏览器',
};

/**
 * 业务错误码映射
 */
const BUSINESS_ERROR_MAP = {
  DUPLICATE_ORDER: '订单号已存在，请重新生成',
  INSUFFICIENT_STOCK: '库存不足，无法完成出库操作',
  DEVICE_NOT_FOUND: '设备不存在，请检查设备编号',
  AREA_NOT_FOUND: '区域不存在，请选择正确的区域',
  USER_NOT_FOUND: '用户不存在，请检查用户信息',
  INVALID_STATUS_TRANSITION: '设备状态流转无效，请检查当前状态',
  BATCH_UPDATE_FAILED: '批量更新失败，请减少操作数量后重试',
  VALIDATION_ERROR: '数据验证失败，请检查输入内容',
  DUPLICATE_DEVICE_CODE: '设备编号已存在，请使用其他编号',
  DUPLICATE_SERIAL_NUMBER: '序列号已存在，请检查设备信息',
  AREA_NAME_EXISTS: '区域名称已存在，请使用其他名称',
  AREA_CODE_EXISTS: '区域编码已存在，请使用其他编码',
};

/**
 * 判断是否为长请求
 */
const isLongRequest = (url) => {
  const longRequestPatterns = [
    '/api/areas/all',
    '/api/areas/tree',
    '/api/devices/list',
    '/api/stock/list',
    '/api/reports/',
    '/api/export/',
  ];
  return url && longRequestPatterns.some((pattern) => url.includes(pattern));
};

/**
 * 判断是否为上传请求
 */
const isUploadRequest = (url) => {
  return url && (url.includes('/upload') || url.includes('/import'));
};

/**
 * 根据请求类型获取超时时间
 */
const getRequestTimeout = (url) => {
  if (isUploadRequest(url)) {
    return REQUEST.UPLOAD_TIMEOUT;
  }
  if (isLongRequest(url)) {
    return REQUEST.LONG_REQUEST_TIMEOUT;
  }
  return REQUEST.SHORT_REQUEST_TIMEOUT;
};

/**
 * 请求配置
 */
const REQUEST_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: REQUEST.TIMEOUT,
  retryCount: REQUEST.RETRY_COUNT,
  retryDelay: REQUEST.RETRY_DELAY,
  longRequestTimeout: REQUEST.LONG_REQUEST_TIMEOUT,
  shortRequestTimeout: REQUEST.SHORT_REQUEST_TIMEOUT,
  uploadTimeout: REQUEST.UPLOAD_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
};

// 创建Axios实例
const service = axios.create({
  baseURL: REQUEST_CONFIG.baseURL,
  timeout: REQUEST_CONFIG.timeout,
  headers: REQUEST_CONFIG.headers,
});

/**
 * 令牌刷新状态
 */
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * 自动刷新令牌配置
 */
const AUTO_REFRESH_CONFIG = {
  enabled: true,
  refreshWindow: 5 * 60 * 1000, // 5分钟刷新窗口
  checkInterval: 60 * 1000, // 每分钟检查一次
  lastCheckTime: 0,
};

/**
 * 检查令牌是否需要刷新
 */
const shouldAutoRefreshToken = (token) => {
  if (!AUTO_REFRESH_CONFIG.enabled) {
    return false;
  }

  if (!token) {
    return false;
  }

  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
      return false;
    }

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    return timeUntilExpiration <= AUTO_REFRESH_CONFIG.refreshWindow;
  } catch (error) {
    logger.error('检查令牌是否需要刷新时出错:', error);
    return false;
  }
};

/**
 * 解析JWT令牌
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    logger.error('解析JWT令牌失败:', error);
    return null;
  }
};

/**
 * 自动刷新令牌
 */
const autoRefreshToken = async () => {
  const token = tokenManager.getAccessToken();
  const refreshTokenValue = tokenManager.getRefreshToken();

  if (!token || !refreshTokenValue) {
    return;
  }

  if (!shouldAutoRefreshToken(token)) {
    return;
  }

  const now = Date.now();
  if (now - AUTO_REFRESH_CONFIG.lastCheckTime < AUTO_REFRESH_CONFIG.checkInterval) {
    return;
  }

  AUTO_REFRESH_CONFIG.lastCheckTime = now;

  if (isRefreshing) {
    return;
  }

  logger.info('检测到令牌即将过期，开始自动刷新');

  try {
    isRefreshing = true;
    const response = await service.post('/auth/refresh', {
      refreshToken: tokenManager.getRefreshToken(),
    });
    if (response.data.code === 200 && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      tokenManager.setAccessToken(accessToken);
      if (newRefreshToken) {
        tokenManager.setRefreshToken(newRefreshToken);
      }

      onRefreshed(accessToken);
      logger.info('令牌自动刷新成功');
    }
  } catch (error) {
    logger.error('令牌自动刷新失败:', error);
  } finally {
    isRefreshing = false;
  }
};

/**
 * 添加刷新令牌订阅者
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * 通知刷新令牌订阅者
 */
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * 请求取消控制器映射
 */
const pendingRequests = new Map();

/**
 * 生成请求唯一标识
 */
const generateRequestKey = (config) => {
  const { method, url, params, data } = config;
  const keyData = {
    method,
    url,
    params,
    data,
  };
  return JSON.stringify(keyData);
};

/**
 * 添加待处理请求
 */
const addPendingRequest = (config) => {
  const requestKey = generateRequestKey(config);
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pendingRequests.has(requestKey)) {
        pendingRequests.set(requestKey, cancel);
      }
    });
};

/**
 * 移除待处理请求
 */
const removePendingRequest = (config) => {
  const requestKey = generateRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    pendingRequests.delete(requestKey);
  }
};

/**
 * 取消待处理请求
 */
const cancelPendingRequest = (config) => {
  const requestKey = generateRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey);
    cancel(requestKey);
    pendingRequests.delete(requestKey);
  }
};

/**
 * 显示错误消息
 */
const showError = (message, duration = 3000) => {
  ElMessage({
    message,
    type: 'error',
    duration,
  });

  const globalErrorHandler = window.app?._context?.provides?.globalErrorHandler;
  if (globalErrorHandler?.value) {
    globalErrorHandler.value.showInlineErrorMessage(message, 'error');
  }
};

/**
 * 处理HTTP错误
 */
const handleHttpError = (error) => {
  if (axios.isCancel(error)) {
    logger.debug('请求已取消:', error.message);
    return Promise.reject(error);
  }

  const { response } = error;
  if (!response) {
    if (error.message.includes('timeout')) {
      showError('请求超时，请稍后重试');
    } else if (error.message.includes('Network Error')) {
      showError('网络连接失败，请检查网络');
    } else {
      showError(error.message || '网络错误');
    }

    captureNetworkError(error, error.config);
    return Promise.reject(error);
  }

  const { status, data } = response;
  const errorMessage = data?.message || ERROR_CODE_MAP[status] || '请求失败';

  if (status === 401) {
    return handleAuthError(error.config);
  }

  showError(errorMessage);
  captureNetworkError(error, error.config);
  return Promise.reject(new Error(errorMessage));
};

/**
 * 处理认证错误
 */
const handleAuthError = async (originalRequest) => {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    logger.warn('没有刷新令牌，跳转到登录页');
    redirectToLogin();
    return Promise.reject(new Error('未授权，请重新登录'));
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        resolve(service(originalRequest));
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await service.post('/auth/refresh', {
      refreshToken: tokenManager.getRefreshToken(),
    });
    if (response.data.code === 200 && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      tokenManager.setAccessToken(accessToken);
      if (newRefreshToken) {
        tokenManager.setRefreshToken(newRefreshToken);
      }

      onRefreshed(accessToken);
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

      logger.info('令牌刷新成功');
      return service(originalRequest);
    }
    logger.error('令牌刷新失败: 响应数据无效');
    redirectToLogin();
    return Promise.reject(new Error('令牌刷新失败'));
  } catch (error) {
    logger.error('令牌刷新异常:', error);
    redirectToLogin();
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
};

/**
 * 跳转到登录页
 */
const redirectToLogin = () => {
  const userStore = useUserStore();
  userStore.logoutUser();

  ElMessageBox.confirm('登录已过期，请重新登录', '系统提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
    closeOnClickModal: false,
    closeOnPressEscape: false,
  })
    .then(() => {
      window.location.href = '/login';
    })
    .catch(() => {
      window.location.href = '/login';
    });
};

/**
 * 判断是否应该重试请求
 */
const shouldRetry = (error) => {
  const { response, code, message } = error;

  // 401认证错误不重试
  if (response && response.status === 401) {
    logger.debug('认证错误，不进行重试');
    return false;
  }

  // 403权限错误不重试
  if (response && response.status === 403) {
    logger.debug('权限错误，不进行重试');
    return false;
  }

  // 404资源不存在不重试
  if (response && response.status === 404) {
    logger.debug('资源不存在，不进行重试');
    return false;
  }

  // 422参数验证错误不重试
  if (response && response.status === 422) {
    logger.debug('参数验证错误，不进行重试');
    return false;
  }

  if (!response) {
    // 检查网络错误类型
    const networkError = REQUEST.RETRY_NETWORK_ERRORS.find((err) => message?.includes(err) || code === err);
    if (networkError) {
      logger.debug(`网络错误(${networkError})，可以重试`);
      return true;
    }
    return false;
  }

  // 检查状态码是否在可重试列表中
  const { status } = response;
  if (REQUEST.RETRY_STATUS_CODES.includes(status)) {
    logger.debug(`状态码${status}，可以重试`);
    return true;
  }

  return false;
};

/**
 * 请求重试机制 - 使用新的网络工具
 */
const retryRequest = async (error, config) => {
  // 使用 withRetry 工具进行重试
  const retryConfig = {
    maxRetries: REQUEST_CONFIG.retryCount,
    retryDelay: REQUEST.RETRY_DELAY,
    retryDelayMultiplier: REQUEST.RETRY_STRATEGY === 'exponential' ? 2 : 1,
    maxRetryDelay: REQUEST.RETRY_MAX_DELAY,
    retryableStatuses: REQUEST.RETRY_STATUS_CODES,
    retryableErrors: REQUEST.RETRY_NETWORK_ERRORS,
  };

  try {
    logger.info(`开始重试请求: ${config.url}`);
    return await withRetry(() => service(config), retryConfig);
  } catch (retryError) {
    logger.error(`请求重试失败: ${config.url}`, retryError);
    return Promise.reject(retryError);
  }
};

/**
 * 记录错误日志
 */
const logError = (error, context) => {
  try {
    const errorData = {
      error: error.message || String(error),
      stack: error.stack,
      context: context || {},
      timestamp: new Date().toISOString(),
    };

    logger.error('Error Log:', errorData);

    // 存储错误日志到localStorage用于错误监控
    const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    errorLogs.push(errorData);

    // 只保留最近500条错误记录
    if (errorLogs.length > 500) {
      errorLogs.splice(0, errorLogs.length - 500);
    }

    localStorage.setItem('error_logs', JSON.stringify(errorLogs));

    // 错误告警：检查是否需要发送告警
    checkErrorAlert(errorData, errorLogs);
  } catch (e) {
    logger.error('记录错误日志失败', e);
  }
};

/**
 * 检查错误告警
 */
const checkErrorAlert = (errorData, errorLogs) => {
  try {
    // 检查是否为严重错误
    const isCriticalError =
      errorData.context?.code >= 500 || errorData.context?.code === 401 || errorData.context?.type === 'business';

    if (isCriticalError) {
      // 检查最近5分钟内相同错误的数量
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const recentErrors = errorLogs.filter((log) => log.timestamp >= fiveMinutesAgo && log.error === errorData.error);

      if (recentErrors.length >= 5) {
        // 相同错误在5分钟内出现5次以上，触发告警
        logger.error(`错误告警：错误 "${errorData.error}" 在5分钟内已出现 ${recentErrors.length} 次`);

        // 可以在这里添加告警通知逻辑，如发送邮件、短信等
        // sendErrorAlert(errorData, recentErrors.length);
      }
    }

    // 检查错误率是否过高
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentErrorCount = errorLogs.filter((log) => log.timestamp >= oneHourAgo).length;

    if (recentErrorCount >= 50) {
      // 一小时内错误超过50次，触发告警
      logger.error(`错误告警：一小时内已出现 ${recentErrorCount} 次错误`);

      // 可以在这里添加告警通知逻辑
      // sendErrorRateAlert(recentErrorCount);
    }
  } catch (e) {
    logger.error('检查错误告警失败', e);
  }
};

/**
 * 获取错误日志
 */
export const getErrorLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('error_logs') || '[]');
  } catch (e) {
    logger.error('获取错误日志失败', e);
    return [];
  }
};

/**
 * 清除错误日志
 */
export const clearErrorLogs = () => {
  try {
    localStorage.removeItem('error_logs');
    logger.info('错误日志已清除');
  } catch (e) {
    logger.error('清除错误日志失败', e);
  }
};

/**
 * 获取错误统计信息
 */
export const getErrorStatistics = () => {
  try {
    const logs = getErrorLogs();
    if (logs.length === 0) {
      return null;
    }

    const totalErrors = logs.length;
    const businessErrors = logs.filter((log) => log.context?.type === 'business').length;
    const httpErrors = logs.filter((log) => log.context?.type === 'response').length;
    const requestErrors = logs.filter((log) => log.context?.type === 'request').length;

    const errorMessages = logs.map((log) => log.error);
    const uniqueErrors = [...new Set(errorMessages)];
    const mostFrequentErrors = uniqueErrors
      .map((msg) => ({
        message: msg,
        count: errorMessages.filter((m) => m === msg).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const errorsByCode = {};
    logs.forEach((log) => {
      const code = log.context?.code || 'unknown';
      errorsByCode[code] = (errorsByCode[code] || 0) + 1;
    });

    const errorsByUrl = {};
    logs.forEach((log) => {
      const url = log.context?.url || 'unknown';
      errorsByUrl[url] = (errorsByUrl[url] || 0) + 1;
    });

    return {
      totalErrors,
      businessErrors,
      httpErrors,
      requestErrors,
      uniqueErrorCount: uniqueErrors.length,
      mostFrequentErrors,
      errorsByCode,
      errorsByUrl,
    };
  } catch (e) {
    logger.error('获取错误统计信息失败', e);
    return null;
  }
};

/**
 * 获取错误趋势
 */
export const getErrorTrend = (hours = 24) => {
  try {
    const logs = getErrorLogs();
    if (logs.length === 0) {
      return null;
    }

    const now = Date.now();
    const interval = 60 * 60 * 1000; // 1小时间隔
    const buckets = [];

    for (let i = hours; i >= 0; i--) {
      const startTime = now - (i + 1) * interval;
      const endTime = now - i * interval;

      const count = logs.filter((log) => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= startTime && logTime < endTime;
      }).length;

      buckets.push({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        count,
      });
    }

    return buckets;
  } catch (e) {
    logger.error('获取错误趋势失败', e);
    return null;
  }
};

/**
 * 生成错误报告
 */
export const generateErrorReport = () => {
  try {
    const statistics = getErrorStatistics();
    const trend = getErrorTrend(24);

    if (!statistics) {
      return null;
    }

    const report = {
      generatedAt: new Date().toISOString(),
      statistics,
      trend,
      summary: {
        totalErrors: statistics.totalErrors,
        uniqueErrors: statistics.uniqueErrorCount,
        topError: statistics.mostFrequentErrors[0] || null,
        errorRate: `${((statistics.totalErrors / 24) * 100).toFixed(2)}%`,
      },
    };

    return report;
  } catch (e) {
    logger.error('生成错误报告失败', e);
    return null;
  }
};

// 请求拦截器
service.interceptors.request.use(
  async (config) => {
    // 检查网络状态
    if (!isOnline()) {
      return Promise.reject(new Error('网络已断开，请检查网络连接'));
    }

    // 自动刷新令牌检查
    autoRefreshToken();

    // 根据请求URL动态设置超时时间
    const dynamicTimeout = getRequestTimeout(config.url);
    config.timeout = dynamicTimeout;
    logger.debug(`请求超时设置: ${config.url} - ${dynamicTimeout}ms`);

    // 转换分页参数（前端page/size -> 后端pageNum/pageSize）
    if (config.params) {
      config.params = convertPageParams(config.params);
    }

    // 检查缓存
    const cachedData = getCache(config);
    if (cachedData) {
      const cacheAdapter = () => {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
          fromCache: true,
        });
      };
      config.adapter = cacheAdapter;
    }

    // 取消重复请求
    if (pendingRequests.has(generateRequestKey(config))) {
      cancelPendingRequest(config);
    }
    addPendingRequest(config);

    // 获取用户令牌
    let token = tokenManager.getAccessToken();

    // 如果tokenManager返回null，尝试从global.__tokenStore__获取（测试环境）
    if (!token && typeof global !== 'undefined' && global.__tokenStore__) {
      token = global.__tokenStore__.access_token;
    }

    // 登录请求和刷新令牌请求不添加Authorization头
    const isAuthRequest = config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/refresh'));

    // 如果有令牌且不是认证请求，添加到请求头
    if (token && !isAuthRequest) {
      config.headers['Authorization'] = `Bearer ${token}`;
      logger.debug('添加Authorization请求头', {
        url: config.url,
        tokenLength: token.length,
      });
    } else if (isAuthRequest) {
      logger.debug('认证请求，不添加Authorization请求头', {
        url: config.url,
      });
    } else {
      logger.warn('未找到访问令牌', {
        url: config.url,
      });
    }

    // 添加请求时间戳
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    // 处理请求错误
    logError(error, { type: 'request' });
    return Promise.reject(error);
  }
);

/**
 * 数据规范化 - 统一前后端字段名和状态值类型
 */
const normalizeResponseData = (data, url) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 性能监控：开始计时
  const startTime = performance.now();

  let result = data;

  // 维护记录字段映射
  if (url.includes('/maintenance')) {
    result = normalizeMaintenanceData(data);
  }

  // 批次状态规范化
  if (url.includes('/batches')) {
    result = normalizeBatchData(data);
  }

  // 统一状态值类型为数字
  result = normalizeStatusFields(result);

  // 性能监控：结束计时并记录
  const endTime = performance.now();
  const duration = endTime - startTime;

  // 记录规范化耗时（仅在开发环境）
  if (import.meta.env.DEV) {
    logger.debug(`数据规范化耗时: ${duration.toFixed(2)}ms`, {
      url,
      dataSize: JSON.stringify(data).length,
      duration,
    });
  }

  // 如果规范化耗时超过10ms，记录警告
  if (duration > 10) {
    logger.warn(`数据规范化耗时较长: ${duration.toFixed(2)}ms`, {
      url,
      dataSize: JSON.stringify(data).length,
    });
  }

  return result;
};

/**
 * 规范化状态字段 - 确保所有状态值为数字类型
 * 支持嵌套对象和数组
 */
const normalizeStatusFields = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 需要规范化的状态字段名
  const statusFields = [
    'status',
    'orderStatus',
    'deviceStatus',
    'installationStatus',
    'maintenanceStatus',
    'purpose',
    'orderType',
    'role',
  ];

  const normalizeValue = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const normalized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in normalized) {
      if (Object.prototype.hasOwnProperty.call(normalized, key)) {
        const value = normalized[key];

        // 如果字段名匹配状态字段，且值为字符串类型，转换为数字
        if (statusFields.includes(key) && typeof value === 'string') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            normalized[key] = numValue;
            logger.debug(`状态字段规范化: ${key} = "${value}" -> ${numValue}`);
          }
          // 递归处理嵌套对象和数组
        } else if (value && typeof value === 'object') {
          normalized[key] = normalizeValue(value);
        }
      }
    }

    return normalized;
  };

  return normalizeValue(data);
};

/**
 * 规范化维护记录数据
 */
const normalizeMaintenanceData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeMaintenanceRecord(item));
  }

  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item) => normalizeMaintenanceRecord(item));
  }

  return normalizeMaintenanceRecord(data);
};

/**
 * 规范化单条维护记录
 */
const normalizeMaintenanceRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const normalized = { ...record };

  // 字段映射：后端 -> 前端
  if (normalized.faultDesc !== undefined) {
    normalized.description = normalized.faultDesc;
    delete normalized.faultDesc;
  }

  if (normalized.repairTime !== undefined) {
    normalized.repairDate = normalized.repairTime;
    delete normalized.repairTime;
  }

  if (normalized.maintenanceType !== undefined) {
    normalized.repairType = normalized.maintenanceType;
    delete normalized.maintenanceType;
  }

  if (normalized.processStatus !== undefined) {
    normalized.status = normalized.processStatus;
    delete normalized.processStatus;
  }

  return normalized;
};

/**
 * 规范化批次数据
 */
const normalizeBatchData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeBatch(item));
  }

  if (data.content && Array.isArray(data.content)) {
    data.content = data.content.map((item) => normalizeBatch(item));
  }

  if (data.records && Array.isArray(data.records)) {
    data.records = data.records.map((item) => normalizeBatch(item));
  }

  if (data.list && Array.isArray(data.list)) {
    data.list = data.list.map((item) => normalizeBatch(item));
  }

  return normalizeBatch(data);
};

/**
 * 规范化单条批次数据
 */
const normalizeBatch = (batch) => {
  if (!batch || typeof batch !== 'object') {
    return batch;
  }

  const normalized = { ...batch };

  // 确保批次状态为数字类型
  if (normalized.status !== undefined && typeof normalized.status === 'string') {
    const statusMap = {
      ACTIVE: 0,
      EXPIRED: 1,
      FROZEN: 2,
      CLOSED: 2,
    };
    normalized.status = statusMap[normalized.status] ?? normalized.status;
  }

  return normalized;
};

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 移除已完成的请求
    removePendingRequest(response.config);

    // 计算请求耗时
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // 性能监控：记录请求耗时
    logPerformance(response.config.url, duration, response.status, 'success');

    // 获取响应数据
    const res = response.data;

    // 标准化响应数据 - 统一token字段名
    if (res.data) {
      // 统一token字段：access_token和token互相同步
      if (res.data.token && !res.data.access_token) {
        res.data.access_token = res.data.token;
        logger.debug('标准化token字段: 添加access_token');
      }
      if (res.data.access_token && !res.data.token) {
        res.data.token = res.data.access_token;
        logger.debug('标准化token字段: 添加token');
      }
      // 统一accessToken字段
      if (res.data.access_token && !res.data.accessToken) {
        res.data.accessToken = res.data.access_token;
        logger.debug('标准化token字段: 添加accessToken');
      }
      if (res.data.accessToken && !res.data.access_token) {
        res.data.access_token = res.data.accessToken;
        logger.debug('标准化token字段: 添加access_token');
      }
      // 统一refreshToken字段
      if (res.data.refresh_token && !res.data.refreshToken) {
        res.data.refreshToken = res.data.refresh_token;
        logger.debug('标准化token字段: 添加refreshToken');
      }
      if (res.data.refreshToken && !res.data.refresh_token) {
        res.data.refresh_token = res.data.refreshToken;
        logger.debug('标准化token字段: 添加refresh_token');
      }
    }

    // 标准化状态码 - 支持status和code字段
    if (res.status !== undefined && res.code === undefined) {
      res.code = res.status;
      logger.debug('标准化状态码: status -> code');
    }

    // 自动设置token（如果响应中包含token且是登录响应）
    if (
      res.code === 200 &&
      res.data &&
      (response.config.url.includes('/login') || response.config.url.includes('/auth'))
    ) {
      logger.info('检测到登录响应，准备自动设置token', {
        url: response.config.url,
        hasToken: !!(res.data.token || res.data.accessToken || res.data.access_token),
        hasRefreshToken: !!(res.data.refreshToken || res.data.refresh_token),
      });
      const token = res.data.token || res.data.accessToken || res.data.access_token;
      if (token) {
        const expiresIn = 3600;
        tokenManager.setAccessToken(token, expiresIn);
        logger.info('自动设置访问令牌成功');
      }
      const refreshToken = res.data.refreshToken || res.data.refresh_token;
      if (refreshToken) {
        tokenManager.setRefreshToken(refreshToken);
        logger.info('自动设置刷新令牌成功');
      }
    }

    // 根据自定义状态码处理响应
    if (res.code !== 200) {
      // 处理认证错误
      if (res.code === 401) {
        return handleAuthError(response.config);
      }

      // 获取详细的错误信息
      let errorMessage = res.message || '操作失败';

      // 检查是否为业务错误码
      if (res.errorCode && BUSINESS_ERROR_MAP[res.errorCode]) {
        errorMessage = BUSINESS_ERROR_MAP[res.errorCode];
      }

      // 添加错误详情（如果有）
      if (res.details && res.details.length > 0) {
        errorMessage += `\n详情: ${res.details.join(', ')}`;
      }

      // 显示错误信息
      showError(errorMessage);

      // 记录业务错误
      logError(new Error(errorMessage), {
        type: 'business',
        code: res.code,
        errorCode: res.errorCode,
        url: response.config.url,
        details: res.details,
      });

      return Promise.reject(new Error(errorMessage));
    }

    // 规范化响应数据 - 使用统一的数据转换工具
    if (res.data) {
      res.data = normalizeResponseData(res.data, response.config.url);
    }

    return res;
  },
  (error) => {
    // 移除失败的请求
    if (error.config) {
      removePendingRequest(error.config);
    }

    // 检查是否为请求取消错误，如果是则不记录错误日志
    if (error.name === 'CanceledError' || error.name === 'AbortError' || axios.isCancel(error)) {
      logger.debug('请求被取消:', error.message);
      return Promise.reject(error);
    }

    // 计算请求耗时
    if (error.config && error.config.metadata) {
      const endTime = new Date();
      const duration = endTime - error.config.metadata.startTime;

      // 性能监控：记录请求耗时
      logPerformance(error.config.url, duration, error.response?.status, 'error');
    }

    // 记录错误
    logError(error, { type: 'response', url: error.config?.url });

    // 尝试重试
    if (error.config && !error.config.__isRetry && shouldRetry(error)) {
      error.config.__isRetry = true;
      return retryRequest(error, error.config);
    }

    // 处理HTTP错误
    return handleHttpError(error);
  }
);

/**
 * 性能监控：记录请求耗时
 */
const logPerformance = (url, duration, status, result) => {
  try {
    captureAPIPerformance(url, duration, status, result);
  } catch (e) {
    logger.error('记录性能监控数据失败', e);
  }
};

/**
 * 获取性能监控数据
 */
export const getPerformanceLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('performance_logs') || '[]');
  } catch (e) {
    logger.error('获取性能监控数据失败', e);
    return [];
  }
};

/**
 * 清除性能监控数据
 */
export const clearPerformanceLogs = () => {
  try {
    localStorage.removeItem('performance_logs');
    logger.info('性能监控数据已清除');
  } catch (e) {
    logger.error('清除性能监控数据失败', e);
  }
};

/**
 * 获取性能统计信息
 */
export const getPerformanceStatistics = () => {
  try {
    const logs = getPerformanceLogs();
    if (logs.length === 0) {
      return null;
    }

    const totalRequests = logs.length;
    const successRequests = logs.filter((log) => log.result === 'success').length;
    const errorRequests = logs.filter((log) => log.result === 'error').length;
    const avgDuration = logs.reduce((sum, log) => sum + log.duration, 0) / totalRequests;
    const maxDuration = Math.max(...logs.map((log) => log.duration));
    const minDuration = Math.min(...logs.map((log) => log.duration));

    const slowRequests = logs.filter((log) => log.duration > 3000).length;
    const fastRequests = logs.filter((log) => log.duration < 500).length;

    return {
      totalRequests,
      successRequests,
      errorRequests,
      successRate: ((successRequests / totalRequests) * 100).toFixed(2),
      avgDuration: avgDuration.toFixed(2),
      maxDuration,
      minDuration,
      slowRequests,
      fastRequests,
    };
  } catch (e) {
    logger.error('获取性能统计信息失败', e);
    return null;
  }
};

export default service;
