/**
 * @file: deviceStatus.js
 * @description: 设备状态统一常量定义
 * @author: 系统架构团队
 * @createTime: 2026-02-12
 * @version: 1.0.0
 *
 * 本文件定义了系统中所有设备相关的状态常量，包括：
 * - 设备状态（在库、使用中、维护中等）
 * - 维修记录状态
 * - 安装记录状态
 * - 出入库状态
 * - 审批状态
 *
 * 使用规范：
 * 1. 所有组件必须使用本文件中的常量，禁止硬编码状态值
 * 2. 前后端状态转换使用提供的转换函数
 * 3. 新增状态必须在此文件中定义并添加映射关系
 */

// ============================================
// 设备核心状态定义
// ============================================

/**
 * 设备核心状态（前端使用）
 */
export const DEVICE_STATUS = {
  PENDING_INBOUND: 'pending_inbound', // 待入库
  INVENTORY: 'inventory', // 在库
  IN_USE: 'in_use', // 使用中
  MAINTENANCE: 'maintenance', // 维护中
  SCRAPPED: 'scrapped', // 已报废
};

/**
 * 设备状态枚举（用于数字状态码）
 * 兼容后端返回的数字状态
 */
export const DeviceStatus = {
  PENDING_INBOUND: -1,
  IN_STOCK: 0,
  IN_USE: 1,
  MAINTENANCE: 2,
  SCRAPPED: 3,
  UNDER_REPAIR: 4,
  NORMAL: 5,
};

/**
 * 设备状态文本映射（数字状态码）
 */
export const DeviceStatusMap = {
  [DeviceStatus.PENDING_INBOUND]: '待入库',
  [DeviceStatus.IN_STOCK]: '在库',
  [DeviceStatus.IN_USE]: '已安装',
  [DeviceStatus.MAINTENANCE]: '维护中',
  [DeviceStatus.SCRAPPED]: '已报废',
  [DeviceStatus.UNDER_REPAIR]: '维修中',
  [DeviceStatus.NORMAL]: '正常',
};

/**
 * 设备状态颜色映射（数字状态码）
 */
export const DeviceStatusColor = {
  [DeviceStatus.PENDING_INBOUND]: 'info',
  [DeviceStatus.IN_STOCK]: 'success',
  [DeviceStatus.IN_USE]: 'primary',
  [DeviceStatus.MAINTENANCE]: 'warning',
  [DeviceStatus.SCRAPPED]: 'danger',
  [DeviceStatus.UNDER_REPAIR]: 'warning',
  [DeviceStatus.NORMAL]: 'success',
};

/**
 * 设备核心状态（后端API使用）
 */
export const BACKEND_DEVICE_STATUS = {
  PENDING_INBOUND: 'PENDING_INBOUND',
  IN_STOCK: 'IN_STOCK', // 在库
  INSTALLED: 'INSTALLED', // 已安装/使用中
  REPAIRING: 'REPAIRING', // 维修中/维护中
  SCRAPPED: 'SCRAPPED', // 已报废
};

/**
 * 设备状态详细信息
 */
export const DEVICE_STATUS_INFO = {
  [DEVICE_STATUS.PENDING_INBOUND]: {
    code: DEVICE_STATUS.PENDING_INBOUND,
    label: '待入库',
    backendCode: BACKEND_DEVICE_STATUS.PENDING_INBOUND,
    type: 'info',
    color: '#909399',
    description: '设备已采购，等待入库',
    sortOrder: 1,
  },
  [DEVICE_STATUS.INVENTORY]: {
    code: DEVICE_STATUS.INVENTORY,
    label: '在库',
    backendCode: BACKEND_DEVICE_STATUS.IN_STOCK,
    type: 'success',
    color: '#67C23A',
    description: '设备在仓库中，可用',
    sortOrder: 2,
  },
  [DEVICE_STATUS.IN_USE]: {
    code: DEVICE_STATUS.IN_USE,
    label: '使用中',
    backendCode: BACKEND_DEVICE_STATUS.INSTALLED,
    type: 'primary',
    color: '#409EFF',
    description: '设备已安装并正在使用',
    sortOrder: 3,
  },
  [DEVICE_STATUS.MAINTENANCE]: {
    code: DEVICE_STATUS.MAINTENANCE,
    label: '维护中',
    backendCode: BACKEND_DEVICE_STATUS.REPAIRING,
    type: 'warning',
    color: '#E6A23C',
    description: '设备正在维修或保养',
    sortOrder: 4,
  },
  [DEVICE_STATUS.SCRAPPED]: {
    code: DEVICE_STATUS.SCRAPPED,
    label: '已报废',
    backendCode: BACKEND_DEVICE_STATUS.SCRAPPED,
    type: 'danger',
    color: '#F56C6C',
    description: '设备已报废，不可用',
    sortOrder: 5,
  },
};

// ============================================
// 状态转换函数
// ============================================

/**
 * 前端状态转换为后端状态
 * @param {string} frontendCode - 前端状态码
 * @returns {string} 后端状态码
 */
export const toBackendStatus = (frontendCode) => {
  const statusInfo = DEVICE_STATUS_INFO[frontendCode];
  return statusInfo?.backendCode || frontendCode;
};

/**
 * 后端状态转换为前端状态
 * @param {string} backendCode - 后端状态码
 * @returns {string} 前端状态码
 */
export const toFrontendStatus = (backendCode) => {
  const entry = Object.values(DEVICE_STATUS_INFO).find((info) => info.backendCode === backendCode);
  return entry?.code || backendCode;
};

/**
 * 批量转换设备状态（从后端格式到前端格式）
 * @param {Array|Object} data - 设备数据或设备数组
 * @param {string} statusField - 状态字段名，默认为 'status'
 * @returns {Array|Object} 转换后的数据
 */
export const convertDeviceStatus = (data, statusField = 'status') => {
  if (!data) {
    return data;
  }

  const convertItem = (item) => {
    if (!item || typeof item !== 'object') {
      return item;
    }
    return {
      ...item,
      [statusField]: toFrontendStatus(item[statusField]),
      originalStatus: item[statusField], // 保留原始状态
    };
  };

  if (Array.isArray(data)) {
    return data.map(convertItem);
  }
  return convertItem(data);
};

// ============================================
// 状态流转规则
// ============================================

/**
 * 设备状态流转规则
 * 定义从当前状态可以流转到哪些目标状态
 */
export const DEVICE_STATUS_TRANSITIONS = {
  [DEVICE_STATUS.PENDING_INBOUND]: [DEVICE_STATUS.INVENTORY],
  [DEVICE_STATUS.INVENTORY]: [DEVICE_STATUS.IN_USE, DEVICE_STATUS.MAINTENANCE, DEVICE_STATUS.SCRAPPED],
  [DEVICE_STATUS.IN_USE]: [DEVICE_STATUS.INVENTORY, DEVICE_STATUS.MAINTENANCE, DEVICE_STATUS.SCRAPPED],
  [DEVICE_STATUS.MAINTENANCE]: [DEVICE_STATUS.INVENTORY, DEVICE_STATUS.SCRAPPED],
  [DEVICE_STATUS.SCRAPPED]: [], // 报废状态不可流转
};

/**
 * 验证状态流转是否合法
 * @param {string} currentStatus - 当前状态
 * @param {string} targetStatus - 目标状态
 * @returns {boolean} 是否允许流转
 */
export const validateStatusTransition = (currentStatus, targetStatus) => {
  const allowedTransitions = DEVICE_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(targetStatus);
};

/**
 * 获取指定状态下允许的操作
 * @param {string} status - 当前状态
 * @returns {Array} 允许的操作列表
 */
export const getAllowedOperations = (status) => {
  const operations = {
    [DEVICE_STATUS.PENDING_INBOUND]: ['inbound'],
    [DEVICE_STATUS.INVENTORY]: ['outbound', 'install', 'repair', 'scrap', 'transfer'],
    [DEVICE_STATUS.IN_USE]: ['uninstall', 'repair', 'scrap'],
    [DEVICE_STATUS.MAINTENANCE]: ['repair_complete', 'scrap'],
    [DEVICE_STATUS.SCRAPPED]: [],
  };
  return operations[status] || [];
};

// ============================================
// 维修记录状态
// ============================================

export const REPAIR_STATUS = {
  PENDING: 'pending', // 待维修
  REPAIRING: 'repairing', // 维修中
  COMPLETED: 'completed', // 已完成
  CANCELLED: 'cancelled', // 已取消
};

export const REPAIR_STATUS_INFO = {
  [REPAIR_STATUS.PENDING]: {
    code: REPAIR_STATUS.PENDING,
    label: '待维修',
    type: 'warning',
    color: '#E6A23C',
    description: '维修申请已提交，等待处理',
  },
  [REPAIR_STATUS.REPAIRING]: {
    code: REPAIR_STATUS.REPAIRING,
    label: '维修中',
    type: 'primary',
    color: '#409EFF',
    description: '设备正在维修中',
  },
  [REPAIR_STATUS.COMPLETED]: {
    code: REPAIR_STATUS.COMPLETED,
    label: '已完成',
    type: 'success',
    color: '#67C23A',
    description: '维修已完成',
  },
  [REPAIR_STATUS.CANCELLED]: {
    code: REPAIR_STATUS.CANCELLED,
    label: '已取消',
    type: 'info',
    color: '#909399',
    description: '维修申请已取消',
  },
};

// ============================================
// 安装记录状态
// ============================================

export const INSTALLATION_STATUS = {
  PENDING: 'pending', // 待安装
  INSTALLING: 'installing', // 安装中
  COMPLETED: 'completed', // 已完成
  UNINSTALLED: 'uninstalled', // 已拆卸
};

export const INSTALLATION_STATUS_INFO = {
  [INSTALLATION_STATUS.PENDING]: {
    code: INSTALLATION_STATUS.PENDING,
    label: '待安装',
    type: 'warning',
    color: '#E6A23C',
    description: '安装申请已提交，等待安装',
  },
  [INSTALLATION_STATUS.INSTALLING]: {
    code: INSTALLATION_STATUS.INSTALLING,
    label: '安装中',
    type: 'primary',
    color: '#409EFF',
    description: '设备正在安装中',
  },
  [INSTALLATION_STATUS.COMPLETED]: {
    code: INSTALLATION_STATUS.COMPLETED,
    label: '已完成',
    type: 'success',
    color: '#67C23A',
    description: '安装已完成',
  },
  [INSTALLATION_STATUS.UNINSTALLED]: {
    code: INSTALLATION_STATUS.UNINSTALLED,
    label: '已拆卸',
    type: 'info',
    color: '#909399',
    description: '设备已拆卸',
  },
};

// ============================================
// 出入库状态
// ============================================

export const STOCK_OPERATION_STATUS = {
  PENDING: 'pending', // 待处理
  PROCESSING: 'processing', // 处理中
  COMPLETED: 'completed', // 已完成
  CANCELLED: 'cancelled', // 已取消
};

export const STOCK_OPERATION_TYPE = {
  INBOUND: 'inbound', // 入库
  OUTBOUND: 'outbound', // 出库
  INSTALLATION: 'installation', // 安装出库
  REPAIR: 'repair', // 修复出库
  REPAIR_RETURN: 'repair_return', // 维修回库
  TRANSFER: 'transfer', // 调拨
  SCRAP: 'scrap', // 报废
  RETURN: 'return', // 退货
};

export const STOCK_OPERATION_TYPE_INFO = {
  [STOCK_OPERATION_TYPE.INBOUND]: {
    code: STOCK_OPERATION_TYPE.INBOUND,
    label: '入库',
    type: 'success',
    description: '设备入库',
  },
  [STOCK_OPERATION_TYPE.OUTBOUND]: {
    code: STOCK_OPERATION_TYPE.OUTBOUND,
    label: '出库',
    type: 'warning',
    description: '设备出库',
  },
  [STOCK_OPERATION_TYPE.INSTALLATION]: {
    code: STOCK_OPERATION_TYPE.INSTALLATION,
    label: '安装出库',
    type: 'primary',
    description: '设备出库用于安装',
  },
  [STOCK_OPERATION_TYPE.REPAIR]: {
    code: STOCK_OPERATION_TYPE.REPAIR,
    label: '修复出库',
    type: 'danger',
    description: '设备出库用于维修',
  },
  [STOCK_OPERATION_TYPE.REPAIR_RETURN]: {
    code: STOCK_OPERATION_TYPE.REPAIR_RETURN,
    label: '维修回库',
    type: 'success',
    description: '维修完成回库',
  },
  [STOCK_OPERATION_TYPE.TRANSFER]: {
    code: STOCK_OPERATION_TYPE.TRANSFER,
    label: '调拨',
    type: 'info',
    description: '设备调拨',
  },
  [STOCK_OPERATION_TYPE.SCRAP]: {
    code: STOCK_OPERATION_TYPE.SCRAP,
    label: '报废',
    type: 'danger',
    description: '设备报废',
  },
  [STOCK_OPERATION_TYPE.RETURN]: {
    code: STOCK_OPERATION_TYPE.RETURN,
    label: '退货',
    type: 'warning',
    description: '设备退货',
  },
};

// ============================================
// 审批状态
// ============================================

export const APPROVAL_STATUS = {
  PENDING: 'pending', // 待审批
  APPROVED: 'approved', // 已通过
  REJECTED: 'rejected', // 已拒绝
  CANCELLED: 'cancelled', // 已取消
};

export const APPROVAL_STATUS_INFO = {
  [APPROVAL_STATUS.PENDING]: {
    code: APPROVAL_STATUS.PENDING,
    label: '待审批',
    type: 'warning',
    color: '#E6A23C',
  },
  [APPROVAL_STATUS.APPROVED]: {
    code: APPROVAL_STATUS.APPROVED,
    label: '已通过',
    type: 'success',
    color: '#67C23A',
  },
  [APPROVAL_STATUS.REJECTED]: {
    code: APPROVAL_STATUS.REJECTED,
    label: '已拒绝',
    type: 'danger',
    color: '#F56C6C',
  },
  [APPROVAL_STATUS.CANCELLED]: {
    code: APPROVAL_STATUS.CANCELLED,
    label: '已取消',
    type: 'info',
    color: '#909399',
  },
};

// ============================================
// 辅助函数
// ============================================

/**
 * 获取状态标签
 * @param {string} statusCode - 状态码
 * @param {Object} statusMap - 状态映射对象
 * @returns {string} 状态标签
 */
export const getStatusLabel = (statusCode, statusMap = DEVICE_STATUS_INFO) => {
  return statusMap[statusCode]?.label || statusCode;
};

/**
 * 获取状态类型（用于Element Plus标签）
 * @param {string} statusCode - 状态码
 * @param {Object} statusMap - 状态映射对象
 * @returns {string} 状态类型
 */
export const getStatusType = (statusCode, statusMap = DEVICE_STATUS_INFO) => {
  return statusMap[statusCode]?.type || 'info';
};

/**
 * 获取设备状态标签类型（Element Plus标签类型）
 * @param {string|number} status - 设备状态码
 * @returns {string} 标签类型
 */
export const getDeviceStatusTagType = (status) => {
  // 字符串状态码映射
  const stringStatusMap = {
    inventory: 'success',
    in_stock: 'success',
    in_use: 'primary',
    installed: 'primary',
    maintenance: 'warning',
    repairing: 'warning',
    scrapped: 'danger',
    pending_inbound: 'info',
    normal: 'success',
  };

  // 先尝试字符串映射
  if (typeof status === 'string' && stringStatusMap[status] !== undefined) {
    return stringStatusMap[status];
  }

  // 数字状态码映射
  const numStatus = Number(status);
  const statusMap = {
    [-1]: 'info',
    0: 'success',
    1: 'primary',
    2: 'warning',
    3: 'danger',
    4: 'warning',
    5: 'success',
  };
  return statusMap[numStatus] || 'info';
};

/**
 * 获取设备状态文本
 * @param {string|number} status - 设备状态码
 * @returns {string} 状态文本
 */
export const getDeviceStatusText = (status) => {
  // 处理 undefined
  if (status === undefined) {
    return undefined;
  }

  // 处理 null
  if (status === null) {
    return '未知';
  }

  // 字符串状态码映射
  const stringStatusMap = {
    inventory: '在库',
    in_stock: '在库',
    in_use: '已安装',
    installed: '已安装',
    maintenance: '维护中',
    repairing: '维修中',
    scrapped: '已报废',
    pending_inbound: '待入库',
    normal: '正常',
  };

  // 先尝试字符串映射
  if (typeof status === 'string' && stringStatusMap[status] !== undefined) {
    return stringStatusMap[status];
  }

  // 数字状态码映射
  const numStatus = Number(status);
  const statusMap = {
    [-1]: '待入库',
    0: '在库',
    1: '已安装',
    2: '维护中',
    3: '已报废',
    4: '维修中',
    5: '正常',
  };

  // 如果数字映射存在，返回对应文本
  if (statusMap[numStatus] !== undefined) {
    return statusMap[numStatus];
  }

  // 对于未映射的字符串，返回原值
  if (typeof status === 'string') {
    return status;
  }

  return '未知';
};

/**
 * 设备类型映射
 */
const DEVICE_TYPE_MAP = {
  borrow_machine: '借用机',
  monitoring: '监控设备',
  network: '网络设备',
  server: '服务器',
  other: '其他',
  BORROW_MACHINE: '借用机',
  MONITORING: '监控设备',
  NETWORK: '网络设备',
  SERVER: '服务器',
  OTHER: '其他',
};

/**
 * 获取设备类型文本
 * @param {string} deviceType - 设备类型代码
 * @returns {string} 设备类型文本
 */
export const getDeviceTypeText = (deviceType) => {
  if (!deviceType) {
    return '-';
  }
  return DEVICE_TYPE_MAP[deviceType] || deviceType;
};

/**
 * 获取状态颜色
 * @param {string} statusCode - 状态码
 * @param {Object} statusMap - 状态映射对象
 * @returns {string} 状态颜色
 */
export const getStatusColor = (statusCode, statusMap = DEVICE_STATUS_INFO) => {
  return statusMap[statusCode]?.color || '#909399';
};

/**
 * 获取所有状态选项（用于下拉选择）
 * @param {Object} statusMap - 状态映射对象
 * @returns {Array} 状态选项数组
 */
export const getStatusOptions = (statusMap = DEVICE_STATUS_INFO) => {
  return Object.values(statusMap).map((info) => ({
    label: info.label,
    value: info.code,
    type: info.type,
    description: info.description,
  }));
};

// ============================================
// 默认导出
// ============================================

export default {
  // 设备状态
  DEVICE_STATUS,
  BACKEND_DEVICE_STATUS,
  DEVICE_STATUS_INFO,
  DEVICE_STATUS_TRANSITIONS,

  // 维修状态
  REPAIR_STATUS,
  REPAIR_STATUS_INFO,

  // 安装状态
  INSTALLATION_STATUS,
  INSTALLATION_STATUS_INFO,

  // 出入库
  STOCK_OPERATION_STATUS,
  STOCK_OPERATION_TYPE,
  STOCK_OPERATION_TYPE_INFO,

  // 审批状态
  APPROVAL_STATUS,
  APPROVAL_STATUS_INFO,

  // 转换函数
  toBackendStatus,
  toFrontendStatus,
  convertDeviceStatus,
  validateStatusTransition,
  getAllowedOperations,

  // 辅助函数
  getStatusLabel,
  getStatusType,
  getStatusColor,
  getStatusOptions,
};
