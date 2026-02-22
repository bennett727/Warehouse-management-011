/**
 * 响应处理工具函数
 * 用于统一处理API响应、错误处理和消息提示
 */
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';

import { createLogger } from './logger.js';

import { PUBLIC_PATHS } from '@/config/paths';
import { useUserStore } from '@/stores/user';

const logger = createLogger('responseHandler');

/**
 * 处理API响应的标准格式
 * @param {Promise} apiPromise - API请求Promise
 * @param {object} options - 配置选项
 * @param {boolean} options.showSuccess - 是否显示成功消息
 * @param {boolean} options.showError - 是否显示错误消息
 * @param {string} options.successMessage - 自定义成功消息
 * @param {string} options.errorMessage - 自定义错误消息
 * @returns {Promise<any>} 处理后的响应数据
 */
export const handleApiResponse = async (apiPromise, options = {}) => {
  const { showSuccess = true, showError = true, successMessage = '操作成功', errorMessage = '操作失败' } = options;

  try {
    const response = await apiPromise;

    // 假设标准响应格式：{ code, message, data }
    if (response && response.code === 200) {
      // 显示成功消息
      if (showSuccess) {
        ElMessage.success(response.message || successMessage);
      }
      return response.data;
    }
    // 处理业务错误
    const errorMsg = response?.message || errorMessage;
    if (showError) {
      ElMessage.error(errorMsg);
    }
    throw new Error(errorMsg);
  } catch (error) {
    // 处理请求错误
    const errorText = handleErrorMessage(error, errorMessage);
    if (showError && !error.handled) {
      ElMessage.error(errorText);
    }
    throw error;
  }
};

/**
 * 处理错误消息，根据不同错误类型返回合适的错误信息
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 处理后的错误消息
 */
export const handleErrorMessage = (error, defaultMessage = '系统异常，请稍后重试') => {
  if (!error) {
    return defaultMessage;
  }

  // 处理表单验证错误（Element Plus 表单验证失败）
  if (typeof error === 'object' && Object.keys(error).length > 0 && !error.response && !error.message) {
    const firstField = Object.keys(error)[0];
    const firstError = error[firstField];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0].message || '表单验证失败，请检查输入';
    }
    return '表单验证失败，请检查输入';
  }

  // 处理请求被取消的情况（用户快速切换导致）
  if (error.name === 'CanceledError' || error.message?.includes('CanceledError')) {
    return '';
  }

  // 网络错误
  if (!error.response) {
    if (error.message === 'Network Error') {
      return '网络连接失败，请检查网络设置';
    }
    if (error.message && error.message.includes('timeout')) {
      return '请求超时，请稍后重试';
    }
    return error.message || defaultMessage;
  }

  const { status, data } = error.response;

  // 根据HTTP状态码返回相应错误信息
  switch (status) {
    case 400:
      return data?.message || '请求参数错误';
    case 401:
      // 未授权，可能需要重新登录
      handleUnauthorized();
      return data?.message || '登录已过期，请重新登录';
    case 403:
      return data?.message || '无权限执行此操作';
    case 404:
      return data?.message || '请求的资源不存在';
    case 405:
      return data?.message || '不支持的请求方法';
    case 408:
      return data?.message || '请求超时，请稍后重试';
    case 500:
      return data?.message || '服务器内部错误';
    case 502:
      return data?.message || '网关错误';
    case 503:
      return data?.message || '服务不可用';
    case 504:
      return data?.message || '网关超时';
    default:
      return data?.message || defaultMessage;
  }
};

/**
 * 处理未授权错误（401）
 * 清除用户登录状态，重定向到登录页
 */
export const handleUnauthorized = () => {
  const userStore = useUserStore();

  // 避免重复处理
  if (window.isHandlingUnauthorized) {
    return;
  }
  window.isHandlingUnauthorized = true;

  // 显示确认对话框
  ElMessageBox.confirm('登录已过期，请重新登录', '登录过期', {
    confirmButtonText: '去登录',
    cancelButtonText: '取消',
    type: 'warning',
    showCancelButton: false, // 强制用户重新登录
  })
    .then(() => {
      // 清除用户状态
      userStore.logout();
      // 重定向到登录页
      window.location.href = PUBLIC_PATHS.LOGIN;
    })
    .finally(() => {
      // 重置处理状态
      setTimeout(() => {
        window.isHandlingUnauthorized = false;
      }, 1000);
    });
};

/**
 * 批量处理API请求
 * @param {Array<Promise>} promises - API请求Promise数组
 * @param {object} options - 配置选项
 * @param {boolean} options.showLoading - 是否显示加载提示
 * @param {boolean} options.showError - 是否显示错误消息
 * @returns {Promise<Array>} 处理后的响应数据数组
 */
export const handleBatchRequests = async (promises, options = {}) => {
  const { showLoading = false, showError = true } = options;

  let loadingInstance = null;

  try {
    if (showLoading) {
      loadingInstance = ElMessage.loading('处理中，请稍候...', {
        duration: 0,
        grouping: true,
      });
    }

    // 使用Promise.allSettled确保所有请求都完成，即使某些失败
    const results = await Promise.allSettled(promises);

    // 处理成功和失败的结果
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        const response = result.value;
        // 检查API响应是否成功
        if (response && response.code === 200) {
          return response.data;
        }
        if (showError) {
          ElMessage.error(response?.message || `请求${index + 1}失败`);
        }
        return null;
      }
      if (showError) {
        const errorMsg = handleErrorMessage(result.reason);
        ElMessage.error(`请求${index + 1}失败: ${errorMsg}`);
      }
      return null;
    });

    return processedResults;
  } catch (error) {
    if (showError) {
      ElMessage.error(handleErrorMessage(error));
    }
    throw error;
  } finally {
    if (loadingInstance) {
      loadingInstance.close();
    }
  }
};

/**
 * 处理批量操作结果反馈
 * @param {Array<any>} results - 批量操作结果数组
 * @param {object} options - 配置选项
 * @param {string} options.operationName - 操作名称（如"修改设备状态"、"删除设备"）
 * @param {boolean} options.showSuccess - 是否显示成功消息
 * @param {boolean} options.showError - 是否显示错误消息
 * @param {function} options.getItemLabel - 获取操作项标签的函数
 * @returns {object} 处理结果统计信息
 */
export const handleBatchOperationResult = (results, options = {}) => {
  const {
    operationName = '操作',
    showSuccess = true,
    showError = true,
    getItemLabel = (index) => `第${index + 1}项`,
  } = options;

  // 统计成功和失败的数量
  const successCount = results.filter((result) => result !== null).length;
  const totalCount = results.length;
  const failedCount = totalCount - successCount;

  // 收集失败的项信息
  const failedItems = results.map((result, index) => ({ result, index })).filter((item) => item.result === null);

  // 构建结果统计信息
  const resultStats = {
    total: totalCount,
    success: successCount,
    failed: failedCount,
    failedItems: failedItems.map((item) => ({
      index: item.index,
      label: getItemLabel(item.index),
    })),
  };

  // 根据结果显示不同的反馈
  if (successCount === totalCount && showSuccess) {
    // 全部成功
    ElMessage.success({
      message: `成功${operationName} ${totalCount}个项目`,
      grouping: true,
      duration: 3000,
    });
  } else if (failedCount === totalCount && showError) {
    // 全部失败
    ElMessage.error({
      message: `${operationName} ${totalCount}个项目全部失败`,
      grouping: true,
      duration: 3000,
    });
  } else if (failedCount > 0 && showError) {
    // 部分成功，部分失败
    const errorMessage = `成功${operationName} ${successCount}个项目，失败${failedCount}个项目`;

    if (failedCount <= 5) {
      // 失败数量较少时，显示详细的失败列表
      ElMessage.error({
        message: `${errorMessage}：${failedItems.map((item) => getItemLabel(item.index)).join('、')}`,
        grouping: true,
        duration: 5000,
      });
    } else {
      // 失败数量较多时，显示简要信息并提供通知
      ElMessage.error({
        message: errorMessage,
        grouping: true,
        duration: 3000,
      });

      ElNotification.warning({
        title: '批量操作结果',
        message: `部分项目${operationName}失败，详细信息请查看控制台`,
        duration: 5000,
        showClose: true,
      });

      // 在控制台打印详细的失败信息
      logger.warn(`批量${operationName}失败详情：`, resultStats.failedItems);
    }
  } else if (showSuccess) {
    // 其他情况，显示成功信息
    ElMessage.success({
      message: `完成${operationName}，处理了${totalCount}个项目`,
      grouping: true,
      duration: 3000,
    });
  }

  return resultStats;
};

/**
 * 重试API请求
 * @param {Function} apiCall - 返回Promise的API调用函数
 * @param {object} options - 重试配置
 * @param {number} options.maxRetries - 最大重试次数
 * @param {number} options.retryDelay - 重试间隔（毫秒）
 * @param {boolean} options.showError - 是否显示错误消息
 * @returns {Promise<any>} API响应结果
 */
export const retryApiCall = async (apiCall, options = {}) => {
  const { maxRetries = 3, retryDelay = 1000, showError = false } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // 如果是最后一次尝试或特定错误不重试
      if (
        attempt === maxRetries ||
        error.response?.status === 400 || // 请求错误
        error.response?.status === 401 || // 未授权
        error.response?.status === 403
      ) {
        // 禁止访问
        break;
      }

      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  // 显示错误消息
  if (showError) {
    ElMessage.error(handleErrorMessage(lastError));
  }

  throw lastError;
};

/**
 * 显示操作确认对话框
 * @param {string} message - 确认消息
 * @param {string} title - 对话框标题
 * @param {object} options - ElMessageBox选项
 * @returns {Promise<void>}
 */
export const confirmOperation = async (message, title = '确认操作', options = {}) => {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    ...options,
  });
};

/**
 * 处理表单提交
 * @param {Function} submitFunction - 提交函数，返回Promise
 * @param {object} options - 配置选项
 * @param {boolean} options.showLoading - 是否显示加载状态
 * @param {boolean} options.showSuccess - 是否显示成功消息
 * @param {boolean} options.showError - 是否显示错误消息
 * @param {string} options.successMessage - 成功消息
 * @param {string} options.errorMessage - 错误消息
 * @returns {Promise<any>} 提交结果
 */
export const handleFormSubmit = async (submitFunction, options = {}) => {
  const {
    showLoading = true,
    showSuccess = true,
    showError = true,
    successMessage = '提交成功',
    errorMessage = '提交失败',
  } = options;

  let loadingInstance = null;

  try {
    if (showLoading) {
      loadingInstance = ElMessage.loading('提交中，请稍候...', {
        duration: 0,
        grouping: true,
      });
    }

    const result = await submitFunction();

    if (showSuccess) {
      ElMessage.success(successMessage);
    }

    return result;
  } catch (error) {
    if (showError) {
      ElMessage.error(handleErrorMessage(error, errorMessage));
    }
    throw error;
  } finally {
    if (loadingInstance) {
      loadingInstance.close();
    }
  }
};

/**
 * 导出所有响应处理工具函数
 */
export default {
  handleApiResponse,
  handleErrorMessage,
  handleUnauthorized,
  handleBatchRequests,
  retryApiCall,
  confirmOperation,
  handleFormSubmit,
};
