<template>
  <PageLayout title="设备状态变更审批" description="审批设备状态变更申请" data-cy="devicestatusapprovalpage-page">
    <template #headerActions>
      <el-button data-cy="btn-0" type="info" :icon="QuestionFilled" @click="handleShowOperationGuide">
        操作指引
      </el-button>
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading.list"
      header-title="审批筛选"
      :header-icon="WarningFilled"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card data-cy="card-1" class="table-card">
      <template #header>
        <div class="card-header">
          <span>设备状态变更审批</span>
          <div class="header-actions">
            <el-badge data-cy="badge-0" :value="pendingCount" :hidden="pendingCount === 0" class="badge">
              <el-button data-cy="btn-3" type="warning" @click="handleShowPending"
                >待审批 ({{ pendingCount }})</el-button
              >
            </el-badge>
            <el-button data-cy="btn-4" type="primary" @click="handleShowMyApprovals">我的申请</el-button>
          </div>
        </div>
      </template>

      <el-table
        data-cy="table-0"
        v-loading="loading.list"
        :data="approvalList"
        :row-key="(row) => row.id || row.approvalCode"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column data-cy="table-1" type="selection" width="55" />
        <el-table-column data-cy="table-2" prop="approvalCode" label="审批编号" width="150" />
        <el-table-column data-cy="table-3" prop="deviceCode" label="设备编号" width="120" />
        <el-table-column data-cy="table-4" prop="deviceName" label="设备名称" width="150" />
        <el-table-column data-cy="table-5" label="状态变更" width="180">
          <template #default="{ row }">
            <span>
              <el-tag data-cy="tag-0" :type="getStatusType(row.currentStatus)" size="small">
                {{ getDeviceStatusText(row.currentStatus) }}
              </el-tag>
              <el-icon data-cy="icon-0"><Right /></el-icon>
              <el-tag data-cy="tag-1" :type="getStatusType(row.targetStatus)" size="small">
                {{ getDeviceStatusText(row.targetStatus) }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column data-cy="table-6" prop="reason" label="变更原因" min-width="200" show-overflow-tooltip />
        <el-table-column data-cy="table-7" prop="applicant" label="申请人" width="100" />
        <el-table-column data-cy="table-8" prop="applyTime" label="申请时间" width="160" />
        <el-table-column data-cy="table-9" label="审批状态" width="100">
          <template #default="{ row }">
            <el-tag data-cy="tag-2" :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column data-cy="table-10" label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button data-cy="btn-5" link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
            <template v-if="row.status === 'pending'">
              <el-button data-cy="btn-6" link type="success" size="small" @click="handleApprove(row)">通过</el-button>
              <el-button data-cy="btn-7" link type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
            </template>
            <template v-if="row.status === 'pending' && row.isMyApplication">
              <el-button data-cy="btn-8" link type="warning" size="small" @click="handleCancel(row)">撤销</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          data-cy="pagination-0"
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog data-cy="dialog-0" v-model="detailDialogVisible" title="审批详情" width="900px">
      <el-descriptions data-cy="descriptions-0" v-if="approvalDetail" :column="2" border>
        <el-descriptions-item data-cy="descriptions-1" label="审批编号">{{
          approvalDetail.approvalCode
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-2" label="审批状态">
          <el-tag data-cy="tag-3" :type="getStatusType(approvalDetail.status)">
            {{ getStatusText(approvalDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-3" label="设备编号">{{
          approvalDetail.deviceCode
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-4" label="设备名称">{{
          approvalDetail.deviceName
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-5" label="当前状态">
          <el-tag data-cy="tag-4" :type="getStatusType(approvalDetail.currentStatus)" size="small">
            {{ getDeviceStatusText(approvalDetail.currentStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-6" label="目标状态">
          <el-tag data-cy="tag-5" :type="getStatusType(approvalDetail.targetStatus)" size="small">
            {{ getDeviceStatusText(approvalDetail.targetStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-7" label="变更原因" :span="2">{{
          approvalDetail.reason
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-8" label="备注" :span="2">{{
          approvalDetail.remark || '-'
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-9" label="申请人">{{
          approvalDetail.applicant
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-10" label="申请时间">{{
          approvalDetail.applyTime
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-11" v-if="approvalDetail.approver" label="审批人">{{
          approvalDetail.approver
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-12" v-if="approvalDetail.approvalTime" label="审批时间">
          {{ approvalDetail.approvalTime }}
        </el-descriptions-item>
        <el-descriptions-item
          data-cy="descriptions-13"
          v-if="approvalDetail.approvalComment"
          label="审批意见"
          :span="2"
        >
          {{ approvalDetail.approvalComment }}
        </el-descriptions-item>
        <el-descriptions-item
          data-cy="descriptions-14"
          v-if="approvalDetail.rejectionReason"
          label="拒绝原因"
          :span="2"
        >
          {{ approvalDetail.rejectionReason }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider v-if="approvalDetail">审批历史</el-divider>
      <AuditHistoryTimeline
        v-if="approvalDetail"
        :history-list="approvalHistoryList"
        :show-statistics="true"
        @export="handleExportHistory"
      />

      <template #footer>
        <el-button data-cy="btn-9" @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog data-cy="dialog-1" v-model="batchApproveDialogVisible" title="批量审批" width="500px">
      <el-form data-cy="form-6" label-width="80px">
        <el-form-item data-cy="form-7" label="审批意见">
          <el-input
            data-cy="input-2"
            v-model="batchApprovalComment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button data-cy="btn-10" @click="batchApproveDialogVisible = false">取消</el-button>
        <el-button data-cy="btn-11" type="success" :loading="loading.batch" @click="handleBatchApproveSubmit">
          批量通过
        </el-button>
        <el-button data-cy="btn-12" type="danger" :loading="loading.batch" @click="handleBatchRejectSubmit">
          批量拒绝
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      data-cy="dialog-2"
      v-model="guideDialogVisible"
      title="操作指引"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="operation-guide">
        <el-steps data-cy="steps-0" :active="currentStep" finish-status="success" align-center>
          <el-step data-cy="step-0" title="筛选查询" />
          <el-step data-cy="step-1" title="审批操作" />
          <el-step data-cy="step-2" title="批量处理" />
          <el-step data-cy="step-3" title="我的申请" />
        </el-steps>
        <div class="guide-content">
          <div v-if="currentStep === 0" class="guide-item">
            <h3>1. 筛选查询</h3>
            <p>使用筛选条件快速查找需要处理的审批记录：</p>
            <ul>
              <li><strong>审批状态</strong>：可选择"待审批"、"已通过"、"已拒绝"等状态进行筛选</li>
              <li><strong>设备编号</strong>：输入设备编号精确查找特定设备的审批记录</li>
              <li><strong>申请人</strong>：输入申请人姓名查找该用户提交的所有审批申请</li>
              <li><strong>申请时间</strong>：选择日期范围，查找指定时间段内的审批记录</li>
              <li><strong>快捷操作</strong>：点击"待审批"按钮快速查看所有待处理的审批记录</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-1"><WarningFilled /></el-icon>
              <span>提示：多个筛选条件可以组合使用，系统会同时满足所有条件的记录</span>
            </div>
          </div>

          <div v-if="currentStep === 1" class="guide-item">
            <h3>2. 审批操作</h3>
            <p>对单个审批记录进行审核操作：</p>
            <ul>
              <li><strong>查看详情</strong>：点击"详情"按钮查看完整的审批信息，包括设备信息、变更原因、备注等</li>
              <li><strong>通过审批</strong>：点击"通过"按钮批准设备状态变更申请，设备状态将变更为目标状态</li>
              <li><strong>拒绝申请</strong>：点击"拒绝"按钮驳回申请，需要填写拒绝原因说明</li>
              <li><strong>撤销申请</strong>：申请人可以撤销自己提交的待审批申请（仅限申请人操作）</li>
              <li><strong>状态标识</strong>：表格中通过不同颜色的标签标识当前状态和目标状态</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-2"><WarningFilled /></el-icon>
              <span>提示：审批通过后，设备状态将立即变更，请仔细核对信息后再操作</span>
            </div>
          </div>

          <div v-if="currentStep === 2" class="guide-item">
            <h3>3. 批量处理</h3>
            <p>提高审批效率，批量处理多个审批记录：</p>
            <ul>
              <li><strong>选择记录</strong>：勾选表格左侧的复选框，可选择多条待审批记录</li>
              <li><strong>批量审批</strong>：选中记录后，点击"批量通过"或"批量拒绝"进行批量操作</li>
              <li><strong>审批意见</strong>：批量操作时可统一填写审批意见，便于后续追溯</li>
              <li><strong>操作确认</strong>：批量操作前系统会提示确认，避免误操作</li>
              <li><strong>结果反馈</strong>：批量操作完成后，系统会显示操作结果统计信息</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-3"><WarningFilled /></el-icon>
              <span>提示：批量操作仅适用于"待审批"状态的记录，已处理的记录无法批量操作</span>
            </div>
          </div>

          <div v-if="currentStep === 3" class="guide-item">
            <h3>4. 我的申请</h3>
            <p>查看和管理自己提交的审批申请：</p>
            <ul>
              <li><strong>查看我的申请</strong>：点击"我的申请"按钮查看所有自己提交的审批记录</li>
              <li><strong>申请状态</strong>：查看申请的当前状态（待审批、已通过、已拒绝）</li>
              <li><strong>撤销申请</strong>：对于待审批的申请，可以随时撤销</li>
              <li><strong>查看审批意见</strong>：已通过或已拒绝的申请可以查看审批人的意见</li>
              <li><strong>重新申请</strong>：被拒绝的申请可以根据拒绝原因修改后重新提交</li>
            </ul>
            <div class="guide-tip">
              <el-icon data-cy="icon-4"><WarningFilled /></el-icon>
              <span>提示：建议在提交申请前仔细填写变更原因和备注，提高审批通过率</span>
            </div>
          </div>
        </div>
        <div class="guide-actions">
          <el-button data-cy="btn-13" v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
          <el-button data-cy="btn-14" v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
          <el-button data-cy="btn-15" v-if="currentStep === 3" type="success" @click="guideDialogVisible = false"
            >完成</el-button
          >
        </div>
      </div>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import { QuestionFilled, Right, WarningFilled } from '@element-plus/icons-vue';
import { computed, onMounted, ref } from 'vue';

import PageLayout from '@/components/base/PageLayout.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import AuditHistoryTimeline from '@/components/business/AuditHistoryTimeline.vue';
import { useDeviceStatusApproval } from '@/composables/useDeviceStatusApproval';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceStatusApprovalPage');

const {
  loading,
  approvalList,
  approvalDetail,
  pagination,
  queryParams,
  approvalStatusOptions,
  pendingCount,
  getStatusType,
  getStatusText,
  getDeviceStatusText,
  loadApprovalList,
  loadPendingApprovals,
  loadMyApprovals,
  loadApprovalDetail,
  handleApprove,
  handleReject,
  handleCancel,
  handleBatchApprove,
  handleBatchReject,
  resetQuery,
  handlePageChange,
  handleSizeChange,
} = useDeviceStatusApproval();

// 搜索表单（映射到 queryParams）
const searchForm = computed({
  get: () => ({
    status: queryParams.status,
    deviceCode: queryParams.deviceCode,
    applicant: queryParams.applicant,
    dateRange: dateRange.value,
  }),
  set: (val) => {
    queryParams.status = val.status;
    queryParams.deviceCode = val.deviceCode;
    queryParams.applicant = val.applicant;
    dateRange.value = val.dateRange || [];
  },
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'status',
    label: '审批状态',
    type: 'select',
    placeholder: '请选择审批状态',
    clearable: true,
    md: 6,
    lg: 6,
    options: approvalStatusOptions,
  },
  {
    prop: 'deviceCode',
    label: '设备编号',
    type: 'input',
    placeholder: '请输入设备编号',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'applicant',
    label: '申请人',
    type: 'input',
    placeholder: '请输入申请人',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'dateRange',
    label: '申请时间',
    type: 'dateRange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD',
    md: 12,
    lg: 12,
  },
]);

const dateRange = ref([]);
const selectedRows = ref([]);
const detailDialogVisible = ref(false);
const batchApproveDialogVisible = ref(false);
const batchApprovalComment = ref('');
const guideDialogVisible = ref(false);
const currentStep = ref(0);

const approvalHistoryList = ref([]);

const handleExportHistory = (historyData) => {
  logger.debug('导出审批历史', historyData);
};

const handleShowOperationGuide = () => {
  currentStep.value = 0;
  guideDialogVisible.value = true;
};

const handleSearch = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTime = dateRange.value[0];
    queryParams.endTime = dateRange.value[1];
  } else {
    queryParams.startTime = '';
    queryParams.endTime = '';
  }
  pagination.current = 1;
  loadApprovalList();
};

const handleReset = () => {
  dateRange.value = [];
  resetQuery();
  loadApprovalList();
};

const handleShowPending = () => {
  queryParams.status = 'pending';
  loadApprovalList();
};

const handleShowMyApprovals = () => {
  loadMyApprovals();
};

const handleViewDetail = async (row) => {
  await loadApprovalDetail(row.id);
  detailDialogVisible.value = true;
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const handleBatchApproveSubmit = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审批的记录');
    return;
  }

  const approvalIds = selectedRows.value.map((row) => row.id);
  const success = await handleBatchApprove(approvalIds, 'approve', batchApprovalComment.value);
  if (success) {
    batchApproveDialogVisible.value = false;
    batchApprovalComment.value = '';
  }
};

const handleBatchRejectSubmit = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审批的记录');
    return;
  }

  const approvalIds = selectedRows.value.map((row) => row.id);
  const success = await handleBatchReject(approvalIds, 'reject', batchApprovalComment.value);
  if (success) {
    batchApproveDialogVisible.value = false;
    batchApprovalComment.value = '';
  }
};

onMounted(() => {
  loadApprovalList();
  loadPendingApprovals();
});
</script>

<style scoped>
.device-status-approval-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.badge {
  margin-right: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.operation-guide {
  padding: 20px;
}

.guide-content {
  margin: 30px 0;
  min-height: 300px;
}

.guide-item h3 {
  margin-bottom: 15px;
  color: #303133;
}

.guide-item p {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}

.guide-item ul {
  margin-bottom: 20px;
  padding-left: 20px;
}

.guide-item li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.8;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f4f4f5;
  border-left: 4px solid #e6a23c;
  border-radius: 4px;
  color: #e6a23c;
}

.guide-tip .el-icon {
  font-size: 18px;
}

.guide-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
