<!--
  @file: InventoryRecords.vue
  @description: 库存记录页面 - 统一设计风格
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <PageLayout title="库存记录查询" description="查看所有库存操作记录">
    <template #headerActions>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading">导出数据</el-button>
    </template>

    <!-- 功能说明 -->
    <el-alert title="功能说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
      <template #default>
        <div>
          库存记录是系统自动生成的操作日志，记录所有入库、出库、调拨等库存变动操作。用于审计追溯、统计分析和合规要求。
        </div>
      </template>
    </el-alert>

    <!-- 统计信息卡片 -->
    <el-card class="stats-card" shadow="never">
      <div class="device-stats">
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.totalCount }}</span>
            <span class="stat-label">记录总数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.inboundCount }}</span>
            <span class="stat-label">入库记录</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon :size="24"><Remove /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.outboundCount }}</span>
            <span class="stat-label">出库记录</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon info">
            <el-icon :size="24"><Switch /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.transferCount }}</span>
            <span class="stat-label">调拨记录</span>
          </div>
        </div>
      </div>
    </el-card>

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
      :data="recordList"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      height="500px"
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="recordNo" label="记录编号" width="150" />
      <el-table-column prop="deviceCode" label="设备编号" width="150" />
      <el-table-column prop="deviceName" label="设备名称" min-width="180" />
      <el-table-column prop="operation" label="操作类型" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getOperationType(row.operation)">{{ row.operationText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="100" align="center" />
      <el-table-column prop="warehouseName" label="仓库" min-width="120" />
      <el-table-column prop="operator" label="操作人" width="120" />
      <el-table-column prop="createTime" label="操作时间" min-width="180" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
    </DataTable>
  </PageLayout>
</template>

<script setup>
import { CircleCheck, Document, Download, Remove, Switch } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getAllInventoryRecords, getInventoryRecordsStatistics } from '@/api/inventory/records';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { extractListData } from '@/utils/dataNormalizer';
import { createLogger } from '@/utils/logger';

const logger = createLogger('InventoryRecords');

const searchForm = reactive({
  recordNo: '',
  deviceCode: '',
  deviceName: '',
  operation: '',
  warehouseId: '',
  dateRange: [],
});

const searchFields = computed(() => [
  { prop: 'recordNo', label: '记录编号', type: 'input', placeholder: '请输入记录编号', md: 8, lg: 6, clearable: true },
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
    prop: 'operation',
    label: '操作类型',
    type: 'select',
    placeholder: '请选择操作类型',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '入库', value: 'inbound' },
      { label: '出库', value: 'outbound' },
      { label: '调拨', value: 'transfer' },
    ],
  },
  {
    prop: 'warehouseId',
    label: '仓库',
    type: 'select',
    placeholder: '请选择仓库',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '主仓库', value: 'main' },
      { label: '分仓库A', value: 'branch_a' },
    ],
  },
  {
    prop: 'dateRange',
    label: '操作时间',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

// 筛选配置
const filterConfig = computed(() => filterTemplates.records(searchFields.value));

const loading = ref(false);
const exportLoading = ref(false);
const recordList = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

// 统计数据
const statistics = reactive({
  totalCount: 0,
  inboundCount: 0,
  outboundCount: 0,
  transferCount: 0,
});

const getOperationType = (operation) =>
  ({ inbound: 'success', outbound: 'danger', transfer: 'warning', adjustment: 'info', stock_count: 'primary' })[
    operation
  ] || 'info';

const getOperationText = (operationType) => {
  const operationMap = {
    0: '入库',
    1: '出库',
    2: '调拨',
    3: '调整',
    4: '盘点',
    inbound: '入库',
    outbound: '出库',
    transfer: '调拨',
    adjustment: '调整',
    stock_count: '盘点',
  };
  return operationMap[operationType] || '未知';
};

const loadStatistics = async () => {
  try {
    const params = {};
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }

    const response = await getInventoryRecordsStatistics(params);
    if (response.success && response.data) {
      statistics.totalCount = response.data.totalCount || 0;
      statistics.inboundCount = response.data.inboundCount || 0;
      statistics.outboundCount = response.data.outboundCount || 0;
      statistics.transferCount = response.data.transferCount || 0;
    }
  } catch (error) {
    logger.warn('获取统计数据失败', error);
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      recordNo: searchForm.recordNo || undefined,
      deviceCode: searchForm.deviceCode || undefined,
      deviceName: searchForm.deviceName || undefined,
      operation: searchForm.operation || 'all',
      warehouseId: searchForm.warehouseId || undefined,
    };

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0];
      params.endDate = searchForm.dateRange[1];
    }

    const response = await getAllInventoryRecords(params);

    if (response.success) {
      const { list, total } = extractListData(response, {
        listFields: ['records', 'list', 'items', 'data'],
        totalField: 'total',
      });
      recordList.value = list.map((item) => ({
        ...item,
        recordNo: item.orderNo || item.recordNo || '-',
        deviceCode: item.deviceCode || item.device?.deviceCode || '-',
        deviceName: item.deviceName || item.device?.deviceName || '-',
        operationText: getOperationText(item.operationType || item.operation),
        operation: item.operationType || item.operation,
        quantity: item.quantity || item.totalQuantity || 0,
        warehouseName: item.warehouseName || item.warehouse?.name || '-',
        operator: item.operator || item.operatorName || '-',
        createTime: item.createTime || item.orderTime || '-',
      }));
      pagination.total = total;

      await loadStatistics();
    } else {
      ElMessage.error(response.message || '获取库存记录失败');
      recordList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    logger.error('获取库存记录失败', error);
    ElMessage.error(error.message || '获取库存记录失败');
    recordList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = Array.isArray(searchForm[key]) ? [] : '';
  });
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};

const handleView = (row) => {
  ElMessage.info(`查看: ${row.recordNo}`);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 统计卡片样式 */
.stats-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: none;
}

.stats-card :deep(.el-card__body) {
  padding: 16px;
}

.device-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background-color: var(--primary-100);
  color: var(--primary-600);
}

.stat-icon.success {
  background-color: var(--success-100);
  color: var(--success-600);
}

.stat-icon.warning {
  background-color: var(--warning-100);
  color: var(--warning-600);
}

.stat-icon.info {
  background-color: var(--info-100);
  color: var(--info-600);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--gray-500);
  margin-top: 4px;
}
</style>
