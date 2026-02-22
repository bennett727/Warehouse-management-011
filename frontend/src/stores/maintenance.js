import {
  batchDeleteMaintenanceRecords,
  completeMaintenance,
  deleteMaintenanceRecord,
  exportMaintenanceRecords,
  generateMaintenanceNumber,
  getDeviceMaintenanceHistory,
  getMaintenanceDetail,
  getMaintenanceRecordsByPage,
  saveMaintenanceRecord,
  updateMaintenanceRecord,
} from '@/api/maintenance/maintenance';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('maintenance');
import { handleErrorMessage } from '@/utils/responseHandler.js';

import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    records: [],
    total: 0,
    currentRecord: null,
    loading: false,
    deviceHistory: [],
    deviceHistoryTotal: 0,
  }),

  actions: {
    /**
     * 获取维修记录分页列表
     * @param {Object} params - 查询参数
     * @param {number} params.pageNum - 页码
     * @param {number} params.pageSize - 每页数量
     * @returns {Promise<Object>} 返回分页数据
     * @throws {Error} 获取列表失败时抛出错误
     */
    async fetchMaintenanceRecords(params) {
      this.loading = true;
      try {
        const response = await getMaintenanceRecordsByPage(params);
        this.records = response.data || [];
        this.total = response.total || 0;
        return response;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '获取维修记录失败'));
        logger.error('获取维修记录失败', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取维修记录详情
     * @param {number|string} id - 维修记录ID
     * @returns {Promise<Object>} 返回维修记录详情
     * @throws {Error} 获取详情失败时抛出错误
     */
    async fetchMaintenanceDetail(id) {
      try {
        const response = await getMaintenanceDetail(id);
        this.currentRecord = response.data;
        return response.data;
      } catch (error) {
        this.currentRecord = null;
        ElMessage.error(handleErrorMessage(error, '获取维修记录详情失败'));
        logger.error('获取维修记录详情失败', error);
        throw error;
      }
    },

    /**
     * 创建维修记录
     * @param {Object} data - 维修记录数据
     * @returns {Promise<Object>} 返回创建的维修记录
     * @throws {Error} 创建失败时抛出错误
     */
    async createMaintenanceRecord(data) {
      try {
        const response = await saveMaintenanceRecord(data);
        ElMessage.success('创建维修记录成功');
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '创建维修记录失败'));
        logger.error('创建维修记录失败', error);
        throw error;
      }
    },

    /**
     * 执行更新维修记录操作
     * @param {number|string} id - 维修记录ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 返回更新后的维修记录
     * @throws {Error} 更新失败时抛出错误
     */
    async executeUpdateMaintenanceRecord(id, data) {
      try {
        const response = await updateMaintenanceRecord(id, data);
        ElMessage.success('更新维修记录成功');
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '更新维修记录失败'));
        logger.error('更新维修记录失败', error);
        throw error;
      }
    },

    /**
     * 执行删除维修记录操作
     * @param {number|string} id - 维修记录ID
     * @throws {Error} 删除失败时抛出错误
     */
    async executeDeleteMaintenanceRecord(id) {
      try {
        await deleteMaintenanceRecord(id);
        ElMessage.success('删除维修记录成功');
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '删除维修记录失败'));
        logger.error('删除维修记录失败', error);
        throw error;
      }
    },

    /**
     * 执行批量删除维修记录操作
     * @param {Array<number|string>} ids - 维修记录ID数组
     * @throws {Error} 批量删除失败时抛出错误
     */
    async executeBatchDeleteMaintenanceRecords(ids) {
      try {
        await batchDeleteMaintenanceRecords(ids);
        ElMessage.success(`成功删除${ids.length}条维修记录`);
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '批量删除维修记录失败'));
        logger.error('批量删除维修记录失败', error);
        throw error;
      }
    },

    /**
     * 获取设备维修历史
     * @param {number|string} deviceId - 设备ID
     * @param {Object} params - 查询参数
     * @returns {Promise<Object>} 返回维修历史数据
     * @throws {Error} 获取历史失败时抛出错误
     */
    async fetchDeviceMaintenanceHistory(deviceId, params = {}) {
      try {
        const response = await getDeviceMaintenanceHistory(deviceId, params);
        this.deviceHistory = response.data || [];
        this.deviceHistoryTotal = response.total || 0;
        return response;
      } catch (error) {
        this.deviceHistory = [];
        this.deviceHistoryTotal = 0;
        ElMessage.error(handleErrorMessage(error, '获取设备维修历史失败'));
        logger.error('获取设备维修历史失败', error);
        throw error;
      }
    },

    /**
     * 完成维修操作
     * @param {number|string} id - 维修记录ID
     * @param {Object} data - 完成数据
     * @returns {Promise<Object>} 返回完成结果
     * @throws {Error} 完成维修失败时抛出错误
     */
    async completeMaintenance(id, data) {
      try {
        const response = await completeMaintenance(id, data);
        ElMessage.success('完成维修成功');
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '完成维修失败'));
        logger.error('完成维修失败', error);
        throw error;
      }
    },

    /**
     * 生成维修单号
     * @returns {Promise<string>} 返回维修单号
     * @throws {Error} 生成单号失败时抛出错误
     */
    async generateMaintenanceNumber() {
      try {
        const response = await generateMaintenanceNumber();
        return response.data;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '生成维修单号失败'));
        logger.error('生成维修单号失败', error);
        throw error;
      }
    },

    /**
     * 导出维修记录
     * @param {Object} params - 导出参数
     * @returns {Promise<Blob>} 返回导出文件
     * @throws {Error} 导出失败时抛出错误
     */
    async exportMaintenanceRecords(params) {
      try {
        const response = await exportMaintenanceRecords(params);
        ElMessage.success('导出维修记录成功');
        return response;
      } catch (error) {
        ElMessage.error(handleErrorMessage(error, '导出维修记录失败'));
        logger.error('导出维修记录失败', error);
        throw error;
      }
    },

    /**
     * 清除当前记录
     */
    clearCurrentRecord() {
      this.currentRecord = null;
    },

    /**
     * 清除设备历史记录
     */
    clearDeviceHistory() {
      this.deviceHistory = [];
      this.deviceHistoryTotal = 0;
    },

    /**
     * 更新维修记录（对外暴露的方法）
     * @param {number|string} id - 维修记录ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 返回更新后的维修记录
     */
    async updateMaintenanceRecord(id, data) {
      return await this.executeUpdateMaintenanceRecord(id, data);
    },

    /**
     * 删除维修记录（对外暴露的方法）
     * @param {number|string} id - 维修记录ID
     */
    async deleteMaintenanceRecord(id) {
      return await this.executeDeleteMaintenanceRecord(id);
    },

    /**
     * 批量删除维修记录（对外暴露的方法）
     * @param {Array<number|string>} ids - 维修记录ID数组
     */
    async batchDeleteMaintenanceRecords(ids) {
      return await this.executeBatchDeleteMaintenanceRecords(ids);
    },
  },
});
