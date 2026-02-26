<!--
  @file: GlobalError.vue
  @description: 全局错误组件，用于显示全局错误信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <teleport to="body">
    <transition name="error-fade">
      <div v-if="error" class="global-error-container" :class="error.type" @click="handleBackdropClick">
        <div class="error-content" @click.stop>
          <div class="error-icon">
            <el-icon v-if="error.type === 'error'" :size="48" color="#EF4444">
              <CircleCloseFilled />
            </el-icon>
            <el-icon v-else-if="error.type === 'warning'" :size="48" color="#F59E0B">
              <WarningFilled />
            </el-icon>
            <el-icon v-else-if="error.type === 'success'" :size="48" color="#10B981">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else :size="48" color="#3B82F6">
              <InfoFilled />
            </el-icon>
          </div>
          <div class="error-message">{{ error.message }}</div>
          <div v-if="error.details" class="error-details">
            <div class="error-details-header">
              <span>错误详情</span>
              <el-button link type="primary" size="small" @click="toggleDetails" data-cy="global-error-details-toggle-btn">
                {{ showFullDetails ? '收起' : '展开' }}
              </el-button>
            </div>
            <div v-if="showFullDetails" class="error-details-content">
              <pre>{{ error.details }}</pre>
            </div>
            <div v-else class="error-details-summary">
              {{ getDetailsSummary(error.details) }}
            </div>
          </div>
          <div v-if="error.stack" class="error-stack">
            <div class="error-stack-header">
              <span>错误堆栈</span>
              <el-button link type="primary" size="small" @click="toggleStack" data-cy="global-error-stack-toggle-btn">
                {{ showFullStack ? '收起' : '展开' }}
              </el-button>
            </div>
            <div v-if="showFullStack" class="error-stack-content">
              <pre>{{ error.stack }}</pre>
            </div>
          </div>
          <div class="error-actions">
            <el-button v-if="error.retryable" type="primary" @click="handleRetry" data-cy="global-error-retry-btn">
              <el-icon><Refresh /></el-icon>
              重试
            </el-button>
            <el-button @click="handleClose" data-cy="global-error-close-btn">
              <el-icon><Close /></el-icon>
              关闭
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import {
  CircleCloseFilled,
  WarningFilled,
  CircleCheckFilled,
  InfoFilled,
  Refresh,
  Close,
} from '@element-plus/icons-vue';
import { ref, watch, nextTick } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('GlobalError');

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'retry']);

const showFullDetails = ref(false);
const showFullStack = ref(false);

const handleClose = () => {
  logger.debug('handleClose called');
  emit('close');
};

const handleRetry = () => {
  logger.debug('handleRetry called');
  emit('retry');
};

const handleBackdropClick = () => {
  logger.debug('backdrop clicked');
  handleClose();
};

const toggleDetails = () => {
  showFullDetails.value = !showFullDetails.value;
};

const toggleStack = () => {
  showFullStack.value = !showFullStack.value;
};

const getDetailsSummary = (details) => {
  if (!details) {
    return '';
  }
  const maxLength = 100;
  if (details.length <= maxLength) {
    return details;
  }
  return `${details.substring(0, maxLength)}...`;
};

watch(
  () => props.error,
  (newError) => {
    if (newError) {
      logger.error('Global Error:', newError);
      showFullDetails.value = false;
      showFullStack.value = false;
      nextTick(() => {
        logger.debug('GlobalError: DOM updated, error element should be visible');
      });
    }
  }
);
</script>

<style scoped>
.global-error-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 580px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  position: relative;
  z-index: 2147483648;
  cursor: default;
}

.error-icon {
  animation: bounce 0.5s ease;
  flex-shrink: 0;
}

.error-message {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  line-height: 1.5;
  word-break: break-word;
}

.error-details {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  width: 100%;
  text-align: left;
}

.error-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.error-details-content {
  max-height: 150px;
  overflow-y: auto;
}

.error-details-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #dc2626;
}

.error-details-summary {
  color: #dc2626;
  font-style: italic;
}

.error-stack {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  width: 100%;
  text-align: left;
}

.error-stack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.error-stack-content {
  max-height: 150px;
  overflow-y: auto;
}

.error-stack-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #6b7280;
}

.error-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
  flex-shrink: 0;
}

.error-actions .el-button {
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 24px;
  min-width: 100px;
  cursor: pointer !important;
  pointer-events: auto !important;
}

.error-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: opacity 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .error-content {
    padding: 24px;
    max-width: 95%;
    max-height: 90vh;
  }

  .error-message {
    font-size: 16px;
  }

  .error-details,
  .error-stack {
    font-size: 13px;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions .el-button {
    width: 100%;
  }
}
</style>
