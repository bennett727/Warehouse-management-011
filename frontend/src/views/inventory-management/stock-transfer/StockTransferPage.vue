<!--
  @file: StockTransferPage.vue
  @description: 库存调拨页面
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <PageLayout title="库存调拨" description="管理仓库间设备调拨" data-cy="stock-transfer-page">
    <template #headerActions>
      <el-button type="primary" :icon="Plus" @click="handleCreate" data-cy="stock-transfer-create-btn"
        >新建调拨单</el-button
      >
      <el-button
        type="success"
        :icon="Download"
        @click="handleExport"
        :loading="exportLoading"
        data-cy="stock-transfer-export-btn"
        >导出</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterConfig.fields"
      :loading="loading"
      :header-title="filterConfig.header.title"
      :header-icon="filterConfig.header.icon"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable
      :data="tableData"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      data-cy="stock-transfer-table"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <el-table-column type="index" label="序号" width="60" data-cy="stock-transfer-index-column" />
      <el-table-column prop="transferNo" label="调拨单号" width="180" data-cy="stock-transfer-no-column" />
      <el-table-column prop="fromWarehouse" label="调出仓库" width="150" data-cy="stock-transfer-from-column" />
      <el-table-column prop="toWarehouse" label="调入仓库" width="150" data-cy="stock-transfer-to-column" />
      <el-table-column prop="deviceCode" label="设备编号" width="150" data-cy="stock-transfer-device-code-column" />
      <el-table-column prop="deviceName" label="设备名称" min-width="180" data-cy="stock-transfer-device-name-column" />
      <el-table-column prop="quantity" label="数量" width="100" data-cy="stock-transfer-quantity-column" />
      <el-table-column prop="transferDate" label="调拨日期" width="120" data-cy="stock-transfer-date-column" />
      <el-table-column prop="operator" label="操作人" width="120" data-cy="stock-transfer-operator-column" />
      <el-table-column prop="status" label="状态" width="100" data-cy="stock-transfer-status-column">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" :data-cy="`stock-transfer-status-tag-${row.transferNo}`">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" data-cy="stock-transfer-action-column">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)" :data-cy="`stock-transfer-view-btn-${row.transferNo}`">查看</el-button>
          <el-button link type="primary" @click="handleEdit(row)" :data-cy="`stock-transfer-edit-btn-${row.transferNo}`">编辑</el-button>
        </template>
      </el-table-column>
    </DataTable>
  </PageLayout>
</template>

<script setup>
import { Download, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getStockTransferList, exportStockTransfer } from '@/api/inventory/stockTransfer';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { createLogger } from '@/utils/logger';

const logger = createLogger('StockTransferPage');

const loading = ref(false);
const exportLoading = ref(false);

const searchParams = reactive({
  transferNo: '',
  fromWarehouse: '',
  toWarehouse: '',
  deviceCode: '',
  status: '',
  dateRange: [],
});

const searchFields = computed(() => [
  {
    prop: 'transferNo',
    label: '调拨单号',
    type: 'input',
    placeholder: '请输入调拨单号',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'fromWarehouse',
    label: '调出仓库',
    type: 'input',
    placeholder: '请输入调出仓库',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'toWarehouse',
    label: '调入仓库',
    type: 'input',
    placeholder: '请输入调入仓库',
    md: 8,
    lg: 6,
    clearable: true,
  },
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
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '待审核', value: 'pending' },
      { label: '已审核', value: 'approved' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ],
  },
  {
    prop: 'dateRange',
    label: '调拨日期',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.transfer(searchFields.value));

const tableData = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const getStatusType = (status) => {
  const map = { pending: 'warning', approved: 'primary', completed: 'success', cancelled: 'info' };
  return map[status] || '';
};

const getStatusText = (status) => {
  const map = { pending: '待审核', approved: '已审核', completed: '已完成', cancelled: '已取消' };
  return map[status] || status;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      transferNo: searchParams.transferNo || undefined,
      fromWarehouse: searchParams.fromWarehouse || undefined,
      toWarehouse: searchParams.toWarehouse || undefined,
      deviceCode: searchParams.deviceCode || undefined,
      status: searchParams.status || undefined,
    };
    if (searchParams.dateRange && searchParams.dateRange.length === 2) {
      params.startDate = searchParams.dateRange[0];
      params.endDate = searchParams.dateRange[1];
    }
    const response = await getStockTransferList(params);
    if (response.success) {
      tableData.value = response.data.list.map((item) => ({
        ...item,
        fromWarehouse: item.fromWarehouse?.name || item.fromWarehouse,
        toWarehouse: item.toWarehouse?.name || item.toWarehouse,
        deviceCode: item.device?.deviceCode || item.deviceCode,
        deviceName: item.device?.deviceName || item.deviceName,
        transferDate: item.transferDate || item.createTime,
        operator: item.operator?.name || item.operatorName || item.operator,
      }));
      pagination.total = response.data.total;
    } else {
      ElMessage.error(response.message || '获取调拨记录失败');
    }
  } catch (error) {
    logger.error('获取调拨记录失败', error);
    ElMessage.error(error.message || '获取调拨记录失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = Array.isArray(searchParams[key]) ? [] : '';
  });
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchData();
};

const handleCreate = () => {
  ElMessage.info('新建调拨单');
};

const handleEdit = (row) => {
  ElMessage.info(`编辑: ${row.transferNo}`);
};

const handleView = (row) => {
  ElMessage.info(`查看: ${row.transferNo}`);
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      transferNo: searchParams.transferNo || undefined,
      fromWarehouse: searchParams.fromWarehouse || undefined,
      toWarehouse: searchParams.toWarehouse || undefined,
      deviceCode: searchParams.deviceCode || undefined,
      status: searchParams.status || undefined,
    };
    if (searchParams.dateRange && searchParams.dateRange.length === 2) {
      params.startDate = searchParams.dateRange[0];
      params.endDate = searchParams.dateRange[1];
    }
    await exportStockTransfer(params);
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error(error.message || '导出失败');
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
:deep(.el-card) {
  margin-bottom: 20px;
}
</style>
