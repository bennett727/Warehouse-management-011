import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取库存预警阈值配置列表
 * @param {Object} params - 查询参数
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {number} params.deviceTypeId - 设备类型ID
 * @param {number} params.warehouseId - 仓库ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getAlertThresholds(params) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS,
    method: 'get',
    params,
  });
}

/**
 * 获取库存预警阈值详情
 * @param {number} thresholdId - 阈值配置ID
 * @returns {Promise}
 */
export function getAlertThresholdDetail(thresholdId) {
  return request({
    url: `${SYSTEM_API.INVENTORY_ALERT_THRESHOLDS}/${thresholdId}`,
    method: 'get',
  });
}

/**
 * 创建库存预警阈值配置
 * @param {Object} data - 阈值配置数据
 * @param {number} data.deviceId - 设备ID
 * @param {number} data.warehouseId - 仓库ID
 * @param {number} data.minStock - 最小库存阈值
 * @param {number} data.maxStock - 最大库存阈值
 * @param {number} data.reorderPoint - 补货点
 * @param {string} data.alertLevel - 预警级别（critical/warning/info）
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export function createAlertThreshold(data) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS,
    method: 'post',
    data,
  });
}

/**
 * 更新库存预警阈值配置
 * @param {number} thresholdId - 阈值配置ID
 * @param {Object} data - 更新数据
 * @param {number} data.minStock - 最小库存阈值
 * @param {number} data.maxStock - 最大库存阈值
 * @param {number} data.reorderPoint - 补货点
 * @param {string} data.alertLevel - 预警级别
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export function updateAlertThreshold(thresholdId, data) {
  return request({
    url: `${SYSTEM_API.INVENTORY_ALERT_THRESHOLDS}/${thresholdId}`,
    method: 'put',
    data,
  });
}

/**
 * 删除库存预警阈值配置
 * @param {number} thresholdId - 阈值配置ID
 * @returns {Promise}
 */
export function deleteAlertThreshold(thresholdId) {
  return request({
    url: `${SYSTEM_API.INVENTORY_ALERT_THRESHOLDS}/${thresholdId}`,
    method: 'delete',
  });
}

/**
 * 批量删除库存预警阈值配置
 * @param {Array<number>} thresholdIds - 阈值配置ID列表
 * @returns {Promise}
 */
export function batchDeleteAlertThresholds(thresholdIds) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_BATCH,
    method: 'delete',
    data: { thresholdIds },
  });
}

/**
 * 批量设置库存预警阈值
 * @param {Object} data - 批量设置数据
 * @param {Array<number>} data.deviceIds - 设备ID列表
 * @param {number} data.warehouseId - 仓库ID
 * @param {number} data.minStock - 最小库存阈值
 * @param {number} data.maxStock - 最大库存阈值
 * @param {number} data.reorderPoint - 补货点
 * @param {string} data.alertLevel - 预警级别
 * @returns {Promise}
 */
export function batchSetAlertThresholds(data) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_BATCH_SET,
    method: 'post',
    data,
  });
}

/**
 * 导入库存预警阈值配置
 * @param {FormData} formData - 表单数据
 * @returns {Promise}
 */
export function importAlertThresholds(formData) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_IMPORT,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 导出库存预警阈值配置
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportAlertThresholds(params) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_EXPORT,
    method: 'get',
    params,
    responseType: 'blob',
  });
}

/**
 * 获取库存预警阈值模板
 * @returns {Promise}
 */
export function getAlertThresholdTemplate() {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_TEMPLATE,
    method: 'get',
    responseType: 'blob',
  });
}

/**
 * 获取预警级别配置
 * @returns {Promise}
 */
export function getAlertLevelConfig() {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_LEVEL_CONFIG,
    method: 'get',
  });
}

/**
 * 更新预警级别配置
 * @param {Object} data - 预警级别配置数据
 * @param {number} data.criticalThreshold - 严重预警阈值（库存低于此值的百分比）
 * @param {number} data.warningThreshold - 一般预警阈值（库存低于此值的百分比）
 * @returns {Promise}
 */
export function updateAlertLevelConfig(data) {
  return request({
    url: SYSTEM_API.INVENTORY_ALERT_THRESHOLDS_LEVEL_CONFIG,
    method: 'put',
    data,
  });
}

export default {
  getAlertThresholds,
  getAlertThresholdDetail,
  createAlertThreshold,
  updateAlertThreshold,
  deleteAlertThreshold,
  batchDeleteAlertThresholds,
  batchSetAlertThresholds,
  importAlertThresholds,
  exportAlertThresholds,
  getAlertThresholdTemplate,
  getAlertLevelConfig,
  updateAlertLevelConfig,
};
