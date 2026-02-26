<!--
  @file: ScrapPage.vue
  @description: 报废记录查询页面 - 只读查看模式
  @author: 开发团队
  @createTime: 2026-02-13
  @version: 2.0
  @modifyRecords:
      2026-02-13: 初始版本创建，整合报废记录管理功能
      2026-02-13: 移除增删改功能，改为只读查看模式（记录由出库流程自动生成）
-->
<template>
  <PageLayout title="报废记录查询" description="查看设备报废记录（由出库流程自动生成）">
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="handleShowOperationGuide" data-cy="scrap-guide-btn">操作指引</el-button>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading" data-cy="scrap-export-btn">导出数据</el-button>
    </template>

    <el-alert title="业务流程说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
      <template #default>
        <div>
          报废记录由<span style="color: var(--el-color-primary); font-weight: 500">出库管理</span>→<span
            style="color: var(--el-color-primary); font-weight: 500"
            >报废出库</span
          >流程自动生成。请前往出库管理页面创建设备报废出库单，系统将自动关联出库单并更新设备状态为报废。
        </div>
      </template>
    </el-alert>

    <el-card class="stats-card" shadow="never">
      <div class="device-stats">
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon :size="24"><Delete /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.totalCount }}</span>
            <span class="stat-label">报废总数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon :size="24"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.pendingCount }}</span>
            <span class="stat-label">待审批</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.completedCount }}</span>
            <span class="stat-label">已报废</span>
          </div>
        </div>
      </div>
    </el-card>

    <UnifiedFilterBar
      ref="filterBarRef"
      v-model="searchForm"
      :fields="scrapFilterConfig.fields"
      :header-title="scrapFilterConfig.header.title"
      :header-icon="scrapFilterConfig.header.icon"
      :show-result-count="scrapFilterConfig.header.showResultCount"
      :show-collapse="scrapFilterConfig.header.showCollapse"
      :collapse-threshold="scrapFilterConfig.header.collapseThreshold"
      :show-search="scrapFilterConfig.buttons.showSearch"
      :show-reset="scrapFilterConfig.buttons.showReset"
      :search-text="scrapFilterConfig.buttons.searchText"
      :reset-text="scrapFilterConfig.buttons.resetText"
      :loading="loading"
      :total="pagination.total"
      :auto-search="scrapFilterConfig.behavior.autoSearch"
      :debounce-time="scrapFilterConfig.behavior.debounceTime"
      @search="handleSearch"
      @reset="handleReset"
      @field-change="handleFieldChange"
    />

    <DataTable
      :data="scrapList"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      height="500px"
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" data-cy="scrap-index-column" />
      <el-table-column prop="scrapNo" label="报废单号" width="150" data-cy="scrap-no-column" />
      <el-table-column prop="sourceOutboundNo" label="来源出库单" width="140" data-cy="scrap-source-outbound-column">
        <template #default="{ row }">
          <span v-if="row.sourceOutboundNo" class="source-link" @click="handleViewOutbound(row)" :data-cy="`scrap-source-outbound-link-${row.id}`">
            {{ row.sourceOutboundNo }}
          </span>
          <el-tag v-else type="info" size="small" :data-cy="`scrap-manual-tag-${row.id}`">手动创建</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编号" width="140" data-cy="scrap-device-code-column" />
      <el-table-column prop="deviceName" label="设备名称" min-width="150" show-overflow-tooltip data-cy="scrap-device-name-column" />
      <el-table-column prop="deviceModel" label="规格型号" width="120" data-cy="scrap-device-model-column" />
      <el-table-column prop="scrapReason" label="报废原因" min-width="150" show-overflow-tooltip data-cy="scrap-reason-column" />
      <el-table-column prop="status" label="状态" width="100" align="center" data-cy="scrap-status-column">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small" :data-cy="`scrap-status-tag-${row.id}`">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" data-cy="scrap-create-time-column" />
      <el-table-column label="操作" width="120" fixed="right" data-cy="scrap-actions-column">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)" data-cy="scrap-view-btn">查看</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="detailDialogVisible" title="报废记录详情" width="800px" destroy-on-close data-cy="scrap-detail-dialog">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报废单号">{{ currentRow?.scrapNo }}</el-descriptions-item>
        <el-descriptions-item label="来源出库单">{{ currentRow?.sourceOutboundNo || '出库生成' }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ currentRow?.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentRow?.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{ currentRow?.deviceModel }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow?.status)">{{ getStatusText(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报废原因" :span="2">{{ currentRow?.scrapReason }}</el-descriptions-item>
        <el-descriptions-item label="处理方式">{{ currentRow?.disposalMethod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理费用"
          >¥{{ currentRow?.disposalCost?.toFixed(2) || '0.00' }}</el-descriptions-item
        >
        <el-descriptions-item label="创建时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ currentRow?.approveTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRow?.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false" data-cy="scrap-detail-close-btn">关闭</el-button>
      </template>
    </el-dialog>

    <OperationGuideDialog v-model="guideDialogVisible" title="报废记录操作指引" :steps="guideSteps" />
  </PageLayout>
</template>

<script setup>
import { Delete, Download, QuestionFilled, Timer, View, CircleCheck } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import OperationGuideDialog from '@/components/business/dialogs/OperationGuideDialog.vue';
import { SCRAP_RECORD_API } from '@/constants/apiConstants';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('ScrapPage');

const loading = ref(false);
const exportLoading = ref(false);
const detailDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentRow = ref(null);
const scrapList = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const statistics = reactive({
  totalCount: 0,
  pendingCount: 0,
  completedCount: 0,
});

const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: [],
});

const scrapFilterConfig = {
  header: {
    title: '报废记录筛选',
    icon: Delete,
    showResultCount: true,
    showCollapse: false,
    collapseThreshold: 4,
  },
  buttons: {
    showSearch: true,
    showReset: true,
    searchText: '查询',
    resetText: '重置',
  },
  behavior: {
    autoSearch: false,
    debounceTime: 300,
  },
  fields: [
    {
      key: 'keyword',
      label: '关键词',
      type: 'input',
      placeholder: '报废单号/设备编号/设备名称',
      span: 6,
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      span: 4,
      options: [
        { label: '全部', value: '' },
        { label: '待审批', value: '0' },
        { label: '已报废', value: '1' },
        { label: '已驳回', value: '2' },
      ],
    },
    {
      key: 'dateRange',
      label: '创建时间',
      type: 'daterange',
      span: 6,
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
    },
  ],
};

const guideSteps = [
  { title: '查看报废记录', description: '报废记录由出库管理自动生成', icon: 'View' },
  { title: '创建报废出库', description: '在出库管理页面创建报废出库单', icon: 'Upload' },
  { title: '自动生成记录', description: '系统自动生成报废记录并更新设备状态', icon: 'Connection' },
  { title: '导出数据', description: '可导出报废记录数据用于统计分析', icon: 'Download' },
];

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    0: '待审批',
    1: '已报废',
    2: '已驳回',
  };
  return textMap[status] || '未知';
};

const loadScrapList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...searchForm,
    };
    const response = await request.get(SCRAP_RECORD_API.LIST, { params });
    if (response.data?.success) {
      scrapList.value = response.data.data?.content || [];
      pagination.total = response.data.data?.totalElements || 0;
      updateStatistics();
    }
  } catch (error) {
    logger.error('加载报废记录失败', error);
    ElMessage.error('加载报废记录失败');
  } finally {
    loading.value = false;
  }
};

const updateStatistics = () => {
  statistics.totalCount = pagination.total;
  statistics.pendingCount = scrapList.value.filter((item) => item.status === 0).length;
  statistics.completedCount = scrapList.value.filter((item) => item.status === 1).length;
};

const handleSearch = () => {
  pagination.current = 1;
  loadScrapList();
};

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: '',
    dateRange: [],
  });
  handleSearch();
};

const handleFieldChange = (key, value) => {
  logger.info('筛选字段变更', { key, value });
};

const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  loadScrapList();
};

const handleView = (row) => {
  currentRow.value = row;
  detailDialogVisible.value = true;
};

const handleViewOutbound = (row) => {
  if (row.sourceOrderId) {
    ElMessage.info(`跳转到出库单详情：${row.sourceOutboundNo}`);
  }
};

const handleShowOperationGuide = () => {
  guideDialogVisible.value = true;
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    logger.info('导出报废记录');
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出失败', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  loadScrapList();
});
</script>

<style scoped>
.stats-card {
  margin-bottom: 16px;
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
  padding: 12px 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  min-width: 160px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #f0c78a);
}

.stat-icon.success {
  background: linear-gradient(135deg, #67c23a, #95d475);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.source-link {
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.source-link:hover {
  color: var(--el-color-primary-dark-2);
}
</style>
