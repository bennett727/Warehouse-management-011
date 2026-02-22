<!--
  @file: InventoryStatisticsCard.vue
  @description: 库存统计卡片组件，用于展示库存统计数据
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div class="inventory-statistics" data-cy="inventory-statistics-container">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-card-total" data-cy="stat-card-total-stock" @click="handleCardClick('total')">
          <div class="stat-icon">
            <el-icon :size="32"><Box /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-total-stock">{{ statistics.totalStock || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-total-stock">库存总数</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div
          class="stat-card stat-card-inbound"
          data-cy="stat-card-monthly-inbound"
          @click="handleCardClick('inbound')"
        >
          <div class="stat-icon">
            <el-icon :size="32"><CirclePlus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-monthly-inbound">{{ statistics.monthlyInbound || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-monthly-inbound">本月入库</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div
          class="stat-card stat-card-outbound"
          data-cy="stat-card-monthly-outbound"
          @click="handleCardClick('outbound')"
        >
          <div class="stat-icon">
            <el-icon :size="32"><Remove /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-monthly-outbound">{{ statistics.monthlyOutbound || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-monthly-outbound">本月出库</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stat-card stat-card-alert" data-cy="stat-card-alert-count" @click="handleCardClick('alert')">
          <div class="stat-icon">
            <el-icon :size="32"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-alert-count">{{ statistics.alertCount || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-alert-count">预警数量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="12" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="stat-card stat-card-today-inbound" data-cy="stat-card-today-inbound">
          <div class="stat-icon">
            <el-icon :size="32"><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-today-inbound">{{ statistics.todayInbound || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-today-inbound">今日入库</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="stat-card stat-card-today-outbound" data-cy="stat-card-today-outbound">
          <div class="stat-icon">
            <el-icon :size="32"><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-today-outbound">{{ statistics.todayOutbound || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-today-outbound">今日出库</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="stat-card stat-card-total-inbound" data-cy="stat-card-total-inbound">
          <div class="stat-icon">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" data-cy="stat-value-total-inbound">{{ statistics.totalInbound || 0 }}</div>
            <div class="stat-label" data-cy="stat-label-total-inbound">累计入库</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Box, CirclePlus, Remove, Warning, Calendar, Document } from '@element-plus/icons-vue';

defineProps({
  statistics: {
    type: Object,
    default: () => ({
      totalStock: 0,
      monthlyInbound: 0,
      monthlyOutbound: 0,
      alertCount: 0,
      todayInbound: 0,
      todayOutbound: 0,
      totalInbound: 0,
      totalOutbound: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['card-click']);

const handleCardClick = (type) => {
  emit('card-click', type);
};
</script>

<style scoped>
.inventory-statistics {
  padding: 10px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-card-total .stat-icon {
  background: #ecf5ff;
  color: #409eff;
}

.stat-card-total .stat-value {
  color: #409eff;
}

.stat-card-inbound .stat-icon {
  background: #f0f9ff;
  color: #67c23a;
}

.stat-card-inbound .stat-value {
  color: #67c23a;
}

.stat-card-outbound .stat-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-card-outbound .stat-value {
  color: #e6a23c;
}

.stat-card-alert .stat-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-card-alert .stat-value {
  color: #f56c6c;
}

.stat-card-today-inbound .stat-icon {
  background: #f0f9ff;
  color: #67c23a;
}

.stat-card-today-inbound .stat-value {
  color: #67c23a;
}

.stat-card-today-outbound .stat-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-card-today-outbound .stat-value {
  color: #e6a23c;
}

.stat-card-total-inbound .stat-icon {
  background: #ecf5ff;
  color: #409eff;
}

.stat-card-total-inbound .stat-value {
  color: #409eff;
}

@media (max-width: 767px) {
  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 12px;
  }
}
</style>
