<template>
  <div class="filter-bar-header" data-cy="filter-bar-header">
    <div class="header-left">
      <el-icon v-if="icon" class="header-icon">
        <component :is="icon" />
      </el-icon>
      <span class="header-title" data-cy="filter-bar-title">{{ title }}</span>
      <el-tag
        v-if="showResultCount && total > 0"
        type="info"
        size="small"
        class="result-count"
        data-cy="filter-bar-result-count"
      >
        共 {{ total }} 条
      </el-tag>
    </div>
    <div class="header-right">
      <slot name="headerActions" />
      <el-button
        v-if="showCollapse && collapsible"
        link
        type="primary"
        class="collapse-btn"
        data-cy="filter-bar-collapse-btn"
        @click="handleCollapse"
      >
        <el-icon class="collapse-icon" :class="{ 'is-collapsed': collapsed }">
          <ArrowDown />
        </el-icon>
        {{ collapsed ? '展开' : '收起' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue';

defineProps({
  title: {
    type: String,
    default: '筛选条件',
  },
  icon: {
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
  showCollapse: {
    type: Boolean,
    default: true,
  },
  collapsible: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['collapse']);

const handleCollapse = () => {
  emit('collapse');
};
</script>

<style scoped>
.filter-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.result-count {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}
</style>
