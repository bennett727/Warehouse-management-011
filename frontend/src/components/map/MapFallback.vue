<template>
  <div class="map-fallback-container" :style="containerStyle">
    <!-- 头部信息 -->
    <div class="fallback-header">
      <div class="header-info">
        <el-icon :size="20" color="#909399"><MapLocation /></el-icon>
        <span class="header-title">仓库位置概览</span>
        <el-tag v-if="warehousesWithLocation.length > 0" type="success" size="small">
          {{ warehousesWithLocation.length }}个已定位
        </el-tag>
        <el-tag v-if="warehousesWithoutLocation.length > 0" type="warning" size="small">
          {{ warehousesWithoutLocation.length }}个未定位
        </el-tag>
      </div>
      <div class="header-actions" v-if="showActions">
        <el-button type="primary" link :icon="Refresh" @click="refreshData" data-cy="map-refresh-btn"> 刷新 </el-button>
      </div>
    </div>

    <!-- 仓库列表 -->
    <el-scrollbar class="warehouse-list" height="calc(100% - 50px)">
      <div
        v-for="warehouse in warehouses"
        :key="warehouse.warehouseId"
        class="warehouse-card"
        :class="{
          active: selectedId === warehouse.warehouseId,
          'has-location': warehouse.longitude && warehouse.latitude,
          'no-location': !warehouse.longitude || !warehouse.latitude,
        }"
        @click="handleClick(warehouse)"
      >
        <!-- 仓库图标 -->
        <div class="card-icon" :class="warehouse.status === 1 ? 'active' : 'inactive'">
          <el-icon :size="24"><OfficeBuilding /></el-icon>
        </div>

        <!-- 仓库信息 -->
        <div class="card-content">
          <div class="content-header">
            <span class="warehouse-name">{{ warehouse.warehouseName }}</span>
            <el-tag :type="warehouse.status === 1 ? 'success' : 'info'" size="small">
              {{ warehouse.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </div>

          <div class="content-address">
            <el-icon><Location /></el-icon>
            <span class="address-text">{{ formatAddress(warehouse) || '暂无地址' }}</span>
          </div>

          <div class="content-coordinates" v-if="warehouse.longitude && warehouse.latitude">
            <el-icon><Coordinate /></el-icon>
            <span>{{ formatCoordinates(warehouse.longitude, warehouse.latitude) }}</span>
          </div>
          <div class="content-coordinates no-coords" v-else>
            <el-icon><Warning /></el-icon>
            <span>未设置经纬度坐标</span>
          </div>

          <div class="content-contact" v-if="warehouse.contactName || warehouse.contactPhone">
            <el-icon><User /></el-icon>
            <span>{{ warehouse.contactName || '-' }} {{ warehouse.contactPhone || '' }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions" v-if="clickable">
          <el-button type="primary" link :icon="View" @click.stop="handleView(warehouse)" :data-cy="`map-view-btn-${warehouse.warehouseId}`"> 查看 </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="warehouses.length === 0" description="暂无仓库数据" :image-size="100" />
    </el-scrollbar>
  </div>
</template>

<script setup>
import {
  MapLocation,
  OfficeBuilding,
  Location,
  Warning,
  User,
  View,
  Refresh,
  Coordinate,
} from '@element-plus/icons-vue';
import { computed } from 'vue';

const props = defineProps({
  // 容器高度
  height: {
    type: String,
    default: '400px',
  },
  // 容器宽度
  width: {
    type: String,
    default: '100%',
  },
  // 仓库列表
  warehouses: {
    type: Array,
    default: () => [],
  },
  // 当前选中的仓库ID
  selectedId: {
    type: [Number, String],
    default: null,
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: true,
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['click', 'view', 'refresh']);

// 容器样式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
}));

// 已定位的仓库
const warehousesWithLocation = computed(() => props.warehouses.filter((w) => w.longitude && w.latitude));

// 未定位的仓库
const warehousesWithoutLocation = computed(() => props.warehouses.filter((w) => !w.longitude || !w.latitude));

// 格式化地址
const formatAddress = (warehouse) => {
  if (!warehouse) {
    return '';
  }
  const parts = [warehouse.provinceName, warehouse.cityName, warehouse.districtName, warehouse.address].filter(Boolean);
  return parts.join('');
};

// 格式化坐标
const formatCoordinates = (lng, lat) => {
  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
};

// 点击仓库卡片
const handleClick = (warehouse) => {
  if (props.clickable) {
    emit('click', warehouse);
  }
};

// 查看仓库
const handleView = (warehouse) => {
  emit('view', warehouse);
};

// 刷新数据
const refreshData = () => {
  emit('refresh');
};
</script>

<style scoped>
.map-fallback-container {
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.fallback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.warehouse-list {
  flex: 1;
  padding: 12px;
}

.warehouse-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.warehouse-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.warehouse-card.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.warehouse-card.has-location {
  border-left: 3px solid #67c23a;
}

.warehouse-card.no-location {
  border-left: 3px solid #e6a23c;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
}

.card-icon.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.card-icon.inactive {
  background-color: #f4f4f5;
  color: #909399;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.warehouse-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.content-address,
.content-coordinates,
.content-contact {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  margin-top: 6px;
}

.content-address .el-icon,
.content-coordinates .el-icon,
.content-contact .el-icon {
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
}

.address-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-coordinates.no-coords {
  color: #e6a23c;
}

.content-coordinates.no-coords .el-icon {
  color: #e6a23c;
}

.card-actions {
  display: flex;
  align-items: center;
  padding-left: 12px;
  border-left: 1px solid #ebeef5;
}
</style>
