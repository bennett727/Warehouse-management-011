/**
 * 全局搜索API
 * 提供统一的搜索接口，供搜索注册中心使用
 */

import { WAREHOUSE_API, ZONE_API, BIN_API, DEVICE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 搜索仓库
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>}
 */
export function searchWarehouses(query) {
  return request({
    url: WAREHOUSE_API.LIST,
    method: 'get',
    params: {
      keyword: query,
      page: 1,
      size: 10,
    },
  }).then((res) => {
    if (res.success && res.data) {
      return res.data.list || res.data || [];
    }
    return [];
  });
}

/**
 * 搜索功能区
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>}
 */
export function searchZones(query) {
  return request({
    url: ZONE_API.LIST,
    method: 'get',
    params: {
      keyword: query,
      page: 1,
      size: 10,
    },
  }).then((res) => {
    if (res.success && res.data) {
      return res.data.list || res.data || [];
    }
    return [];
  });
}

/**
 * 搜索货位
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>}
 */
export function searchBins(query) {
  return request({
    url: BIN_API.LIST,
    method: 'get',
    params: {
      keyword: query,
      page: 1,
      size: 10,
    },
  }).then((res) => {
    if (res.success && res.data) {
      return res.data.list || res.data || [];
    }
    return [];
  });
}

/**
 * 搜索设备
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>}
 */
export function searchDevices(query) {
  return request({
    url: DEVICE_API.LIST,
    method: 'get',
    params: {
      keyword: query,
      page: 1,
      size: 10,
    },
  }).then((res) => {
    if (res.success && res.data) {
      return res.data.list || res.data || [];
    }
    return [];
  });
}

/**
 * 批量搜索所有模块
 * @param {string} query - 搜索关键词
 * @returns {Promise<Object>}
 */
export function searchAll(query) {
  return Promise.all([searchWarehouses(query), searchZones(query), searchBins(query), searchDevices(query)]).then(
    ([warehouses, zones, bins, devices]) => ({
      warehouse: warehouses,
      zone: zones,
      bin: bins,
      device: devices,
    })
  );
}

export default {
  searchWarehouses,
  searchZones,
  searchBins,
  searchDevices,
  searchAll,
};
