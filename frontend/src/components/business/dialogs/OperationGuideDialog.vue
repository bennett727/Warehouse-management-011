<!--
  @file: OperationGuideDialog.vue
  @description: 操作指引对话框组件
  @author: 开发团队
  @createTime: 2026-02-13
  @version: 1.0.0
-->
<template>
  <el-dialog v-model="visible" :title="title" width="600px" :close-on-click-modal="true" :close-on-press-escape="true" data-cy="operation-guide-dialog">
    <div class="operation-guide-content">
      <el-steps :active="activeStep" direction="vertical">
        <el-step v-for="(step, index) in steps" :key="index" :title="step.title" :description="step.description">
          <template #icon>
            <el-icon v-if="step.icon" :size="24">
              <component :is="getIconComponent(step.icon)" />
            </el-icon>
            <span v-else>{{ index + 1 }}</span>
          </template>
        </el-step>
      </el-steps>
    </div>

    <template #footer>
      <el-button @click="handleClose" data-cy="operation-guide-close-btn">关闭</el-button>
      <el-button type="primary" @click="handleStart" data-cy="operation-guide-start-btn">开始操作</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Document, Edit, Check, Upload, Download, Search, Setting, InfoFilled } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '操作指引',
  },
  steps: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'close', 'start']);

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 当前活动步骤
const activeStep = ref(0);

// 图标映射
const iconMap = {
  Document,
  Edit,
  Check,
  Upload,
  Download,
  Search,
  Setting,
  InfoFilled,
};

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || InfoFilled;
};

// 关闭处理
const handleClose = () => {
  visible.value = false;
  emit('close');
};

// 开始操作
const handleStart = () => {
  visible.value = false;
  emit('start');
};
</script>

<style scoped>
.operation-guide-content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

:deep(.el-step__title) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-step__description) {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}
</style>
