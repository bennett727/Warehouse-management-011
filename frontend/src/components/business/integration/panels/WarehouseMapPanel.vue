<!--
  @file: WarehouseMapPanel.vue
  @description: 仓库地图面板组件 - 展示仓库地理位置分布
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <div class="warehouse-map-panel">
    <div class="panel-header">
      <div class="header-title">
        <el-icon><MapLocation /></el-icon>
        <span>仓库地图</span>
      </div>
      <div class="header-actions">
        <el-button-group size="small">
          <el-button :icon="ZoomIn" @click="handleZoomIn" />
          <el-button :icon="ZoomOut" @click="handleZoomOut" />
          <el-button :icon="Refresh" @click="handleRefresh" />
        </el-button-group>
      </div>
    </div>

    <div class="panel-content" v-loading="loading">
      <div class="map-container" ref="mapContainerRef">
        <div class="map-placeholder">
          <el-icon :size="48"><MapLocation /></el-icon>
          <p>地图加载中...</p>
          <p class="map-tip">共 {{ warehouseCount }} 个仓库</p>
        </div>
      </div>

      <div class="warehouse-markers">
        <div
          v-for="warehouse in warehouseList"
          :key="warehouse.id"
          class="marker-item"
          :class="{ 'marker-active': selectedWarehouse?.id === warehouse.id }"
          @click="handleSelect(warehouse)"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span>{{ warehouse.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MapLocation, OfficeBuilding, Refresh, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
import { inject, onMounted, ref } from 'vue';

const emit = defineEmits(['select']);

const loading = ref(false);
const mapContainerRef = ref(null);
const selectedWarehouse = ref(null);
const warehouseList = ref([]);
const warehouseCount = ref(0);

const warehouseDataCenter = inject('warehouseDataCenter', null);

const handleSelect = (warehouse) => {
  selectedWarehouse.value = warehouse;
  emit('select', warehouse);
};

const handleZoomIn = () => {};

const handleZoomOut = () => {};

const handleRefresh = () => {
  fetchWarehouseList();
};

const fetchWarehouseList = async () => {
  loading.value = true;
  try {
    warehouseList.value = [
      { id: 1, name: '北京仓库', lat: 39.9042, lng: 116.4074 },
      { id: 2, name: '上海仓库', lat: 31.2304, lng: 121.4737 },
      { id: 3, name: '广州仓库', lat: 23.1291, lng: 113.2644 },
    ];
    warehouseCount.value = warehouseList.value.length;
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
.warehouse-map-panel {
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-container {
  flex: 1;
  min-height: 300px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  text-align: center;
  color: #909399;
}

.map-tip {
  font-size: 12px;
  margin-top: 8px;
}

.warehouse-markers {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.marker-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.marker-item:hover {
  border-color: #409eff;
  color: #409eff;
}

.marker-item.marker-active {
  border-color: #409eff;
  background-color: #ecf5ff;
  color: #409eff;
}
</style>
