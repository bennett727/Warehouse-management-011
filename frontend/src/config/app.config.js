/**
 * @file: app.config.js
 * @description: 统一的配置管理文件，集中管理应用的所有配置项
 * @author: 开发团队
 * @createTime: 2025-12-28
 * @version: 1.0.0
 */

export default {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    retryTimes: 3,
    retryDelay: 1000,
  },

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    maxTotalItems: 10000,
  },

  upload: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel'],
    chunkSize: 5 * 1024 * 1024,
  },

  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000,
    maxSize: 100,
    storage: 'localStorage',
  },

  table: {
    stripe: true,
    border: true,
    size: 'default',
    highlightCurrentRow: true,
    showHeader: true,
  },

  message: {
    duration: 3000,
    showClose: true,
    grouping: true,
  },

  dialog: {
    closeOnClickModal: false,
    closeOnPressEscape: true,
    showClose: true,
  },

  loading: {
    fullscreen: true,
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  },

  form: {
    labelPosition: 'right',
    labelWidth: '120px',
    size: 'default',
  },

  date: {
    format: 'YYYY-MM-DD',
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    timeFormat: 'HH:mm:ss',
  },

  export: {
    maxExportRows: 10000,
    defaultFileName: 'export',
    dateFormat: 'YYYYMMDD_HHmmss',
  },

  theme: {
    primaryColor: '#409EFF',
    successColor: '#67C23A',
    warningColor: '#E6A23C',
    dangerColor: '#F56C6C',
    infoColor: '#909399',
  },

  device: {
    status: {
      NORMAL: 'normal',
      MAINTENANCE: 'maintenance',
      REPAIR: 'repair',
      SCRAPPED: 'scrapped',
      EXPIRED: 'expired',
    },
    lifecycle: {
      PURCHASE: 'purchase',
      INSTALLATION: 'installation',
      USAGE: 'usage',
      MAINTENANCE: 'maintenance',
      SCRAPPED: 'scrapped',
    },
  },

  inventory: {
    status: {
      IN_STOCK: 'in_stock',
      OUT_OF_STOCK: 'out_of_stock',
      LOW_STOCK: 'low_stock',
    },
    operation: {
      INBOUND: 'inbound',
      OUTBOUND: 'outbound',
      TRANSFER: 'transfer',
      ADJUSTMENT: 'adjustment',
    },
  },

  maintenance: {
    status: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
    priority: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent',
    },
  },

  repair: {
    status: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
    priority: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
    },
  },

  debounce: {
    search: 500,
    input: 300,
    scroll: 100,
  },

  throttle: {
    resize: 200,
    scroll: 100,
  },
};
