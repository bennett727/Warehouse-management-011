<template>
  <div class="warehouse-data-center">
    <!-- 顶部导航标签 -->
    <el-tabs v-model="activeTab" type="border-card" class="center-tabs" data-cy="warehouse-data-center-tabs">
      <el-tab-pane name="warehouse">
        <template #label>
          <span class="tab-label">
            <el-icon><House /></el-icon>
            <span>仓库管理</span>
            <el-tag v-if="stats.warehouseCount > 0" size="small" type="info">{{ stats.warehouseCount }}</el-tag>
          </span>
        </template>
        <WarehousePanel ref="warehousePanelRef" @select="handleWarehouseSelect" @update:stats="updateWarehouseStats" />
      </el-tab-pane>

      <el-tab-pane name="zone" :disabled="!selectedWarehouse">
        <template #label>
          <span class="tab-label">
            <el-icon><OfficeBuilding /></el-icon>
            <span>功能区</span>
            <el-tag v-if="stats.zoneCount > 0" size="small" type="info">{{ stats.zoneCount }}</el-tag>
          </span>
        </template>
        <ZonePanel
          v-if="selectedWarehouse"
          ref="zonePanelRef"
          :warehouse-id="selectedWarehouse.id"
          :warehouse-name="selectedWarehouse.warehouseName"
          @select="handleZoneSelect"
          @update:stats="updateZoneStats"
          @back="activeTab = 'warehouse'"
        />
        <el-empty v-else description="请先选择仓库" />
      </el-tab-pane>

      <el-tab-pane name="bin" :disabled="!selectedZone">
        <template #label>
          <span class="tab-label">
            <el-icon><Grid /></el-icon>
            <span>货位</span>
            <el-tag v-if="stats.binCount > 0" size="small" type="info">{{ stats.binCount }}</el-tag>
          </span>
        </template>
        <BinPanel
          v-if="selectedZone"
          ref="binPanelRef"
          :zone-id="selectedZone.id"
          :zone-name="selectedZone.zoneName"
          :warehouse-id="selectedWarehouse?.id"
          @update:stats="updateBinStats"
          @back="activeTab = 'zone'"
        />
        <el-empty v-else description="请先选择功能区" />
      </el-tab-pane>

      <el-tab-pane name="map">
        <template #label>
          <span class="tab-label">
            <el-icon><MapLocation /></el-icon>
            <span>仓库地图</span>
          </span>
        </template>
        <WarehouseMapPanel
          ref="mapPanelRef"
          :selected-warehouse="selectedWarehouse"
          @select-warehouse="handleMapWarehouseSelect"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item @click="activeTab = 'warehouse'">
          <el-link :type="activeTab === 'warehouse' ? 'primary' : 'default'" :underline="false"> 仓库列表 </el-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="selectedWarehouse" @click="activeTab = 'zone'">
          <el-link :type="activeTab === 'zone' ? 'primary' : 'default'" :underline="false">
            {{ selectedWarehouse.warehouseName }}
          </el-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="selectedZone" @click="activeTab = 'bin'">
          <el-link :type="activeTab === 'bin' ? 'primary' : 'default'" :underline="false">
            {{ selectedZone.zoneName }}
          </el-link>
        </el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <el-button v-if="activeTab !== 'warehouse'" type="primary" link @click="handleQuickAdd" data-cy="warehouse-data-quick-add-btn">
          <el-icon><Plus /></el-icon>
          快速添加{{ getCurrentLevelName() }}
        </el-button>
        <el-divider direction="vertical" />
        <el-button type="info" link @click="showDataOverview" data-cy="warehouse-data-overview-btn">
          <el-icon><DataLine /></el-icon>
          数据概览
        </el-button>
      </div>
    </div>

    <!-- 数据概览抽屉 -->
    <el-drawer v-model="overviewDrawerVisible" title="仓库基础数据概览" size="500px">
      <DataOverview :stats="stats" :selected-warehouse="selectedWarehouse" />
    </el-drawer>
  </div>
</template>

<script setup>
import { DataLine, Grid, House, MapLocation, OfficeBuilding, Plus } from '@element-plus/icons-vue';
import { ref } from 'vue';

// 子面板组件
import DataOverview from '@/components/business/integration/DataOverview.vue';
import BinPanel from '@/components/business/integration/panels/BinPanel.vue';
import WarehouseMapPanel from '@/components/business/integration/panels/WarehouseMapPanel.vue';
import WarehousePanel from '@/components/business/integration/panels/WarehousePanel.vue';
import ZonePanel from '@/components/business/integration/panels/ZonePanel.vue';
import { createLogger } from '@/utils/logger';

const logger = createLogger('WarehouseDataCenter');

// 当前激活的标签
const activeTab = ref('warehouse');

// 选中的数据
const selectedWarehouse = ref(null);
const selectedZone = ref(null);

// 统计数据
const stats = reactive({
  warehouseCount: 0,
  zoneCount: 0,
  binCount: 0,
});

// 面板引用
const warehousePanelRef = ref(null);
const zonePanelRef = ref(null);
const binPanelRef = ref(null);
const mapPanelRef = ref(null);

// 概览抽屉
const overviewDrawerVisible = ref(false);

// 提供数据给子组件
provide('warehouseDataCenter', {
  selectedWarehouse: computed(() => selectedWarehouse.value),
  selectedZone: computed(() => selectedZone.value),
  stats: computed(() => stats),
  refreshAll,
});

// 处理仓库选择
const handleWarehouseSelect = (warehouse) => {
  selectedWarehouse.value = warehouse;
  selectedZone.value = null;
  if (warehouse) {
    activeTab.value = 'zone';
  }
};

// 处理功能区选择
const handleZoneSelect = (zone) => {
  selectedZone.value = zone;
  if (zone) {
    activeTab.value = 'bin';
  }
};

// 处理地图仓库选择
const handleMapWarehouseSelect = (warehouse) => {
  selectedWarehouse.value = warehouse;
  selectedZone.value = null;
  activeTab.value = 'warehouse';
  ElMessage.success(`已定位到仓库：${warehouse.warehouseName}`);
};

// 更新统计
const updateWarehouseStats = (count) => {
  stats.warehouseCount = count;
};

const updateZoneStats = (count) => {
  stats.zoneCount = count;
};

const updateBinStats = (count) => {
  stats.binCount = count;
};

// 获取当前层级名称
const getCurrentLevelName = () => {
  const nameMap = {
    warehouse: '仓库',
    zone: '功能区',
    bin: '货位',
    map: '地图标注',
  };
  return nameMap[activeTab.value] || '';
};

// 快速添加
const handleQuickAdd = () => {
  switch (activeTab.value) {
    case 'zone':
      zonePanelRef.value?.openAddDialog();
      break;
    case 'bin':
      binPanelRef.value?.openAddDialog();
      break;
    default:
      break;
  }
};

// 显示数据概览
const showDataOverview = () => {
  overviewDrawerVisible.value = true;
};

// 刷新所有数据
const refreshAll = () => {
  warehousePanelRef.value?.loadData();
  if (selectedWarehouse.value) {
    zonePanelRef.value?.loadData();
  }
  if (selectedZone.value) {
    binPanelRef.value?.loadData();
  }
};

// 暴露方法
defineExpose({
  refreshAll,
  selectWarehouse: handleWarehouseSelect,
});
</script>

<style scoped lang="scss">
.warehouse-data-center {
  height: 100%;
  display: flex;
  flex-direction: column;

  .center-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: auto;
      padding: 20px;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        font-size: 16px;
      }

      .el-tag {
        margin-left: 4px;
      }
    }
  }

  .breadcrumb-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background-color: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);

    .el-breadcrumb {
      font-size: 14px;

      .el-breadcrumb__item {
        cursor: pointer;

        &:hover {
          .el-link {
            color: var(--el-color-primary);
          }
        }
      }
    }

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
