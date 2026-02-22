/**
 * Web Worker管理器
 * @file: workerManager.js
 * @description: 封装Web Worker操作，提供Promise风格的API和Worker池管理
 */

import { createLogger } from './logger';

const logger = createLogger('WorkerManager');

/**
 * 生成唯一ID
 * @returns {string} 唯一标识符
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Worker任务类
 */
class WorkerTask {
  constructor(type, data, resolve, reject) {
    this.id = generateId();
    this.type = type;
    this.data = data;
    this.resolve = resolve;
    this.reject = reject;
    this.startTime = Date.now();
  }
}

/**
 * Worker包装器类
 */
class WorkerWrapper {
  constructor(workerUrl) {
    this.worker = new Worker(workerUrl, { type: 'module' });
    this.busy = false;
    this.currentTask = null;
    this.messageHandler = null;

    this.worker.onmessage = (e) => {
      if (this.messageHandler) {
        this.messageHandler(e.data);
      }
    };

    this.worker.onerror = (error) => {
      logger.error('Worker error:', error);
      if (this.currentTask) {
        this.currentTask.reject(error);
        this.currentTask = null;
        this.busy = false;
      }
    };
  }

  /**
   * 执行任务
   * @param {WorkerTask} task - 任务对象
   * @returns {Promise}
   */
  execute(task) {
    return new Promise((resolve, reject) => {
      this.busy = true;
      this.currentTask = task;

      // 设置消息处理器
      this.messageHandler = (result) => {
        // 忽略心跳消息
        if (result.type === 'ping') {
          return;
        }

        // 验证任务ID
        if (result.id !== task.id) {
          return;
        }

        this.busy = false;
        this.currentTask = null;
        this.messageHandler = null;

        if (result.success) {
          resolve({
            data: result.result,
            duration: result.duration,
          });
        } else {
          reject(new Error(result.error));
        }
      };

      // 发送任务到Worker
      this.worker.postMessage({
        id: task.id,
        type: task.type,
        data: task.data,
      });

      // 设置超时
      const timeout = task.data.timeout || 30000;
      setTimeout(() => {
        if (this.currentTask?.id === task.id) {
          this.busy = false;
          this.currentTask = null;
          this.messageHandler = null;
          reject(new Error(`Worker task timeout after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  /**
   * 终止Worker
   */
  terminate() {
    this.worker.terminate();
    this.busy = false;
    this.currentTask = null;
    this.messageHandler = null;
  }
}

/**
 * Worker池管理器类
 */
class WorkerPool {
  constructor(workerUrl, poolSize = 4) {
    this.workerUrl = workerUrl;
    this.poolSize = poolSize;
    this.workers = [];
    this.taskQueue = [];
    this.isInitialized = false;
  }

  /**
   * 初始化Worker池
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    for (let i = 0; i < this.poolSize; i++) {
      try {
        const worker = new WorkerWrapper(this.workerUrl);
        this.workers.push(worker);
      } catch (error) {
        logger.error(`Failed to create worker ${i}:`, error);
      }
    }

    this.isInitialized = true;
    logger.info(`Worker pool initialized with ${this.workers.length} workers`);
  }

  /**
   * 获取空闲的Worker
   * @returns {WorkerWrapper|null}
   */
  getIdleWorker() {
    return this.workers.find((w) => !w.busy) || null;
  }

  /**
   * 执行任务
   * @param {string} type - 任务类型
   * @param {Object} data - 任务数据
   * @returns {Promise}
   */
  async execute(type, data) {
    if (!this.isInitialized) {
      this.init();
    }

    return new Promise((resolve, reject) => {
      const task = new WorkerTask(type, data, resolve, reject);

      // 尝试立即执行
      const idleWorker = this.getIdleWorker();
      if (idleWorker) {
        this.runTask(idleWorker, task);
      } else {
        // 加入队列等待
        this.taskQueue.push(task);
        logger.debug(`Task queued: ${type}, queue length: ${this.taskQueue.length}`);
      }
    });
  }

  /**
   * 在指定Worker上运行任务
   * @param {WorkerWrapper} worker - Worker实例
   * @param {WorkerTask} task - 任务对象
   */
  async runTask(worker, task) {
    try {
      const result = await worker.execute(task);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      // 处理队列中的下一个任务
      this.processQueue();
    }
  }

  /**
   * 处理任务队列
   */
  processQueue() {
    if (this.taskQueue.length === 0) {
      return;
    }

    const idleWorker = this.getIdleWorker();
    if (!idleWorker) {
      return;
    }

    const task = this.taskQueue.shift();
    this.runTask(idleWorker, task);
  }

  /**
   * 终止所有Worker
   */
  terminate() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.isInitialized = false;
    logger.info('Worker pool terminated');
  }

  /**
   * 获取池状态
   * @returns {Object}
   */
  getStatus() {
    return {
      total: this.workers.length,
      busy: this.workers.filter((w) => w.busy).length,
      idle: this.workers.filter((w) => !w.busy).length,
      queueLength: this.taskQueue.length,
    };
  }
}

// 全局Worker池实例
let dataProcessorPool = null;

/**
 * 获取数据处理Worker池
 * @returns {WorkerPool}
 */
export function getDataProcessorPool() {
  if (!dataProcessorPool) {
    dataProcessorPool = new WorkerPool(new URL('../workers/dataProcessor.worker.js', import.meta.url).href, 4);
  }
  return dataProcessorPool;
}

/**
 * 数据处理API
 */
export const DataProcessor = {
  /**
   * 排序数据
   * @param {Array} items - 数据项数组
   * @param {Object} sortConfig - 排序配置 { key, order }
   * @returns {Promise<{data: Array, duration: number}>}
   */
  sort(items, sortConfig) {
    return getDataProcessorPool().execute('sort', { items, sortConfig });
  },

  /**
   * 筛选数据
   * @param {Array} items - 数据项数组
   * @param {Array} filters - 筛选条件数组
   * @returns {Promise<{data: Array, duration: number}>}
   */
  filter(items, filters) {
    return getDataProcessorPool().execute('filter', { items, filters });
  },

  /**
   * 分组聚合
   * @param {Array} items - 数据项数组
   * @param {string} groupKey - 分组字段
   * @param {Array} aggregations - 聚合配置
   * @returns {Promise<{data: Array, duration: number}>}
   */
  groupBy(items, groupKey, aggregations) {
    return getDataProcessorPool().execute('groupBy', { items, groupKey, aggregations });
  },

  /**
   * 数据去重
   * @param {Array} items - 数据项数组
   * @param {string} key - 去重字段
   * @returns {Promise<{data: Array, duration: number}>}
   */
  unique(items, key) {
    return getDataProcessorPool().execute('unique', { items, key });
  },

  /**
   * 数据转换
   * @param {Array} items - 数据项数组
   * @param {Array} mappings - 字段映射配置
   * @returns {Promise<{data: Array, duration: number}>}
   */
  transform(items, mappings) {
    return getDataProcessorPool().execute('transform', { items, mappings });
  },

  /**
   * 复杂查询
   * @param {Array} items - 数据项数组
   * @param {Object} options - 查询选项 { filters, sort, pagination }
   * @returns {Promise<{data: {data: Array, total: number}, duration: number}>}
   */
  query(items, options = {}) {
    return getDataProcessorPool().execute('query', {
      items,
      filters: options.filters,
      sort: options.sort,
      pagination: options.pagination,
    });
  },

  /**
   * 统计分析
   * @param {Array} items - 数据项数组
   * @param {Array} stats - 统计配置
   * @returns {Promise<{data: Object, duration: number}>}
   */
  statistics(items, stats) {
    return getDataProcessorPool().execute('statistics', { items, stats });
  },

  /**
   * 搜索高亮
   * @param {Array} items - 数据项数组
   * @param {string} keyword - 搜索关键词
   * @param {Array} fields - 搜索字段
   * @returns {Promise<{data: Array, duration: number}>}
   */
  search(items, keyword, fields) {
    return getDataProcessorPool().execute('search', { items, keyword, fields });
  },
};

/**
 * 使用Worker处理大数据的Hook
 * @returns {Object} Worker处理方法和状态
 */
export function useWorkerProcessor() {
  const isProcessing = ref(false);
  const error = ref(null);
  const lastDuration = ref(0);

  /**
   * 执行Worker任务
   * @param {string} type - 任务类型
   * @param {Object} data - 任务数据
   * @returns {Promise}
   */
  const process = async (type, data) => {
    isProcessing.value = true;
    error.value = null;

    try {
      const result = await getDataProcessorPool().execute(type, data);
      lastDuration.value = result.duration;
      return result.data;
    } catch (err) {
      error.value = err.message;
      logger.error('Worker processing error:', err);
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * 批量处理数据
   * @param {Array} items - 大数据数组
   * @param {Function} batchProcessor - 批处理函数
   * @param {number} batchSize - 批次大小
   * @returns {Promise<Array>}
   */
  const processBatches = async (items, batchProcessor, batchSize = 1000) => {
    const results = [];
    const batches = [];

    // 分割批次
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // 顺序处理批次
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await process('transform', {
        items: batch,
        mappings: [],
      });
      results.push(...batchProcessor(result.data));
    }

    return results;
  };

  return {
    isProcessing,
    error,
    lastDuration,
    process,
    processBatches,
    DataProcessor,
  };
}

/**
 * 终止所有Worker
 */
export function terminateAllWorkers() {
  if (dataProcessorPool) {
    dataProcessorPool.terminate();
    dataProcessorPool = null;
  }
}

// 页面卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', terminateAllWorkers);
}

export default {
  getDataProcessorPool,
  DataProcessor,
  useWorkerProcessor,
  terminateAllWorkers,
};
