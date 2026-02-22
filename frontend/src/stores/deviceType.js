import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import * as deviceTypeApi from '@/api/device/device-type';
import { createLogger } from '@/utils/logger.js';
import { handleErrorMessage } from '@/utils/responseHandler.js';

const logger = createLogger('deviceType');

/**
 * 设备类型状态管理
 * 实现全局数据共享、缓存机制和实时同步
 */
export const useDeviceTypeStore = defineStore('deviceType', () => {
  // ==================== 状态定义 ====================
  const deviceTypes = ref([]);
  const deviceTypeTree = ref([]);
  const summaryData = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 缓存配置
  const lastUpdated = ref(null);
  const cacheDuration = 5 * 60 * 1000; // 5分钟缓存

  // 筛选状态
  const summaryFilter = ref({
    keyword: '',
    status: 'all',
  });

  // ==================== 加载状态管理 ====================
  const operationLoading = ref({
    list: false,
    create: false,
    update: false,
    delete: false,
    summary: false,
  });

  // ==================== 计算属性 ====================

  // 获取所有设备类型
  const getAllDeviceTypes = computed(() => deviceTypes.value);

  // 获取启用的设备类型
  const getActiveDeviceTypes = computed(() => deviceTypes.value.filter((type) => type.status === 1));

  // 获取设备类型树结构
  const getDeviceTypeTree = computed(() => deviceTypeTree.value);

  // 获取汇总数据
  const getSummaryData = computed(() => summaryData.value);

  // 获取筛选后的汇总数据
  const getFilteredSummaryData = computed(() => {
    const { keyword, status } = summaryFilter.value;

    return summaryData.value.filter((item) => {
      const matchKeyword = !keyword || item.typeName.toLowerCase().includes(keyword.toLowerCase());

      let matchStatus = true;
      if (status !== 'all') {
        switch (status) {
          case 'in-stock':
            matchStatus = item.inStockCount > 0;
            break;
          case 'installed':
            matchStatus = item.installedCount > 0;
            break;
          case 'repairing':
            matchStatus = item.repairingCount > 0;
            break;
        }
      }

      return matchKeyword && matchStatus;
    });
  });

  // 根据ID获取设备类型
  const getDeviceTypeById = computed(() => (id) => {
    return deviceTypes.value.find((type) => type.id === id);
  });

  // 根据编码获取设备类型
  const getDeviceTypeByCode = computed(() => (code) => {
    return deviceTypes.value.find((type) => type.code === code);
  });

  // 获取一级设备类型（顶级类型）
  const getTopLevelDeviceTypes = computed(() => {
    return deviceTypes.value.filter((type) => !type.parentId || type.parentId === 0);
  });

  // 根据父ID获取子设备类型
  const getChildDeviceTypes = computed(() => (parentId) => {
    return deviceTypes.value.filter((type) => type.parentId === parentId);
  });

  // 检查是否需要刷新
  const needsRefresh = computed(() => {
    if (!lastUpdated.value) {
      return true;
    }
    return Date.now() - lastUpdated.value > cacheDuration;
  });

  // ==================== 工具方法 ====================

  // 重置错误状态
  function resetError() {
    error.value = null;
  }

  // 转换汇总数据格式
  function transformSummaryData(data) {
    return data.map((item) => {
      const statusDistribution = item.statusDistribution || {};
      return {
        typeId: String(item.typeId),
        typeName: item.typeName,
        typeIcon: '',
        totalStock: item.count || 0,
        inStockCount: statusDistribution.IN_STOCK || 0,
        installedCount: statusDistribution.INSTALLED || 0,
        repairingCount: statusDistribution.REPAIRING || 0,
        warehouseName: '主仓库',
        location: 'A区',
        lastUpdate: new Date().toLocaleString('zh-CN'),
      };
    });
  }

  // 应用筛选
  function applySummaryFilter(filter) {
    summaryFilter.value = { ...summaryFilter.value, ...filter };
  }

  // 重置筛选
  function resetSummaryFilter() {
    summaryFilter.value = {
      keyword: '',
      status: 'all',
    };
  }

  // ==================== 核心业务方法 ====================

  // 获取设备类型列表（带缓存）
  async function fetchDeviceTypes(params = {}, forceRefresh = false) {
    if (!forceRefresh && !needsRefresh.value && deviceTypes.value.length > 0) {
      logger.debug('使用缓存的设备类型数据');
      return deviceTypes.value;
    }

    operationLoading.value.list = true;
    resetError();

    try {
      const typesResponse = await deviceTypeApi.getDeviceTypes();
      if (typesResponse.success) {
        deviceTypes.value = typesResponse.data || [];
        lastUpdated.value = Date.now();
      } else {
        const listResponse = await deviceTypeApi.getDeviceTypeList(params);
        if (listResponse.success) {
          deviceTypes.value = listResponse.data.deviceTypes || listResponse.data || [];
          lastUpdated.value = Date.now();
        } else {
          const errorMessage = listResponse.message || typesResponse.message || '获取设备类型失败';
          error.value = errorMessage;
          throw new Error(errorMessage);
        }
      }
      return deviceTypes.value;
    } catch (err) {
      error.value = handleErrorMessage(err, '获取设备类型失败');
      ElMessage.error(error.value);
      logger.error('获取设备类型失败', err);
      throw err;
    } finally {
      operationLoading.value.list = false;
    }
  }

  // 获取设备类型汇总数据
  async function fetchSummaryData() {
    operationLoading.value.summary = true;
    resetError();

    try {
      const response = await deviceTypeApi.getDeviceTypeSummary();
      if (response.code === 200 && response.data) {
        summaryData.value = transformSummaryData(response.data);
      } else {
        const errorMessage = response.message || '获取设备类型汇总数据失败';
        error.value = errorMessage;
        throw new Error(errorMessage);
      }
      return summaryData.value;
    } catch (err) {
      error.value = handleErrorMessage(err, '获取设备类型汇总数据失败');
      ElMessage.error(error.value);
      logger.error('获取设备类型汇总数据失败', err);
      throw err;
    } finally {
      operationLoading.value.summary = false;
    }
  }

  // 创建设备类型（自动刷新缓存）
  async function createDeviceType(data) {
    operationLoading.value.create = true;
    resetError();

    try {
      const response = await deviceTypeApi.addDeviceType(data);
      if (response.success) {
        await fetchDeviceTypes({}, true); // 强制刷新缓存
        ElMessage.success('创建设备类型成功');
        return response.data;
      }
      const errorMessage = response.message || '创建设备类型失败';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } catch (err) {
      error.value = handleErrorMessage(err, '创建设备类型失败');
      ElMessage.error(error.value);
      logger.error('创建设备类型失败', err);
      throw err;
    } finally {
      operationLoading.value.create = false;
    }
  }

  // 更新设备类型（自动更新本地数据）
  async function updateDeviceType(id, data) {
    operationLoading.value.update = true;
    resetError();

    try {
      const response = await deviceTypeApi.updateDeviceType({ ...data, id });
      if (response.success) {
        // 更新本地数据
        const index = deviceTypes.value.findIndex((t) => t.id === id);
        if (index !== -1) {
          deviceTypes.value[index] = { ...deviceTypes.value[index], ...data };
        }
        ElMessage.success('更新设备类型成功');
        return response.data;
      }
      const errorMessage = response.message || '更新设备类型失败';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } catch (err) {
      error.value = handleErrorMessage(err, '更新设备类型失败');
      ElMessage.error(error.value);
      logger.error('更新设备类型失败', err);
      throw err;
    } finally {
      operationLoading.value.update = false;
    }
  }

  // 删除设备类型（自动从本地数据中移除）
  async function deleteDeviceType(id) {
    operationLoading.value.delete = true;
    resetError();

    try {
      const response = await deviceTypeApi.deleteDeviceType(id);
      if (response.success) {
        // 从本地数据中移除
        deviceTypes.value = deviceTypes.value.filter((t) => t.id !== id);
        ElMessage.success('删除设备类型成功');
        return response.data;
      }
      const errorMessage = response.message || '删除设备类型失败';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } catch (err) {
      error.value = handleErrorMessage(err, '删除设备类型失败');
      ElMessage.error(error.value);
      logger.error('删除设备类型失败', err);
      throw err;
    } finally {
      operationLoading.value.delete = false;
    }
  }

  // 清除缓存
  function clearCache() {
    lastUpdated.value = null;
    logger.debug('清除设备类型缓存');
  }

  // ==================== 导出 ====================
  return {
    // 状态
    deviceTypes,
    deviceTypeTree,
    summaryData,
    summaryFilter,
    loading,
    error,
    operationLoading,
    lastUpdated,

    // Getters
    getAllDeviceTypes,
    getActiveDeviceTypes,
    getDeviceTypeTree,
    getSummaryData,
    getFilteredSummaryData,
    getDeviceTypeById,
    getDeviceTypeByCode,
    getTopLevelDeviceTypes,
    getChildDeviceTypes,
    needsRefresh,

    // Actions
    resetError,
    fetchDeviceTypes,
    fetchSummaryData,
    applySummaryFilter,
    resetSummaryFilter,
    createDeviceType,
    updateDeviceType,
    deleteDeviceType,
    clearCache,
  };
});
