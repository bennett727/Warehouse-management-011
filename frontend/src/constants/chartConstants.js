/**
 * @file: chartConstants.js
 * @description: 图表配置常量 - 集中管理所有图表的默认配置和状态映射
 * @author: 开发团队
 * @createTime: 2026-02-18
 * @version: 1.0.0
 */

// ============================================
// 设备状态图表配置
// ============================================

/**
 * 设备状态分布图默认配置
 * 当API返回数据为空时使用
 */
export const DEVICE_STATUS_CHART_DEFAULT = {
  data: [
    { value: 0, name: '在库', itemStyle: { color: '#67c23a' } },
    { value: 0, name: '已安装', itemStyle: { color: '#409eff' } },
    { value: 0, name: '维修中', itemStyle: { color: '#e6a23c' } },
    { value: 0, name: '已报废', itemStyle: { color: '#909399' } },
    { value: 0, name: '调拨中', itemStyle: { color: '#8e44ad' } },
  ],
  emptyText: '暂无设备数据',
};

/**
 * 设备状态映射 - 用于图表和表格显示
 */
export const DEVICE_STATUS_MAP = {
  IN_STOCK: { label: '在库', color: '#67c23a', type: 'success' },
  IN_USE: { label: '使用中', color: '#409eff', type: 'primary' },
  INSTALLED: { label: '使用中', color: '#409eff', type: 'primary' },
  MAINTENANCE: { label: '维护中', color: '#e6a23c', type: 'warning' },
  REPAIRING: { label: '维护中', color: '#e6a23c', type: 'warning' },
  SCRAPPED: { label: '已报废', color: '#909399', type: 'info' },
  IN_TRANSIT: { label: '调拨中', color: '#8e44ad', type: 'purple' },
  NORMAL: { label: '正常', color: '#67c23a', type: 'success' },
  FAULT: { label: '故障', color: '#f56c6c', type: 'danger' },
};

// ============================================
// 趋势图配置
// ============================================

/**
 * 趋势图月份配置
 * 支持动态生成最近12个月份
 */
export const TREND_CHART_CONFIG = {
  /**
   * 获取最近12个月的月份数组
   * @returns {string[]} 月份数组，如 ['1月', '2月', ...]
   */
  getRecentMonths() {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${date.getMonth() + 1}月`);
    }
    return months;
  },

  /**
   * 获取指定月份数的月份数组
   * @param {number} count - 月份数量
   * @returns {string[]} 月份数组
   */
  getMonths(count = 12) {
    const months = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${date.getMonth() + 1}月`);
    }
    return months;
  },

  /**
   * 默认空数据数组
   * @param {number} length - 数组长度
   * @returns {number[]} 空数据数组
   */
  getEmptyData(length = 12) {
    return new Array(length).fill(0);
  },

  /**
   * 趋势图系列配置
   */
  series: {
    inbound: { name: '入库', color: '#67c23a', type: 'line' },
    outbound: { name: '出库', color: '#f56c6c', type: 'line' },
    stock: { name: '库存', color: '#409eff', type: 'line' },
  },
};

// ============================================
// 业务记录图表配置
// ============================================

/**
 * 业务记录统计图默认配置
 */
export const BUSINESS_CHART_DEFAULT = {
  data: [
    { value: 0, itemStyle: { color: '#409eff' } },
    { value: 0, itemStyle: { color: '#f56c6c' } },
    { value: 0, itemStyle: { color: '#67c23a' } },
    { value: 0, itemStyle: { color: '#909399' } },
    { value: 0, itemStyle: { color: '#e6a23c' } },
  ],
  categories: ['安装', '维修', '保养', '报废', '调拨'],
  emptyText: '暂无业务记录',
};

/**
 * 业务类型映射
 */
export const BUSINESS_TYPE_MAP = {
  INSTALL: { label: '安装', color: '#409eff', type: 'primary' },
  REPAIR: { label: '维修', color: '#f56c6c', type: 'danger' },
  MAINTENANCE: { label: '保养', color: '#67c23a', type: 'success' },
  SCRAP: { label: '报废', color: '#909399', type: 'info' },
  TRANSFER: { label: '调拨', color: '#e6a23c', type: 'warning' },
};

// ============================================
// 操作类型映射
// ============================================

/**
 * 操作类型文本映射
 */
export const ACTION_TEXT_MAP = {
  INBOUND: '设备入库',
  OUTBOUND: '设备出库',
  REPAIR: '维修登记',
  TRANSFER: '库存调拨',
  INSTALL: '设备安装',
  SCRAP: '报废申请',
  MAINTENANCE: '保养记录',
  COUNT: '库存盘点',
};

/**
 * 操作类型标签样式映射
 */
export const ACTION_TYPE_MAP = {
  INBOUND: 'success',
  OUTBOUND: 'info',
  REPAIR: 'warning',
  TRANSFER: 'primary',
  INSTALL: 'success',
  SCRAP: 'danger',
  MAINTENANCE: 'success',
  COUNT: 'info',
};

// ============================================
// 区域分布图表配置
// ============================================

/**
 * 区域分布图默认配置
 */
export const AREA_CHART_DEFAULT = {
  data: [],
  emptyText: '暂无区域数据',
};

// ============================================
// 图表通用配置
// ============================================

/**
 * 图表通用样式配置
 */
export const CHART_COMMON_STYLE = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: { color: '#606266' },
    extraCssText: 'box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);',
  },
  legend: {
    bottom: '5%',
    left: 'center',
    textStyle: { color: '#606266' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true,
  },
};

/**
 * 空状态显示配置
 */
export const CHART_EMPTY_CONFIG = {
  showEmptyText: true,
  emptyText: '暂无数据',
  emptyTextStyle: {
    color: '#909399',
    fontSize: 14,
  },
};
