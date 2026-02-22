import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { inboundApi, outboundApi, returnApi, recordApi } from '@/api/inventory/unified';
import { PAGINATION } from '@/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('inventoryOrder');

/**
 * 库存单据管理Store
 * 负责管理入库、出库、归还、出入库记录等单据的状态和操作
 */
export const useInventoryOrder = defineStore('inventoryOrder', () => {
  // ==================== 状态定义 ====================

  // 入库单据状态
  const inboundList = ref([]);
  const inboundDetail = ref(null);
  const inboundLoading = ref(false);
  const inboundSearchParams = ref({});
  const inboundPagination = ref({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // 出库单据状态
  const outboundList = ref([]);
  const outboundDetail = ref(null);
  const outboundLoading = ref(false);
  const outboundSearchParams = ref({});
  const outboundPagination = ref({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // 归还单据状态
  const returnList = ref([]);
  const returnDetail = ref(null);
  const returnLoading = ref(false);
  const returnSearchParams = ref({});
  const returnPagination = ref({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // 出入库记录状态
  const recordList = ref([]);
  const recordDetail = ref(null);
  const recordLoading = ref(false);
  const recordSearchParams = ref({});
  const recordPagination = ref({
    currentPage: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // 通用状态
  const currentOrderType = ref('');
  const selectedOrders = ref([]);

  // ==================== 计算属性 ====================

  const hasSelectedOrders = computed(() => {
    return selectedOrders.value.length > 0;
  });

  const selectedOrderIds = computed(() => {
    return selectedOrders.value.map((order) => order.id);
  });

  // ==================== 入库单据操作 ====================

  const loadInboundList = async (params = {}) => {
    try {
      inboundLoading.value = true;
      const mergedParams = {
        pageNum: inboundPagination.value.currentPage,
        pageSize: inboundPagination.value.pageSize,
        ...inboundSearchParams.value,
        ...params,
      };
      const response = await inboundApi.getInboundList(mergedParams);
      inboundList.value = response.data?.records || response.data?.list || [];
      inboundPagination.value.total = response.data?.total || 0;
    } catch (error) {
      logger.error('加载入库列表失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const loadInboundDetail = async (id) => {
    try {
      inboundLoading.value = true;
      const response = await inboundApi.getInboundDetail(id);
      inboundDetail.value = response.data;
      return response.data;
    } catch (error) {
      logger.error('加载入库详情失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const createInbound = async (data) => {
    try {
      inboundLoading.value = true;
      await inboundApi.saveInbound(data);
      await loadInboundList();
    } catch (error) {
      logger.error('创建入库单失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const updateInbound = async (id, data) => {
    try {
      inboundLoading.value = true;
      await inboundApi.updateInbound(id, data);
      await loadInboundList();
    } catch (error) {
      logger.error('更新入库单失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const deleteInbound = async (id) => {
    try {
      inboundLoading.value = true;
      await inboundApi.deleteInbound(id);
      await loadInboundList();
    } catch (error) {
      logger.error('删除入库单失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const batchDeleteInbounds = async (ids) => {
    try {
      inboundLoading.value = true;
      await inboundApi.batchDeleteInbounds(ids);
      await loadInboundList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量删除入库单失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const auditInbound = async (id, data) => {
    try {
      inboundLoading.value = true;
      await inboundApi.auditInbound(id, data);
      await loadInboundList();
    } catch (error) {
      logger.error('审核入库单失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const batchAuditInbounds = async (data) => {
    try {
      inboundLoading.value = true;
      await inboundApi.batchAuditInbounds(data);
      await loadInboundList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量审核入库单失败', error);
      throw error;
    } finally {
      inboundLoading.value = false;
    }
  };

  const exportInbounds = async (params) => {
    try {
      const response = await inboundApi.exportInbounds(params);
      return response;
    } catch (error) {
      logger.error('导出入库单失败', error);
      throw error;
    }
  };

  const getInboundStatistics = async (params) => {
    try {
      const response = await inboundApi.getInboundStatistics(params);
      return response.data;
    } catch (error) {
      logger.error('获取入库统计失败', error);
      throw error;
    }
  };

  const searchInbounds = async (params) => {
    try {
      inboundSearchParams.value = params;
      inboundPagination.value.currentPage = 1;
      await loadInboundList();
    } catch (error) {
      logger.error('搜索入库单失败', error);
      throw error;
    }
  };

  // ==================== 出库单据操作 ====================

  const loadOutboundList = async (params = {}) => {
    try {
      outboundLoading.value = true;
      const mergedParams = {
        pageNum: outboundPagination.value.currentPage,
        pageSize: outboundPagination.value.pageSize,
        ...outboundSearchParams.value,
        ...params,
      };
      const response = await outboundApi.getOutboundList(mergedParams);
      outboundList.value = response.data?.records || response.data?.list || [];
      outboundPagination.value.total = response.data?.total || 0;
    } catch (error) {
      logger.error('加载出库列表失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const loadOutboundDetail = async (id) => {
    try {
      outboundLoading.value = true;
      const response = await outboundApi.getOutboundDetail(id);
      outboundDetail.value = response.data;
      return response.data;
    } catch (error) {
      logger.error('加载出库详情失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const createOutbound = async (data) => {
    try {
      outboundLoading.value = true;
      await outboundApi.saveOutbound(data);
      await loadOutboundList();
    } catch (error) {
      logger.error('创建出库单失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const updateOutbound = async (id, data) => {
    try {
      outboundLoading.value = true;
      await outboundApi.updateOutbound(id, data);
      await loadOutboundList();
    } catch (error) {
      logger.error('更新出库单失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const deleteOutbound = async (id) => {
    try {
      outboundLoading.value = true;
      await outboundApi.deleteOutbound(id);
      await loadOutboundList();
    } catch (error) {
      logger.error('删除出库单失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const batchDeleteOutbounds = async (ids) => {
    try {
      outboundLoading.value = true;
      await outboundApi.batchDeleteOutbounds(ids);
      await loadOutboundList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量删除出库单失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const auditOutbound = async (id, data) => {
    try {
      outboundLoading.value = true;
      await outboundApi.auditOutbound(id, data);
      await loadOutboundList();
    } catch (error) {
      logger.error('审核出库单失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const batchAuditOutbounds = async (data) => {
    try {
      outboundLoading.value = true;
      await outboundApi.batchAuditOutbounds(data);
      await loadOutboundList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量审核出库单失败', error);
      throw error;
    } finally {
      outboundLoading.value = false;
    }
  };

  const exportOutbounds = async (params) => {
    try {
      const response = await outboundApi.exportOutbounds(params);
      return response;
    } catch (error) {
      logger.error('导出出库单失败', error);
      throw error;
    }
  };

  const getOutboundStatistics = async (params) => {
    try {
      const response = await outboundApi.getOutboundStatistics(params);
      return response.data;
    } catch (error) {
      logger.error('获取出库统计失败', error);
      throw error;
    }
  };

  const searchOutbounds = async (params) => {
    try {
      outboundSearchParams.value = params;
      outboundPagination.value.currentPage = 1;
      await loadOutboundList();
    } catch (error) {
      logger.error('搜索出库单失败', error);
      throw error;
    }
  };

  // ==================== 归还单据操作 ====================

  const loadReturnList = async (params = {}) => {
    try {
      returnLoading.value = true;
      const mergedParams = {
        pageNum: returnPagination.value.currentPage,
        pageSize: returnPagination.value.pageSize,
        ...returnSearchParams.value,
        ...params,
      };
      const response = await returnApi.getReturnList(mergedParams);
      returnList.value = response.data?.records || response.data?.list || [];
      returnPagination.value.total = response.data?.total || 0;
    } catch (error) {
      logger.error('加载归还列表失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const loadReturnDetail = async (id) => {
    try {
      returnLoading.value = true;
      const response = await returnApi.getReturnDetail(id);
      returnDetail.value = response.data;
      return response.data;
    } catch (error) {
      logger.error('加载归还详情失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const createReturn = async (data) => {
    try {
      returnLoading.value = true;
      await returnApi.saveReturn(data);
      await loadReturnList();
    } catch (error) {
      logger.error('创建归还单失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const updateReturn = async (id, data) => {
    try {
      returnLoading.value = true;
      await returnApi.updateReturn(id, data);
      await loadReturnList();
    } catch (error) {
      logger.error('更新归还单失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const deleteReturn = async (id) => {
    try {
      returnLoading.value = true;
      await returnApi.deleteReturn(id);
      await loadReturnList();
    } catch (error) {
      logger.error('删除归还单失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const batchDeleteReturns = async (ids) => {
    try {
      returnLoading.value = true;
      await returnApi.batchDeleteReturns(ids);
      await loadReturnList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量删除归还单失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const auditReturn = async (id, data) => {
    try {
      returnLoading.value = true;
      await returnApi.auditReturn(id, data);
      await loadReturnList();
    } catch (error) {
      logger.error('审核归还单失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const batchAuditReturns = async (data) => {
    try {
      returnLoading.value = true;
      await returnApi.batchAuditReturns(data);
      await loadReturnList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量审核归还单失败', error);
      throw error;
    } finally {
      returnLoading.value = false;
    }
  };

  const exportReturns = async (params) => {
    try {
      const response = await returnApi.exportReturns(params);
      return response;
    } catch (error) {
      logger.error('导出归还单失败', error);
      throw error;
    }
  };

  const getReturnStatistics = async (params) => {
    try {
      const response = await returnApi.getReturnStatistics(params);
      return response.data;
    } catch (error) {
      logger.error('获取归还统计失败', error);
      throw error;
    }
  };

  const searchReturns = async (params) => {
    try {
      returnSearchParams.value = params;
      returnPagination.value.currentPage = 1;
      await loadReturnList();
    } catch (error) {
      logger.error('搜索归还单失败', error);
      throw error;
    }
  };

  // ==================== 出入库记录操作 ====================

  const loadRecordList = async (params = {}) => {
    try {
      recordLoading.value = true;
      const mergedParams = {
        pageNum: recordPagination.value.currentPage,
        pageSize: recordPagination.value.pageSize,
        ...recordSearchParams.value,
        ...params,
      };
      const response = await recordApi.getRecordList(mergedParams);
      recordList.value = response.data?.records || response.data?.list || [];
      recordPagination.value.total = response.data?.total || 0;
    } catch (error) {
      logger.error('加载出入库记录列表失败', error);
      throw error;
    } finally {
      recordLoading.value = false;
    }
  };

  const loadRecordDetail = async (id) => {
    try {
      recordLoading.value = true;
      const response = await recordApi.getRecordDetail(id);
      recordDetail.value = response.data;
      return response.data;
    } catch (error) {
      logger.error('加载出入库记录详情失败', error);
      throw error;
    } finally {
      recordLoading.value = false;
    }
  };

  const deleteRecord = async (id) => {
    try {
      recordLoading.value = true;
      await recordApi.deleteRecord(id);
      await loadRecordList();
    } catch (error) {
      logger.error('删除出入库记录失败', error);
      throw error;
    } finally {
      recordLoading.value = false;
    }
  };

  const batchDeleteRecords = async (ids) => {
    try {
      recordLoading.value = true;
      await recordApi.batchDeleteRecords(ids);
      await loadRecordList();
      selectedOrders.value = [];
    } catch (error) {
      logger.error('批量删除出入库记录失败', error);
      throw error;
    } finally {
      recordLoading.value = false;
    }
  };

  const exportRecords = async (params) => {
    try {
      const response = await recordApi.exportRecords(params);
      return response;
    } catch (error) {
      logger.error('导出出入库记录失败', error);
      throw error;
    }
  };

  const getRecordStatistics = async (params) => {
    try {
      const response = await recordApi.getRecordStatistics(params);
      return response.data;
    } catch (error) {
      logger.error('获取出入库记录统计失败', error);
      throw error;
    }
  };

  const searchRecords = async (params) => {
    try {
      recordSearchParams.value = params;
      recordPagination.value.currentPage = 1;
      await loadRecordList();
    } catch (error) {
      logger.error('搜索出入库记录失败', error);
      throw error;
    }
  };

  // ==================== 通用操作 ====================

  const generateOrderNumber = async (_type) => {
    try {
      const response = await inboundApi.generateInboundNumber();
      return response.data;
    } catch (error) {
      logger.error('生成单据编号失败', error);
      throw error;
    }
  };

  const validateInventory = async (data) => {
    try {
      const response = await inboundApi.validateInbound(data);
      return response.data;
    } catch (error) {
      logger.error('验证库存失败', error);
      throw error;
    }
  };

  const setSelectedOrders = (orders) => {
    selectedOrders.value = orders;
  };

  const clearSelectedOrders = () => {
    selectedOrders.value = [];
  };

  const resetInboundState = () => {
    inboundList.value = [];
    inboundDetail.value = null;
    inboundSearchParams.value = {};
    inboundPagination.value = {
      currentPage: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
    };
  };

  const resetOutboundState = () => {
    outboundList.value = [];
    outboundDetail.value = null;
    outboundSearchParams.value = {};
    outboundPagination.value = {
      currentPage: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
    };
  };

  const resetReturnState = () => {
    returnList.value = [];
    returnDetail.value = null;
    returnSearchParams.value = {};
    returnPagination.value = {
      currentPage: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
    };
  };

  const resetRecordState = () => {
    recordList.value = [];
    recordDetail.value = null;
    recordSearchParams.value = {};
    recordPagination.value = {
      currentPage: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      total: 0,
    };
  };

  const resetAllState = () => {
    resetInboundState();
    resetOutboundState();
    resetReturnState();
    resetRecordState();
    currentOrderType.value = '';
    selectedOrders.value = [];
  };

  // ==================== 返回状态和方法 ====================

  return {
    // 入库单据状态
    inboundList,
    inboundDetail,
    inboundLoading,
    inboundSearchParams,
    inboundPagination,

    // 出库单据状态
    outboundList,
    outboundDetail,
    outboundLoading,
    outboundSearchParams,
    outboundPagination,

    // 归还单据状态
    returnList,
    returnDetail,
    returnLoading,
    returnSearchParams,
    returnPagination,

    // 出入库记录状态
    recordList,
    recordDetail,
    recordLoading,
    recordSearchParams,
    recordPagination,

    // 通用状态
    currentOrderType,
    selectedOrders,

    // 计算属性
    hasSelectedOrders,
    selectedOrderIds,

    // 入库单据操作
    loadInboundList,
    loadInboundDetail,
    createInbound,
    updateInbound,
    deleteInbound,
    batchDeleteInbounds,
    auditInbound,
    batchAuditInbounds,
    exportInbounds,
    getInboundStatistics,
    searchInbounds,

    // 出库单据操作
    loadOutboundList,
    loadOutboundDetail,
    createOutbound,
    updateOutbound,
    deleteOutbound,
    batchDeleteOutbounds,
    auditOutbound,
    batchAuditOutbounds,
    exportOutbounds,
    getOutboundStatistics,
    searchOutbounds,

    // 归还单据操作
    loadReturnList,
    loadReturnDetail,
    createReturn,
    updateReturn,
    deleteReturn,
    batchDeleteReturns,
    auditReturn,
    batchAuditReturns,
    exportReturns,
    getReturnStatistics,
    searchReturns,

    // 出入库记录操作
    loadRecordList,
    loadRecordDetail,
    deleteRecord,
    batchDeleteRecords,
    exportRecords,
    getRecordStatistics,
    searchRecords,

    // 通用操作
    generateOrderNumber,
    validateInventory,
    setSelectedOrders,
    clearSelectedOrders,
    resetInboundState,
    resetOutboundState,
    resetReturnState,
    resetRecordState,
    resetAllState,
  };
});
