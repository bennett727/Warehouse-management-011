import { DEVICE_API, INVENTORY_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取所有库存记录（合并入库、出库、调拨等）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.orderNo - 记录编号
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {string} params.operation - 操作类型 (inbound/outbound/transfer/all)
 * @param {string} params.warehouseId - 仓库ID
 * @param {string} params.startDate - 开始时间
 * @param {string} params.endDate - 结束时间
 * @returns {Promise}
 */
export const getAllInventoryRecords = (params) => {
  return request({
    url: INVENTORY_API.RECORDS_ALL || '/inventory/records/all',
    method: 'get',
    params,
  });
};

/**
 * 获取库存记录统计信息
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getInventoryRecordsStatistics = (params) => {
  return request({
    url: INVENTORY_API.RECORDS_STATISTICS || '/inventory/records/statistics',
    method: 'get',
    params,
  });
};

/**
 * 获取入库记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.orderNo - 记录编号
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {string} params.operator - 操作员
 * @param {string} params.startDate - 开始时间
 * @param {string} params.endDate - 结束时间
 * @param {string} params.status - 状态
 * @returns {Promise}
 */
export const getInboundRecords = (params) => {
  return request({
    url: DEVICE_API.STOCK_ORDERS_INBOUND_LIST,
    method: 'get',
    params: {
      ...params,
      orderType: 0,
    },
  });
};

/**
 * 获取出库记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.orderNo - 记录编号
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {string} params.operator - 操作员
 * @param {string} params.startDate - 开始时间
 * @param {string} params.endDate - 结束时间
 * @param {string} params.status - 状态
 * @returns {Promise}
 */
export const getOutboundRecords = (params) => {
  return request({
    url: DEVICE_API.STOCK_ORDERS_OUTBOUND_LIST,
    method: 'get',
    params: {
      ...params,
      orderType: 1,
    },
  });
};

/**
 * 获取归还记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.orderNo - 记录编号
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {string} params.operator - 操作员
 * @param {string} params.startDate - 开始时间
 * @param {string} params.endDate - 结束时间
 * @param {string} params.status - 状态
 * @returns {Promise}
 */
export const getReturnRecords = (params) => {
  return request({
    url: DEVICE_API.STOCK_ORDERS_OUTBOUND_LIST,
    method: 'get',
    params: {
      ...params,
      orderType: 1,
      purpose: 2,
    },
  });
};

/**
 * 获取出入库记录详情
 * @param {string} id - 记录ID
 * @returns {Promise}
 */
export const getRecordDetail = (id) => {
  return request({
    url: DEVICE_API.STOCK_ORDERS_INBOUND_DETAIL(id),
    method: 'get',
  });
};

/**
 * 导出入入库记录
 * @param {Object} params - 查询参数
 * @param {Array} params.records - 要导出的记录列表
 * @returns {Promise}
 */
export const exportInventoryRecords = (params) => {
  return request({
    url: DEVICE_API.STOCK_ORDERS_INBOUND_LIST,
    method: 'post',
    data: params,
    responseType: 'blob',
  });
};
