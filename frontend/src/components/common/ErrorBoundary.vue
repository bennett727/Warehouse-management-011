<!--
  @file: ErrorBoundary.vue
  @description: 错误边界组件，用于捕获和处理组件中的错误
  @status: 待使用 - 功能完整但未被引用
  @保留原因: 适用于需要全局错误处理的场景，提升系统稳定性和用户体验
  @适用场景: 全局错误捕获、页面级错误处理、组件级错误边界
  @功能特点: 自动捕获全局错误、提供友好的错误提示、支持错误详情查看
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
  @未来计划: 在App.vue中集成，提供全局错误处理机制
-->
<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />
    <div v-else class="error-fallback">
      <el-result icon="error" title="页面出现错误" :sub-title="errorMessage">
        <template #extra>
          <el-button type="primary" @click="handleRetry">重试</el-button>
          <el-button @click="handleGoHome">返回首页</el-button>
          <el-button v-if="showDetails" link type="info" @click="toggleDetails">
            {{ showDetailsContent ? '隐藏详情' : '查看详情' }}
          </el-button>
        </template>
      </el-result>

      <el-collapse-transition>
        <div v-show="showDetailsContent" class="error-details">
          <el-card>
            <template #header>
              <span>错误详情</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="错误类型">{{ errorType }}</el-descriptions-item>
              <el-descriptions-item label="错误信息">{{ errorMessage }}</el-descriptions-item>
              <el-descriptions-item label="发生时间">{{ errorTime }}</el-descriptions-item>
              <el-descriptions-item label="错误堆栈">
                <pre class="error-stack">{{ errorStack }}</pre>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { logUiError } from '@/utils/errors/errorMonitor';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ErrorBoundary');
const router = useRouter();

const props = defineProps({
  fallback: {
    type: String,
    default: '页面出现错误，请稍后重试',
  },
  showDetails: {
    type: Boolean,
    default: true,
  },
  onError: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['error', 'retry']);

const hasError = ref(false);
const errorMessage = ref(props.fallback);
const errorType = ref('');
const errorTime = ref('');
const errorStack = ref('');
const showDetailsContent = ref(false);

const handleError = (error) => {
  hasError.value = true;
  errorMessage.value = error.message || props.fallback;
  errorType.value = error.name || 'Error';
  errorTime.value = new Date().toLocaleString();
  errorStack.value = error.stack || '';

  logUiError('ErrorBoundary', error, {
    message: errorMessage.value,
    type: errorType.value,
  });

  logger.error('ErrorBoundary捕获到错误:', error);

  if (props.onError) {
    props.onError(error);
  }

  emit('error', error);
};

const handleRetry = () => {
  hasError.value = false;
  errorMessage.value = props.fallback;
  errorType.value = '';
  errorTime.value = '';
  errorStack.value = '';
  showDetailsContent.value = false;

  emit('retry');
};

const handleGoHome = () => {
  router.push('/');
};

const toggleDetails = () => {
  showDetailsContent.value = !showDetailsContent.value;
};

const setupErrorHandlers = () => {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
};

const removeErrorHandlers = () => {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
};

const handleGlobalError = (event) => {
  handleError(event.error || new Error(event.message));
};

const handleUnhandledRejection = (event) => {
  handleError(event.reason || new Error('Promise rejection'));
};

onMounted(() => {
  setupErrorHandlers();
});

onUnmounted(() => {
  removeErrorHandlers();
});

defineExpose({
  handleError,
  hasError,
});
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-fallback {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-details {
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
}

.error-stack {
  margin: 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
