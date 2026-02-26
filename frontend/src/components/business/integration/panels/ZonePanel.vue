<!--
  @file: ZonePanel.vue
  @description: 区域面板组件 - 展示仓库区域信息
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <div class="zone-panel">
    <div class="panel-header">
      <div class="header-title">
        <el-icon><OfficeBuilding /></el-icon>
        <span>区域管理</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="small" :icon="Plus" @click="handleAdd" data-cy="zone-panel-add-btn">添加区域</el-button>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <div class="zone-list" v-if="zoneList.length > 0">
        <div
          v-for="zone in zoneList"
          :key="zone.id"
          class="zone-item"
          :class="{ 'zone-selected': selectedZone?.id === zone.id }"
          @click="handleSelect(zone)"
        >
          <div class="zone-header">
            <div class="zone-color" :style="{ backgroundColor: zone.color || '#409EFF' }" />
            <div class="zone-name">{{ zone.name }}</div>
            <el-tag :type="getZoneTypeTag(zone.type)" size="small">
              {{ getZoneTypeText(zone.type) }}
            </el-tag>
          </div>
          <div class="zone-body">
            <div class="stat-item">
              <span class="stat-label">面积</span>
              <span class="stat-value">{{ zone.area }} ㎡</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">货位数</span>
              <span class="stat-value">{{ zone.binCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">利用率</span>
              <span class="stat-value">{{ zone.utilization }}%</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无区域数据" />
    </div>

    <div class="panel-footer" v-if="zoneList.length > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 30]"
        layout="total, prev, pager, next"
        small
        background
        data-cy="zone-panel-pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { OfficeBuilding, Plus } from '@element-plus/icons-vue';
import { inject, onMounted, reactive, ref } from 'vue';

const emit = defineEmits(['select', 'add']);

const loading = ref(false);
const selectedZone = ref(null);
const zoneList = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const warehouseDataCenter = inject('warehouseDataCenter', null);

const ZONE_TYPE_MAP = {
  storage: { text: '存储区', type: 'primary' },
  picking: { text: '拣货区', type: 'success' },
  receiving: { text: '收货区', type: 'warning' },
  shipping: { text: '发货区', type: 'info' },
  quarantine: { text: '隔离区', type: 'danger' },
};

const getZoneTypeText = (type) => ZONE_TYPE_MAP[type]?.text || type;
const getZoneTypeTag = (type) => ZONE_TYPE_MAP[type]?.type || 'info';

const handleSelect = (zone) => {
  selectedZone.value = zone;
  emit('select', zone);
};

const handleAdd = () => {
  emit('add');
};

const fetchZoneList = async () => {
  loading.value = true;
  try {
    zoneList.value = [
      { id: 1, name: 'A区-存储区', type: 'storage', area: 500, binCount: 100, utilization: 85, color: '#409EFF' },
      { id: 2, name: 'B区-拣货区', type: 'picking', area: 300, binCount: 60, utilization: 70, color: '#67C23A' },
      { id: 3, name: 'C区-收货区', type: 'receiving', area: 200, binCount: 40, utilization: 45, color: '#E6A23C' },
      { id: 4, name: 'D区-发货区', type: 'shipping', area: 150, binCount: 30, utilization: 60, color: '#909399' },
    ];
    pagination.total = 4;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchZoneList();
});

defineExpose({
  refresh: fetchZoneList,
});
</script>

<style scoped>
.zone-panel {
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

.zone-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.zone-item {
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.zone-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.zone-item.zone-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.zone-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.zone-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.zone-name {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}

.zone-body {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}
</style>
