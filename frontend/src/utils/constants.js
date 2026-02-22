export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000,
};

export const REQUEST = {
  TIMEOUT: 60000,
  RETRY_COUNT: 5,
  RETRY_DELAY: 3000,
  LONG_REQUEST_TIMEOUT: 120000,
  SHORT_REQUEST_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 180000,
  RETRY_STRATEGY: 'exponential',
  RETRY_MAX_DELAY: 60000,
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  RETRY_NETWORK_ERRORS: ['timeout', 'Network Error', 'ECONNABORTED'],
};

export const DEBOUNCE = {
  DEFAULT_DELAY: 300,
  SEARCH_DELAY: 500,
  FORM_DELAY: 200,
};

export const THROTTLE = {
  DEFAULT_DELAY: 100,
  SCROLL_DELAY: 16,
  RESIZE_DELAY: 200,
};

export const deviceStatusConfig = {
  AVAILABLE: {
    label: '可用',
    type: 'success',
  },
  IN_USE: {
    label: '使用中',
    type: 'primary',
  },
  MAINTENANCE: {
    label: '维护中',
    type: 'warning',
  },
  DEFECTIVE: {
    label: '故障',
    type: 'danger',
  },
  SCRAPPED: {
    label: '报废',
    type: 'info',
  },
  REPAIRING: {
    label: '维修中',
    type: 'warning',
  },
};

export const outboundTypeConfig = {
  USE: {
    label: '领用',
    type: 'primary',
  },
  MAINTENANCE: {
    label: '维修',
    type: 'warning',
  },
  TRANSFER: {
    label: '调拨',
    type: 'info',
  },
  SCRAP: {
    label: '报废',
    type: 'danger',
  },
};

export const userRoleConfig = {
  ADMIN: {
    label: '管理员',
    type: 'danger',
  },
  OPERATOR: {
    label: '操作员',
    type: 'primary',
  },
};

export const repairStatusConfig = {
  PENDING: {
    label: '待维修',
    type: 'warning',
  },
  IN_PROGRESS: {
    label: '维修中',
    type: 'primary',
  },
  COMPLETED: {
    label: '已完成',
    type: 'success',
  },
  FAILED: {
    label: '维修失败',
    type: 'danger',
  },
};
