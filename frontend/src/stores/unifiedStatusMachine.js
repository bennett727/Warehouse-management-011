/**
 * @file: unifiedStatusMachine.js
 * @description: 统一状态机管理 - 集中管理所有业务状态流转
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 1.0
 * @modifyRecords:
 *     2026-02-13: 创建统一状态机，整合入库、出库、维修、报废等业务状态
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import {
  InboundStatus,
  InboundStatusConfig,
  InboundStatusTransitions,
  checkOperationAllowed as checkInboundOperation,
  getAvailableTransitions as getInboundTransitions,
  InboundFlowSteps,
} from '@/constants/inboundStatus';
import {
  OutboundStatus,
  OutboundStatusConfig,
  OutboundStatusTransitions,
  checkOutboundOperationAllowed,
  getAvailableTransitions as getOutboundTransitions,
  OutboundFlowSteps,
} from '@/constants/outboundStatus';

/**
 * 业务类型枚举
 */
export const BusinessType = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  REPAIR: 'repair',
  INSTALLATION: 'installation',
  SCRAP: 'scrap',
  TRANSFER: 'transfer',
  STOCK_COUNT: 'stock_count',
};

/**
 * 状态机配置映射
 */
const StatusMachineConfig = {
  [BusinessType.INBOUND]: {
    statusEnum: InboundStatus,
    statusConfig: InboundStatusConfig,
    transitions: InboundStatusTransitions,
    flowSteps: InboundFlowSteps,
    checkOperation: checkInboundOperation,
    getTransitions: getInboundTransitions,
    label: '入库',
    icon: 'Download',
    color: '#67C23A',
  },
  [BusinessType.OUTBOUND]: {
    statusEnum: OutboundStatus,
    statusConfig: OutboundStatusConfig,
    transitions: OutboundStatusTransitions,
    flowSteps: OutboundFlowSteps,
    checkOperation: checkOutboundOperationAllowed,
    getTransitions: getOutboundTransitions,
    label: '出库',
    icon: 'Upload',
    color: '#E6A23C',
  },
};

/**
 * 统一状态机Store
 */
export const useUnifiedStatusMachine = defineStore('unifiedStatusMachine', () => {
  // State
  const currentBusinessType = ref('');
  const currentStatus = ref(null);
  const statusHistory = ref([]);
  const transitionLogs = ref([]);

  // Getters

  /**
   * 当前业务配置
   */
  const currentConfig = computed(() => {
    return StatusMachineConfig[currentBusinessType.value] || null;
  });

  /**
   * 当前状态配置
   */
  const currentStatusConfig = computed(() => {
    if (!currentConfig.value || currentStatus.value === null) {
      return null;
    }
    return currentConfig.value.statusConfig[currentStatus.value];
  });

  /**
   * 当前状态文本
   */
  const currentStatusText = computed(() => {
    return currentStatusConfig.value?.label || '未知';
  });

  /**
   * 当前状态类型
   */
  const currentStatusType = computed(() => {
    return currentStatusConfig.value?.type || 'info';
  });

  /**
   * 可用的状态流转选项
   */
  const availableTransitions = computed(() => {
    if (!currentConfig.value || currentStatus.value === null) {
      return [];
    }
    return currentConfig.value.getTransitions(currentStatus.value);
  });

  /**
   * 流程步骤
   */
  const flowSteps = computed(() => {
    return currentConfig.value?.flowSteps || [];
  });

  /**
   * 当前流程步骤索引
   */
  const currentStepIndex = computed(() => {
    if (!currentConfig.value || currentStatus.value === null) {
      return -1;
    }
    const stepMap = {};
    currentConfig.value.flowSteps.forEach((step, index) => {
      stepMap[step.status] = index;
    });
    return stepMap[currentStatus.value] ?? -1;
  });

  /**
   * 是否为终态
   */
  const isFinalStatus = computed(() => {
    return availableTransitions.value.length === 0;
  });

  /**
   * 是否可以回退
   */
  const canRollback = computed(() => {
    return statusHistory.value.length > 1;
  });

  // Actions

  /**
   * 设置业务类型
   * @param {string} businessType - 业务类型
   */
  const setBusinessType = (businessType) => {
    currentBusinessType.value = businessType;
    currentStatus.value = null;
    statusHistory.value = [];
  };

  /**
   * 设置当前状态
   * @param {number} status - 状态码
   * @param {Object} context - 上下文信息
   */
  const setStatus = (status, context = {}) => {
    if (currentStatus.value !== null) {
      statusHistory.value.push({
        from: currentStatus.value,
        to: status,
        timestamp: new Date().toISOString(),
        context,
      });
    }
    currentStatus.value = status;
  };

  /**
   * 检查操作是否允许
   * @param {string} operation - 操作类型
   * @returns {boolean} 是否允许
   */
  const checkOperation = (operation) => {
    if (!currentConfig.value || currentStatus.value === null) {
      return false;
    }
    return currentConfig.value.checkOperation(currentStatus.value, operation);
  };

  /**
   * 执行状态流转
   * @param {number} targetStatus - 目标状态
   * @param {Object} context - 上下文信息
   * @returns {Object} 流转结果
   */
  const transition = (targetStatus, context = {}) => {
    const transitions = availableTransitions.value;
    const validTransition = transitions.find((t) => t.to === targetStatus);

    if (!validTransition) {
      return {
        success: false,
        message: `不允许从 ${currentStatusText.value} 流转到目标状态`,
      };
    }

    const previousStatus = currentStatus.value;
    setStatus(targetStatus, {
      ...context,
      action: validTransition.action,
      operation: validTransition.operation,
    });

    // 记录流转日志
    transitionLogs.value.push({
      businessType: currentBusinessType.value,
      from: previousStatus,
      to: targetStatus,
      action: validTransition.action,
      timestamp: new Date().toISOString(),
      context,
    });

    return {
      success: true,
      message: `状态流转成功: ${validTransition.action}`,
      from: previousStatus,
      to: targetStatus,
    };
  };

  /**
   * 回退到上一个状态
   * @param {Object} context - 上下文信息
   * @returns {Object} 回退结果
   */
  const rollback = (context = {}) => {
    if (!canRollback.value) {
      return {
        success: false,
        message: '无法回退，没有历史状态',
      };
    }

    const lastTransition = statusHistory.value.pop();
    currentStatus.value = lastTransition.from;

    transitionLogs.value.push({
      businessType: currentBusinessType.value,
      from: lastTransition.to,
      to: lastTransition.from,
      action: '回退',
      timestamp: new Date().toISOString(),
      context,
      isRollback: true,
    });

    return {
      success: true,
      message: '状态回退成功',
      from: lastTransition.to,
      to: lastTransition.from,
    };
  };

  /**
   * 获取状态文本
   * @param {number} status - 状态码
   * @returns {string} 状态文本
   */
  const getStatusText = (status) => {
    if (!currentConfig.value) {
      return '未知';
    }
    return currentConfig.value.statusConfig[status]?.label || '未知';
  };

  /**
   * 获取状态类型
   * @param {number} status - 状态码
   * @returns {string} 状态类型
   */
  const getStatusType = (status) => {
    if (!currentConfig.value) {
      return 'info';
    }
    return currentConfig.value.statusConfig[status]?.type || 'info';
  };

  /**
   * 获取状态颜色
   * @param {number} status - 状态码
   * @returns {string} 状态颜色
   */
  const getStatusColor = (status) => {
    if (!currentConfig.value) {
      return '#909399';
    }
    return currentConfig.value.statusConfig[status]?.color || '#909399';
  };

  /**
   * 重置状态机
   */
  const reset = () => {
    currentBusinessType.value = '';
    currentStatus.value = null;
    statusHistory.value = [];
  };

  /**
   * 清除历史记录
   */
  const clearHistory = () => {
    statusHistory.value = [];
    transitionLogs.value = [];
  };

  /**
   * 获取流转日志
   * @param {Object} filters - 过滤条件
   * @returns {Array} 流转日志列表
   */
  const getTransitionLogs = (filters = {}) => {
    let logs = [...transitionLogs.value];

    if (filters.businessType) {
      logs = logs.filter((log) => log.businessType === filters.businessType);
    }

    if (filters.fromStatus !== undefined) {
      logs = logs.filter((log) => log.from === filters.fromStatus);
    }

    if (filters.toStatus !== undefined) {
      logs = logs.filter((log) => log.to === filters.toStatus);
    }

    if (filters.startTime) {
      logs = logs.filter((log) => new Date(log.timestamp) >= new Date(filters.startTime));
    }

    if (filters.endTime) {
      logs = logs.filter((log) => new Date(log.timestamp) <= new Date(filters.endTime));
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  return {
    // State
    currentBusinessType,
    currentStatus,
    statusHistory,
    transitionLogs,

    // Getters
    currentConfig,
    currentStatusConfig,
    currentStatusText,
    currentStatusType,
    availableTransitions,
    flowSteps,
    currentStepIndex,
    isFinalStatus,
    canRollback,

    // Actions
    setBusinessType,
    setStatus,
    checkOperation,
    transition,
    rollback,
    getStatusText,
    getStatusType,
    getStatusColor,
    reset,
    clearHistory,
    getTransitionLogs,
  };
});

/**
 * 业务状态管理组合式函数
 * 提供更便捷的状态管理方式
 */
export function useBusinessStatus(businessType, initialStatus = null) {
  const store = useUnifiedStatusMachine();

  // 初始化
  store.setBusinessType(businessType);
  if (initialStatus !== null) {
    store.setStatus(initialStatus);
  }

  return {
    // 状态
    status: computed(() => store.currentStatus),
    statusText: computed(() => store.currentStatusText),
    statusType: computed(() => store.currentStatusType),
    isFinal: computed(() => store.isFinalStatus),
    canRollback: computed(() => store.canRollback),

    // 流程
    steps: computed(() => store.flowSteps),
    currentStep: computed(() => store.currentStepIndex),
    availableTransitions: computed(() => store.availableTransitions),

    // 方法
    setStatus: store.setStatus,
    checkOperation: store.checkOperation,
    transition: store.transition,
    rollback: store.rollback,
    getStatusText: store.getStatusText,
    getStatusType: store.getStatusType,
    getStatusColor: store.getStatusColor,
    reset: store.reset,
  };
}

export default {
  useUnifiedStatusMachine,
  useBusinessStatus,
  BusinessType,
  StatusMachineConfig,
};
