import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('globalStore');

export const useGlobalStore = defineStore('global', () => {
  const loading = ref(false);
  const loadingText = ref('');
  const error = ref(null);
  const errors = ref([]);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const errorCount = computed(() => errors.value.length);

  const showLoading = (text = '') => {
    loading.value = true;
    loadingText.value = text;
  };

  const hideLoading = () => {
    loading.value = false;
    loadingText.value = '';
  };

  const showError = (message, details = '', type = 'error', retryable = false) => {
    const errorObj = {
      id: Date.now(),
      message,
      details,
      type,
      retryable,
      timestamp: new Date().toISOString(),
    };

    error.value = errorObj;
    errors.value.push(errorObj);

    logger.error('Global Error:', errorObj);

    return errorObj;
  };

  const clearError = () => {
    error.value = null;
  };

  const clearAllErrors = () => {
    error.value = null;
    errors.value = [];
  };

  const removeError = (errorId) => {
    const index = errors.value.findIndex((e) => e.id === errorId);
    if (index !== -1) {
      errors.value.splice(index, 1);
    }
  };

  const getRecentErrors = (count = 10) => {
    return errors.value.slice(-count);
  };

  const getErrorStatistics = () => {
    const total = errors.value.length;
    const byType = {};

    errors.value.forEach((err) => {
      byType[err.type] = (byType[err.type] || 0) + 1;
    });

    return {
      total,
      byType,
    };
  };

  return {
    loading,
    loadingText,
    error,
    errors,
    isLoading,
    hasError,
    errorCount,
    showLoading,
    hideLoading,
    showError,
    clearError,
    clearAllErrors,
    removeError,
    getRecentErrors,
    getErrorStatistics,
  };
});
