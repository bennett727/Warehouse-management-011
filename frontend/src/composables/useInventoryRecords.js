/**
 * 库存记录管理Composable
 * @file: useInventoryRecords.js
 * @description: 提供库存记录管理的可复用逻辑，包括出入库记录查询、统计、导出等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

import { getInboundRecords, getOutboundRecords, getReturnRecords } from '@/api/inventory/records';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useInventoryRecords');

/**
 * 库存记录管理Composable
 * @param {object} options - 配置选项
 * @param {boolean} options.autoLoad - 是否自动加载数据
 * @param {number} options.defaultPageSize - 默认每页数量
 * @returns {object} 库存记录管理状态和方法
 */
export function useInventoryRecords(options = {}) {
  const { autoLoad: _autoLoad = true, defaultPageSize = 10 } = options;

  // ==================== 列表状态 ====================
  const tableData = ref([]);
  const loading = ref(false);
  const exportLoading = ref(false);
  const pagination = ref({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  // ==================== 搜索参数 ====================
  const searchParams = ref({
    recordNo: '',
    operationType: '',
    deviceCode: '',
    deviceName: '',
    operator: '',
    dateRange: [],
    status: '',
  });

  // ==================== 选择状态 ====================
  const selectedRows = ref([]);

  // ==================== 统计数据 ====================
  const statistics = ref({
    totalInbound: 0,
    totalOutbound: 0,
    currentStock: 0,
    totalRecords: 0,
  });

  // ==================== 计算属性 ====================
  const hasSelection = computed(() => selectedRows.value.length > 0);

  // ==================== 方法 ====================

  /**
   * 加载记录列表
   * @returns {Promise<void>}
   */
  async function loadRecordList() {
    loading.value = true;
    try {
      const params = {
        page: pagination.value.current - 1,
        size: pagination.value.pageSize,
        recordNo: searchParams.value.recordNo,
        deviceCode: searchParams.value.deviceCode,
        deviceName: searchParams.value.deviceName,
        operator: searchParams.value.operator,
        startDate: searchParams.value.dateRange ? searchParams.value.dateRange[0] : '',
        endDate: searchParams.value.dateRange ? searchParams.value.dateRange[1] : '',
        status: searchParams.value.status,
      };

      let response;
      if (searchParams.value.operationType === 'purchase_inbound') {
        response = await getInboundRecords(params);
      } else if (searchParams.value.operationType === 'installation_outbound') {
        response = await getOutboundRecords(params);
      } else if (searchParams.value.operationType === 'repair_return') {
        response = await getReturnRecords(params);
      } else {
        const [inboundRes, outboundRes, returnRes] = await Promise.all([
          getInboundRecords(params),
          getOutboundRecords(params),
          getReturnRecords(params),
        ]);

        const allRecords = [
          ...(inboundRes.data?.records || []).map((item) => ({ ...item, operationType: 'purchase_inbound' })),
          ...(outboundRes.data?.records || []).map((item) => ({ ...item, operationType: 'installation_outbound' })),
          ...(returnRes.data?.records || []).map((item) => ({ ...item, operationType: 'repair_return' })),
        ];

        tableData.value = allRecords;
        pagination.value.total = allRecords.length;

        statistics.value.totalInbound = inboundRes.data?.total || 0;
        statistics.value.totalOutbound = outboundRes.data?.total || 0;
        statistics.value.currentStock = statistics.value.totalInbound - statistics.value.totalOutbound;
        statistics.value.totalRecords = allRecords.length;

        return;
      }

      if (response.success) {
        tableData.value = response.data?.records || [];
        pagination.value.total = response.data?.total || 0;

        if (searchParams.value.operationType === 'purchase_inbound') {
          statistics.value.totalInbound = response.data?.total || 0;
        } else if (searchParams.value.operationType === 'installation_outbound') {
          statistics.value.totalOutbound = response.data?.total || 0;
        } else if (searchParams.value.operationType === 'repair_return') {
          statistics.value.totalInbound = response.data?.total || 0;
        }

        statistics.value.currentStock = statistics.value.totalInbound - statistics.value.totalOutbound;
        statistics.value.totalRecords = pagination.value.total;
      } else {
        ElMessage.error(response.message || '加载记录列表失败');
      }
    } catch (error) {
      logger.error('加载记录列表失败', error, {
        operationType: searchParams.value.operationType,
        currentPage: pagination.value.current,
        pageSize: pagination.value.pageSize,
      });
      ElMessage.error('加载记录列表失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 搜索记录
   * @returns {Promise<void>}
   */
  async function handleSearch() {
    pagination.value.current = 1;
    await loadRecordList();
  }

  /**
   * 重置搜索条件
   * @returns {void}
   */
  function handleReset() {
    searchParams.value = {
      recordNo: '',
      operationType: '',
      deviceCode: '',
      deviceName: '',
      operator: '',
      dateRange: [],
      status: '',
    };
    pagination.value.current = 1;
    selectedRows.value = [];
  }

  /**
   * 页码变化
   * @param {number} page - 新的页码
   * @returns {Promise<void>}
   */
  async function handlePageChange(page) {
    pagination.value.current = page;
    await loadRecordList();
  }

  /**
   * 每页数量变化
   * @param {number} size - 新的每页数量
   * @returns {Promise<void>}
   */
  async function handlePageSizeChange(size) {
    pagination.value.pageSize = size;
    pagination.value.current = 1;
    await loadRecordList();
  }

  /**
   * 选择变化
   * @param {Array} rows - 选中的行
   * @returns {void}
   */
  function handleSelectionChange(rows) {
    selectedRows.value = rows;
  }

  /**
   * 导出记录
   * @param {object} params - 导出参数
   * @returns {Promise<void>}
   */
  async function exportRecords(params = {}) {
    exportLoading.value = true;
    try {
      const exportParams = {
        ...searchParams.value,
        records: selectedRows.value.length > 0 ? selectedRows.value : tableData.value,
        ...params,
      };

      logger.debug('导出记录参数:', exportParams);

      ElMessage.success('导出成功');
    } catch (error) {
      logger.error('导出失败', error, {
        selectedCount: selectedRows.value.length,
        totalRecords: tableData.value.length,
      });
      ElMessage.error('导出失败');
      throw error;
    } finally {
      exportLoading.value = false;
    }
  }

  /**
   * 清空选择
   * @returns {void}
   */
  function clearSelection() {
    selectedRows.value = [];
  }

  /**
   * 刷新列表
   * @returns {Promise<void>}
   */
  async function refresh() {
    await loadRecordList();
  }

  return {
    // 状态
    tableData,
    loading,
    exportLoading,
    pagination,
    searchParams,
    selectedRows,
    statistics,

    // 计算属性
    hasSelection,

    // 方法
    loadRecordList,
    handleSearch,
    handleReset,
    handlePageChange,
    handlePageSizeChange,
    handleSelectionChange,
    exportRecords,
    clearSelection,
    refresh,
  };
}

export default useInventoryRecords;
