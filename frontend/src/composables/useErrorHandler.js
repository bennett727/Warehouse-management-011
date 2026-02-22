/**
 * @file: useErrorHandler.js
 * @description: 统一的错误处理 composable，提供统一的错误处理逻辑
 * @author: 开发团队
 * @createTime: 2025-12-28
 * @version: 2.0.0
 */

import { ElMessage, ElNotification } from 'element-plus';

import { isNetworkError, isTimeoutError, isAuthError, isPermissionError } from '@/utils/errors/errorCodes';
import { logApiError, logBusinessError, logUiError } from '@/utils/errors/errorMonitor';
import { handleErrorMessage } from '@/utils/responseHandler';

export function useErrorHandler() {
  const handleError = async (apiCall, errorMessage = '操作失败', options = {}) => {
    const { showMessage = true, logError = true, rethrow = true, context = {} } = options;

    try {
      return await apiCall();
    } catch (error) {
      const formattedError = handleErrorMessage(error, errorMessage);

      if (showMessage) {
        ElMessage.error(formattedError);
      }

      if (logError) {
        logApiError('handleError', error, { errorMessage, context });
      }

      if (rethrow) {
        throw error;
      }

      return null;
    }
  };

  const handleAsyncError = async (apiCall, options = {}) => {
    const { loadingRef, errorMessage = '操作失败', onSuccess, onError, context = {} } = options;

    if (loadingRef) {
      loadingRef.value = true;
    }

    try {
      const result = await apiCall();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const formattedError = handleErrorMessage(error, errorMessage);
      ElMessage.error(formattedError);
      logApiError('handleAsyncError', error, { errorMessage, context });

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      if (loadingRef) {
        loadingRef.value = false;
      }
    }
  };

  const handleFormError = (error, formRef, errorMessage = '表单提交失败', context = {}) => {
    const formattedError = handleErrorMessage(error, errorMessage);
    ElMessage.error(formattedError);
    logUiError('handleFormError', error, { errorMessage, context });

    if (formRef && error.response?.data?.errors) {
      const { errors } = error.response.data;
      Object.keys(errors).forEach((field) => {
        formRef.validateField(field);
      });
    }
  };

  const handleApiError = (error, apiName, context = {}) => {
    const errorMessage = `API调用失败: ${apiName}`;
    logApiError(apiName, error, context);

    let displayMessage = errorMessage;
    if (isNetworkError(error)) {
      displayMessage = '网络连接失败，请检查网络设置';
    } else if (isTimeoutError(error)) {
      displayMessage = '请求超时，请稍后重试';
    } else if (isAuthError(error)) {
      displayMessage = '登录已过期，请重新登录';
    } else if (isPermissionError(error)) {
      displayMessage = '权限不足，无法执行此操作';
    } else {
      displayMessage = handleErrorMessage(error, errorMessage);
    }

    ElMessage.error(displayMessage);
  };

  const handleNetworkError = (error, context = {}) => {
    logApiError('handleNetworkError', error, context);

    let message = '网络错误，请检查网络连接';
    if (isTimeoutError(error)) {
      message = '请求超时，请稍后重试';
    } else if (isNetworkError(error)) {
      message = '网络连接失败，请检查网络设置';
    }

    ElNotification.error({
      title: '网络错误',
      message,
      duration: 5000,
    });
  };

  const handleBusinessError = (error, operation, context = {}) => {
    const message = error.message || `操作失败: ${operation}`;
    logBusinessError(operation, error, context);

    ElMessage.error(message);
  };

  const handleValidationError = (error, context = {}) => {
    logUiError('handleValidationError', error, context);

    let message = '数据验证失败';
    if (error.response?.data?.errors) {
      const { errors } = error.response.data;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError)) {
        message = firstError[0]?.message || message;
      } else {
        message = firstError || message;
      }
    } else {
      const { message: errorMessage } = error;
      message = errorMessage || message;
    }

    ElMessage.warning(message);
  };

  const showSuccessMessage = (message, options = {}) => {
    ElMessage.success({
      message,
      duration: 3000,
      grouping: true,
      ...options,
    });
  };

  const showErrorMessage = (message, options = {}) => {
    ElMessage.error({
      message,
      duration: 3000,
      grouping: true,
      ...options,
    });
  };

  const showWarningMessage = (message, options = {}) => {
    ElMessage.warning({
      message,
      duration: 3000,
      grouping: true,
      ...options,
    });
  };

  const showInfoMessage = (message, options = {}) => {
    ElMessage.info({
      message,
      duration: 3000,
      grouping: true,
      ...options,
    });
  };

  const showNotification = (title, message, type = 'info', options = {}) => {
    ElNotification({
      title,
      message,
      type,
      duration: 5000,
      ...options,
    });
  };

  return {
    handleError,
    handleAsyncError,
    handleFormError,
    handleApiError,
    handleNetworkError,
    handleBusinessError,
    handleValidationError,
    showSuccessMessage,
    showErrorMessage,
    showWarningMessage,
    showInfoMessage,
    showNotification,
  };
}

export default useErrorHandler;
