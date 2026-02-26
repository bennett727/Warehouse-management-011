<!--
  @file: RepairPage.vue
  @description: 维修记录查询页面 - 只读查看模式
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 4.0
  @modifyRecords:
      2025-12-21: 初始版本创建
      2026-02-13: 整合RepairDetailDialog组件，增强维修记录管理功能
      2026-02-13: 移除增删改功能，改为只读查看模式（记录由出库流程自动生成）
-->
<template>
  <PageLayout title="维修记录查询" description="查看设备维修记录（由出库流程自动生成）">
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="handleShowOperationGuide" data-cy="repair-guide-btn">操作指引</el-button>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading" data-cy="repair-export-btn">导出数据</el-button>
    </template>

    <el-alert title="业务流程说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
      <template #default>
        <div>
          维修记录由<span style="color: var(--el-color-primary); font-weight: 500">出库管理</span>→<span
            style="color: var(--el-color-primary); font-weight: 500"
            >维修出库</span
          >流程自动生成。请前往出库管理页面创建设备维修出库单，系统将自动生成维修记录。
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
            <span class="stat-label">维修总数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon :size="24"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.pendingCount }}</span>
            <span class="stat-label">待维修</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon info">
            <el-icon :size="24"><Loading /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.repairingCount }}</span>
            <span class="stat-label">维修中</span>
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
      ref="filterBarRef"
      v-model="searchForm"
      :fields="repairFilterConfig.fields"
      :header-title="repairFilterConfig.header.title"
      :header-icon="repairFilterConfig.header.icon"
      :show-result-count="repairFilterConfig.header.showResultCount"
      :show-collapse="repairFilterConfig.header.showCollapse"
      :collapse-threshold="repairFilterConfig.header.collapseThreshold"
      :show-search="repairFilterConfig.buttons.showSearch"
      :show-reset="repairFilterConfig.buttons.showReset"
      :search-text="repairFilterConfig.buttons.searchText"
      :reset-text="repairFilterConfig.buttons.resetText"
      :loading="loading"
      :total="pagination.total"
      :auto-search="repairFilterConfig.behavior.autoSearch"
      :debounce-time="repairFilterConfig.behavior.debounceTime"
      @search="handleSearch"
      @reset="handleReset"
      @field-change="handleFieldChange"
    />

    <DataTable
      :data="repairList"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      height="500px"
      @page-change="handlePageChange"
    >
      <el-table-column type="index" label="序号" width="60" data-cy="repair-index-column" />
      <el-table-column prop="repairNo" label="维修单号" width="150" data-cy="repair-no-column" />
      <el-table-column prop="sourceOutboundNo" label="来源出库单" width="140" data-cy="repair-source-outbound-column">
        <template #default="{ row }">
          <span v-if="row.sourceOutboundNo" class="source-link" @click="handleViewOutbound(row)" :data-cy="`repair-source-outbound-link-${row.id}`">
            {{ row.sourceOutboundNo }}
          </span>
          <el-tag v-else type="info" size="small" :data-cy="`repair-manual-tag-${row.id}`">手动创建</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编号" width="150" data-cy="repair-device-code-column" />
      <el-table-column prop="deviceName" label="设备名称" min-width="180" data-cy="repair-device-name-column" />
      <el-table-column prop="repairType" label="维修类型" width="120" data-cy="repair-type-column">
        <template #default="{ row }">
          <el-tag :type="getRepairTypeType(row.repairType)" :data-cy="`repair-type-tag-${row.id}`">{{ getRepairTypeText(row.repairType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" data-cy="repair-status-column">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" :data-cy="`repair-status-tag-${row.id}`">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" data-cy="repair-create-time-column" />
      <el-table-column label="操作" width="120" fixed="right" data-cy="repair-actions-column">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)" data-cy="repair-view-btn">查看</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 维修记录详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="维修记录详情" width="900px" destroy-on-close data-cy="repair-detail-dialog">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="维修单号" :span="1">{{ currentRow?.repairNo }}</el-descriptions-item>
        <el-descriptions-item label="来源" :span="1">
          <span v-if="currentRow?.sourceOutboundNo">
            <el-tag type="success" size="small">出库维修</el-tag>
            <span class="source-link ml-2" @click="handleViewOutbound(currentRow)">
              {{ currentRow.sourceOutboundNo }}
            </span>
          </span>
          <el-tag v-else type="info" size="small">手动创建</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getStatusType(currentRow?.status)">{{ getStatusText(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备编号" :span="1">{{ currentRow?.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备名称" :span="2">{{ currentRow?.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="维修类型" :span="1">
          <el-tag :type="getRepairTypeType(currentRow?.repairType)">{{
            getRepairTypeText(currentRow?.repairType)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="维修人员" :span="1">{{ currentRow?.repairer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="3">{{ currentRow?.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="维修结果" :span="3" v-if="currentRow?.result">{{
          currentRow.result
        }}</el-descriptions-item>
        <el-descriptions-item label="维修费用" :span="1" v-if="currentRow?.repairCost"
          >¥{{ currentRow.repairCost.toFixed(2) }}</el-descriptions-item
        >
        <el-descriptions-item label="备注" :span="2">{{ currentRow?.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 维修图片 -->
      <div class="detail-section" v-if="currentRow?.images && currentRow.images.length > 0">
        <div class="section-title">
          <el-icon><Picture /></el-icon>
          <span>维修图片</span>
        </div>
        <div class="image-list">
          <el-image
            v-for="(img, index) in currentRow.images"
            :key="index"
            :src="img"
            :preview-src-list="currentRow.images"
            fit="cover"
            class="repair-image"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false" data-cy="repair-detail-close-btn">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 操作指引对话框 -->
    <el-dialog v-model="guideDialogVisible" title="操作指引" width="900px" :close-on-click-modal="false" data-cy="repair-guide-dialog">
      <div class="operation-guide">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="创建设备出库" />
          <el-step title="生成维修单" />
          <el-step title="执行维修" />
          <el-step title="完成维修" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 创建设备出库</h3>
            <p>在出库管理页面创建设备修复出库单：</p>
            <ul>
              <li><strong>选择出库类型</strong>：选择"修复出库"类型</li>
              <li><strong>选择设备</strong>：选择需要维修的设备</li>
              <li><strong>填写信息</strong>：填写故障描述、维修类型等</li>
              <li><strong>提交出库</strong>：提交出库单并等待审核</li>
            </ul>
            <div class="guide-tip">
              <el-icon><WarningFilled /></el-icon>
              <span>提示：修复出库单审核通过后会自动生成维修单</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 生成维修单</h3>
            <p>系统自动生成维修单：</p>
            <ul>
              <li><strong>自动关联</strong>：维修单自动关联出库单</li>
              <li><strong>状态跟踪</strong>：可在维修记录页面查看状态</li>
            </ul>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 执行维修</h3>
            <p>维修人员执行设备维修：</p>
            <ul>
              <li><strong>查看任务</strong>：在维修记录页面查看待维修任务</li>
              <li><strong>现场维修</strong>：按维修单要求执行设备维修</li>
              <li><strong>记录信息</strong>：记录维修过程、拍照存档</li>
              <li><strong>更新状态</strong>：将状态更新为"维修中"</li>
            </ul>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 完成维修</h3>
            <p>维修完成后进行确认：</p>
            <ul>
              <li><strong>确认完成</strong>：确认维修工作已完成</li>
              <li><strong>填写结果</strong>：填写维修结果和费用</li>
              <li><strong>设备处理</strong>：选择设备返回库存或继续使用</li>
              <li><strong>状态更新</strong>：将状态更新为"已完成"</li>
            </ul>
          </div>
        </div>
        <div class="guide-actions">
          <el-button v-if="currentStep > 0" @click="currentStep--" data-cy="repair-guide-prev-btn">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="currentStep++" data-cy="repair-guide-next-btn">下一步</el-button>
          <el-button v-else type="primary" @click="handleGuideFinish" data-cy="repair-guide-finish-btn">完成</el-button>
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { Download, Loading, Picture, QuestionFilled, Timer, Tools, View, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getRepairList } from '@/api/repair/repair';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import { defaultRepairFilter, repairFilterConfig } from '@/config/filter/repair.config';
import { createLogger } from '@/utils/logger';

const router = useRouter();
const logger = createLogger('RepairPage');

// 状态
const loading = ref(false);
const exportLoading = ref(false);
const filterBarRef = ref(null);

// 统计数据
const statistics = reactive({
  totalCount: 0,
  pendingCount: 0,
  repairingCount: 0,
  completedCount: 0,
});

// 搜索参数 - 使用配置的默认值
const searchForm = reactive({ ...defaultRepairFilter });

// 表格数据
const repairList = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

// 对话框状态
const detailDialogVisible = ref(false);
const guideDialogVisible = ref(false);
const currentStep = ref(0);
const currentRow = ref(null);

// 状态映射
const getRepairTypeType = (type) => ({ hardware: 'danger', software: 'warning', maintenance: 'info' })[type] || 'info';
const getRepairTypeText = (type) =>
  ({ hardware: '硬件故障', software: '软件故障', maintenance: '日常维护' })[type] || type;
const getStatusType = (status) => {
  const statusMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    pending: 'info',
    repairing: 'warning',
    completed: 'success',
  };
  return statusMap[status] || 'info';
};
const getStatusText = (status) => {
  const statusMap = {
    0: '待维修',
    1: '维修中',
    2: '已完成',
    pending: '待维修',
    repairing: '维修中',
    completed: '已完成',
  };
  return statusMap[status] || status;
};

const updateStatistics = () => {
  const list = repairList.value;
  statistics.totalCount = list.length;
  statistics.pendingCount = list.filter((item) => item.status === 0 || item.status === 'pending').length;
  statistics.repairingCount = list.filter((item) => item.status === 1 || item.status === 'repairing').length;
  statistics.completedCount = list.filter((item) => item.status === 2 || item.status === 'completed').length;
};

// 加载维修记录列表
const loadRepairList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      repairNo: searchForm.repairNo || undefined,
      deviceCode: searchForm.deviceCode || undefined,
      deviceName: searchForm.deviceName || undefined,
      repairType: searchForm.repairType || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
    };

    const response = await getRepairList(params);

    if (response.code === 200 && response.data) {
      repairList.value = response.data.records || response.data.list || [];
      pagination.total = response.data.total || 0;
      updateStatistics();
    } else {
      ElMessage.error(response.message || '加载维修记录列表失败');
      repairList.value = [];
      pagination.total = 0;
      updateStatistics();
    }
  } catch (error) {
    logger.error('加载维修记录列表失败', error);
    ElMessage.error('加载维修记录列表失败，请检查网络连接');
    repairList.value = [];
    pagination.total = 0;
    updateStatistics();
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadRepairList();
};

// 重置
const handleReset = () => {
  pagination.current = 1;
  loadRepairList();
};

// 字段变化处理
const handleFieldChange = (field, value) => {
  logger.debug('字段变化:', { prop: field.prop, value });
};

// 分页变化
const handlePageChange = (page) => {
  pagination.current = page;
  loadRepairList();
};

// 操作指引
const handleShowOperationGuide = () => {
  guideDialogVisible.value = true;
  currentStep.value = 0;
};

const handleGuideFinish = () => {
  guideDialogVisible.value = false;
  currentStep.value = 0;
};

// 查看详情
const handleView = (row) => {
  currentRow.value = row;
  detailDialogVisible.value = true;
};

// 查看来源出库单
const handleViewOutbound = (row) => {
  if (row.sourceOutboundId) {
    router.push({
      path: '/inventory-management/outbound',
      query: { id: row.sourceOutboundId, action: 'view' },
    });
  }
};

// 导出
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      repairNo: searchForm.repairNo || undefined,
      deviceCode: searchForm.deviceCode || undefined,
      deviceName: searchForm.deviceName || undefined,
      repairType: searchForm.repairType || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined,
    };

    logger.info('导出维修记录', params);
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出维修记录失败', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadRepairList();
});
</script>

<style scoped lang="scss">
.stats-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.device-stats {
  display: flex;
  justify-content: space-around;
  gap: 24px;
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

  &.total {
    background: #f0f9ff;
    color: #409eff;
  }

  &.warning {
    background: #fff7ed;
    color: #e6a23c;
  }

  &.info {
    background: #f0f9ff;
    color: #409eff;
  }

  &.success {
    background: #f0f9eb;
    color: #67c23a;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.source-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #66b1ff;
  }
}

.radio-option {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .radio-label {
    font-weight: 500;
  }

  .radio-desc {
    font-size: 12px;
    color: #909399;
  }
}

.ml-2 {
  margin-left: 8px;
}

/* 详情区域样式 */
.detail-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.image-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.repair-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

/* 操作指引样式 */
.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 200px;
}

.guide-item h3 {
  color: #409eff;
  margin-bottom: 15px;
}

.guide-item ul {
  padding-left: 20px;
  line-height: 2;
}

.guide-item li {
  margin-bottom: 8px;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  margin-top: 15px;
  color: #606266;
}

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}
</style>
