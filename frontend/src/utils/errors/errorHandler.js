import { createLogger } from '../logger';

import { ERROR_CODES, ERROR_MESSAGES } from './errorCodes';
import errorMonitor from './errorMonitor';

const logger = createLogger('ErrorHandler');

export const getErrorMessage = (error) => {
  if (!error) {
    return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  }

  if (error.response) {
    const { status } = error.response;
    switch (status) {
      case 400:
        return {
          title: '请求错误',
          message: error.response.data?.message || '请求参数错误',
          action: '检查参数',
        };
      case 401:
        return ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR];
      case 403:
        return ERROR_MESSAGES[ERROR_CODES.PERMISSION_DENIED];
      case 404:
        return ERROR_MESSAGES[ERROR_CODES.NOT_FOUND];
      case 422:
        return ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
      case 500:
        return ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR];
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR];
      default:
        return {
          title: '错误',
          message: error.response.data?.message || `服务器返回错误 (${status})`,
          action: '重试',
        };
    }
  }

  if (error.request) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
  }

  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR];
  }

  return {
    title: '错误',
    message: error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR].message,
    action: '重试',
  };
};

export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      config: error.config,
      response: error.response?.data,
    },
    context,
  };

  logger.error('[Error Logger]', errorInfo);

  errorMonitor.logError({
    type: 'logged',
    message: error.message,
    stack: error.stack,
    code: error.code,
    context,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(errorInfo)], { type: 'application/json' });
      navigator.sendBeacon('/error-report', blob);
    } else {
      fetch('/error-report', {
        method: 'POST',
        body: JSON.stringify(errorInfo),
        keepalive: true,
      });
    }
  } catch (e) {
    logger.error('Failed to send error report:', e);
  }
};

export const handleError = (error, options = {}) => {
  const { silent = false, context = {} } = options;

  logError(error, context);

  if (!silent) {
    const errorInfo = getErrorMessage(error);
    logger.error(`[${errorInfo.title}] ${errorInfo.message}`);
  }

  return getErrorMessage(error);
};

export default {
  getErrorMessage,
  logError,
  handleError,
  ERROR_CODES,
  ERROR_MESSAGES,
};
