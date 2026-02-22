<template>
  <PageLayout title="仓库地图" description="在地图上查看所有仓库的地理位置分布" data-cy="warehouse-map-page">
    <template #headerActions>
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button label="map">
          <el-icon><MapLocation /></el-icon>
          地图视图
        </el-radio-button>
        <el-radio-button label="list">
          <el-icon><List /></el-icon>
          列表视图
        </el-radio-button>
      </el-radio-group>
    </template>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">仓库总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">启用仓库</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon located">
              <el-icon><MapLocation /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.withLocation }}</div>
              <div class="stat-label">已定位仓库</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.noLocation }}</div>
              <div class="stat-label">待定位仓库</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地图视图 -->
    <template v-if="viewMode === 'map'">
      <el-card class="map-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>仓库分布地图</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索仓库"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" :icon="Refresh" @click="refreshData"> 刷新 </el-button>
            </div>
          </div>
        </template>

        <div class="map-container-wrapper">
          <!-- 地图组件（支持自动降级） -->
          <AmapContainer
            ref="mapRef"
            height="600px"
            :warehouses="filteredWarehouses"
            :show-markers="true"
            :clickable="true"
            @marker-click="handleMarkerClick"
            @map-ready="handleMapReady"
            @fallback-click="handleFallbackClick"
            @fallback-view="handleFallbackView"
            @fallback-refresh="refreshData"
          />

          <!-- 仓库列表侧边栏（仅在地图模式下显示） -->
          <div v-if="!isFallbackMode" class="warehouse-sidebar">
            <div class="sidebar-header">
              <h4>仓库列表</h4>
              <el-tag type="info">{{ filteredWarehouses.length }}个</el-tag>
            </div>
            <el-scrollbar height="520px">
              <div
                v-for="warehouse in filteredWarehouses"
                :key="warehouse.warehouseId"
                class="warehouse-item"
                :class="{ active: selectedWarehouse?.warehouseId === warehouse.warehouseId }"
                @click="selectWarehouse(warehouse)"
              >
                <div class="item-header">
                  <span class="warehouse-name">{{ warehouse.warehouseName }}</span>
                  <el-tag :type="warehouse.status === 1 ? 'success' : 'info'" size="small">
                    {{ warehouse.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </div>
                <div class="item-address">
                  <el-icon><Location /></el-icon>
                  <span>{{ formatAddress(warehouse) || '暂无地址' }}</span>
                </div>
                <div class="item-location" v-if="warehouse.longitude && warehouse.latitude">
                  <el-icon><MapLocation /></el-icon>
                  <span>{{ formatLocation(warehouse.longitude, warehouse.latitude) }}</span>
                </div>
                <div v-else class="item-location no-location">
                  <el-icon><Warning /></el-icon>
                  <span>未设置位置</span>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-card>
    </template>

    <!-- 列表视图 -->
    <template v-else>
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>仓库位置列表</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索仓库"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" :icon="Refresh" @click="refreshData"> 刷新 </el-button>
            </div>
          </div>
        </template>

        <el-table :data="filteredWarehouses" stripe border v-loading="loading">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="warehouseName" label="仓库名称" min-width="150" />
          <el-table-column label="地址" min-width="250">
            <template #default="{ row }">
              {{ formatAddress(row) || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="坐标" width="200">
            <template #default="{ row }">
              <template v-if="row.longitude && row.latitude">
                {{ formatLocation(row.longitude, row.latitude) }}
              </template>
              <el-tag v-else type="warning" size="small">未设置</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="contactName" label="联系人" width="120" />
          <el-table-column prop="contactPhone" label="联系电话" width="140" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="viewWarehouse(row)"> 查看 </el-button>
              <el-button type="primary" link :icon="Edit" @click="editWarehouse(row)"> 编辑 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 仓库详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="仓库详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border v-if="selectedWarehouse">
        <el-descriptions-item label="仓库名称" :span="2">
          {{ selectedWarehouse.warehouseName }}
        </el-descriptions-item>
        <el-descriptions-item label="仓库编码">
          {{ selectedWarehouse.warehouseCode }}
        </el-descriptions-item>
        <el-descriptions-item label="仓库状态">
          <el-tag :type="selectedWarehouse.status === 1 ? 'success' : 'info'">
            {{ selectedWarehouse.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ selectedWarehouse.contactName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ selectedWarehouse.contactPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="详细地址" :span="2">
          {{ formatAddress(selectedWarehouse) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="经纬度" :span="2">
          <template v-if="selectedWarehouse.longitude && selectedWarehouse.latitude">
            {{ formatLocation(selectedWarehouse.longitude, selectedWarehouse.latitude) }}
          </template>
          <el-tag v-else type="warning">未设置位置</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ selectedWarehouse.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 小地图 -->
      <div v-if="selectedWarehouse?.longitude && selectedWarehouse?.latitude" class="mini-map">
        <h4>位置地图</h4>
        <AmapContainer
          height="300px"
          :center="[selectedWarehouse.longitude, selectedWarehouse.latitude]"
          :zoom="15"
          :warehouses="[selectedWarehouse]"
          :show-markers="true"
          :clickable="false"
        />
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editWarehouse(selectedWarehouse)"> 编辑仓库 </el-button>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup>
import {
  CircleCheck,
  Edit,
  List,
  Location,
  MapLocation,
  OfficeBuilding,
  Refresh,
  Search,
  View,
  Warning,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { getWarehouseList } from '@/api/inventory/warehouse';
import PageLayout from '@/components/base/PageLayout.vue';
import AmapContainer from '@/components/map/AmapContainer.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('WarehouseMap');

const router = useRouter();

// 响应式数据
const loading = ref(false);
const warehouseList = ref([]);
const searchKeyword = ref('');
const viewMode = ref('map');
const selectedWarehouse = ref(null);
const detailDialogVisible = ref(false);
const mapRef = ref(null);
const isFallbackMode = ref(false);

// 统计信息
const statistics = computed(() => {
  const total = warehouseList.value.length;
  const active = warehouseList.value.filter((w) => w.status === 1).length;
  const withLocation = warehouseList.value.filter((w) => w.longitude && w.latitude).length;
  const noLocation = total - withLocation;

  return { total, active, withLocation, noLocation };
});

// 过滤后的仓库列表
const filteredWarehouses = computed(() => {
  if (!searchKeyword.value) {
    return warehouseList.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return warehouseList.value.filter(
    (w) =>
      w.warehouseName?.toLowerCase().includes(keyword) ||
      w.warehouseCode?.toLowerCase().includes(keyword) ||
      w.contactName?.toLowerCase().includes(keyword)
  );
});

// 获取仓库列表
const fetchWarehouseList = async () => {
  loading.value = true;
  try {
    const res = await getWarehouseList({ pageSize: 1000 });
    if (res.success) {
      warehouseList.value = res.data?.list || [];
    } else {
      ElMessage.error(res.message || '获取仓库列表失败');
    }
  } catch (error) {
    logger.error('获取仓库列表失败', error);
    ElMessage.error('获取仓库列表失败');
  } finally {
    loading.value = false;
  }
};

// 格式化地址
const formatAddress = (warehouse) => {
  if (!warehouse) {
    return '';
  }
  const parts = [warehouse.provinceName, warehouse.cityName, warehouse.districtName, warehouse.address].filter(Boolean);
  return parts.join('');
};

// 格式化坐标
const formatLocation = (lng, lat) => {
  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
};

// 搜索
const handleSearch = () => {
  // 搜索逻辑已通过computed属性实现
};

// 刷新数据
const refreshData = () => {
  fetchWarehouseList();
  ElMessage.success('数据已刷新');
};

// 选择仓库
const selectWarehouse = (warehouse) => {
  selectedWarehouse.value = warehouse;
  if (warehouse.longitude && warehouse.latitude && mapRef.value) {
    mapRef.value.setCenter(warehouse.longitude, warehouse.latitude, 15);
  }
};

// 标记点点击
const handleMarkerClick = (warehouse) => {
  selectedWarehouse.value = warehouse;
  detailDialogVisible.value = true;
};

// 地图就绪
const handleMapReady = () => {
  logger.debug('地图加载完成');
  isFallbackMode.value = false;
};

// 降级模式点击
const handleFallbackClick = (warehouse) => {
  selectedWarehouse.value = warehouse;
  isFallbackMode.value = true;
};

// 降级模式查看
const handleFallbackView = (warehouse) => {
  selectedWarehouse.value = warehouse;
  detailDialogVisible.value = true;
};

// 查看仓库
const viewWarehouse = (warehouse) => {
  selectedWarehouse.value = warehouse;
  detailDialogVisible.value = true;
};

// 编辑仓库
const editWarehouse = (warehouse) => {
  detailDialogVisible.value = false;
  router.push({
    path: '/inventory-management/warehouse',
    query: { edit: warehouse.warehouseId },
  });
};

// 组件挂载
onMounted(() => {
  fetchWarehouseList();
});
</script>

<style scoped>
.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 15px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.total {
  background-color: #409eff;
}

.stat-icon.active {
  background-color: #67c23a;
}

.stat-icon.located {
  background-color: #e6a23c;
}

.stat-icon.warning {
  background-color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.map-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.map-container-wrapper {
  display: flex;
  gap: 16px;
  height: 600px;
}

.warehouse-sidebar {
  width: 320px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.warehouse-item {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.warehouse-item:hover {
  background-color: #f5f7fa;
}

.warehouse-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.warehouse-name {
  font-weight: 500;
  color: #303133;
}

.item-address,
.item-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.item-address .el-icon,
.item-location .el-icon {
  font-size: 14px;
  color: #909399;
}

.item-location.no-location {
  color: #e6a23c;
}

.item-location.no-location .el-icon {
  color: #e6a23c;
}

.mini-map {
  margin-top: 20px;
}

.mini-map h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}
</style>
