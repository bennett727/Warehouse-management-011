/**
 * API响应数据解析工具
 * @file: responseParser.js
 * @description: 统一处理API响应数据解析，支持多种数据结构
 * @author: 前端开发团队
 * @createTime: 2026-02-20
 * @version: 1.0.0
 */

import { createLogger } from './logger';

const logger = createLogger('responseParser');

/**
 * 解析列表数据
 * @param {Object} response - API响应对象
 * @returns {Array} 数据列表
 */
export const parseListData = (response) => {
  if (!response) {
    logger.warn('parseListData: response为null或undefined');
    return [];
  }

  if (!response.data) {
    logger.warn('parseListData: response.data为null或undefined');
    return [];
  }

  const { data } = response;

  // 按优先级尝试不同的数据结构
  if (Array.isArray(data.records)) {
    return data.records;
  }

  if (Array.isArray(data.list)) {
    return data.list;
  }

  if (Array.isArray(data.devices)) {
    return data.devices;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  if (Array.isArray(data)) {
    return data;
  }

  // 处理嵌套data结构
  if (data.data) {
    if (Array.isArray(data.data.records)) {
      return data.data.records;
    }
    if (Array.isArray(data.data.list)) {
      return data.data.list;
    }
    if (Array.isArray(data.data.content)) {
      return data.data.content;
    }
    if (Array.isArray(data.data)) {
      return data.data;
    }
  }

  logger.warn('parseListData: 无法识别的数据结构', { data });
  return [];
};

/**
 * 解析分页信息
 * @param {Object} response - API响应对象
 * @returns {Object} 分页信息
 */
export const parsePagination = (response) => {
  const defaultPagination = {
    total: 0,
    page: 1,
    pageSize: 20,
    pages: 0,
  };

  if (!response || !response.data) {
    return defaultPagination;
  }

  const { data } = response;

  // 解析总记录数
  const total = data.total || data.totalElements || data.totalCount || 0;

  // 解析当前页码
  const page = data.page || data.current || data.pageNum || 1;

  // 解析每页大小
  const pageSize = data.pageSize || data.size || data.limit || 20;

  // 计算总页数
  const pages = data.pages || data.totalPages || Math.ceil(total / pageSize) || 0;

  return {
    total,
    page,
    pageSize,
    pages,
  };
};

/**
 * 解析单个对象数据
 * @param {Object} response - API响应对象
 * @returns {Object|null} 数据对象
 */
export const parseObjectData = (response) => {
  if (!response || !response.data) {
    return null;
  }

  const { data } = response;

  // 如果data本身就是对象且不是数组，直接返回
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // 检查是否有嵌套的data字段
    if (data.data !== undefined && data.data !== null) {
      return data.data;
    }
    return data;
  }

  return null;
};

/**
 * 检查响应是否成功
 * @param {Object} response - API响应对象
 * @returns {boolean} 是否成功
 */
export const isSuccessResponse = (response) => {
  if (!response) {
    return false;
  }

  // 优先使用code判断
  if (response.code !== undefined) {
    return response.code === 200;
  }

  // 其次使用success字段
  if (response.success !== undefined) {
    return response.success === true;
  }

  // 检查HTTP状态码（如果有）
  if (response.status !== undefined) {
    return response.status >= 200 && response.status < 300;
  }

  return false;
};

/**
 * 获取错误消息
 * @param {Object} response - API响应对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 错误消息
 */
export const getErrorMessage = (response, defaultMessage = '操作失败') => {
  if (!response) {
    return defaultMessage;
  }

  // 按优先级尝试不同的错误消息字段
  return (
    response.message || response.error || response.msg || response.errorMessage || response.errorMsg || defaultMessage
  );
};

/**
 * 获取成功消息
 * @param {Object} response - API响应对象
 * @param {string} defaultMessage - 默认成功消息
 * @returns {string} 成功消息
 */
export const getSuccessMessage = (response, defaultMessage = '操作成功') => {
  if (!response) {
    return defaultMessage;
  }

  return response.message || response.msg || response.successMessage || defaultMessage;
};

/**
 * 安全解析响应数据（带错误处理）
 * @param {Object} response - API响应对象
 * @param {Function} parser - 解析函数
 * @param {*} defaultValue - 默认值
 * @param {string} context - 上下文信息（用于日志）
 * @returns {*} 解析结果
 */
export const safeParseResponse = (response, parser, defaultValue = null, context = '') => {
  try {
    if (!isSuccessResponse(response)) {
      const errorMsg = getErrorMessage(response);
      logger.warn(`${context}: 响应不成功`, { errorMsg, response });
      return defaultValue;
    }

    const result = parser(response);
    return result !== undefined && result !== null ? result : defaultValue;
  } catch (error) {
    logger.error(`${context}: 解析响应数据失败`, error);
    return defaultValue;
  }
};

/**
 * 解析树形结构数据
 * @param {Object} response - API响应对象
 * @param {string} childrenKey - 子节点字段名
 * @returns {Array} 树形数据
 */
export const parseTreeData = (response, childrenKey = 'children') => {
  const list = parseListData(response);

  if (!Array.isArray(list)) {
    return [];
  }

  // 递归处理树形结构
  const processNode = (node) => {
    if (!node || typeof node !== 'object') {
      return null;
    }

    const processed = { ...node };

    if (Array.isArray(node[childrenKey])) {
      processed[childrenKey] = node[childrenKey].map(processNode).filter(Boolean);
    }

    return processed;
  };

  return list.map(processNode).filter(Boolean);
};

/**
 * 解析选项数据（用于下拉选择等）
 * @param {Object} response - API响应对象
 * @param {string} labelKey - 标签字段名
 * @param {string} valueKey - 值字段名
 * @returns {Array} 选项数组 {label, value}
 */
export const parseOptions = (response, labelKey = 'name', valueKey = 'id') => {
  const list = parseListData(response);

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item) => ({
    label: item[labelKey] || item.label || item.name || item.title || '未命名',
    value: item[valueKey] !== undefined ? item[valueKey] : item.value || item.code || item.id,
    ...item, // 保留原始数据
  }));
};

/**
 * 验证响应结构是否符合规范
 * @param {Object} response - API响应对象
 * @returns {Object} 验证结果 { valid: boolean, issues: string[] }
 */
export const validateResponseStructure = (response) => {
  const issues = [];

  if (!response) {
    issues.push('响应对象为null或undefined');
    return { valid: false, issues };
  }

  // 检查code字段
  if (response.code === undefined) {
    issues.push('缺少code字段');
  }

  // 检查data字段
  if (response.data === undefined) {
    issues.push('缺少data字段');
  }

  // 检查message字段
  if (response.message === undefined && response.msg === undefined) {
    issues.push('缺少message或msg字段');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

/**
 * 创建响应解析器（工厂函数）
 * @param {Object} config - 配置对象
 * @returns {Object} 解析器对象
 */
export const createResponseParser = (config = {}) => {
  const { listKey: _listKey = 'records', labelKey = 'name', valueKey = 'id', childrenKey = 'children' } = config;

  return {
    parseList: (response) => parseListData(response),
    parsePage: (response) => parsePagination(response),
    parseObject: (response) => parseObjectData(response),
    parseTree: (response) => parseTreeData(response, childrenKey),
    parseOptions: (response) => parseOptions(response, labelKey, valueKey),
    isSuccess: (response) => isSuccessResponse(response),
    getError: (response, defaultMsg) => getErrorMessage(response, defaultMsg),
    getSuccess: (response, defaultMsg) => getSuccessMessage(response, defaultMsg),
  };
};

export default {
  parseListData,
  parsePagination,
  parseObjectData,
  isSuccessResponse,
  getErrorMessage,
  getSuccessMessage,
  safeParseResponse,
  parseTreeData,
  parseOptions,
  validateResponseStructure,
  createResponseParser,
};
