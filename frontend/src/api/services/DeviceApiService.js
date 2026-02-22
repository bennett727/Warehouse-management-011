/**
 * 设备API服务类
 * @file: DeviceApiService.js
 * @description: 提供设备相关的API调用方法
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import BaseApiService from '../base/BaseApiService.js';

import { DEVICE_API } from '@/constants/apiConstants';
import { convertDeviceStatus, convertDeviceStatusToBackend } from '@/utils/device';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceApiService');

/**
 * 设备API服务类
 * 继承自BaseApiService，提供设备特定的API方法
 */
export class DeviceApiService extends BaseApiService {
  constructor() {
    super(DEVICE_API.BASE, {
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000,
    });
  }

  /**
   * 获取设备列表
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.typeId - 设备类型ID
   * @param {string} params.status - 设备状态
   * @param {string} params.areaId - 区域ID
   * @param {string} params.keyword - 搜索关键词
   * @param {string} params.orderBy - 排序字段
   * @param {string} params.orderDirection - 排序方向
   * @returns {Promise} 设备列表数据
   */
  async getList(params = {}) {
    try {
      logger.debug('[DeviceApiService.getList] 请求参数:', params);
      const response = await super.getList(params);

      if (response && response.devices) {
        response.devices = convertDeviceStatus(response.devices);
      } else if (response && response.records) {
        response.records = convertDeviceStatus(response.records);
      }

      return response;
    } catch (error) {
      logger.error('[DeviceApiService.getList] 请求失败:', error);
      throw error;
    }
  }

  /**
   * 获取设备详情
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 设备详情
   */
  async getById(deviceId) {
    try {
      const response = await super.getById(deviceId);

      if (response) {
        convertDeviceStatus([response]);
      }

      return response;
    } catch (error) {
      logger.error('[DeviceApiService.getById] 请求失败:', error);
      throw error;
    }
  }

  /**
   * 创建设备
   * @param {object} deviceData - 设备信息
   * @returns {Promise} 创建结果
   */
  async create(deviceData) {
    try {
      const convertedData = convertDeviceStatusToBackend(deviceData);
      const response = await super.create(convertedData);

      if (response) {
        convertDeviceStatus([response]);
      }

      return response;
    } catch (error) {
      logger.error('[DeviceApiService.create] 请求失败:', error);
      throw error;
    }
  }

  /**
   * 更新设备
   * @param {string} deviceId - 设备ID
   * @param {object} deviceData - 设备信息
   * @returns {Promise} 更新结果
   */
  async update(deviceId, deviceData) {
    try {
      const convertedData = convertDeviceStatusToBackend(deviceData);
      const response = await super.update(deviceId, convertedData);

      if (response) {
        convertDeviceStatus([response]);
      }

      return response;
    } catch (error) {
      logger.error('[DeviceApiService.update] 请求失败:', error);
      throw error;
    }
  }

  /**
   * 根据区域获取设备列表
   * @param {object} params - 查询参数
   * @returns {Promise} 设备列表
   */
  async getByArea(params = {}) {
    return this.get('by-area', params);
  }

  /**
   * 根据条件获取设备列表
   * @param {object} params - 查询条件
   * @returns {Promise} 设备列表
   */
  async getByCondition(params = {}) {
    return this.get('by-condition', params);
  }

  /**
   * 根据设备编号获取设备详情
   * @param {string} deviceCode - 设备编号
   * @returns {Promise} 设备详情
   */
  async getByCode(deviceCode) {
    return this.get(`code/${deviceCode}`);
  }

  /**
   * 获取设备变更历史
   * @param {string} deviceId - 设备ID
   * @param {object} params - 查询参数
   * @returns {Promise} 变更历史列表
   */
  async getHistory(deviceId, params = {}) {
    return this.get(`${deviceId}/history`, params);
  }

  /**
   * 设备移库操作
   * @param {string} deviceId - 设备ID
   * @param {string} newLocation - 新位置
   * @param {string} remark - 备注
   * @returns {Promise} 移库结果
   */
  async move(deviceId, newLocation, remark = '') {
    return this.put(`${deviceId}/move`, { newLocation, remark });
  }

  /**
   * 检查序列号唯一性
   * @param {string} serialNumber - 序列号
   * @returns {Promise} 检查结果
   */
  async checkSerialNumberUnique(serialNumber) {
    return this.get('check-serial-number', { serialNumber });
  }

  /**
   * 检查设备编号唯一性
   * @param {string} deviceCode - 设备编号
   * @returns {Promise} 检查结果
   */
  async checkDeviceCodeUnique(deviceCode) {
    return this.get('check-device-code', { deviceCode });
  }

  /**
   * 报废设备
   * @param {string} deviceId - 设备ID
   * @param {string} scrapReason - 报废原因
   * @returns {Promise} 报废结果
   */
  async scrap(deviceId, scrapReason) {
    return this.put(`${deviceId}/scrap`, {}, { params: { reason: scrapReason } });
  }

  /**
   * 批量报废设备
   * @param {Array<string>} deviceIds - 设备ID数组
   * @param {string} scrapReason - 报废原因
   * @returns {Promise} 报废结果
   */
  async batchScrap(deviceIds, scrapReason) {
    return this.put('batch/scrap', { ids: deviceIds }, { params: { reason: scrapReason } });
  }

  /**
   * 获取设备报废记录
   * @param {object} params - 查询参数
   * @returns {Promise} 报废记录列表
   */
  async getScrapRecords(params = {}) {
    return this.get('scrap-records', params);
  }

  /**
   * 批量更新设备状态
   * @param {Array<string>} deviceIds - 设备ID数组
   * @param {number} status - 目标状态
   * @param {string} remark - 备注
   * @returns {Promise} 更新结果
   */
  async batchUpdateStatus(deviceIds, status, remark = '') {
    const backendStatus = convertDeviceStatusToBackend({ status }).status;
    return this.put('batch/status', deviceIds, { params: { status: backendStatus, remark } });
  }

  /**
   * 批量更新设备区域
   * @param {Array<string>} deviceIds - 设备ID数组
   * @param {string} areaId - 目标区域ID
   * @returns {Promise} 更新结果
   */
  async batchUpdateArea(deviceIds, areaId) {
    return this.put('batch/area', deviceIds, { params: { areaId } });
  }

  /**
   * 获取设备预警列表
   * @param {object} params - 查询参数
   * @returns {Promise} 预警列表
   */
  async getAlerts(params = {}) {
    return this.get('alerts', params);
  }

  /**
   * 获取设备状态历史
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 状态历史
   */
  async getStatusHistory(deviceId) {
    return this.get(`${deviceId}/status-history`);
  }

  /**
   * 获取设备库存记录
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 库存记录
   */
  async getInventoryRecords(deviceId) {
    return this.get(`${deviceId}/inventory-records`);
  }

  /**
   * 获取设备远程信息
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 远程信息
   */
  async getRemoteInfo(deviceId) {
    return this.get(`${deviceId}/remote-info`);
  }

  /**
   * 更新设备远程信息
   * @param {string} deviceId - 设备ID
   * @param {object} remoteInfo - 远程信息
   * @returns {Promise} 更新结果
   */
  async updateRemoteInfo(deviceId, remoteInfo) {
    return this.put(`${deviceId}/remote-info`, remoteInfo);
  }

  /**
   * 获取设备附件列表
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 附件列表
   */
  async getAttachments(deviceId) {
    return this.get(`${deviceId}/attachments`);
  }

  /**
   * 上传设备附件
   * @param {string} deviceId - 设备ID
   * @param {FormData} formData - 表单数据
   * @returns {Promise} 上传结果
   */
  async uploadAttachment(deviceId, formData) {
    return this.post(`${deviceId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 下载设备附件
   * @param {string} attachmentId - 附件ID
   * @returns {Promise} 附件数据
   */
  async downloadAttachment(attachmentId) {
    return this.get(DEVICE_API.ATTACHMENT_DOWNLOAD(attachmentId), {}, { responseType: 'blob' });
  }

  /**
   * 删除设备附件
   * @param {string} attachmentId - 附件ID
   * @returns {Promise} 删除结果
   */
  async deleteAttachment(attachmentId) {
    return this.delete(DEVICE_API.ATTACHMENT_DELETE(attachmentId));
  }

  /**
   * 更新设备状态
   * @param {string} deviceId - 设备ID
   * @param {number} status - 目标状态
   * @param {string} remark - 备注
   * @returns {Promise} 更新结果
   */
  async updateStatus(deviceId, status, remark = '') {
    const backendStatus = convertDeviceStatusToBackend({ status }).status;
    return this.put(`${deviceId}/status`, null, { params: { status: backendStatus, remark } });
  }

  /**
   * 连接设备
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 连接结果
   */
  async connect(deviceId) {
    return this.post(`${deviceId}/connect`);
  }

  /**
   * 断开设备连接
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 断开结果
   */
  async disconnect(deviceId) {
    return this.post(`${deviceId}/disconnect`);
  }

  /**
   * 获取设备实时状态
   * @param {string} deviceId - 设备ID
   * @returns {Promise} 实时状态
   */
  async getRealtimeStatus(deviceId) {
    return this.get(`${deviceId}/realtime-status`);
  }

  /**
   * 保存设备安装信息
   * @param {object} installData - 安装信息数据
   * @returns {Promise} 保存结果
   */
  async saveInstall(installData) {
    return this.post(`${installData.deviceId}/install`, installData);
  }
}

export default new DeviceApiService();
