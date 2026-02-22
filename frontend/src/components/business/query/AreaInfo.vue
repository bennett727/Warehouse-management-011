<!--
  @file: AreaInfo.vue
  @description: 区域信息组件，展示选中区域的详细信息和统计数据
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div class="area-info" v-loading="loading">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="区域名称">{{ area?.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="区域编码">{{ area?.code || '-' }}</el-descriptions-item>
      <el-descriptions-item label="区域类型">{{ getAreaTypeText(area?.type) }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ area?.manager || '-' }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ area?.phone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ area?.address || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-divider />

    <div class="statistics-section">
      <h4>设备统计</h4>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics?.total || 0 }}</div>
            <div class="stat-label">设备总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics?.online || 0 }}</div>
            <div class="stat-label">在线设备</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics?.offline || 0 }}</div>
            <div class="stat-label">离线设备</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics?.alert || 0 }}</div>
            <div class="stat-label">告警设备</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-divider />

    <div class="status-distribution">
      <h4>状态分布</h4>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="status-item">
            <el-tag type="success">在库</el-tag>
            <span class="status-count">{{ statistics?.inStock || 0 }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="status-item">
            <el-tag type="primary">已安装</el-tag>
            <span class="status-count">{{ statistics?.installed || 0 }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="status-item">
            <el-tag type="warning">维修中</el-tag>
            <span class="status-count">{{ statistics?.repairing || 0 }}</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
defineProps({
  area: {
    type: Object,
    default: null,
  },
  statistics: {
    type: Object,
    default: () => ({
      total: 0,
      online: 0,
      offline: 0,
      alert: 0,
      inStock: 0,
      installed: 0,
      repairing: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const getAreaTypeText = (type) => {
  const typeMap = {
    building: '建筑物',
    floor: '楼层',
    room: '房间',
    area: '区域',
  };
  return typeMap[type] || type || '-';
};
</script>

<style scoped>
.area-info {
  padding: 16px;
}

.statistics-section,
.status-distribution {
  margin-top: 20px;
}

.statistics-section h4,
.status-distribution h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.status-count {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>
