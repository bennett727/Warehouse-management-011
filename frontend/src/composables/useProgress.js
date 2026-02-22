import { ElMessage } from 'element-plus';
import { ref, computed } from 'vue';

import { createLogger } from '@/utils/logger.js';
import { handleErrorMessage } from '@/utils/responseHandler.js';

const logger = createLogger('useProgress');

export function useProgress() {
  const progress = ref(0);
  const total = ref(0);
  const current = ref(0);
  const status = ref('idle');
  const message = ref('');

  const isRunning = computed(() => status.value === 'running');
  const isCompleted = computed(() => status.value === 'completed');
  const isError = computed(() => status.value === 'error');
  const percentage = computed(() => {
    if (total.value === 0) {
      return 0;
    }
    return Math.round((current.value / total.value) * 100);
  });

  const startProgress = (totalItems, startMessage = '开始处理...') => {
    progress.value = 0;
    total.value = totalItems;
    current.value = 0;
    status.value = 'running';
    message.value = startMessage;
    logger.info(`开始批量操作，共 ${totalItems} 项`);
  };

  const updateProgress = (currentItem, updateMessage) => {
    current.value = currentItem;
    progress.value = percentage.value;
    if (updateMessage) {
      message.value = updateMessage;
    }
  };

  const incrementProgress = (incrementMessage) => {
    current.value++;
    progress.value = percentage.value;
    if (incrementMessage) {
      message.value = incrementMessage;
    }
  };

  const completeProgress = (completeMessage = '处理完成') => {
    progress.value = 100;
    status.value = 'completed';
    message.value = completeMessage;
    logger.info(`批量操作完成，共处理 ${total.value} 项`);
  };

  const errorProgress = (errorMessage = '处理失败') => {
    status.value = 'error';
    message.value = errorMessage;
    logger.error(`批量操作失败，已处理 ${current.value}/${total.value} 项`);
  };

  const resetProgress = () => {
    progress.value = 0;
    total.value = 0;
    current.value = 0;
    status.value = 'idle';
    message.value = '';
  };

  const executeBatch = async (items, operation, options = {}) => {
    const { delay = 0, onStart, onProgress, onComplete, onError, itemLabel = '项' } = options;

    try {
      startProgress(items.length, `开始处理 ${items.length} 个${itemLabel}...`);

      if (onStart) {
        onStart(items.length);
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          const result = await operation(item, i);
          results.push(result);

          incrementProgress(`正在处理第 ${i + 1}/${items.length} 个${itemLabel}...`);

          if (onProgress) {
            onProgress(i + 1, items.length, result);
          }
        } catch (error) {
          errors.push({ item, index: i, error });
          logger.error(`处理第 ${i + 1} 个${itemLabel}失败:`, error);
        }

        if (delay > 0 && i < items.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      if (errors.length > 0) {
        errorProgress(`处理完成，成功 ${results.length} 个，失败 ${errors.length} 个`);
        ElMessage.warning(`处理完成，成功 ${results.length} 个，失败 ${errors.length} 个`);

        if (onError) {
          onError(errors);
        }

        return { success: results, errors, total: items.length };
      }
      completeProgress(`成功处理 ${results.length} 个${itemLabel}`);
      ElMessage.success(`成功处理 ${results.length} 个${itemLabel}`);

      if (onComplete) {
        onComplete(results);
      }

      return { success: results, errors: [], total: items.length };
    } catch (error) {
      errorProgress('批量操作失败');
      ElMessage.error(handleErrorMessage(error, '批量操作失败'));
      throw error;
    }
  };

  return {
    progress,
    total,
    current,
    status,
    message,
    isRunning,
    isCompleted,
    isError,
    percentage,
    startProgress,
    updateProgress,
    incrementProgress,
    completeProgress,
    errorProgress,
    resetProgress,
    executeBatch,
  };
}
