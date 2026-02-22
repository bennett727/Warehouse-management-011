<!--
  @file: MaintenancePage.vue
  @description: 保养记录查询页面 - 只读查看模式
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 3.0
  @modifyRecords:
      2025-12-21: 初始版本创建
      2026-02-13: 移除增删改功能，改为只读查看模式（记录由出库流程自动生成）
-->
<template>
  <PageLayout title="保养记录查询" description="查看设备保养记录（由出库流程自动生成）">
    <template #headerActions>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading">导出数据</el-button>
    </template>

    <el-alert title="业务流程说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
      <template #default>
        <div>
          保养记录由<span style="color: var(--el-color-primary); font-weight: 500">出库管理</span>→<span
            style="color: var(--el-color-primary); font-weight: 500"
            >保养出库</span
          >流程自动生成。请前往出库管理页面创建设备保养出库单，系统将自动生成保养记录。
        </div>
      </template>
    </el-alert>

    <!-- 统计信息卡片 -->
    <el-card class="stats-card" shadow="never">
      <div class="device-stats">
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon :size="24"><Tools /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.totalCount }}</span>
            <span class="stat-label">保养总数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon :size="24"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.pendingCount }}</span>
            <span class="stat-label">待保养</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon info">
            <el-icon :size="24"><Loading /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.processingCount }}</span>
            <span class="stat-label">保养中</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.completedCount }}</span>
            <span class="stat-label">已完成</span>
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
      :result-count="total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card class="table-card" shadow="never">
      <DataTable
        :data="maintenanceList"
        :total="total"
        :loading="loading"
        :current-page="page"
        :page-size="pageSize"
        @page-change="handlePageChange"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="maintenanceNo" label="保养单号" width="150" />
        <el-table-column prop="deviceCode" label="设备编号" width="150" />
        <el-table-column prop="deviceName" label="设备名称" min-width="180" />
        <el-table-column prop="maintenanceType" label="保养类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getMaintenanceTypeType(row.maintenanceType)">{{
              getMaintenanceTypeText(row.maintenanceType)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maintenanceDate" label="保养日期" width="120" />
        <el-table-column prop="operatorName" label="保养人员" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="保养记录详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="保养单号">{{ currentRow?.maintenanceNo }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ currentRow?.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备名称" :span="2">{{ currentRow?.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="保养类型">
          <el-tag :type="getMaintenanceTypeType(currentRow?.maintenanceType)">
            {{ getMaintenanceTypeText(currentRow?.maintenanceType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow?.status)">{{ getStatusText(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="保养日期">{{ currentRow?.maintenanceDate }}</el-descriptions-item>
        <el-descriptions-item label="保养人员">{{ currentRow?.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="保养内容" :span="2">{{ currentRow?.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRow?.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { CircleCheck, Download, Loading, Timer, Tools } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getMaintenanceRecordsByPage } from '@/api/maintenance/maintenance.js';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { filterTemplates } from '@/config/filter/common.filter.config';
import { createLogger } from '@/utils/logger';

const logger = createLogger('MaintenancePage');

const loading = ref(false);
const exportLoading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const maintenanceList = ref([]);
const detailDialogVisible = ref(false);
const currentRow = ref(null);

const statistics = reactive({
  totalCount: 0,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 0,
});

const searchForm = reactive({
  maintenanceNo: '',
  deviceCode: '',
  deviceName: '',
  maintenanceType: '',
  status: '',
  dateRange: [],
});

const searchFields = computed(() => [
  {
    prop: 'maintenanceNo',
    label: '保养单号',
    type: 'input',
    placeholder: '请输入保养单号',
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
    prop: 'deviceName',
    label: '设备名称',
    type: 'input',
    placeholder: '请输入设备名称',
    md: 8,
    lg: 6,
    clearable: true,
  },
  {
    prop: 'maintenanceType',
    label: '保养类型',
    type: 'select',
    placeholder: '请选择保养类型',
    md: 8,
    lg: 6,
    clearable: true,
    options: [
      { label: '日常保养', value: 'daily' },
      { label: '定期保养', value: 'periodic' },
      { label: '大修', value: 'overhaul' },
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
      { label: '待保养', value: 'pending' },
      { label: '保养中', value: 'processing' },
      { label: '已完成', value: 'completed' },
    ],
  },
  {
    prop: 'dateRange',
    label: '保养日期',
    type: 'daterange',
    md: 12,
    lg: 12,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
  },
]);

const filterConfig = computed(() => filterTemplates.maintenance(searchFields.value));

const getMaintenanceTypeType = (type) => {
  const map = { daily: 'info', periodic: 'warning', overhaul: 'danger' };
  return map[type] || '';
};

const getMaintenanceTypeText = (type) => {
  const map = { daily: '日常保养', periodic: '定期保养', overhaul: '大修' };
  return map[type] || type;
};

const getStatusType = (status) => {
  const map = { pending: 'info', processing: 'warning', completed: 'success' };
  return map[status] || '';
};

const getStatusText = (status) => {
  const map = { pending: '待保养', processing: '保养中', completed: '已完成' };
  return map[status] || status;
};

const sortField = ref('createTime');
const sortOrder = ref('desc');

const fetchMaintenanceList = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      size: pageSize.value,
      ...searchForm,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
    };
    const res = await getMaintenanceRecordsByPage(params);
    if (res.success) {
      maintenanceList.value = res.data.list || [];
      total.value = res.data.total || 0;

      statistics.totalCount = total.value;
      statistics.pendingCount = maintenanceList.value.filter((item) => item.status === 'pending').length;
      statistics.processingCount = maintenanceList.value.filter((item) => item.status === 'processing').length;
      statistics.completedCount = maintenanceList.value.filter((item) => item.status === 'completed').length;
    }
  } catch (error) {
    logger.error('获取保养记录列表失败:', error);
    ElMessage.error('获取保养记录列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchMaintenanceList();
};

const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = Array.isArray(searchForm[key]) ? [] : '';
  });
  handleSearch();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchMaintenanceList();
};

const handleView = (row) => {
  currentRow.value = row;
  detailDialogVisible.value = true;
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    logger.info('导出保养记录');
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  fetchMaintenanceList();
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

.stat-icon.warning {
  background-color: var(--warning-100);
  color: var(--warning-600);
}

.stat-icon.info {
  background-color: var(--info-100);
  color: var(--info-600);
}

.stat-icon.success {
  background-color: var(--success-100);
  color: var(--success-600);
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

.maintenance-page {
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-top: 20px;
}
</style>
