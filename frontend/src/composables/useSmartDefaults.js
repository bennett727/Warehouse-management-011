/**
 * @file: useSmartDefaults.js
 * @description: 智能默认值填充组合式函数
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 1.0
 * @modifyRecords:
 *     2026-02-13: 创建智能默认值填充功能
 *       - 基于历史记录学习用户习惯
 *       - 基于上下文智能推断
 *       - 支持多字段联动
 */

import { ref, computed } from 'vue';

import { useUserStore } from '@/stores/user';
import { useWarehouseStore } from '@/stores/warehouse';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SmartDefaults');

/**
 * 智能默认值配置
 */
const DEFAULT_CONFIG = {
  // 学习样本数量
  sampleSize: 20,
  // 置信度阈值
  confidenceThreshold: 0.6,
  // 缓存时间（分钟）
  cacheDuration: 30,
};

/**
 * 智能默认值管理
 * @param {string} formType - 表单类型
 * @param {Object} options - 配置选项
 * @returns {Object} 智能默认值相关方法和状态
 */
export function useSmartDefaults(formType, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };

  const userStore = useUserStore();

  const loading = ref(false);
  const suggestions = ref({});
  const appliedDefaults = ref({});
  const userPreferences = ref({});

  const cache = ref(new Map());

  /**
   * 获取缓存键
   * @param {string} key - 键
   * @returns {string} 完整缓存键
   */
  const getCacheKey = (key) => {
    return `${formType}:${userStore.currentUser?.id}:${key}`;
  };

  /**
   * 获取缓存数据
   * @param {string} key - 键
   * @returns {Object|null} 缓存数据
   */
  const getCache = (key) => {
    const cacheKey = getCacheKey(key);
    const cached = cache.value.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < config.cacheDuration * 60 * 1000) {
      return cached.data;
    }
    cache.value.delete(cacheKey);
    return null;
  };

  /**
   * 设置缓存
   * @param {string} key - 键
   * @param {Object} data - 数据
   */
  const setCache = (key, data) => {
    const cacheKey = getCacheKey(key);
    cache.value.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  };

  /**
   * 分析用户历史记录，提取常用值
   * @param {Array} history - 历史记录
   * @param {string} field - 字段名
   * @returns {Object} 分析结果
   */
  const analyzeFieldPatterns = (history, field) => {
    const values = history
      .map((record) => record[field])
      .filter((value) => value !== undefined && value !== null && value !== '');

    if (values.length === 0) {
      return { confidence: 0, value: null };
    }

    // 统计频率
    const frequency = {};
    values.forEach((value) => {
      const key = JSON.stringify(value);
      frequency[key] = (frequency[key] || 0) + 1;
    });

    // 找出最频繁的值
    let maxCount = 0;
    let mostFrequent = null;

    Object.entries(frequency).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = JSON.parse(key);
      }
    });

    const confidence = maxCount / values.length;

    return {
      confidence,
      value: mostFrequent,
      frequency: maxCount,
      total: values.length,
    };
  };

  /**
   * 获取字段智能建议
   * @param {string} field - 字段名
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} 建议值
   */
  const getFieldSuggestion = async (field, context = {}) => {
    // 检查缓存
    const cacheKey = `field:${field}:${JSON.stringify(context)}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    loading.value = true;

    try {
      let suggestion = null;

      // 根据表单类型和字段获取建议
      switch (formType) {
        case 'inbound':
          suggestion = await getInboundFieldSuggestion(field, context);
          break;
        case 'outbound':
          suggestion = await getOutboundFieldSuggestion(field, context);
          break;
        case 'installation':
          suggestion = await getInstallationFieldSuggestion(field, context);
          break;
        case 'repair':
          suggestion = await getRepairFieldSuggestion(field, context);
          break;
        default:
          suggestion = await getGenericFieldSuggestion(field, context);
      }

      // 缓存结果
      setCache(cacheKey, suggestion);

      return suggestion;
    } catch (error) {
      logger.error(`获取字段 ${field} 建议失败`, error);
      return { confidence: 0, value: null };
    } finally {
      loading.value = false;
    }
  };

  /**
   * 入库单字段建议
   */
  const getInboundFieldSuggestion = async (field, _context) => {
    switch (field) {
      case 'warehouseId':
        return analyzeFieldPatterns(userStore.userHistory?.inboundOrders || [], 'warehouseId');

      case 'supplier':
        return analyzeFieldPatterns(userStore.userHistory?.inboundOrders || [], 'supplier');

      case 'inboundType':
        return { confidence: 0.8, value: 0 };

      case 'operator':
        return { confidence: 0.95, value: userStore.currentUser?.name };

      case 'orderDate':
        return { confidence: 0.9, value: new Date().toISOString().split('T')[0] };

      default:
        return { confidence: 0, value: null };
    }
  };

  /**
   * 出库单字段建议
   */
  const getOutboundFieldSuggestion = async (field, _context) => {
    switch (field) {
      case 'warehouseId':
        return analyzeFieldPatterns(userStore.userHistory?.outboundOrders || [], 'warehouseId');

      case 'outboundType':
        return { confidence: 0.7, value: 0 };

      case 'operator':
        return { confidence: 0.95, value: userStore.currentUser?.name };

      case 'orderDate':
        return { confidence: 0.9, value: new Date().toISOString().split('T')[0] };

      default:
        return { confidence: 0, value: null };
    }
  };

  /**
   * 安装单字段建议
   */
  const getInstallationFieldSuggestion = async (field, context) => {
    switch (field) {
      case 'installer':
        return { confidence: 0.9, value: userStore.currentUser?.name };

      case 'installDate':
        return { confidence: 0.85, value: new Date().toISOString().split('T')[0] };

      case 'areaId':
        // 如果有设备信息，推荐设备所在区域
        if (context.device?.areaId) {
          return { confidence: 0.8, value: context.device.areaId };
        }
        return analyzeFieldPatterns(userStore.userHistory?.installations || [], 'areaId');

      default:
        return { confidence: 0, value: null };
    }
  };

  /**
   * 维修单字段建议
   */
  const getRepairFieldSuggestion = async (field, _context) => {
    switch (field) {
      case 'repairer':
        return { confidence: 0.9, value: userStore.currentUser?.name };

      case 'repairDate':
        return { confidence: 0.85, value: new Date().toISOString().split('T')[0] };

      case 'repairType':
        return { confidence: 0.6, value: 'routine' };

      default:
        return { confidence: 0, value: null };
    }
  };

  /**
   * 通用字段建议
   */
  const getGenericFieldSuggestion = async (field, _context) => {
    const history = userStore.userHistory?.[formType] || [];
    return analyzeFieldPatterns(history, field);
  };

  /**
   * 获取表单智能默认值
   * @param {Array} fields - 字段列表
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} 智能默认值
   */
  const getFormDefaults = async (fields, context = {}) => {
    loading.value = true;

    try {
      const defaults = {};
      const suggestions = {};

      for (const field of fields) {
        const suggestion = await getFieldSuggestion(field, context);

        if (suggestion.confidence >= config.confidenceThreshold) {
          defaults[field] = suggestion.value;
        }

        suggestions[field] = suggestion;
      }

      return {
        defaults,
        suggestions,
        appliedCount: Object.keys(defaults).length,
      };
    } catch (error) {
      logger.error('获取表单默认值失败', error);
      return { defaults: {}, suggestions: {}, appliedCount: 0 };
    } finally {
      loading.value = false;
    }
  };

  /**
   * 应用智能默认值到表单
   * @param {Object} form - 表单对象
   * @param {Object} defaults - 默认值
   */
  const applyDefaults = (form, defaults) => {
    Object.entries(defaults).forEach(([field, value]) => {
      if (form[field] === undefined || form[field] === null || form[field] === '') {
        form[field] = value;
        appliedDefaults.value[field] = value;
      }
    });
  };

  /**
   * 记录用户选择，用于学习
   * @param {string} field - 字段名
   * @param {*} value - 值
   */
  const recordUserChoice = (field, value) => {
    if (!userPreferences.value[field]) {
      userPreferences.value[field] = [];
    }

    userPreferences.value[field].push({
      value,
      timestamp: Date.now(),
    });

    // 只保留最近50条记录
    if (userPreferences.value[field].length > 50) {
      userPreferences.value[field] = userPreferences.value[field].slice(-50);
    }
  };

  /**
   * 清除已应用的默认值
   */
  const clearAppliedDefaults = () => {
    appliedDefaults.value = {};
  };

  /**
   * 获取已应用默认值列表
   */
  const getAppliedDefaultsList = computed(() => {
    return Object.entries(appliedDefaults.value).map(([field, value]) => ({
      field,
      value,
    }));
  });

  return {
    // 状态
    loading,
    suggestions,
    appliedDefaults,

    // 计算属性
    appliedDefaultsList: getAppliedDefaultsList,

    // 方法
    getFieldSuggestion,
    getFormDefaults,
    applyDefaults,
    recordUserChoice,
    clearAppliedDefaults,
  };
}

/**
 * 字段联动规则
 */
const FIELD_RELATIONS = {
  inbound: {
    warehouseId: {
      affects: ['areaId', 'binId'],
      handler: async (value, warehouseStore) => {
        const areas = await warehouseStore.getAreasByWarehouse(value);
        return {
          areaId: areas.length > 0 ? { options: areas } : null,
        };
      },
    },
    areaId: {
      affects: ['binId'],
      handler: async (value, warehouseStore) => {
        const bins = await warehouseStore.getBinsByArea(value);
        return {
          binId: bins.length > 0 ? { options: bins } : null,
        };
      },
    },
  },
  outbound: {
    warehouseId: {
      affects: ['areaId'],
      handler: async (value, warehouseStore) => {
        const areas = await warehouseStore.getAreasByWarehouse(value);
        return {
          areaId: areas.length > 0 ? { options: areas } : null,
        };
      },
    },
  },
};

/**
 * 处理字段联动
 * @param {string} formType - 表单类型
 * @param {string} field - 字段名
 * @param {*} value - 字段值
 * @param {Object} warehouseStore - 仓库store
 * @returns {Promise<Object>} 联动结果
 */
export async function handleFieldRelation(formType, field, value, warehouseStore) {
  const relations = FIELD_RELATIONS[formType];
  if (!relations || !relations[field]) {
    return {};
  }

  const relation = relations[field];

  try {
    const result = await relation.handler(value, warehouseStore);
    return {
      affectedFields: relation.affects,
      updates: result,
    };
  } catch (error) {
    logger.error('字段联动处理失败', error);
    return {};
  }
}

export default {
  useSmartDefaults,
  handleFieldRelation,
};
