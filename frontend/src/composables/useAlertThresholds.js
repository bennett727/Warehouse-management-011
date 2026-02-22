import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref } from 'vue';

import {
  batchDeleteAlertThresholds,
  batchSetAlertThresholds,
  createAlertThreshold,
  deleteAlertThreshold,
  exportAlertThresholds,
  getAlertLevelConfig,
  getAlertThresholdDetail,
  getAlertThresholds,
  getAlertThresholdTemplate,
  importAlertThresholds,
  updateAlertLevelConfig,
  updateAlertThreshold,
} from '@/api/inventory/alertThreshold';
import { createLogger } from '@/utils/logger';

const logger = createLogger('alertThresholds');

export function useAlertThresholds() {
  const loading = reactive({
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false,
    batchDelete: false,
    batchSet: false,
    import: false,
    export: false,
    template: false,
    levelConfig: false,
  });

  const queryParams = reactive({
    deviceCode: '',
    deviceName: '',
    deviceTypeId: '',
    warehouseId: '',
    page: 1,
    pageSize: 20,
  });

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const thresholdList = ref([]);
  const thresholdDetail = ref(null);
  const levelConfig = ref(null);

  const alertLevels = [
    { label: '严重', value: 'critical', color: '#f56c6c' },
    { label: '一般', value: 'warning', color: '#e6a23c' },
    { label: '提示', value: 'info', color: '#909399' },
  ];

  const fetchThresholdList = async () => {
    loading.list = true;
    try {
      const params = {
        ...queryParams,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      const response = await getAlertThresholds(params);
      thresholdList.value = response.data?.list || [];
      pagination.total = response.data?.total || 0;
    } catch (error) {
      ElMessage.error('获取库存预警阈值列表失败');
      logger.error('获取库存预警阈值列表失败:', error);
    } finally {
      loading.list = false;
    }
  };

  const fetchThresholdDetail = async (thresholdId) => {
    loading.detail = true;
    try {
      const response = await getAlertThresholdDetail(thresholdId);
      thresholdDetail.value = response.data;
      return response.data;
    } catch (error) {
      ElMessage.error('获取库存预警阈值详情失败');
      logger.error('获取库存预警阈值详情失败:', error);
      return null;
    } finally {
      loading.detail = false;
    }
  };

  const fetchLevelConfig = async () => {
    loading.levelConfig = true;
    try {
      const response = await getAlertLevelConfig();
      levelConfig.value = response.data;
      return response.data;
    } catch (error) {
      ElMessage.error('获取预警级别配置失败');
      logger.error('获取预警级别配置失败:', error);
      return null;
    } finally {
      loading.levelConfig = false;
    }
  };

  const handleCreate = async (data) => {
    loading.create = true;
    try {
      const response = await createAlertThreshold(data);
      ElMessage.success(response.message || '创建成功');
      await fetchThresholdList();
      return true;
    } catch (error) {
      ElMessage.error('创建库存预警阈值失败');
      logger.error('创建库存预警阈值失败:', error);
      return false;
    } finally {
      loading.create = false;
    }
  };

  const handleUpdate = async (thresholdId, data) => {
    loading.update = true;
    try {
      const response = await updateAlertThreshold(thresholdId, data);
      ElMessage.success(response.message || '更新成功');
      await fetchThresholdList();
      return true;
    } catch (error) {
      ElMessage.error('更新库存预警阈值失败');
      logger.error('更新库存预警阈值失败:', error);
      return false;
    } finally {
      loading.update = false;
    }
  };

  const handleDelete = async (thresholdId) => {
    try {
      await ElMessageBox.confirm('确定要删除该库存预警阈值配置吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      loading.delete = true;
      const response = await deleteAlertThreshold(thresholdId);
      ElMessage.success(response.message || '删除成功');
      await fetchThresholdList();
      return true;
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除库存预警阈值失败');
        logger.error('删除库存预警阈值失败:', error);
      }
      return false;
    } finally {
      loading.delete = false;
    }
  };

  const handleBatchDelete = async (thresholdIds) => {
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${thresholdIds.length} 个库存预警阈值配置吗？`, '确认批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      loading.batchDelete = true;
      const response = await batchDeleteAlertThresholds(thresholdIds);
      ElMessage.success(response.message || '批量删除成功');
      await fetchThresholdList();
      return true;
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除库存预警阈值失败');
        logger.error('批量删除库存预警阈值失败:', error);
      }
      return false;
    } finally {
      loading.batchDelete = false;
    }
  };

  const handleBatchSet = async (data) => {
    loading.batchSet = true;
    try {
      const response = await batchSetAlertThresholds(data);
      ElMessage.success(response.message || '批量设置成功');
      await fetchThresholdList();
      return true;
    } catch (error) {
      ElMessage.error('批量设置库存预警阈值失败');
      logger.error('批量设置库存预警阈值失败:', error);
      return false;
    } finally {
      loading.batchSet = false;
    }
  };

  const handleImport = async (file) => {
    loading.import = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await importAlertThresholds(formData);
      ElMessage.success(response.message || '导入成功');
      await fetchThresholdList();
      return response.data;
    } catch (error) {
      ElMessage.error('导入库存预警阈值失败');
      logger.error('导入库存预警阈值失败:', error);
      return null;
    } finally {
      loading.import = false;
    }
  };

  const handleExport = async () => {
    loading.export = true;
    try {
      const params = { ...queryParams };
      const blob = await exportAlertThresholds(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `库存预警阈值_${new Date().getTime()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      ElMessage.success('导出成功');
    } catch (error) {
      ElMessage.error('导出库存预警阈值失败');
      logger.error('导出库存预警阈值失败:', error);
    } finally {
      loading.export = false;
    }
  };

  const handleDownloadTemplate = async () => {
    loading.template = true;
    try {
      const blob = await getAlertThresholdTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '库存预警阈值模板.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      ElMessage.success('模板下载成功');
    } catch (error) {
      ElMessage.error('模板下载失败');
      logger.error('模板下载失败:', error);
    } finally {
      loading.template = false;
    }
  };

  const handleUpdateLevelConfig = async (data) => {
    loading.levelConfig = true;
    try {
      const response = await updateAlertLevelConfig(data);
      ElMessage.success(response.message || '更新成功');
      await fetchLevelConfig();
      return true;
    } catch (error) {
      ElMessage.error('更新预警级别配置失败');
      logger.error('更新预警级别配置失败:', error);
      return false;
    } finally {
      loading.levelConfig = false;
    }
  };

  const handleSearch = () => {
    pagination.page = 1;
    fetchThresholdList();
  };

  const handleReset = () => {
    Object.assign(queryParams, {
      deviceCode: '',
      deviceName: '',
      deviceTypeId: '',
      warehouseId: '',
      page: 1,
      pageSize: 20,
    });
    pagination.page = 1;
    fetchThresholdList();
  };

  const handlePageChange = (page) => {
    pagination.page = page;
    fetchThresholdList();
  };

  const handleSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.page = 1;
    fetchThresholdList();
  };

  const getAlertLevelLabel = (level) => {
    const item = alertLevels.find((l) => l.value === level);
    return item ? item.label : level;
  };

  const getAlertLevelColor = (level) => {
    const item = alertLevels.find((l) => l.value === level);
    return item ? item.color : '#909399';
  };

  const getAlertLevelTagType = (level) => {
    const typeMap = {
      critical: 'danger',
      warning: 'warning',
      info: 'info',
    };
    return typeMap[level] || '';
  };

  const validateThreshold = (data) => {
    if (!data.minStock || data.minStock < 0) {
      ElMessage.warning('最小库存阈值必须大于等于0');
      return false;
    }
    if (!data.maxStock || data.maxStock < 0) {
      ElMessage.warning('最大库存阈值必须大于等于0');
      return false;
    }
    if (data.minStock >= data.maxStock) {
      ElMessage.warning('最小库存阈值必须小于最大库存阈值');
      return false;
    }
    if (data.reorderPoint !== undefined && data.reorderPoint !== null) {
      if (data.reorderPoint < 0) {
        ElMessage.warning('补货点必须大于等于0');
        return false;
      }
      if (data.reorderPoint >= data.maxStock) {
        ElMessage.warning('补货点必须小于最大库存阈值');
        return false;
      }
    }
    return true;
  };

  return {
    loading,
    queryParams,
    pagination,
    thresholdList,
    thresholdDetail,
    levelConfig,
    alertLevels,
    fetchThresholdList,
    fetchThresholdDetail,
    fetchLevelConfig,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    handleBatchSet,
    handleImport,
    handleExport,
    handleDownloadTemplate,
    handleUpdateLevelConfig,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    getAlertLevelLabel,
    getAlertLevelColor,
    getAlertLevelTagType,
    validateThreshold,
  };
}
