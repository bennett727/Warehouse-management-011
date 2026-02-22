/**
 * 设备基本信息管理API
 * 处理设备的增删改查、详情获取、导入导出等操作
 * 与后端DeviceController保持一致
 */
import { DEVICE_API } from '@/constants/apiConstants';
import { convertDeviceStatus, convertDeviceStatusToBackend } from '@/utils/device';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('deviceAPI');

/**
 * 获取设备列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码（从1开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.typeId - 设备类型ID
 * @param {string} params.status - 设备状态
 * @param {string} params.areaId - 区域ID
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.sort - 排序字段
 * @param {string} params.order - 排序方向（asc或desc）
 * @returns {Promise} 设备列表数据
 */
export const getDeviceList = async (params, config = {}) => {
  try {
    logger.debug('[getDeviceList] 请求参数:', params);
    const response = await request.get(DEVICE_API.LIST, {
      params,
      ...config,
    });
    logger.debug('[getDeviceList] 响应数据:', response);

    if (response.data) {
      if (response.data.records) {
        response.data.records = convertDeviceStatus(response.data.records);
      }
    }

    return response;
  } catch (error) {
    if (error.name === 'CanceledError' || error.name === 'AbortError') {
      throw error;
    }
    logger.error('[getDeviceList] 请求失败:', error, {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getDeviceListWithRecords = async (params) => {
  try {
    logger.debug('[getDeviceListWithRecords] 请求参数:', params);
    const response = await request.get(DEVICE_API.LIST, { params });
    logger.debug('[getDeviceListWithRecords] 响应数据:', response);

    if (response.data) {
      if (response.data.records) {
        response.data.records = convertDeviceStatus(response.data.records);
      }
    }

    return response;
  } catch (error) {
    logger.error('[getDeviceListWithRecords] 请求失败:', error, {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getDevices = getDeviceList;

/**
 * 获取设备详情
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 设备详情
 */
export const getDeviceDetail = async (deviceId) => {
  const response = await request.get(DEVICE_API.DETAIL(deviceId));

  // 转换设备状态以确保前后端数据一致性
  if (response.data) {
    response.data = convertDeviceStatus(response.data);
  }

  return response;
};

/**
 * 获取设备详情（别名，兼容旧代码）
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 设备详情
 */
export const getDeviceById = async (deviceId) => {
  const response = await getDeviceDetail(deviceId);

  // 转换设备状态以确保前后端数据一致性
  if (response.data) {
    response.data = convertDeviceStatus(response.data);
  }

  return response;
};

/**
 * 保存设备安装信息
 * @param {object} installData - 安装信息数据
 * @param {string|number} installData.deviceId - 设备ID
 * @returns {Promise} 保存结果
 */
export const saveDeviceInstall = async (installData) => {
  return request.post(`${DEVICE_API.DETAIL(installData.deviceId)}/install`, installData);
};

/**
 * 创建新设备
 * @param {object} deviceData - 设备信息
 * @returns {Promise} 创建结果
 */
export const createDevice = async (deviceData) => {
  // 转换设备状态以确保发送正确的后端格式
  const convertedData = convertDeviceStatusToBackend(deviceData);
  const response = await request.post(DEVICE_API.CREATE, convertedData);

  // 转换返回的设备状态以确保前后端数据一致性
  if (response.data) {
    response.data = convertDeviceStatus(response.data);
  }

  return response;
};

/**
 * 更新设备信息
 * @param {string|number} deviceId - 设备ID
 * @param {object} deviceData - 设备信息
 * @returns {Promise} 更新结果
 */
export const updateDevice = async (deviceId, deviceData) => {
  // 转换设备状态以确保发送正确的后端格式
  const convertedData = convertDeviceStatusToBackend(deviceData);
  const response = await request.put(DEVICE_API.UPDATE(deviceId), convertedData);

  // 转换返回的设备状态以确保前后端数据一致性
  if (response.data) {
    response.data = convertDeviceStatus(response.data);
  }

  return response;
};

/**
 * 删除设备
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 删除结果
 */
export const deleteDevice = async (deviceId) => {
  return request.delete(DEVICE_API.DELETE(deviceId));
};

/**
 * 批量删除设备
 * @param {Array<string|number>} deviceIds - 设备ID数组
 * @returns {Promise} 删除结果
 */
export const batchDeleteDevices = async (deviceIds) => {
  return request.post(DEVICE_API.BATCH_DELETE, { ids: deviceIds });
};

/**
 * 导出设备列表
 * @param {object} params - 导出参数
 * @returns {Promise} 导出结果
 */
export const exportDevices = async (params) => {
  return request.get(DEVICE_API.EXPORT, {
    params,
    responseType: 'blob',
  });
};

/**
 * 导入设备数据
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise} 导入结果
 */
export const importDevices = async (formData) => {
  return request.post(DEVICE_API.IMPORT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 根据区域获取设备列表
 * @param {object} params - 查询参数
 * @param {string} params.areaId - 区域ID
 * @param {string} params.deviceType - 设备类型
 * @param {string} params.status - 设备状态
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 设备列表
 */
export const getDevicesByArea = async (params) => {
  return request.get(DEVICE_API.BY_AREA, { params });
};

/**
 * 根据条件获取设备列表
 * @param {object} params - 查询条件
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.deviceName - 设备名称
 * @param {string} params.deviceType - 设备类型
 * @param {string} params.status - 设备状态
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 设备列表
 */
export const getDevicesByCondition = async (params) => {
  return request.get(DEVICE_API.BY_CONDITION, { params });
};

/**
 * 获取所有设备列表（不分页）
 * @param {object} params - 查询参数
 * @returns {Promise} 设备列表
 */
export const getAllDevices = async (params = {}) => {
  return request.get(DEVICE_API.ALL, { params });
};

/**
 * 获取设备变更历史
 * @param {string|number} deviceId - 设备ID
 * @param {object} params - 查询参数
 * @returns {Promise} 变更历史列表
 */
export const getDeviceHistory = async (deviceId, params) => {
  return request.get(DEVICE_API.HISTORY(deviceId), { params });
};

/**
 * 设备移库操作
 * @param {string|number} deviceId - 设备ID
 * @param {string} newLocation - 新位置
 * @param {string} remark - 备注
 * @returns {Promise} 移库结果
 */
export const moveDevice = async (deviceId, newLocation, remark = '') => {
  return request.put(`${DEVICE_API.DETAIL(deviceId)}/move`, {
    newLocation,
    remark,
  });
};

/**
 * 检查序列号唯一性
 * @param {string} serialNumber - 序列号
 * @returns {Promise} 检查结果
 */
export const checkSerialNumberUnique = async (serialNumber) => {
  return request.get(DEVICE_API.CHECK_SERIAL_NUMBER, { params: { serialNumber } });
};

/**
 * 检查设备编号唯一性
 * @param {string} deviceCode - 设备编号
 * @returns {Promise} 检查结果
 */
export const checkDeviceCodeUnique = async (deviceCode) => {
  return request.get(DEVICE_API.CHECK_CODE, { params: { deviceCode } });
};

/**
 * 检查设备编号是否存在（别名，兼容旧代码）
 * @param {string} deviceCode - 设备编号
 * @returns {Promise} 检查结果
 */
export const checkDeviceCodeExists = async (deviceCode) => {
  return checkDeviceCodeUnique(deviceCode);
};

/**
 * 根据设备编号获取设备详情
 * @param {string} deviceCode - 设备编号
 * @returns {Promise} 设备详情
 */
export const getDeviceByCode = async (deviceCode) => {
  return request.get(DEVICE_API.BY_CODE(deviceCode));
};

/**
 * 报废设备
 * @param {string|number} deviceId - 设备ID
 * @param {string} scrapReason - 报废原因
 * @returns {Promise} 报废结果
 */
export const scrapDevice = async (deviceId, scrapReason) => {
  return request.put(`${DEVICE_API.DETAIL(deviceId)}/scrap`, {}, { params: { reason: scrapReason } });
};

/**
 * 批量报废设备
 * @param {Array<string|number>} deviceIds - 设备ID数组
 * @param {string} scrapReason - 报废原因
 * @returns {Promise} 报废结果
 */
export const batchScrapDevices = async (deviceIds, scrapReason) => {
  return request.put(DEVICE_API.BATCH_SCRAP, { data: { ids: deviceIds }, params: { reason: scrapReason } });
};

/**
 * 获取设备报废记录
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 报废记录列表
 */
export const getScrapRecords = async (params) => {
  return request.get(DEVICE_API.SCRAP_RECORDS, { params });
};

/**
 * 批量更新设备状态
 * @param {Array<string|number>} deviceIds - 设备ID数组
 * @param {number} status - 目标状态
 * @param {string} [remark] - 备注
 * @returns {Promise} 更新结果
 */
export const batchUpdateDeviceStatus = async (deviceIds, status, remark = '') => {
  const backendStatus = convertDeviceStatusToBackend({ status }).status;
  return request.post(DEVICE_API.BATCH_STATUS, { ids: deviceIds, status: backendStatus, reason: remark });
};

/**
 * 批量更新设备区域
 * @param {Array<string|number>} deviceIds - 设备ID数组
 * @param {string} areaId - 目标区域ID
 * @returns {Promise} 更新结果
 */
export const batchUpdateDeviceArea = async (deviceIds, areaId) => {
  return request.put(DEVICE_API.BATCH_AREA, deviceIds, { params: { areaId } });
};

/**
 * 获取设备预警列表
 * @param {object} params - 查询参数
 * @returns {Promise} 预警列表
 */
export const getDeviceAlerts = async (params) => {
  return request.get(DEVICE_API.ALERTS, { params });
};

/**
 * 获取设备状态历史
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 状态历史列表
 */
export const getDeviceStatusHistory = async (deviceId) => {
  return request.get(`${DEVICE_API.DETAIL(deviceId)}/status-history`);
};

/**
 * 获取设备库存记录
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 库存记录列表
 */
export const getDeviceInventoryRecords = async (deviceId) => {
  return request.get(`${DEVICE_API.DETAIL(deviceId)}/inventory-records`);
};

/**
 * 获取设备远程信息
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 远程信息
 */
export const getDeviceRemoteInfo = async (deviceId) => {
  return request.get(`${DEVICE_API.DETAIL(deviceId)}/remote-info`);
};

/**
 * 更新设备远程信息
 * @param {string|number} deviceId - 设备ID
 * @param {object} remoteInfo - 远程信息
 * @returns {Promise} 更新结果
 */
export const updateDeviceRemoteInfo = async (deviceId, remoteInfo) => {
  return request.put(`${DEVICE_API.DETAIL(deviceId)}/remote-info`, remoteInfo);
};

/**
 * 获取设备附件列表
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 附件列表
 */
export const getDeviceAttachments = async (deviceId) => {
  return request.get(`${DEVICE_API.DETAIL(deviceId)}/attachments`);
};

/**
 * 上传设备附件
 * @param {string|number} deviceId - 设备ID
 * @param {FormData} formData - 表单数据
 * @returns {Promise} 上传结果
 */
export const uploadDeviceAttachment = async (deviceId, formData) => {
  return request.post(`${DEVICE_API.DETAIL(deviceId)}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 下载设备附件
 * @param {string|number} attachmentId - 附件ID
 * @returns {Promise} 下载结果
 */
export const downloadDeviceAttachment = async (attachmentId) => {
  return request.get(DEVICE_API.ATTACHMENT_DOWNLOAD(attachmentId), {
    responseType: 'blob',
  });
};

/**
 * 删除设备附件
 * @param {string|number} attachmentId - 附件ID
 * @returns {Promise} 删除结果
 */
export const deleteDeviceAttachment = async (attachmentId) => {
  return request.delete(DEVICE_API.ATTACHMENT_DELETE(attachmentId));
};

/**
 * 更新设备状态
 * @param {string|number} deviceId - 设备ID
 * @param {number} status - 目标状态
 * @param {string} [remark] - 备注
 * @param {string|number} [operatorId] - 操作人ID
 * @returns {Promise} 更新结果
 */
export const updateDeviceStatus = async (deviceId, status, remark = '', operatorId = null) => {
  const backendStatus = convertDeviceStatusToBackend({ status }).status;
  return request.post(DEVICE_API.STATUS_UPDATE(deviceId), { targetStatus: backendStatus, remark, operatorId });
};

/**
 * 获取设备允许的状态流转列表
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 允许的状态流转列表
 */
export const getAllowedTransitions = async (deviceId) => {
  return request.get(DEVICE_API.STATUS_TRANSITIONS(deviceId));
};

/**
 * 获取设备状态统计
 * @returns {Promise} 状态统计结果
 */
export const getDeviceStatusStatistics = async () => {
  return request.get(DEVICE_API.STATISTICS_STATUS);
};

/**
 * 获取设备统计（别名，兼容旧代码和测试）
 * @returns {Promise} 设备统计结果
 */
export const getDeviceStatistics = getDeviceStatusStatistics;

/**
 * 连接设备
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 连接结果
 */
export const connectDevice = async (deviceId) => {
  return request.post(`${DEVICE_API.DETAIL(deviceId)}/connect`);
};

/**
 * 断开设备连接
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 断开结果
 */
export const disconnectDevice = async (deviceId) => {
  return request.post(`${DEVICE_API.DETAIL(deviceId)}/disconnect`);
};

/**
 * 获取设备实时状态
 * @param {string|number} deviceId - 设备ID
 * @returns {Promise} 实时状态
 */
export const getDeviceRealtimeStatus = async (deviceId) => {
  return request.get(`${DEVICE_API.DETAIL(deviceId)}/realtime-status`);
};

/**
 * 默认导出所有设备API
 */
export default {
  getDeviceList,
  getDeviceListWithRecords,
  getDevices,
  getDeviceDetail,
  getDeviceById,
  saveDeviceInstall,
  createDevice,
  updateDevice,
  deleteDevice,
  batchDeleteDevices,
  exportDevices,
  importDevices,
  getDevicesByArea,
  getDevicesByCondition,
  getAllDevices,
  getDeviceHistory,
  moveDevice,
  checkSerialNumberUnique,
  checkDeviceCodeUnique,
  checkDeviceCodeExists,
  getDeviceByCode,
  scrapDevice,
  batchScrapDevices,
  getScrapRecords,
  batchUpdateDeviceStatus,
  batchUpdateDeviceArea,
  getDeviceAlerts,
  getDeviceStatusHistory,
  getDeviceInventoryRecords,
  getDeviceRemoteInfo,
  updateDeviceRemoteInfo,
  getDeviceAttachments,
  uploadDeviceAttachment,
  downloadDeviceAttachment,
  deleteDeviceAttachment,
  updateDeviceStatus,
  getAllowedTransitions,
  getDeviceStatusStatistics,
  connectDevice,
  disconnectDevice,
  getDeviceRealtimeStatus,
};
