/**
 * 入库单状态常量 - 优化版
 * 增加执行确认环节，提高操作安全性
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 2.0
 */

/**
 * 入库单状态枚举
 * 优化后的状态流转：草稿 → 待审核 → 已审核 → 执行中 → 已完成
 */
export const InboundStatus = {
  DRAFT: 0, // 草稿 - 可编辑、删除、提交
  PENDING_AUDIT: 1, // 待审核 - 等待审批
  AUDITED: 2, // 已审核 - 审核通过，待执行
  EXECUTING: 3, // 执行中 - 正在执行入库
  COMPLETED: 4, // 已完成 - 入库完成
  FAILED: 5, // 执行失败 - 入库执行失败
  REJECTED: 6, // 已驳回 - 审核未通过
  CANCELLED: 7, // 已取消 - 已取消
};

/**
 * 入库单状态文本映射
 */
export const InboundStatusMap = {
  [InboundStatus.DRAFT]: '草稿',
  [InboundStatus.PENDING_AUDIT]: '待审核',
  [InboundStatus.AUDITED]: '已审核',
  [InboundStatus.EXECUTING]: '执行中',
  [InboundStatus.COMPLETED]: '已完成',
  [InboundStatus.FAILED]: '执行失败',
  [InboundStatus.REJECTED]: '已驳回',
  [InboundStatus.CANCELLED]: '已取消',
};

/**
 * 入库单状态标签类型映射（Element Plus）
 */
export const InboundStatusTypeMap = {
  [InboundStatus.DRAFT]: 'info',
  [InboundStatus.PENDING_AUDIT]: 'warning',
  [InboundStatus.AUDITED]: 'success',
  [InboundStatus.EXECUTING]: 'primary',
  [InboundStatus.COMPLETED]: 'success',
  [InboundStatus.FAILED]: 'danger',
  [InboundStatus.REJECTED]: 'danger',
  [InboundStatus.CANCELLED]: 'info',
};

/**
 * 各状态允许的操作
 */
export const InboundStatusOperations = {
  [InboundStatus.DRAFT]: ['edit', 'delete', 'submit'],
  [InboundStatus.PENDING_AUDIT]: ['audit', 'cancel'],
  [InboundStatus.AUDITED]: ['execute', 'cancel'],
  [InboundStatus.EXECUTING]: [],
  [InboundStatus.COMPLETED]: ['view'],
  [InboundStatus.FAILED]: ['retry', 'cancel'],
  [InboundStatus.REJECTED]: ['edit', 'delete', 'resubmit'],
  [InboundStatus.CANCELLED]: ['view'],
};

/**
 * 操作按钮配置
 */
export const InboundOperationButtons = {
  edit: { label: '编辑', type: 'primary', icon: 'Edit' },
  delete: { label: '删除', type: 'danger', icon: 'Delete' },
  submit: { label: '提交审核', type: 'success', icon: 'TopRight' },
  audit: { label: '审核', type: 'success', icon: 'Check' },
  execute: { label: '执行入库', type: 'warning', icon: 'CircleCheck' },
  cancel: { label: '取消', type: 'info', icon: 'Close' },
  retry: { label: '重试', type: 'warning', icon: 'Refresh' },
  resubmit: { label: '重新提交', type: 'success', icon: 'TopRight' },
  view: { label: '查看', type: 'primary', icon: 'View' },
};

/**
 * 获取状态文本
 * @param {number} status - 状态码
 * @returns {string} 状态文本
 */
export function getInboundStatusText(status) {
  return InboundStatusMap[status] || '未知状态';
}

/**
 * 获取状态标签类型
 * @param {number} status - 状态码
 * @returns {string} 标签类型
 */
export function getInboundStatusType(status) {
  return InboundStatusTypeMap[status] || 'info';
}

/**
 * 获取状态允许的操作列表
 * @param {number} status - 状态码
 * @returns {string[]} 操作列表
 */
export function getInboundStatusOperations(status) {
  return InboundStatusOperations[status] || [];
}

/**
 * 检查指定操作是否允许
 * @param {number} status - 当前状态
 * @param {string} operation - 操作名称
 * @returns {boolean} 是否允许
 */
export function isOperationAllowed(status, operation) {
  const allowedOperations = getInboundStatusOperations(status);
  return allowedOperations.includes(operation);
}

/**
 * 状态流转规则
 * 定义从当前状态可以流转到哪些目标状态
 */
export const InboundStatusTransitions = {
  [InboundStatus.DRAFT]: {
    submit: { target: InboundStatus.PENDING_AUDIT, confirm: true, message: '确定要提交审核吗？' },
    delete: { target: null, confirm: true, message: '确定要删除该入库单吗？' },
  },
  [InboundStatus.PENDING_AUDIT]: {
    audit: { target: InboundStatus.AUDITED, confirm: true, message: '确定要通过审核吗？' },
    reject: { target: InboundStatus.REJECTED, confirm: true, message: '确定要驳回该入库单吗？' },
    cancel: { target: InboundStatus.CANCELLED, confirm: true, message: '确定要取消该入库单吗？' },
  },
  [InboundStatus.AUDITED]: {
    execute: { target: InboundStatus.EXECUTING, confirm: true, message: '确定要执行入库吗？执行后设备将正式入库。' },
    cancel: { target: InboundStatus.CANCELLED, confirm: true, message: '确定要取消该入库单吗？' },
  },
  [InboundStatus.EXECUTING]: {
    complete: { target: InboundStatus.COMPLETED },
    fail: { target: InboundStatus.FAILED },
  },
  [InboundStatus.FAILED]: {
    retry: { target: InboundStatus.EXECUTING, confirm: true, message: '确定要重新执行入库吗？' },
    cancel: { target: InboundStatus.CANCELLED, confirm: true, message: '确定要取消该入库单吗？' },
  },
  [InboundStatus.REJECTED]: {
    resubmit: { target: InboundStatus.PENDING_AUDIT, confirm: true, message: '确定要重新提交审核吗？' },
    delete: { target: null, confirm: true, message: '确定要删除该入库单吗？' },
  },
};

/**
 * 获取状态流转目标
 * @param {number} currentStatus - 当前状态
 * @param {string} action - 操作动作
 * @returns {Object|null} 流转规则
 */
export function getStatusTransition(currentStatus, action) {
  const transitions = InboundStatusTransitions[currentStatus];
  return transitions ? transitions[action] : null;
}

/**
 * 批量操作配置
 */
export const BatchOperations = {
  submit: {
    label: '批量提交',
    icon: 'TopRight',
    allowedStatus: [InboundStatus.DRAFT],
    confirmMessage: '确定要批量提交选中的 {count} 个入库单吗？',
  },
  audit: {
    label: '批量审核',
    icon: 'Check',
    allowedStatus: [InboundStatus.PENDING_AUDIT],
    confirmMessage: '确定要批量审核选中的 {count} 个入库单吗？',
  },
  execute: {
    label: '批量执行',
    icon: 'CircleCheck',
    allowedStatus: [InboundStatus.AUDITED],
    confirmMessage: '确定要批量执行选中的 {count} 个入库单吗？',
  },
  delete: {
    label: '批量删除',
    icon: 'Delete',
    allowedStatus: [InboundStatus.DRAFT, InboundStatus.REJECTED],
    confirmMessage: '确定要批量删除选中的 {count} 个入库单吗？此操作不可恢复！',
    danger: true,
  },
};

/**
 * 入库单状态配置
 */
export const InboundStatusConfig = {
  [InboundStatus.DRAFT]: {
    name: '草稿',
    description: '可编辑、删除、提交',
    color: '#909399',
  },
  [InboundStatus.PENDING_AUDIT]: {
    name: '待审核',
    description: '等待审批',
    color: '#E6A23C',
  },
  [InboundStatus.AUDITED]: {
    name: '已审核',
    description: '审核通过，待执行',
    color: '#67C23A',
  },
  [InboundStatus.EXECUTING]: {
    name: '执行中',
    description: '正在执行入库',
    color: '#409EFF',
  },
  [InboundStatus.COMPLETED]: {
    name: '已完成',
    description: '入库完成',
    color: '#67C23A',
  },
  [InboundStatus.FAILED]: {
    name: '执行失败',
    description: '入库执行失败',
    color: '#F56C6C',
  },
  [InboundStatus.REJECTED]: {
    name: '已驳回',
    description: '审核未通过',
    color: '#F56C6C',
  },
  [InboundStatus.CANCELLED]: {
    name: '已取消',
    description: '已取消',
    color: '#909399',
  },
};

/**
 * 入库流程步骤
 */
export const InboundFlowSteps = [
  { title: '创建入库单', description: '填写入库信息' },
  { title: '提交审核', description: '提交入库单审核' },
  { title: '审核通过', description: '等待执行入库' },
  { title: '执行入库', description: '确认入库操作' },
  { title: '入库完成', description: '入库流程结束' },
];

/**
 * 检查操作是否允许
 * @param {number} status - 当前状态
 * @param {string} operation - 操作名称
 * @returns {boolean} 是否允许
 */
export function checkOperationAllowed(status, operation) {
  return isOperationAllowed(status, operation);
}

/**
 * 获取可用流转
 * @param {number} currentStatus - 当前状态
 * @returns {Array} 可用流转列表
 */
export function getAvailableTransitions(currentStatus) {
  const transitions = InboundStatusTransitions[currentStatus];
  if (!transitions) {
    return [];
  }

  return Object.entries(transitions).map(([action, config]) => ({
    action,
    ...config,
  }));
}

export default {
  InboundStatus,
  InboundStatusMap,
  InboundStatusTypeMap,
  InboundStatusOperations,
  InboundOperationButtons,
  InboundStatusConfig,
  InboundStatusTransitions,
  InboundFlowSteps,
  getInboundStatusText,
  getInboundStatusType,
  getInboundStatusOperations,
  isOperationAllowed,
  checkOperationAllowed,
  getStatusTransition,
  getAvailableTransitions,
  BatchOperations,
};
