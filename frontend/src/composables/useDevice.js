/**
 * 设备管理Composable
 * @file: useDevice.js
 * @description: 提供设备管理的可复用逻辑，包括设备列表、详情、CRUD操作等
 * @author: Trae AI
 * @createTime: 2025-12-22 00:00:00
 * @version: 1.0
 */

import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

import apiManager from '@/api/ApiManager';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useDevice');

/**
 * 设备管理Composable
 * @param {object} options - 配置选项
 * @param {boolean} options.autoLoad - 是否自动加载数据
 * @param {number} options.defaultPageSize - 默认每页数量
 * @returns {object} 设备管理状态和方法
 */
export function useDevice(options = {}) {
  const { autoLoad = true, defaultPageSize = 10 } = options;

  const deviceApi = apiManager.device;

  // ==================== 列表状态 ====================
  const devices = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(defaultPageSize);
  const total = ref(0);

  // ==================== 筛选状态 ====================
  const searchKeyword = ref('');
  const filterType = ref('');
  const filterStatus = ref('');
  const filterArea = ref('');

  // ==================== 详情状态 ====================
  const currentDevice = ref(null);
  const detailLoading = ref(false);

  // ==================== 操作状态 ====================
  const operationLoading = ref({
    create: false,
    update: false,
    delete: false,
    batchDelete: false,
    statusUpdate: false,
    export: false,
    import: false,
  });

  // ==================== 选择状态 ====================
  const selectedDevices = ref([]);
  const selectedDeviceIds = computed(() => selectedDevices.value.map((d) => d.id));

  // ==================== 计算属性 ====================
  const hasSelection = computed(() => selectedDevices.value.length > 0);
  const allSelected = computed(() => {
    return devices.value.length > 0 && selectedDevices.value.length === devices.value.length;
  });

  // ==================== 方法 ====================

  /**
   * 加载设备列表
   * @param {object} params - 查询参数
   * @returns {Promise<void>}
   */
  async function loadDevices(params = {}) {
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

      logger.debug('[useDevice.loadDevices] 请求参数:', queryParams);
      const response = await deviceApi.getList(queryParams);

      if (response && (response.devices || response.records)) {
        devices.value = response.devices || response.records;
        total.value = response.total || 0;
      } else {
        devices.value = [];
        total.value = 0;
      }
    } catch (error) {
      logger.error('[useDevice.loadDevices] 请求失败:', error);
      ElMessage.error('加载设备列表失败');
      devices.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加载设备详情
   * @param {string|number} deviceId - 设备ID
   * @returns {Promise<object|null>}
   */
  async function loadDeviceDetail(deviceId) {
    detailLoading.value = true;
    try {
      const response = await deviceApi.getById(deviceId);
      currentDevice.value = response;
      return response;
    } catch (error) {
      logger.error('[useDevice.loadDeviceDetail] 请求失败:', error);
      ElMessage.error('加载设备详情失败');
      currentDevice.value = null;
      return null;
    } finally {
      detailLoading.value = false;
    }
  }

  /**
   * 创建设备
   * @param {object} deviceData - 设备数据
   * @returns {Promise<object>}
   */
  async function createDevice(deviceData) {
    operationLoading.value.create = true;
    try {
      const response = await deviceApi.create(deviceData);
      ElMessage.success('设备创建成功');
      await loadDevices();
      return response;
    } catch (error) {
      logger.error('[useDevice.createDevice] 请求失败:', error);
      ElMessage.error('设备创建失败');
      throw error;
    } finally {
      operationLoading.value.create = false;
    }
  }

  /**
   * 更新设备
   * @param {string|number} deviceId - 设备ID
   * @param {object} deviceData - 设备数据
   * @returns {Promise<object>}
   */
  async function updateDevice(deviceId, deviceData) {
    operationLoading.value.update = true;
    try {
      const response = await deviceApi.update(deviceId, deviceData);
      ElMessage.success('设备更新成功');
      await loadDevices();
      if (currentDevice.value && currentDevice.value.id === deviceId) {
        currentDevice.value = response;
      }
      return response;
    } catch (error) {
      logger.error('[useDevice.updateDevice] 请求失败:', error);
      ElMessage.error('设备更新失败');
      throw error;
    } finally {
      operationLoading.value.update = false;
    }
  }

  /**
   * 删除设备
   * @param {string|number} deviceId - 设备ID
   * @param {boolean} confirm - 是否需要确认
   * @returns {Promise<void>}
   */
  async function deleteDevice(deviceId, confirm = true) {
    if (confirm) {
      try {
        await ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
      } catch {
        return;
      }
    }

    operationLoading.value.delete = true;
    try {
      await deviceApi.remove(deviceId);
      ElMessage.success('设备删除成功');
      await loadDevices();
      if (currentDevice.value && currentDevice.value.id === deviceId) {
        currentDevice.value = null;
      }
    } catch (error) {
      logger.error('[useDevice.deleteDevice] 请求失败:', error);
      ElMessage.error('设备删除失败');
      throw error;
    } finally {
      operationLoading.value.delete = false;
    }
  }

  /**
   * 批量删除设备
   * @param {Array<string|number>} deviceIds - 设备ID数组
   * @param {boolean} confirm - 是否需要确认
   * @returns {Promise<void>}
   */
  async function batchDeleteDevices(deviceIds, confirm = true) {
    if (confirm) {
      try {
        await ElMessageBox.confirm(`确定要删除选中的 ${deviceIds.length} 个设备吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
      } catch {
        return;
      }
    }

    operationLoading.value.batchDelete = true;
    try {
      await deviceApi.batchRemove(deviceIds);
      ElMessage.success(`成功删除 ${deviceIds.length} 个设备`);
      await loadDevices();
      selectedDevices.value = [];
    } catch (error) {
      logger.error('[useDevice.batchDeleteDevices] 请求失败:', error);
      ElMessage.error('批量删除设备失败');
      throw error;
    } finally {
      operationLoading.value.batchDelete = false;
    }
  }

  /**
   * 更新设备状态
   * @param {string|number} deviceId - 设备ID
   * @param {number} status - 目标状态
   * @param {string} remark - 备注
   * @returns {Promise<void>}
   */
  async function updateDeviceStatus(deviceId, status, remark = '') {
    operationLoading.value.statusUpdate = true;
    try {
      await deviceApi.updateStatus(deviceId, status, remark);
      ElMessage.success('设备状态更新成功');
      await loadDevices();
      if (currentDevice.value && currentDevice.value.id === deviceId) {
        currentDevice.value.status = status;
      }
    } catch (error) {
      logger.error('[useDevice.updateDeviceStatus] 请求失败:', error);
      ElMessage.error('设备状态更新失败');
      throw error;
    } finally {
      operationLoading.value.statusUpdate = false;
    }
  }

  /**
   * 导出设备数据
   * @param {object} params - 导出参数
   * @returns {Promise<void>}
   */
  async function exportDevices(params = {}) {
    operationLoading.value.export = true;
    try {
      const response = await deviceApi.export({
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
      link.download = `设备数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      ElMessage.success('设备数据导出成功');
    } catch (error) {
      logger.error('[useDevice.exportDevices] 请求失败:', error);
      ElMessage.error('设备数据导出失败');
      throw error;
    } finally {
      operationLoading.value.export = false;
    }
  }

  /**
   * 搜索设备
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<void>}
   */
  async function search(keyword) {
    searchKeyword.value = keyword;
    currentPage.value = 1;
    await loadDevices();
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
    await loadDevices();
  }

  /**
   * 分页大小变化
   * @param {number} size - 新的每页数量
   * @returns {Promise<void>}
   */
  async function handleSizeChange(size) {
    pageSize.value = size;
    currentPage.value = 1;
    await loadDevices();
  }

  /**
   * 当前页变化
   * @param {number} page - 新的当前页
   * @returns {Promise<void>}
   */
  async function handleCurrentChange(page) {
    currentPage.value = page;
    await loadDevices();
  }

  /**
   * 全选/取消全选
   * @param {boolean} checked - 是否选中
   * @returns {void}
   */
  function toggleSelectAll(checked) {
    if (checked) {
      selectedDevices.value = [...devices.value];
    } else {
      selectedDevices.value = [];
    }
  }

  /**
   * 清空选择
   * @returns {void}
   */
  function clearSelection() {
    selectedDevices.value = [];
  }

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      loadDevices();
    });
  }

  return {
    // 状态
    devices,
    loading,
    currentPage,
    pageSize,
    total,
    searchKeyword,
    filterType,
    filterStatus,
    filterArea,
    currentDevice,
    detailLoading,
    operationLoading,
    selectedDevices,
    selectedDeviceIds,

    // 计算属性
    hasSelection,
    allSelected,

    // 方法
    loadDevices,
    loadDeviceDetail,
    createDevice,
    updateDevice,
    deleteDevice,
    batchDeleteDevices,
    updateDeviceStatus,
    exportDevices,
    search,
    resetFilters,
    refresh,
    handleSizeChange,
    handleCurrentChange,
    toggleSelectAll,
    clearSelection,
  };
}

/**
 * 设备状态选项Composable
 * @returns {object} 设备状态选项
 */
export function useDeviceStatusOptions() {
  const statusOptions = [
    { label: '待入库', value: -1, type: 'info' },
    { label: '在库', value: 0, type: 'success' },
    { label: '使用中', value: 1, type: 'primary' },
    { label: '维护中', value: 2, type: 'warning' },
    { label: '已报废', value: 3, type: 'danger' },
    { label: '维修中', value: 4, type: 'warning' },
    { label: '正常', value: 5, type: 'success' },
  ];

  const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || '未知';
  };

  const getStatusType = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.type || 'info';
  };

  return {
    statusOptions,
    getStatusLabel,
    getStatusType,
  };
}

export default useDevice;
