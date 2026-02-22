// API配置文件

// API基础URL配置 - 使用相对路径，确保与前端页面同域
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// API请求超时时间（毫秒）
export const API_TIMEOUT = 15000;

// API错误码定义
export const API_ERROR_CODES = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  VALIDATION_ERROR: 422,
};

// API响应结构
export const API_RESPONSE_STRUCT = {
  CODE: 'code',
  DATA: 'data',
  MESSAGE: 'message',
  TOTAL: 'total',
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
};

// 请求头配置
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// 分页默认配置
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
};

// 导出配置对象
export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_ERROR_CODES,
  API_RESPONSE_STRUCT,
  DEFAULT_HEADERS,
  DEFAULT_PAGINATION,
};
