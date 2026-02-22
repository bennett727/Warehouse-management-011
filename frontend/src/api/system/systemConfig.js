/**
 * 系统配置管理相关API服务
 * 处理系统配置的增删改查等操作
 */
import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取所有系统配置
 * @param {string} configType - 配置类型（可选：basic-基础配置，email-邮件配置，storage-存储配置，other-其他配置）
 * @returns {Promise} 系统配置列表
 */
export const getAllConfigs = async (configType) => {
  return request.get(SYSTEM_API.CONFIG_ALL, { params: { configType } });
};

/**
 * 根据ID查询系统配置
 * @param {string} configId - 配置ID
 * @returns {Promise} 系统配置对象
 */
export const getConfigById = async (configId) => {
  return request.get(`${SYSTEM_API.CONFIG}/${configId}`);
};

/**
 * 根据配置键查询配置值
 * @param {string} configKey - 配置键
 * @returns {Promise} 配置值
 */
export const getConfigValue = async (configKey) => {
  return request.get(`${SYSTEM_API.CONFIG}/value/${configKey}`);
};

/**
 * 根据配置类型获取配置映射
 * @param {string} configType - 配置类型
 * @returns {Promise} 配置映射
 */
export const getConfigMapByType = async (configType) => {
  return request.get(`${SYSTEM_API.CONFIG}/map/${configType}`);
};

/**
 * 创建系统配置
 * @param {object} configData - 系统配置信息
 * @returns {Promise} 创建后的系统配置对象
 */
export const createConfig = async (configData) => {
  return request.post(SYSTEM_API.CONFIG, configData);
};

/**
 * 更新系统配置
 * @param {string} configId - 配置ID
 * @param {object} configData - 系统配置信息
 * @returns {Promise} 更新后的系统配置对象
 */
export const updateConfig = async (configId, configData) => {
  return request.put(`${SYSTEM_API.CONFIG}/${configId}`, configData);
};

/**
 * 批量保存或更新系统配置
 * @param {Array<object>} configs - 系统配置列表
 * @returns {Promise} 保存后的系统配置列表
 */
export const saveOrUpdateConfigs = async (configs) => {
  return request.post(`${SYSTEM_API.CONFIG}/batch`, configs);
};

/**
 * 删除系统配置
 * @param {string} configId - 配置ID
 * @returns {Promise} 删除结果
 */
export const deleteConfig = async (configId) => {
  return request.delete(`${SYSTEM_API.CONFIG}/${configId}`);
};

/**
 * 批量删除系统配置
 * @param {Array<string>} configIds - 配置ID列表
 * @returns {Promise} 删除结果
 */
export const batchDeleteConfigs = async (configIds) => {
  return request.delete(`${SYSTEM_API.CONFIG}/batch`, { data: configIds });
};

/**
 * 初始化默认系统配置
 * @returns {Promise} 初始化结果
 */
export const initDefaultConfigs = async () => {
  return request.post(`${SYSTEM_API.CONFIG}/init`);
};

/**
 * 导出所有系统配置相关API
 */
export default {
  getAllConfigs,
  getConfigById,
  getConfigValue,
  getConfigMapByType,
  createConfig,
  updateConfig,
  saveOrUpdateConfigs,
  deleteConfig,
  batchDeleteConfigs,
  initDefaultConfigs,
};
