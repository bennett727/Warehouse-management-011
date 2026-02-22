/**
 * 数据规范化工具函数
 * 用于统一处理API响应数据结构，解决不同API返回不同字段名的问题
 */

/**
 * 从API响应中提取列表数据
 * 支持多种常见的响应格式，确保数据一致性
 * @param {Object} response - API响应对象
 * @param {Object} options - 配置选项
 * @param {string[]} options.listFields - 列表字段名候选列表，按优先级顺序
 * @param {string} options.totalField - 总数字段名
 * @param {string} options.dataField - 数据字段名（当响应直接包含数据时）
 * @returns {Object} { list: Array, total: number }
 */
export function extractListData(response, options = {}) {
  const {
    listFields = ['records', 'list', 'items', 'devices', 'data'],
    totalField = 'total',
    dataField = 'data',
  } = options;

  if (!response) {
    return { list: [], total: 0 };
  }

  const data = response[dataField] || response;

  if (!data) {
    return { list: [], total: 0 };
  }

  let list = [];
  let total = 0;

  // 尝试从多个可能的字段中提取列表数据
  for (const field of listFields) {
    if (Array.isArray(data[field])) {
      list = data[field];
      break;
    }
  }

  // 如果data本身就是数组，直接使用
  if (Array.isArray(data)) {
    list = data;
  }

  // 确保list始终是数组
  if (!Array.isArray(list)) {
    console.warn('[extractListData] 提取的list不是数组，将返回空数组:', list);
    list = [];
  }

  // 提取总数，支持多种字段名
  const totalFields = Array.isArray(totalField) ? totalField : [totalField];
  for (const field of totalFields) {
    if (typeof data[field] === 'number') {
      total = data[field];
      break;
    }
  }

  // 如果没有找到总数，使用列表长度
  if (total === 0 && list.length > 0) {
    total = list.length;
  }

  return { list, total };
}

/**
 * 从API响应中提取单个对象数据
 * @param {Object} response - API响应对象
 * @param {Object} options - 配置选项
 * @param {string} options.dataField - 数据字段名
 * @returns {Object|null} 提取的数据对象
 */
export function extractSingleData(response, options = {}) {
  const { dataField = 'data' } = options;

  if (!response) {
    return null;
  }

  return response[dataField] || response || null;
}

/**
 * 规范化分页参数
 * 确保分页参数符合后端API的预期格式
 * @param {Object} params - 原始分页参数
 * @param {Object} options - 配置选项
 * @param {string} options.pageField - 页码字段名
 * @param {string} options.pageSizeField - 每页数量字段名
 * @param {number} options.pageBase - 页码起始值（0或1）
 * @returns {Object} 规范化后的分页参数
 */
export function normalizePaginationParams(params, options = {}) {
  const { pageField = 'page', pageSizeField = 'pageSize', pageBase = 0 } = options;

  const normalized = { ...params };

  // 处理页码字段映射
  if (normalized.page !== undefined && normalized[pageField] === undefined) {
    normalized[pageField] = normalized.page;
  }

  // 处理每页数量字段映射
  if (normalized.pageSize !== undefined && normalized[pageSizeField] === undefined) {
    normalized[pageSizeField] = normalized.pageSize;
  }

  if (normalized.limit !== undefined && normalized[pageSizeField] === undefined) {
    normalized[pageSizeField] = normalized.limit;
  }

  // 处理offset转换为page
  if (normalized.offset !== undefined && normalized[pageField] === undefined) {
    const pageSize = normalized[pageSizeField] || 10;
    normalized[pageField] = Math.floor(normalized.offset / pageSize) + pageBase;
  }

  // 调整页码起始值
  if (normalized[pageField] !== undefined && pageBase === 0) {
    // 如果前端使用1-based页码，但后端需要0-based
    normalized[pageField] = normalized[pageField] - 1;
  }

  return normalized;
}

/**
 * 创建字段映射器
 * 用于统一不同API返回的字段名差异
 * @param {Object} fieldMap - 字段映射配置 { 标准字段名: [可能的字段名数组] }
 * @returns {Function} 映射函数
 */
export function createFieldMapper(fieldMap) {
  return function mapFields(data) {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const result = {};

    for (const [standardField, possibleFields] of Object.entries(fieldMap)) {
      const fields = Array.isArray(possibleFields) ? possibleFields : [possibleFields];

      for (const field of fields) {
        const value = getNestedValue(data, field);
        if (value !== undefined && value !== null) {
          result[standardField] = value;
          break;
        }
      }

      // 如果没有找到值，设置默认值
      if (!(standardField in result)) {
        result[standardField] = '';
      }
    }

    return result;
  };
}

/**
 * 获取嵌套对象的值
 * @param {Object} obj - 对象
 * @param {string} path - 字段路径（支持点号分隔，如 'user.name'）
 * @returns {any} 字段值
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) {
    return undefined;
  }

  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

/**
 * 安全地获取字段值，支持多级回退
 * @param {Object} obj - 数据对象
 * @param {string[]} fields - 字段路径数组，按优先级排序
 * @param {any} defaultValue - 默认值
 * @returns {any} 字段值
 */
export function getFieldValue(obj, fields, defaultValue = '-') {
  if (!obj || !Array.isArray(fields)) {
    return defaultValue;
  }

  for (const field of fields) {
    const value = getNestedValue(obj, field);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return defaultValue;
}

/**
 * 规范化设备数据
 * 统一不同API返回的设备数据格式
 * @param {Object} device - 设备数据
 * @returns {Object} 规范化后的设备数据
 */
export function normalizeDeviceData(device) {
  if (!device || typeof device !== 'object') {
    return null;
  }

  return {
    id: device.id,
    deviceCode: getFieldValue(device, ['deviceCode', 'code'], '-'),
    deviceName: getFieldValue(device, ['deviceName', 'name'], '-'),
    deviceTypeName: getFieldValue(device, ['deviceType.typeName', 'deviceTypeName', 'typeName'], '-'),
    areaName: getFieldValue(device, ['area.name', 'areaName'], '-'),
    binName: getFieldValue(device, ['bin.name', 'binName'], '-'),
    status: device.status || 'UNKNOWN',
    currentStock: device.currentStock || 0,
    createTime: device.createTime || '-',
  };
}

/**
 * 规范化库存记录数据
 * @param {Object} record - 记录数据
 * @returns {Object} 规范化后的记录数据
 */
export function normalizeInventoryRecord(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const { orderType } = record;
  const operationMap = {
    0: { text: '入库', value: 'inbound' },
    1: { text: '出库', value: 'outbound' },
    2: { text: '调拨', value: 'transfer' },
  };
  const operation = operationMap[orderType] || { text: '未知', value: 'unknown' };

  return {
    id: record.id,
    recordNo: getFieldValue(record, ['orderNo', 'recordNo'], '-'),
    deviceCode: getFieldValue(record, ['deviceCode', 'device.deviceCode'], '-'),
    deviceName: getFieldValue(record, ['deviceName', 'device.deviceName'], '-'),
    operationText: operation.text,
    operation: operation.value,
    quantity: record.quantity || record.totalQuantity || 0,
    warehouseName: getFieldValue(record, ['warehouseName', 'warehouse.name'], '-'),
    operator: getFieldValue(record, ['operator', 'operatorName'], '-'),
    createTime: getFieldValue(record, ['createTime', 'orderTime'], '-'),
  };
}

/**
 * 批量规范化数据
 * @param {Array} dataList - 数据列表
 * @param {Function} normalizer - 规范化函数
 * @returns {Array} 规范化后的数据列表
 */
export function normalizeDataList(dataList, normalizer) {
  if (!Array.isArray(dataList)) {
    return [];
  }

  return dataList.map((item) => normalizer(item)).filter((item) => item !== null);
}

/**
 * 规范化API响应数据
 * 统一处理不同格式的API响应，提取有效数据
 * @param {Object} response - API响应对象
 * @param {Object} options - 配置选项
 * @param {string} options.dataField - 数据字段名
 * @param {string} options.listField - 列表字段名
 * @param {string} options.totalField - 总数字段名
 * @returns {Object} { success: boolean, data: any, message: string, total: number }
 */
export function normalizeApiResponse(response, options = {}) {
  const { dataField = 'data' } = options;

  if (!response) {
    return {
      success: false,
      data: null,
      message: '响应为空',
      total: 0,
    };
  }

  // 判断响应是否成功
  const success = response.success === true || response.code === 200 || response.code === '200';

  // 提取数据
  let data = response[dataField] || response;
  let total = 0;

  // 如果数据是对象，尝试提取列表和总数
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // 尝试提取列表
    const possibleListFields = ['records', 'list', 'items', 'devices', 'data'];
    for (const field of possibleListFields) {
      if (Array.isArray(data[field])) {
        data = data[field];
        break;
      }
    }

    // 尝试提取总数
    const possibleTotalFields = ['total', 'totalElements', 'totalCount'];
    for (const field of possibleTotalFields) {
      if (typeof response[field] === 'number') {
        total = response[field];
        break;
      }
      if (response[dataField] && typeof response[dataField][field] === 'number') {
        total = response[dataField][field];
        break;
      }
    }
  }

  // 如果数据是数组，设置总数
  if (Array.isArray(data)) {
    total = total || data.length;
  }

  return {
    success,
    data,
    message: response.message || (success ? '操作成功' : '操作失败'),
    total,
  };
}

/**
 * 统一前后端分页参数转换
 * 根据项目规范，后端使用 page/size/sort/order，前端使用 current/pageSize
 * 后端页码从1开始，符合前端使用习惯
 *
 * @param {Object} params - 前端分页参数
 * @param {number} params.current - 当前页码（从1开始）
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序方向
 * @returns {Object} 后端需要的分页参数 { page, size, sort, order }
 */
export function convertToBackendPagination(params = {}) {
  const { current = 1, pageSize = 10, sortBy = '', sortOrder = 'desc', ...otherParams } = params;

  return {
    page: current, // 后端页码从1开始，直接使用前端值
    size: pageSize,
    sort: sortBy,
    order: sortOrder,
    ...otherParams,
  };
}

/**
 * 将后端分页响应转换为前端格式
 * @param {Object} response - 后端响应
 * @returns {Object} 前端需要的格式 { list, total, current, pageSize }
 */
export function convertFromBackendPagination(response) {
  if (!response) {
    return { list: [], total: 0, current: 1, pageSize: 10 };
  }

  const { list = [], total = 0, page = 1, size = 10 } = response;

  return {
    list,
    total,
    current: page,
    pageSize: size,
  };
}

export default {
  extractListData,
  extractSingleData,
  normalizePaginationParams,
  createFieldMapper,
  getNestedValue,
  getFieldValue,
  normalizeDeviceData,
  normalizeInventoryRecord,
  normalizeDataList,
  normalizeApiResponse,
  convertToBackendPagination,
  convertFromBackendPagination,
};
