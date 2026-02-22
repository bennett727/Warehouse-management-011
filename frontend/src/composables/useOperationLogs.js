import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref } from 'vue';

import {
  cleanExpiredLogs,
  exportLogs,
  getLatestLogs,
  getLogDetail,
  getLogList,
  getLogStatistics,
} from '@/api/system/log';
import { createLogger } from '@/utils/logger';

const logger = createLogger('operationLogs');

export function useOperationLogs() {
  const loading = reactive({
    list: false,
    detail: false,
    statistics: false,
    latest: false,
    export: false,
    cleanup: false,
  });

  const queryParams = reactive({
    keyword: '',
    module: '',
    type: '',
    isSuccess: '',
    startTime: '',
    endTime: '',
    page: 1,
    pageSize: 20,
    sortBy: 'createTime',
    sortOrder: 'desc',
  });

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const logList = ref([]);
  const logDetail = ref(null);
  const latestLogs = ref([]);
  const statistics = ref(null);

  const operationModules = [
    { label: '设备管理', value: 'device' },
    { label: '库存管理', value: 'inventory' },
    { label: '维修管理', value: 'repair' },
    { label: '安装管理', value: 'installation' },
    { label: '用户管理', value: 'user' },
    { label: '角色管理', value: 'role' },
    { label: '权限管理', value: 'permission' },
    { label: '系统配置', value: 'system' },
  ];

  const operationTypes = [
    { label: '创建', value: 1 },
    { label: '更新', value: 2 },
    { label: '删除', value: 3 },
    { label: '查询', value: 4 },
    { label: '导入', value: 5 },
    { label: '导出', value: 6 },
    { label: '审批', value: 7 },
    { label: '登录', value: 8 },
    { label: '登出', value: 9 },
  ];

  const statusOptions = [
    { label: '成功', value: 1 },
    { label: '失败', value: 0 },
  ];

  const fetchLogList = async () => {
    loading.list = true;
    try {
      const params = {
        ...queryParams,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      const response = await getLogList(params);
      logList.value = response.data?.list || [];
      pagination.total = response.data?.total || 0;
    } catch (error) {
      ElMessage.error('获取操作日志列表失败');
      logger.error('获取操作日志列表失败:', error);
    } finally {
      loading.list = false;
    }
  };

  const fetchLogDetail = async (logId) => {
    loading.detail = true;
    try {
      const response = await getLogDetail(logId);
      logDetail.value = response.data;
      return response.data;
    } catch (error) {
      ElMessage.error('获取操作日志详情失败');
      logger.error('获取操作日志详情失败:', error);
      return null;
    } finally {
      loading.detail = false;
    }
  };

  const fetchLatestLogs = async (count = 10) => {
    loading.latest = true;
    try {
      const response = await getLatestLogs(count);
      latestLogs.value = response.data || [];
      return response.data;
    } catch (error) {
      ElMessage.error('获取最新操作日志失败');
      logger.error('获取最新操作日志失败:', error);
      return [];
    } finally {
      loading.latest = false;
    }
  };

  const fetchStatistics = async () => {
    loading.statistics = true;
    try {
      const response = await getLogStatistics();
      statistics.value = response.data;
      return response.data;
    } catch (error) {
      ElMessage.error('获取操作日志统计信息失败');
      logger.error('获取操作日志统计信息失败:', error);
      return null;
    } finally {
      loading.statistics = false;
    }
  };

  const handleSearch = () => {
    pagination.page = 1;
    fetchLogList();
  };

  const handleReset = () => {
    Object.assign(queryParams, {
      keyword: '',
      module: '',
      type: '',
      isSuccess: '',
      startTime: '',
      endTime: '',
      page: 1,
      pageSize: 20,
      sortBy: 'createTime',
      sortOrder: 'desc',
    });
    pagination.page = 1;
    fetchLogList();
  };

  const handlePageChange = (page) => {
    pagination.page = page;
    fetchLogList();
  };

  const handleSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.page = 1;
    fetchLogList();
  };

  const handleSortChange = ({ prop, order }) => {
    queryParams.sortBy = prop;
    queryParams.sortOrder = order === 'ascending' ? 'asc' : 'desc';
    fetchLogList();
  };

  const handleExport = async () => {
    loading.export = true;
    try {
      const params = { ...queryParams };
      const blob = await exportLogs(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `操作日志_${new Date().getTime()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      ElMessage.success('导出成功');
    } catch (error) {
      ElMessage.error('导出操作日志失败');
      logger.error('导出操作日志失败:', error);
    } finally {
      loading.export = false;
    }
  };

  const handleCleanup = async (days = 90) => {
    try {
      await ElMessageBox.confirm(`确定要清理 ${days} 天前的操作日志吗？此操作不可恢复！`, '确认清理', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      loading.cleanup = true;
      const response = await cleanExpiredLogs(days);
      ElMessage.success(response.message || '清理成功');
      fetchLogList();
      fetchStatistics();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('清理操作日志失败');
        logger.error('清理操作日志失败:', error);
      }
    } finally {
      loading.cleanup = false;
    }
  };

  const getModuleLabel = (module) => {
    const item = operationModules.find((m) => m.value === module);
    return item ? item.label : module;
  };

  const getTypeLabel = (type) => {
    const item = operationTypes.find((t) => t.value === type);
    return item ? item.label : type;
  };

  const getStatusLabel = (status) => {
    const item = statusOptions.find((s) => s.value === status);
    return item ? item.label : status;
  };

  const getStatusTagType = (status) => {
    return status === 1 ? 'success' : 'danger';
  };

  const formatDate = (date) => {
    if (!date) {
      return '';
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return {
    loading,
    queryParams,
    pagination,
    logList,
    logDetail,
    latestLogs,
    statistics,
    operationModules,
    operationTypes,
    statusOptions,
    fetchLogList,
    fetchLogDetail,
    fetchLatestLogs,
    fetchStatistics,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
    handleExport,
    handleCleanup,
    getModuleLabel,
    getTypeLabel,
    getStatusLabel,
    getStatusTagType,
    formatDate,
  };
}
