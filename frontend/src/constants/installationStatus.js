/**
 * @file: installationStatus.js
 * @description: 安装和维修状态常量定义
 * @author: AI架构专家
 * @createTime: 2026-02-13
 * @version: 2.0
 */

// ============================================
// 安装状态定义
// ============================================

export const InstallationStatus = {
  DRAFT: 0,
  PENDING_AUDIT: 1,
  AUDITED: 2,
  PENDING: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
  FAILED: 6,
  REJECTED: 7,
  CANCELLED: 8,
};

export const InstallationStatusMap = {
  [InstallationStatus.DRAFT]: '草稿',
  [InstallationStatus.PENDING_AUDIT]: '待审核',
  [InstallationStatus.AUDITED]: '已审核',
  [InstallationStatus.PENDING]: '待安装',
  [InstallationStatus.IN_PROGRESS]: '安装中',
  [InstallationStatus.COMPLETED]: '已完成',
  [InstallationStatus.FAILED]: '安装失败',
  [InstallationStatus.REJECTED]: '已驳回',
  [InstallationStatus.CANCELLED]: '已取消',
};

export const InstallationStatusTypeMap = {
  [InstallationStatus.DRAFT]: 'info',
  [InstallationStatus.PENDING_AUDIT]: 'warning',
  [InstallationStatus.AUDITED]: 'success',
  [InstallationStatus.PENDING]: 'warning',
  [InstallationStatus.IN_PROGRESS]: 'primary',
  [InstallationStatus.COMPLETED]: 'success',
  [InstallationStatus.FAILED]: 'danger',
  [InstallationStatus.REJECTED]: 'danger',
  [InstallationStatus.CANCELLED]: 'info',
};

export const InstallationStatusColor = {
  [InstallationStatus.DRAFT]: '#909399',
  [InstallationStatus.PENDING_AUDIT]: '#E6A23C',
  [InstallationStatus.AUDITED]: '#67C23A',
  [InstallationStatus.PENDING]: '#E6A23C',
  [InstallationStatus.IN_PROGRESS]: '#409EFF',
  [InstallationStatus.COMPLETED]: '#67C23A',
  [InstallationStatus.FAILED]: '#F56C6C',
  [InstallationStatus.REJECTED]: '#F56C6C',
  [InstallationStatus.CANCELLED]: '#909399',
};

export const InstallationStatusOperations = {
  [InstallationStatus.DRAFT]: ['edit', 'delete', 'submit'],
  [InstallationStatus.PENDING_AUDIT]: ['audit', 'reject', 'cancel'],
  [InstallationStatus.AUDITED]: ['start', 'cancel'],
  [InstallationStatus.PENDING]: ['start', 'cancel'],
  [InstallationStatus.IN_PROGRESS]: ['complete', 'fail'],
  [InstallationStatus.COMPLETED]: ['view'],
  [InstallationStatus.FAILED]: ['retry', 'cancel'],
  [InstallationStatus.REJECTED]: ['edit', 'delete', 'resubmit'],
  [InstallationStatus.CANCELLED]: ['view', 'reactivate'],
};

// ============================================
// 维修状态定义
// ============================================

export const MaintenanceStatus = {
  DRAFT: 0,
  PENDING_AUDIT: 1,
  AUDITED: 2,
  PENDING: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
  FAILED: 6,
  REJECTED: 7,
  CANCELLED: 8,
};

export const MaintenanceStatusMap = {
  [MaintenanceStatus.DRAFT]: '草稿',
  [MaintenanceStatus.PENDING_AUDIT]: '待审核',
  [MaintenanceStatus.AUDITED]: '已审核',
  [MaintenanceStatus.PENDING]: '待处理',
  [MaintenanceStatus.IN_PROGRESS]: '处理中',
  [MaintenanceStatus.COMPLETED]: '已完成',
  [MaintenanceStatus.FAILED]: '维修失败',
  [MaintenanceStatus.REJECTED]: '已驳回',
  [MaintenanceStatus.CANCELLED]: '已取消',
};

export const MaintenanceStatusTypeMap = {
  [MaintenanceStatus.DRAFT]: 'info',
  [MaintenanceStatus.PENDING_AUDIT]: 'warning',
  [MaintenanceStatus.AUDITED]: 'success',
  [MaintenanceStatus.PENDING]: 'warning',
  [MaintenanceStatus.IN_PROGRESS]: 'primary',
  [MaintenanceStatus.COMPLETED]: 'success',
  [MaintenanceStatus.FAILED]: 'danger',
  [MaintenanceStatus.REJECTED]: 'danger',
  [MaintenanceStatus.CANCELLED]: 'info',
};

export const MaintenanceStatusColor = {
  [MaintenanceStatus.DRAFT]: '#909399',
  [MaintenanceStatus.PENDING_AUDIT]: '#E6A23C',
  [MaintenanceStatus.AUDITED]: '#67C23A',
  [MaintenanceStatus.PENDING]: '#E6A23C',
  [MaintenanceStatus.IN_PROGRESS]: '#409EFF',
  [MaintenanceStatus.COMPLETED]: '#67C23A',
  [MaintenanceStatus.FAILED]: '#F56C6C',
  [MaintenanceStatus.REJECTED]: '#F56C6C',
  [MaintenanceStatus.CANCELLED]: '#909399',
};

export const MaintenanceStatusOperations = {
  [MaintenanceStatus.DRAFT]: ['edit', 'delete', 'submit'],
  [MaintenanceStatus.PENDING_AUDIT]: ['audit', 'reject', 'cancel'],
  [MaintenanceStatus.AUDITED]: ['start', 'cancel'],
  [MaintenanceStatus.PENDING]: ['start', 'cancel'],
  [MaintenanceStatus.IN_PROGRESS]: ['complete', 'fail'],
  [MaintenanceStatus.COMPLETED]: ['view'],
  [MaintenanceStatus.FAILED]: ['retry', 'cancel'],
  [MaintenanceStatus.REJECTED]: ['edit', 'delete', 'resubmit'],
  [MaintenanceStatus.CANCELLED]: ['view', 'reactivate'],
};

// ============================================
// 状态流转规则
// ============================================

export const InstallationStatusTransitions = {
  [InstallationStatus.DRAFT]: {
    submit: { target: InstallationStatus.PENDING_AUDIT, confirm: true, message: '确定要提交审核吗？' },
    delete: { target: null, confirm: true, message: '确定要删除该安装单吗？' },
  },
  [InstallationStatus.PENDING_AUDIT]: {
    audit: { target: InstallationStatus.AUDITED, confirm: true, message: '确定要通过审核吗？' },
    reject: { target: InstallationStatus.REJECTED, confirm: true, message: '确定要驳回该安装单吗？' },
    cancel: { target: InstallationStatus.CANCELLED, confirm: true, message: '确定要取消该安装单吗？' },
  },
  [InstallationStatus.AUDITED]: {
    start: { target: InstallationStatus.IN_PROGRESS, confirm: true, message: '确定要开始安装吗？' },
    cancel: { target: InstallationStatus.CANCELLED, confirm: true, message: '确定要取消该安装单吗？' },
  },
  [InstallationStatus.IN_PROGRESS]: {
    complete: { target: InstallationStatus.COMPLETED, confirm: true, message: '确定要完成安装吗？' },
    fail: { target: InstallationStatus.FAILED, confirm: true, message: '确定要标记安装失败吗？' },
  },
  [InstallationStatus.FAILED]: {
    retry: { target: InstallationStatus.IN_PROGRESS, confirm: true, message: '确定要重新安装吗？' },
    cancel: { target: InstallationStatus.CANCELLED, confirm: true, message: '确定要取消该安装单吗？' },
  },
  [InstallationStatus.REJECTED]: {
    resubmit: { target: InstallationStatus.PENDING_AUDIT, confirm: true, message: '确定要重新提交审核吗？' },
    delete: { target: null, confirm: true, message: '确定要删除该安装单吗？' },
  },
  [InstallationStatus.CANCELLED]: {
    reactivate: { target: InstallationStatus.DRAFT, confirm: true, message: '确定要重新激活该安装单吗？' },
  },
};

export const MaintenanceStatusTransitions = {
  [MaintenanceStatus.DRAFT]: {
    submit: { target: MaintenanceStatus.PENDING_AUDIT, confirm: true, message: '确定要提交审核吗？' },
    delete: { target: null, confirm: true, message: '确定要删除该维修单吗？' },
  },
  [MaintenanceStatus.PENDING_AUDIT]: {
    audit: { target: MaintenanceStatus.AUDITED, confirm: true, message: '确定要通过审核吗？' },
    reject: { target: MaintenanceStatus.REJECTED, confirm: true, message: '确定要驳回该维修单吗？' },
    cancel: { target: MaintenanceStatus.CANCELLED, confirm: true, message: '确定要取消该维修单吗？' },
  },
  [MaintenanceStatus.AUDITED]: {
    start: { target: MaintenanceStatus.IN_PROGRESS, confirm: true, message: '确定要开始维修吗？' },
    cancel: { target: MaintenanceStatus.CANCELLED, confirm: true, message: '确定要取消该维修单吗？' },
  },
  [MaintenanceStatus.IN_PROGRESS]: {
    complete: { target: MaintenanceStatus.COMPLETED, confirm: true, message: '确定要完成维修吗？' },
    fail: { target: MaintenanceStatus.FAILED, confirm: true, message: '确定要标记维修失败吗？' },
  },
  [MaintenanceStatus.FAILED]: {
    retry: { target: MaintenanceStatus.IN_PROGRESS, confirm: true, message: '确定要重新维修吗？' },
    cancel: { target: MaintenanceStatus.CANCELLED, confirm: true, message: '确定要取消该维修单吗？' },
  },
  [MaintenanceStatus.REJECTED]: {
    resubmit: { target: MaintenanceStatus.PENDING_AUDIT, confirm: true, message: '确定要重新提交审核吗？' },
    delete: { target: null, confirm: true, message: '确定要删除该维修单吗？' },
  },
  [MaintenanceStatus.CANCELLED]: {
    reactivate: { target: MaintenanceStatus.DRAFT, confirm: true, message: '确定要重新激活该维修单吗？' },
  },
};

// ============================================
// 流程步骤配置
// ============================================

export const InstallationFlowSteps = [
  { title: '创建安装单', description: '填写安装信息', status: InstallationStatus.DRAFT, icon: 'Edit' },
  { title: '提交审核', description: '提交安装申请', status: InstallationStatus.PENDING_AUDIT, icon: 'Upload' },
  { title: '审核通过', description: '等待安装', status: InstallationStatus.AUDITED, icon: 'CircleCheck' },
  { title: '开始安装', description: '执行安装操作', status: InstallationStatus.IN_PROGRESS, icon: 'VideoPlay' },
  { title: '安装完成', description: '安装流程结束', status: InstallationStatus.COMPLETED, icon: 'Check' },
];

export const MaintenanceFlowSteps = [
  { title: '创建维修单', description: '填写维修信息', status: MaintenanceStatus.DRAFT, icon: 'Edit' },
  { title: '提交审核', description: '提交维修申请', status: MaintenanceStatus.PENDING_AUDIT, icon: 'Upload' },
  { title: '审核通过', description: '等待维修', status: MaintenanceStatus.AUDITED, icon: 'CircleCheck' },
  { title: '开始维修', description: '执行维修操作', status: MaintenanceStatus.IN_PROGRESS, icon: 'VideoPlay' },
  { title: '维修完成', description: '维修流程结束', status: MaintenanceStatus.COMPLETED, icon: 'Check' },
];

// ============================================
// 工具函数
// ============================================

export function getInstallationStatusText(status) {
  return InstallationStatusMap[status] || '未知状态';
}

export function getInstallationStatusType(status) {
  return InstallationStatusTypeMap[status] || 'info';
}

export function getInstallationStatusColorValue(status) {
  return InstallationStatusColor[status] || '#909399';
}

export function isInstallationOperationAllowed(status, operation) {
  const allowedOperations = InstallationStatusOperations[status] || [];
  return allowedOperations.includes(operation);
}

export function getInstallationStatusTransition(currentStatus, action) {
  const transitions = InstallationStatusTransitions[currentStatus];
  return transitions ? transitions[action] : null;
}

export function getMaintenanceStatusText(status) {
  return MaintenanceStatusMap[status] || '未知状态';
}

export function getMaintenanceStatusType(status) {
  return MaintenanceStatusTypeMap[status] || 'info';
}

export function getMaintenanceStatusColorValue(status) {
  return MaintenanceStatusColor[status] || '#909399';
}

export function isMaintenanceOperationAllowed(status, operation) {
  const allowedOperations = MaintenanceStatusOperations[status] || [];
  return allowedOperations.includes(operation);
}

export function getMaintenanceStatusTransition(currentStatus, action) {
  const transitions = MaintenanceStatusTransitions[currentStatus];
  return transitions ? transitions[action] : null;
}

// ============================================
// 批量操作配置
// ============================================

export const InstallationBatchOperations = {
  submit: {
    label: '批量提交',
    icon: 'TopRight',
    allowedStatus: [InstallationStatus.DRAFT],
    confirmMessage: '确定要批量提交选中的 {count} 个安装单吗？',
  },
  audit: {
    label: '批量审核',
    icon: 'Check',
    allowedStatus: [InstallationStatus.PENDING_AUDIT],
    confirmMessage: '确定要批量审核选中的 {count} 个安装单吗？',
  },
  start: {
    label: '批量开始',
    icon: 'VideoPlay',
    allowedStatus: [InstallationStatus.AUDITED],
    confirmMessage: '确定要批量开始选中的 {count} 个安装单吗？',
  },
  delete: {
    label: '批量删除',
    icon: 'Delete',
    allowedStatus: [InstallationStatus.DRAFT, InstallationStatus.REJECTED],
    confirmMessage: '确定要批量删除选中的 {count} 个安装单吗？此操作不可恢复！',
    danger: true,
  },
};

export const MaintenanceBatchOperations = {
  submit: {
    label: '批量提交',
    icon: 'TopRight',
    allowedStatus: [MaintenanceStatus.DRAFT],
    confirmMessage: '确定要批量提交选中的 {count} 个维修单吗？',
  },
  audit: {
    label: '批量审核',
    icon: 'Check',
    allowedStatus: [MaintenanceStatus.PENDING_AUDIT],
    confirmMessage: '确定要批量审核选中的 {count} 个维修单吗？',
  },
  start: {
    label: '批量开始',
    icon: 'VideoPlay',
    allowedStatus: [MaintenanceStatus.AUDITED],
    confirmMessage: '确定要批量开始选中的 {count} 个维修单吗？',
  },
  delete: {
    label: '批量删除',
    icon: 'Delete',
    allowedStatus: [MaintenanceStatus.DRAFT, MaintenanceStatus.REJECTED],
    confirmMessage: '确定要批量删除选中的 {count} 个维修单吗？此操作不可恢复！',
    danger: true,
  },
};

// 兼容旧版本的导出（Enhanced后缀）
export const InstallationStatusEnhanced = InstallationStatus;
export const InstallationStatusMapEnhanced = InstallationStatusMap;
export const InstallationStatusTypeMapEnhanced = InstallationStatusTypeMap;
export const InstallationStatusColorEnhanced = InstallationStatusColor;
export const InstallationStatusOperationsEnhanced = InstallationStatusOperations;
export const InstallationStatusTransitionsEnhanced = InstallationStatusTransitions;
export const InstallationFlowStepsEnhanced = InstallationFlowSteps;
export const MaintenanceStatusEnhanced = MaintenanceStatus;
export const MaintenanceStatusMapEnhanced = MaintenanceStatusMap;
export const MaintenanceStatusTypeMapEnhanced = MaintenanceStatusTypeMap;
export const MaintenanceStatusColorEnhanced = MaintenanceStatusColor;
export const MaintenanceStatusOperationsEnhanced = MaintenanceStatusOperations;
export const MaintenanceStatusTransitionsEnhanced = MaintenanceStatusTransitions;
export const MaintenanceFlowStepsEnhanced = MaintenanceFlowSteps;
export const getInstallationStatusTextEnhanced = getInstallationStatusText;
export const getInstallationStatusTypeEnhanced = getInstallationStatusType;
export const getInstallationStatusColorEnhanced = getInstallationStatusColorValue;
export const isInstallationOperationAllowedEnhanced = isInstallationOperationAllowed;
export const getInstallationStatusTransitionEnhanced = getInstallationStatusTransition;
export const getMaintenanceStatusTextEnhanced = getMaintenanceStatusText;
export const getMaintenanceStatusTypeEnhanced = getMaintenanceStatusType;
export const getMaintenanceStatusColorEnhanced = getMaintenanceStatusColorValue;
export const isMaintenanceOperationAllowedEnhanced = isMaintenanceOperationAllowed;
export const getMaintenanceStatusTransitionEnhanced = getMaintenanceStatusTransition;
export const InstallationBatchOperationsEnhanced = InstallationBatchOperations;
export const MaintenanceBatchOperationsEnhanced = MaintenanceBatchOperations;

export default {
  InstallationStatus,
  InstallationStatusMap,
  InstallationStatusTypeMap,
  InstallationStatusColor,
  InstallationStatusOperations,
  InstallationStatusTransitions,
  InstallationFlowSteps,
  MaintenanceStatus,
  MaintenanceStatusMap,
  MaintenanceStatusTypeMap,
  MaintenanceStatusColor,
  MaintenanceStatusOperations,
  MaintenanceStatusTransitions,
  MaintenanceFlowSteps,
  getInstallationStatusText,
  getInstallationStatusType,
  getInstallationStatusColorValue,
  isInstallationOperationAllowed,
  getInstallationStatusTransition,
  getMaintenanceStatusText,
  getMaintenanceStatusType,
  getMaintenanceStatusColorValue,
  isMaintenanceOperationAllowed,
  getMaintenanceStatusTransition,
  InstallationBatchOperations,
  MaintenanceBatchOperations,
};
