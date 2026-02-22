/**
 * 设备状态管理API
 * 处理设备状态转换、状态统计等操作
 */
import { DEVICE_API, DEVICE_STATUS_API } from '@/constants/apiConstants';
import { convertDeviceStatus, convertDeviceStatusToBackend } from '@/utils/device';
import request from '@/utils/request';

/**
 * 更新设备状态
 * @param {string} deviceId - 设备ID
 * @param {string} status - 新状态
 * @param {object} data - 状态转换相关数据
 * @param {string} data.remark - 备注
 * @param {string} [data.outboundType] - 出库类型 (仅当从库存状态转换时需要)
 * @param {string} [data.repairNumber] - 维修单号 (仅当转换为维修中状态时需要)
 * @param {string} [data.installationId] - 安装记录ID (仅当转换为已安装状态时需要)
 * @returns {Promise} 更新结果
 */
export const updateDeviceStatus = async (deviceId, status, data = {}) => {
  const backendStatus = convertDeviceStatusToBackend({ status }).status;
  const { remark = '', ...extraData } = data;
  return request.put(DEVICE_STATUS_API.UPDATE(deviceId), { status: backendStatus, remark, ...extraData });
};

/**
 * 获取可用设备列表（用于出库）
 * @returns {Promise} 可用设备列表
 */
export const getAvailableDevices = async () => {
  const response = await request.get(DEVICE_API.LIST, { params: { status: 'IN_STOCK' } });

  if (response.data && response.data.devices) {
    response.data.devices = convertDeviceStatus(response.data.devices);
  } else if (response.data && response.data.records) {
    response.data.records = convertDeviceStatus(response.data.records);
  } else if (Array.isArray(response.data)) {
    response.data = convertDeviceStatus(response.data);
  }

  return response;
};

/**
 * 标记设备为故障状态
 * @param {Array<string>|string} deviceIds - 设备ID数组或单个设备ID
 * @param {object} faultData - 故障信息
 * @returns {Promise} 标记结果
 */
export const markDeviceFaulty = async (deviceIds, faultData = {}) => {
  const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
  return request.post(DEVICE_STATUS_API.MARK_FAULTY, { deviceIds: ids, ...faultData });
};

/**
 * 获取设备状态统计
 * @param {object} params - 查询参数
 * @param {string} params.timeRange - 时间范围（可选，如'lastMonth'）
 * @returns {Promise} 状态统计数据
 */
export const getDeviceStatusStats = async (params = {}) => {
  const response = await request.get(DEVICE_STATUS_API.STATS_STATUS, { params });

  // Convert status values in statistics data from backend to frontend format
  if (response.data && typeof response.data === 'object') {
    // If response contains status-related fields, convert them
    Object.keys(response.data).forEach((key) => {
      // If key contains status or if value looks like a status value, convert it
      if (
        typeof response.data[key] === 'string' &&
        (response.data[key] === 'IN_STOCK' ||
          response.data[key] === 'INSTALLED' ||
          response.data[key] === 'REPAIRING' ||
          response.data[key] === 'SCRAPPED')
      ) {
        response.data[key] = convertDeviceStatus({ status: response.data[key] }).status;
      } else if (Array.isArray(response.data[key])) {
        // If it's an array of objects that might contain status fields
        response.data[key] = response.data[key].map((item) => {
          if (typeof item === 'object' && item.status) {
            return convertDeviceStatus(item);
          }
          return item;
        });
      }
    });
  }

  return response;
};

/**
 * 获取设备状态列表
 * @param {object} params - 查询参数
 * @returns {Promise} 设备状态列表
 */
export const getDeviceStatusList = async (params) => {
  const response = await request.get(DEVICE_STATUS_API.LIST, { params });

  // Convert status values from backend to frontend format
  if (response.data && response.data.devices) {
    response.data.devices = convertDeviceStatus(response.data.devices);
  } else if (response.data && response.data.records) {
    response.data.records = convertDeviceStatus(response.data.records);
  } else if (Array.isArray(response.data)) {
    response.data = convertDeviceStatus(response.data);
  }

  return response;
};
