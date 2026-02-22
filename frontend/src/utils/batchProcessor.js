/**
 * 批量处理器
 * @file: batchProcessor.js
 * @description: 提供高性能的批量操作并行处理能力，支持并发控制和进度追踪
 * @author: Trae AI
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import { createLogger } from './logger';

const logger = createLogger('BatchProcessor');

/**
 * 任务状态
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

/**
 * 批处理配置
 */
export const DEFAULT_BATCH_CONFIG = {
  concurrency: 5, // 默认并发数
  retryCount: 3, // 重试次数
  retryDelay: 1000, // 重试延迟
  timeout: 30000, // 超时时间
  continueOnError: true, // 出错时是否继续
  enableProgress: true, // 是否启用进度追踪
};

/**
 * 批量任务处理器
 */
export class BatchProcessor {
  constructor(config = {}) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
    this.tasks = [];
    this.results = [];
    this.runningCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.cancelled = false;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }

  /**
   * 添加任务
   */
  addTask(taskFn, metadata = {}) {
    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fn: taskFn,
      metadata,
      status: TASK_STATUS.PENDING,
      result: null,
      error: null,
      retryCount: 0,
      startTime: null,
      endTime: null,
    };
    this.tasks.push(task);
    return task.id;
  }

  /**
   * 设置进度回调
   */
  onProgress(callback) {
    this.onProgress = callback;
    return this;
  }

  /**
   * 设置完成回调
   */
  onComplete(callback) {
    this.onComplete = callback;
    return this;
  }

  /**
   * 设置错误回调
   */
  onError(callback) {
    this.onError = callback;
    return this;
  }

  /**
   * 执行单个任务
   */
  async executeTask(task) {
    if (this.cancelled) {
      task.status = TASK_STATUS.CANCELLED;
      return { success: false, cancelled: true };
    }

    task.status = TASK_STATUS.RUNNING;
    task.startTime = Date.now();
    this.runningCount++;

    try {
      // 设置超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`任务执行超时: ${this.config.timeout}ms`)), this.config.timeout);
      });

      // 执行任务
      const result = await Promise.race([task.fn(task.metadata), timeoutPromise]);

      task.status = TASK_STATUS.SUCCESS;
      task.result = result;
      task.endTime = Date.now();
      this.completedCount++;
      this.runningCount--;

      logger.debug(`任务执行成功: ${task.id}`, {
        duration: task.endTime - task.startTime,
        metadata: task.metadata,
      });

      return { success: true, result };
    } catch (error) {
      // 重试逻辑
      if (task.retryCount < this.config.retryCount) {
        task.retryCount++;
        logger.warn(`任务执行失败，准备重试 (${task.retryCount}/${this.config.retryCount}): ${task.id}`, {
          error: error.message,
        });

        await this.delay(this.config.retryDelay * task.retryCount);
        return this.executeTask(task);
      }

      task.status = TASK_STATUS.FAILED;
      task.error = error;
      task.endTime = Date.now();
      this.failedCount++;
      this.runningCount--;

      logger.error(`任务执行失败: ${task.id}`, {
        error: error.message,
        metadata: task.metadata,
      });

      if (this.onError) {
        this.onError(error, task);
      }

      return { success: false, error };
    }
  }

  /**
   * 延迟
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 通知进度
   */
  notifyProgress() {
    if (this.onProgress && this.config.enableProgress) {
      const progress = {
        total: this.tasks.length,
        completed: this.completedCount,
        failed: this.failedCount,
        running: this.runningCount,
        pending: this.tasks.length - this.completedCount - this.failedCount - this.runningCount,
        percentage: Math.round(((this.completedCount + this.failedCount) / this.tasks.length) * 100),
      };
      this.onProgress(progress);
    }
  }

  /**
   * 执行所有任务
   */
  async execute() {
    const startTime = Date.now();
    logger.info('批量处理开始', {
      taskCount: this.tasks.length,
      concurrency: this.config.concurrency,
    });

    // 使用并发控制执行
    const executing = [];
    const results = [];

    for (let i = 0; i < this.tasks.length; i++) {
      if (this.cancelled) {
        break;
      }

      const task = this.tasks[i];
      const promise = this.executeTask(task).then((result) => {
        results[i] = result;
        this.notifyProgress();
        return result;
      });

      executing.push(promise);

      // 控制并发数
      if (executing.length >= this.config.concurrency) {
        const _completed = await Promise.race(executing);
        const index = executing.findIndex((p) => p === promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
      }

      // 如果出错不继续，且有失败任务
      if (!this.config.continueOnError && this.failedCount > 0) {
        break;
      }
    }

    // 等待剩余任务
    await Promise.all(executing);

    const endTime = Date.now();
    const summary = {
      total: this.tasks.length,
      completed: this.completedCount,
      failed: this.failedCount,
      cancelled: this.cancelled,
      duration: endTime - startTime,
      results,
    };

    logger.info('批量处理完成', summary);

    if (this.onComplete) {
      this.onComplete(summary);
    }

    return summary;
  }

  /**
   * 取消处理
   */
  cancel() {
    this.cancelled = true;
    logger.info('批量处理已取消');
  }

  /**
   * 获取任务状态
   */
  getStatus() {
    return {
      total: this.tasks.length,
      completed: this.completedCount,
      failed: this.failedCount,
      running: this.runningCount,
      pending: this.tasks.length - this.completedCount - this.failedCount - this.runningCount,
      percentage:
        this.tasks.length > 0 ? Math.round(((this.completedCount + this.failedCount) / this.tasks.length) * 100) : 0,
      cancelled: this.cancelled,
    };
  }

  /**
   * 获取失败的任务
   */
  getFailedTasks() {
    return this.tasks.filter((t) => t.status === TASK_STATUS.FAILED);
  }

  /**
   * 重试失败的任务
   */
  async retryFailed() {
    const failedTasks = this.getFailedTasks();
    if (failedTasks.length === 0) {
      return { success: true, message: '没有失败的任务需要重试' };
    }

    // 重置失败任务状态
    failedTasks.forEach((task) => {
      task.status = TASK_STATUS.PENDING;
      task.error = null;
      task.retryCount = 0;
    });

    // 重新执行
    return this.execute();
  }
}

/**
 * 批量操作执行器（简化版API）
 */
export async function executeBatch(items, operation, options = {}) {
  const config = { ...DEFAULT_BATCH_CONFIG, ...options };
  const processor = new BatchProcessor(config);

  // 添加任务
  items.forEach((item, index) => {
    processor.addTask(async () => operation(item, index), { item, index });
  });

  // 设置回调
  if (options.onProgress) {
    processor.onProgress(options.onProgress);
  }
  if (options.onComplete) {
    processor.onComplete(options.onComplete);
  }
  if (options.onError) {
    processor.onError(options.onError);
  }

  return processor.execute();
}

/**
 * 带并发控制的批量API请求
 */
export async function batchApiRequests(requests, options = {}) {
  const config = {
    concurrency: 3,
    retryCount: 2,
    ...options,
  };

  const processor = new BatchProcessor(config);

  requests.forEach((request, index) => {
    processor.addTask(
      async () => {
        const { api, params } = request;
        return api(...params);
      },
      { request, index }
    );
  });

  return processor.execute();
}

/**
 * 批量出库操作优化执行器
 */
export async function executeBatchOutboundOptimized(items, outboundType, handlers, options = {}) {
  const { updateDeviceStatus, createBusinessRecord, onProgress, onComplete, onError } = handlers;

  const config = {
    concurrency: 5,
    retryCount: 3,
    continueOnError: true,
    enableProgress: true,
    ...options,
  };

  const processor = new BatchProcessor(config);

  // 添加设备状态更新任务
  items.forEach((item) => {
    processor.addTask(
      async () => {
        // 步骤1: 更新设备状态
        await updateDeviceStatus(item.deviceId, outboundType);

        // 步骤2: 创建业务记录
        await createBusinessRecord(
          {
            deviceId: item.deviceId,
            sourceOutboundNo: item.orderId,
            ...item,
          },
          outboundType
        );

        return { deviceId: item.deviceId, success: true };
      },
      { item }
    );
  });

  // 设置回调
  if (onProgress) {
    processor.onProgress(onProgress);
  }
  if (onComplete) {
    processor.onComplete(onComplete);
  }
  if (onError) {
    processor.onError(onError);
  }

  return processor.execute();
}

/**
 * 创建批量处理进度条组件的数据
 */
export function createProgressData(processor) {
  const status = processor.getStatus();
  return {
    ...status,
    statusText: getStatusText(status),
    color: getProgressColor(status),
  };
}

/**
 * 获取状态文本
 */
function getStatusText(status) {
  if (status.cancelled) {
    return '已取消';
  }
  if (status.failed > 0) {
    return `${status.completed} 成功, ${status.failed} 失败`;
  }
  if (status.percentage === 100) {
    return '已完成';
  }
  return `处理中... ${status.percentage}%`;
}

/**
 * 获取进度条颜色
 */
function getProgressColor(status) {
  if (status.cancelled) {
    return '#909399';
  }
  if (status.failed > 0) {
    return status.failed === status.total ? '#F56C6C' : '#E6A23C';
  }
  if (status.percentage === 100) {
    return '#67C23A';
  }
  return '#409EFF';
}

export default {
  BatchProcessor,
  executeBatch,
  batchApiRequests,
  executeBatchOutboundOptimized,
  createProgressData,
  TASK_STATUS,
  DEFAULT_BATCH_CONFIG,
};
