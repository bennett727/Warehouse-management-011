<template>
  <div class="unified-filter-bar" :class="{ 'is-collapsed': isCollapsed }">
    <el-card class="filter-card" :shadow="shadow" :body-style="{ padding: 0 }">
      <!-- 头部区域 -->
      <FilterBarHeader
        v-if="showHeader"
        :title="headerTitle"
        :icon="headerIcon"
        :show-result-count="showResultCount"
        :total="total"
        :show-collapse="showCollapse"
        :collapsible="fields.length > collapseThreshold"
        :collapsed="isCollapsed"
        @collapse="toggleCollapse"
      >
        <template #headerActions>
          <slot name="headerActions" />
        </template>
      </FilterBarHeader>

      <!-- 表单区域 -->
      <FilterBarForm
        ref="formRef"
        :model-value="modelValue"
        :fields="fields"
        :label-width="labelWidth"
        :gutter="gutter"
        :collapsed="isCollapsed"
        :collapse-threshold="collapseThreshold"
        @update:model-value="handleModelUpdate"
        @search="handleSearch"
        @field-change="handleFieldChange"
        @field-enter="handleFieldEnter"
        @field-clear="handleFieldClear"
      >
        <template v-for="slot in fieldSlots" :key="slot" #[slot]="slotProps">
          <slot :name="slot" v-bind="slotProps" />
        </template>
      </FilterBarForm>

      <!-- 底部区域 -->
      <FilterBarFooter
        :show-search="showSearch"
        :show-reset="showReset"
        :search-text="searchText"
        :reset-text="resetText"
        :loading="loading"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #leftActions>
          <slot name="leftActions" />
        </template>
        <template #actions>
          <slot name="actions" />
        </template>
      </FilterBarFooter>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, useSlots } from 'vue';

import FilterBarFooter from './FilterBarFooter.vue';
import FilterBarForm from './FilterBarForm.vue';
import FilterBarHeader from './FilterBarHeader.vue';

const props = defineProps({
  // v-model 绑定值
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  // 字段配置
  fields: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every((field) => field.prop && field.label && field.type);
    },
  },
  // 布局配置
  labelWidth: {
    type: String,
    default: '90px',
  },
  gutter: {
    type: Number,
    default: 16,
  },
  // 卡片配置
  shadow: {
    type: String,
    default: 'never',
  },
  // 头部配置
  showHeader: {
    type: Boolean,
    default: true,
  },
  headerTitle: {
    type: String,
    default: '筛选条件',
  },
  headerIcon: {
    type: [String, Object],
    default: null,
  },
  showResultCount: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  // 展开/收起配置
  showCollapse: {
    type: Boolean,
    default: true,
  },
  collapseThreshold: {
    type: Number,
    default: 4,
  },
  defaultCollapsed: {
    type: Boolean,
    default: false,
  },
  // 按钮配置
  showSearch: {
    type: Boolean,
    default: true,
  },
  showReset: {
    type: Boolean,
    default: true,
  },
  searchText: {
    type: String,
    default: '查询',
  },
  resetText: {
    type: String,
    default: '重置',
  },
  // 状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 自动搜索
  autoSearch: {
    type: Boolean,
    default: false,
  },
  // 防抖时间
  debounceTime: {
    type: Number,
    default: 300,
  },
});

const emit = defineEmits(['update:modelValue', 'search', 'reset', 'field-change', 'field-enter', 'field-clear']);

const slots = useSlots();
const formRef = ref(null);

// 收起状态
const isCollapsed = ref(props.defaultCollapsed);

// 获取字段插槽
const fieldSlots = computed(() => {
  const slotNames = Object.keys(slots);
  return slotNames.filter((name) => name !== 'headerActions' && name !== 'leftActions' && name !== 'actions');
});

// 切换收起状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 处理模型更新
const handleModelUpdate = (value) => {
  emit('update:modelValue', value);
};

// 处理搜索
let searchTimer = null;
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    emit('search');
  }, props.debounceTime);
};

// 处理重置
const handleReset = () => {
  // 重置表单字段
  const resetData = {};
  props.fields.forEach((field) => {
    if (field.type === 'daterange' || field.multiple) {
      resetData[field.prop] = [];
    } else {
      resetData[field.prop] = '';
    }
  });

  emit('update:modelValue', resetData);
  emit('reset');

  // 如果配置了自动搜索，重置后自动触发搜索
  if (props.autoSearch) {
    handleSearch();
  }
};

// 处理字段变化
const handleFieldChange = (field, value) => {
  emit('field-change', field, value);

  if (field.autoSearch || props.autoSearch) {
    handleSearch();
  }
};

// 处理字段回车
const handleFieldEnter = (field) => {
  emit('field-enter', field);
};

// 处理字段清空
const handleFieldClear = (field) => {
  emit('field-clear', field);
};

// 暴露方法
defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  toggleCollapse,
  isCollapsed: () => isCollapsed.value,
});
</script>

<style scoped>
.unified-filter-bar {
  width: 100%;
  margin-bottom: 16px;
}

.filter-card {
  border-radius: 8px;
}

.filter-card :deep(.el-card__header) {
  padding: 0;
  border-bottom: none;
}

.is-collapsed .filter-card {
  overflow: hidden;
}
</style>
