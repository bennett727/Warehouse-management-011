/**
 * @file: useSmartBinRecommendation.js
 * @description: 智能货位推荐组合式函数
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 1.0
 * @modifyRecords:
 *     2026-02-13: 创建智能货位推荐功能
 *       - 基于设备类型推荐货位
 *       - 基于历史入库记录推荐
 *       - 基于货位空闲率推荐
 *       - 支持多维度排序
 */

import { ref, computed } from 'vue';

import { useInventoryStore } from '@/stores/inventory';
import { useWarehouseStore } from '@/stores/warehouse';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SmartBinRecommendation');

/**
 * 智能货位推荐配置
 */
const DEFAULT_CONFIG = {
  // 推荐算法权重
  weights: {
    sameType: 0.4, // 同类型设备权重
    historical: 0.3, // 历史记录权重
    capacity: 0.2, // 容量权重
    proximity: 0.1, //  proximity权重
  },
  // 推荐数量
  recommendationCount: 5,
  // 最小空闲率
  minFreeRate: 0.1,
  // 最大推荐距离（米）
  maxDistance: 50,
};

/**
 * 智能货位推荐
 * @param {Object} options - 配置选项
 * @returns {Object} 推荐相关方法和状态
 */
export function useSmartBinRecommendation(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };

  const warehouseStore = useWarehouseStore();
  const inventoryStore = useInventoryStore();

  // 状态
  const loading = ref(false);
  const recommendations = ref([]);
  const selectedBin = ref(null);
  const recommendationReason = ref('');

  // 缓存
  const cache = ref(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 生成缓存键
   * @param {Object} params - 参数
   * @returns {string} 缓存键
   */
  const generateCacheKey = (params) => {
    return JSON.stringify(params);
  };

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存数据
   */
  const getCache = (key) => {
    const cached = cache.value.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    cache.value.delete(key);
    return null;
  };

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {Object} data - 缓存数据
   */
  const setCache = (key, data) => {
    cache.value.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  /**
   * 清空缓存
   */
  const clearCache = () => {
    cache.value.clear();
  };

  /**
   * 计算货位评分
   * @param {Object} bin - 货位信息
   * @param {Object} context - 上下文信息
   * @returns {number} 评分 (0-100)
   */
  const calculateBinScore = (bin, context) => {
    let score = 0;
    const { weights } = config;

    // 1. 同类型设备权重
    if (context.deviceTypeId && bin.preferredDeviceTypes?.includes(context.deviceTypeId)) {
      score += weights.sameType * 100;
    }

    // 2. 历史记录权重
    if (context.historicalBins?.includes(bin.id)) {
      score += weights.historical * 100;
    }

    // 3. 容量权重
    const freeRate = bin.freeRate || (bin.capacity - bin.occupied) / bin.capacity;
    if (freeRate >= config.minFreeRate) {
      score += weights.capacity * freeRate * 100;
    }

    // 4. 距离权重（如果有参考位置）
    if (context.referenceLocation && bin.distance !== undefined) {
      const distanceScore = Math.max(0, 1 - bin.distance / config.maxDistance);
      score += weights.proximity * distanceScore * 100;
    }

    return Math.round(score);
  };

  /**
   * 获取智能推荐货位
   * @param {Object} params - 推荐参数
   * @returns {Promise<Array>} 推荐货位列表
   */
  const getRecommendations = async (params = {}) => {
    const { deviceTypeId, warehouseId, areaId, quantity = 1, referenceLocation, excludeBinIds = [] } = params;

    loading.value = true;

    try {
      // 检查缓存
      const cacheKey = generateCacheKey(params);
      const cached = getCache(cacheKey);
      if (cached) {
        recommendations.value = cached;
        return cached;
      }

      // 获取货位列表
      let bins = [];
      if (warehouseId) {
        bins = await warehouseStore.getBinsByWarehouse(warehouseId);
      } else if (areaId) {
        bins = await warehouseStore.getBinsByArea(areaId);
      } else {
        bins = await warehouseStore.getAllBins();
      }

      // 过滤不可用货位
      bins = bins.filter(
        (bin) =>
          bin.status === 'AVAILABLE' && !excludeBinIds.includes(bin.id) && bin.capacity - bin.occupied >= quantity
      );

      // 获取历史入库记录
      let historicalBins = [];
      if (deviceTypeId) {
        const history = await inventoryStore.getInboundHistoryByDeviceType(deviceTypeId, 10);
        historicalBins = history.map((h) => h.binId);
      }

      // 计算评分
      const scoredBins = bins.map((bin) => ({
        ...bin,
        score: calculateBinScore(bin, {
          deviceTypeId,
          historicalBins,
          referenceLocation,
        }),
        reason: generateRecommendationReason(bin, {
          deviceTypeId,
          historicalBins,
        }),
      }));

      // 排序并取前N个
      const sortedBins = scoredBins.sort((a, b) => b.score - a.score).slice(0, config.recommendationCount);

      // 缓存结果
      setCache(cacheKey, sortedBins);

      recommendations.value = sortedBins;
      return sortedBins;
    } catch (error) {
      logger.error('获取货位推荐失败', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 生成推荐理由
   * @param {Object} bin - 货位信息
   * @param {Object} context - 上下文
   * @returns {string} 推荐理由
   */
  const generateRecommendationReason = (bin, context) => {
    const reasons = [];

    if (context.deviceTypeId && bin.preferredDeviceTypes?.includes(context.deviceTypeId)) {
      reasons.push('该货位适合存放此类设备');
    }

    if (context.historicalBins?.includes(bin.id)) {
      reasons.push('历史入库记录推荐');
    }

    const freeRate = bin.freeRate || (bin.capacity - bin.occupied) / bin.capacity;
    if (freeRate > 0.8) {
      reasons.push('货位空闲率高');
    }

    if (bin.distance !== undefined && bin.distance < 10) {
      reasons.push('距离近，便于操作');
    }

    return reasons.join('，') || '综合评分推荐';
  };

  /**
   * 选择货位
   * @param {Object} bin - 货位信息
   */
  const selectBin = (bin) => {
    selectedBin.value = bin;
    recommendationReason.value = bin.reason || '';
  };

  /**
   * 清除选择
   */
  const clearSelection = () => {
    selectedBin.value = null;
    recommendationReason.value = '';
  };

  /**
   * 获取最佳推荐
   * @returns {Object|null} 最佳推荐货位
   */
  const bestRecommendation = computed(() => {
    return recommendations.value[0] || null;
  });

  /**
   * 是否有推荐
   * @returns {boolean} 是否有推荐
   */
  const hasRecommendations = computed(() => {
    return recommendations.value.length > 0;
  });

  /**
   * 刷新推荐
   * @param {Object} params - 推荐参数
   * @returns {Promise<Array>} 推荐货位列表
   */
  const refreshRecommendations = async (params) => {
    clearCache();
    return getRecommendations(params);
  };

  return {
    // 状态
    loading,
    recommendations,
    selectedBin,
    recommendationReason,

    // 计算属性
    bestRecommendation,
    hasRecommendations,

    // 方法
    getRecommendations,
    selectBin,
    clearSelection,
    refreshRecommendations,
    clearCache,
  };
}

/**
 * 批量货位推荐
 * @param {Array} items - 入库项目列表
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 批量推荐结果
 */
export async function getBatchBinRecommendations(items, options = {}) {
  const results = [];
  const usedBinIds = new Set();

  for (const item of items) {
    const recommendation = await useSmartBinRecommendation(options).getRecommendations({
      deviceTypeId: item.deviceTypeId,
      quantity: item.quantity,
      excludeBinIds: Array.from(usedBinIds),
    });

    if (recommendation.length > 0) {
      const selectedBin = recommendation[0];
      usedBinIds.add(selectedBin.id);
      results.push({
        itemId: item.id,
        binId: selectedBin.id,
        binCode: selectedBin.code,
        binName: selectedBin.name,
        score: selectedBin.score,
        reason: selectedBin.reason,
      });
    } else {
      results.push({
        itemId: item.id,
        error: '未找到合适的货位',
      });
    }
  }

  return {
    success: results.every((r) => !r.error),
    results,
    summary: {
      total: items.length,
      success: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
    },
  };
}

export default {
  useSmartBinRecommendation,
  getBatchBinRecommendations,
};
