<template>
  <div ref="mapContainer" class="amap-container" :style="containerStyle">
    <!-- 降级模式：无地图Key或加载失败时显示 -->
    <MapFallback
      v-if="useFallback"
      :height="height"
      :width="width"
      :warehouses="warehouses"
      :selected-id="selectedId"
      :clickable="clickable"
      :show-actions="showActions"
      @click="handleFallbackClick"
      @view="handleFallbackView"
      @refresh="handleFallbackRefresh"
    />

    <!-- 地图加载中 -->
    <div v-else-if="loading" class="map-loading">
      <el-icon :size="48" class="is-loading"><Loading /></el-icon>
      <p class="loading-text">地图加载中...</p>
    </div>

    <!-- 地图加载失败 -->
    <div v-else-if="error" class="map-error">
      <el-icon :size="48" color="#F56C6C"><WarningFilled /></el-icon>
      <p>{{ error }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="initMap">重新加载</el-button>
        <el-button @click="enableFallback">使用列表视图</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WarningFilled, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

import MapFallback from '@/components/map/MapFallback.vue';
import { createMap, addWarehouseMarker, setMapCenter, destroyMap, isAMapAvailable } from '@/utils/amap';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AmapContainer');

const props = defineProps({
  // 地图高度
  height: {
    type: String,
    default: '400px',
  },
  // 地图宽度
  width: {
    type: String,
    default: '100%',
  },
  // 中心点坐标
  center: {
    type: Array,
    default: () => null,
  },
  // 缩放级别
  zoom: {
    type: Number,
    default: 11,
  },
  // 仓库列表
  warehouses: {
    type: Array,
    default: () => [],
  },
  // 是否显示标记点
  showMarkers: {
    type: Boolean,
    default: true,
  },
  // 是否可点击标记
  clickable: {
    type: Boolean,
    default: true,
  },
  // 是否强制使用降级模式
  forceFallback: {
    type: Boolean,
    default: false,
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true,
  },
  // 地图配置
  mapOptions: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'marker-click',
  'map-click',
  'map-ready',
  'fallback-click',
  'fallback-view',
  'fallback-refresh',
]);

// 响应式数据
const mapContainer = ref(null);
const map = ref(null);
const loading = ref(false);
const error = ref('');
const markers = ref([]);
const useFallback = ref(false);
const selectedId = ref(null);

// 容器样式
const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
}));

// 检查是否应该使用降级模式
const shouldUseFallback = () => {
  // 强制降级
  if (props.forceFallback) {
    return true;
  }
  // 检查高德地图是否可用
  if (!isAMapAvailable()) {
    return true;
  }
  return false;
};

// 启用降级模式
const enableFallback = () => {
  useFallback.value = true;
  error.value = '';
  loading.value = false;
};

// 初始化地图
const initMap = async () => {
  // 检查是否需要降级
  if (shouldUseFallback()) {
    enableFallback();
    return;
  }

  if (!mapContainer.value) {
    return;
  }

  loading.value = true;
  error.value = '';
  useFallback.value = false;

  try {
    // 销毁旧地图
    if (map.value) {
      destroyMap(map.value);
      map.value = null;
    }

    // 创建新地图
    const options = {
      zoom: props.zoom,
      center: props.center,
      ...props.mapOptions,
    };

    map.value = await createMap(mapContainer.value, options);

    // 添加点击事件
    map.value.on('click', (e) => {
      emit('map-click', {
        lng: e.lnglat.getLng(),
        lat: e.lnglat.getLat(),
      });
    });

    // 添加标记点
    if (props.showMarkers && props.warehouses.length > 0) {
      addMarkers();
    }

    emit('map-ready', map.value);
    loading.value = false;
  } catch (err) {
    logger.error('地图初始化失败', err);
    error.value = '地图加载失败，请检查网络连接或刷新页面重试';
    loading.value = false;
    // 3秒后自动切换到降级模式
    setTimeout(() => {
      if (error.value && !useFallback.value) {
        enableFallback();
      }
    }, 3000);
  }
};

// 添加标记点
const addMarkers = () => {
  if (!map.value) {
    return;
  }

  // 清除旧标记
  markers.value.forEach((marker) => {
    map.value.remove(marker);
  });
  markers.value = [];

  // 添加新标记
  props.warehouses.forEach((warehouse) => {
    if (warehouse.longitude && warehouse.latitude) {
      const marker = addWarehouseMarker(
        map.value,
        warehouse,
        props.clickable ? () => handleMarkerClick(warehouse) : null
      );
      if (marker) {
        markers.value.push(marker);
      }
    }
  });

  // 自动调整视野以显示所有标记
  if (markers.value.length > 0) {
    map.value.setFitView(markers.value, false, [60, 60, 60, 60]);
  }
};

// 标记点点击事件
const handleMarkerClick = (warehouse) => {
  selectedId.value = warehouse.warehouseId;
  emit('marker-click', warehouse);
};

// 降级模式点击事件
const handleFallbackClick = (warehouse) => {
  selectedId.value = warehouse.warehouseId;
  emit('fallback-click', warehouse);
};

// 降级模式查看事件
const handleFallbackView = (warehouse) => {
  emit('fallback-view', warehouse);
};

// 降级模式刷新事件
const handleFallbackRefresh = () => {
  emit('fallback-refresh');
};

// 设置中心点
const setCenter = (lng, lat, zoom) => {
  if (map.value) {
    setMapCenter(map.value, lng, lat, zoom);
  }
};

// 获取地图实例
const getMap = () => map.value;

// 监听仓库列表变化
watch(
  () => props.warehouses,
  () => {
    if (map.value && props.showMarkers) {
      addMarkers();
    }
  },
  { deep: true }
);

// 监听中心点变化
watch(
  () => props.center,
  (newCenter) => {
    if (map.value && newCenter) {
      setCenter(newCenter[0], newCenter[1]);
    }
  }
);

// 监听强制降级变化
watch(
  () => props.forceFallback,
  (newValue) => {
    if (newValue) {
      enableFallback();
    } else {
      initMap();
    }
  }
);

// 组件挂载
onMounted(() => {
  initMap();
});

// 组件卸载
onUnmounted(() => {
  if (map.value) {
    destroyMap(map.value);
    map.value = null;
  }
});

// 暴露方法
defineExpose({
  initMap,
  setCenter,
  getMap,
  addMarkers,
  enableFallback,
});
</script>

<style scoped>
.amap-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.map-loading,
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.loading-text {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}

.map-error p {
  margin: 16px 0;
  color: #606266;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 12px;
}
</style>

<style>
/* 地图标记点样式 */
.warehouse-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.warehouse-marker-icon {
  width: 32px;
  height: 32px;
  background-color: #409eff;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.warehouse-marker-icon .el-icon {
  transform: rotate(45deg);
  color: #fff;
  font-size: 16px;
}

.warehouse-marker-label {
  margin-top: 4px;
  padding: 2px 8px;
  background-color: #fff;
  border-radius: 4px;
  font-size: 12px;
  color: #303133;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.amap-info-window {
  padding: 12px;
  min-width: 200px;
}

.amap-info-window h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.amap-info-window p {
  margin: 4px 0;
  font-size: 12px;
  color: #606266;
}
</style>
