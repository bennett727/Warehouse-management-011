<!--
  @file: BinPanel.vue
  @description: 货位面板组件 - 展示货位信息和管理功能
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <div class="bin-panel">
    <div class="panel-header">
      <div class="header-title">
        <el-icon><Grid /></el-icon>
        <span>货位管理</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="small" :icon="Plus" @click="handleAdd" data-cy="bin-panel-add-btn">添加货位</el-button>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <div class="bin-grid" v-if="binList.length > 0">
        <div
          v-for="bin in binList"
          :key="bin.id"
          class="bin-item"
          :class="{ 'bin-selected': selectedBin?.id === bin.id, 'bin-full': bin.usageRate >= 100 }"
          @click="handleSelect(bin)"
        >
          <div class="bin-code">{{ bin.binCode }}</div>
          <div class="bin-status">
            <el-progress
              :percentage="bin.usageRate || 0"
              :stroke-width="6"
              :color="getProgressColor(bin.usageRate)"
              :show-text="false"
            />
          </div>
          <div class="bin-info">
            <span class="capacity">{{ bin.usedCapacity }}/{{ bin.totalCapacity }}</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无货位数据" />
    </div>

    <div class="panel-footer" v-if="binList.length > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 40, 60]"
        layout="total, prev, pager, next"
        small
        background
        data-cy="bin-panel-pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { Grid, Plus } from '@element-plus/icons-vue';
import { inject, onMounted, reactive, ref } from 'vue';

const emit = defineEmits(['select', 'add']);

const loading = ref(false);
const selectedBin = ref(null);
const binList = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const warehouseDataCenter = inject('warehouseDataCenter', null);

const getProgressColor = (rate) => {
  if (rate >= 90) {
    return '#F56C6C';
  }
  if (rate >= 70) {
    return '#E6A23C';
  }
  return '#67C23A';
};

const handleSelect = (bin) => {
  selectedBin.value = bin;
  emit('select', bin);
};

const handleAdd = () => {
  emit('add');
};

const fetchBinList = async () => {
  loading.value = true;
  try {
    binList.value = [
      { id: 1, binCode: 'A-01-01', usedCapacity: 80, totalCapacity: 100, usageRate: 80 },
      { id: 2, binCode: 'A-01-02', usedCapacity: 50, totalCapacity: 100, usageRate: 50 },
      { id: 3, binCode: 'A-02-01', usedCapacity: 100, totalCapacity: 100, usageRate: 100 },
      { id: 4, binCode: 'B-01-01', usedCapacity: 30, totalCapacity: 100, usageRate: 30 },
    ];
    pagination.total = 4;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBinList();
});

defineExpose({
  refresh: fetchBinList,
});
</script>

<style scoped>
.bin-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.bin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.bin-item {
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.bin-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.bin-item.bin-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.bin-item.bin-full {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.bin-code {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.bin-status {
  margin-bottom: 8px;
}

.bin-info {
  font-size: 12px;
  color: #909399;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}
</style>
