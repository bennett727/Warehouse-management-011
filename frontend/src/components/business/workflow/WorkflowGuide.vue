<template>
  <div class="workflow-guide">
    <!-- 工作流引导对话框 -->
    <el-dialog
      v-model="visible"
      :title="title"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      class="workflow-guide-dialog"
    >
      <!-- 步骤条 -->
      <div class="workflow-steps">
        <el-steps :active="currentStep" finish-status="success" simple>
          <el-step v-for="(step, index) in steps" :key="index" :title="step.title" :description="step.description" />
        </el-steps>
      </div>

      <!-- 当前步骤内容 -->
      <div class="workflow-content">
        <div v-if="currentStepData" class="step-container">
          <!-- 步骤标题和说明 -->
          <div class="step-header">
            <h3 class="step-title">{{ currentStepData.title }}</h3>
            <p class="step-description">{{ currentStepData.description }}</p>
          </div>

          <!-- 步骤表单/内容 -->
          <div class="step-body">
            <el-form
              v-if="currentStepData.form"
              ref="formRef"
              :model="formData"
              :rules="currentStepData.rules"
              label-width="120px"
              class="workflow-form"
            >
              <template v-for="field in currentStepData.form" :key="field.prop">
                <el-form-item :label="field.label" :prop="field.prop">
                  <!-- 输入框 -->
                  <el-input
                    v-if="field.type === 'input'"
                    v-model="formData[field.prop]"
                    :placeholder="field.placeholder"
                    :maxlength="field.maxlength"
                    :show-word-limit="field.showWordLimit"
                    clearable
                  />

                  <!-- 文本域 -->
                  <el-input
                    v-else-if="field.type === 'textarea'"
                    v-model="formData[field.prop]"
                    type="textarea"
                    :rows="field.rows || 3"
                    :placeholder="field.placeholder"
                    :maxlength="field.maxlength"
                    :show-word-limit="field.showWordLimit"
                  />

                  <!-- 数字输入 -->
                  <el-input-number
                    v-else-if="field.type === 'number'"
                    v-model="formData[field.prop]"
                    :min="field.min"
                    :max="field.max"
                    :precision="field.precision"
                    :step="field.step"
                    style="width: 100%"
                  />

                  <!-- 选择器 -->
                  <el-select
                    v-else-if="field.type === 'select'"
                    v-model="formData[field.prop]"
                    :placeholder="field.placeholder"
                    :multiple="field.multiple"
                    :filterable="field.filterable"
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="option in field.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>

                  <!-- 级联选择 -->
                  <el-cascader
                    v-else-if="field.type === 'cascader'"
                    v-model="formData[field.prop]"
                    :options="field.options"
                    :props="field.props"
                    :placeholder="field.placeholder"
                    clearable
                    style="width: 100%"
                  />

                  <!-- 行政区划选择 -->
                  <AdministrativeDivisionCascader
                    v-else-if="field.type === 'division'"
                    v-model="formData[field.prop]"
                    :placeholder="field.placeholder"
                    @change="handleDivisionChange($event, field.prop)"
                  />

                  <!-- 单选框 -->
                  <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]">
                    <el-radio v-for="option in field.options" :key="option.value" :label="option.value">
                      {{ option.label }}
                    </el-radio>
                  </el-radio-group>

                  <!-- 复选框 -->
                  <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.prop]">
                    <el-checkbox v-for="option in field.options" :key="option.value" :label="option.value">
                      {{ option.label }}
                    </el-checkbox>
                  </el-checkbox-group>

                  <!-- 开关 -->
                  <el-switch
                    v-else-if="field.type === 'switch'"
                    v-model="formData[field.prop]"
                    :active-text="field.activeText"
                    :inactive-text="field.inactiveText"
                  />

                  <!-- 日期选择 -->
                  <el-date-picker
                    v-else-if="field.type === 'date'"
                    v-model="formData[field.prop]"
                    type="date"
                    :placeholder="field.placeholder"
                    style="width: 100%"
                  />

                  <!-- 提示信息 -->
                  <div v-if="field.tip" class="field-tip">
                    <el-icon><InfoFilled /></el-icon>
                    <span>{{ field.tip }}</span>
                  </div>
                </el-form-item>
              </template>
            </el-form>

            <!-- 自定义内容插槽 -->
            <slot :name="`step-${currentStep}`" :data="currentStepData" :form="formData" />

            <!-- 步骤提示 -->
            <div v-if="currentStepData.tip" class="step-tip">
              <el-alert
                :title="currentStepData.tip.title"
                :type="currentStepData.tip.type || 'info'"
                :description="currentStepData.tip.description"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <template #footer>
        <div class="workflow-footer">
          <div class="footer-left">
            <el-button v-if="showSaveDraft" link @click="handleSaveDraft">
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
            <el-button v-if="showSkip" link @click="handleSkip"> 跳过此步骤 </el-button>
          </div>
          <div class="footer-right">
            <el-button v-if="currentStep > 0" @click="handlePrev">
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button v-if="currentStep < steps.length - 1" type="primary" :loading="loading" @click="handleNext">
              下一步
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button v-else type="success" :loading="loading" @click="handleComplete">
              <el-icon><Check /></el-icon>
              完成
            </el-button>
            <el-button v-if="showCancel" @click="handleCancel">取消</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 进度保存提示 -->
    <el-dialog v-model="restoreDialogVisible" title="恢复进度" width="400px">
      <p>检测到您有未完成的{{ title }}，是否恢复上次进度？</p>
      <template #footer>
        <el-button @click="handleStartNew">重新开始</el-button>
        <el-button type="primary" @click="handleRestore">恢复进度</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Check, Document, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';

import AdministrativeDivisionCascader from '@/components/business/selectors/AdministrativeDivisionCascader.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('WorkflowGuide');

const props = defineProps({
  // 是否显示
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 标题
  title: {
    type: String,
    default: '工作流引导',
  },
  // 步骤配置
  steps: {
    type: Array,
    required: true,
  },
  // 初始表单数据
  initialData: {
    type: Object,
    default: () => ({}),
  },
  // 存储键名（用于保存进度）
  storageKey: {
    type: String,
    default: '',
  },
  // 是否显示保存草稿按钮
  showSaveDraft: {
    type: Boolean,
    default: true,
  },
  // 是否显示跳过按钮
  showSkip: {
    type: Boolean,
    default: false,
  },
  // 是否显示取消按钮
  showCancel: {
    type: Boolean,
    default: true,
  },
  // 是否在关闭时确认
  confirmOnClose: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'step-change', 'complete', 'save-draft', 'skip', 'cancel']);

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 当前步骤
const currentStep = ref(0);

// 表单数据
const formData = ref({});

// 加载状态
const loading = ref(false);

// 表单引用
const formRef = ref(null);

// 恢复进度对话框
const restoreDialogVisible = ref(false);

// 当前步骤数据
const currentStepData = computed(() => {
  return props.steps[currentStep.value];
});

// 获取存储键
const getStorageKey = () => {
  return props.storageKey ? `workflow_${props.storageKey}` : '';
};

// 检查是否有保存的进度
const checkSavedProgress = () => {
  if (!props.storageKey) {
    return false;
  }

  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const data = JSON.parse(saved);
      return data.step > 0 || Object.keys(data.formData).length > 0;
    }
  } catch (error) {
    logger.error('检查保存的进度失败:', error);
  }
  return false;
};

// 保存进度
const saveProgress = () => {
  if (!props.storageKey) {
    return;
  }

  try {
    const data = {
      step: currentStep.value,
      formData: formData.value,
      timestamp: Date.now(),
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
    logger.debug('工作流进度已保存:', data);
  } catch (error) {
    logger.error('保存工作流进度失败:', error);
  }
};

// 恢复进度
const restoreProgress = () => {
  if (!props.storageKey) {
    return false;
  }

  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const data = JSON.parse(saved);
      currentStep.value = data.step || 0;
      formData.value = { ...props.initialData, ...data.formData };
      logger.debug('工作流进度已恢复:', data);
      return true;
    }
  } catch (error) {
    logger.error('恢复工作流进度失败:', error);
  }
  return false;
};

// 清除进度
const clearProgress = () => {
  if (!props.storageKey) {
    return;
  }

  try {
    localStorage.removeItem(getStorageKey());
    logger.debug('工作流进度已清除');
  } catch (error) {
    logger.error('清除工作流进度失败:', error);
  }
};

// 处理行政区划变化
const handleDivisionChange = (event, prop) => {
  formData.value[prop] = event.value;
  // 自动填充地址信息
  if (event.fullAddress) {
    formData.value.address = event.fullAddress;
  }
};

// 处理上一步
const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    emit('step-change', {
      step: currentStep.value,
      data: currentStepData.value,
      formData: formData.value,
    });
    saveProgress();
  }
};

// 处理下一步
const handleNext = async () => {
  // 验证当前步骤表单
  if (currentStepData.value.form && formRef.value) {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) {
      return;
    }
  }

  // 执行步骤钩子
  if (currentStepData.value.beforeNext) {
    try {
      loading.value = true;
      const result = await currentStepData.value.beforeNext(formData.value);
      if (result === false) {
        loading.value = false;
        return;
      }
    } catch (error) {
      logger.error('步骤前置钩子执行失败:', error);
      ElMessage.error(error.message || '操作失败');
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
  }

  if (currentStep.value < props.steps.length - 1) {
    currentStep.value++;
    emit('step-change', {
      step: currentStep.value,
      data: currentStepData.value,
      formData: formData.value,
    });
    saveProgress();
  }
};

// 处理完成
const handleComplete = async () => {
  // 验证最后一步表单
  if (currentStepData.value.form && formRef.value) {
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) {
      return;
    }
  }

  loading.value = true;
  try {
    emit('complete', {
      formData: formData.value,
      steps: props.steps,
    });
    clearProgress();
    visible.value = false;
    ElMessage.success('操作完成');
  } catch (error) {
    logger.error('完成工作流失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

// 处理保存草稿
const handleSaveDraft = () => {
  saveProgress();
  emit('save-draft', {
    step: currentStep.value,
    formData: formData.value,
  });
  ElMessage.success('草稿已保存');
};

// 处理跳过
const handleSkip = () => {
  if (currentStep.value < props.steps.length - 1) {
    emit('skip', {
      step: currentStep.value,
      data: currentStepData.value,
    });
    currentStep.value++;
    saveProgress();
  }
};

// 处理取消
const handleCancel = async () => {
  if (props.confirmOnClose) {
    try {
      await ElMessageBox.confirm('确定要取消吗？未保存的进度将会丢失。', '确认取消', {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning',
      });
    } catch {
      return;
    }
  }

  emit('cancel', {
    step: currentStep.value,
    formData: formData.value,
  });
  visible.value = false;
};

// 处理重新开始
const handleStartNew = () => {
  clearProgress();
  currentStep.value = 0;
  formData.value = { ...props.initialData };
  restoreDialogVisible.value = false;
  visible.value = true;
};

// 处理恢复进度
const handleRestore = () => {
  restoreProgress();
  restoreDialogVisible.value = false;
  visible.value = true;
};

// 监听显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 检查是否有保存的进度
      if (checkSavedProgress()) {
        restoreDialogVisible.value = true;
      } else {
        currentStep.value = 0;
        formData.value = { ...props.initialData };
      }
    }
  }
);

// 监听步骤变化，自动保存
watch(currentStep, () => {
  saveProgress();
});

// 监听表单变化，自动保存
watch(
  formData,
  () => {
    saveProgress();
  },
  { deep: true }
);

// 初始化
onMounted(() => {
  formData.value = { ...props.initialData };
});

// 暴露方法
defineExpose({
  currentStep,
  formData,
  saveProgress,
  restoreProgress,
  clearProgress,
  goToStep: (step) => {
    if (step >= 0 && step < props.steps.length) {
      currentStep.value = step;
    }
  },
});
</script>

<style scoped>
.workflow-guide {
  :deep(.workflow-guide-dialog) {
    .el-dialog__body {
      padding: 20px 30px;
    }
  }
}

.workflow-steps {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.workflow-content {
  min-height: 300px;
}

.step-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.step-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.step-body {
  padding: 0 10px;
}

.workflow-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.field-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;

  .el-icon {
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.step-tip {
  margin-top: 20px;
}

.workflow-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .footer-left {
    display: flex;
    gap: 12px;
  }

  .footer-right {
    display: flex;
    gap: 12px;
  }
}
</style>
