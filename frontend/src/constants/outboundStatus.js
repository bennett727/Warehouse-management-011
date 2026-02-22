/**
 * @file: outboundStatus.js
 * @description: 出库状态常量定义 - 简化版（4步流程）
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 2.0
 * @modifyRecords:
 *     2026-02-13: 简化流程，将6步合并为4步
 *       - 原流程：草稿(0) → 待审核(1) → 审核中(2) → 已审核(3) → 执行中(4) → 已完成(5)
 *       - 新流程：草稿(0) → 待审核(1) → 已审核(2) → 已完成(3)
 *       - 合并"审核中"到"待审核"
 *       - 合并"执行中"到"已审核"（执行确认）
 */

/**
 * 出库单状态枚举 - 简化版
 * 优化目标：减少状态节点，提高操作效率
 */
export const OutboundStatus = {
  /** 草稿 - 可编辑、删除、提交 */
  DRAFT: 0,
  /** 待审核 - 可审核通过/驳回、取消 */
  PENDING_AUDIT: 1,
  /** 已审核 - 可执行出库、取消 */
  AUDITED: 2,
  /** 已完成 - 终态，可查看、打印 */
  COMPLETED: 3,
  /** 已取消 - 终态，可重新激活 */
  CANCELLED: -1,
  /** 已驳回 - 可编辑后重新提交 */
  REJECTED: -2,
};

/**
 * 出库单状态显示配置
 */
export const OutboundStatusConfig = {
  [OutboundStatus.DRAFT]: {
    label: '草稿',
    type: 'info',
    color: '#909399',
    description: '草稿状态，可编辑、删除或提交审核',
    icon: 'Document',
  },
  [OutboundStatus.PENDING_AUDIT]: {
    label: '待审核',
    type: 'warning',
    color: '#E6A23C',
    description: '等待审核，审核人可进行审核操作',
    icon: 'Timer',
  },
  [OutboundStatus.AUDITED]: {
    label: '已审核',
    type: 'success',
    color: '#67C23A',
    description: '审核通过，等待执行出库',
    icon: 'CircleCheck',
  },
  [OutboundStatus.COMPLETED]: {
    label: '已完成',
    type: 'primary',
    color: '#409EFF',
    description: '出库已完成',
    icon: 'Check',
  },
  [OutboundStatus.CANCELLED]: {
    label: '已取消',
    type: 'info',
    color: '#909399',
    description: '已取消，可重新激活',
    icon: 'Close',
  },
  [OutboundStatus.REJECTED]: {
    label: '已驳回',
    type: 'danger',
    color: '#F56C6C',
    description: '审核未通过，可编辑后重新提交',
    icon: 'CircleClose',
  },
};

/**
 * 获取状态显示文本
 * @param {number} status - 状态码
 * @returns {string} 状态文本
 */
export const getOutboundStatusText = (status) => {
  return OutboundStatusConfig[status]?.label || '未知';
};

/**
 * 获取状态标签类型
 * @param {number} status - 状态码
 * @returns {string} Element Plus标签类型
 */
export const getOutboundStatusType = (status) => {
  return OutboundStatusConfig[status]?.type || 'info';
};

/**
 * 获取状态颜色
 * @param {number} status - 状态码
 * @returns {string} 颜色值
 */
export const getOutboundStatusColor = (status) => {
  return OutboundStatusConfig[status]?.color || '#909399';
};

/**
 * 获取状态图标
 * @param {number} status - 状态码
 * @returns {string} 图标名称
 */
export const getOutboundStatusIcon = (status) => {
  return OutboundStatusConfig[status]?.icon || 'InfoFilled';
};

/**
 * 获取状态描述
 * @param {number} status - 状态码
 * @returns {string} 状态描述
 */
export const getOutboundStatusDescription = (status) => {
  return OutboundStatusConfig[status]?.description || '';
};

/**
 * 操作类型枚举
 */
export const OutboundOperation = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  SUBMIT: 'submit',
  AUDIT: 'audit',
  EXECUTE: 'execute',
  COMPLETE: 'complete',
  CANCEL: 'cancel',
  REJECT: 'reject',
  REACTIVATE: 'reactivate',
  RESUBMIT: 'resubmit',
  PRINT: 'print',
  EXPORT: 'export',
};

/**
 * 操作权限矩阵 - 定义每个状态下允许的操作
 * 简化后的权限控制更加清晰
 */
export const OutboundOperationMatrix = {
  [OutboundStatus.DRAFT]: [
    OutboundOperation.VIEW,
    OutboundOperation.EDIT,
    OutboundOperation.DELETE,
    OutboundOperation.SUBMIT,
  ],
  [OutboundStatus.PENDING_AUDIT]: [OutboundOperation.VIEW, OutboundOperation.AUDIT, OutboundOperation.CANCEL],
  [OutboundStatus.AUDITED]: [OutboundOperation.VIEW, OutboundOperation.EXECUTE, OutboundOperation.CANCEL],
  [OutboundStatus.COMPLETED]: [OutboundOperation.VIEW, OutboundOperation.PRINT, OutboundOperation.EXPORT],
  [OutboundStatus.CANCELLED]: [OutboundOperation.VIEW, OutboundOperation.REACTIVATE],
  [OutboundStatus.REJECTED]: [
    OutboundOperation.VIEW,
    OutboundOperation.EDIT,
    OutboundOperation.RESUBMIT,
    OutboundOperation.DELETE,
  ],
};

/**
 * 检查操作是否允许
 * @param {number} status - 当前状态
 * @param {string} operation - 操作类型
 * @returns {boolean} 是否允许
 */
export const checkOutboundOperationAllowed = (status, operation) => {
  const allowedOperations = OutboundOperationMatrix[status] || [];
  return allowedOperations.includes(operation);
};

/**
 * 状态流转规则 - 定义允许的状态转换
 * 简化后的流转路径更加清晰
 */
export const OutboundStatusTransitions = {
  [OutboundStatus.DRAFT]: [
    { to: OutboundStatus.PENDING_AUDIT, action: '提交审核', operation: OutboundOperation.SUBMIT },
    { to: OutboundStatus.CANCELLED, action: '取消', operation: OutboundOperation.CANCEL },
  ],
  [OutboundStatus.PENDING_AUDIT]: [
    { to: OutboundStatus.AUDITED, action: '审核通过', operation: OutboundOperation.AUDIT },
    { to: OutboundStatus.REJECTED, action: '驳回', operation: OutboundOperation.REJECT },
    { to: OutboundStatus.CANCELLED, action: '取消', operation: OutboundOperation.CANCEL },
  ],
  [OutboundStatus.AUDITED]: [
    { to: OutboundStatus.COMPLETED, action: '执行出库', operation: OutboundOperation.EXECUTE },
    { to: OutboundStatus.CANCELLED, action: '取消', operation: OutboundOperation.CANCEL },
  ],
  [OutboundStatus.COMPLETED]: [],
  [OutboundStatus.CANCELLED]: [
    { to: OutboundStatus.DRAFT, action: '重新激活', operation: OutboundOperation.REACTIVATE },
  ],
  [OutboundStatus.REJECTED]: [
    { to: OutboundStatus.PENDING_AUDIT, action: '重新提交', operation: OutboundOperation.RESUBMIT },
    { to: OutboundStatus.DRAFT, action: '编辑', operation: OutboundOperation.EDIT },
    { to: OutboundStatus.CANCELLED, action: '删除', operation: OutboundOperation.DELETE },
  ],
};

/**
 * 获取可用的状态流转选项
 * @param {number} currentStatus - 当前状态
 * @returns {Array} 可用的流转选项
 */
export const getAvailableTransitions = (currentStatus) => {
  return OutboundStatusTransitions[currentStatus] || [];
};

/**
 * 流程步骤配置 - 用于流程可视化
 * 简化后的4步流程
 */
export const OutboundFlowSteps = [
  {
    key: 'draft',
    title: '创建出库单',
    description: '填写出库信息，选择出库设备',
    status: OutboundStatus.DRAFT,
    icon: 'Edit',
  },
  {
    key: 'pending_audit',
    title: '提交审核',
    description: '提交出库申请，等待审核',
    status: OutboundStatus.PENDING_AUDIT,
    icon: 'Upload',
  },
  {
    key: 'audited',
    title: '审核通过',
    description: '审核通过，准备执行出库',
    status: OutboundStatus.AUDITED,
    icon: 'CircleCheck',
  },
  {
    key: 'completed',
    title: '执行出库',
    description: '完成出库操作，更新库存',
    status: OutboundStatus.COMPLETED,
    icon: 'Check',
  },
];

/**
 * 获取当前流程步骤索引
 * @param {number} status - 当前状态
 * @returns {number} 步骤索引（从0开始）
 */
export const getCurrentFlowStepIndex = (status) => {
  const stepMap = {
    [OutboundStatus.DRAFT]: 0,
    [OutboundStatus.PENDING_AUDIT]: 1,
    [OutboundStatus.AUDITED]: 2,
    [OutboundStatus.COMPLETED]: 3,
    [OutboundStatus.CANCELLED]: -1,
    [OutboundStatus.REJECTED]: -1,
  };
  return stepMap[status] ?? -1;
};

/**
 * 出库类型枚举（适配小公司场景）
 *
 * 类型说明：
 * - INSTALLATION(1): 安装出库 - 设备出库并安装到客户现场
 * - REPAIR(2): 维修出库 - 设备出库进行维修
 * - MAINTENANCE(3): 保养出库 - 设备出库进行保养维护
 * - SCRAP(4): 报废出库 - 报废设备出库处理
 * - TRANSFER(5): 调拨出库 - 设备在仓库间调拨
 * - OTHER(6): 其他出库 - 其他类型出库
 */
export const OutboundType = {
  INSTALLATION: 1,
  REPAIR: 2,
  MAINTENANCE: 3,
  SCRAP: 4,
  TRANSFER: 5,
  OTHER: 6,
};

/**
 * 出库类型配置
 */
export const OutboundTypeConfig = {
  [OutboundType.INSTALLATION]: {
    label: '安装出库',
    type: 'success',
    description: '设备出库并安装到指定位置',
    icon: 'SetUp',
    color: '#67c23a',
  },
  [OutboundType.REPAIR]: {
    label: '维修出库',
    type: 'warning',
    description: '设备出库进行维修',
    icon: 'Tools',
    color: '#e6a23c',
  },
  [OutboundType.MAINTENANCE]: {
    label: '保养出库',
    type: 'primary',
    description: '设备出库进行保养维护',
    icon: 'Timer',
    color: '#409eff',
  },
  [OutboundType.SCRAP]: {
    label: '报废出库',
    type: 'danger',
    description: '报废设备出库',
    icon: 'Delete',
    color: '#f56c6c',
  },
  [OutboundType.TRANSFER]: {
    label: '调拨出库',
    type: 'info',
    description: '设备调拨出库',
    icon: 'Switch',
    color: '#909399',
  },
  [OutboundType.OTHER]: {
    label: '其他出库',
    type: '',
    description: '其他类型出库',
    icon: 'More',
    color: '#909399',
  },
};

/**
 * 获取出库类型文本
 * @param {number} type - 出库类型
 * @returns {string} 类型文本
 */
export const getOutboundTypeText = (type) => {
  return OutboundTypeConfig[type]?.label || '普通出库';
};

/**
 * 获取出库类型标签类型
 * @param {number} type - 出库类型
 * @returns {string} 标签类型
 */
export const getOutboundTypeType = (type) => {
  return OutboundTypeConfig[type]?.type || '';
};

/**
 * 批量操作配置
 */
export const BatchOperations = {
  SUBMIT: {
    key: 'submit',
    label: '批量提交',
    icon: 'Upload',
    type: 'primary',
    allowedStatus: [OutboundStatus.DRAFT],
    confirmMessage: '确定要批量提交选中的出库单吗？',
    successMessage: '批量提交成功',
  },
  AUDIT: {
    key: 'audit',
    label: '批量审核',
    icon: 'CircleCheck',
    type: 'success',
    allowedStatus: [OutboundStatus.PENDING_AUDIT],
    confirmMessage: '确定要批量审核通过选中的出库单吗？',
    successMessage: '批量审核成功',
  },
  EXECUTE: {
    key: 'execute',
    label: '批量执行',
    icon: 'Check',
    type: 'warning',
    allowedStatus: [OutboundStatus.AUDITED],
    confirmMessage: '确定要批量执行选中的出库单吗？',
    successMessage: '批量执行成功',
  },
  DELETE: {
    key: 'delete',
    label: '批量删除',
    icon: 'Delete',
    type: 'danger',
    allowedStatus: [OutboundStatus.DRAFT, OutboundStatus.REJECTED],
    confirmMessage: '确定要批量删除选中的出库单吗？此操作不可恢复！',
    successMessage: '批量删除成功',
  },
  CANCEL: {
    key: 'cancel',
    label: '批量取消',
    icon: 'Close',
    type: 'info',
    allowedStatus: [OutboundStatus.PENDING_AUDIT, OutboundStatus.AUDITED],
    confirmMessage: '确定要批量取消选中的出库单吗？',
    successMessage: '批量取消成功',
  },
};

/**
 * 获取可用的批量操作
 * @param {Array} selectedRows - 选中的行数据
 * @returns {Array} 可用的批量操作列表
 */
export const getAvailableBatchOperations = (selectedRows) => {
  if (!selectedRows || selectedRows.length === 0) {
    return [];
  }

  const statuses = selectedRows.map((row) => row.status);
  const uniqueStatuses = [...new Set(statuses)];

  // 如果选中项包含多种状态，只允许删除操作（针对草稿和已驳回）
  if (uniqueStatuses.length > 1) {
    const allDeletable = uniqueStatuses.every(
      (status) => status === OutboundStatus.DRAFT || status === OutboundStatus.REJECTED
    );
    return allDeletable ? [BatchOperations.DELETE] : [];
  }

  const status = uniqueStatuses[0];
  return Object.values(BatchOperations).filter((op) => op.allowedStatus.includes(status));
};

export default {
  OutboundStatus,
  OutboundStatusConfig,
  OutboundOperation,
  OutboundOperationMatrix,
  OutboundStatusTransitions,
  OutboundFlowSteps,
  OutboundType,
  OutboundTypeConfig,
  BatchOperations,
  getOutboundStatusText,
  getOutboundStatusType,
  getOutboundStatusColor,
  getOutboundStatusIcon,
  getOutboundStatusDescription,
  checkOutboundOperationAllowed,
  getAvailableTransitions,
  getCurrentFlowStepIndex,
  getOutboundTypeText,
  getOutboundTypeType,
  getAvailableBatchOperations,
};
