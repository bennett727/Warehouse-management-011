import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取仓库概览统计
 * @returns {Promise}
 */
export const getWarehouseOverviewStats = () => {
  return request({
    url: SYSTEM_API.WAREHOUSE_OVERVIEW_STATS,
    method: 'get',
  });
};

/**
 * 获取仓库列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getWarehouseList = (params = {}) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_LIST,
    method: 'get',
    params,
  });
};

/**
 * 获取仓库详情
 * @param {string} id - 仓库ID
 * @returns {Promise}
 */
export const getWarehouseDetail = (id) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_DETAIL(id),
    method: 'get',
  });
};

/**
 * 添加仓库
 * @param {Object} data - 仓库数据
 * @param {string} data.name - 仓库名称
 * @param {string} data.code - 仓库编码
 * @param {string} data.address - 仓库地址
 * @param {string} data.manager - 仓库管理员
 * @param {string} data.contactPhone - 联系电话
 * @param {string} data.description - 仓库描述
 * @returns {Promise}
 */
export const addWarehouse = (data) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_ADD,
    method: 'post',
    data,
  });
};

/**
 * 更新仓库
 * @param {string} id - 仓库ID
 * @param {Object} data - 仓库数据
 * @returns {Promise}
 */
export const updateWarehouse = (id, data) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_UPDATE(id),
    method: 'put',
    data,
  });
};

/**
 * 删除仓库
 * @param {string} id - 仓库ID
 * @returns {Promise}
 */
export const deleteWarehouse = (id) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_DELETE(id),
    method: 'delete',
  });
};

/**
 * 获取仓库库存统计
 * @param {string} warehouseId - 仓库ID
 * @returns {Promise}
 */
export const getWarehouseInventoryStats = (warehouseId) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_STATS(warehouseId),
    method: 'get',
  });
};

/**
 * 获取仓库区域列表
 * @param {string} warehouseId - 仓库ID
 * @returns {Promise}
 */
export const getWarehouseZones = (warehouseId) => {
  return request({
    url: SYSTEM_API.INVENTORY_WAREHOUSE_ZONES(warehouseId),
    method: 'get',
  });
};

/**
 * 更新仓库地址
 * @param {string} id - 仓库ID
 * @param {Object} data - 地址数据
 * @param {number} data.provinceId - 省份ID
 * @param {number} data.cityId - 城市ID
 * @param {number} data.districtId - 区县ID
 * @param {string} data.detailAddress - 详细地址
 * @param {number} data.longitude - 经度
 * @param {number} data.latitude - 纬度
 * @returns {Promise}
 */
export const updateWarehouseAddress = (id, data) => {
  return request({
    url: `/warehouses/${id}/address`,
    method: 'put',
    data,
  });
};

/**
 * 按行政区划筛选仓库
 * @param {Object} params - 筛选参数
 * @param {number} params.provinceId - 省份ID
 * @param {number} params.cityId - 城市ID
 * @param {number} params.districtId - 区县ID
 * @returns {Promise}
 */
export const getWarehousesByDivision = (params = {}) => {
  return request({
    url: '/warehouses/by-division',
    method: 'get',
    params,
  });
};

/**
 * 获取所有启用的仓库
 * @returns {Promise}
 */
export const getActiveWarehouses = () => {
  return request({
    url: '/warehouses/active',
    method: 'get',
  });
};
