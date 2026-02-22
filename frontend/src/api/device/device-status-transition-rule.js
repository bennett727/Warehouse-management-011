/**
 * 设备状态转换规则API
 * 处理设备状态转换规则的增删改查、验证等操作
 */
import { DEVICE_STATUS_TRANSITION_RULE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取设备状态转换规则列表
 * @param {object} params - 查询参数
 * @param {string} params.deviceTypeId - 设备类型ID
 * @param {string} params.sourceStatus - 源状态
 * @param {string} params.targetStatus - 目标状态
 * @param {boolean} params.enabled - 是否启用
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 规则分页列表
 */
export const getDeviceStatusTransitionRules = async (params) => {
  return request.get(DEVICE_STATUS_TRANSITION_RULE_API.LIST, { params });
};

/**
 * 获取指定设备类型的状态转换规则
 * @param {string} deviceTypeId - 设备类型ID
 * @returns {Promise} 规则列表
 */
export const getRulesByDeviceType = async (deviceTypeId) => {
  return request.get(DEVICE_STATUS_TRANSITION_RULE_API.BY_DEVICE_TYPE(deviceTypeId));
};

/**
 * 添加设备状态转换规则
 * @param {object} ruleData - 规则数据
 * @param {string} ruleData.deviceTypeId - 设备类型ID
 * @param {string} ruleData.sourceStatus - 源状态
 * @param {string} ruleData.targetStatus - 目标状态
 * @param {boolean} ruleData.enabled - 是否启用
 * @param {string} ruleData.description - 规则描述
 * @returns {Promise} 添加结果
 */
export const addDeviceStatusTransitionRule = async (ruleData) => {
  return request.post(DEVICE_STATUS_TRANSITION_RULE_API.BASE, ruleData);
};

/**
 * 更新设备状态转换规则
 * @param {object} ruleData - 规则数据
 * @param {string} ruleData.id - 规则ID
 * @param {string} ruleData.deviceTypeId - 设备类型ID
 * @param {string} ruleData.sourceStatus - 源状态
 * @param {string} ruleData.targetStatus - 目标状态
 * @param {boolean} ruleData.enabled - 是否启用
 * @param {string} ruleData.description - 规则描述
 * @returns {Promise} 更新结果
 */
export const updateDeviceStatusTransitionRule = async (ruleData) => {
  return request.put(DEVICE_STATUS_TRANSITION_RULE_API.DETAIL(ruleData.id), ruleData);
};

/**
 * 删除设备状态转换规则
 * @param {string} ruleId - 规则ID
 * @returns {Promise} 删除结果
 */
export const deleteDeviceStatusTransitionRule = async (ruleId) => {
  return request.delete(DEVICE_STATUS_TRANSITION_RULE_API.DETAIL(ruleId));
};

/**
 * 批量删除设备状态转换规则
 * @param {Array<string>} ruleIds - 规则ID列表
 * @returns {Promise} 删除结果
 */
export const batchDeleteDeviceStatusTransitionRules = async (ruleIds) => {
  return request.delete(DEVICE_STATUS_TRANSITION_RULE_API.BATCH_DELETE, { data: { ids: ruleIds } });
};

/**
 * 验证设备状态转换是否合法
 * @param {string} deviceTypeId - 设备类型ID
 * @param {string} sourceStatus - 源状态
 * @param {string} targetStatus - 目标状态
 * @returns {Promise} 验证结果
 */
export const validateStatusTransition = async (deviceTypeId, sourceStatus, targetStatus) => {
  return request.get(DEVICE_STATUS_TRANSITION_RULE_API.VALIDATE_TRANSITION, {
    params: { deviceTypeId, fromStatus: sourceStatus, toStatus: targetStatus },
  });
};

/**
 * 获取可转换的目标状态列表
 * @param {string} deviceTypeId - 设备类型ID
 * @param {string} sourceStatus - 源状态
 * @returns {Promise} 可转换的目标状态列表
 */
export const getAvailableTargetStatuses = async (deviceTypeId, sourceStatus) => {
  return request.get(DEVICE_STATUS_TRANSITION_RULE_API.AVAILABLE_TARGET_STATUSES, {
    params: { deviceTypeId, fromStatus: sourceStatus },
  });
};

/**
 * 获取指定设备类型的所有启用的规则
 * @param {string} deviceTypeId - 设备类型ID
 * @returns {Promise} 启用的规则列表
 */
export const getEnabledRulesByDeviceType = async (deviceTypeId) => {
  return request.get(DEVICE_STATUS_TRANSITION_RULE_API.ENABLED_BY_DEVICE_TYPE(deviceTypeId));
};

/**
 * 设备状态转换规则API集合
 */
export const deviceStatusTransitionRuleApi = {
  list: getDeviceStatusTransitionRules,
  getByDeviceType: getRulesByDeviceType,
  add: addDeviceStatusTransitionRule,
  update: updateDeviceStatusTransitionRule,
  delete: deleteDeviceStatusTransitionRule,
  batchDelete: batchDeleteDeviceStatusTransitionRules,
  validate: validateStatusTransition,
  getAvailableTargetStatuses,
  getEnabledRulesByDeviceType,
};

// 导出别名，保持兼容性
export const createDeviceStatusTransitionRule = addDeviceStatusTransitionRule;
export const getDeviceStatusTransitionRuleList = getDeviceStatusTransitionRules;
