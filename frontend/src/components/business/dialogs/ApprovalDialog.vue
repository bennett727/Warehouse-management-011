<!--
  @file: ApprovalDialog.vue
  @description: 审批对话框组件 - 用于业务审批操作
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    class="approval-dialog"
  >
    <div class="approval-content">
      <div class="business-info" v-if="business">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="业务编号">{{ business.businessNo }}</el-descriptions-item>
          <el-descriptions-item label="业务类型">
            <el-tag :type="getBusinessTypeTag(business.businessType)" size="small">
              {{ getBusinessTypeText(business.businessType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">{{ business.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ business.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="当前状态" :span="2">
            <el-tag :type="getStatusTagType(business.status)" size="small">
              {{ getStatusText(business.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="审批结果" prop="result">
          <el-radio-group v-model="formData.result">
            <el-radio value="approve">
              <el-icon style="color: #67c23a"><CircleCheck /></el-icon>
              通过
            </el-radio>
            <el-radio value="reject">
              <el-icon style="color: #f56c6c"><CircleClose /></el-icon>
              驳回
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="formData.comment"
            type="textarea"
            :rows="4"
            :placeholder="formData.result === 'reject' ? '请填写驳回原因（必填）' : '审批意见（选填）'"
            :maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          :type="formData.result === 'approve' ? 'success' : 'danger'"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ formData.result === 'approve' ? '确认通过' : '确认驳回' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  business: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'approve',
    validator: (val) => ['approve', 'reject', 'both'].includes(val),
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const dialogTitle = computed(() => {
  if (props.mode === 'approve') {
    return '审批通过';
  }
  if (props.mode === 'reject') {
    return '审批驳回';
  }
  return '审批处理';
});

const loading = ref(false);
const formRef = ref(null);

const formData = reactive({
  result: 'approve',
  comment: '',
});

const formRules = {
  result: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  comment: [
    {
      validator: (rule, value, callback) => {
        if (formData.result === 'reject' && !value?.trim()) {
          callback(new Error('驳回时必须填写驳回原因'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const BUSINESS_TYPE_MAP = {
  outbound: { text: '出库', type: 'primary' },
  inbound: { text: '入库', type: 'success' },
  transfer: { text: '调拨', type: 'warning' },
  installation: { text: '安装', type: 'info' },
  repair: { text: '维修', type: 'warning' },
  scrap: { text: '报废', type: 'danger' },
};

const STATUS_MAP = {
  draft: { text: '草稿', type: 'info' },
  pending: { text: '待审批', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  executing: { text: '执行中', type: 'primary' },
  completed: { text: '已完成', type: 'success' },
};

const getBusinessTypeText = (type) => BUSINESS_TYPE_MAP[type]?.text || type;
const getBusinessTypeTag = (type) => BUSINESS_TYPE_MAP[type]?.type || 'info';
const getStatusText = (status) => STATUS_MAP[status]?.text || status;
const getStatusTagType = (status) => STATUS_MAP[status]?.type || 'info';

watch(visible, (val) => {
  if (val) {
    formData.result = props.mode === 'reject' ? 'reject' : 'approve';
    formData.comment = '';
  }
});

const handleCancel = () => {
  visible.value = false;
};

const handleConfirm = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;
    emit('confirm', {
      result: formData.result,
      comment: formData.comment,
      business: props.business,
    });
    visible.value = false;
  } catch (error) {
    ElMessage.warning('请完善审批信息');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.approval-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.business-info {
  margin-bottom: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
