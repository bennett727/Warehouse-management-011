<template>
  <PageLayout title="操作日志查询" description="查看系统操作日志记录" data-cy="operation-logs-page">
    <template #headerActions>
      <el-button data-cy="operation-logs-guide-btn" type="info" :icon="QuestionFilled" @click="handleShowOperationGuide"
        >操作指引</el-button
      >
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="日志筛选"
      :header-icon="Document"
      :result-count="pagination.total"
      @search="handleFilterSearch"
      @reset="handleFilterReset"
    />

    <el-card data-cy="operation-logs-stats-card" class="statistics-card">
      <div class="statistics-grid">
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon data-cy="operation-logs-total-icon" :size="24"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics?.total || 0 }}</div>
            <div class="stat-label">总日志数</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon data-cy="operation-logs-success-icon" :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics?.success || 0 }}</div>
            <div class="stat-label">成功操作</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon error">
            <el-icon data-cy="operation-logs-failed-icon" :size="24"><CircleClose /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics?.failed || 0 }}</div>
            <div class="stat-label">失败操作</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon today">
            <el-icon data-cy="operation-logs-today-icon" :size="24"><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics?.today || 0 }}</div>
            <div class="stat-label">今日操作</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card data-cy="operation-logs-table-card" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">操作日志列表</span>
          <div class="card-actions">
            <el-button
              data-cy="operation-logs-export-btn"
              type="primary"
              :icon="Download"
              :loading="loading.export"
              @click="handleExport"
            >
              导出日志
            </el-button>
            <el-button
              data-cy="operation-logs-cleanup-btn"
              type="danger"
              :icon="Delete"
              :loading="loading.cleanup"
              @click="handleCleanup"
            >
              清理日志
            </el-button>
          </div>
        </div>
      </template>

      <DataTable
        :data="logList"
        :total="pagination.total"
        :loading="loading.list"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :show-pagination="true"
        :show-selection="false"
        :show-actions="true"
        :stripe="true"
        :border="true"
        height="600px"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @row-dblclick="handleViewDetail"
      >
        <el-table-column data-cy="operation-logs-table-column-id" prop="id" label="日志ID" width="120" sortable />
        <el-table-column
          data-cy="operation-logs-table-column-operator"
          prop="operator"
          label="操作者"
          width="120"
          sortable
        />
        <el-table-column
          data-cy="operation-logs-table-column-module"
          prop="module"
          label="操作模块"
          width="120"
          sortable
        />
        <el-table-column data-cy="operation-logs-table-column-type" prop="type" label="操作类型" width="100" sortable />
        <el-table-column
          data-cy="operation-logs-table-column-content"
          prop="content"
          label="操作内容"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          data-cy="operation-logs-table-column-ip"
          prop="ipAddress"
          label="IP地址"
          width="140"
          sortable
        />
        <el-table-column data-cy="operation-logs-table-column-status" prop="isSuccess" label="操作状态" width="100">
          <template #default="{ row }">
            <el-tag data-cy="operation-logs-status-tag" :type="getStatusTagType(row.isSuccess)">
              {{ getStatusLabel(row.isSuccess) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          data-cy="operation-logs-table-column-time"
          prop="createTime"
          label="操作时间"
          width="180"
          sortable
        />
        <el-table-column data-cy="operation-logs-table-column-actions" label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              data-cy="operation-logs-view-btn"
              type="primary"
              link
              :icon="View"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>

    <el-dialog
      data-cy="operation-logs-detail-dialog"
      v-model="detailDialogVisible"
      title="操作日志详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="loading.detail" class="log-detail">
        <el-descriptions data-cy="operation-logs-detail-descriptions" :column="2" border>
          <el-descriptions-item data-cy="operation-logs-detail-id" label="日志ID">
            {{ logDetail?.id }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-operator" label="操作者">
            {{ logDetail?.operator }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-module" label="操作模块">
            {{ getModuleLabel(logDetail?.module) }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-type" label="操作类型">
            {{ getTypeLabel(logDetail?.type) }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-content" label="操作内容" :span="2">
            {{ logDetail?.content }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-ip" label="IP地址">
            {{ logDetail?.ipAddress }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-status" label="操作状态">
            <el-tag data-cy="operation-logs-detail-status-tag" :type="getStatusTagType(logDetail?.isSuccess)">
              {{ getStatusLabel(logDetail?.isSuccess) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-time" label="操作时间" :span="2">
            {{ formatDate(logDetail?.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-params" label="请求参数" :span="2">
            <pre class="json-display">{{ formatJson(logDetail?.requestParams) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item data-cy="operation-logs-detail-result" label="响应结果" :span="2">
            <pre class="json-display">{{ formatJson(logDetail?.responseResult) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item
            data-cy="operation-logs-detail-error"
            label="错误信息"
            :span="2"
            v-if="logDetail?.errorMessage"
          >
            <pre class="error-display">{{ logDetail?.errorMessage }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog
      data-cy="operation-logs-guide-dialog"
      v-model="guideDialogVisible"
      title="操作指引"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="operation-guide">
        <el-steps data-cy="operation-logs-guide-steps" :active="currentStep" finish-status="success" align-center>
          <el-step data-cy="operation-logs-guide-step-filter" title="筛选查询" />
          <el-step data-cy="operation-logs-guide-step-stats" title="查看统计" />
          <el-step data-cy="operation-logs-guide-step-browse" title="浏览日志" />
          <el-step data-cy="operation-logs-guide-step-export" title="导出清理" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 筛选查询</h3>
            <p>使用筛选条件快速查找操作日志：</p>
            <ul>
              <li><strong>关键词</strong>：输入操作者姓名或操作内容进行模糊查询</li>
              <li><strong>操作模块</strong>：选择具体的操作模块（如设备管理、库存管理等）</li>
              <li><strong>操作类型</strong>：选择操作类型（如新增、修改、删除等）</li>
              <li><strong>操作状态</strong>：选择成功或失败状态进行筛选</li>
              <li><strong>操作时间</strong>：选择日期范围，查找指定时间段内的日志</li>
              <li><strong>组合查询</strong>：多个筛选条件可以组合使用，系统会同时满足所有条件的记录</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="operation-logs-guide-tip-icon"><WarningFilled /></el-icon>
              <span>提示：点击"查询"按钮应用筛选条件，点击"重置"按钮清空所有条件</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 查看统计</h3>
            <p>页面顶部显示四个统计卡片，快速了解日志概况：</p>
            <ul>
              <li><strong>总日志数</strong>：显示系统中所有操作日志的总数</li>
              <li><strong>成功操作</strong>：显示执行成功的操作数量</li>
              <li><strong>失败操作</strong>：显示执行失败的操作数量</li>
              <li><strong>今日操作</strong>：显示今日的操作数量</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="operation-logs-guide-tip-icon-2"><WarningFilled /></el-icon>
              <span>提示：统计数据实时更新，帮助您快速了解系统运行状况</span>
            </div>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 浏览日志</h3>
            <p>日志列表显示所有符合条件的操作记录：</p>
            <ul>
              <li><strong>虚拟滚动</strong>：支持大数据量的高效浏览，滚动加载更多数据</li>
              <li><strong>双击查看</strong>：双击任意行或点击"详情"按钮查看完整日志信息</li>
              <li><strong>排序功能</strong>：点击表头可按该列排序</li>
              <li><strong>分页浏览</strong>：使用底部分页器切换页面</li>
              <li><strong>详情查看</strong>：详情中包含请求参数、响应结果、错误信息等完整数据</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="operation-logs-guide-tip-icon-3"><WarningFilled /></el-icon>
              <span>提示：失败操作的详情中会显示具体的错误信息，便于问题排查</span>
            </div>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 导出清理</h3>
            <p>提供日志导出和清理功能：</p>
            <ul>
              <li><strong>导出日志</strong>：点击"导出日志"按钮，将当前筛选结果导出为Excel文件</li>
              <li><strong>清理日志</strong>：点击"清理日志"按钮，删除指定时间之前的日志记录</li>
              <li><strong>导出格式</strong>：导出文件包含日志的关键信息，便于离线分析</li>
              <li><strong>清理确认</strong>：清理操作需要二次确认，避免误删重要数据</li>
            </ul>
            <div class="guide-warning">
              <el-icon data-cy="operation-logs-guide-warning-icon"><Warning /></el-icon>
              <span>警告：清理操作不可恢复，请谨慎操作！建议定期备份重要日志。</span>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <el-button v-if="currentStep > 0" @click="currentStep--" data-cy="operation-logs-guide-prev-btn">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="currentStep++" data-cy="operation-logs-guide-next-btn">下一步</el-button>
          <el-button v-else type="primary" @click="handleGuideFinish" data-cy="operation-logs-guide-finish-btn">完成</el-button>
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import {
  Calendar,
  CircleCheck,
  CircleClose,
  Delete,
  Document,
  Download,
  QuestionFilled,
  View,
  Warning,
  WarningFilled,
} from '@element-plus/icons-vue';
import { computed, onMounted, reactive, ref } from 'vue';

import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { useOperationLogs } from '@/composables/useOperationLogs';
import { createLogger } from '@/utils/logger';

const logger = createLogger('OperationLogsPage');

const {
  loading,
  queryParams,
  pagination,
  logList,
  logDetail,
  statistics,
  operationModules,
  operationTypes,
  statusOptions,
  fetchLogList,
  fetchLogDetail,
  fetchStatistics,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleExport,
  handleCleanup,
  getModuleLabel,
  getTypeLabel,
  getStatusLabel,
  getStatusTagType,
  formatDate,
} = useOperationLogs();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  module: '',
  type: '',
  isSuccess: '',
  dateRange: [],
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '请输入操作者、操作内容',
    clearable: true,
    md: 8,
    lg: 6,
  },
  {
    prop: 'module',
    label: '操作模块',
    type: 'select',
    placeholder: '请选择操作模块',
    clearable: true,
    md: 6,
    lg: 4,
    options: operationModules.value || [],
  },
  {
    prop: 'type',
    label: '操作类型',
    type: 'select',
    placeholder: '请选择操作类型',
    clearable: true,
    md: 6,
    lg: 4,
    options: operationTypes.value || [],
  },
  {
    prop: 'isSuccess',
    label: '操作状态',
    type: 'select',
    placeholder: '请选择操作状态',
    clearable: true,
    md: 6,
    lg: 4,
    options: statusOptions.value || [],
  },
  {
    prop: 'dateRange',
    label: '操作时间',
    type: 'dateRange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    md: 12,
    lg: 8,
  },
]);

const detailDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentStep = ref(0);

// 筛选栏搜索处理
const handleFilterSearch = () => {
  queryParams.keyword = searchForm.keyword;
  queryParams.module = searchForm.module;
  queryParams.type = searchForm.type;
  queryParams.isSuccess = searchForm.isSuccess;
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    queryParams.startTime = searchForm.dateRange[0];
    queryParams.endTime = searchForm.dateRange[1];
  } else {
    queryParams.startTime = '';
    queryParams.endTime = '';
  }
  handleSearch();
};

// 筛选栏重置处理
const handleFilterReset = () => {
  searchForm.keyword = '';
  searchForm.module = '';
  searchForm.type = '';
  searchForm.isSuccess = '';
  searchForm.dateRange = [];
  handleReset();
};

const handleShowOperationGuide = () => {
  guideDialogVisible.value = true;
  currentStep.value = 0;
};

const handleGuideFinish = () => {
  guideDialogVisible.value = false;
  currentStep.value = 0;
};

const handleViewDetail = async (row) => {
  detailDialogVisible.value = true;
  await fetchLogDetail(row.id);
};

const formatJson = (json) => {
  if (!json) {
    return '';
  }
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch (error) {
    logger.warn('JSON格式化失败:', error);
    return json;
  }
};

onMounted(() => {
  fetchLogList();
  fetchStatistics();
});
</script>

<style scoped>
.operation-logs-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.statistics-card {
  margin-bottom: 20px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  color: var(--text-primary);
  transition: var(--transition-base);
}

.stat-item:hover {
  border-color: var(--primary-300);
  box-shadow: var(--box-shadow-sm);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon.total {
  background: rgba(64, 158, 255, 0.3);
}

.stat-icon.success {
  background: rgba(103, 194, 58, 0.3);
}

.stat-icon.error {
  background: rgba(245, 108, 108, 0.3);
}

.stat-icon.today {
  background: rgba(230, 162, 60, 0.3);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 300px;
}

.guide-item h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #303133;
}

.guide-item p {
  margin: 0 0 15px;
  color: #606266;
  line-height: 1.6;
}

.guide-item ul {
  margin: 0 0 20px;
  padding-left: 20px;
}

.guide-item li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.guide-item li strong {
  color: #303133;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ecf5ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  color: #606266;
}

.guide-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef0f0;
  border-left: 4px solid #f56c6c;
  border-radius: 4px;
  color: #606266;
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.log-detail {
  padding: 10px 0;
}

.json-display {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.error-display {
  background: #fef0f0;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #f56c6c;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

@media screen and (max-width: 1200px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .filter-card :deep(.el-form-item) {
    width: 100%;
  }
}
</style>
