import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { batchManagementApi } from '../api/inventory/batch';
import { BatchStatus } from '../constants/batchStatus';
import { createLogger } from '../utils/logger';

const logger = createLogger('batchStore');

export const useBatchStore = defineStore('batch', () => {
  const batchList = ref([]);
  const currentBatch = ref(null);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);

  const batchStatistics = ref({
    totalBatches: 0,
    activeBatches: 0,
    frozenBatches: 0,
    expiringSoon: 0,
    expired: 0,
  });

  const expiringSoonList = ref([]);
  const expiredList = ref([]);

  const activeBatches = computed(() => {
    return batchList.value.filter((batch) => batch.status === BatchStatus.ACTIVE);
  });

  const frozenBatches = computed(() => {
    return batchList.value.filter((batch) => batch.status === BatchStatus.CLOSED);
  });

  const getBatchList = async (params = {}) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.getBatchList({
        page: currentPage.value,
        size: pageSize.value,
        ...params,
      });

      if (response.success) {
        batchList.value = response.data.content || response.data;
        total.value = response.data.totalElements || response.data.total || 0;
      }
      return response;
    } catch (error) {
      logger.error('获取批次列表失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getBatchById = async (id) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.getBatchById(id);
      if (response.success) {
        currentBatch.value = response.data;
      }
      return response;
    } catch (error) {
      logger.error('获取批次详情失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createBatch = async (batchData) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.createBatch(batchData);
      if (response.success) {
        await getBatchList();
      }
      return response;
    } catch (error) {
      logger.error('创建批次失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateBatch = async (id, batchData) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.updateBatch(id, batchData);
      if (response.success) {
        await getBatchList();
      }
      return response;
    } catch (error) {
      logger.error('更新批次失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteBatch = async (id) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.deleteBatch(id);
      if (response.success) {
        await getBatchList();
      }
      return response;
    } catch (error) {
      logger.error('删除批次失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const checkBatchCodeUnique = async (batchCode, excludeId = null) => {
    try {
      const response = await batchManagementApi.checkBatchCodeUnique(batchCode, excludeId);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('检查批次号唯一性失败', error);
      return null;
    }
  };

  const getBatchStatistics = async (params = {}) => {
    try {
      const response = await batchManagementApi.getBatchStatistics(params);
      if (response.success) {
        batchStatistics.value = response.data;
      }
      return response;
    } catch (error) {
      logger.error('获取批次统计失败', error);
      throw error;
    }
  };

  const getBatchExpiringSoon = async (days = 30) => {
    try {
      const response = await batchManagementApi.getBatchExpiringSoon(days);
      if (response.success) {
        expiringSoonList.value = response.data;
      }
      return response;
    } catch (error) {
      logger.error('获取即将过期批次失败', error);
      throw error;
    }
  };

  const getBatchExpired = async () => {
    try {
      const response = await batchManagementApi.getBatchExpired();
      if (response.success) {
        expiredList.value = response.data;
      }
      return response;
    } catch (error) {
      logger.error('获取已过期批次失败', error);
      throw error;
    }
  };

  const freezeBatch = async (id, reason) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.freezeBatch(id, reason);
      if (response.success) {
        await getBatchList();
      }
      return response;
    } catch (error) {
      logger.error('冻结批次失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const unfreezeBatch = async (id, reason) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.unfreezeBatch(id, reason);
      if (response.success) {
        await getBatchList();
      }
      return response;
    } catch (error) {
      logger.error('解冻批次失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const transferBatch = async (id, targetLocationId) => {
    loading.value = true;
    try {
      const response = await batchManagementApi.transferBatch(id, targetLocationId);
      if (response.success) {
        await getBatchList();
      }
      return response;
    } catch (error) {
      logger.error('转移批次失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const setPage = (page) => {
    currentPage.value = page;
  };

  const setPageSize = (size) => {
    pageSize.value = size;
  };

  const resetState = () => {
    batchList.value = [];
    currentBatch.value = null;
    loading.value = false;
    total.value = 0;
    currentPage.value = 1;
    pageSize.value = 10;
    batchStatistics.value = {
      totalBatches: 0,
      activeBatches: 0,
      frozenBatches: 0,
      expiringSoon: 0,
      expired: 0,
    };
    expiringSoonList.value = [];
    expiredList.value = [];
  };

  return {
    batchList,
    currentBatch,
    loading,
    total,
    currentPage,
    pageSize,
    batchStatistics,
    expiringSoonList,
    expiredList,
    activeBatches,
    frozenBatches,
    getBatchList,
    getBatchById,
    createBatch,
    updateBatch,
    deleteBatch,
    checkBatchCodeUnique,
    getBatchStatistics,
    getBatchExpiringSoon,
    getBatchExpired,
    freezeBatch,
    unfreezeBatch,
    transferBatch,
    setPage,
    setPageSize,
    resetState,
  };
});
