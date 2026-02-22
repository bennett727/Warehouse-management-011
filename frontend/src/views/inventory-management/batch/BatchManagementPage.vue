<!--
  @file: BatchManagementPage.vue
  @description: 批次管理页面
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <PageLayout title="批次管理" description="管理设备批次信息">
    <template #headerActions>
      <el-button type="primary" :icon="Plus" @click="handleCreate">新建批次</el-button>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading">导出</el-button>
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
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="batchNo" label="批次号" width="180" />
      <el-table-column prop="batchName" label="批次名称" min-width="180" />
      <el-table-column prop="supplier" label="供应商" width="150" />
      <el-table-column prop="purchaseDate" label="采购日期" width="120" />
      <el-table-column prop="totalQuantity" label="总数量" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </DataTable>
  </PageLayout>
</template>

<script setup>
import { Plus, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';

import { batchManagementApi } from '@/api/inventory/batch';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BatchManagementPage');

const loading = ref(false);
const exportLoading = ref(false);

const searchParams = reactive({
  batchNo: '',
  batchName: '',
  supplier: '',
  status: '',
  dateRange: [],
});

const searchFields = computed(() => [
  { prop: 'batchNo', label: '批次号', type: 'input', placeholder: '请输入批次号', md: 8, lg: 6, clearable: true },
  { prop: 'batchName', label: '批次名称', type: 'input', placeholder: '请输入批次名称', md: 8, lg: 6, clearable: true },
  { prop: 'supplier', label: '供应商', type: 'input', placeholder: '请输入供应商', md: 8, lg: 6, clearable: true },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '在库', value: 'in_stock' },
      { label: '已出库', value: 'outbound' },
      { label: '已停用', value: 'disabled' },
    ],
  },
  {
    prop: 'dateRange',
    label: '采购日期',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.inventoryQuery(searchFields.value));

const tableData = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      batchNo: searchParams.batchNo || undefined,
      batchName: searchParams.batchName || undefined,
      supplier: searchParams.supplier || undefined,
      status: searchParams.status || undefined,
      startDate: searchParams.dateRange?.[0] || undefined,
      endDate: searchParams.dateRange?.[1] || undefined,
    };
    const response = await batchManagementApi.getBatchList(params);
    if (response.success) {
      tableData.value = (response.data.list || response.data.records || []).map((item) => ({
        batchNo: item.batchNo || item.batchCode || '',
        batchName: item.batchName || item.name || '',
        supplier: item.supplier || '',
        purchaseDate: item.purchaseDate || item.createTime?.split(' ')[0] || '',
        totalQuantity: item.totalQuantity || item.quantity || 0,
        status: item.status || 'in_stock',
      }));
      pagination.total = response.data.total || 0;
    } else {
      ElMessage.error(response.message || '获取批次列表失败');
    }
  } catch (error) {
    logger.error('获取批次列表失败', error);
    ElMessage.error(error.message || '获取批次列表失败');
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status) => {
  const map = { in_stock: 'success', outbound: 'info', disabled: 'danger' };
  return map[status] || '';
};

const getStatusText = (status) => {
  const map = { in_stock: '在库', outbound: '已出库', disabled: '已停用' };
  return map[status] || status;
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

const handleCreate = () => {
  ElMessage.info('新建批次功能待实现');
};

const handleEdit = (row) => {
  ElMessage.info(`编辑: ${row.batchNo} - 功能待实现`);
};

const handleView = (row) => {
  ElMessage.info(`查看: ${row.batchNo} - 功能待实现`);
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      batchNo: searchParams.batchNo || undefined,
      batchName: searchParams.batchName || undefined,
      supplier: searchParams.supplier || undefined,
      status: searchParams.status || undefined,
      startDate: searchParams.dateRange?.[0] || undefined,
      endDate: searchParams.dateRange?.[1] || undefined,
    };
    await batchManagementApi.getBatchStatistics(params);
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
