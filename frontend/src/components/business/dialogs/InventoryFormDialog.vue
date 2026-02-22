<!--
  @file: InventoryFormDialog.vue
  @description: 库存表单对话框组件 - 美化版，用于新增和编辑库存信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :icon="formIcon"
    :size="dialogSize"
    :show-form="true"
    :form-model="localFormData"
    :form-rules="formRules"
    :label-width="responsiveLabelWidth"
    label-position="top"
    :confirm-text="submitText"
    :confirm-loading="submitLoading"
    :confirm-icon="Check"
    :before-close="handleBeforeClose"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <div class="form-grid">
        <template v-for="field in formFields" :key="field.prop">
          <div
            class="form-field-wrapper"
            :class="[`form-field--${field.type}`, { 'form-field--full': field.fullWidth }]"
          >
            <el-form-item :label="field.label" :prop="field.prop" :class="{ 'is-required': field.required }">
              <!-- 文本输入 -->
              <el-input
                v-if="field.type === 'input'"
                v-model="localFormData[field.prop]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled || loading"
                :type="field.inputType || 'text'"
                :rows="field.rows || 1"
                :maxlength="field.maxlength"
                :show-word-limit="field.showWordLimit"
                :prefix-icon="field.prefixIcon"
                :suffix-icon="field.suffixIcon"
                @blur="handleFieldBlur(field.prop, $event)"
                class="form-input"
              >
                <template v-if="field.prefix" #prefix>
                  <el-icon><component :is="field.prefix" /></el-icon>
                </template>
                <template v-if="field.suffix" #suffix>
                  <span class="input-suffix">{{ field.suffix }}</span>
                </template>
              </el-input>

              <!-- 数字输入 -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="localFormData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max ?? 999999"
                :precision="field.precision ?? 0"
                :step="field.step ?? 1"
                :disabled="field.disabled || loading"
                :controls-position="field.controlsPosition || 'right'"
                class="form-input-number"
              />

              <!-- 下拉选择 -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="localFormData[field.prop]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled || loading"
                :clearable="field.clearable !== false"
                :filterable="field.filterable"
                :multiple="field.multiple"
                :collapse-tags="field.collapseTags"
                class="form-select"
                @change="handleFieldChange(field.prop, $event)"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                >
                  <div class="select-option">
                    <span>{{ option.label }}</span>
                    <span v-if="option.extra" class="select-option__extra">{{ option.extra }}</span>
                  </div>
                </el-option>
              </el-select>

              <!-- 级联选择 -->
              <el-cascader
                v-else-if="field.type === 'cascader'"
                v-model="localFormData[field.prop]"
                :options="field.options"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled || loading"
                :clearable="field.clearable !== false"
                :filterable="field.filterable"
                :props="field.props"
                class="form-cascader"
                @change="handleFieldChange(field.prop, $event)"
              />

              <!-- 日期选择 -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="localFormData[field.prop]"
                :type="field.dateType || 'date'"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled || loading"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                :format="field.format"
                :shortcuts="field.shortcuts"
                class="form-date-picker"
              />

              <!-- 日期范围 -->
              <el-date-picker
                v-else-if="field.type === 'daterange'"
                v-model="localFormData[field.prop]"
                type="daterange"
                :start-placeholder="field.startPlaceholder || '开始日期'"
                :end-placeholder="field.endPlaceholder || '结束日期'"
                :disabled="field.disabled || loading"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                :shortcuts="field.shortcuts"
                class="form-date-range"
              />

              <!-- 单选框组 -->
              <el-radio-group
                v-else-if="field.type === 'radio'"
                v-model="localFormData[field.prop]"
                :disabled="field.disabled || loading"
                class="form-radio-group"
                @change="handleFieldChange(field.prop, $event)"
              >
                <el-radio
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.value"
                  :border="field.border"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>

              <!-- 复选框组 -->
              <el-checkbox-group
                v-else-if="field.type === 'checkbox'"
                v-model="localFormData[field.prop]"
                :disabled="field.disabled || loading"
                class="form-checkbox-group"
                @change="handleFieldChange(field.prop, $event)"
              >
                <el-checkbox
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.value"
                  :border="field.border"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>

              <!-- 开关 -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="localFormData[field.prop]"
                :disabled="field.disabled || loading"
                :active-text="field.activeText"
                :inactive-text="field.inactiveText"
                class="form-switch"
                @change="handleFieldChange(field.prop, $event)"
              />

              <!-- 滑块 -->
              <el-slider
                v-else-if="field.type === 'slider'"
                v-model="localFormData[field.prop]"
                :min="field.min ?? 0"
                :max="field.max ?? 100"
                :step="field.step ?? 1"
                :disabled="field.disabled || loading"
                :show-input="field.showInput"
                :marks="field.marks"
                class="form-slider"
              />

              <!-- 文本域 -->
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="localFormData[field.prop]"
                type="textarea"
                :rows="field.rows || 3"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled || loading"
                :maxlength="field.maxlength"
                :show-word-limit="field.showWordLimit"
                class="form-textarea"
              />

              <!-- 文件上传 -->
              <el-upload
                v-else-if="field.type === 'upload'"
                v-model:file-list="localFormData[field.prop]"
                :action="field.action"
                :multiple="field.multiple"
                :limit="field.limit"
                :accept="field.accept"
                :disabled="field.disabled || loading"
                class="form-upload"
                :class="{ 'upload--drag': field.drag }"
              >
                <template v-if="field.drag">
                  <el-icon :size="48"><UploadFilled /></el-icon>
                  <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
                </template>
                <el-button v-else type="primary">
                  <el-icon><UploadFilled /></el-icon>
                  点击上传
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">{{ field.tip }}</div>
                </template>
              </el-upload>

              <!-- 图片上传 -->
              <el-upload
                v-else-if="field.type === 'image'"
                v-model:file-list="localFormData[field.prop]"
                :action="field.action"
                list-type="picture-card"
                :multiple="field.multiple"
                :limit="field.limit"
                :disabled="field.disabled || loading"
                class="form-image-upload"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>

              <!-- 纯文本展示 -->
              <div v-else-if="field.type === 'text'" class="form-text">
                {{ localFormData[field.prop] || field.defaultText || '-' }}
              </div>

              <!-- 自定义插槽 -->
              <slot
                v-else-if="field.type === 'custom'"
                :name="`field-${field.prop}`"
                :field="field"
                :value="localFormData[field.prop]"
                :disabled="field.disabled || loading"
              />
            </el-form-item>
          </div>
        </template>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup>
import { Check, Plus, UploadFilled } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

import BaseDialog from '@/components/base/BaseDialog.vue';
import { getWindowWidth } from '@/utils/helpers.js';
// import { createLogger } from '@/utils/logger.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit', 'view'].includes(value),
  },
  inventoryData: {
    type: Object,
    default: () => ({}),
  },
  formFields: {
    type: Array,
    default: () => [],
  },
  formRules: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'field-change', 'field-blur']);

// const logger = createLogger('InventoryFormDialog');

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 表单数据
const localFormData = ref({});

// 对话框标题
const dialogTitle = computed(() => {
  const titles = {
    add: '新增库存',
    edit: '编辑库存',
    view: '查看库存',
  };
  return titles[props.mode] || '库存信息';
});

// 表单图标
const formIcon = computed(() => {
  const icons = {
    add: 'Plus',
    edit: 'Edit',
    view: 'View',
  };
  return icons[props.mode] || 'Document';
});

// 提交按钮文本
const submitText = computed(() => {
  const texts = {
    add: '创建',
    edit: '保存',
    view: '确定',
  };
  return texts[props.mode] || '确定';
});

// 对话框尺寸
const dialogSize = computed(() => {
  return getWindowWidth() < 768 ? 'fullscreen' : 'large';
});

// 响应式标签宽度
const responsiveLabelWidth = computed(() => {
  return getWindowWidth() < 768 ? 'auto' : '100px';
});

// 初始化表单数据
const initFormData = () => {
  const data = {};
  props.formFields.forEach((field) => {
    if (field.prop) {
      data[field.prop] = props.inventoryData[field.prop] ?? field.defaultValue ?? '';
    }
  });
  localFormData.value = data;
};

// 监听数据变化
watch(
  () => props.inventoryData,
  () => {
    initFormData();
  },
  { immediate: true, deep: true }
);

// 处理字段变化
const handleFieldChange = (prop, value) => {
  emit('field-change', prop, value, localFormData.value);
};

// 处理字段失焦
const handleFieldBlur = (prop, event) => {
  emit('field-blur', prop, event, localFormData.value);
};

// 处理提交
const handleSubmit = async () => {
  if (props.mode === 'view') {
    dialogVisible.value = false;
    return;
  }
  emit('submit', localFormData.value);
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
};

// 处理关闭前
const handleBeforeClose = (done) => {
  if (props.submitLoading) {
    return;
  }
  done();
};

// 暴露方法
defineExpose({
  getFormData: () => localFormData.value,
  setFormData: (data) => {
    localFormData.value = { ...localFormData.value, ...data };
  },
  resetForm: () => {
    initFormData();
  },
});
</script>

<style scoped>
/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-5);
}

/* 表单字段包装器 */
.form-field-wrapper {
  min-width: 0;
}

.form-field--full {
  grid-column: 1 / -1;
}

/* 输入框样式 */
.form-input :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-md);
  box-shadow: 0 0 0 1px var(--border-color) inset;
  transition: all 0.2s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-400) inset;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--primary-500) inset,
    0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-suffix {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* 数字输入框 */
.form-input-number {
  width: 100%;
}

.form-input-number :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-md);
}

/* 下拉选择 */
.form-select {
  width: 100%;
}

.form-select :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-md);
}

.select-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
}

.select-option__extra {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-left: var(--spacing-2);
}

/* 级联选择 */
.form-cascader {
  width: 100%;
}

.form-cascader :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-md);
}

/* 日期选择器 */
.form-date-picker,
.form-date-range {
  width: 100%;
}

.form-date-picker :deep(.el-input__wrapper),
.form-date-range :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-md);
}

/* 单选框组 */
.form-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.form-radio-group :deep(.el-radio) {
  margin-right: 0;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.form-radio-group :deep(.el-radio.is-bordered) {
  border-color: var(--border-color);
}

.form-radio-group :deep(.el-radio.is-bordered.is-checked) {
  border-color: var(--primary-500);
  background: rgba(59, 130, 246, 0.05);
}

/* 复选框组 */
.form-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.form-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.form-checkbox-group :deep(.el-checkbox.is-bordered) {
  border-color: var(--border-color);
}

.form-checkbox-group :deep(.el-checkbox.is-bordered.is-checked) {
  border-color: var(--primary-500);
  background: rgba(59, 130, 246, 0.05);
}

/* 开关 */
.form-switch :deep(.el-switch__core) {
  border-radius: 10px;
}

/* 滑块 */
.form-slider {
  padding: 0 var(--spacing-2);
}

.form-slider :deep(.el-slider__runway) {
  background-color: var(--slate-200);
}

.form-slider :deep(.el-slider__bar) {
  background: var(--primary-500);
}

.form-slider :deep(.el-slider__button) {
  border-color: var(--primary-500);
  box-shadow: var(--box-shadow-sm);
}

/* 文本域 */
.form-textarea :deep(.el-textarea__inner) {
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  resize: vertical;
  min-height: 80px;
}

/* 文件上传 */
.form-upload {
  width: 100%;
}

.form-upload :deep(.el-upload) {
  width: 100%;
}

.form-upload :deep(.el-upload-dragger) {
  width: 100%;
  padding: var(--spacing-6);
  border-radius: var(--border-radius-lg);
  border-color: var(--border-color);
  background: var(--slate-50);
  transition: all 0.2s ease;
}

.form-upload :deep(.el-upload-dragger:hover) {
  border-color: var(--primary-400);
  background: rgba(59, 130, 246, 0.02);
}

.form-upload :deep(.el-upload__text) {
  margin-top: var(--spacing-3);
  color: var(--text-secondary);
}

.form-upload :deep(.el-upload__text em) {
  color: var(--primary-600);
  font-style: normal;
}

.form-upload :deep(.el-upload__tip) {
  margin-top: var(--spacing-2);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

/* 图片上传 */
.form-image-upload :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius-lg);
  border-color: var(--border-color);
  background: var(--slate-50);
  transition: all 0.2s ease;
}

.form-image-upload :deep(.el-upload--picture-card:hover) {
  border-color: var(--primary-400);
  background: rgba(59, 130, 246, 0.02);
}

/* 纯文本 */
.form-text {
  padding: var(--spacing-3) 0;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

/* 表单标签 */
:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  padding-bottom: var(--spacing-2);
}

:deep(.el-form-item.is-required .el-form-item__label::before) {
  color: var(--error-color);
}

/* 表单错误提示 */
:deep(.el-form-item__error) {
  padding-top: var(--spacing-1);
  font-size: var(--font-size-xs);
}

/* 响应式 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .form-field--full {
    grid-column: 1;
  }

  .form-radio-group,
  .form-checkbox-group {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .form-radio-group :deep(.el-radio),
  .form-checkbox-group :deep(.el-checkbox) {
    width: 100%;
    margin-right: 0;
  }
}

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  .form-input :deep(.el-input__wrapper),
  .form-radio-group :deep(.el-radio),
  .form-checkbox-group :deep(.el-checkbox),
  .form-upload :deep(.el-upload-dragger),
  .form-image-upload :deep(.el-upload--picture-card) {
    transition: none;
  }
}
</style>
