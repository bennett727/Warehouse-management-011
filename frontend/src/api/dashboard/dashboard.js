/**
 * 仪表盘API
 * 用于获取系统统计数据和概览信息
 */
import { PAGINATION } from '@/constants';
import { DASHBOARD_API, DEVICE_API } from '@/constants/apiConstants';
import { convertDeviceStatus } from '@/utils/device';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('dashboardAPI');

/**
 * 获取设备统计数据
 * @returns {Promise} 设备统计数据
 */
export const getDeviceStatistics = async () => {
  return request.get(DEVICE_API.STATISTICS_STATUS);
};

/**
 * 获取区域设备统计数据
 * @param {number} areaId - 区域ID
 * @returns {Promise} 区域设备统计数据
 */
export const getAreaDeviceStatistics = async (areaId) => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/area/${areaId}`);
};

/**
 * 获取系统概览数据
 * @returns {Promise} 系统概览数据
 */
export const getSystemOverview = async () => {
  return request.get(DASHBOARD_API.OVERVIEW);
};

/**
 * 获取最近活动记录
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 最近活动记录
 */
export const getRecentActivity = async (
  params = { page: PAGINATION.DEFAULT_PAGE, pageSize: PAGINATION.DEFAULT_PAGE_SIZE }
) => {
  try {
    logger.debug('[getRecentActivity] 请求参数:', params);
    const response = await request.get(`${DASHBOARD_API.BASE}/activity`, { params });
    logger.debug('[getRecentActivity] 响应数据:', response);
    return response;
  } catch (error) {
    logger.error('[getRecentActivity] 请求失败:', error, {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

/**
 * 获取设备状态统计
 * @returns {Promise} 设备状态统计数据
 */
export const getDeviceStatusStatistics = async () => {
  const response = await request.get(DEVICE_API.STATISTICS_STATUS);

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
 * 获取增强的库存统计数据
 * @returns {Promise} 增强的库存统计数据，包括库存价值、购入趋势、保修状态、使用年限等
 */
export const getEnhancedInventoryStatistics = async () => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/enhanced`);
};

/**
 * 获取库存价值统计
 * @returns {Promise} 库存价值统计数据
 */
export const getInventoryValueStatistics = async () => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/value`);
};

/**
 * 获取购入趋势统计
 * @param {number} months - 统计月份数，默认为12
 * @returns {Promise} 购入趋势统计数据
 */
export const getPurchaseTrendStatistics = async (months = 12) => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/purchase-trend`, { params: { months } });
};

/**
 * 获取保修状态统计
 * @returns {Promise} 保修状态统计数据
 */
export const getWarrantyStatusStatistics = async () => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/warranty`);
};

/**
 * 获取即将过保修期的设备列表
 * @param {number} days - 天数
 * @returns {Promise} 即将过保修期的设备列表
 */
export const getDevicesExpiringSoon = async (days = 30) => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/expiring`, { params: { days } });
};

/**
 * 获取使用年限统计
 * @returns {Promise} 使用年限统计数据
 */
export const getUsageYearsStatistics = async () => {
  return request.get(`${DEVICE_API.STATISTICS_STATUS}/usage-years`);
};

/**
 * 获取待办任务列表
 * @returns {Promise} 待办任务列表
 */
export const getPendingTasks = async () => {
  try {
    logger.debug('[getPendingTasks] 请求待办任务');
    const response = await request.get(`${DASHBOARD_API.BASE}/tasks`);
    logger.debug('[getPendingTasks] 响应数据:', response);
    return response;
  } catch (error) {
    logger.error('[getPendingTasks] 请求失败:', error, {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
