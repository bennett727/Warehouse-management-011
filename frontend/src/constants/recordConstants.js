/**
 * 业务记录模块常量配置
 * @description 统一业务记录模块的常量、配置和工具函数
 * @author: 开发团队
 * @createTime: 2026-02-11
 * @version: 1.0
 */

import {
  Bell,
  Box,
  Brush,
  Calendar,
  Collection,
  Document,
  FirstAidKit,
  Setting,
  Tools,
  Van,
} from '@element-plus/icons-vue';

// ==================== 图标映射 ====================
export const RECORD_ICONS = {
  installation: Setting,
  repair: Tools,
  maintenance: Brush,
  scrap: FirstAidKit,
  inventory: Document,
  inbound: Box,
  outbound: Box,
  transfer: Van,
  stockCount: Calendar,
  stockStatus: Collection,
  alert: Bell,
};

// ==================== 页面标题配置 ====================
export const RECORD_TITLES = {
  installation: {
    title: '安装记录管理',
    description: '管理设备安装记录，追踪安装状态',
    filterTitle: '安装记录筛选',
  },
  repair: {
    title: '维修记录管理',
    description: '管理设备维修记录，追踪维修进度',
    filterTitle: '维修记录筛选',
  },
  maintenance: {
    title: '保养记录管理',
    description: '管理设备保养记录，制定保养计划',
    filterTitle: '保养记录筛选',
  },
  scrap: {
    title: '报废记录管理',
    description: '管理设备报废记录，审批报废申请',
    filterTitle: '报废记录筛选',
  },
  inventory: {
    title: '库存记录管理',
    description: '查看库存操作记录，追踪库存变动',
    filterTitle: '库存记录筛选',
  },
};

// ==================== 状态标签配置 ====================
export const STATUS_CONFIG = {
  // 通用状态
  common: {
    pending: { type: 'info', text: '待处理' },
    processing: { type: 'warning', text: '处理中' },
    completed: { type: 'success', text: '已完成' },
    cancelled: { type: 'danger', text: '已取消' },
  },
  // 安装状态
  installation: {
    pending: { type: 'info', text: '待安装' },
    installing: { type: 'warning', text: '安装中' },
    completed: { type: 'success', text: '已完成' },
  },
  // 维修状态
  repair: {
    pending: { type: 'info', text: '待维修' },
    repairing: { type: 'warning', text: '维修中' },
    completed: { type: 'success', text: '已完成' },
  },
  // 保养状态
  maintenance: {
    pending: { type: 'info', text: '待保养' },
    maintaining: { type: 'warning', text: '保养中' },
    completed: { type: 'success', text: '已完成' },
  },
  // 报废状态
  scrap: {
    pending: { type: 'info', text: '待审批' },
    approved: { type: 'warning', text: '已批准' },
    completed: { type: 'success', text: '已完成' },
    rejected: { type: 'danger', text: '已拒绝' },
  },
};

// ==================== 表格列宽配置 ====================
export const TABLE_COLUMN_WIDTHS = {
  index: 60,
  no: 150,
  code: 120,
  name: 180,
  type: 120,
  status: 100,
  date: 120,
  operator: 120,
  warehouse: 150,
  quantity: 100,
  amount: 120,
  actions: 200,
};

// ==================== 分页配置 ====================
export const PAGINATION_CONFIG = {
  pageSizes: [10, 20, 50, 100],
  defaultPageSize: 10,
  layout: 'total, sizes, prev, pager, next, jumper',
};

// ==================== 工具函数 ====================

/**
 * 获取状态标签配置
 * @param {string} status - 状态值
 * @param {string} module - 模块名称
 * @returns {Object} - { type, text }
 */
export const getStatusConfig = (status, module = 'common') => {
  const config = STATUS_CONFIG[module] || STATUS_CONFIG.common;
  return config[status] || { type: 'info', text: status };
};

/**
 * 获取状态标签类型
 * @param {string} status - 状态值
 * @param {string} module - 模块名称
 * @returns {string} - Element Plus 标签类型
 */
export const getStatusType = (status, module = 'common') => {
  return getStatusConfig(status, module).type;
};

/**
 * 获取状态标签文本
 * @param {string} status - 状态值
 * @param {string} module - 模块名称
 * @returns {string} - 状态文本
 */
export const getStatusText = (status, module = 'common') => {
  return getStatusConfig(status, module).text;
};

/**
 * 格式化货币金额
 * @param {number} value - 金额值
 * @param {string} currency - 货币符号
 * @returns {string} - 格式化后的金额字符串
 */
export const formatCurrency = (value, currency = '¥') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  return `${currency} ${Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * 格式化日期
 * @param {string|Date} date - 日期值
 * @param {string} format - 格式模板
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) {
    return '-';
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '-';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 生成单号
 * @param {string} prefix - 前缀
 * @param {string} module - 模块代码
 * @returns {string} - 生成的单号
 */
export const generateOrderNo = (prefix, module) => {
  const date = new Date();
  const dateStr = formatDate(date, 'YYYYMMDD');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}${module}${dateStr}${random}`;
};

// ==================== 筛选字段配置生成器 ====================

/**
 * 创建通用筛选字段配置
 * @param {Object} options - 配置选项
 * @returns {Array} - 筛选字段配置数组
 */
export const createCommonFilterFields = (options = {}) => {
  const { showDevice = true, showStatus = true, statusOptions = [] } = options;

  const fields = [];

  if (showDevice) {
    fields.push(
      {
        prop: 'deviceCode',
        label: '设备编号',
        type: 'input',
        placeholder: '请输入设备编号',
        md: 8,
        lg: 6,
        clearable: true,
      },
      {
        prop: 'deviceName',
        label: '设备名称',
        type: 'input',
        placeholder: '请输入设备名称',
        md: 8,
        lg: 6,
        clearable: true,
      }
    );
  }

  if (showStatus && statusOptions.length > 0) {
    fields.push({
      prop: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      md: 8,
      lg: 6,
      options: statusOptions,
      clearable: true,
    });
  }

  return fields;
};
