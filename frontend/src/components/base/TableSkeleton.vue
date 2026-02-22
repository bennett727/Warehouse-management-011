<!--
  @file: TableSkeleton.vue
  @description: 增强版表格骨架屏组件，支持多种布局模式
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 2.0
  @modifyRecords:
      2026-02-08: 增强组件功能，支持多种布局模式，替代DashboardSkeleton和StatisticsSkeleton
-->
<template>
  <div class="table-skeleton" :class="`table-skeleton--${layout}`">
    <el-skeleton animated :rows="rows" :loading="loading">
      <template #template>
        <div v-if="layout === 'table'" class="skeleton-table">
          <div class="skeleton-header">
            <el-skeleton-item
              v-for="(col, index) in columns"
              :key="`header-${index}`"
              variant="text"
              :style="{ width: col.width || '120px', height: '40px' }"
            />
          </div>
          <div v-for="i in rows" :key="`row-${i}`" class="skeleton-row">
            <el-skeleton-item
              v-for="(col, index) in columns"
              :key="`cell-${i}-${index}`"
              variant="text"
              :style="{ width: col.width || '120px', height: '50px' }"
            />
          </div>
        </div>

        <div v-else-if="layout === 'dashboard'" class="skeleton-dashboard">
          <div class="skeleton-tree">
            <el-skeleton-item variant="rect" style="width: 100%; height: 400px; border-radius: 4px" />
          </div>
          <div class="skeleton-info">
            <div class="skeleton-section">
              <el-skeleton-item variant="rect" style="width: 100%; height: 200px; border-radius: 4px" />
            </div>
            <div class="skeleton-section">
              <el-skeleton-item variant="rect" style="width: 100%; height: 300px; border-radius: 4px" />
            </div>
            <div class="skeleton-section">
              <el-skeleton-item variant="rect" style="width: 100%; height: 400px; border-radius: 4px" />
            </div>
          </div>
        </div>

        <div v-else-if="layout === 'statistics'" class="skeleton-statistics">
          <el-row :gutter="20">
            <el-col v-for="i in 4" :key="`stat-${i}`" :span="6">
              <div class="stat-item-skeleton">
                <el-skeleton-item variant="circle" style="width: 48px; height: 48px" />
                <div class="stat-info-skeleton">
                  <el-skeleton-item variant="text" style="width: 80px; height: 28px; margin-bottom: 8px" />
                  <el-skeleton-item variant="text" style="width: 60px; height: 14px" />
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="6">
              <div class="stat-item-skeleton">
                <el-skeleton-item variant="circle" style="width: 48px; height: 48px" />
                <div class="stat-info-skeleton">
                  <el-skeleton-item variant="text" style="width: 80px; height: 28px; margin-bottom: 8px" />
                  <el-skeleton-item variant="text" style="width: 60px; height: 14px" />
                </div>
              </div>
            </el-col>
            <el-col :span="18">
              <div class="stat-chart-skeleton">
                <el-skeleton-item variant="text" style="width: 120px; height: 20px; margin-bottom: 16px" />
                <div class="chart-bars-skeleton">
                  <div v-for="i in 4" :key="`bar-${i}`" class="chart-bar-skeleton">
                    <el-skeleton-item variant="text" style="width: 60px; height: 14px" />
                    <el-skeleton-item
                      variant="rect"
                      style="flex: 1; height: 24px; margin-left: 12px; border-radius: 4px"
                    />
                    <el-skeleton-item variant="text" style="width: 40px; height: 14px; margin-left: 12px" />
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-else-if="layout === 'area-info'" class="skeleton-area-info">
          <el-skeleton :rows="6" animated />
          <el-divider content-position="left">设备统计</el-divider>
          <el-row :gutter="20">
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-card-skeleton">
                <el-skeleton-item variant="circle" style="width: 28px; height: 28px" />
                <div class="stat-content-skeleton">
                  <el-skeleton-item variant="text" style="width: 60px; height: 24px; margin-bottom: 4px" />
                  <el-skeleton-item variant="text" style="width: 40px; height: 12px" />
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-card-skeleton">
                <el-skeleton-item variant="circle" style="width: 28px; height: 28px" />
                <div class="stat-content-skeleton">
                  <el-skeleton-item variant="text" style="width: 60px; height: 24px; margin-bottom: 4px" />
                  <el-skeleton-item variant="text" style="width: 40px; height: 12px" />
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-card-skeleton">
                <el-skeleton-item variant="circle" style="width: 28px; height: 28px" />
                <div class="stat-content-skeleton">
                  <el-skeleton-item variant="text" style="width: 60px; height: 24px; margin-bottom: 4px" />
                  <el-skeleton-item variant="text" style="width: 40px; height: 12px" />
                </div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-card-skeleton">
                <el-skeleton-item variant="circle" style="width: 28px; height: 28px" />
                <div class="stat-content-skeleton">
                  <el-skeleton-item variant="text" style="width: 60px; height: 24px; margin-bottom: 4px" />
                  <el-skeleton-item variant="text" style="width: 40px; height: 12px" />
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <div class="stat-card-skeleton">
                <el-skeleton-item variant="circle" style="width: 28px; height: 28px" />
                <div class="stat-content-skeleton">
                  <el-skeleton-item variant="text" style="width: 60px; height: 24px; margin-bottom: 4px" />
                  <el-skeleton-item variant="text" style="width: 40px; height: 12px" />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: true,
  },
  layout: {
    type: String,
    default: 'table',
    validator: (value) => ['table', 'dashboard', 'statistics', 'area-info'].includes(value),
  },
  columns: {
    type: Array,
    default: () => [
      { width: '100px' },
      { width: '120px' },
      { width: '150px' },
      { width: '120px' },
      { width: '100px' },
      { width: '120px' },
      { width: '120px' },
      { width: '150px' },
      { width: '150px' },
      { width: '120px' },
      { width: '100px' },
    ],
  },
  rows: {
    type: Number,
    default: 5,
  },
});
</script>

<style scoped>
.table-skeleton {
  width: 100%;
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.skeleton-header {
  display: flex;
  gap: 0;
  background-color: #f5f7fa;
  padding: 12px 0;
  border-radius: 4px 4px 0 0;
}

.skeleton-row {
  display: flex;
  gap: 0;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.skeleton-row:last-child {
  border-bottom: none;
  border-radius: 0 0 4px 4px;
}

.skeleton-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.skeleton-dashboard .skeleton-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.skeleton-tree {
  width: 300px;
  flex-shrink: 0;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-section {
  width: 100%;
}

.skeleton-statistics {
  padding: 20px;
}

.stat-item-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.stat-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-chart-skeleton {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.chart-bars-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar-skeleton {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-area-info {
  padding: 20px;
}

.stat-card-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.stat-content-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
