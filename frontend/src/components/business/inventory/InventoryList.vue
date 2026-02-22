<!--
  @file: InventoryList.vue
  @description: 库存列表组件 - 美化版，用于展示和管理库存信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
-->
<template>
  <div class="inventory-list-container">
    <!-- 搜索区域 -->
    <div v-if="showSearch" class="search-section">
      <el-form :model="localSearchForm" :inline="true" class="search-form">
        <template v-for="field in searchFields" :key="field.prop">
          <el-form-item :label="field.label" class="search-form-item">
            <el-input
              v-if="field.type === 'input'"
              v-model="localSearchForm[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :clearable="field.clearable !== false"
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template v-if="field.prefix" #prefix>
                <el-icon><component :is="field.prefix" /></el-icon>
              </template>
            </el-input>

            <el-select
              v-else-if="field.type === 'select'"
              v-model="localSearchForm[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :filterable="field.filterable"
              class="search-select"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="localSearchForm[field.prop]"
              :type="field.dateType || 'date'"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :value-format="field.valueFormat || 'YYYY-MM-DD'"
              class="search-date"
            />

            <el-date-picker
              v-else-if="field.type === 'daterange'"
              v-model="localSearchForm[field.prop]"
              type="daterange"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              :clearable="field.clearable !== false"
              :value-format="field.valueFormat || 'YYYY-MM-DD'"
              class="search-date-range"
            />
          </el-form-item>
        </template>

        <el-form-item class="search-actions">
          <el-button type="primary" @click="handleSearch" :loading="loading" class="btn-search">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset" class="btn-reset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工具栏 -->
    <div v-if="showToolbar" class="toolbar-section">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button v-if="showAdd" type="primary" @click="handleAdd" :disabled="loading" class="btn-add">
            <el-icon><Plus /></el-icon>
            {{ addButtonText }}
          </el-button>
          <el-button
            v-if="showBatchDelete"
            type="danger"
            @click="handleBatchDelete"
            :disabled="!hasSelection || loading"
            class="btn-batch-delete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button
            v-if="showBatchExport"
            type="success"
            @click="handleBatchExport"
            :disabled="loading"
            class="btn-export"
          >
            <el-icon><Download /></el-icon>
            批量导出
          </el-button>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <el-button
            v-if="showRefresh"
            :icon="Refresh"
            @click="handleRefresh"
            :loading="loading"
            circle
            class="btn-refresh"
          />
        </slot>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        ref="tableRef"
        v-loading="loading"
        element-loading-text="正在加载数据..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
        :data="tableData"
        :height="tableHeight"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :row-key="rowKey"
        :default-sort="safeDefaultSort"
        :show-summary="showSummary"
        :summary-method="summaryMethod"
        :empty-text="emptyText"
        :header-cell-style="headerCellStyle"
        :row-class-name="rowClassName"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblclick"
        class="inventory-table"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="50"
          :selectable="selectable"
          fixed="left"
          align="center"
        />

        <el-table-column v-if="showIndex" type="index" label="序号" width="60" align="center" fixed="left">
          <template #default="scope">
            <span class="index-cell">{{ (localCurrentPage - 1) * localPageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>

        <template v-for="column in tableColumns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :align="column.align || 'center'"
            :sortable="column.sortable"
            :sort-by="column.sortBy"
            :show-overflow-tooltip="column.showOverflowTooltip !== false"
            :class-name="column.className"
          >
            <template #header>
              <div class="column-header">
                <el-icon v-if="column.icon" :size="14"><component :is="column.icon" /></el-icon>
                <span>{{ column.label }}</span>
              </div>
            </template>

            <template #default="scope">
              <slot v-if="column.slot" :name="column.slot" :row="scope?.row" :column="column" :index="scope?.$index">
                {{ scope?.row?.[column.prop] }}
              </slot>

              <template v-else-if="column.type === 'tag'">
                <el-tag
                  :type="getTagType(scope?.row?.[column.prop], column.tagTypes)"
                  size="small"
                  effect="light"
                  class="table-tag"
                >
                  {{ getTagText(scope?.row?.[column.prop], column.tagOptions) }}
                </el-tag>
              </template>

              <template v-else-if="column.type === 'status'">
                <div class="status-cell">
                  <span class="status-dot" :class="`status--${getStatusType(scope?.row?.[column.prop])}`"></span>
                  <el-tag
                    :type="getStatusTagType(scope?.row?.[column.prop])"
                    size="small"
                    effect="light"
                    class="table-tag"
                  >
                    {{ getStatusText(scope?.row?.[column.prop]) }}
                  </el-tag>
                </div>
              </template>

              <template v-else-if="column.type === 'date'">
                <span class="date-cell">{{ formatDate(scope?.row?.[column.prop], column.format) }}</span>
              </template>

              <template v-else-if="column.type === 'datetime'">
                <span class="datetime-cell">{{ formatDateTime(scope?.row?.[column.prop], column.format) }}</span>
              </template>

              <template v-else-if="column.type === 'number'">
                <span class="number-cell">{{ formatNumber(scope?.row?.[column.prop], column.precision) }}</span>
              </template>

              <template v-else-if="column.type === 'currency'">
                <span class="currency-cell">{{ formatCurrency(scope?.row?.[column.prop], column.precision) }}</span>
              </template>

              <template v-else-if="column.type === 'image'">
                <el-image
                  :src="scope?.row?.[column.prop]"
                  :preview-src-list="[scope?.row?.[column.prop]]"
                  fit="cover"
                  class="table-image"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon :size="16"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </template>

              <template v-else-if="column.type === 'progress'">
                <div class="progress-cell">
                  <el-progress
                    :percentage="scope?.row?.[column.prop]"
                    :color="column.progressColor"
                    :stroke-width="6"
                    :show-text="false"
                  />
                  <span class="progress-text">{{ scope?.row?.[column.prop] }}%</span>
                </div>
              </template>

              <template v-else>
                <span class="text-cell" :class="{ 'text-empty': !scope?.row?.[column.prop] }">
                  {{ scope?.row?.[column.prop] || '-' }}
                </span>
              </template>
            </template>
          </el-table-column>
        </template>

        <el-table-column
          v-if="showAction"
          label="操作"
          :width="actionWidth"
          :fixed="actionFixed"
          align="center"
          class-name="action-column"
        >
          <template #default="scope">
            <slot name="action" :row="scope?.row" :index="scope?.$index">
              <div class="action-buttons">
                <el-button
                  v-if="showView"
                  type="primary"
                  size="small"
                  @click="handleView(scope?.row)"
                  link
                  class="action-btn action-btn--view"
                >
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button
                  v-if="showEdit"
                  type="primary"
                  size="small"
                  @click="handleEdit(scope?.row)"
                  link
                  class="action-btn action-btn--edit"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  v-if="showDelete"
                  type="danger"
                  size="small"
                  @click="handleDelete(scope?.row)"
                  link
                  class="action-btn action-btn--delete"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </slot>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div v-if="showPagination" class="pagination-section">
      <div class="pagination-info">
        <span v-if="hasSelection" class="selection-info">
          已选择 <strong>{{ selectedRows.length }}</strong> 项
        </span>
      </div>
      <el-pagination
        :current-page="localCurrentPage"
        :page-size="localPageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="background"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="inventory-pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { Delete, Download, Edit, Picture, Plus, Refresh, RefreshLeft, Search, View } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  tableColumns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  tableHeight: {
    type: [String, Number],
    default: 'auto',
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
    default: false,
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  defaultSort: {
    type: Object,
    default: () => ({ prop: '', order: '' }),
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchFields: {
    type: Array,
    default: () => [],
  },
  searchForm: {
    type: Object,
    default: () => ({}),
  },
  showToolbar: {
    type: Boolean,
    default: true,
  },
  showAdd: {
    type: Boolean,
    default: true,
  },
  addButtonText: {
    type: String,
    default: '新增',
  },
  showBatchDelete: {
    type: Boolean,
    default: false,
  },
  showBatchExport: {
    type: Boolean,
    default: false,
  },
  showRefresh: {
    type: Boolean,
    default: true,
  },
  showSelection: {
    type: Boolean,
    default: false,
  },
  showIndex: {
    type: Boolean,
    default: true,
  },
  showAction: {
    type: Boolean,
    default: true,
  },
  showView: {
    type: Boolean,
    default: true,
  },
  showEdit: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
  actionWidth: {
    type: Number,
    default: 200,
  },
  actionFixed: {
    type: String,
    default: 'right',
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
  background: {
    type: Boolean,
    default: true,
  },
  showSummary: {
    type: Boolean,
    default: false,
  },
  summaryMethod: {
    type: Function,
    default: null,
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  selectable: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'update:searchForm',
  'search',
  'reset',
  'add',
  'batch-delete',
  'batch-export',
  'refresh',
  'selection-change',
  'sort-change',
  'row-click',
  'row-dblclick',
  'view',
  'edit',
  'delete',
]);

const tableRef = ref(null);
const selectedRows = ref([]);
const localSearchForm = ref({ ...props.searchForm });
const localCurrentPage = ref(props.currentPage);
const localPageSize = ref(props.pageSize);

const hasSelection = computed(() => selectedRows.value.length > 0);

const safeDefaultSort = computed(() => {
  return props.defaultSort || { prop: '', order: '' };
});

const headerCellStyle = () => {
  return {
    background: '#f8fafc',
    color: '#475569',
    fontWeight: 600,
    fontSize: '13px',
  };
};

const rowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'row-even' : 'row-odd';
};

watch(
  () => props.searchForm,
  (newVal) => {
    localSearchForm.value = { ...newVal };
  },
  { deep: true }
);

watch(
  () => props.currentPage,
  (newVal) => {
    localCurrentPage.value = newVal;
  }
);

watch(
  () => props.pageSize,
  (newVal) => {
    localPageSize.value = newVal;
  }
);

const handleSearch = () => {
  emit('search', localSearchForm.value);
};

const handleReset = () => {
  Object.keys(localSearchForm.value).forEach((key) => {
    localSearchForm.value[key] = '';
  });
  emit('update:searchForm', localSearchForm.value);
  emit('reset');
  emit('search', localSearchForm.value);
};

const handleAdd = () => {
  emit('add');
};

const handleBatchDelete = () => {
  emit('batch-delete', selectedRows.value);
};

const handleBatchExport = () => {
  emit('batch-export');
};

const handleRefresh = () => {
  emit('refresh');
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
  emit('selection-change', selection);
};

const handleSortChange = ({ prop, order }) => {
  emit('sort-change', { prop, order });
};

const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event);
};

const handleRowDblclick = (row, column, event) => {
  emit('row-dblclick', row, column, event);
};

const handleView = (row) => {
  emit('view', row);
};

const handleEdit = (row) => {
  emit('edit', row);
};

const handleDelete = (row) => {
  emit('delete', row);
};

const handleSizeChange = (size) => {
  localPageSize.value = size;
  emit('update:pageSize', size);
  emit('search', localSearchForm.value);
};

const handleCurrentChange = (page) => {
  localCurrentPage.value = page;
  emit('update:currentPage', page);
  emit('search', localSearchForm.value);
};

const getTagType = (value, tagTypes) => {
  if (!tagTypes || !tagTypes[value]) {
    return '';
  }
  return tagTypes[value];
};

const getTagText = (value, tagOptions) => {
  if (!tagOptions) {
    return value;
  }
  const option = tagOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
};

const getStatusType = (status) => {
  const statusMap = {
    normal: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
  };
  return statusMap[status] || 'info';
};

const getStatusTagType = (status) => {
  const statusMap = {
    normal: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
  };
  return statusMap[status] || 'info';
};

const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    warning: '预警',
    danger: '告警',
    info: '未知',
  };
  return statusMap[status] || status;
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }
  return value;
};

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }
  return value;
};

const formatNumber = (value, precision = 2) => {
  if (value === null || value === undefined) {
    return '';
  }
  return Number(value).toFixed(precision);
};

const formatCurrency = (value, precision = 2) => {
  if (value === null || value === undefined) {
    return '';
  }
  return `¥${Number(value).toFixed(precision)}`;
};

defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
});
</script>

<style scoped>
.inventory-list-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

/* 搜索区域 */
.search-section {
  background: var(--bg-color-light);
  padding: var(--spacing-5);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.search-form {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  align-items: flex-end;
}

.search-form-item {
  margin: 0;
}

.search-form-item :deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  padding-bottom: var(--spacing-2);
}

.search-input,
.search-select {
  width: 200px;
}

.search-date {
  width: 180px;
}

.search-date-range {
  width: 280px;
}

.search-actions {
  margin-left: auto;
}

.btn-search {
  background: var(--primary-600);
  border: none;
}

.btn-search:hover {
  background: var(--primary-700);
  box-shadow: var(--box-shadow-glow);
}

/* 工具栏 */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-color-light);
  padding: var(--spacing-4) var(--spacing-5);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.toolbar-left {
  display: flex;
  gap: var(--spacing-3);
}

.toolbar-right {
  display: flex;
  gap: var(--spacing-3);
}

.btn-add {
  background: var(--primary-600);
  border: none;
}

.btn-add:hover {
  background: var(--primary-700);
  box-shadow: var(--box-shadow-glow);
}

.btn-batch-delete:hover {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.btn-export {
  background: var(--success-600);
  border: none;
}

.btn-export:hover {
  background: var(--success-700);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-refresh {
  transition: var(--transition-base);
}

.btn-refresh:hover {
  transform: rotate(180deg);
}

/* 表格区域 */
.table-section {
  background: var(--bg-color-light);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.inventory-table {
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f1f5f9;
}

.inventory-table :deep(.el-table__header-wrapper) {
  border-bottom: 1px solid var(--border-color);
}

.inventory-table :deep(.el-table__header th) {
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-4) var(--spacing-3);
}

.inventory-table :deep(.el-table__row) {
  transition: var(--transition-fast);
}

.inventory-table :deep(.el-table__row:hover) {
  background: var(--primary-50) !important;
}

.inventory-table :deep(.el-table__row.row-even) {
  background: #fafafa;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
}

.index-cell {
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

/* 状态单元格 */
.status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status--success {
  background: var(--success-color);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status--warning {
  background: var(--warning-color);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

.status--danger {
  background: var(--error-color);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status--info {
  background: var(--info-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.table-tag {
  font-weight: var(--font-weight-medium);
}

/* 数字和货币 */
.number-cell,
.currency-cell {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
}

.currency-cell {
  color: var(--success-color);
}

/* 日期 */
.date-cell,
.datetime-cell {
  font-family: var(--font-family-mono);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* 图片 */
.table-image {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition-fast);
}

.table-image:hover {
  transform: scale(1.05);
  box-shadow: var(--box-shadow-md);
}

.image-error {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-100);
  border-radius: var(--border-radius-md);
  color: var(--text-tertiary);
}

/* 进度条 */
.progress-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.progress-cell :deep(.el-progress) {
  flex: 1;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  min-width: 36px;
}

/* 文本 */
.text-cell {
  color: var(--text-primary);
}

.text-empty {
  color: var(--text-tertiary);
  font-style: italic;
}

/* 操作列 */
.action-column :deep(.cell) {
  padding: var(--spacing-2);
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}

.action-btn:hover {
  background: var(--slate-100);
}

.action-btn--view:hover {
  color: var(--primary-600);
}

.action-btn--edit:hover {
  color: var(--primary-600);
}

.action-btn--delete:hover {
  color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-color-light);
  padding: var(--spacing-4) var(--spacing-5);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.selection-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.selection-info strong {
  color: var(--primary-600);
  font-weight: var(--font-weight-bold);
}

.inventory-pagination {
  --el-pagination-hover-color: var(--primary-600);
}

.inventory-pagination :deep(.el-pagination__total) {
  color: var(--text-secondary);
}

.inventory-pagination :deep(.el-pagination__sizes) {
  margin-right: var(--spacing-4);
}

.inventory-pagination :deep(.el-pager li) {
  border-radius: var(--border-radius-md);
  transition: var(--transition-fast);
}

.inventory-pagination :deep(.el-pager li:hover) {
  background: var(--primary-100);
  color: var(--primary-600);
}

.inventory-pagination :deep(.el-pager li.is-active) {
  background: var(--primary-600);
  color: white;
}

/* 响应式 */
@media (max-width: 1200px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .search-select,
  .search-date,
  .search-date-range {
    width: 100%;
  }

  .search-actions {
    margin-left: 0;
    display: flex;
    gap: var(--spacing-3);
  }

  .toolbar-section {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }

  .toolbar-left {
    flex-wrap: wrap;
  }

  .toolbar-right {
    justify-content: flex-end;
  }

  .pagination-section {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: center;
  }
}

@media (max-width: 768px) {
  .inventory-list-container {
    gap: var(--spacing-4);
  }

  .search-section,
  .toolbar-section,
  .pagination-section {
    padding: var(--spacing-4);
  }

  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  .inventory-table :deep(.el-table__row),
  .btn-refresh,
  .table-image,
  .action-btn {
    transition: none;
  }
}
</style>
