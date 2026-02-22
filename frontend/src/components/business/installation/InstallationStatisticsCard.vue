<!--
  @file: InstallationStatisticsCard.vue
  @description: 安装统计卡片组件，展示安装记录的统计数据
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
  @modifyRecords:
      2026-02-14: 优化字段映射，支持更多统计维度
-->
<template>
  <el-card class="installation-statistics-card" shadow="never" v-loading="loading">
    <div class="device-stats">
      <div class="stat-item" @click="handleClick('total')">
        <div class="stat-icon total">
          <el-icon :size="24"><Tools /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalCount || statistics.total || 0 }}</span>
          <span class="stat-label">安装总数</span>
        </div>
      </div>
      <div class="stat-item" @click="handleClick('pending')">
        <div class="stat-icon warning">
          <el-icon :size="24"><Timer /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.pendingCount || statistics.pending || 0 }}</span>
          <span class="stat-label">待安装</span>
        </div>
      </div>
      <div class="stat-item" @click="handleClick('installing')">
        <div class="stat-icon info">
          <el-icon :size="24"><Loading /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.installingCount || 0 }}</span>
          <span class="stat-label">安装中</span>
        </div>
      </div>
      <div class="stat-item" @click="handleClick('completed')">
        <div class="stat-icon success">
          <el-icon :size="24"><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.completedCount || statistics.completed || 0 }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Tools, Timer, Loading, CircleCheck } from '@element-plus/icons-vue';

const props = defineProps({
  statistics: {
    type: Object,
    default: () => ({
      totalCount: 0,
      pendingCount: 0,
      installingCount: 0,
      completedCount: 0,
      total: 0,
      pending: 0,
      completed: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['stat-click']);

const handleClick = (type) => {
  emit('stat-click', type);
};
</script>

<style scoped>
.installation-statistics-card {
  margin-bottom: 16px;
}

.device-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #409eff 0%, #1677ff 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #faad14 100%);
}

.stat-icon.info {
  background: linear-gradient(135deg, #909399 0%, #bfbfbf 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

@media screen and (max-width: 768px) {
  .device-stats {
    flex-direction: column;
  }

  .stat-item {
    min-width: 100%;
  }
}
</style>
