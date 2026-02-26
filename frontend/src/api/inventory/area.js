import { AREA_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取区域列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getAreaList = (params = {}) => {
  return request({
    url: AREA_API.LIST,
    method: 'get',
    params,
  });
};

/**
 * 获取区域详情
 * @param {string} id - 区域ID
 * @returns {Promise}
 */
export const getAreaDetail = (id) => {
  return request({
    url: AREA_API.DETAIL(id),
    method: 'get',
  });
};

/**
 * 添加区域
 * @param {Object} data - 区域数据
 * @returns {Promise}
 */
export const addArea = (data) => {
  return request({
    url: AREA_API.CREATE,
    method: 'post',
    data,
  });
};

/**
 * 更新区域
 * @param {string} id - 区域ID
 * @param {Object} data - 区域数据
 * @returns {Promise}
 */
export const updateArea = (id, data) => {
  return request({
    url: AREA_API.UPDATE(id),
    method: 'put',
    data,
  });
};

/**
 * 删除区域
 * @param {string} id - 区域ID
 * @returns {Promise}
 */
export const deleteArea = (id) => {
  return request({
    url: AREA_API.DELETE(id),
    method: 'delete',
  });
};
