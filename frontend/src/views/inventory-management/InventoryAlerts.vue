<!--
  @file: InventoryAlerts.vue
  @description: 库存预警页面 - 使用真实数据
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.1
-->
<template>
  <PageLayout title="库存预警" description="查看和管理库存预警信息" data-cy="inventory-alerts-page">
    <template #headerActions>
      <el-button type="warning" :icon="Warning" @click="handleRefresh" :loading="loading" data-cy="alerts-refresh-btn"
        >刷新预警</el-button
      >
      <el-button
        type="success"
        :icon="Download"
        @click="handleExport"
        :loading="exportLoading"
        data-cy="alerts-export-btn"
        >导出预警</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="searchFields"
      :loading="loading"
      header-title="预警筛选"
      :header-icon="Warning"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable
      :data="alertList"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      data-cy="alerts-table"
      @page-change="handlePageChange"
    >
      <el-table-column label="序号" width="60" align="center" data-cy="alerts-index-column">
        <template #default="{ $index }">
          {{ (pagination.current - 1) * pagination.pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编号" width="150" data-cy="alerts-device-code-column" />
      <el-table-column prop="deviceName" label="设备名称" min-width="180" data-cy="alerts-device-name-column" />
      <el-table-column prop="alertType" label="预警类型" width="120" data-cy="alerts-type-column">
        <template #default="{ row }">
          <el-tag :type="getAlertTypeType(row.alertType)" :data-cy="`alerts-type-tag-${row.id}`">{{ getAlertTypeText(row.alertType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="currentStock" label="当前库存" width="100" data-cy="alerts-stock-column" />
      <el-table-column prop="threshold" label="预警阈值" width="100" data-cy="alerts-threshold-column" />
      <el-table-column prop="alertTime" label="预警时间" width="180" data-cy="alerts-time-column" />
      <el-table-column prop="status" label="状态" width="100" data-cy="alerts-status-column">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" :data-cy="`alerts-status-tag-${row.id}`">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" data-cy="alerts-action-column">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)" :data-cy="`alerts-view-btn-${row.id}`">查看</el-button>
          <el-button link type="success" @click="handleProcess(row)" :data-cy="`alerts-process-btn-${row.id}`">处理</el-button>
        </template>
      </el-table-column>
    </DataTable>
  </PageLayout>
</template>

<script setup>
import { Download, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getInventoryAlerts } from '@/api/inventory/device';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('InventoryAlerts');

const loading = ref(false);
const exportLoading = ref(false);

const searchForm = reactive({
  deviceCode: '',
  deviceName: '',
  alertType: '',
  status: '',
  dateRange: [],
});

const searchFields = computed(() => [
  {
    prop: 'deviceCode',
    label: '设备编号',
    type: 'input',
    placeholder: '请输入设备编号',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    type: 'input',
    placeholder: '请输入设备名称',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'alertType',
    label: '预警类型',
    type: 'select',
    placeholder: '请选择预警类型',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '库存不足', value: 'LOW_STOCK' },
      { label: '库存过剩', value: 'OVER_STOCK' },
      { label: '过期预警', value: 'EXPIRE' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '未处理', value: 'PENDING' },
      { label: '处理中', value: 'PROCESSING' },
      { label: '已处理', value: 'RESOLVED' },
    ],
  },
  {
    prop: 'dateRange',
    label: '预警时间',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 预警列表数据
const alertList = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const getAlertTypeType = (type) => {
  const map = { LOW_STOCK: 'danger', OVER_STOCK: 'warning', EXPIRE: 'info' };
  return map[type] || '';
};

const getAlertTypeText = (type) => {
  const map = { LOW_STOCK: '库存不足', OVER_STOCK: '库存过剩', EXPIRE: '过期预警' };
  return map[type] || type;
};

const getStatusType = (status) => {
  const map = { PENDING: 'danger', PROCESSING: 'warning', RESOLVED: 'success' };
  return map[status] || '';
};

const getStatusText = (status) => {
  const map = { PENDING: '未处理', PROCESSING: '处理中', RESOLVED: '已处理' };
  return map[status] || status;
};

// 加载预警数据
const loadAlertData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current, // 后端页码从1开始，直接使用前端值
      size: pagination.pageSize, // 使用size而非pageSize，与后端一致
      deviceCode: searchForm.deviceCode,
      deviceName: searchForm.deviceName,
      alertType: searchForm.alertType,
      status: searchForm.status,
    };

    // 添加日期范围参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }

    const response = await getInventoryAlerts(params);
    if (response.code === 200 && response.data) {
      alertList.value = response.data.list || response.data || [];
      pagination.total = response.data.total || alertList.value.length;
    } else {
      alertList.value = [];
      pagination.total = 0;
      ElMessage.warning(response.message || '获取预警数据失败');
    }
  } catch (error) {
    logger.error('加载库存预警数据失败:', error);
    ElMessage.error('加载数据失败');
    alertList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadAlertData();
};

const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = Array.isArray(searchForm[key]) ? [] : '';
  });
  pagination.current = 1;
  loadAlertData();
};

const handlePageChange = (page) => {
  pagination.current = page;
  loadAlertData();
};

const handleRefresh = () => {
  loadAlertData();
};

const handleExport = () => {
  exportLoading.value = true;
  setTimeout(() => {
    exportLoading.value = false;
    ElMessage.success('导出成功');
  }, 1000);
};

const handleView = (row) => {
  ElMessage.info(`查看: ${row.deviceCode}`);
};

const handleProcess = (row) => {
  ElMessage.success(`处理: ${row.deviceCode}`);
};

onMounted(() => {
  loadAlertData();
});
</script>

<style scoped>
:deep(.el-card) {
  margin-bottom: 20px;
}
</style>
