<!--
  @file: BaseStatusTag.vue
  @description: 基础状态标签组件 - 统一的状态显示组件
  @author: AI架构专家
  @createTime: 2026-02-14
  @version: 1.0
-->
<template>
  <el-tag
    :type="tagType"
    :size="size"
    :effect="effect"
    :class="['base-status-tag', `status-${normalizedStatus}`]"
    :data-cy="`status-tag-${normalizedStatus}`"
  >
    <el-icon v-if="showIcon" class="tag-icon">
      <component :is="statusIcon" />
    </el-icon>
    <span data-cy="status-tag-text">{{ displayText }}</span>
  </el-tag>
</template>

<script setup>
import {
  CircleCheck,
  CircleClose,
  Clock,
  Delete,
  Edit,
  Loading,
  QuestionFilled,
  RemoveFilled,
  Warning,
} from '@element-plus/icons-vue';
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: [String, Number],
    required: true,
  },
  preset: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'device', 'inventory', 'task', 'order', 'approval'].includes(val),
  },
  size: {
    type: String,
    default: 'default',
    validator: (val) => ['large', 'default', 'small'].includes(val),
  },
  effect: {
    type: String,
    default: 'light',
    validator: (val) => ['dark', 'light', 'plain'].includes(val),
  },
  showIcon: {
    type: Boolean,
    default: false,
  },
  customText: {
    type: String,
    default: null,
  },
});

const normalizedStatus = computed(() => {
  if (typeof props.status === 'number') {
    return props.status.toString();
  }
  return (props.status || '').toLowerCase();
});

const STATUS_CONFIG = {
  default: {
    active: { text: '启用', type: 'success', icon: CircleCheck },
    inactive: { text: '禁用', type: 'info', icon: RemoveFilled },
    pending: { text: '待处理', type: 'warning', icon: Clock },
    processing: { text: '处理中', type: 'primary', icon: Loading },
    completed: { text: '已完成', type: 'success', icon: CircleCheck },
    failed: { text: '失败', type: 'danger', icon: CircleClose },
    cancelled: { text: '已取消', type: 'info', icon: Delete },
  },
  device: {
    1: { text: '在库', type: 'success', icon: CircleCheck },
    2: { text: '在用', type: 'primary', icon: CircleCheck },
    3: { text: '维修中', type: 'warning', icon: Edit },
    4: { text: '报废', type: 'danger', icon: Delete },
    5: { text: '待入库', type: 'info', icon: Clock },
    in_stock: { text: '在库', type: 'success', icon: CircleCheck },
    in_use: { text: '在用', type: 'primary', icon: CircleCheck },
    maintenance: { text: '维修中', type: 'warning', icon: Edit },
    scrapped: { text: '已报废', type: 'danger', icon: Delete },
    pending: { text: '待入库', type: 'info', icon: Clock },
  },
  inventory: {
    normal: { text: '正常', type: 'success', icon: CircleCheck },
    low: { text: '库存不足', type: 'warning', icon: Warning },
    overstock: { text: '库存过剩', type: 'warning', icon: Warning },
    out_of_stock: { text: '缺货', type: 'danger', icon: CircleClose },
    reserved: { text: '已预留', type: 'info', icon: Clock },
  },
  task: {
    pending: { text: '待处理', type: 'info', icon: Clock },
    in_progress: { text: '进行中', type: 'primary', icon: Loading },
    completed: { text: '已完成', type: 'success', icon: CircleCheck },
    cancelled: { text: '已取消', type: 'info', icon: Delete },
    failed: { text: '失败', type: 'danger', icon: CircleClose },
  },
  order: {
    draft: { text: '草稿', type: 'info', icon: Edit },
    pending: { text: '待审批', type: 'warning', icon: Clock },
    approved: { text: '已通过', type: 'success', icon: CircleCheck },
    rejected: { text: '已驳回', type: 'danger', icon: CircleClose },
    executing: { text: '执行中', type: 'primary', icon: Loading },
    completed: { text: '已完成', type: 'success', icon: CircleCheck },
    cancelled: { text: '已取消', type: 'info', icon: Delete },
  },
  approval: {
    pending: { text: '待审批', type: 'warning', icon: Clock },
    approved: { text: '已通过', type: 'success', icon: CircleCheck },
    rejected: { text: '已驳回', type: 'danger', icon: CircleClose },
    withdrawn: { text: '已撤回', type: 'info', icon: Delete },
  },
};

const currentConfig = computed(() => {
  const presetConfig = STATUS_CONFIG[props.preset] || STATUS_CONFIG.default;
  return (
    presetConfig[normalizedStatus.value] || {
      text: props.customText || normalizedStatus.value,
      type: 'info',
      icon: QuestionFilled,
    }
  );
});

const tagType = computed(() => currentConfig.value.type);
const displayText = computed(() => props.customText || currentConfig.value.text);
const statusIcon = computed(() => currentConfig.value.icon);
</script>

<style scoped>
.base-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-icon {
  font-size: 12px;
}

.status-pending,
.status-draft {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
