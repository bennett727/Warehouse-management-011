<!--
  @file: InboundManagementOptimized.vue
  @description: 入库管理页面 - 优化版
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 5.0
  @modifyRecords:
      2026-02-13: 优化版本
        - 增加执行确认环节（审核后需手动执行入库）
        - 增加批量操作功能（批量提交、审核、执行、删除）
        - 优化设备选择性能
        - 增加流程可视化展示
-->
<template>
  <PageLayout
    title="入库管理"
    description="管理设备入库流程，支持采购入库、退货入库、调拨入库等多种入库类型"
    data-cy="inbound-management-page"
  >
    <template #headerActions>
      <el-button type="info" :icon="QuestionFilled" @click="handleShowOperationGuide">操作指引</el-button>
      <el-button type="primary" :icon="Plus" @click="handleCreate" data-cy="inbound-create-btn">新建入库单</el-button>
      <el-button
        type="success"
        :icon="Download"
        @click="handleExport"
        :loading="exportLoading"
        data-cy="inbound-export-btn"
        >导出</el-button
      >
    </template>

    <!-- 批量操作工具栏 -->
    <el-card v-if="selectedRows.length > 0" class="batch-operation-bar" shadow="never">
      <div class="batch-info">
        <el-checkbox v-model="selectAll" @change="handleSelectAllChange">全选</el-checkbox>
        <span class="selected-count"
          >已选择 <strong>{{ selectedRows.length }}</strong> 项</span
        >
      </div>
      <div class="batch-actions">
        <el-button
          v-for="op in availableBatchOperations"
          :key="op.key"
          :type="op.danger ? 'danger' : 'primary'"
          :icon="op.icon"
          size="small"
          @click="handleBatchOperation(op.key)"
        >
          {{ op.label }}
        </el-button>
        <el-button type="info" size="small" @click="clearSelection">取消选择</el-button>
      </div>
    </el-card>

    <!-- 筛选栏 -->
    <UnifiedFilterBar
      ref="filterBarRef"
      v-model="searchParams"
      :fields="inboundFilterConfig.fields"
      :header-title="inboundFilterConfig.header.title"
      :header-icon="inboundFilterConfig.header.icon"
      :show-result-count="inboundFilterConfig.header.showResultCount"
      :show-collapse="inboundFilterConfig.header.showCollapse"
      :collapse-threshold="inboundFilterConfig.header.collapseThreshold"
      :show-search="inboundFilterConfig.buttons.showSearch"
      :show-reset="inboundFilterConfig.buttons.showReset"
      :search-text="inboundFilterConfig.buttons.searchText"
      :reset-text="inboundFilterConfig.buttons.resetText"
      :loading="loading"
      :total="pagination.total"
      :auto-search="inboundFilterConfig.behavior.autoSearch"
      :debounce-time="inboundFilterConfig.behavior.debounceTime"
      @search="handleSearch"
      @reset="handleReset"
      @field-change="handleFieldChange"
    />

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
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="orderNo" label="入库单号" width="180" sortable />
      <el-table-column prop="inboundType" label="入库类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getInboundTypeType(row.inboundType)">
            {{ getInboundTypeText(row.inboundType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderDate" label="入库日期" width="120" sortable />
      <el-table-column prop="supplier" label="供应商" width="150" show-overflow-tooltip />
      <el-table-column prop="warehouseName" label="入库仓库" width="120" />
      <el-table-column prop="operatorName" label="经办人" width="100" />
      <el-table-column prop="totalQuantity" label="总数量" width="80" align="center" />
      <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
        <template #default="{ row }">
          {{ row.totalAmount ? '¥' + row.totalAmount.toFixed(2) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getInboundStatusType(row.status)">{{ getInboundStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <!-- 查看按钮 - 所有状态都显示 -->
          <el-button link type="primary" :icon="View" @click="handleView(row)" data-cy="inbound-view-btn"
            >查看</el-button
          >

          <!-- 编辑按钮 - 草稿和已驳回状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'edit')"
            link
            type="primary"
            :icon="Edit"
            @click="handleEdit(row)"
            data-cy="inbound-edit-btn"
            >编辑</el-button
          >

          <!-- 删除按钮 - 草稿和已驳回状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'delete')"
            link
            type="danger"
            :icon="Delete"
            @click="handleDelete(row)"
            data-cy="inbound-delete-btn"
            >删除</el-button
          >

          <!-- 提交按钮 - 草稿状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'submit')"
            link
            type="success"
            :icon="TopRight"
            @click="handleSubmitForAudit(row)"
            data-cy="inbound-submit-btn"
            >提交</el-button
          >

          <!-- 审核按钮 - 待审核状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'audit')"
            link
            type="success"
            :icon="Check"
            @click="handleApprove(row)"
            data-cy="inbound-approve-btn"
            >审核</el-button
          >

          <!-- 执行入库按钮 - 已审核状态（新增） -->
          <el-button
            v-if="isOperationAllowed(row.status, 'execute')"
            link
            type="warning"
            :icon="CircleCheck"
            @click="handleExecute(row)"
            data-cy="inbound-execute-btn"
            :loading="executingId === row.id"
            >执行入库</el-button
          >

          <!-- 重试按钮 - 执行失败状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'retry')"
            link
            type="warning"
            :icon="Refresh"
            @click="handleRetry(row)"
            data-cy="inbound-retry-btn"
            >重试</el-button
          >

          <!-- 取消按钮 - 待审核和已审核状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'cancel')"
            link
            type="info"
            :icon="Close"
            @click="handleCancel(row)"
            data-cy="inbound-cancel-btn"
            >取消</el-button
          >

          <!-- 重新提交按钮 - 已驳回状态 -->
          <el-button
            v-if="isOperationAllowed(row.status, 'resubmit')"
            link
            type="success"
            :icon="TopRight"
            @click="handleResubmit(row)"
            data-cy="inbound-resubmit-btn"
            >重新提交</el-button
          >
        </template>
      </el-table-column>
    </DataTable>

    <!-- 入库单对话框 -->
    <InboundOrderDialog v-model="dialogVisible" :type="dialogType" :data="currentRow" @success="handleDialogSuccess" />

    <InboundCreationWizard
      v-model="wizardVisible"
      :warehouse-list="warehouseList"
      :zone-list="zoneList"
      :bin-list="binList"
      :user-list="userList"
      :device-list="deviceList"
      :device-type-list="deviceTypeList"
      :supplier-list="supplierList"
      @submit="handleWizardSubmit"
      @save-draft="handleSaveDraft"
    />

    <!-- 入库单详情对话框 - 增加流程可视化 -->
    <el-dialog v-model="detailDialogVisible" title="入库单详情" width="1000px" destroy-on-close>
      <!-- 流程进度展示 -->
      <div class="flow-progress" v-if="currentRow">
        <el-steps :active="getFlowStep(currentRow.status)" finish-status="success" align-center>
          <el-step title="创建" :description="formatTime(currentRow.createTime)" />
          <el-step title="提交" :description="getStepTime('submit')" />
          <el-step title="审核" :description="getStepTime('audit')" />
          <el-step title="执行" :description="getStepTime('execute')" />
          <el-step title="完成" :description="formatTime(currentRow.completeTime)" />
        </el-steps>
      </div>

      <el-divider />

      <el-descriptions :column="3" border>
        <el-descriptions-item label="入库单号" :span="1">{{ currentRow?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="入库类型" :span="1">
          <el-tag :type="getInboundTypeType(currentRow?.inboundType)">
            {{ getInboundTypeText(currentRow?.inboundType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">
          <el-tag :type="getInboundStatusType(currentRow?.status)">{{
            getInboundStatusText(currentRow?.status)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="入库日期" :span="1">{{ currentRow?.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="供应商" :span="1">{{ currentRow?.supplier || '-' }}</el-descriptions-item>
        <el-descriptions-item label="入库仓库" :span="1">{{ currentRow?.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="经办人" :span="1">{{ currentRow?.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总数量" :span="1">{{ currentRow?.totalQuantity || 0 }}</el-descriptions-item>
        <el-descriptions-item label="总金额" :span="1">
          {{ currentRow?.totalAmount ? '¥' + currentRow.totalAmount.toFixed(2) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="关联单号" :span="1" v-if="currentRow?.relatedOrderNo">
          {{ currentRow.relatedOrderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="currentRow?.relatedOrderNo ? 2 : 3">
          {{ currentRow?.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 明细列表 -->
      <div class="detail-section" v-if="orderItems.length > 0">
        <div class="section-title">
          <el-icon><List /></el-icon>
          <span>入库明细</span>
        </div>
        <el-table :data="orderItems" border size="small">
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column prop="deviceCode" label="设备编号" width="120" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" />
          <el-table-column prop="specification" label="规格型号" width="120" />
          <el-table-column prop="binCode" label="货位" width="100" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="unitPrice" label="单价" width="100" align="right">
            <template #default="{ row }">
              {{ row.unitPrice ? '¥' + row.unitPrice.toFixed(2) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="金额" width="100" align="right">
            <template #default="{ row }">
              {{ row.totalPrice ? '¥' + row.totalPrice.toFixed(2) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="batchNo" label="批次号" width="120" />
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportDetail" v-if="orderItems.length > 0"> 导出明细 </el-button>
        <!-- 执行入库按钮（在详情页也可执行） -->
        <el-button
          v-if="currentRow && isOperationAllowed(currentRow.status, 'execute')"
          type="warning"
          @click="
            handleExecute(currentRow);
            detailDialogVisible = false;
          "
        >
          执行入库
        </el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核入库单" width="500px" destroy-on-close>
      <el-alert
        v-if="auditForm.approved"
        title="审批通过后，入库单状态将变为'已审核'，需要手动执行入库操作"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      />
      <el-alert
        v-else
        title="审批拒绝后，入库单将退回'已驳回'状态，可以编辑后重新提交"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px"
      />
      <el-form ref="auditFormRef" :model="auditForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditLoading" @click="handleAuditSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 执行入库对话框（新增） -->
    <el-dialog v-model="executeDialogVisible" title="执行入库" width="500px" destroy-on-close>
      <el-alert
        title="执行入库后，设备将正式入库并变为'在库'状态，此操作不可撤销！"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px"
        show-icon
      />
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="入库单号">{{ currentRow.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="入库类型">{{ getInboundTypeText(currentRow.inboundType) }}</el-descriptions-item>
        <el-descriptions-item label="总数量">{{ currentRow.totalQuantity }}</el-descriptions-item>
        <el-descriptions-item label="入库仓库">{{ currentRow.warehouseName }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="executeForm" label-width="100px" style="margin-top: 16px">
        <el-form-item label="执行备注">
          <el-input v-model="executeForm.remark" type="textarea" :rows="2" placeholder="请输入执行备注（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="executeLoading" @click="handleExecuteSubmit">确认执行入库</el-button>
      </template>
    </el-dialog>

    <!-- 批量操作进度对话框 -->
    <el-dialog
      v-model="batchProgressVisible"
      title="批量处理进度"
      width="500px"
      :close-on-click-modal="false"
      :show-close="!batchProcessing"
    >
      <div class="batch-progress-content">
        <el-progress :percentage="batchProgress.percentage" :status="batchProgress.status" />
        <div class="progress-stats">
          <div class="stat-item">
            <span class="label">总计:</span>
            <span class="value">{{ batchProgress.total }}</span>
          </div>
          <div class="stat-item success">
            <span class="label">成功:</span>
            <span class="value">{{ batchProgress.success }}</span>
          </div>
          <div class="stat-item error">
            <span class="label">失败:</span>
            <span class="value">{{ batchProgress.failed }}</span>
          </div>
        </div>
        <div v-if="batchProgress.errors.length > 0" class="error-list">
          <el-divider>失败详情</el-divider>
          <el-scrollbar height="100px">
            <div v-for="(error, index) in batchProgress.errors" :key="index" class="error-item">
              <el-icon color="#F56C6C"><CircleClose /></el-icon>
              <span>{{ error.orderNo }}: {{ error.message }}</span>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <template #footer>
        <el-button v-if="!batchProcessing" @click="batchProgressVisible = false">
          {{ batchProgress.failed > 0 ? '关闭' : '完成' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 操作指引对话框 -->
    <el-dialog v-model="guideDialogVisible" title="操作指引" width="900px" :close-on-click-modal="false">
      <div class="operation-guide">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="新建入库单" />
          <el-step title="提交审核" />
          <el-step title="审核入库单" />
          <el-step title="执行入库" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 新建入库单</h3>
            <p>创建新的入库单，支持多种入库类型：</p>
            <ul>
              <li><strong>采购入库</strong>：采购新设备入库</li>
              <li><strong>退货入库</strong>：客户退货入库</li>
              <li><strong>调拨入库</strong>：从其他仓库调拨入库</li>
              <li><strong>其他入库</strong>：其他原因入库</li>
            </ul>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 提交审核</h3>
            <p>将入库单提交给上级审核：</p>
            <ul>
              <li><strong>检查信息</strong>：确认入库单信息完整准确</li>
              <li><strong>提交审核</strong>：点击"提交"按钮提交审核</li>
              <li><strong>状态变更</strong>：提交后入库单状态变为"待审核"</li>
            </ul>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 审核入库单</h3>
            <p>审核人员对入库单进行审核：</p>
            <ul>
              <li><strong>审核通过</strong>：入库单变为"已审核"，等待执行入库</li>
              <li><strong>审核拒绝</strong>：入库单退回"已驳回"，可编辑后重新提交</li>
            </ul>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 执行入库</h3>
            <p>审核通过后，执行入库操作：</p>
            <ul>
              <li><strong>执行入库</strong>：点击"执行入库"按钮</li>
              <li><strong>确认信息</strong>：核对入库信息无误后确认</li>
              <li><strong>完成入库</strong>：设备正式入库，状态变为"在库"</li>
            </ul>
            <div class="guide-warning">
              <el-icon><Warning /></el-icon>
              <span>注意：执行入库后不可撤销，请确保信息准确！</span>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
          <el-button v-else type="primary" @click="handleGuideFinish">完成</el-button>
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import {
  Check,
  CircleCheck,
  CircleClose,
  Close,
  Delete,
  Download,
  Edit,
  List,
  Plus,
  QuestionFilled,
  Refresh,
  TopRight,
  View,
  Warning,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { getDeviceTypes } from '@/api/device/device-type';
import { getAreaList } from '@/api/inventory/area';
import {
  auditInboundOrder,
  deleteInboundOrder,
  executeInboundOrder,
  getInboundOrderDetail,
  submitInboundOrder,
} from '@/api/inventory/inbound';
import DataTable from '@/components/base/DataTable.vue';
import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import InboundOrderDialog from '@/components/business/dialogs/InboundOrderDialog.vue';
import { defaultInboundFilter, inboundFilterConfig } from '@/config/filter/inbound.config';
import { STOCK_ORDERS_UNIFIED_API } from '@/constants/apiConstants';
import { BatchOperations, getInboundStatusText, getInboundStatusType, InboundStatus } from '@/constants/inboundStatus';
import { extractListData } from '@/utils/dataNormalizer';
import { createLogger } from '@/utils/logger';
import { createDebouncedRequest, optimizedGet } from '@/utils/performance-optimized-request';
import request from '@/utils/request';

const logger = createLogger('InboundManagementOptimized');

// 搜索参数
const searchParams = reactive({ ...defaultInboundFilter });

// 状态
const loading = ref(false);
const exportLoading = ref(false);
const auditLoading = ref(false);
const executeLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
const filterBarRef = ref(null);

// 选择相关
const selectedRows = ref([]);
const selectAll = ref(false);

const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const auditDialogVisible = ref(false);
const executeDialogVisible = ref(false);
const batchProgressVisible = ref(false);
const guideDialogVisible = ref(false);
const wizardVisible = ref(false);
const currentStep = ref(0);
const dialogType = ref('create');
const currentRow = ref(null);
const orderItems = ref([]);
const executingId = ref(null);

// 批量处理状态
const batchProcessing = ref(false);
const batchProgress = reactive({
  total: 0,
  success: 0,
  failed: 0,
  percentage: 0,
  status: '',
  errors: [],
});

// 审核表单
const auditForm = reactive({
  approved: true,
  remark: '',
});

// 执行表单
const executeForm = reactive({
  remark: '',
});

// 入库类型映射
const getInboundTypeText = (type) => {
  const map = { 0: '采购入库', 1: '退货入库', 2: '调拨入库', 3: '其他入库' };
  return map[type] || type;
};

const getInboundTypeType = (type) => {
  const map = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'info' };
  return map[type] || '';
};

// 计算可用的批量操作
const availableBatchOperations = computed(() => {
  if (selectedRows.value.length === 0) {
    return [];
  }

  const operations = [];
  const statuses = selectedRows.value.map((row) => row.status);

  // 检查是否可以批量提交
  if (statuses.every((s) => BatchOperations.submit.allowedStatus.includes(s))) {
    operations.push({ key: 'submit', ...BatchOperations.submit });
  }

  // 检查是否可以批量审核
  if (statuses.every((s) => BatchOperations.audit.allowedStatus.includes(s))) {
    operations.push({ key: 'audit', ...BatchOperations.audit });
  }

  // 检查是否可以批量执行
  if (statuses.every((s) => BatchOperations.execute.allowedStatus.includes(s))) {
    operations.push({ key: 'execute', ...BatchOperations.execute });
  }

  // 检查是否可以批量删除
  if (statuses.every((s) => BatchOperations.delete.allowedStatus.includes(s))) {
    operations.push({ key: 'delete', ...BatchOperations.delete });
  }

  return operations;
});

// 使用防抖优化搜索请求
const debouncedLoadInboundOrderList = createDebouncedRequest(async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      orderNo: searchParams.orderNo || undefined,
      inboundType: searchParams.inboundType !== undefined ? searchParams.inboundType : undefined,
      supplier: searchParams.supplier || undefined,
      status: searchParams.status !== undefined ? searchParams.status : undefined,
      startDate: searchParams.dateRange?.[0] || undefined,
      endDate: searchParams.dateRange?.[1] || undefined,
    };

    const response = await optimizedGet('/inbound-orders', params, {
      useCache: true,
      cacheTTL: 30000,
      timeout: 10000,
    });

    if (response.code === 200 && response.data) {
      const { list, total } = extractListData(response, {
        listFields: ['records', 'list', 'items', 'data'],
        totalField: 'total',
      });
      tableData.value = list;
      pagination.total = total;
    } else {
      ElMessage.error(response.message || '加载入库单列表失败');
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    logger.error('加载入库单列表失败', error);
    ElMessage.error('加载入库单列表失败，请检查网络连接');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}, 300);

// 加载入库单列表
const loadInboundOrderList = () => {
  debouncedLoadInboundOrderList();
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadInboundOrderList();
};

// 重置
const handleReset = () => {
  pagination.current = 1;
  loadInboundOrderList();
};

// 字段变化处理
const handleFieldChange = (field, value) => {
  logger.debug('字段变化:', { prop: field.prop, value });
};

// 分页变化
const handlePageChange = (page) => {
  pagination.current = page;
  loadInboundOrderList();
};

// 选择相关
const handleSelectAllChange = (val) => {
  if (val) {
    selectedRows.value = [...tableData.value];
  } else {
    selectedRows.value = [];
  }
};

const clearSelection = () => {
  selectedRows.value = [];
  selectAll.value = false;
};

// 批量操作
const handleBatchOperation = async (operation) => {
  const config = BatchOperations[operation];
  if (!config) {
    return;
  }

  const count = selectedRows.value.length;
  const message = config.confirmMessage.replace('{count}', count);

  try {
    await ElMessageBox.confirm(message, '批量操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: config.danger ? 'danger' : 'warning',
    });

    // 显示进度对话框
    batchProgressVisible.value = true;
    batchProcessing.value = true;
    batchProgress.total = count;
    batchProgress.success = 0;
    batchProgress.failed = 0;
    batchProgress.percentage = 0;
    batchProgress.status = '';
    batchProgress.errors = [];

    // 逐个处理
    for (let i = 0; i < selectedRows.value.length; i++) {
      const row = selectedRows.value[i];
      try {
        switch (operation) {
          case 'submit':
            await submitInboundOrder(row.id);
            break;
          case 'audit':
            await auditInboundOrder(row.id, InboundStatus.AUDITED);
            break;
          case 'execute':
            await executeInboundOrder(row.id);
            break;
          case 'delete':
            await deleteInboundOrder(row.id);
            break;
        }
        batchProgress.success++;
      } catch (error) {
        batchProgress.failed++;
        batchProgress.errors.push({
          orderNo: row.orderNo,
          message: error.message || '操作失败',
        });
      }

      batchProgress.percentage = Math.round(((i + 1) / count) * 100);
    }

    batchProgress.status = batchProgress.failed > 0 ? 'exception' : 'success';
    batchProcessing.value = false;

    // 刷新列表
    loadInboundOrderList();
    clearSelection();

    // 显示结果消息
    if (batchProgress.failed === 0) {
      ElMessage.success(`批量${config.label}完成，成功 ${batchProgress.success} 个`);
    } else {
      ElMessage.warning(`批量${config.label}完成，成功 ${batchProgress.success} 个，失败 ${batchProgress.failed} 个`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('批量操作失败', error);
    }
  }
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
const handleView = async (row) => {
  currentRow.value = row;
  detailDialogVisible.value = true;
  orderItems.value = [];

  try {
    const response = await getInboundOrderDetail(row.id);
    if (response.code === 200 && response.data) {
      orderItems.value = response.data.items || [];
    }
  } catch (error) {
    logger.error('加载入库单详情失败', error);
  }
};

// 获取流程步骤
const getFlowStep = (status) => {
  const stepMap = {
    [InboundStatus.DRAFT]: 0,
    [InboundStatus.PENDING_AUDIT]: 1,
    [InboundStatus.AUDITED]: 2,
    [InboundStatus.EXECUTING]: 3,
    [InboundStatus.COMPLETED]: 4,
    [InboundStatus.FAILED]: 3,
    [InboundStatus.REJECTED]: 1,
    [InboundStatus.CANCELLED]: 0,
  };
  return stepMap[status] || 0;
};

// 获取步骤时间
const getStepTime = (step) => {
  if (!currentRow.value) {
    return '';
  }
  const timeMap = {
    submit: currentRow.value.submitTime,
    audit: currentRow.value.auditTime,
    execute: currentRow.value.executeTime,
  };
  return formatTime(timeMap[step]);
};

// 格式化时间
const formatTime = (time) => {
  if (!time) {
    return '';
  }
  const date = new Date(time);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const handleCreate = () => {
  wizardVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit';
  currentRow.value = { ...row };
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该入库单吗？删除后将同时删除关联的待入库设备。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteInboundOrder(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除入库单失败', error);
      ElMessage.error('删除失败');
    }
  }
};

// 提交审核
const handleSubmitForAudit = async (row) => {
  try {
    await ElMessageBox.confirm('确定要提交该入库单进行审核吗？提交后设备将进入"待入库"状态。', '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });

    const response = await submitInboundOrder(row.id);
    if (response.code === 200) {
      ElMessage.success('提交成功');
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '提交失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('提交入库单失败', error);
      ElMessage.error('提交失败');
    }
  }
};

// 审核
const handleApprove = (row) => {
  currentRow.value = row;
  auditForm.approved = true;
  auditForm.remark = '';
  auditDialogVisible.value = true;
};

// 审核提交
const handleAuditSubmit = async () => {
  if (!currentRow.value) {
    return;
  }

  auditLoading.value = true;
  try {
    const status = auditForm.approved ? InboundStatus.AUDITED : InboundStatus.REJECTED;
    const response = await auditInboundOrder(currentRow.value.id, status);

    if (response.code === 200) {
      ElMessage.success(auditForm.approved ? '审核通过' : '已驳回');
      auditDialogVisible.value = false;
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '审核失败');
    }
  } catch (error) {
    logger.error('审核入库单失败', error);
    ElMessage.error('审核失败');
  } finally {
    auditLoading.value = false;
  }
};

// 执行入库（新增）
const handleExecute = (row) => {
  currentRow.value = row;
  executeForm.remark = '';
  executeDialogVisible.value = true;
};

// 执行入库提交
const handleExecuteSubmit = async () => {
  if (!currentRow.value) {
    return;
  }

  executingId.value = currentRow.value.id;
  executeLoading.value = true;
  try {
    const response = await executeInboundOrder(currentRow.value.id);

    if (response.code === 200) {
      ElMessage.success('入库执行成功，设备已正式入库');
      executeDialogVisible.value = false;
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '入库执行失败');
    }
  } catch (error) {
    logger.error('执行入库失败', error);
    ElMessage.error('入库执行失败');
  } finally {
    executingId.value = null;
    executeLoading.value = false;
  }
};

// 重试
const handleRetry = async (row) => {
  try {
    await ElMessageBox.confirm('确定要重新执行该入库单吗？', '重试确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    executingId.value = row.id;
    const response = await executeInboundOrder(row.id);

    if (response.code === 200) {
      ElMessage.success('重试成功');
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '重试失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('重试入库失败', error);
      ElMessage.error('重试失败');
    }
  } finally {
    executingId.value = null;
  }
};

// 取消
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该入库单吗？取消后不可恢复。', '取消确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteInboundOrder(row.id);
    if (response.code === 200) {
      ElMessage.success('取消成功');
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '取消失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('取消入库单失败', error);
      ElMessage.error('取消失败');
    }
  }
};

// 重新提交
const handleResubmit = async (row) => {
  try {
    await ElMessageBox.confirm('确定要重新提交该入库单吗？', '重新提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });

    const response = await submitInboundOrder(row.id);
    if (response.code === 200) {
      ElMessage.success('重新提交成功');
      loadInboundOrderList();
    } else {
      ElMessage.error(response.message || '重新提交失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('重新提交入库单失败', error);
      ElMessage.error('重新提交失败');
    }
  }
};

// 对话框成功回调
const handleDialogSuccess = () => {
  dialogVisible.value = false;
  loadInboundOrderList();
};

// 导出
const handleExport = async () => {
  exportLoading.value = true;
  try {
    // 导出逻辑
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出入库单失败', error);
    ElMessage.error('导出失败');
  } finally {
    exportLoading.value = false;
  }
};

// 导出明细
const handleExportDetail = () => {
  ElMessage.success('明细导出成功');
};

const warehouseList = ref([]);
const zoneList = ref([]);
const binList = ref([]);
const userList = ref([]);
const deviceList = ref([]);
const deviceTypeList = ref([]);
const supplierList = ref([]);

const loadReferenceData = async () => {
  try {
    // 并行加载所有基础数据
    const [deviceTypesRes, areasRes] = await Promise.all([
      getDeviceTypes().catch((err) => {
        logger.error('加载设备类型失败:', err);
        return { code: 200, data: [] };
      }),
      getAreaList().catch((err) => {
        logger.error('加载区域列表失败:', err);
        return { code: 200, data: [] };
      }),
    ]);

    // 处理设备类型数据
    if (deviceTypesRes.code === 200 && deviceTypesRes.data) {
      const dataArray = Array.isArray(deviceTypesRes.data)
        ? deviceTypesRes.data
        : deviceTypesRes.data.records || deviceTypesRes.data.list || [];
      deviceTypeList.value = dataArray.map((type) => ({
        id: type.id || type.typeId,
        name: type.name || type.typeName,
        code: type.code || type.typeCode,
        icon: type.icon || 'Box',
      }));
      logger.debug('设备类型加载完成:', deviceTypeList.value);
    }

    // 处理区域数据
    if (areasRes.code === 200 && areasRes.data) {
      const dataArray = Array.isArray(areasRes.data)
        ? areasRes.data
        : areasRes.data.records || areasRes.data.list || [];
      zoneList.value = dataArray.map((area) => ({
        id: area.id || area.areaId,
        name: area.name || area.areaName,
        warehouseId: area.warehouseId || 1,
      }));
      logger.debug('区域列表加载完成:', zoneList.value);
    }

    // 仓库数据（如果API返回为空，使用默认值）
    if (!zoneList.value || zoneList.value.length === 0) {
      zoneList.value = [
        { id: 1, name: 'A区-服务器', warehouseId: 1 },
        { id: 2, name: 'B区-网络设备', warehouseId: 1 },
        { id: 3, name: 'C区-存储设备', warehouseId: 1 },
      ];
    }

    warehouseList.value = [
      { id: 1, name: '主仓库', code: 'WH001' },
      { id: 2, name: '分仓库A', code: 'WH002' },
      { id: 3, name: '分仓库B', code: 'WH003' },
    ];

    // 货位数据
    binList.value = [
      { id: 1, code: 'A-01-01', zoneId: 1 },
      { id: 2, code: 'A-01-02', zoneId: 1 },
      { id: 3, code: 'A-02-01', zoneId: 1 },
      { id: 4, code: 'B-01-01', zoneId: 2 },
      { id: 5, code: 'B-01-02', zoneId: 2 },
      { id: 6, code: 'C-01-01', zoneId: 3 },
    ];

    userList.value = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' },
    ];

    deviceList.value = Array.from({ length: 20 }, (_, i) => ({
      id: `device-${i + 1}`,
      deviceCode: `DEV-${String(i + 1).padStart(3, '0')}`,
      deviceName: `设备 ${i + 1}`,
      deviceType: deviceTypeList.value[0]?.name || '未分类',
    }));

    supplierList.value = [
      { id: 1, name: '供应商A', contactPerson: '联系人A', contactPhone: '13800138001', address: '地址A' },
      { id: 2, name: '供应商B', contactPerson: '联系人B', contactPhone: '13800138002', address: '地址B' },
      { id: 3, name: '供应商C', contactPerson: '联系人C', contactPhone: '13800138003', address: '地址C' },
      { id: 4, name: '供应商D', contactPerson: '联系人D', contactPhone: '13800138004', address: '地址D' },
    ];
  } catch (error) {
    logger.error('加载基础数据失败:', error);
    ElMessage.warning('部分基础数据加载失败，使用默认数据');
  }
};

const handleWizardSubmit = async (data) => {
  try {
    loading.value = true;

    // 调用API创建入库单
    const response = await request.post(STOCK_ORDERS_UNIFIED_API.SAVE, {
      ...data,
      orderType: 2, // 入库单类型
    });

    if (response.data?.success) {
      ElMessage.success('入库单创建成功');
      wizardVisible.value = false;
      // 刷新列表显示新创建的订单
      await loadInboundOrderList();
    } else {
      throw new Error(response.data?.message || '创建失败');
    }
  } catch (error) {
    logger.error('创建入库单失败:', error);
    ElMessage.error(`创建入库单失败：${error.message || '网络错误'}`);
  } finally {
    loading.value = false;
  }
};

const handleSaveDraft = (data) => {
  logger.info('保存草稿', data);
};

onMounted(() => {
  loadInboundOrderList();
  loadReferenceData();
});
</script>

<style scoped>
.batch-operation-bar {
  margin-bottom: 16px;
  background-color: #f5f7fa;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.selected-count {
  color: #606266;
}

.selected-count strong {
  color: #409eff;
  font-size: 16px;
}

.batch-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.flow-progress {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.detail-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #303133;
}

.batch-progress-content {
  padding: 20px;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-item.success .value {
  color: #67c23a;
}

.stat-item.error .value {
  color: #f56c6c;
}

.error-list {
  margin-top: 16px;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #f56c6c;
  font-size: 13px;
}

.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 200px;
}

.guide-item {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.guide-item h3 {
  margin-top: 0;
  color: #303133;
}

.guide-item ul {
  padding-left: 20px;
}

.guide-item li {
  margin: 8px 0;
  color: #606266;
}

.guide-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 4px;
  color: #e6a23c;
}

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
