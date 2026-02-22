/**
 * 状态机管理Store
 * @file: stateMachine.js
 * @description: 统一管理设备状态流转，提供集中式的状态机管理
 * @author: Trae AI
 * @createTime: 2026-02-13
 * @version: 1.0
 */

import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import { DEVICE_STATUS } from '@/constants/deviceStatus.js';
import { createLogger } from '@/utils/logger';

const logger = createLogger('StateMachineStore');

/**
 * 状态转换事件类型
 */
export const STATE_EVENTS = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  INSTALL: 'INSTALL',
  UNINSTALL: 'UNINSTALL',
  REPAIR: 'REPAIR',
  REPAIR_COMPLETE: 'REPAIR_COMPLETE',
  SCRAP: 'SCRAP',
  TRANSFER: 'TRANSFER',
  RETURN: 'RETURN',
};

/**
 * 状态机配置
 */
const STATE_MACHINE_CONFIG = {
  initial: DEVICE_STATUS.PENDING_INBOUND,
  states: {
    [DEVICE_STATUS.PENDING_INBOUND]: {
      label: '待入库',
      type: 'info',
      allowedEvents: [STATE_EVENTS.INBOUND],
      transitions: {
        [STATE_EVENTS.INBOUND]: {
          target: DEVICE_STATUS.INVENTORY,
          guard: null,
          sideEffects: ['createInventoryRecord'],
        },
      },
    },
    [DEVICE_STATUS.INVENTORY]: {
      label: '在库',
      type: 'success',
      allowedEvents: [
        STATE_EVENTS.OUTBOUND,
        STATE_EVENTS.INSTALL,
        STATE_EVENTS.REPAIR,
        STATE_EVENTS.SCRAP,
        STATE_EVENTS.TRANSFER,
      ],
      transitions: {
        [STATE_EVENTS.OUTBOUND]: {
          target: DEVICE_STATUS.INVENTORY,
          guard: null,
          sideEffects: ['createOutboundRecord', 'updateInventory'],
        },
        [STATE_EVENTS.INSTALL]: {
          target: DEVICE_STATUS.IN_USE,
          guard: 'validateInstallConditions',
          sideEffects: ['createInstallationRecord', 'updateDeviceLocation'],
        },
        [STATE_EVENTS.REPAIR]: {
          target: DEVICE_STATUS.MAINTENANCE,
          guard: null,
          sideEffects: ['createRepairRecord'],
        },
        [STATE_EVENTS.SCRAP]: {
          target: DEVICE_STATUS.SCRAPPED,
          guard: 'validateScrapConditions',
          sideEffects: ['createScrapRecord', 'clearInventory'],
        },
        [STATE_EVENTS.TRANSFER]: {
          target: DEVICE_STATUS.INVENTORY,
          guard: null,
          sideEffects: ['createTransferRecord', 'updateLocation'],
        },
      },
    },
    [DEVICE_STATUS.IN_USE]: {
      label: '使用中',
      type: 'primary',
      allowedEvents: [STATE_EVENTS.UNINSTALL, STATE_EVENTS.REPAIR, STATE_EVENTS.SCRAP],
      transitions: {
        [STATE_EVENTS.UNINSTALL]: {
          target: DEVICE_STATUS.INVENTORY,
          guard: null,
          sideEffects: ['completeInstallation', 'returnToInventory'],
        },
        [STATE_EVENTS.REPAIR]: {
          target: DEVICE_STATUS.MAINTENANCE,
          guard: null,
          sideEffects: ['createRepairRecord'],
        },
        [STATE_EVENTS.SCRAP]: {
          target: DEVICE_STATUS.SCRAPPED,
          guard: 'validateScrapConditions',
          sideEffects: ['createScrapRecord', 'clearInventory'],
        },
      },
    },
    [DEVICE_STATUS.MAINTENANCE]: {
      label: '维护中',
      type: 'warning',
      allowedEvents: [STATE_EVENTS.REPAIR_COMPLETE, STATE_EVENTS.SCRAP],
      transitions: {
        [STATE_EVENTS.REPAIR_COMPLETE]: {
          target: DEVICE_STATUS.INVENTORY,
          guard: null,
          sideEffects: ['completeRepairRecord', 'returnToInventory'],
        },
        [STATE_EVENTS.SCRAP]: {
          target: DEVICE_STATUS.SCRAPPED,
          guard: 'validateScrapConditions',
          sideEffects: ['createScrapRecord', 'clearInventory'],
        },
      },
    },
    [DEVICE_STATUS.SCRAPPED]: {
      label: '已报废',
      type: 'danger',
      allowedEvents: [],
      transitions: {},
    },
  },
};

/**
 * 守卫函数
 */
const guards = {
  /**
   * 验证安装条件
   */
  validateInstallConditions: (context, device) => {
    if (!device) {
      throw new Error('设备信息不存在');
    }
    if (device.status !== DEVICE_STATUS.INVENTORY) {
      throw new Error(`设备当前状态为 ${device.status}，无法执行安装操作`);
    }
    return true;
  },

  /**
   * 验证报废条件
   */
  validateScrapConditions: (context, device) => {
    if (!device) {
      throw new Error('设备信息不存在');
    }
    // 报废前需要确认设备不在使用中
    if (device.status === DEVICE_STATUS.IN_USE) {
      throw new Error('设备正在使用中，请先卸载后再报废');
    }
    return true;
  },

  /**
   * 验证库存充足
   */
  validateStockAvailable: (context, device, quantity = 1) => {
    if (!device.stock || device.stock < quantity) {
      throw new Error(`库存不足，当前库存: ${device.stock || 0}`);
    }
    return true;
  },
};

/**
 * 副作用函数
 */
const sideEffects = {
  /**
   * 创建入库记录
   */
  createInventoryRecord: async (context, device, _eventData) => {
    logger.info('创建入库记录', { deviceId: device.id });
  },

  /**
   * 创建出库记录
   */
  createOutboundRecord: async (context, device, _eventData) => {
    logger.info('创建出库记录', { deviceId: device.id });
  },

  /**
   * 创建设备安装记录
   */
  createInstallationRecord: async (context, device, _eventData) => {
    logger.info('创建设备安装记录', { deviceId: device.id });
  },

  /**
   * 创建维修记录
   */
  createRepairRecord: async (context, device, _eventData) => {
    logger.info('创建维修记录', { deviceId: device.id });
  },

  /**
   * 创建报废记录
   */
  createScrapRecord: async (context, device, _eventData) => {
    logger.info('创建报废记录', { deviceId: device.id });
  },

  /**
   * 创建设备调拨记录
   */
  createTransferRecord: async (context, device, _eventData) => {
    logger.info('创建设备调拨记录', { deviceId: device.id });
  },

  /**
   * 更新库存
   */
  updateInventory: async (context, device, _eventData) => {
    logger.info('更新库存', { deviceId: device.id });
  },

  /**
   * 清空库存
   */
  clearInventory: async (context, device, _eventData) => {
    logger.info('清空库存', { deviceId: device.id });
  },

  /**
   * 更新设备位置
   */
  updateDeviceLocation: async (context, device, eventData) => {
    logger.info('更新设备位置', { deviceId: device.id, location: eventData.location });
  },

  /**
   * 完成安装记录
   */
  completeInstallation: async (context, device, _eventData) => {
    logger.info('完成安装记录', { deviceId: device.id });
  },

  /**
   * 完成维修记录
   */
  completeRepairRecord: async (context, device, _eventData) => {
    logger.info('完成维修记录', { deviceId: device.id });
  },

  /**
   * 返回库存
   */
  returnToInventory: async (context, device, _eventData) => {
    logger.info('设备返回库存', { deviceId: device.id });
  },
};

/**
 * 状态机Store
 */
export const useStateMachineStore = defineStore('stateMachine', () => {
  // 状态
  const currentState = ref(STATE_MACHINE_CONFIG.initial);
  const stateHistory = reactive([]);
  const transitionInProgress = ref(false);
  const lastError = ref(null);

  // Getters
  const stateConfig = computed(() => STATE_MACHINE_CONFIG.states[currentState.value]);
  const allowedEvents = computed(() => stateConfig.value?.allowedEvents || []);
  const stateLabel = computed(() => stateConfig.value?.label || '未知状态');
  const stateType = computed(() => stateConfig.value?.type || 'info');

  /**
   * 获取状态配置
   */
  const getStateConfig = (state) => {
    return STATE_MACHINE_CONFIG.states[state];
  };

  /**
   * 验证状态转换
   */
  const validateTransition = (currentStatus, event, context = {}) => {
    const stateConfig = getStateConfig(currentStatus);
    if (!stateConfig) {
      return { valid: false, error: `无效的状态: ${currentStatus}` };
    }

    const transition = stateConfig.transitions[event];
    if (!transition) {
      return {
        valid: false,
        error: `当前状态 ${currentStatus} 不允许执行 ${event} 操作`,
      };
    }

    // 执行守卫验证
    if (transition.guard) {
      const guardFn = guards[transition.guard];
      if (guardFn) {
        try {
          guardFn(context, context.device);
        } catch (error) {
          return { valid: false, error: error.message };
        }
      }
    }

    return { valid: true, transition };
  };

  /**
   * 执行状态转换
   */
  const transition = async (deviceId, event, eventData = {}) => {
    if (transitionInProgress.value) {
      throw new Error('状态转换正在进行中，请稍后再试');
    }

    transitionInProgress.value = true;
    lastError.value = null;

    try {
      // 获取设备当前状态
      const device = eventData.device || { id: deviceId, status: currentState.value };
      const currentStatus = device.status;

      // 验证转换
      const validation = validateTransition(currentStatus, event, eventData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { transition: transitionConfig } = validation;
      const targetState = transitionConfig.target;

      logger.info(`状态转换: ${currentStatus} -> ${targetState}`, {
        deviceId,
        event,
        eventData,
      });

      // 执行副作用
      if (transitionConfig.sideEffects) {
        for (const effectName of transitionConfig.sideEffects) {
          const effectFn = sideEffects[effectName];
          if (effectFn) {
            await effectFn(eventData, device, eventData);
          }
        }
      }

      // 记录历史
      stateHistory.unshift({
        timestamp: new Date().toISOString(),
        deviceId,
        from: currentStatus,
        to: targetState,
        event,
        eventData,
      });

      // 限制历史记录数量
      if (stateHistory.length > 100) {
        stateHistory.pop();
      }

      // 更新当前状态
      currentState.value = targetState;

      logger.info(`状态转换成功: ${currentStatus} -> ${targetState}`, { deviceId });

      return {
        success: true,
        from: currentStatus,
        to: targetState,
        deviceId,
      };
    } catch (error) {
      lastError.value = error;
      logger.error('状态转换失败', error, { deviceId, event, eventData });
      throw error;
    } finally {
      transitionInProgress.value = false;
    }
  };

  /**
   * 批量状态转换
   */
  const batchTransition = async (deviceIds, event, eventData = {}) => {
    const results = [];
    const errors = [];

    for (const deviceId of deviceIds) {
      try {
        const result = await transition(deviceId, event, eventData);
        results.push(result);
      } catch (error) {
        errors.push({ deviceId, error: error.message });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      total: deviceIds.length,
      successCount: results.length,
      failCount: errors.length,
    };
  };

  /**
   * 获取允许的操作
   */
  const getAllowedOperations = (state) => {
    const config = getStateConfig(state);
    if (!config) {
      return [];
    }

    return config.allowedEvents.map((event) => ({
      event,
      label: getEventLabel(event),
      type: getEventType(event),
    }));
  };

  /**
   * 获取事件标签
   */
  const getEventLabel = (event) => {
    const labels = {
      [STATE_EVENTS.INBOUND]: '入库',
      [STATE_EVENTS.OUTBOUND]: '出库',
      [STATE_EVENTS.INSTALL]: '安装',
      [STATE_EVENTS.UNINSTALL]: '卸载',
      [STATE_EVENTS.REPAIR]: '维修',
      [STATE_EVENTS.REPAIR_COMPLETE]: '完成维修',
      [STATE_EVENTS.SCRAP]: '报废',
      [STATE_EVENTS.TRANSFER]: '调拨',
      [STATE_EVENTS.RETURN]: '归还',
    };
    return labels[event] || event;
  };

  /**
   * 获取事件类型
   */
  const getEventType = (event) => {
    const types = {
      [STATE_EVENTS.INBOUND]: 'success',
      [STATE_EVENTS.OUTBOUND]: 'warning',
      [STATE_EVENTS.INSTALL]: 'primary',
      [STATE_EVENTS.UNINSTALL]: 'info',
      [STATE_EVENTS.REPAIR]: 'warning',
      [STATE_EVENTS.REPAIR_COMPLETE]: 'success',
      [STATE_EVENTS.SCRAP]: 'danger',
      [STATE_EVENTS.TRANSFER]: 'info',
      [STATE_EVENTS.RETURN]: 'success',
    };
    return types[event] || 'info';
  };

  /**
   * 获取状态历史
   */
  const getStateHistory = (deviceId) => {
    if (deviceId) {
      return stateHistory.filter((h) => h.deviceId === deviceId);
    }
    return [...stateHistory];
  };

  /**
   * 重置状态
   */
  const reset = () => {
    currentState.value = STATE_MACHINE_CONFIG.initial;
    stateHistory.length = 0;
    lastError.value = null;
    transitionInProgress.value = false;
  };

  return {
    // State
    currentState,
    stateHistory,
    transitionInProgress,
    lastError,

    // Getters
    stateConfig,
    allowedEvents,
    stateLabel,
    stateType,

    // Actions
    getStateConfig,
    validateTransition,
    transition,
    batchTransition,
    getAllowedOperations,
    getStateHistory,
    reset,

    // Constants
    STATE_EVENTS,
    DEVICE_STATUS,
  };
});

export default {
  useStateMachineStore,
  STATE_EVENTS,
  STATE_MACHINE_CONFIG,
  guards,
  sideEffects,
};
