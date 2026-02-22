import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取仓库设备列表
 * @param {Object} params - 查询参数
 * @param {number} params.warehouseId - 仓库ID
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {number} params.deviceCategoryId - 设备分类ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getWarehouseDevices(params) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_WAREHOUSE_LIST,
    method: 'get',
    params,
  });
}

/**
 * 获取设备库存详情
 * @param {number} deviceId - 设备ID
 * @returns {Promise}
 */
export function getDeviceInventoryDetail(deviceId) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_DETAIL(deviceId),
    method: 'get',
  });
}

/**
 * 获取设备在各仓库的库存分布
 * @param {number} deviceId - 设备ID
 * @returns {Promise}
 */
export function getDeviceWarehouseDistribution(deviceId) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_DISTRIBUTION(deviceId),
    method: 'get',
  });
}

/**
 * 更新设备库存位置
 * @param {Object} data - 更新数据
 * @param {number} data.deviceId - 设备ID
 * @param {number} data.warehouseId - 仓库ID
 * @param {string} data.location - 新位置
 * @param {number} data.quantity - 数量
 * @returns {Promise}
 */
export function updateDeviceLocation(data) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_UPDATE_LOCATION,
    method: 'put',
    data,
  });
}

/**
 * 库存调整
 * @param {Object} data - 调整数据
 * @param {number} data.deviceId - 设备ID
 * @param {number} data.warehouseId - 仓库ID
 * @param {number} data.adjustQuantity - 调整数量
 * @param {string} data.adjustReason - 调整原因
 * @param {string} data.adjustType - 调整类型（increase/decrease）
 * @returns {Promise}
 */
export function adjustInventory(data) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_ADJUST,
    method: 'post',
    data,
  });
}

/**
 * 批量转移设备位置
 * @param {Object} data - 转移数据
 * @param {number} data.sourceWarehouseId - 源仓库ID
 * @param {number} data.targetWarehouseId - 目标仓库ID
 * @param {Array} data.deviceIds - 设备ID列表
 * @returns {Promise}
 */
export function batchTransferDevices(data) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_BATCH_TRANSFER,
    method: 'post',
    data,
  });
}

/**
 * 获取库存预警列表
 * @param {Object} params - 查询参数
 * @param {number} params.warehouseId - 仓库ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getInventoryAlerts(params) {
  return request({
    url: SYSTEM_API.INVENTORY_DEVICE_ALERTS,
    method: 'get',
    params,
  });
}
