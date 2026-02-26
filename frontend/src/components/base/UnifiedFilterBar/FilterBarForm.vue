<template>
  <el-form
    ref="formRef"
    :model="localModel"
    :inline="true"
    :label-width="labelWidth"
    class="filter-bar-form"
    data-cy="filter-bar-form"
    @submit.prevent="handleSearch"
  >
    <el-row :gutter="gutter" data-cy="filter-row">
      <el-col
        v-for="field in displayFields"
        :key="field.prop"
        :xs="field.xs || 24"
        :sm="field.sm || 12"
        :md="field.md || 8"
        :lg="field.lg || 6"
        :xl="field.xl || 6"
        class="field-col"
        :data-cy="`filter-col-${field.prop}`"
      >
        <el-form-item
          :label="field.label"
          :prop="field.prop"
          class="filter-field"
          :data-cy="`filter-field-${field.prop}`"
        >
          <!-- 输入框 -->
          <template v-if="field.type === 'input'">
            <el-input
              :model-value="localModel[field.prop]"
              @update:model-value="(val) => updateFieldValue(field.prop, val)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :prefix-icon="field.prefixIcon"
              :suffix-icon="field.suffixIcon"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              :data-cy="`filter-${field.prop}-input`"
              @keyup.enter="handleFieldEnter(field)"
              @clear="handleFieldClear(field)"
            />
          </template>

          <!-- 选择框 -->
          <template v-else-if="field.type === 'select'">
            <el-select
              :model-value="localModel[field.prop]"
              @update:model-value="(val) => handleFieldChange(field, val)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :multiple="field.multiple"
              :collapse-tags="field.collapseTags"
              :filterable="field.filterable !== false"
              :remote="field.remote"
              :remote-method="field.remoteMethod"
              :loading="field.loading"
              :data-cy="`filter-${field.prop}-select`"
              @clear="handleFieldClear(field)"
              style="width: 100%"
            >
              <el-option
                v-for="option in getFieldOptions(field)"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                :disabled="option.disabled"
                :data-cy="`filter-${field.prop}-option-${option.value}`"
              />
            </el-select>
          </template>

          <!-- 日期选择器 -->
          <template v-else-if="field.type === 'date'">
            <el-date-picker
              :model-value="localModel[field.prop]"
              @update:model-value="(val) => handleFieldChange(field, val)"
              :type="field.dateType || 'date'"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :format="field.format || 'YYYY-MM-DD'"
              :value-format="field.valueFormat || 'YYYY-MM-DD'"
              :disabled-date="field.disabledDate"
              :data-cy="`filter-${field.prop}-date-picker`"
              style="width: 100%"
            />
          </template>

          <!-- 日期范围选择器 -->
          <template v-else-if="field.type === 'daterange'">
            <el-date-picker
              :model-value="localModel[field.prop]"
              @update:model-value="(val) => handleFieldChange(field, val)"
              type="daterange"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :format="field.format || 'YYYY-MM-DD'"
              :value-format="field.valueFormat || 'YYYY-MM-DD'"
              :range-separator="field.rangeSeparator || '至'"
              :disabled-date="field.disabledDate"
              :data-cy="`filter-${field.prop}-date-range-picker`"
              style="width: 100%"
            />
          </template>

          <!-- 数字输入框 -->
          <template v-else-if="field.type === 'number'">
            <el-input-number
              :model-value="localModel[field.prop]"
              @update:model-value="(val) => handleFieldChange(field, val)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :precision="field.precision"
              :controls-position="field.controlsPosition || 'right'"
              :data-cy="`filter-${field.prop}-number-input`"
              style="width: 100%"
            />
          </template>

          <!-- 级联选择器 -->
          <template v-else-if="field.type === 'cascader'">
            <el-cascader
              :model-value="localModel[field.prop]"
              @update:model-value="(val) => handleFieldChange(field, val)"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :options="getFieldOptions(field)"
              :props="field.props"
              :filterable="field.filterable !== false"
              :show-all-levels="field.showAllLevels !== false"
              :data-cy="`filter-${field.prop}-cascader`"
              style="width: 100%"
            />
          </template>

          <!-- 自定义插槽 -->
          <template v-else-if="field.type === 'slot'">
            <slot
              :name="field.prop"
              :field="field"
              :value="localModel[field.prop]"
              :update-value="(val) => updateFieldValue(field.prop, val)"
            />
          </template>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  fields: {
    type: Array,
    default: () => [],
  },
  labelWidth: {
    type: String,
    default: '90px',
  },
  gutter: {
    type: Number,
    default: 16,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  collapseThreshold: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits(['update:modelValue', 'search', 'reset', 'field-change', 'field-enter', 'field-clear']);

const formRef = ref(null);

// 本地模型，用于表单绑定
const localModel = ref({ ...props.modelValue });

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    localModel.value = { ...newVal };
  },
  { deep: true }
);

// 计算显示的字段（考虑收起状态）
const displayFields = computed(() => {
  if (!props.collapsed) {
    return props.fields;
  }
  return props.fields.slice(0, props.collapseThreshold);
});

// 获取字段选项
const getFieldOptions = (field) => {
  if (typeof field.options === 'function') {
    return field.options();
  }
  return field.options || [];
};

// 更新字段值
const updateFieldValue = (prop, value) => {
  localModel.value[prop] = value;
  emit('update:modelValue', {
    ...localModel.value,
    [prop]: value,
  });
};

// 处理字段变化
const handleFieldChange = (field, value) => {
  updateFieldValue(field.prop, value);
  emit('field-change', field, value);

  if (field.autoSearch) {
    emit('search');
  }
};

// 处理字段回车
const handleFieldEnter = (field) => {
  emit('field-enter', field);
  emit('search');
};

// 处理字段清空
const handleFieldClear = (field) => {
  emit('field-clear', field);
  if (field.autoSearch) {
    emit('search');
  }
};

// 处理搜索
const handleSearch = () => {
  emit('search');
};

// 暴露方法
defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
});
</script>

<style scoped>
.filter-bar-form {
  padding: 16px;
}

.field-col {
  margin-bottom: 8px;
}
</style>
