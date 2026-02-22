/**
 * 数据转换工具类
 * @file: dataTransform.js
 * @description: 统一处理前后端数据格式转换，确保数据交互的一致性
 * @author: 优化团队
 * @createTime: 2026-02-08
 * @version: 1.0
 */

import { createLogger } from './logger';

const logger = createLogger('dataTransform');

// ==================== 时间格式转换 ====================

/**
 * 格式化日期时间
 * @param {string|Date} isoString - ISO 8601格式的时间字符串或Date对象
 * @param {string} format - 输出格式，默认'zh-CN'本地化格式
 * @returns {string} 格式化后的时间字符串
 */
export const formatDateTime = (isoString, format = 'zh-CN') => {
  if (!isoString) {
    return '';
  }

  try {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      logger.warn('无效的时间格式:', isoString);
      return String(isoString);
    }

    if (format === 'zh-CN') {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }

    if (format === 'date') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }

    if (format === 'time') {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }

    return date.toISOString();
  } catch (error) {
    logger.error('时间格式化失败:', error);
    return String(isoString);
  }
};

/**
 * 递归转换所有时间字段
 * @param {any} data - 需要转换的数据
 * @returns {any} 转换后的数据
 */
export const convertDateFields = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertDateFields(item));
  }

  const result = {};
  for (const [key, value] of Object.entries(data)) {
    // 检测时间字段（以Time或Date结尾）
    if (
      typeof value === 'string' &&
      (key.endsWith('Time') || key.endsWith('Date') || key === 'timestamp') &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    ) {
      result[key] = formatDateTime(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertDateFields(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

// ==================== 设备状态映射 ====================

/**
 * 设备状态映射配置
 * 后端枚举值 -> 前端显示配置
 */
export const DEVICE_STATUS_MAP = {
  PENDING_INBOUND: { label: '待入库', value: -1, type: 'info', color: '#909399' },
  IN_STOCK: { label: '在库', value: 0, type: 'success', color: '#67C23A' },
  IN_USE: { label: '使用中', value: 1, type: 'primary', color: '#409EFF' },
  MAINTENANCE: { label: '维护中', value: 2, type: 'warning', color: '#E6A23C' },
  SCRAPPED: { label: '已报废', value: 3, type: 'danger', color: '#F56C6C' },
  // 兼容旧状态值
  AVAILABLE: { label: '可用', value: 0, type: 'success', color: '#67C23A' },
  INSTALLED: { label: '使用中', value: 1, type: 'primary', color: '#409EFF' },
  DEFECTIVE: { label: '维护中', value: 2, type: 'warning', color: '#E6A23C' },
  REPAIRING: { label: '维护中', value: 2, type: 'warning', color: '#E6A23C' },
};

/**
 * 根据后端状态值获取前端配置
 * @param {string|number} status - 后端返回的状态值
 * @returns {object} 前端显示配置
 */
export const getDeviceStatusConfig = (status) => {
  // 如果是数字，先转换为字符串枚举
  if (typeof status === 'number') {
    const statusEntry = Object.entries(DEVICE_STATUS_MAP).find(([, config]) => config.value === status);
    return statusEntry ? statusEntry[1] : { label: '未知', type: 'info', color: '#909399' };
  }

  return DEVICE_STATUS_MAP[status] || { label: status || '未知', type: 'info', color: '#909399' };
};

/**
 * 转换设备状态显示
 * @param {object|array} devices - 设备数据
 * @returns {object|array} 转换后的设备数据
 */
export const convertDeviceStatus = (devices) => {
  if (!devices) {
    return devices;
  }

  const isArray = Array.isArray(devices);
  const deviceList = isArray ? devices : [devices];

  const result = deviceList.map((device) => {
    if (!device || typeof device !== 'object') {
      return device;
    }

    const config = getDeviceStatusConfig(device.status);
    return {
      ...device,
      statusLabel: config.label,
      statusType: config.type,
      statusColor: config.color,
      statusValue: config.value,
    };
  });

  return isArray ? result : result[0];
};

// ==================== 库存状态映射 ====================

/**
 * 库存状态映射配置
 */
export const INVENTORY_STATUS_MAP = {
  NORMAL: { label: '正常', value: 0, type: 'success' },
  LOW_STOCK: { label: '库存不足', value: 1, type: 'warning' },
  OUT_OF_STOCK: { label: '缺货', value: 2, type: 'danger' },
  FROZEN: { label: '冻结', value: 3, type: 'info' },
  EXPIRED: { label: '过期', value: 4, type: 'danger' },
};

/**
 * 转换库存状态
 * @param {object|array} inventory - 库存数据
 * @returns {object|array} 转换后的库存数据
 */
export const convertInventoryStatus = (inventory) => {
  if (!inventory) {
    return inventory;
  }

  const isArray = Array.isArray(inventory);
  const list = isArray ? inventory : [inventory];

  const result = list.map((item) => {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const config = INVENTORY_STATUS_MAP[item.status] || { label: '未知', type: 'info' };
    return {
      ...item,
      statusLabel: config.label,
      statusType: config.type,
    };
  });

  return isArray ? result : result[0];
};

// ==================== 分页参数转换 ====================

/**
 * 前端分页参数 -> 后端分页参数
 * 根据项目规范，前后端统一使用 page/size/sort/order 参数名
 * 无需转换，直接返回参数
 *
 * @param {object} params - 分页参数 { page, size, sort, order }
 * @returns {object} 分页参数 { page, size, sort, order }
 */
export const convertPageParams = (params) => {
  if (!params) {
    return {};
  }

  const result = { ...params };

  // 处理前端可能使用的旧参数名，统一转换为后端标准参数名
  // 页码参数：统一使用 page
  if (result.pageNum !== undefined && result.page === undefined) {
    result.page = result.pageNum;
    delete result.pageNum;
  }
  if (result.current !== undefined && result.page === undefined) {
    result.page = result.current;
    delete result.current;
  }

  // 每页数量参数：统一使用 size
  if (result.pageSize !== undefined && result.size === undefined) {
    result.size = result.pageSize;
    delete result.pageSize;
  }

  // 排序字段参数：统一使用 sort
  if (result.sortField !== undefined && result.sort === undefined) {
    result.sort = result.sortField;
    delete result.sortField;
  }
  if (result.sortBy !== undefined && result.sort === undefined) {
    result.sort = result.sortBy;
    delete result.sortBy;
  }

  // 排序方向参数：统一使用 order
  if (result.sortOrder !== undefined && result.order === undefined) {
    result.order = result.sortOrder;
    delete result.sortOrder;
  }

  return result;
};

/**
 * 后端分页响应 -> 前端分页格式
 * @param {object} response - 后端分页响应
 * @returns {object} 标准化后的分页数据
 */
export const normalizePageResponse = (response) => {
  if (!response) {
    return null;
  }

  return {
    records: response.records || response.content || response.list || [],
    total: Number(response.total) || 0,
    pageNum: response.pageNum || response.pageNumber || 1,
    pageSize: response.pageSize || response.size || 10,
    pages: response.pages || Math.ceil((response.total || 0) / (response.pageSize || 10)),
  };
};

// ==================== 订单类型映射 ====================

/**
 * 订单类型映射
 */
export const ORDER_TYPE_MAP = {
  INBOUND: { label: '入库单', value: 1, type: 'success' },
  OUTBOUND: { label: '出库单', value: 2, type: 'warning' },
  TRANSFER: { label: '调拨单', value: 3, type: 'primary' },
  RETURN: { label: '退货单', value: 4, type: 'info' },
};

/**
 * 订单状态映射
 */
export const ORDER_STATUS_MAP = {
  DRAFT: { label: '草稿', value: 0, type: 'info' },
  PENDING: { label: '待审核', value: 1, type: 'warning' },
  APPROVED: { label: '已审核', value: 2, type: 'success' },
  COMPLETED: { label: '已完成', value: 3, type: 'success' },
  CANCELLED: { label: '已取消', value: 4, type: 'danger' },
};

/**
 * 转换订单数据
 * @param {object|array} orders - 订单数据
 * @returns {object|array} 转换后的订单数据
 */
export const convertOrderData = (orders) => {
  if (!orders) {
    return orders;
  }

  const isArray = Array.isArray(orders);
  const list = isArray ? orders : [orders];

  const result = list.map((order) => {
    if (!order || typeof order !== 'object') {
      return order;
    }

    const typeConfig = ORDER_TYPE_MAP[order.orderType] || { label: '未知', type: 'info' };
    const statusConfig = ORDER_STATUS_MAP[order.status] || { label: '未知', type: 'info' };

    return {
      ...order,
      orderTypeLabel: typeConfig.label,
      orderTypeType: typeConfig.type,
      statusLabel: statusConfig.label,
      statusType: statusConfig.type,
    };
  });

  return isArray ? result : result[0];
};

// ==================== 通用数据转换 ====================

/**
 * 深度转换对象中的枚举值为中文标签
 * @param {object} data - 原始数据
 * @param {object} mapping - 字段映射配置 { fieldName: enumMap }
 * @returns {object} 转换后的数据
 */
export const convertEnumFields = (data, mapping) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertEnumFields(item, mapping));
  }

  const result = { ...data };

  for (const [field, enumMap] of Object.entries(mapping)) {
    if (result[field] !== undefined) {
      const value = result[field];
      const config = enumMap[value];
      if (config) {
        result[`${field}Label`] = config.label;
        result[`${field}Type`] = config.type;
      }
    }
  }

  return result;
};

/**
 * 清理空值字段
 * @param {object} data - 原始数据
 * @param {array} preserveFields - 需要保留的空值字段
 * @returns {object} 清理后的数据
 */
export const cleanEmptyFields = (data, preserveFields = []) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => cleanEmptyFields(item, preserveFields));
  }

  const result = {};

  for (const [key, value] of Object.entries(data)) {
    // 保留指定字段
    if (preserveFields.includes(key)) {
      result[key] = value;
      continue;
    }

    // 过滤空值
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object') {
        const cleaned = cleanEmptyFields(value, preserveFields);
        if (Object.keys(cleaned).length > 0 || Array.isArray(cleaned)) {
          result[key] = cleaned;
        }
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};

/**
 * 统一响应数据处理入口
 * @param {any} data - 响应数据
 * @param {string} url - 请求URL（用于判断数据类型）
 * @returns {any} 处理后的数据
 */
export const normalizeResponseData = (data, url = '') => {
  if (!data) {
    return data;
  }

  const startTime = performance.now();
  let result = data;

  // 根据URL判断数据类型并应用相应转换
  if (url.includes('/devices')) {
    result = convertDeviceStatus(result);
  } else if (url.includes('/inventory') || url.includes('/stock')) {
    result = convertInventoryStatus(result);
  } else if (url.includes('/orders') || url.includes('/stock/orders')) {
    result = convertOrderData(result);
  }

  // 统一转换时间字段
  result = convertDateFields(result);

  // 记录处理耗时
  const duration = performance.now() - startTime;
  if (duration > 5) {
    logger.debug(`数据规范化耗时: ${duration.toFixed(2)}ms`, { url });
  }

  return result;
};

export default {
  formatDateTime,
  convertDateFields,
  getDeviceStatusConfig,
  convertDeviceStatus,
  convertInventoryStatus,
  convertPageParams,
  normalizePageResponse,
  convertOrderData,
  convertEnumFields,
  cleanEmptyFields,
  normalizeResponseData,
  DEVICE_STATUS_MAP,
  INVENTORY_STATUS_MAP,
  ORDER_TYPE_MAP,
  ORDER_STATUS_MAP,
};
