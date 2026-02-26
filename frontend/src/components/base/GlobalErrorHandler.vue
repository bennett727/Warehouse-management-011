<!--
  @file: GlobalErrorHandler.vue
  @description: 全局错误处理组件，统一捕获和处理应用中的错误
  @author: Trae AI
  @createTime: 2025-12-22
  @version: 1.0
-->
<template>
  <div class="global-error-handler">
    <el-dialog
      v-model="errorDialogVisible"
      :title="errorTitle"
      width="500px"
      :close-on-click-modal="false"
      :show-close="true"
      @close="handleClose"
      data-cy="global-error-handler-dialog"
    >
      <div class="error-content">
        <el-icon class="error-icon" :size="48" :color="errorIconColor">
          <component :is="errorIcon" />
        </el-icon>
        <div class="error-message">{{ errorMessage }}</div>
        <el-collapse v-if="errorDetails && showDetails" class="error-details">
          <el-collapse-item title="错误详情" name="details">
            <pre class="error-stack">{{ errorDetails }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="showRetry" @click="handleRetry" data-cy="global-error-handler-retry-btn">重试</el-button>
          <el-button v-if="showReload" type="warning" @click="handleReload" data-cy="global-error-handler-reload-btn">刷新页面</el-button>
          <el-button type="primary" @click="handleClose" data-cy="global-error-handler-close-btn">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <el-alert
      v-if="showInlineError && inlineError"
      :title="inlineError.message"
      :type="inlineError.type"
      :closable="inlineError.closable"
      @close="handleInlineClose"
      class="inline-error"
    />
  </div>
</template>

<script setup>
import { CircleCheck, CircleClose, InfoFilled, Warning } from '@element-plus/icons-vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { createLogger } from '@/utils/logger.js';

const logger = createLogger('GlobalErrorHandler');

const emit = defineEmits(['retry', 'reload']);

const errorDialogVisible = ref(false);
const errorType = ref('error');
const errorMessage = ref('');
const errorDetails = ref('');
const showDetails = ref(false);
const showRetry = ref(false);
const retryCallback = ref(null);
const showReload = ref(false);
const inlineError = ref(null);
const showInlineError = ref(false);

const errorConfig = {
  error: {
    icon: CircleClose,
    color: '#f56c6c',
    title: '系统错误',
  },
  warning: {
    icon: Warning,
    color: '#e6a23c',
    title: '警告',
  },
  success: {
    icon: CircleCheck,
    color: '#67c23a',
    title: '操作成功',
  },
  info: {
    icon: InfoFilled,
    color: '#909399',
    title: '提示',
  },
};

const errorIcon = computed(() => errorConfig[errorType.value]?.icon || CircleClose);
const errorIconColor = computed(() => errorConfig[errorType.value]?.color || '#f56c6c');
const errorTitle = computed(() => errorConfig[errorType.value]?.title || '系统错误');

const showError = (message, details = '', type = 'error', options = {}) => {
  errorType.value = type;
  errorMessage.value = message;
  errorDetails.value = details;
  showDetails.value = options.showDetails || false;
  showRetry.value = options.showRetry || false;
  retryCallback.value = options.retryCallback || null;
  showReload.value = options.showReload || false;
  errorDialogVisible.value = true;

  logger.error(`全局错误处理: ${message}`, { type, details });
};

const showInlineErrorMessage = (message, type = 'error', closable = true) => {
  inlineError.value = {
    message,
    type,
    closable,
  };
  showInlineError.value = true;

  if (type === 'error') {
    logger.error(`内联错误: ${message}`);
  } else if (type === 'warning') {
    logger.warn(`内联警告: ${message}`);
  }
};

const handleRetry = () => {
  if (retryCallback.value && typeof retryCallback.value === 'function') {
    try {
      retryCallback.value();
      errorDialogVisible.value = false;
    } catch (error) {
      logger.error('重试回调执行失败:', error);
    }
  } else {
    emit('retry');
  }
};

const handleReload = () => {
  emit('reload');
  if (!import.meta.env.TEST) {
    window.location.reload();
  }
};

const handleClose = () => {
  errorDialogVisible.value = false;
  errorMessage.value = '';
  errorDetails.value = '';
  showDetails.value = false;
  showRetry.value = false;
  retryCallback.value = null;
  showReload.value = false;
};

const handleInlineClose = () => {
  showInlineError.value = false;
  inlineError.value = null;
};

const handleGlobalError = (event) => {
  event.preventDefault();
  const { error } = event;
  const errorMessage = error?.message || '发生未知错误';
  const errorStack = error?.stack || String(error);
  showError(errorMessage, errorStack, 'error', { showDetails: true, showReload: true });
};

const handleUnhandledRejection = (event) => {
  event.preventDefault();
  const error = event.reason;
  const errorMessage = error?.message || 'Promise被拒绝';
  const errorStack = error?.stack || String(error);
  showError(errorMessage, errorStack, 'warning', {
    showDetails: true,
    showReload: true,
  });
};

onMounted(() => {
  if (typeof window.addEventListener === 'function' && !import.meta.env.TEST) {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }
});

onUnmounted(() => {
  if (typeof window.removeEventListener === 'function' && !import.meta.env.TEST) {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }
});

defineExpose({
  showError,
  showInlineErrorMessage,
  errorDialogVisible,
  errorMessage,
  errorDetails,
  showDetails,
  showRetry,
  showReload,
  inlineError,
  showInlineError,
  errorType,
  errorTitle,
  errorIcon,
  errorIconColor,
  handleRetry,
  handleReload,
  handleClose,
  handleInlineClose,
});
</script>

<style scoped>
.global-error-handler {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}

.inline-error {
  margin: 16px;
  pointer-events: auto;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.error-icon {
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: #303133;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 16px;
}

.error-details {
  width: 100%;
  margin-top: 16px;
}

.error-stack {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
