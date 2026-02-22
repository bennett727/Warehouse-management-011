/**
 * 仓库功能区管理 API
 */
import { WAREHOUSE_ZONE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取功能区列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getWarehouseZoneList = (params = {}) => {
  return request({
    url: WAREHOUSE_ZONE_API.LIST,
    method: 'get',
    params,
  });
};

/**
 * 根据ID获取功能区
 * @param {number} id - 功能区ID
 * @returns {Promise}
 */
export const getWarehouseZoneById = (id) => {
  return request({
    url: WAREHOUSE_ZONE_API.DETAIL(id),
    method: 'get',
  });
};

/**
 * 根据仓库ID获取功能区列表
 * @param {number} warehouseId - 仓库ID
 * @returns {Promise}
 */
export const getWarehouseZonesByWarehouseId = (warehouseId) => {
  return request({
    url: WAREHOUSE_ZONE_API.BY_WAREHOUSE(warehouseId),
    method: 'get',
  });
};

/**
 * 创建功能区
 * @param {Object} data - 功能区数据
 * @returns {Promise}
 */
export const createWarehouseZone = (data) => {
  return request({
    url: WAREHOUSE_ZONE_API.CREATE,
    method: 'post',
    data,
  });
};

/**
 * 更新功能区
 * @param {number} id - 功能区ID
 * @param {Object} data - 功能区数据
 * @returns {Promise}
 */
export const updateWarehouseZone = (id, data) => {
  return request({
    url: WAREHOUSE_ZONE_API.UPDATE(id),
    method: 'put',
    data,
  });
};

/**
 * 删除功能区
 * @param {number} id - 功能区ID
 * @returns {Promise}
 */
export const deleteWarehouseZone = (id) => {
  return request({
    url: WAREHOUSE_ZONE_API.DELETE(id),
    method: 'delete',
  });
};

/**
 * 更新功能区状态
 * @param {number} id - 功能区ID
 * @param {number} status - 状态
 * @returns {Promise}
 */
export const updateWarehouseZoneStatus = (id, status) => {
  return request({
    url: `${WAREHOUSE_ZONE_API.DETAIL(id)}/status`,
    method: 'put',
    params: { status },
  });
};

/**
 * 获取功能区统计
 * @returns {Promise}
 */
export const getWarehouseZoneStats = () => {
  return request({
    url: WAREHOUSE_ZONE_API.STATS,
    method: 'get',
  });
};
