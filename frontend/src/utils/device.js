/**
 * 设备相关工具函数
 * @file: device.js
 * @description: 处理设备相关的工具函数，包括状态映射转换
 * @author: Trae AI
 * @createTime: 2026-01-02 22:50:00
 * @version: 3.0
 */

/**
 * 后端状态值到前端状态字符串的映射
 * 将后端返回的整数状态值转换为前端期望的字符串状态值
 * 后端使用整数状态值：-1(待入库), 0(在库), 1(使用中), 2(已安装), 3(维护中), 4(维修中), 5(已报废)
 * 前端使用字符串状态值
 */
const BACKEND_TO_FRONTEND_STATUS_MAP = {
  '-1': 'pending_inbound',
  '-1.0': 'pending_inbound',
  0: 'in_stock',
  '0.0': 'in_stock',
  1: 'in_use',
  '1.0': 'in_use',
  2: 'installed',
  '2.0': 'installed',
  3: 'maintenance',
  '3.0': 'maintenance',
  4: 'repair',
  '4.0': 'repair',
  5: 'scrapped',
  '5.0': 'scrapped',
  PENDING_INBOUND: 'pending_inbound',
  IN_STOCK: 'in_stock',
  IN_USE: 'in_use',
  INSTALLED: 'installed',
  MAINTENANCE: 'maintenance',
  REPAIRING: 'repair',
  SCRAPPED: 'scrapped',
  NORMAL: 'normal',
};

/**
 * 前端状态字符串到后端状态值的映射
 * 将前端字符串状态值转换为后端整数状态值
 */
const FRONTEND_TO_BACKEND_STATUS_MAP = {
  pending_inbound: -1,
  in_stock: 0,
  in_use: 1,
  installed: 2,
  maintenance: 3,
  repair: 4,
  repairing: 4,
  scrapped: 5,
};

/**
 * 转换设备状态（后端到前端）
 * 将设备列表或单个设备对象中的后端状态值转换为前端字符串状态
 * @param {Array|Object} data - 设备数据（可以是单个设备对象或设备列表）
 * @returns {Array|Object} 转换后的设备数据
 */
export const convertDeviceStatus = (data) => {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((device) => convertDeviceStatus(device));
  }

  if (typeof data === 'object') {
    const convertedData = { ...data };

    // 转换 status 字段
    if (data.status !== undefined) {
      const mappedStatus = BACKEND_TO_FRONTEND_STATUS_MAP[data.status];
      if (mappedStatus !== undefined) {
        convertedData.status = mappedStatus;
      }
      // 如果没有映射，保持原值不变
    }

    // 转换 lifecycleStage 字段
    if (data.lifecycleStage !== undefined) {
      const mappedStage = BACKEND_TO_FRONTEND_STATUS_MAP[data.lifecycleStage];
      if (mappedStage !== undefined) {
        convertedData.lifecycleStage = mappedStage;
      }
    }

    return convertedData;
  }

  return data;
};

/**
 * 将设备状态从前端格式转换为后端格式
 * 用于发送请求时的状态值转换
 * @param {Array|Object} data - 设备数据
 * @returns {Array|Object} 转换后的设备数据
 */
export const convertDeviceStatusToBackend = (data) => {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((device) => convertDeviceStatusToBackend(device));
  }

  if (typeof data === 'object') {
    const convertedData = { ...data };

    // 转换 status 字段
    if (data.status !== undefined) {
      const mappedStatus = FRONTEND_TO_BACKEND_STATUS_MAP[data.status];
      if (mappedStatus !== undefined) {
        convertedData.status = mappedStatus;
      } else if (typeof data.status === 'string') {
        // 尝试将字符串转换为数字
        const numStatus = Number(data.status);
        if (!isNaN(numStatus)) {
          convertedData.status = numStatus;
        }
      }
    }

    // 转换 lifecycleStage 字段
    if (data.lifecycleStage !== undefined) {
      const mappedStage = FRONTEND_TO_BACKEND_STATUS_MAP[data.lifecycleStage];
      if (mappedStage !== undefined) {
        convertedData.lifecycleStage = mappedStage;
      } else if (typeof data.lifecycleStage === 'string') {
        const numStage = Number(data.lifecycleStage);
        if (!isNaN(numStage)) {
          convertedData.lifecycleStage = numStage;
        }
      }
    }

    return convertedData;
  }

  return data;
};

/**
 * 获取后端状态值对应的标准前端状态值
 * @param {string|number} backendStatus - 后端状态值
 * @returns {string|number} 前端状态值（字符串或原值）
 */
export const getFrontendStatus = (backendStatus) => {
  const mappedStatus = BACKEND_TO_FRONTEND_STATUS_MAP[backendStatus];
  if (mappedStatus !== undefined) {
    return mappedStatus;
  }
  // 如果没有映射，返回原值
  return backendStatus;
};

/**
 * 获取前端状态值对应的后端状态值
 * @param {string|number} frontendStatus - 前端状态值
 * @returns {number|string} 后端状态值（数字或原值）
 */
export const getBackendStatus = (frontendStatus) => {
  const mappedStatus = FRONTEND_TO_BACKEND_STATUS_MAP[frontendStatus];
  if (mappedStatus !== undefined) {
    return mappedStatus;
  }
  // 如果没有映射，尝试转换为数字
  const numStatus = Number(frontendStatus);
  if (!isNaN(numStatus)) {
    return numStatus;
  }
  // 如果转换失败，返回原值
  return frontendStatus;
};
