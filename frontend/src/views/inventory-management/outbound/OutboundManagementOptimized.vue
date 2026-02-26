<!--
  @file: OutboundManagementOptimized.vue
  @description: 出库管理页面 - 优化版（简化流程4步）
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 2.0
  @modifyRecords:
      2026-02-13: 流程简化优化
        - 将6步流程简化为4步
        - 合并"审核中"到"待审核"
        - 增加执行确认环节
        - 集成统一状态机管理
-->
<template>
  <PageLayout
    title="出库管理"
    description="管理设备出库流程，支持多种出库类型和详细信息录入（优化版4步流程）"
    data-cy="outbound-management-page"
  >
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="showOperationGuide = true" data-cy="outbound-guide-btn">操作指引</el-button>
      <el-button type="primary" :icon="Plus" @click="handleCreate" data-cy="outbound-create-btn">新建出库单</el-button>
      <el-button type="success" :icon="Download" @click="handleExport" :loading="exportLoading" data-cy="outbound-export-btn">导出</el-button>
    </template>

    <!-- 统计信息卡片 -->
    <el-card class="stats-card" shadow="never">
      <div class="device-stats">
        <div class="stat-item">
          <div class="stat-icon total">
            <el-icon :size="24"><Box /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.totalCount }}</span>
            <span class="stat-label">出库总数</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <el-icon :size="24"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.pendingAuditCount }}</span>
            <span class="stat-label">待审核</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon info">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.auditedCount }}</span>
            <span class="stat-label">已审核待执行</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <el-icon :size="24"><Check /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ statistics.completedCount }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-operation-bar" data-cy="outbound-batch-operation-bar">
      <span class="batch-info" data-cy="outbound-selected-count">已选择 {{ selectedRows.length }} 项</span>
      <el-button-group>
        <el-button
          v-for="op in availableBatchOperations"
          :key="op.key"
          :type="op.type"
          :icon="getIcon(op.icon)"
          @click="handleBatchOperation(op)"
          :data-cy="`outbound-batch-${op.key}-btn`"
        >
          {{ op.label }}
        </el-button>
      </el-button-group>
      <el-button text @click="clearSelection" data-cy="outbound-clear-selection-btn">取消选择</el-button>
    </div>

    <!-- 数据表格 -->
    <DataTable
      :data="tableData"
      :total="pagination.total"
      :loading="loading"
      :current-page="pagination.current"
      :page-size="pagination.pageSize"
      :row-key="(row) => row.id || row.orderNo"
      height="500px"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" data-cy="outbound-selection-column" />
      <el-table-column prop="orderNo" label="出库单号" width="180" data-cy="outbound-order-no-column" />
      <el-table-column prop="orderDate" label="出库日期" width="120" data-cy="outbound-date-column" />
      <el-table-column prop="outboundType" label="出库类型" width="100" data-cy="outbound-type-column">
        <template #default="{ row }">
          <el-tag :type="getOutboundTypeType(row.outboundType)" :data-cy="`outbound-type-tag-${row.id}`">{{ getOutboundTypeText(row.outboundType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="customer" label="客户/单位" width="150" data-cy="outbound-customer-column" />
      <el-table-column prop="operatorName" label="经办人" width="120" data-cy="outbound-operator-column" />
      <el-table-column prop="totalQuantity" label="总数量" width="100" align="center" data-cy="outbound-total-qty-column" />
      <el-table-column prop="status" label="状态" width="100" data-cy="outbound-status-column">
        <template #default="{ row }">
          <el-tag :type="getOutboundStatusType(row.status)" :data-cy="`outbound-status-tag-${row.id}`">{{ getOutboundStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="350" fixed="right" data-cy="outbound-actions-column">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="handleView(row)" data-cy="outbound-view-btn">查看</el-button>
          <el-button
            v-if="checkOperationAllowed(row.status, 'edit')"
            link
            type="primary"
            :icon="Edit"
            @click="handleEdit(row)"
            data-cy="outbound-edit-btn"
            >编辑</el-button
          >
          <el-button
            v-if="checkOperationAllowed(row.status, 'delete')"
            link
            type="danger"
            :icon="Delete"
            @click="handleDelete(row)"
            data-cy="outbound-delete-btn"
            >删除</el-button
          >
          <el-button v-if="checkOperationAllowed(row.status, 'submit')" link type="success" @click="handleSubmit(row)" data-cy="outbound-submit-btn"
            >提交审核</el-button
          >
          <el-button v-if="checkOperationAllowed(row.status, 'audit')" link type="success" @click="handleAudit(row)" data-cy="outbound-audit-btn"
            >审核</el-button
          >
          <el-button v-if="checkOperationAllowed(row.status, 'execute')" link type="warning" @click="handleExecute(row)" data-cy="outbound-execute-btn"
            >执行出库</el-button
          >
          <el-button
            v-if="checkOperationAllowed(row.status, 'resubmit')"
            link
            type="success"
            @click="handleResubmit(row)"
            data-cy="outbound-resubmit-btn"
            >重新提交</el-button
          >
        </template>
      </el-table-column>
    </DataTable>

    <!-- 出库单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="出库单详情" width="1000px" destroy-on-close data-cy="outbound-detail-dialog">
      <!-- 流程进度条 -->
      <div class="flow-progress-section">
        <ProcessFlowProgress
          :steps="flowSteps"
          :current-step="getCurrentStepIndex(currentRow?.status)"
          :status="currentRow?.status"
        />
      </div>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="出库单号" :span="1">{{ currentRow?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="出库日期" :span="1">{{ currentRow?.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getOutboundStatusType(currentRow?.status)">{{
            getOutboundStatusText(currentRow?.status)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="出库类型" :span="1">
          <el-tag :type="getOutboundTypeType(currentRow?.outboundType)">
            {{ getOutboundTypeText(currentRow?.outboundType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户/单位" :span="1">{{ currentRow?.customer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="经办人" :span="1">{{ currentRow?.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总数量" :span="1">{{ currentRow?.totalQuantity || 0 }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentRow?.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 设备清单 -->
      <div class="device-list-section">
        <h4>出库设备清单</h4>
        <el-table :data="currentRow?.items || []" border size="small" data-cy="outbound-detail-table">
          <el-table-column type="index" label="序号" width="60" data-cy="detail-index-column" />
          <el-table-column prop="deviceCode" label="设备编号" width="150" data-cy="detail-device-code-column" />
          <el-table-column prop="deviceName" label="设备名称" width="150" data-cy="detail-device-name-column" />
          <el-table-column prop="model" label="规格型号" width="120" data-cy="detail-model-column" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" data-cy="detail-quantity-column" />
          <el-table-column prop="location" label="货位" width="120" data-cy="detail-location-column" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false" data-cy="outbound-detail-close-btn">关闭</el-button>
        <el-button
          v-if="checkOperationAllowed(currentRow?.status, 'execute')"
          type="primary"
          @click="handleExecute(currentRow)"
          data-cy="outbound-detail-execute-btn"
          >执行出库</el-button
        >
        <el-button
          v-if="checkOperationAllowed(currentRow?.status, 'audit')"
          type="success"
          @click="handleAudit(currentRow)"
          data-cy="outbound-detail-audit-btn"
          >审核通过</el-button
        >
      </template>
    </el-dialog>

    <!-- 操作指引对话框 -->
    <OperationGuideDialog v-model="showOperationGuide" title="出库操作指引" :steps="guideSteps" />

    <!-- 批量操作进度对话框 -->
    <BatchOperationProgress
      v-model="batchProgressVisible"
      :title="batchProgressTitle"
      :total="batchTotal"
      :success="batchSuccess"
      :failed="batchFailed"
      :progress="batchProgress"
      :results="batchResults"
    />

    <!-- 出库单创建向导 -->
    <OutboundCreationWizard
      v-model="wizardVisible"
      :warehouse-list="warehouseList"
      :user-list="userList"
      :device-list="deviceList"
      @submit="handleWizardSubmit"
      @save-draft="handleSaveDraft"
    />
  </PageLayout>
</template>

<script setup>
import {
  Box,
  Check,
  CircleCheck,
  Close,
  Delete,
  Download,
  Edit,
  Plus,
  QuestionFilled,
  Timer,
  Upload,
  View,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import BatchOperationProgress from '@/components/business/dialogs/BatchOperationProgress.vue';
import OperationGuideDialog from '@/components/business/dialogs/OperationGuideDialog.vue';
import ProcessFlowProgress from '@/components/business/ProcessFlowProgress.vue';
import OutboundCreationWizard from '@/components/business/wizard/OutboundCreationWizard.vue';
import { DEVICE_API, STOCK_ORDERS_UNIFIED_API, SYSTEM_API } from '@/constants/apiConstants';
import {
  OutboundStatus,
  checkOutboundOperationAllowed,
  getAvailableBatchOperations,
  getOutboundStatusText,
  getOutboundStatusType,
  getOutboundTypeText,
  getOutboundTypeType,
} from '@/constants/outboundStatus';
import { BusinessType, useBusinessStatus } from '@/stores/unifiedStatusMachine';
import { createLogger } from '@/utils/logger';
import request from '@/utils/request';

const logger = createLogger('OutboundManagementOptimized');

// 使用统一状态机
const statusMachine = useBusinessStatus(BusinessType.OUTBOUND);

// 状态
const loading = ref(false);
const exportLoading = ref(false);
const detailDialogVisible = ref(false);
const showOperationGuide = ref(false);
const wizardVisible = ref(false);
const currentRow = ref(null);
const selectedRows = ref([]);
const tableData = ref([]);
const warehouseList = ref([]);
const userList = ref([]);
const deviceList = ref([]);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

// 统计
const statistics = reactive({
  totalCount: 0,
  pendingAuditCount: 0,
  auditedCount: 0,
  completedCount: 0,
});

// 批量操作进度
const batchProgressVisible = ref(false);
const batchProgressTitle = ref('');
const batchTotal = ref(0);
const batchSuccess = ref(0);
const batchFailed = ref(0);
const batchProgress = ref(0);
const batchResults = ref([]);

// 流程步骤
const flowSteps = computed(() => statusMachine.steps.value);

// 获取当前步骤索引
const getCurrentStepIndex = (status) => {
  const stepMap = {
    [OutboundStatus.DRAFT]: 0,
    [OutboundStatus.PENDING_AUDIT]: 1,
    [OutboundStatus.AUDITED]: 2,
    [OutboundStatus.COMPLETED]: 3,
    [OutboundStatus.CANCELLED]: -1,
    [OutboundStatus.REJECTED]: -1,
  };
  return stepMap[status] ?? -1;
};

// 操作指引步骤
const guideSteps = [
  { title: '新建出库单', description: '点击"新建出库单"按钮，填写出库信息', icon: 'Plus' },
  { title: '选择设备', description: '选择需要出库的设备，填写数量', icon: 'Box' },
  { title: '提交审核', description: '确认信息无误后提交审核', icon: 'Upload' },
  { title: '审核通过', description: '审核人审核通过后，等待执行', icon: 'CircleCheck' },
  { title: '执行出库', description: '执行实际出库操作，更新库存', icon: 'Check' },
];

// 可用的批量操作
const availableBatchOperations = computed(() => {
  return getAvailableBatchOperations(selectedRows.value);
});

// 获取图标
const getIcon = (iconName) => {
  const iconMap = {
    Upload,
    CircleCheck,
    Check,
    Delete,
    Close,
  };
  return iconMap[iconName] || Box;
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      orderType: 'OUTBOUND',
    };

    const response = await request.get(STOCK_ORDERS_UNIFIED_API.LIST, { params });

    if (response.data?.success) {
      const { data } = response.data;
      tableData.value = data?.content || data || [];
      pagination.total = data?.totalElements || tableData.value.length;
      updateStatistics();
    } else {
      throw new Error(response.data?.message || '加载出库单列表失败');
    }
  } catch (error) {
    logger.error('加载数据失败', error);
    ElMessage.error(`加载出库单列表失败：${error.message || '网络错误'}`);
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 更新统计
const updateStatistics = () => {
  const list = tableData.value;
  statistics.totalCount = list.length;
  statistics.pendingAuditCount = list.filter((item) => item.status === OutboundStatus.PENDING_AUDIT).length;
  statistics.auditedCount = list.filter((item) => item.status === OutboundStatus.AUDITED).length;
  statistics.completedCount = list.filter((item) => item.status === OutboundStatus.COMPLETED).length;
};

// 分页变化
const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  loadData();
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 清空选择
const clearSelection = () => {
  selectedRows.value = [];
};

// 检查操作是否允许
const checkOperationAllowed = (status, operation) => {
  return checkOutboundOperationAllowed(status, operation);
};

// 新建
const handleCreate = () => {
  wizardVisible.value = true;
};

// 向导提交
const handleWizardSubmit = async (data) => {
  try {
    loading.value = true;

    // 调用API创建出库单
    const response = await request.post(STOCK_ORDERS_UNIFIED_API.SAVE, data);

    if (response.data?.success) {
      ElMessage.success('出库单创建成功');
      wizardVisible.value = false;
      // 刷新列表显示新创建的订单
      await loadData();
    } else {
      throw new Error(response.data?.message || '创建失败');
    }
  } catch (error) {
    logger.error('创建出库单失败:', error);
    ElMessage.error(`创建出库单失败：${error.message || '网络错误'}`);
  } finally {
    loading.value = false;
  }
};

// 保存草稿
const handleSaveDraft = async (data) => {
  try {
    const response = await request.post(STOCK_ORDERS_UNIFIED_API.SAVE, {
      ...data,
      status: OutboundStatus.DRAFT,
    });
    if (response.data?.success) {
      ElMessage.success('草稿保存成功');
      await loadData();
    } else {
      throw new Error(response.data?.message || '保存草稿失败');
    }
  } catch (error) {
    logger.error('保存草稿失败:', error);
    ElMessage.error(`保存草稿失败：${error.message || '网络错误'}`);
  }
};

// 查看
const handleView = (row) => {
  currentRow.value = row;
  statusMachine.setStatus(row.status);
  detailDialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑出库单: ${row.orderNo}`);
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除出库单 ${row.orderNo} 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await request.delete(STOCK_ORDERS_UNIFIED_API.DELETE(row.id));
    if (response.data?.success) {
      ElMessage.success('删除成功');
      await loadData();
    } else {
      throw new Error(response.data?.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除出库单失败:', error);
      ElMessage.error(`删除失败：${error.message || '网络错误'}`);
    }
  }
};

// 提交审核
const handleSubmit = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要提交出库单 ${row.orderNo} 进行审核吗？`, '确认提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });

    const response = await request.post(STOCK_ORDERS_UNIFIED_API.SUBMIT(row.id));
    if (response.data?.success) {
      ElMessage.success('提交审核成功');
      await loadData();
    } else {
      throw new Error(response.data?.message || '提交审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('提交审核失败:', error);
      ElMessage.error(`提交审核失败：${error.message || '网络错误'}`);
    }
  }
};

// 审核
const handleAudit = async (row) => {
  try {
    const action = await ElMessageBox.confirm(`确定要通过出库单 ${row.orderNo} 的审核吗？`, '确认审核', {
      confirmButtonText: '通过',
      cancelButtonText: '驳回',
      type: 'warning',
      distinguishCancelAndClose: true,
    }).catch((err) => err);

    if (action === 'confirm') {
      const response = await request.post(STOCK_ORDERS_UNIFIED_API.AUDIT(row.id), {
        approved: true,
      });
      if (response.data?.success) {
        ElMessage.success('审核通过');
        if (detailDialogVisible.value) {
          detailDialogVisible.value = false;
        }
        await loadData();
      } else {
        throw new Error(response.data?.message || '审核失败');
      }
    } else if (action === 'cancel') {
      const response = await request.post(STOCK_ORDERS_UNIFIED_API.AUDIT(row.id), {
        approved: false,
      });
      if (response.data?.success) {
        ElMessage.warning('审核已驳回');
        if (detailDialogVisible.value) {
          detailDialogVisible.value = false;
        }
        await loadData();
      } else {
        throw new Error(response.data?.message || '驳回失败');
      }
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      logger.error('审核操作失败:', error);
      ElMessage.error(`审核操作失败：${error.message || '网络错误'}`);
    }
  }
};

// 执行出库
const handleExecute = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要执行出库单 ${row.orderNo} 吗？执行后将更新库存状态。`, '确认执行出库', {
      confirmButtonText: '确定执行',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await request.post(STOCK_ORDERS_UNIFIED_API.EXECUTE(row.id));
    if (response.data?.success) {
      ElMessage.success('出库执行成功');
      if (detailDialogVisible.value) {
        detailDialogVisible.value = false;
      }
      await loadData();
    } else {
      throw new Error(response.data?.message || '执行出库失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('执行出库失败:', error);
      ElMessage.error(`执行出库失败：${error.message || '网络错误'}`);
    }
  }
};

// 重新提交
const handleResubmit = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重新提交出库单 ${row.orderNo} 吗？`, '确认重新提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });

    const response = await request.post(STOCK_ORDERS_UNIFIED_API.SUBMIT(row.id));
    if (response.data?.success) {
      ElMessage.success('重新提交成功');
      await loadData();
    } else {
      throw new Error(response.data?.message || '重新提交失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('重新提交失败:', error);
      ElMessage.error(`重新提交失败：${error.message || '网络错误'}`);
    }
  }
};

// 导出
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const response = await request.get(STOCK_ORDERS_UNIFIED_API.EXPORT, {
      params: { orderType: 'OUTBOUND' },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `出库单_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出失败:', error);
    ElMessage.error(`导出失败：${error.message || '网络错误'}`);
  } finally {
    exportLoading.value = false;
  }
};

// 批量操作
const handleBatchOperation = async (operation) => {
  const ids = selectedRows.value.map((row) => row.id);

  try {
    await ElMessageBox.confirm(`${operation.confirmMessage}（共 ${ids.length} 项）`, '批量操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: operation.type,
    });
  } catch {
    return;
  }

  batchProgressTitle.value = operation.label;
  batchTotal.value = ids.length;
  batchSuccess.value = 0;
  batchFailed.value = 0;
  batchProgress.value = 0;
  batchResults.value = [];
  batchProgressVisible.value = true;

  try {
    let apiEndpoint;
    let apiData = { ids };

    switch (operation.key) {
      case 'submit':
        apiEndpoint = STOCK_ORDERS_UNIFIED_API.BATCH_AUDIT;
        apiData = { ids, action: 'submit' };
        break;
      case 'audit':
        apiEndpoint = STOCK_ORDERS_UNIFIED_API.BATCH_AUDIT;
        apiData = { ids, approved: true };
        break;
      case 'execute':
        apiEndpoint = STOCK_ORDERS_UNIFIED_API.BATCH_AUDIT;
        apiData = { ids, action: 'execute' };
        break;
      case 'delete':
        apiEndpoint = STOCK_ORDERS_UNIFIED_API.BATCH_DELETE;
        break;
      case 'cancel':
        apiEndpoint = STOCK_ORDERS_UNIFIED_API.BATCH_DELETE;
        apiData = { ids, action: 'cancel' };
        break;
      default:
        throw new Error('未知的批量操作类型');
    }

    const response = await request.post(apiEndpoint, apiData);

    if (response.data?.success) {
      const results = response.data.data?.results || [];
      results.forEach((result, index) => {
        if (result.success) {
          batchSuccess.value++;
          batchResults.value.push({ id: ids[index], success: true, message: '成功' });
        } else {
          batchFailed.value++;
          batchResults.value.push({ id: ids[index], success: false, message: result.message || '失败' });
        }
        batchProgress.value = Math.round(((index + 1) / ids.length) * 100);
      });
    } else {
      throw new Error(response.data?.message || '批量操作失败');
    }
  } catch (error) {
    logger.error('批量操作失败:', error);
    batchFailed.value = ids.length;
    ids.forEach((id) => {
      batchResults.value.push({ id, success: false, message: error.message || '网络错误' });
    });
    batchProgress.value = 100;
  }

  await loadData();
  clearSelection();

  if (batchFailed.value === 0) {
    ElMessage.success(operation.successMessage);
  } else {
    ElMessage.warning(`批量操作完成，成功 ${batchSuccess.value} 项，失败 ${batchFailed.value} 项`);
  }
};

// 加载仓库列表
const loadWarehouseList = async () => {
  try {
    const response = await request.get(SYSTEM_API.WAREHOUSES);
    if (response.data?.success) {
      warehouseList.value = response.data.data || [];
    } else {
      warehouseList.value = [];
    }
  } catch (error) {
    logger.error('加载仓库列表失败', error);
    warehouseList.value = [];
  }
};

const loadDeviceList = async () => {
  try {
    const response = await request.get(DEVICE_API.LIST, {
      params: {
        page: 1,
        size: 1000,
        status: 0,
      },
    });

    if (response.code === 200 && response.data) {
      const pageData = response.data;
      deviceList.value = pageData.records || pageData.list || pageData.devices || [];
      logger.debug('设备列表加载成功', { count: deviceList.value.length });
    } else {
      deviceList.value = [];
      logger.warn('设备列表响应格式异常', response);
    }
  } catch (error) {
    logger.error('加载设备列表失败', error);
    deviceList.value = [];
  }
};

onMounted(() => {
  loadData();
  loadWarehouseList();
  loadDeviceList();
});
</script>

<style scoped>
.stats-card {
  margin-bottom: 20px;
}

.device-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
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
  background-color: #ecf5ff;
  color: #409eff;
}
.stat-icon.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}
.stat-icon.info {
  background-color: #f4f4f5;
  color: #909399;
}
.stat-icon.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.batch-operation-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.batch-info {
  font-weight: bold;
  color: #409eff;
}

.flow-progress-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.device-list-section {
  margin-top: 20px;
}

.device-list-section h4 {
  margin-bottom: 12px;
  color: #303133;
}
</style>
