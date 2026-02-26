<!--
  @file: BatchOperationProgress.vue
  @description: 批量操作进度对话框组件
  @author: 开发团队
  @createTime: 2026-02-13
  @version: 1.0.0
-->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!isProcessing"
    data-cy="batch-operation-progress-dialog"
  >
    <div class="batch-progress-content">
      <!-- 进度条 -->
      <div class="progress-section">
        <el-progress :percentage="progressPercentage" :status="progressStatus" :stroke-width="20" :text-inside="true" />
      </div>

      <!-- 统计信息 -->
      <div class="statistics-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-label">总数</div>
              <div class="stat-value total">{{ total }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-label">成功</div>
              <div class="stat-value success">{{ success }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-label">失败</div>
              <div class="stat-value failed">{{ failed }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 处理中提示 -->
      <div v-if="isProcessing" class="processing-tip">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>正在处理中，请稍候...</span>
      </div>

      <!-- 结果列表 -->
      <div v-if="showResults && results.length > 0" class="results-section">
        <el-divider>处理结果</el-divider>
        <el-scrollbar max-height="200px">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="result-item"
            :class="{ success: result.success, failed: !result.success }"
          >
            <el-icon v-if="result.success" class="result-icon"><CircleCheck /></el-icon>
            <el-icon v-else class="result-icon"><CircleClose /></el-icon>
            <span class="result-message">{{ result.message }}</span>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <el-button v-if="!isProcessing" @click="handleClose" data-cy="batch-progress-close-btn">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '批量操作进度',
  },
  total: {
    type: Number,
    default: 0,
  },
  success: {
    type: Number,
    default: 0,
  },
  failed: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
  results: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'close']);

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 进度百分比
const progressPercentage = computed(() => {
  if (props.total === 0) {
    return 0;
  }
  return Math.round(((props.success + props.failed) / props.total) * 100);
});

// 是否处理中
const isProcessing = computed(() => {
  return props.progress < 100 && props.success + props.failed < props.total;
});

// 进度状态
const progressStatus = computed(() => {
  if (props.failed > 0 && props.failed === props.total) {
    return 'exception';
  }
  if (props.success === props.total) {
    return 'success';
  }
  return '';
});

// 是否显示结果
const showResults = computed(() => {
  return !isProcessing.value && props.results.length > 0;
});

// 关闭处理
const handleClose = () => {
  visible.value = false;
  emit('close');
};
</script>

<style scoped>
.batch-progress-content {
  padding: 20px 0;
}

.progress-section {
  margin-bottom: 30px;
}

.statistics-section {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-value.total {
  color: var(--el-text-color-primary);
}

.stat-value.success {
  color: var(--el-color-success);
}

.stat-value.failed {
  color: var(--el-color-danger);
}

.processing-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.results-section {
  margin-top: 20px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}

.result-item.success {
  background-color: var(--el-color-success-light-9);
}

.result-item.failed {
  background-color: var(--el-color-danger-light-9);
}

.result-icon {
  font-size: 18px;
}

.result-item.success .result-icon {
  color: var(--el-color-success);
}

.result-item.failed .result-icon {
  color: var(--el-color-danger);
}

.result-message {
  flex: 1;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
</style>
