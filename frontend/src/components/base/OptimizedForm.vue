<!--
  @file: OptimizedForm.vue
  @description: 优化表单组件，提供高性能的表单渲染和验证功能
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div class="form-container" :class="{ compact: compact, inline: inline }">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :size="size"
      :disabled="disabled"
      :validate-on-rule-change="validateOnRuleChange"
      :hide-required-asterisk="hideRequiredAsterisk"
      :show-message="showMessage"
      :inline-message="inlineMessage"
      :status-icon="statusIcon"
      @validate="handleValidate"
      data-cy="optimized-form"
    >
      <slot></slot>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  rules: {
    type: Object,
    default: () => ({}),
  },
  labelWidth: {
    type: String,
    default: '120px',
  },
  labelPosition: {
    type: String,
    default: 'right',
  },
  size: {
    type: String,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  validateOnRuleChange: {
    type: Boolean,
    default: true,
  },
  hideRequiredAsterisk: {
    type: Boolean,
    default: false,
  },
  showMessage: {
    type: Boolean,
    default: true,
  },
  inlineMessage: {
    type: Boolean,
    default: false,
  },
  statusIcon: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'validate']);

const formRef = ref(null);
const formData = ref(props.modelValue);
const formRules = ref(props.rules);

watch(
  () => props.modelValue,
  (newVal) => {
    formData.value = newVal;
  },
  { deep: true }
);

watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

watch(
  () => props.rules,
  (newVal) => {
    formRules.value = newVal;
  },
  { deep: true }
);

const handleValidate = (valid, fields) => {
  emit('validate', valid, fields);
};

const validate = (callback) => {
  return formRef.value?.validate(callback);
};

const validateField = (prop, callback) => {
  return formRef.value?.validateField(prop, callback);
};

const resetFields = () => {
  formRef.value?.resetFields();
};

const clearValidate = (props) => {
  formRef.value?.clearValidate(props);
};

const scrollToField = (prop) => {
  formRef.value?.scrollToField(prop);
};

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
});
</script>

<style scoped>
.form-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-container.compact {
  padding: 16px;
}

.form-container.inline {
  padding: 12px;
}

.form-container :deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-container :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-container :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
}

.form-container :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.form-container :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-container :deep(.el-select:hover .el-input__wrapper) {
  border-color: #3b82f6;
}

.form-container :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-container :deep(.el-textarea__inner:hover) {
  border-color: #3b82f6;
}

.form-container :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-container :deep(.el-form-item__error) {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .form-container {
    padding: 16px;
  }

  .form-container :deep(.el-form-item__label) {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 12px;
  }

  .form-container :deep(.el-form-item) {
    flex-direction: column;
  }

  .form-container :deep(.el-form-item__label) {
    text-align: left;
    margin-bottom: 8px;
  }
}
</style>
