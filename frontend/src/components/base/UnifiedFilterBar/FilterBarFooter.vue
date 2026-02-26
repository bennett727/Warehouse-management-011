<template>
  <div class="filter-bar-footer" data-cy="filter-bar-footer">
    <div class="footer-left" data-cy="filter-bar-footer-left">
      <slot name="leftActions" />
    </div>
    <div class="footer-right" data-cy="filter-bar-footer-right">
      <el-button
        v-if="showSearch"
        type="primary"
        :icon="Search"
        :loading="loading"
        data-cy="filter-bar-search-btn"
        @click="handleSearch"
        class="search-btn"
      >
        {{ searchText }}
      </el-button>
      <el-button
        v-if="showReset"
        :icon="RefreshLeft"
        data-cy="filter-bar-reset-btn"
        @click="handleReset"
        class="reset-btn"
      >
        {{ resetText }}
      </el-button>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { RefreshLeft, Search } from '@element-plus/icons-vue';

defineProps({
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
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['search', 'reset']);

const handleSearch = () => {
  emit('search');
};

const handleReset = () => {
  emit('reset');
};
</script>

<style scoped>
.filter-bar-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-fill-color-lighter);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn {
  min-width: 80px;
}

.reset-btn {
  min-width: 80px;
}
</style>
