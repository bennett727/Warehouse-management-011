<!--
  @file: InventoryAuditDialog.vue
  @description: 库存审核对话框组件，用于处理库存审核操作
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    data-cy="inventory-audit-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" element-loading-text="正在处理..." data-cy="inventory-audit-content">
      <el-alert
        v-if="auditData && auditData.status"
        :title="getStatusTitle(auditData.status)"
        :type="getStatusAlertType(auditData.status)"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #default>
          <div>{{ getStatusDescription(auditData.status) }}</div>
        </template>
      </el-alert>

      <el-form ref="formRef" :model="auditForm" :rules="formRules" label-width="100px">
        <el-form-item label="审核结果" prop="auditResult" v-if="showAuditResult">
          <el-radio-group v-model="auditForm.auditResult" @change="handleAuditResultChange">
            <el-radio label="approved">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span style="margin-left: 4px">通过</span>
            </el-radio>
            <el-radio label="rejected">
              <el-icon color="#F56C6C"><CircleClose /></el-icon>
              <span style="margin-left: 4px">拒绝</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="auditForm.auditResult === 'rejected' && showRejectReason"
          label="拒绝原因"
          prop="rejectReason"
        >
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="showAuditRemark" label="审核备注" prop="auditRemark">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="审核人" v-if="showAuditor">
          <el-input v-model="auditForm.auditor" disabled />
        </el-form-item>

        <el-form-item label="审核时间" v-if="showAuditTime">
          <el-input v-model="auditForm.auditTime" disabled />
        </el-form-item>
      </el-form>

      <div v-if="showAuditHistory && auditHistory.length > 0" class="audit-history">
        <el-divider content-position="left">审核历史</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in auditHistory"
            :key="index"
            :timestamp="item.auditTime"
            :type="getTimelineType(item.auditResult)"
            placement="top"
          >
            <el-card>
              <div class="history-item">
                <div class="history-header">
                  <span class="history-auditor">{{ item.auditor }}</span>
                  <el-tag :type="getAuditResultTagType(item.auditResult)" size="small">
                    {{ getAuditResultText(item.auditResult) }}
                  </el-tag>
                </div>
                <div v-if="item.rejectReason" class="history-reason">
                  <span class="reason-label">拒绝原因：</span>
                  <span class="reason-content">{{ item.rejectReason }}</span>
                </div>
                <div v-if="item.auditRemark" class="history-remark">
                  <span class="remark-label">审核备注：</span>
                  <span class="remark-content">{{ item.auditRemark }}</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="submitLoading">
          <el-icon><Close /></el-icon>
          取消
        </el-button>
        <el-button v-if="showApproveButton" type="success" @click="handleApprove" :loading="submitLoading">
          <el-icon><CircleCheck /></el-icon>
          审核通过
        </el-button>
        <el-button v-if="showRejectButton" type="danger" @click="handleReject" :loading="submitLoading">
          <el-icon><CircleClose /></el-icon>
          审核拒绝
        </el-button>
        <el-button v-if="showSubmitButton" type="primary" @click="handleSubmit" :loading="submitLoading">
          <el-icon><Check /></el-icon>
          提交审核
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Check, CircleCheck, CircleClose, Close } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

import { createLogger } from '@/utils/logger.js';

const logger = createLogger('InventoryAuditDialog');

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '审核',
  },
  auditData: {
    type: Object,
    default: null,
  },
  auditHistory: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLoading: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '90%',
  },
  maxWidth: {
    type: String,
    default: '800px',
  },
  showAuditResult: {
    type: Boolean,
    default: true,
  },
  showRejectReason: {
    type: Boolean,
    default: true,
  },
  showAuditRemark: {
    type: Boolean,
    default: true,
  },
  showAuditor: {
    type: Boolean,
    default: true,
  },
  showAuditTime: {
    type: Boolean,
    default: true,
  },
  showAuditHistory: {
    type: Boolean,
    default: true,
  },
  showApproveButton: {
    type: Boolean,
    default: true,
  },
  showRejectButton: {
    type: Boolean,
    default: true,
  },
  showSubmitButton: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'approve', 'reject', 'submit', 'close']);

const formRef = ref(null);

const auditForm = ref({
  auditResult: 'approved',
  rejectReason: '',
  auditRemark: '',
  auditor: '',
  auditTime: '',
});

const formRules = computed(() => {
  const rules = {
    auditResult: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  };

  if (auditForm.value.auditResult === 'rejected' && props.showRejectReason) {
    rules.rejectReason = [
      { required: true, message: '请输入拒绝原因', trigger: 'blur' },
      { min: 5, max: 500, message: '拒绝原因长度在5-500个字符', trigger: 'blur' },
    ];
  }

  return rules;
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const dialogTitle = computed(() => {
  return props.title;
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initAuditForm();
    }
  }
);

const initAuditForm = () => {
  auditForm.value = {
    auditResult: 'approved',
    rejectReason: '',
    auditRemark: '',
    auditor: props.auditData?.auditor || '',
    auditTime: props.auditData?.auditTime || '',
  };
};

const handleAuditResultChange = (value) => {
  if (value === 'rejected') {
    formRef.value?.validateField('rejectReason');
  }
};

const handleApprove = async () => {
  auditForm.value.auditResult = 'approved';
  if (!formRef.value) {
    return;
  }

  try {
    await formRef.value.validate();
    emit('approve', {
      ...auditForm.value,
      ...props.auditData,
    });
  } catch (error) {
    logger.error('表单验证失败:', error);
  }
};

const handleReject = async () => {
  auditForm.value.auditResult = 'rejected';
  if (!formRef.value) {
    return;
  }

  try {
    await formRef.value.validate();
    emit('reject', {
      ...auditForm.value,
      ...props.auditData,
    });
  } catch (error) {
    logger.error('表单验证失败:', error);
  }
};

const handleSubmit = async () => {
  if (!formRef.value) {
    return;
  }

  try {
    await formRef.value.validate();
    emit('submit', {
      ...auditForm.value,
      ...props.auditData,
    });
  } catch (error) {
    logger.error('表单验证失败:', error);
  }
};

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

const getStatusTitle = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '审核通过',
    rejected: '审核拒绝',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || '未知状态';
};

const getStatusAlertType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'success',
    cancelled: 'info',
  };
  return statusMap[status] || 'info';
};

const getStatusDescription = (status) => {
  const statusMap = {
    pending: '该记录正在等待审核，请及时处理',
    approved: '该记录已通过审核',
    rejected: '该记录已被拒绝，请查看拒绝原因',
    completed: '该记录已完成',
    cancelled: '该记录已取消',
  };
  return statusMap[status] || '';
};

const getTimelineType = (auditResult) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
  };
  return typeMap[auditResult] || 'primary';
};

const getAuditResultTagType = (auditResult) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
  };
  return typeMap[auditResult] || 'info';
};

const getAuditResultText = (auditResult) => {
  const textMap = {
    approved: '通过',
    rejected: '拒绝',
    pending: '待审核',
  };
  return textMap[auditResult] || auditResult;
};

defineExpose({
  formRef,
  resetForm: initAuditForm,
});
</script>

<style scoped>
.audit-history {
  margin-top: 20px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-auditor {
  font-weight: 500;
  color: #303133;
}

.history-reason,
.history-remark {
  display: flex;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.reason-label,
.remark-label {
  font-weight: 500;
  color: #303133;
}

.reason-content,
.remark-content {
  flex: 1;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
