<!--
  @file: DataTable.vue
  @description: 数据表格组件，提供统一的表格样式和功能，支持分页、选择、排序等
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
  @modifyRecords:
      2026-02-06: 集成BaseEmptyState组件，提供统一的空状态展示
-->
<template>
  <div class="data-table-container" role="region" :aria-label="ariaLabel || '数据表格'" :aria-busy="loading">
    <div v-if="showToolbar" class="table-toolbar" role="toolbar" aria-label="表格工具栏">
      <div class="toolbar-left">
        <slot name="toolbarLeft"></slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbarRight"></slot>
      </div>
    </div>

    <div class="table-wrapper" :class="{ loading: loading }">
      <BaseEmptyState
        v-if="!loading && safeRowCount === 0"
        :type="emptyStateType"
        :description="emptyText"
        :show-action="showEmptyAction"
        :action-text="emptyActionText"
        :loading="false"
        role="status"
        aria-live="polite"
        @action="handleEmptyAction"
      />
      <el-table
        v-else
        ref="tableRef"
        v-loading="loading"
        :data="safeData"
        :height="height"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :size="size"
        :fit="fit"
        :show-header="showHeader"
        :highlight-current-row="highlightCurrentRow"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        :header-cell-class-name="headerCellClassName"
        :row-style="rowStyle"
        data-cy="data-table"
        :cell-style="cellStyle"
        :header-row-style="headerRowStyle"
        :header-cell-style="headerCellStyle"
        :empty-text="emptyText"
        :default-expand-all="defaultExpandAll"
        :expand-row-keys="expandRowKeys.length > 0 ? expandRowKeys : undefined"
        :default-sort="safeDefaultSort"
        :tooltip-effect="tooltipEffect"
        :show-summary="showSummary"
        :sum-text="sumText"
        :summary-method="summaryMethod"
        :span-method="spanMethod"
        :select-on-indeterminate="selectOnIndeterminate"
        :indent="indent"
        :lazy="lazy"
        :load="load"
        :tree-props="treeProps"
        :row-key="rowKey"
        role="grid"
        :aria-label="ariaLabel || '数据表格'"
        :aria-rowcount="safeRowCount"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @cell-mouse-enter="handleCellMouseEnter"
        @cell-mouse-leave="handleCellMouseLeave"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @row-click="handleRowClick"
        @row-contextmenu="handleRowContextmenu"
        @row-dblclick="handleRowDblclick"
        @header-click="handleHeaderClick"
        @header-contextmenu="handleHeaderContextmenu"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @current-change="handleCurrentChange"
        @header-dragend="handleHeaderDragend"
        @expand-change="handleExpandChange"
      >
        <slot></slot>
      </el-table>
    </div>

    <div v-if="showPagination && pagination" class="table-pagination" role="navigation" aria-label="表格分页">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
        :total="pagination.total"
        :layout="pagination.layout || 'total, sizes, prev, pager, next, jumper'"
        :background="true"
        aria-label="分页导航"
        data-cy="data-table-pagination"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

import BaseEmptyState from './BaseEmptyState.vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  height: {
    type: [String, Number],
    default: null,
  },
  maxHeight: {
    type: [String, Number],
    default: null,
  },
  stripe: {
    type: Boolean,
    default: true,
  },
  border: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'default',
  },
  fit: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  highlightCurrentRow: {
    type: Boolean,
    default: false,
  },
  rowClassName: {
    type: [String, Function],
    default: '',
  },
  cellClassName: {
    type: [String, Function],
    default: '',
  },
  headerCellClassName: {
    type: [String, Function],
    default: '',
  },
  rowStyle: {
    type: [Object, Function],
    default: null,
  },
  cellStyle: {
    type: [Object, Function],
    default: null,
  },
  headerRowStyle: {
    type: [Object, Function],
    default: null,
  },
  headerCellStyle: {
    type: [Object, Function],
    default: null,
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  emptyStateType: {
    type: String,
    default: 'data',
  },
  showEmptyAction: {
    type: Boolean,
    default: false,
  },
  emptyActionText: {
    type: String,
    default: '刷新',
  },
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  expandRowKeys: {
    type: Array,
    default: () => [],
  },
  defaultSort: {
    type: Object,
    default: () => ({ prop: '', order: '' }),
  },
  tooltipEffect: {
    type: String,
    default: 'dark',
  },
  showSummary: {
    type: Boolean,
    default: false,
  },
  sumText: {
    type: String,
    default: '合计',
  },
  summaryMethod: {
    type: Function,
    default: null,
  },
  spanMethod: {
    type: Function,
    default: null,
  },
  selectOnIndeterminate: {
    type: Boolean,
    default: false,
  },
  indent: {
    type: Number,
    default: 16,
  },
  lazy: {
    type: Boolean,
    default: false,
  },
  load: {
    type: Function,
    default: null,
  },
  treeProps: {
    type: Object,
    default: () => ({}),
  },
  rowKey: {
    type: [String, Function],
    default: null,
  },
  showToolbar: {
    type: Boolean,
    default: false,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  pagination: {
    type: Object,
    default: null,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'select',
  'select-all',
  'selection-change',
  'cell-mouse-enter',
  'cell-mouse-leave',
  'cell-click',
  'cell-dblclick',
  'row-click',
  'row-contextmenu',
  'row-dblclick',
  'header-click',
  'header-contextmenu',
  'sort-change',
  'filter-change',
  'current-change',
  'header-dragend',
  'expand-change',
  'size-change',
  'page-change',
  'empty-action',
]);

const tableRef = ref(null);

// 安全的数据数组，确保始终是数组
const safeData = computed(() => {
  if (Array.isArray(props.data)) {
    return props.data;
  }
  return [];
});

// 安全的行数
const safeRowCount = computed(() => {
  return safeData.value.length;
});

const currentPage = computed(() => {
  return props.pagination?.page || 1;
});

const pageSize = computed(() => {
  return props.pagination?.size || 10;
});

const safeDefaultSort = computed(() => {
  return props.defaultSort || { prop: '', order: '' };
});

const handleSelect = (selection, row) => {
  emit('select', selection, row);
};

const handleSelectAll = (selection) => {
  emit('select-all', selection);
};

const handleSelectionChange = (selection) => {
  emit('selection-change', selection);
};

const handleCellMouseEnter = (row, column, cell, event) => {
  emit('cell-mouse-enter', row, column, cell, event);
};

const handleCellMouseLeave = (row, column, cell, event) => {
  emit('cell-mouse-leave', row, column, cell, event);
};

const handleCellClick = (row, column, cell, event) => {
  emit('cell-click', row, column, cell, event);
};

const handleCellDblclick = (row, column, cell, event) => {
  emit('cell-dblclick', row, column, cell, event);
};

const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event);
};

const handleRowContextmenu = (row, column, event) => {
  emit('row-contextmenu', row, column, event);
};

const handleRowDblclick = (row, column, event) => {
  emit('row-dblclick', row, column, event);
};

const handleHeaderClick = (column, event) => {
  emit('header-click', column, event);
};

const handleHeaderContextmenu = (column, event) => {
  emit('header-contextmenu', column, event);
};

const handleSortChange = (sortInfo) => {
  emit('sort-change', sortInfo);
};

const handleFilterChange = (filters) => {
  emit('filter-change', filters);
};

const handleCurrentChange = (currentRow, oldCurrentRow) => {
  emit('current-change', currentRow, oldCurrentRow);
};

const handleHeaderDragend = (newWidth, oldWidth, column, event) => {
  emit('header-dragend', newWidth, oldWidth, column, event);
};

const handleExpandChange = (row, expandedRows) => {
  emit('expand-change', row, expandedRows);
};

const handleSizeChange = (size) => {
  emit('size-change', size);
};

const handlePageChange = (page) => {
  emit('page-change', page);
};

const handleEmptyAction = () => {
  emit('empty-action');
};

const clearSelection = () => {
  tableRef.value?.clearSelection();
};

const toggleRowSelection = (row, selected) => {
  tableRef.value?.toggleRowSelection(row, selected);
};

const toggleAllSelection = () => {
  tableRef.value?.toggleAllSelection();
};

const toggleRowExpansion = (row, expanded) => {
  tableRef.value?.toggleRowExpansion(row, expanded);
};

const setCurrentRow = (row) => {
  tableRef.value?.setCurrentRow(row);
};

const clearSort = () => {
  tableRef.value?.clearSort();
};

const clearFilter = (columnKeys) => {
  tableRef.value?.clearFilter(columnKeys);
};

const doLayout = () => {
  tableRef.value?.doLayout();
};

const sort = (prop, order) => {
  tableRef.value?.sort(prop, order);
};

defineExpose({
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
  toggleRowExpansion,
  setCurrentRow,
  clearSort,
  clearFilter,
  doLayout,
  sort,
});
</script>

<style scoped>
.data-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.table-wrapper.loading {
  min-height: 400px;
}

.table-wrapper :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-wrapper :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.table-wrapper :deep(.el-table th.el-table__cell) {
  background: transparent;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.table-wrapper :deep(.el-table__body tr:hover > td) {
  cursor: pointer;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%) !important;
}

.table-wrapper :deep(.el-table__body td) {
  color: #4b5563;
  font-size: 14px;
}

.table-pagination {
  padding: 16px 20px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.table-pagination :deep(.el-pagination) {
  font-weight: 600;
}

.table-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 6px;
}

.table-pagination :deep(.el-pager li:hover) {
  background: rgba(59, 130, 246, 0.1);
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .table-pagination {
    padding: 12px 16px;
  }

  .table-pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .table-pagination :deep(.el-pagination__sizes) {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .table-toolbar {
    padding: 10px 12px;
  }

  .table-pagination {
    padding: 10px 12px;
  }
}
</style>
