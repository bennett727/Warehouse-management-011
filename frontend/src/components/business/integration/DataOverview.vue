<template>
  <div class="data-overview">
    <!-- 总体统计 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>总体统计</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-icon warehouse">
              <el-icon><House /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.warehouseCount }}</div>
              <div class="stat-label">仓库总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-icon zone">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.zoneCount }}</div>
              <div class="stat-label">功能区总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-icon bin">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.binCount }}</div>
              <div class="stat-label">货位总数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 当前选中仓库 -->
    <el-card v-if="selectedWarehouse" class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>当前仓库</span>
          <el-tag type="primary">{{ selectedWarehouse.warehouseName }}</el-tag>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="仓库编码">{{ selectedWarehouse.warehouseCode }}</el-descriptions-item>
        <el-descriptions-item label="仓库类型">{{
          getWarehouseTypeText(selectedWarehouse.warehouseType)
        }}</el-descriptions-item>
        <el-descriptions-item label="仓库状态">
          <el-tag :type="selectedWarehouse.status === 1 ? 'success' : 'info'">
            {{ selectedWarehouse.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所在地区">{{ selectedWarehouse.fullAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ selectedWarehouse.contactPerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ selectedWarehouse.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面积">{{
          selectedWarehouse.areaSize ? selectedWarehouse.areaSize + ' ㎡' : '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="容量">{{ selectedWarehouse.capacity || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 数据分布 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据分布</span>
        </div>
      </template>
      <div class="distribution-chart">
        <div class="chart-item">
          <div class="chart-label">平均每个仓库的功能区数</div>
          <div class="chart-value">{{ averageZonesPerWarehouse }}</div>
        </div>
        <el-divider />
        <div class="chart-item">
          <div class="chart-label">平均每个功能区的货位数</div>
          <div class="chart-value">{{ averageBinsPerZone }}</div>
        </div>
        <el-divider />
        <div class="chart-item">
          <div class="chart-label">平均每个仓库的货位数</div>
          <div class="chart-value">{{ averageBinsPerWarehouse }}</div>
        </div>
      </div>
    </el-card>

    <!-- 快捷操作 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <div class="quick-actions">
        <el-button type="primary" @click="handleNavigate('warehouse')">
          <el-icon><House /></el-icon>
          管理仓库
        </el-button>
        <el-button type="success" :disabled="!selectedWarehouse" @click="handleNavigate('zone')">
          <el-icon><OfficeBuilding /></el-icon>
          管理功能区
        </el-button>
        <el-button type="warning" :disabled="!selectedWarehouse" @click="handleNavigate('bin')">
          <el-icon><Grid /></el-icon>
          管理货位
        </el-button>
        <el-button type="info" @click="handleNavigate('map')">
          <el-icon><MapLocation /></el-icon>
          查看地图
        </el-button>
      </div>
    </el-card>

    <!-- 最近活动 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
          <el-button type="primary" link @click="refreshActivities">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <el-timeline v-if="recentActivities.length > 0">
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :type="activity.type"
          :timestamp="activity.time"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无最近活动" />
    </el-card>
  </div>
</template>

<script setup>
import { House, OfficeBuilding, Grid, MapLocation, Refresh } from '@element-plus/icons-vue';
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      warehouseCount: 0,
      zoneCount: 0,
      binCount: 0,
    }),
  },
  selectedWarehouse: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(['navigate', 'refresh']);

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    content: '创建了仓库：广州主仓库',
    time: '2024-01-15 10:30',
    type: 'primary',
  },
  {
    id: 2,
    content: '添加了功能区：A1货架区',
    time: '2024-01-15 09:15',
    type: 'success',
  },
  {
    id: 3,
    content: '批量创建了50个货位',
    time: '2024-01-14 16:45',
    type: 'warning',
  },
]);

// 计算平均数
const averageZonesPerWarehouse = computed(() => {
  if (props.stats.warehouseCount === 0) {
    return 0;
  }
  return (props.stats.zoneCount / props.stats.warehouseCount).toFixed(1);
});

const averageBinsPerZone = computed(() => {
  if (props.stats.zoneCount === 0) {
    return 0;
  }
  return (props.stats.binCount / props.stats.zoneCount).toFixed(1);
});

const averageBinsPerWarehouse = computed(() => {
  if (props.stats.warehouseCount === 0) {
    return 0;
  }
  return (props.stats.binCount / props.stats.warehouseCount).toFixed(1);
});

// 获取仓库类型文本
const getWarehouseTypeText = (type) => {
  const typeMap = {
    1: '主仓库',
    2: '分仓库',
    3: '临时仓库',
  };
  return typeMap[type] || '未知';
};

// 导航
const handleNavigate = (tab) => {
  emit('navigate', tab);
};

// 刷新活动
const refreshActivities = () => {
  emit('refresh');
};
</script>

<style scoped lang="scss">
.data-overview {
  padding: 20px;

  .overview-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    padding: 20px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      &.warehouse {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.zone {
        background-color: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.bin {
        background-color: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      .el-icon {
        font-size: 24px;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--el-text-color-primary);
      }

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }
  }

  .distribution-chart {
    .chart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;

      .chart-label {
        color: var(--el-text-color-secondary);
      }

      .chart-value {
        font-size: 18px;
        font-weight: bold;
        color: var(--el-color-primary);
      }
    }
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .el-button {
      flex: 1;
      min-width: 120px;
    }
  }
}
</style>
