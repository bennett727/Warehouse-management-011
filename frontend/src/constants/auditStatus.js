export const AuditType = {
  FULL: 0,
  PARTIAL: 1,
  CYCLIC: 2,
};

export const AuditTypeMap = {
  [AuditType.FULL]: '全盘',
  [AuditType.PARTIAL]: '抽盘',
  [AuditType.CYCLIC]: '循环盘点',
};

export const AuditTypeColor = {
  [AuditType.FULL]: 'danger',
  [AuditType.PARTIAL]: 'warning',
  [AuditType.CYCLIC]: 'primary',
};

export const AuditStatus = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  CANCELLED: 3,
};

export const AuditStatusMap = {
  [AuditStatus.PENDING]: '待盘点',
  [AuditStatus.IN_PROGRESS]: '盘点中',
  [AuditStatus.COMPLETED]: '已完成',
  [AuditStatus.CANCELLED]: '已取消',
};

export const AuditStatusColor = {
  [AuditStatus.PENDING]: 'warning',
  [AuditStatus.IN_PROGRESS]: 'primary',
  [AuditStatus.COMPLETED]: 'success',
  [AuditStatus.CANCELLED]: 'info',
};

export const AuditItemStatus = {
  PENDING: 0,
  MATCHED: 1,
  MISMATCHED: 2,
  ADJUSTED: 3,
};

export const AuditItemStatusMap = {
  [AuditItemStatus.PENDING]: '待盘点',
  [AuditItemStatus.MATCHED]: '匹配',
  [AuditItemStatus.MISMATCHED]: '不匹配',
  [AuditItemStatus.ADJUSTED]: '已调整',
};

export const AuditItemStatusColor = {
  [AuditItemStatus.PENDING]: 'warning',
  [AuditItemStatus.MATCHED]: 'success',
  [AuditItemStatus.MISMATCHED]: 'danger',
  [AuditItemStatus.ADJUSTED]: 'primary',
};

export const getAuditTypeText = (type) => {
  return AuditTypeMap[type] || '未知';
};

export const getAuditTypeColor = (type) => {
  return AuditTypeColor[type] || 'default';
};

export const getAuditStatusText = (status) => {
  return AuditStatusMap[status] || '未知';
};

export const getAuditStatusColor = (status) => {
  return AuditStatusColor[status] || 'default';
};

export const getAuditItemStatusText = (status) => {
  return AuditItemStatusMap[status] || '未知';
};

export const getAuditItemStatusColor = (status) => {
  return AuditItemStatusColor[status] || 'default';
};
