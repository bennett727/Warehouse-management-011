<!--
  @file: ProcessFlowProgress.vue
  @description: 流程进度条组件 - 显示业务流程的当前进度
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 1.0
-->
<template>
  <div class="process-flow-progress">
    <el-steps :active="currentStep" finish-status="success" :process-status="processStatus">
      <el-step
        v-for="(step, index) in steps"
        :key="step.key || index"
        :title="step.title"
        :description="step.description"
        :icon="getIcon(step.icon)"
      />
    </el-steps>

    <!-- 当前状态提示 -->
    <div v-if="currentStatusInfo" class="current-status-info">
      <el-alert
        :title="currentStatusInfo.title"
        :type="currentStatusInfo.type"
        :description="currentStatusInfo.description"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { Edit, Upload, CircleCheck, Check, Timer, Close, Warning, InfoFilled } from '@element-plus/icons-vue';
import { computed } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  status: {
    type: [Number, String],
    default: null,
  },
});

// 图标映射
const iconMap = {
  Edit,
  Upload,
  CircleCheck,
  Check,
  Timer,
  Close,
  Warning,
  InfoFilled,
};

// 获取图标
const getIcon = (iconName) => {
  return iconMap[iconName] || InfoFilled;
};

// 处理状态
const processStatus = computed(() => {
  if (props.status === -1 || props.status === -2) {
    return 'error';
  }
  return 'process';
});

// 当前状态信息
const currentStatusInfo = computed(() => {
  if (props.status === -1) {
    return {
      title: '已取消',
      type: 'info',
      description: '该流程已被取消',
    };
  }
  if (props.status === -2) {
    return {
      title: '已驳回',
      type: 'error',
      description: '该流程已被驳回，请修改后重新提交',
    };
  }
  return null;
});
</script>

<style scoped>
.process-flow-progress {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.current-status-info {
  margin-top: 16px;
}
</style>
