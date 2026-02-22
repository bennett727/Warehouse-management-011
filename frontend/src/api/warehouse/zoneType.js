/**
 * 功能区类型管理 API
 */
import { ZONE_TYPE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取功能区类型列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getZoneTypeList = (params = {}) => {
  return request({
    url: ZONE_TYPE_API.LIST,
    method: 'get',
    params,
  });
};

/**
 * 获取所有启用的功能区类型
 * @returns {Promise}
 */
export const getActiveZoneTypes = () => {
  return request({
    url: ZONE_TYPE_API.ACTIVE,
    method: 'get',
  });
};

/**
 * 获取所有功能区类型
 * @returns {Promise}
 */
export const getAllZoneTypes = () => {
  return request({
    url: ZONE_TYPE_API.ALL,
    method: 'get',
  });
};

/**
 * 根据ID获取功能区类型
 * @param {number} id - 类型ID
 * @returns {Promise}
 */
export const getZoneTypeById = (id) => {
  return request({
    url: ZONE_TYPE_API.DETAIL(id),
    method: 'get',
  });
};

/**
 * 创建功能区类型
 * @param {Object} data - 类型数据
 * @returns {Promise}
 */
export const createZoneType = (data) => {
  return request({
    url: ZONE_TYPE_API.CREATE,
    method: 'post',
    data,
  });
};

/**
 * 更新功能区类型
 * @param {number} id - 类型ID
 * @param {Object} data - 类型数据
 * @returns {Promise}
 */
export const updateZoneType = (id, data) => {
  return request({
    url: ZONE_TYPE_API.UPDATE(id),
    method: 'put',
    data,
  });
};

/**
 * 删除功能区类型
 * @param {number} id - 类型ID
 * @returns {Promise}
 */
export const deleteZoneType = (id) => {
  return request({
    url: ZONE_TYPE_API.DELETE(id),
    method: 'delete',
  });
};

/**
 * 更新功能区类型状态
 * @param {number} id - 类型ID
 * @param {number} status - 状态
 * @returns {Promise}
 */
export const updateZoneTypeStatus = (id, status) => {
  return request({
    url: ZONE_TYPE_API.STATUS(id),
    method: 'put',
    params: { status },
  });
};

/**
 * 获取功能区类型统计
 * @returns {Promise}
 */
export const getZoneTypeStats = () => {
  return request({
    url: ZONE_TYPE_API.STATS,
    method: 'get',
  });
};

/**
 * 初始化系统预设类型
 * @returns {Promise}
 */
export const initializeZoneTypes = () => {
  return request({
    url: ZONE_TYPE_API.INIT,
    method: 'post',
  });
};
