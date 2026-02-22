/**
 * 修复出库管理API
 * 处理设备修复出库、修复追踪、修复完成入库等操作
 */
import { INVENTORY_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 创建修复出库单
 * @param {object} data - 修复出库数据
 * @param {number} data.deviceId - 设备ID
 * @param {number} data.repairPersonId - 修复人员ID
 * @param {number} data.operatorId - 出库人员ID
 * @param {string} data.faultDescription - 故障描述
 * @param {array} data.faultImages - 故障图片列表
 * @param {number} data.estimatedDays - 预计修复天数
 * @param {string} data.repairLocation - 修复地点(INTERNAL/EXTERNAL)
 * @param {string} data.repairVendor - 外部维修单位
 * @returns {Promise} 创建结果
 */
export function createRepairOutbound(data) {
  return request({
    url: INVENTORY_API.REPAIR_OUTBOUND,
    method: 'post',
    data,
  });
}

/**
 * 获取修复出库列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.status - 修复状态
 * @param {string} params.deviceName - 设备名称
 * @returns {Promise} 修复出库列表
 */
export function getRepairOutboundList(params) {
  return request({
    url: INVENTORY_API.REPAIR_OUTBOUND_LIST,
    method: 'get',
    params,
  });
}

/**
 * 获取修复出库详情
 * @param {number} id - 修复出库单ID
 * @returns {Promise} 修复出库详情
 */
export function getRepairOutboundDetail(id) {
  return request({
    url: INVENTORY_API.REPAIR_OUTBOUND_DETAIL(id),
    method: 'get',
  });
}

/**
 * 更新修复进度
 * @param {number} id - 修复出库单ID
 * @param {object} data - 更新数据
 * @param {string} data.status - 修复状态
 * @param {string} data.progress - 进度描述
 * @param {array} data.images - 进度图片
 * @returns {Promise} 更新结果
 */
export function updateRepairProgress(id, data) {
  return request({
    url: INVENTORY_API.REPAIR_OUTBOUND_PROGRESS(id),
    method: 'put',
    data,
  });
}

/**
 * 完成修复入库
 * @param {number} id - 修复出库单ID
 * @param {object} data - 入库数据
 * @param {string} data.repairResult - 修复结果
 * @param {number} data.actualCost - 实际修复费用
 * @param {array} data.repairImages - 修复后图片
 * @param {string} data.remark - 备注
 * @returns {Promise} 完成结果
 */
export function completeRepairInbound(id, data) {
  return request({
    url: INVENTORY_API.REPAIR_OUTBOUND_COMPLETE(id),
    method: 'post',
    data,
  });
}

/**
 * 取消修复出库
 * @param {number} id - 修复出库单ID
 * @param {string} reason - 取消原因
 * @returns {Promise} 取消结果
 */
export function cancelRepairOutbound(id, reason) {
  return request({
    url: INVENTORY_API.REPAIR_OUTBOUND_CANCEL(id),
    method: 'post',
    params: { reason },
  });
}

/**
 * 获取修复统计信息
 * @param {object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 统计信息
 */
export function getRepairStatistics(params) {
  return request({
    url: INVENTORY_API.REPAIR_STATISTICS,
    method: 'get',
    params,
  });
}
