/**
 * Saga事务管理器
 * @file: sagaTransaction.js
 * @description: 实现分布式事务的Saga模式，支持长事务的补偿机制
 * @author: Trae AI
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import { ElMessage } from 'element-plus';

import { createLogger } from './logger';

const logger = createLogger('SagaTransaction');

/**
 * 事务步骤状态
 */
export const STEP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  COMPENSATING: 'compensating',
  COMPENSATED: 'compensated',
  COMPENSATION_FAILED: 'compensation_failed',
};

/**
 * 事务状态
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  COMPENSATING: 'compensating',
  COMPENSATED: 'compensated',
  PARTIALLY_COMPENSATED: 'partially_compensated',
};

/**
 * Saga事务步骤
 */
export class SagaStep {
  constructor(options) {
    const { id, name, execute, compensate, maxRetries = 3, retryDelay = 1000, timeout = 30000 } = options;

    this.id = id || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name || '未命名步骤';
    this.execute = execute;
    this.compensate = compensate;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.timeout = timeout;
    this.status = STEP_STATUS.PENDING;
    this.result = null;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
    this.retryCount = 0;
  }

  /**
   * 执行步骤
   */
  async run(context) {
    this.status = STEP_STATUS.RUNNING;
    this.startTime = Date.now();

    try {
      // 设置超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`步骤执行超时: ${this.timeout}ms`)), this.timeout);
      });

      // 执行步骤
      const executePromise = this.execute(context);
      this.result = await Promise.race([executePromise, timeoutPromise]);

      this.status = STEP_STATUS.SUCCESS;
      this.endTime = Date.now();

      logger.info(`Saga步骤执行成功: ${this.name}`, {
        stepId: this.id,
        duration: this.endTime - this.startTime,
      });

      return { success: true, result: this.result };
    } catch (error) {
      this.error = error;
      this.status = STEP_STATUS.FAILED;
      this.endTime = Date.now();

      logger.error(`Saga步骤执行失败: ${this.name}`, {
        stepId: this.id,
        error: error.message,
        duration: this.endTime - this.startTime,
      });

      return { success: false, error };
    }
  }

  /**
   * 执行补偿
   */
  async runCompensation(context) {
    if (!this.compensate) {
      logger.warn(`步骤 ${this.name} 没有定义补偿操作`);
      return { success: true };
    }

    this.status = STEP_STATUS.COMPENSATING;
    const startTime = Date.now();

    try {
      // 重试补偿操作
      for (let i = 0; i < this.maxRetries; i++) {
        try {
          await this.compensate(context, this.result);
          this.status = STEP_STATUS.COMPENSATED;

          logger.info(`Saga步骤补偿成功: ${this.name}`, {
            stepId: this.id,
            retryCount: i,
            duration: Date.now() - startTime,
          });

          return { success: true };
        } catch (error) {
          if (i === this.maxRetries - 1) {
            throw error;
          }
          await this.delay(this.retryDelay * (i + 1));
        }
      }
    } catch (error) {
      this.status = STEP_STATUS.COMPENSATION_FAILED;

      logger.error(`Saga步骤补偿失败: ${this.name}`, {
        stepId: this.id,
        error: error.message,
      });

      return { success: false, error };
    }
  }

  /**
   * 延迟
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Saga事务
 */
export class SagaTransaction {
  constructor(options = {}) {
    const { name, context = {}, onStepComplete, onStepError, onCompensationRequired } = options;

    this.id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name || '未命名事务';
    this.steps = [];
    this.context = context;
    this.status = TRANSACTION_STATUS.PENDING;
    this.currentStepIndex = -1;
    this.onStepComplete = onStepComplete;
    this.onStepError = onStepError;
    this.onCompensationRequired = onCompensationRequired;
    this.startTime = null;
    this.endTime = null;
    this.compensationErrors = [];
  }

  /**
   * 添加步骤
   */
  addStep(options) {
    const step = new SagaStep(options);
    this.steps.push(step);
    return this;
  }

  /**
   * 执行事务
   */
  async execute() {
    this.status = TRANSACTION_STATUS.RUNNING;
    this.startTime = Date.now();

    logger.info(`Saga事务开始执行: ${this.name}`, {
      transactionId: this.id,
      stepCount: this.steps.length,
    });

    for (let i = 0; i < this.steps.length; i++) {
      this.currentStepIndex = i;
      const step = this.steps[i];

      // 执行步骤
      const result = await step.run(this.context);

      if (result.success) {
        // 步骤成功，更新上下文
        this.context[`step_${i}_result`] = result.result;

        if (this.onStepComplete) {
          await this.onStepComplete(step, result.result, this.context);
        }
      } else {
        // 步骤失败，开始补偿
        logger.error(`Saga事务步骤失败，开始补偿: ${step.name}`, {
          transactionId: this.id,
          stepId: step.id,
          error: result.error.message,
        });

        if (this.onStepError) {
          await this.onStepError(step, result.error, this.context);
        }

        await this.compensate(i);
        return {
          success: false,
          error: result.error,
          failedStep: step,
          transactionId: this.id,
        };
      }
    }

    // 所有步骤成功
    this.status = TRANSACTION_STATUS.SUCCESS;
    this.endTime = Date.now();

    logger.info(`Saga事务执行成功: ${this.name}`, {
      transactionId: this.id,
      duration: this.endTime - this.startTime,
    });

    return {
      success: true,
      result: this.context,
      transactionId: this.id,
    };
  }

  /**
   * 执行补偿
   */
  async compensate(failedStepIndex) {
    this.status = TRANSACTION_STATUS.COMPENSATING;

    logger.info(`Saga事务开始补偿: ${this.name}`, {
      transactionId: this.id,
      failedStepIndex,
      stepsToCompensate: failedStepIndex,
    });

    if (this.onCompensationRequired) {
      await this.onCompensationRequired(this.steps[failedStepIndex], this.context);
    }

    // 逆序执行补偿
    for (let i = failedStepIndex - 1; i >= 0; i--) {
      const step = this.steps[i];

      // 只补偿已成功的步骤
      if (step.status === STEP_STATUS.SUCCESS) {
        const result = await step.runCompensation(this.context);

        if (!result.success) {
          this.compensationErrors.push({
            step,
            error: result.error,
          });

          logger.error(`Saga步骤补偿失败: ${step.name}`, {
            transactionId: this.id,
            stepId: step.id,
            error: result.error.message,
          });
        }
      }
    }

    // 确定最终状态
    if (this.compensationErrors.length > 0) {
      this.status = TRANSACTION_STATUS.PARTIALLY_COMPENSATED;
      this.endTime = Date.now();

      // 发送补偿失败告警
      await this.reportCompensationFailure();

      return {
        success: false,
        status: TRANSACTION_STATUS.PARTIALLY_COMPENSATED,
        compensationErrors: this.compensationErrors,
        transactionId: this.id,
      };
    }

    this.status = TRANSACTION_STATUS.COMPENSATED;
    this.endTime = Date.now();

    logger.info(`Saga事务补偿完成: ${this.name}`, {
      transactionId: this.id,
      duration: this.endTime - this.startTime,
    });

    return {
      success: false,
      status: TRANSACTION_STATUS.COMPENSATED,
      transactionId: this.id,
    };
  }

  /**
   * 报告补偿失败
   */
  async reportCompensationFailure() {
    const errorInfo = {
      transactionId: this.id,
      transactionName: this.name,
      timestamp: new Date().toISOString(),
      compensationErrors: this.compensationErrors.map((e) => ({
        stepId: e.step.id,
        stepName: e.step.name,
        error: e.error.message,
      })),
    };

    logger.error('Saga事务补偿失败，需要人工介入', errorInfo);

    // 发送错误报告到服务器
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(errorInfo)], { type: 'application/json' });
        navigator.sendBeacon('/api/compensation-failure-report', blob);
      } else {
        await fetch('/api/compensation-failure-report', {
          method: 'POST',
          body: JSON.stringify(errorInfo),
          keepalive: true,
        });
      }
    } catch (e) {
      logger.error('发送补偿失败报告失败', e);
    }

    // 显示错误提示
    ElMessage.error('事务处理异常，部分操作需要人工处理，请联系管理员');
  }

  /**
   * 获取事务状态
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      currentStep: this.currentStepIndex,
      totalSteps: this.steps.length,
      steps: this.steps.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        duration: s.endTime && s.startTime ? s.endTime - s.startTime : null,
      })),
      duration: this.endTime && this.startTime ? this.endTime - this.startTime : null,
    };
  }
}

/**
 * Saga事务管理器
 */
export class SagaTransactionManager {
  constructor() {
    this.transactions = new Map();
    this.maxTransactions = 100;
  }

  /**
   * 创建事务
   */
  createTransaction(options) {
    const transaction = new SagaTransaction(options);
    this.transactions.set(transaction.id, transaction);

    // 清理旧事务
    if (this.transactions.size > this.maxTransactions) {
      const oldestKey = this.transactions.keys().next().value;
      this.transactions.delete(oldestKey);
    }

    return transaction;
  }

  /**
   * 获取事务
   */
  getTransaction(id) {
    return this.transactions.get(id);
  }

  /**
   * 移除事务
   */
  removeTransaction(id) {
    this.transactions.delete(id);
  }

  /**
   * 获取所有事务状态
   */
  getAllTransactions() {
    return Array.from(this.transactions.values()).map((t) => t.getStatus());
  }
}

// 导出单例
export const sagaManager = new SagaTransactionManager();

/**
 * 创建出库事务的工厂函数
 */
export function createOutboundTransaction(options) {
  const {
    orderId,
    items,
    outboundType,
    executeOutboundOrder,
    updateDeviceStatus,
    createBusinessRecord,
    rollbackOutboundOrder,
    rollbackDeviceStatus,
    deleteBusinessRecord,
  } = options;

  const transaction = sagaManager.createTransaction({
    name: `出库事务_${orderId}`,
    context: { orderId, items, outboundType },
  });

  // 步骤1: 执行出库
  transaction.addStep({
    id: 'execute_outbound',
    name: '执行出库',
    execute: async (context) => {
      const result = await executeOutboundOrder(context.orderId);
      context.outboundResult = result;
      return result;
    },
    compensate: async (context) => {
      if (context.outboundResult) {
        await rollbackOutboundOrder(context.orderId);
      }
    },
  });

  // 步骤2: 更新设备状态
  transaction.addStep({
    id: 'update_device_status',
    name: '更新设备状态',
    execute: async (context) => {
      const results = [];
      for (const item of context.items) {
        const result = await updateDeviceStatus(item.deviceId, context.outboundType);
        results.push({ deviceId: item.deviceId, result });
      }
      context.deviceStatusResults = results;
      return results;
    },
    compensate: async (context) => {
      if (context.deviceStatusResults) {
        for (const { deviceId } of context.deviceStatusResults) {
          await rollbackDeviceStatus(deviceId);
        }
      }
    },
  });

  // 步骤3: 创建业务记录
  transaction.addStep({
    id: 'create_business_record',
    name: '创建业务记录',
    execute: async (context) => {
      const results = [];
      for (const item of context.items) {
        const recordData = {
          deviceId: item.deviceId,
          sourceOutboundNo: context.orderId,
          ...item,
        };
        const result = await createBusinessRecord(recordData, context.outboundType);
        results.push({ deviceId: item.deviceId, recordId: result.id });
      }
      context.businessRecords = results;
      return results;
    },
    compensate: async (context) => {
      if (context.businessRecords) {
        for (const { recordId } of context.businessRecords) {
          await deleteBusinessRecord(recordId);
        }
      }
    },
  });

  return transaction;
}

export default {
  SagaTransaction,
  SagaStep,
  SagaTransactionManager,
  sagaManager,
  createOutboundTransaction,
  TRANSACTION_STATUS,
  STEP_STATUS,
};
