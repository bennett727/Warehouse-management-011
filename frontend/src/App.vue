<!--
  @file: App.vue
  @description: 应用根组件，包含全局样式和路由视图容器
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0.0
  @modifyRecords:
      2025-12-21: 初始版本创建
      2025-12-22: 添加全局错误处理组件
      2026-01-30: 添加全局加载和错误处理
      2026-02-06: 集成ErrorBoundary提供全局错误边界保护
-->
<template>
  <ErrorBoundary @error="handleGlobalError">
    <div id="app">
      <router-view />
      <GlobalErrorHandler ref="globalErrorHandler" />
      <GlobalLoading :visible="globalStore.isLoading" :text="globalStore.loadingText" fullscreen />
      <GlobalError
        v-if="globalStore.hasError"
        :error="globalStore.error"
        @close="globalStore.clearError"
        @retry="handleRetry"
      />
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue';

import GlobalErrorHandler from '@/components/base/GlobalErrorHandler.vue';
import ErrorBoundary from '@/components/common/ErrorBoundary.vue';
import { useGlobalStore } from '@/stores/global.js';
import { createLogger } from '@/utils/logger';

const logger = createLogger('App');

const globalErrorHandler = ref(null);
const globalStore = useGlobalStore();

provide('globalErrorHandler', globalErrorHandler);

const handleRetry = () => {
  if (globalStore.error && globalStore.error.retryCallback) {
    globalStore.error.retryCallback();
  }
  globalStore.clearError();
};

const handleGlobalError = (error) => {
  logger.error('全局错误边界捕获到错误:', error);
  globalStore.showError('系统发生错误', error.message || '请稍后重试或联系技术支持', 'error', false);
};

const handleOnlineStatus = () => {
  if (!navigator.onLine) {
    globalStore.showError('网络连接已断开', '请检查您的网络连接后重试', 'warning', false);
  }
};

onMounted(() => {
  window.addEventListener('online', () => {
    globalStore.clearError();
  });
  window.addEventListener('offline', handleOnlineStatus);

  handleOnlineStatus();
});

onUnmounted(() => {
  window.removeEventListener('online', () => {
    globalStore.clearError();
  });
  window.removeEventListener('offline', handleOnlineStatus);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f7fa;
}

#app {
  height: 100vh;
  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
