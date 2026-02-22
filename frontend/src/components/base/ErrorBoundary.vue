<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__content">
      <div class="error-boundary__icon">
        <el-icon :size="64" color="#f56c6c">
          <WarningFilled />
        </el-icon>
      </div>
      <h2 class="error-boundary__title">页面出现错误</h2>
      <p class="error-boundary__message">{{ displayMessage }}</p>
      <div v-if="showDetails" class="error-boundary__details">
        <el-collapse>
          <el-collapse-item title="错误详情" name="details">
            <pre class="error-boundary__stack">{{ errorStack }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="error-boundary__actions">
        <el-button type="primary" @click="handleReset">
          <el-icon><RefreshRight /></el-icon>
          重试
        </el-button>
        <el-button @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="toggleDetails">
          <el-icon><View /></el-icon>
          {{ showDetails ? '隐藏详情' : '查看详情' }}
        </el-button>
      </div>
      <p class="error-boundary__trace-id" v-if="traceId">
        追踪ID: <code>{{ traceId }}</code>
      </p>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { WarningFilled, RefreshRight, HomeFilled, View } from '@element-plus/icons-vue';
import { ref, onErrorCaptured, computed } from 'vue';
import { useRouter } from 'vue-router';

import { logUiError } from '@/utils/errors/errorMonitor';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ErrorBoundary');

const props = defineProps({
  fallbackMessage: {
    type: String,
    default: '页面加载时发生错误，请稍后重试',
  },
  showStackTrace: {
    type: Boolean,
    default: import.meta.env.DEV,
  },
  onError: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['error', 'reset']);

const router = useRouter();

const hasError = ref(false);
const errorMessage = ref('');
const errorStack = ref('');
const showDetails = ref(false);
const traceId = ref('');

const displayMessage = computed(() => {
  return errorMessage.value || props.fallbackMessage;
});

onErrorCaptured((error, instance, info) => {
  hasError.value = true;
  errorMessage.value = error.message || '未知错误';
  errorStack.value = error.stack || '';
  traceId.value = generateTraceId();

  logUiError('ErrorBoundary', error, {
    component: instance?.$options?.name || 'Unknown',
    info,
    traceId: traceId.value,
  });

  logger.error('ErrorBoundary捕获错误', error, {
    component: instance?.$options?.name,
    info,
  });

  if (props.onError) {
    props.onError(error, instance, info);
  }

  emit('error', { error, instance, info, traceId: traceId.value });

  return false;
});

function generateTraceId() {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function handleReset() {
  hasError.value = false;
  errorMessage.value = '';
  errorStack.value = '';
  showDetails.value = false;
  traceId.value = '';

  emit('reset');
}

function handleGoHome() {
  hasError.value = false;
  errorMessage.value = '';
  errorStack.value = '';
  showDetails.value = false;
  traceId.value = '';

  router.push('/');
}

function toggleDetails() {
  showDetails.value = !showDetails.value;
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
}

.error-boundary__content {
  text-align: center;
  max-width: 600px;
}

.error-boundary__icon {
  margin-bottom: 24px;
}

.error-boundary__title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.error-boundary__message {
  font-size: 16px;
  color: #606266;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.error-boundary__details {
  margin: 24px 0;
  text-align: left;
}

.error-boundary__stack {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.error-boundary__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.error-boundary__trace-id {
  margin-top: 24px;
  font-size: 12px;
  color: #909399;
}

.error-boundary__trace-id code {
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
