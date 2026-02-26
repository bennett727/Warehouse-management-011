<!--
  @file: AuditHistoryTimeline.vue
  @description: 审批历史时间线组件
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 1.0
-->
<template>
  <div class="audit-history-timeline">
    <div class="timeline-header">
      <div class="header-title">
        <el-icon><Timer /></el-icon>
        <span>审批历史</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" link size="small" @click="handleExport" data-cy="audit-history-export-btn">
          <el-icon><Download /></el-icon>
          导出记录
        </el-button>
      </div>
    </div>

    <el-timeline v-if="historyList.length > 0">
      <el-timeline-item
        v-for="(item, index) in historyList"
        :key="index"
        :type="getTimelineItemType(item)"
        :color="getTimelineItemColor(item)"
        :icon="getTimelineItemIcon(item)"
        :timestamp="formatTimestamp(item.timestamp)"
        placement="top"
        :data-cy="`audit-timeline-item-${index}`"
      >
        <div class="timeline-content">
          <div class="content-header">
            <span class="action-label">{{ item.actionLabel }}</span>
            <el-tag :type="getStatusTagType(item)" size="small">
              {{ item.statusText }}
            </el-tag>
          </div>

          <div class="content-body">
            <div class="operator-info">
              <el-avatar :size="24" :src="item.operatorAvatar">
                {{ item.operatorName?.charAt(0) }}
              </el-avatar>
              <span class="operator-name">{{ item.operatorName }}</span>
              <span class="operator-role">({{ item.operatorRole }})</span>
            </div>

            <div v-if="item.comment" class="comment-box">
              <el-icon><ChatDotRound /></el-icon>
              <span class="comment-text">{{ item.comment }}</span>
            </div>

            <div v-if="item.changes && item.changes.length > 0" class="changes-list">
              <div class="changes-title">变更内容：</div>
              <div v-for="(change, idx) in item.changes" :key="idx" class="change-item">
                <span class="field-name">{{ change.field }}:</span>
                <span class="old-value">{{ change.oldValue || '-' }}</span>
                <el-icon><ArrowRight /></el-icon>
                <span class="new-value">{{ change.newValue || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="content-footer">
            <span class="ip-address">IP: {{ item.ipAddress }}</span>
            <span class="duration" v-if="item.duration"> 耗时: {{ formatDuration(item.duration) }} </span>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <el-empty v-else description="暂无审批历史记录" data-cy="audit-history-empty" />

    <!-- 统计信息 -->
    <div v-if="showStatistics && historyList.length > 0" class="statistics-section" data-cy="audit-statistics-section">
      <el-divider>统计信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item" data-cy="audit-stat-total">
            <div class="stat-value">{{ statistics.totalCount }}</div>
            <div class="stat-label">总审批次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item" data-cy="audit-stat-approve">
            <div class="stat-value" style="color: #67c23a">{{ statistics.approveCount }}</div>
            <div class="stat-label">通过次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item" data-cy="audit-stat-reject">
            <div class="stat-value" style="color: #f56c6c">{{ statistics.rejectCount }}</div>
            <div class="stat-label">驳回次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item" data-cy="audit-stat-duration">
            <div class="stat-value">{{ formatDuration(statistics.avgDuration) }}</div>
            <div class="stat-label">平均审批耗时</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import {
  Timer,
  Download,
  ChatDotRound,
  ArrowRight,
  Check,
  Close,
  CircleCheck,
  Warning,
  InfoFilled,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';

const props = defineProps({
  historyList: {
    type: Array,
    default: () => [],
  },
  showStatistics: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['export']);

// 时间线类型映射
const actionTypeMap = {
  submit: { type: 'primary', color: '#409EFF', icon: 'InfoFilled' },
  audit: { type: 'success', color: '#67C23A', icon: 'Check' },
  approve: { type: 'success', color: '#67C23A', icon: 'CircleCheck' },
  reject: { type: 'danger', color: '#F56C6C', icon: 'Close' },
  cancel: { type: 'info', color: '#909399', icon: 'Close' },
  execute: { type: 'warning', color: '#E6A23C', icon: 'Check' },
  complete: { type: 'success', color: '#67C23A', icon: 'CircleCheck' },
  default: { type: 'info', color: '#909399', icon: 'InfoFilled' },
};

// 状态标签类型映射
const statusTagTypeMap = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'info',
  completed: 'success',
};

/**
 * 获取时间线项类型
 */
const getTimelineItemType = (item) => {
  return actionTypeMap[item.action]?.type || actionTypeMap.default.type;
};

/**
 * 获取时间线项颜色
 */
const getTimelineItemColor = (item) => {
  return actionTypeMap[item.action]?.color || actionTypeMap.default.color;
};

/**
 * 获取时间线项图标
 */
const getTimelineItemIcon = (item) => {
  const iconName = actionTypeMap[item.action]?.icon || actionTypeMap.default.icon;
  return iconName;
};

/**
 * 获取状态标签类型
 */
const getStatusTagType = (item) => {
  return statusTagTypeMap[item.status] || 'info';
};

/**
 * 格式化时间戳
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 格式化耗时
 */
const formatDuration = (duration) => {
  if (!duration || duration <= 0) {
    return '-';
  }

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  }
  return `${seconds}秒`;
};

/**
 * 统计数据
 */
const statistics = computed(() => {
  const list = props.historyList;
  const totalCount = list.length;
  const approveCount = list.filter((item) => item.action === 'approve' || item.action === 'audit').length;
  const rejectCount = list.filter((item) => item.action === 'reject').length;

  const durations = list.filter((item) => item.duration && item.duration > 0).map((item) => item.duration);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return {
    totalCount,
    approveCount,
    rejectCount,
    avgDuration,
  };
});

/**
 * 导出记录
 */
const handleExport = () => {
  emit('export', props.historyList);
  ElMessage.success('审批历史导出成功');
};
</script>

<style scoped>
.audit-history-timeline {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.timeline-content {
  background-color: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.action-label {
  font-weight: 500;
  color: #303133;
}

.content-body {
  margin-bottom: 12px;
}

.operator-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator-name {
  font-weight: 500;
  color: #606266;
}

.operator-role {
  color: #909399;
  font-size: 12px;
}

.comment-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 8px;
}

.comment-text {
  color: #606266;
  line-height: 1.5;
  flex: 1;
}

.changes-list {
  margin-top: 8px;
}

.changes-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 4px;
}

.field-name {
  color: #606266;
}

.old-value {
  color: #f56c6c;
  text-decoration: line-through;
}

.new-value {
  color: #67c23a;
  font-weight: 500;
}

.content-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.statistics-section {
  margin-top: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}
</style>
