/**
 * 设备类型管理API
 * 处理设备类型的增删改查、树结构生成等操作
 */
import { DEVICE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取设备类型列表（不分页）
 * @returns {Promise} 设备类型列表
 */
export const getDeviceTypes = async () => {
  return request.get(DEVICE_API.TYPE_ALL);
};

/**
 * 获取设备类型分页列表
 * @param {object} params - 查询参数
 * @param {string} params.name - 类型名称
 * @param {string} params.code - 类型编码
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 设备类型分页列表
 */
export const getDeviceTypeList = async (params) => {
  return request.get(DEVICE_API.TYPE, { params });
};

/**
 * 添加设备类型
 * @param {object} typeData - 设备类型数据
 * @param {string} typeData.code - 类型编码
 * @param {string} typeData.name - 类型名称
 * @param {string} typeData.description - 类型描述
 * @returns {Promise} 添加结果
 */
export const addDeviceType = async (typeData) => {
  return request.post(DEVICE_API.TYPE, typeData);
};

/**
 * 更新设备类型
 * @param {object} typeData - 设备类型数据
 * @param {string} typeData.id - 类型ID
 * @param {string} typeData.code - 类型编码
 * @param {string} typeData.name - 类型名称
 * @param {string} typeData.description - 类型描述
 * @returns {Promise} 更新结果
 */
export const updateDeviceType = async (typeData) => {
  return request.put(`${DEVICE_API.TYPE}/${typeData.id}`, typeData);
};

/**
 * 删除设备类型
 * @param {string} typeId - 类型ID
 * @returns {Promise} 删除结果
 */
export const deleteDeviceType = async (typeId) => {
  return request.delete(`${DEVICE_API.TYPE}/${typeId}`);
};

/**
 * 获取设备类型统计
 * @param {object} params - 查询参数
 * @param {string} params.timeRange - 时间范围（可选，如'lastMonth'）
 * @returns {Promise} 类型统计数据
 */
export const getDeviceTypeStats = async (params = {}) => {
  return request.get(DEVICE_API.TYPE_STATS, { params });
};

/**
 * 获取设备类型树结构
 * @param {object} params - 查询参数
 * @param {number} params.status - 状态筛选（可选）
 * @returns {Promise} 设备类型树结构
 */
export const getDeviceTypeTree = async (params = {}) => {
  return request.get(DEVICE_API.TYPE_TREE, { params });
};

/**
 * 获取设备类型汇总数据
 * @returns {Promise} 设备类型汇总列表
 */
export const getDeviceTypeSummary = async () => {
  return request.get(DEVICE_API.TYPE_SUMMARY);
};

/**
 * 导出设备类型
 * @param {object} params - 查询参数
 * @returns {Promise} 导出结果
 */
export const exportDeviceTypes = async (params = {}) => {
  return request.get(DEVICE_API.TYPE_EXPORT, {
    params,
    responseType: 'blob',
  });
};

/**
 * 设备类型管理API集合
 */
export const deviceTypeApi = {
  list: getDeviceTypeList,
  tree: getDeviceTypeTree,
  summary: getDeviceTypeSummary,
  add: addDeviceType,
  createDeviceType: addDeviceType,
  update: updateDeviceType,
  delete: deleteDeviceType,
};

// 导出别名，保持兼容性
export const createDeviceType = addDeviceType;
