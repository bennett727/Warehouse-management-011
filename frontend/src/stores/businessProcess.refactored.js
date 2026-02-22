import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import {
  DEVICE_STATUS,
  DEVICE_STATUS_INFO,
  DEVICE_STATUS_TRANSITIONS,
  getAllowedOperations as getStatusOperations,
  validateStatusTransition as validateTransition,
} from '@/constants/deviceStatus.js';
import { createLogger } from '@/utils/logger.js';
import { handleErrorMessage } from '@/utils/responseHandler.js';

const logger = createLogger('businessProcess');

export { DEVICE_STATUS };

export const DEVICE_STATUS_LABELS = Object.fromEntries(
  Object.entries(DEVICE_STATUS_INFO).map(([key, info]) => [key, info.label])
);

export const DEVICE_STATUS_TYPES = Object.fromEntries(
  Object.entries(DEVICE_STATUS_INFO).map(([key, info]) => [key, info.type])
);

export { DEVICE_STATUS_TRANSITIONS };

export const OPERATION_TYPES = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  INSTALL: 'install',
  UNINSTALL: 'uninstall',
  REPAIR: 'repair',
  REPAIR_COMPLETE: 'repair_complete',
  SCRAP: 'scrap',
  MOVE: 'move',
};

export const OPERATION_LABELS = {
  [OPERATION_TYPES.INBOUND]: '入库',
  [OPERATION_TYPES.OUTBOUND]: '出库',
  [OPERATION_TYPES.INSTALL]: '安装',
  [OPERATION_TYPES.UNINSTALL]: '卸载',
  [OPERATION_TYPES.REPAIR]: '维修',
  [OPERATION_TYPES.REPAIR_COMPLETE]: '维修完成',
  [OPERATION_TYPES.SCRAP]: '报废',
  [OPERATION_TYPES.MOVE]: '移库',
};

/**
 * Store 实例缓存
 */
let storeInstances = {
  device: null,
  inventory: null,
  installation: null,
  repair: null,
  maintenance: null,
};

/**
 * 设置 Store 实例（用于依赖注入和测试）
 * @param {Object} instances - Store 实例对象
 */
export const setStoreInstances = (instances) => {
  storeInstances = { ...storeInstances, ...instances };
};

/**
 * 重置 Store 实例（用于测试清理）
 */
export const resetStoreInstances = () => {
  storeInstances = {
    device: null,
    inventory: null,
    installation: null,
    repair: null,
    maintenance: null,
  };
};

/**
 * 业务流程Store（重构版）
 * 使用依赖注入模式提高可测试性
 */
export const useBusinessProcessStore = defineStore('businessProcess', () => {
  // 状态
  const loading = ref(false);
  const currentOperation = ref(null);
  const operationHistory = reactive([]);
  const pendingOperations = reactive([]);

  // 批量操作状态
  const batchOperationStatus = reactive({
    isProcessing: false,
    totalCount: 0,
    successCount: 0,
    failCount: 0,
    currentIndex: 0,
    errors: [],
  });

  // Getters
  const isLoading = computed(() => loading.value);
  const hasPendingOperations = computed(() => pendingOperations.length > 0);
  const currentOperationType = computed(() => currentOperation.value?.type || null);

  /**
   * 获取 Store 实例（支持依赖注入）
   */
  const getDeviceStore = () => {
    if (!storeInstances.device) {
      const { useDeviceStore } = require('./device.js');
      storeInstances.device = useDeviceStore();
    }
    return storeInstances.device;
  };

  const getInventoryStore = () => {
    if (!storeInstances.inventory) {
      const { useInventoryStore } = require('./inventory.js');
      storeInstances.inventory = useInventoryStore();
    }
    return storeInstances.inventory;
  };

  const getInstallationStore = () => {
    if (!storeInstances.installation) {
      const { useInstallationStore } = require('./installation.js');
      storeInstances.installation = useInstallationStore();
    }
    return storeInstances.installation;
  };

  const getRepairStore = () => {
    if (!storeInstances.repair) {
      const { useRepairStore } = require('./repair.js');
      storeInstances.repair = useRepairStore();
    }
    return storeInstances.repair;
  };

  const getMaintenanceStore = () => {
    if (!storeInstances.maintenance) {
      const { useMaintenanceStore } = require('./maintenance.js');
      storeInstances.maintenance = useMaintenanceStore();
    }
    return storeInstances.maintenance;
  };

  /**
   * 验证状态转换
   * @param {string} currentStatus - 当前状态
   * @param {string} targetStatus - 目标状态
   * @returns {boolean} 是否允许转换
   */
  const validateStatusTransition = (currentStatus, targetStatus) => {
    return validateTransition(currentStatus, targetStatus);
  };

  /**
   * 获取允许的操作
   * @param {string} status - 当前状态
   * @returns {Array} 允许的操作列表
   */
  const getAllowedOperations = (status) => {
    return getStatusOperations(status);
  };

  /**
   * 记录操作历史
   * @param {Object} operation - 操作记录
   */
  const recordOperation = (operation) => {
    const record = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...operation,
    };
    operationHistory.unshift(record);

    // 限制历史记录数量
    if (operationHistory.length > 100) {
      operationHistory.pop();
    }

    logger.info('操作已记录', record);
  };

  /**
   * 执行入库流程
   * @param {Object} deviceData - 设备数据
   * @returns {Promise<Object>} 执行结果
   */
  const executeInbound = async (deviceData) => {
    loading.value = true;
    currentOperation.value = { type: OPERATION_TYPES.INBOUND, data: deviceData };

    try {
      const dStore = getDeviceStore();
      const iStore = getInventoryStore();

      // 创建设备记录
      const device = await dStore.createDevice(deviceData);

      // 更新库存
      await iStore.addInventory({
        deviceId: device.id,
        quantity: deviceData.quantity || 1,
        warehouseId: deviceData.warehouseId,
        locationId: deviceData.locationId,
      });

      // 记录操作
      recordOperation({
        type: OPERATION_TYPES.INBOUND,
        deviceId: device.id,
        deviceCode: device.deviceCode,
        status: 'success',
        message: '设备入库成功',
      });

      ElMessage.success('设备入库成功');
      return { success: true, device };
    } catch (error) {
      logger.error('入库流程执行失败', error);

      recordOperation({
        type: OPERATION_TYPES.INBOUND,
        deviceId: deviceData.id,
        deviceCode: deviceData.deviceCode,
        status: 'failed',
        message: handleErrorMessage(error, '入库失败'),
      });

      throw error;
    } finally {
      loading.value = false;
      currentOperation.value = null;
    }
  };

  /**
   * 执行出库流程
   * @param {Object} deviceData - 设备数据
   * @param {string} outboundType - 出库类型
   * @returns {Promise<Object>} 执行结果
   */
  const executeOutbound = async (deviceData, outboundType = 'normal') => {
    loading.value = true;
    currentOperation.value = { type: OPERATION_TYPES.OUTBOUND, data: deviceData };

    try {
      const dStore = getDeviceStore();
      const iStore = getInventoryStore();

      // 更新设备状态
      let targetStatus = DEVICE_STATUS.OUTBOUND;
      let operationType = OPERATION_TYPES.OUTBOUND;

      switch (outboundType) {
        case 'INSTALLATION':
        case 'install':
          targetStatus = DEVICE_STATUS.IN_USE;
          operationType = OPERATION_TYPES.INSTALL;
          break;
        case 'REPAIR':
        case 'repair':
          targetStatus = DEVICE_STATUS.MAINTENANCE;
          operationType = OPERATION_TYPES.REPAIR;
          break;
        case 'SCRAP':
        case 'scrap':
          targetStatus = DEVICE_STATUS.SCRAPPED;
          operationType = OPERATION_TYPES.SCRAP;
          break;
        default:
          targetStatus = DEVICE_STATUS.OUTBOUND;
          operationType = OPERATION_TYPES.OUTBOUND;
      }

      // 验证状态转换
      const currentDevice = await dStore.getDeviceById(deviceData.deviceId);
      if (!validateStatusTransition(currentDevice.status, targetStatus)) {
        throw new Error(`无法将设备从 ${currentDevice.status} 状态转换为 ${targetStatus} 状态`);
      }

      // 更新设备状态
      await dStore.updateDeviceStatus(deviceData.deviceId, targetStatus);

      // 更新库存
      await iStore.removeInventory({
        deviceId: deviceData.deviceId,
        quantity: deviceData.quantity || 1,
      });

      // 记录操作
      recordOperation({
        type: operationType,
        deviceId: deviceData.deviceId,
        deviceCode: deviceData.deviceCode,
        status: 'success',
        message: '设备出库成功',
      });

      ElMessage.success('设备出库成功');
      return { success: true };
    } catch (error) {
      logger.error('出库流程执行失败', error);

      recordOperation({
        type: OPERATION_TYPES.OUTBOUND,
        deviceId: deviceData.deviceId,
        deviceCode: deviceData.deviceCode,
        status: 'failed',
        message: handleErrorMessage(error, '出库失败'),
      });

      throw error;
    } finally {
      loading.value = false;
      currentOperation.value = null;
    }
  };

  /**
   * 执行安装流程
   * @param {Object} installData - 安装数据
   * @returns {Promise<Object>} 执行结果
   */
  const executeInstall = async (installData) => {
    loading.value = true;
    currentOperation.value = { type: OPERATION_TYPES.INSTALL, data: installData };

    try {
      const dStore = getDeviceStore();
      const iStore = getInstallationStore();

      // 验证设备状态
      const device = await dStore.getDeviceById(installData.deviceId);
      if (!validateStatusTransition(device.status, DEVICE_STATUS.IN_USE)) {
        throw new Error(`设备当前状态为 ${device.status}，无法执行安装操作`);
      }

      // 创建设备安装记录
      await iStore.createInstallation({
        deviceId: installData.deviceId,
        installLocation: installData.installLocation,
        installDate: installData.installDate,
        responsiblePerson: installData.responsiblePerson,
        remark: installData.remark,
      });

      // 更新设备状态
      await dStore.updateDeviceStatus(installData.deviceId, DEVICE_STATUS.IN_USE);

      // 记录操作
      recordOperation({
        type: OPERATION_TYPES.INSTALL,
        deviceId: installData.deviceId,
        deviceCode: installData.deviceCode,
        status: 'success',
        message: '设备安装成功',
      });

      ElMessage.success('设备安装成功');
      return { success: true };
    } catch (error) {
      logger.error('安装流程执行失败', error);

      recordOperation({
        type: OPERATION_TYPES.INSTALL,
        deviceId: installData.deviceId,
        deviceCode: installData.deviceCode,
        status: 'failed',
        message: handleErrorMessage(error, '安装失败'),
      });

      throw error;
    } finally {
      loading.value = false;
      currentOperation.value = null;
    }
  };

  /**
   * 执行维修流程
   * @param {Object} repairData - 维修数据
   * @returns {Promise<Object>} 执行结果
   */
  const executeRepair = async (repairData) => {
    loading.value = true;
    currentOperation.value = { type: OPERATION_TYPES.REPAIR, data: repairData };

    try {
      const dStore = getDeviceStore();
      const rStore = getRepairStore();

      // 验证设备状态
      const device = await dStore.getDeviceById(repairData.deviceId);
      if (!validateStatusTransition(device.status, DEVICE_STATUS.MAINTENANCE)) {
        throw new Error(`设备当前状态为 ${device.status}，无法执行维修操作`);
      }

      // 创建维修记录
      await rStore.createRepair({
        deviceId: repairData.deviceId,
        repairDate: repairData.repairDate,
        repairType: repairData.repairType,
        repairContent: repairData.repairContent,
        repairCost: repairData.repairCost,
        remark: repairData.remark,
      });

      // 更新设备状态
      await dStore.updateDeviceStatus(repairData.deviceId, DEVICE_STATUS.MAINTENANCE);

      // 记录操作
      recordOperation({
        type: OPERATION_TYPES.REPAIR,
        deviceId: repairData.deviceId,
        deviceCode: repairData.deviceCode,
        status: 'success',
        message: '设备维修登记成功',
      });

      ElMessage.success('设备维修登记成功');
      return { success: true };
    } catch (error) {
      logger.error('维修流程执行失败', error);

      recordOperation({
        type: OPERATION_TYPES.REPAIR,
        deviceId: repairData.deviceId,
        deviceCode: repairData.deviceCode,
        status: 'failed',
        message: handleErrorMessage(error, '维修登记失败'),
      });

      throw error;
    } finally {
      loading.value = false;
      currentOperation.value = null;
    }
  };

  /**
   * 执行维修完成流程
   * @param {Object} completeData - 完成数据
   * @returns {Promise<Object>} 执行结果
   */
  const executeRepairComplete = async (completeData) => {
    loading.value = true;
    currentOperation.value = { type: OPERATION_TYPES.REPAIR_COMPLETE, data: completeData };

    try {
      const dStore = getDeviceStore();
      const rStore = getRepairStore();

      // 验证设备状态
      const device = await dStore.getDeviceById(completeData.deviceId);
      if (!validateStatusTransition(device.status, DEVICE_STATUS.IN_STOCK)) {
        throw new Error(`设备当前状态为 ${device.status}，无法执行维修完成操作`);
      }

      // 更新维修记录
      await rStore.completeRepair(completeData.repairId, {
        completionDate: completeData.completionDate,
        repairResult: completeData.repairResult,
        cost: completeData.cost,
      });

      // 更新设备状态
      await dStore.updateDeviceStatus(completeData.deviceId, DEVICE_STATUS.IN_STOCK);

      // 记录操作
      recordOperation({
        type: OPERATION_TYPES.REPAIR_COMPLETE,
        deviceId: completeData.deviceId,
        deviceCode: completeData.deviceCode,
        status: 'success',
        message: '设备维修完成',
      });

      ElMessage.success('设备维修完成');
      return { success: true };
    } catch (error) {
      logger.error('维修完成流程执行失败', error);

      recordOperation({
        type: OPERATION_TYPES.REPAIR_COMPLETE,
        deviceId: completeData.deviceId,
        deviceCode: completeData.deviceCode,
        status: 'failed',
        message: handleErrorMessage(error, '维修完成操作失败'),
      });

      throw error;
    } finally {
      loading.value = false;
      currentOperation.value = null;
    }
  };

  /**
   * 执行报废流程
   * @param {Object} scrapData - 报废数据
   * @returns {Promise<Object>} 执行结果
   */
  const executeScrap = async (scrapData) => {
    loading.value = true;
    currentOperation.value = { type: OPERATION_TYPES.SCRAP, data: scrapData };

    try {
      const dStore = getDeviceStore();
      const iStore = getInventoryStore();

      // 验证设备状态
      const device = await dStore.getDeviceById(scrapData.deviceId);
      if (!validateStatusTransition(device.status, DEVICE_STATUS.SCRAPPED)) {
        throw new Error(`设备当前状态为 ${device.status}，无法执行报废操作`);
      }

      // 更新设备状态
      await dStore.updateDeviceStatus(scrapData.deviceId, DEVICE_STATUS.SCRAPPED);

      // 更新库存
      await iStore.removeInventory({
        deviceId: scrapData.deviceId,
        quantity: scrapData.quantity || 1,
        reason: 'SCRAP',
      });

      // 记录操作
      recordOperation({
        type: OPERATION_TYPES.SCRAP,
        deviceId: scrapData.deviceId,
        deviceCode: scrapData.deviceCode,
        status: 'success',
        message: '设备报废成功',
      });

      ElMessage.success('设备报废成功');
      return { success: true };
    } catch (error) {
      logger.error('报废流程执行失败', error);

      recordOperation({
        type: OPERATION_TYPES.SCRAP,
        deviceId: scrapData.deviceId,
        deviceCode: scrapData.deviceCode,
        status: 'failed',
        message: handleErrorMessage(error, '报废操作失败'),
      });

      throw error;
    } finally {
      loading.value = false;
      currentOperation.value = null;
    }
  };

  /**
   * 执行批量出库
   * @param {Array} devices - 设备列表
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 执行结果
   */
  const executeBatchOutbound = async (devices, options = {}) => {
    if (!devices || devices.length === 0) {
      return { success: false, message: '未选择设备' };
    }

    batchOperationStatus.isProcessing = true;
    batchOperationStatus.totalCount = devices.length;
    batchOperationStatus.successCount = 0;
    batchOperationStatus.failCount = 0;
    batchOperationStatus.currentIndex = 0;
    batchOperationStatus.errors = [];

    const results = [];

    for (let i = 0; i < devices.length; i++) {
      batchOperationStatus.currentIndex = i + 1;
      const device = devices[i];

      try {
        const result = await executeOutbound(device, options.outboundType);
        batchOperationStatus.successCount++;
        results.push({ device, success: true, result });
      } catch (error) {
        batchOperationStatus.failCount++;
        batchOperationStatus.errors.push({ device, error: error.message });
        results.push({ device, success: false, error: error.message });
      }
    }

    batchOperationStatus.isProcessing = false;

    const allSuccess = batchOperationStatus.failCount === 0;
    const message = allSuccess
      ? `批量出库成功，共处理 ${batchOperationStatus.successCount} 个设备`
      : `批量出库完成，成功 ${batchOperationStatus.successCount} 个，失败 ${batchOperationStatus.failCount} 个`;

    if (allSuccess) {
      ElMessage.success(message);
    } else {
      ElMessage.warning(message);
    }

    return {
      success: allSuccess,
      message,
      results,
      stats: {
        total: batchOperationStatus.totalCount,
        success: batchOperationStatus.successCount,
        fail: batchOperationStatus.failCount,
      },
    };
  };

  return {
    // 状态
    loading,
    currentOperation,
    operationHistory,
    pendingOperations,
    batchOperationStatus,

    // Getters
    isLoading,
    hasPendingOperations,
    currentOperationType,

    // 方法
    validateStatusTransition,
    getAllowedOperations,
    recordOperation,
    executeInbound,
    executeOutbound,
    executeInstall,
    executeRepair,
    executeRepairComplete,
    executeScrap,
    executeBatchOutbound,
  };
});
