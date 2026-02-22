/**
 * 库存管理Composable
 * @file: useInventory.js
 * @description: 提供库存管理的可复用逻辑，包括库存列表、出入库操作等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

import {
  getInventoryStatistics,
  stockIn as stockInApi,
  stockOut as stockOutApi,
  exportInventoryData,
} from '@/api/inventory/inventory';
import { createStockTransfer } from '@/api/inventory/stockTransfer';
import inventoryLockManager from '@/utils/inventoryLockManager';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useInventory');

/**
 * 库存管理Composable
 * @param {object} options - 配置选项
 * @param {boolean} options.autoLoad - 是否自动加载数据
 * @param {number} options.defaultPageSize - 默认每页数量
 * @returns {object} 库存管理状态和方法
 */
export function useInventory(options = {}) {
  const { autoLoad = true, defaultPageSize = 10 } = options;

  // ==================== 列表状态 ====================
  const inventoryList = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(defaultPageSize);
  const total = ref(0);

  // ==================== 统计数据 ====================
  const statistics = ref({
    totalStock: 0,
    monthlyInbound: 0,
    monthlyOutbound: 0,
    alertCount: 0,
    todayInbound: 0,
    todayOutbound: 0,
    totalInbound: 0,
    totalOutbound: 0,
  });

  // ==================== 筛选状态 ====================
  const searchKeyword = ref('');
  const filterType = ref('');
  const filterStatus = ref('');
  const filterArea = ref('');

  // ==================== 详情状态 ====================
  const currentInventory = ref(null);
  const detailLoading = ref(false);

  // ==================== 操作状态 ====================
  const operationLoading = ref({
    stockIn: false,
    stockOut: false,
    transfer: false,
    export: false,
  });

  // ==================== 选择状态 ====================
  const selectedItems = ref([]);
  const selectedItemIds = computed(() => selectedItems.value.map((item) => item.id));

  // ==================== 计算属性 ====================
  const hasSelection = computed(() => selectedItems.value.length > 0);
  const allSelected = computed(() => {
    return inventoryList.value.length > 0 && selectedItems.value.length === inventoryList.value.length;
  });

  // ==================== 方法 ====================

  /**
   * 获取库存统计数据
   * @returns {Promise<void>}
   */
  async function _fetchStatistics() {
    try {
      const response = await getInventoryStatistics();
      if (response && response.data) {
        const { data } = response;
        statistics.value = {
          totalStock: data.totalCount || data.totalStock || 0,
          monthlyInbound: data.monthlyInbound || 0,
          monthlyOutbound: data.monthlyOutbound || 0,
          alertCount: data.alertCount || 0,
          todayInbound: data.todayInbound || 0,
          todayOutbound: data.todayOutbound || 0,
          totalInbound: data.totalInbound || 0,
          totalOutbound: data.totalOutbound || 0,
        };
      }
    } catch (error) {
      logger.error('[useInventory.fetchStatistics] 请求失败:', error);
      ElMessage.error('获取库存统计数据失败');
    }
  }

  /**
   * 加载库存列表
   * @param {object} params - 查询参数
   * @returns {Promise<void>}
   */
  async function loadInventoryList(params = {}) {
    loading.value = true;
    try {
      const queryParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        typeId: filterType.value,
        status: filterStatus.value,
        areaId: filterArea.value,
        ...params,
      };

      logger.debug('[useInventory.loadInventoryList] 请求参数:', queryParams);
      const response = await getInventoryStatistics(queryParams);

      if (response && (response.items || response.records)) {
        inventoryList.value = response.items || response.records;
        total.value = response.total || 0;
      } else {
        inventoryList.value = [];
        total.value = 0;
      }
    } catch (error) {
      logger.error('[useInventory.loadInventoryList] 请求失败:', error);
      ElMessage.error('加载库存列表失败');
      inventoryList.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加载库存详情
   * @param {string|number} inventoryId - 库存ID
   * @returns {Promise<object|null>}
   */
  async function loadInventoryDetail(inventoryId) {
    detailLoading.value = true;
    try {
      const response = await getInventoryStatistics({ id: inventoryId });
      currentInventory.value = response;
      return response;
    } catch (error) {
      logger.error('[useInventory.loadInventoryDetail] 请求失败:', error);
      ElMessage.error('加载库存详情失败');
      currentInventory.value = null;
      return null;
    } finally {
      detailLoading.value = false;
    }
  }

  /**
   * 入库操作
   * @param {object} stockInData - 入库数据
   * @returns {Promise<object>}
   */
  async function stockIn(stockInData) {
    operationLoading.value.stockIn = true;
    const lockIds = [];
    try {
      const devices = stockInData.devices || [];
      const { warehouseId } = stockInData;

      for (const device of devices) {
        try {
          const lockResult = await inventoryLockManager.acquireLock(
            'inventory',
            `${warehouseId}_${device.deviceCode}`,
            {
              userId: stockInData.operator || 'system',
              reason: '入库操作',
              timeout: 60000,
            }
          );

          if (!lockResult.success) {
            throw new Error(`设备 ${device.deviceCode} 正在被其他操作占用，请稍后重试`);
          }

          lockIds.push(lockResult.lockId);
        } catch (error) {
          logger.error(`[useInventory.stockIn] 获取设备 ${device.deviceCode} 锁失败:`, error);
          throw new Error(`设备 ${device.deviceCode} 锁定失败，请稍后重试`);
        }
      }

      const response = await stockInApi(stockInData);
      ElMessage.success('入库成功');
      await loadInventoryList();
      return response;
    } catch (error) {
      logger.error('[useInventory.stockIn] 请求失败:', error);
      ElMessage.error(error.message || '入库失败');
      throw error;
    } finally {
      for (const lockId of lockIds) {
        try {
          const [resourceType, resourceId] = lockId.split(':');
          await inventoryLockManager.releaseLock(resourceType, resourceId);
        } catch (error) {
          logger.error('[useInventory.stockIn] 释放锁失败:', error);
        }
      }
      operationLoading.value.stockIn = false;
    }
  }

  /**
   * 出库操作
   * @param {object} stockOutData - 出库数据
   * @returns {Promise<object>}
   */
  async function stockOut(stockOutData) {
    operationLoading.value.stockOut = true;
    const lockIds = [];
    try {
      const devices = stockOutData.devices || [];
      const { warehouseId } = stockOutData;

      for (const device of devices) {
        try {
          const lockResult = await inventoryLockManager.acquireLock(
            'inventory',
            `${warehouseId}_${device.deviceCode}`,
            {
              userId: stockOutData.operator || 'system',
              reason: '出库操作',
              timeout: 60000,
            }
          );

          if (!lockResult.success) {
            throw new Error(`设备 ${device.deviceCode} 正在被其他操作占用，请稍后重试`);
          }

          lockIds.push(lockResult.lockId);
        } catch (error) {
          logger.error(`[useInventory.stockOut] 获取设备 ${device.deviceCode} 锁失败:`, error);
          throw new Error(`设备 ${device.deviceCode} 锁定失败，请稍后重试`);
        }
      }

      const response = await stockOutApi(stockOutData);
      ElMessage.success('出库成功');
      await loadInventoryList();
      return response;
    } catch (error) {
      logger.error('[useInventory.stockOut] 请求失败:', error);
      ElMessage.error(error.message || '出库失败');
      throw error;
    } finally {
      for (const lockId of lockIds) {
        try {
          const [resourceType, resourceId] = lockId.split(':');
          await inventoryLockManager.releaseLock(resourceType, resourceId);
        } catch (error) {
          logger.error('[useInventory.stockOut] 释放锁失败:', error);
        }
      }
      operationLoading.value.stockOut = false;
    }
  }

  /**
   * 库存调拨
   * @param {object} transferData - 调拨数据
   * @returns {Promise<object>}
   */
  async function transfer(transferData) {
    operationLoading.value.transfer = true;
    const lockIds = [];
    try {
      const devices = transferData.devices || [];
      const { sourceWarehouseId } = transferData;
      const { targetWarehouseId } = transferData;

      for (const device of devices) {
        try {
          const sourceLockResult = await inventoryLockManager.acquireLock(
            'inventory',
            `${sourceWarehouseId}_${device.deviceCode}`,
            {
              userId: transferData.operator || 'system',
              reason: '调拨操作（源仓库）',
              timeout: 60000,
            }
          );

          if (!sourceLockResult.success) {
            throw new Error(`设备 ${device.deviceCode} 在源仓库正在被其他操作占用，请稍后重试`);
          }

          lockIds.push(sourceLockResult.lockId);

          const targetLockResult = await inventoryLockManager.acquireLock(
            'inventory',
            `${targetWarehouseId}_${device.deviceCode}`,
            {
              userId: transferData.operator || 'system',
              reason: '调拨操作（目标仓库）',
              timeout: 60000,
            }
          );

          if (!targetLockResult.success) {
            throw new Error(`设备 ${device.deviceCode} 在目标仓库正在被其他操作占用，请稍后重试`);
          }

          lockIds.push(targetLockResult.lockId);
        } catch (error) {
          logger.error(`[useInventory.transfer] 获取设备 ${device.deviceCode} 锁失败:`, error);
          throw new Error(`设备 ${device.deviceCode} 锁定失败，请稍后重试`);
        }
      }

      const response = await createStockTransfer(transferData);
      ElMessage.success('调拨成功');
      await loadInventoryList();
      return response;
    } catch (error) {
      logger.error('[useInventory.transfer] 请求失败:', error);
      ElMessage.error(error.message || '调拨失败');
      throw error;
    } finally {
      for (const lockId of lockIds) {
        try {
          const [resourceType, resourceId] = lockId.split(':');
          await inventoryLockManager.releaseLock(resourceType, resourceId);
        } catch (error) {
          logger.error('[useInventory.transfer] 释放锁失败:', error);
        }
      }
      operationLoading.value.transfer = false;
    }
  }

  /**
   * 导出库存数据
   * @param {object} params - 导出参数
   * @returns {Promise<void>}
   */
  async function exportInventory(params = {}) {
    operationLoading.value.export = true;
    try {
      const response = await exportInventoryData({
        keyword: searchKeyword.value,
        typeId: filterType.value,
        status: filterStatus.value,
        areaId: filterArea.value,
        ...params,
      });

      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `库存数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      ElMessage.success('库存数据导出成功');
    } catch (error) {
      logger.error('[useInventory.exportInventory] 请求失败:', error);
      ElMessage.error('库存数据导出失败');
      throw error;
    } finally {
      operationLoading.value.export = false;
    }
  }

  /**
   * 搜索库存
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<void>}
   */
  async function search(keyword) {
    searchKeyword.value = keyword;
    currentPage.value = 1;
    await loadInventoryList();
  }

  /**
   * 重置筛选条件
   * @returns {void}
   */
  function resetFilters() {
    searchKeyword.value = '';
    filterType.value = '';
    filterStatus.value = '';
    filterArea.value = '';
    currentPage.value = 1;
  }

  /**
   * 刷新列表
   * @returns {Promise<void>}
   */
  async function refresh() {
    await loadInventoryList();
  }

  /**
   * 分页大小变化
   * @param {number} size - 新的每页数量
   * @returns {Promise<void>}
   */
  async function handleSizeChange(size) {
    pageSize.value = size;
    currentPage.value = 1;
    await loadInventoryList();
  }

  /**
   * 当前页变化
   * @param {number} page - 新的当前页
   * @returns {Promise<void>}
   */
  async function handleCurrentChange(page) {
    currentPage.value = page;
    await loadInventoryList();
  }

  /**
   * 全选/取消全选
   * @param {boolean} checked - 是否选中
   * @returns {void}
   */
  function toggleSelectAll(checked) {
    if (checked) {
      selectedItems.value = [...inventoryList.value];
    } else {
      selectedItems.value = [];
    }
  }

  /**
   * 清空选择
   * @returns {void}
   */
  function clearSelection() {
    selectedItems.value = [];
  }

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      loadInventoryList();
    });
  }

  return {
    // 状态
    inventoryList,
    loading,
    currentPage,
    pageSize,
    total,
    searchKeyword,
    filterType,
    filterStatus,
    filterArea,
    currentInventory,
    detailLoading,
    operationLoading,
    selectedItems,
    selectedItemIds,
    statistics,

    // 计算属性
    hasSelection,
    allSelected,

    // 方法
    loadInventoryList,
    loadInventoryDetail,
    stockIn,
    stockOut,
    transfer,
    exportInventory,
    search,
    resetFilters,
    refresh,
    handleSizeChange,
    handleCurrentChange,
    toggleSelectAll,
    clearSelection,
  };
}

export default useInventory;
