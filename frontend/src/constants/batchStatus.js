export const BatchStatus = {
  ACTIVE: 0,
  EXPIRED: 1,
  CLOSED: 2,
};

export const BatchStatusMap = {
  [BatchStatus.ACTIVE]: '活跃',
  [BatchStatus.EXPIRED]: '过期',
  [BatchStatus.CLOSED]: '关闭',
};

export const BatchStatusColor = {
  [BatchStatus.ACTIVE]: 'success',
  [BatchStatus.EXPIRED]: 'warning',
  [BatchStatus.CLOSED]: 'info',
};

export const getBatchStatusText = (status) => {
  return BatchStatusMap[status] || '未知';
};

export const getBatchStatusColor = (status) => {
  return BatchStatusColor[status] || 'default';
};
