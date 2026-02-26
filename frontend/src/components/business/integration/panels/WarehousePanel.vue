<!--
  @file: WarehousePanel.vue
  @description: 仓库面板组件 - 展示仓库列表和详情
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <div class="warehouse-panel">
    <div class="panel-header">
      <div class="header-title">
        <el-icon><House /></el-icon>
        <span>仓库列表</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="small" :icon="Plus" @click="handleAdd" data-cy="warehouse-panel-add-btn">添加仓库</el-button>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <div class="warehouse-list" v-if="warehouseList.length > 0">
        <div
          v-for="warehouse in warehouseList"
          :key="warehouse.id"
          class="warehouse-item"
          :class="{ 'warehouse-selected': selectedWarehouse?.id === warehouse.id }"
          @click="handleSelect(warehouse)"
        >
          <div class="warehouse-header">
            <div class="warehouse-icon">
              <el-icon :size="24"><House /></el-icon>
            </div>
            <div class="warehouse-name">{{ warehouse.name }}</div>
            <el-tag :type="warehouse.status === 'active' ? 'success' : 'info'" size="small">
              {{ warehouse.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </div>
          <div class="warehouse-body">
            <div class="info-row">
              <span class="label">编码：</span>
              <span class="value">{{ warehouse.code }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ warehouse.address }}</span>
            </div>
            <div class="info-row">
              <span class="label">容量：</span>
              <span class="value">{{ warehouse.usedCapacity }}/{{ warehouse.totalCapacity }}</span>
            </div>
          </div>
          <div class="warehouse-footer">
            <el-progress
              :percentage="getUsageRate(warehouse)"
              :stroke-width="4"
              :color="getProgressColor(getUsageRate(warehouse))"
              :show-text="false"
            />
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无仓库数据" />
    </div>

    <div class="panel-footer" v-if="warehouseList.length > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 30]"
        layout="total, prev, pager, next"
        small
        background
        data-cy="warehouse-panel-pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { House, Plus } from '@element-plus/icons-vue';
import { inject, onMounted, reactive, ref } from 'vue';

const emit = defineEmits(['select', 'add']);

const loading = ref(false);
const selectedWarehouse = ref(null);
const warehouseList = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const warehouseDataCenter = inject('warehouseDataCenter', null);

const getUsageRate = (warehouse) => {
  if (!warehouse.totalCapacity) {
    return 0;
  }
  return Math.round((warehouse.usedCapacity / warehouse.totalCapacity) * 100);
};

const getProgressColor = (rate) => {
  if (rate >= 90) {
    return '#F56C6C';
  }
  if (rate >= 70) {
    return '#E6A23C';
  }
  return '#67C23A';
};

const handleSelect = (warehouse) => {
  selectedWarehouse.value = warehouse;
  emit('select', warehouse);
};

const handleAdd = () => {
  emit('add');
};

const fetchWarehouseList = async () => {
  loading.value = true;
  try {
    warehouseList.value = [
      {
        id: 1,
        name: '北京主仓库',
        code: 'WH-BJ-001',
        address: '北京市朝阳区',
        status: 'active',
        usedCapacity: 800,
        totalCapacity: 1000,
      },
      {
        id: 2,
        name: '上海分仓库',
        code: 'WH-SH-001',
        address: '上海市浦东新区',
        status: 'active',
        usedCapacity: 500,
        totalCapacity: 800,
      },
      {
        id: 3,
        name: '广州仓库',
        code: 'WH-GZ-001',
        address: '广州市天河区',
        status: 'active',
        usedCapacity: 300,
        totalCapacity: 500,
      },
    ];
    pagination.total = 3;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWarehouseList();
});

defineExpose({
  refresh: fetchWarehouseList,
});
</script>

<style scoped>
.warehouse-panel {
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

.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warehouse-item {
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.warehouse-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.warehouse-item.warehouse-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.warehouse-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.warehouse-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #409eff;
}

.warehouse-name {
  flex: 1;
  font-weight: 500;
  font-size: 15px;
}

.warehouse-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  font-size: 13px;
}

.info-row .label {
  color: #909399;
  width: 50px;
}

.info-row .value {
  color: #303133;
}

.warehouse-footer {
  padding-top: 8px;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}
</style>
