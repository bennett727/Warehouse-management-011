export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
};

export const REQUEST_TIMEOUT = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  UPLOAD: 300000,
};

export const FILE_SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
};

export const STRING_LENGTH = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 30,
  PHONE_LENGTH: 11,
  ID_CARD_LENGTH_15: 15,
  ID_CARD_LENGTH_18: 18,
  CHINESE_NAME_MIN: 2,
  CHINESE_NAME_MAX: 10,
  FILENAME_MAX: 255,
};

export const NUMBER_RANGE = {
  MIN_VALUE: -Infinity,
  MAX_VALUE: Infinity,
  PORT_MIN: 1,
  PORT_MAX: 65535,
};

export const CACHE = {
  DEFAULT_EXPIRE_TIME: 5 * 60 * 1000,
  LONG_EXPIRE_TIME: 30 * 60 * 1000,
  SHORT_EXPIRE_TIME: 60 * 1000,
  MAX_CACHE_SIZE: 100,
};

export const ERROR_LOG = {
  MAX_LOGS: 500,
  MAX_RECENT_LOGS: 100,
  ERROR_ALERT_COUNT: 5,
  ERROR_ALERT_WINDOW: 5 * 60 * 1000,
  HIGH_ERROR_RATE: 50,
  HIGH_ERROR_RATE_WINDOW: 60 * 60 * 1000,
};

export const PERFORMANCE = {
  MAX_LOGS: 1000,
  BATCH_SIZE: 20,
  REPORT_INTERVAL: 60 * 1000,
  LONG_TASK_THRESHOLD: 50,
  SLOW_REQUEST_THRESHOLD: 1000,
  VERY_SLOW_REQUEST_THRESHOLD: 3000,
  EXCELLENT_LOAD_TIME: 1000,
  GOOD_LOAD_TIME: 2000,
  ACCEPTABLE_LOAD_TIME: 3000,
};

export const ERROR_MONITOR = {
  BATCH_SIZE: 10,
  REPORT_INTERVAL: 30 * 1000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 5 * 1000,
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
  REFRESH_THRESHOLD: 30 * 60 * 1000,
};

export const TOKEN = {
  ACCESS_TOKEN_EXPIRY: 2 * 60 * 60 * 1000,
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000,
  REFRESH_WINDOW: 5 * 60 * 1000,
  CHECK_INTERVAL: 60 * 1000,
};

export const RETRY = {
  MAX_COUNT: 3,
  DELAY: 1000,
  MAX_DELAY: 10000,
  EXPONENTIAL_BASE: 2,
};

export const MESSAGE = {
  DEFAULT_DURATION: 3000,
  SUCCESS_DURATION: 2000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000,
};

export const DIALOG = {
  DEFAULT_WIDTH: '600px',
  LARGE_WIDTH: '900px',
  SMALL_WIDTH: '400px',
  FULL_WIDTH: '100%',
};

export const TABLE = {
  DEFAULT_HEIGHT: '500px',
  MOBILE_HEIGHT: '300px',
  MAX_HEIGHT: '800px',
};

export const CHART = {
  DEFAULT_HEIGHT: '400px',
  MOBILE_HEIGHT: '300px',
  ANIMATION_DURATION: 1000,
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/,
  CHINESE_NAME: /^[\u4e00-\u9fa5]{2,10}$/,
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_UNDERSCORE: /^[a-zA-Z0-9_]+$/,
  ALPHANUMERIC_WITH_HYPHEN: /^[a-zA-Z0-9_-]+$/,
  URL: /^https?:\/\/.+/,
  IP: /^(\d{1,3}\.){3}\d{1,3}$/,
};

export const DEVICE_STATUS = {
  STOCK: 'stock',
  INSTALLED: 'installed',
  REPAIRING: 'repairing',
  SCRAPPED: 'scrapped',
};

export const DEVICE_TYPE = {
  BORROW_MACHINE: 'borrow_machine',
  MONITORING: 'monitoring',
  NETWORK: 'network',
  SERVER: 'server',
  OTHER: 'other',
};

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
};

export const OUTBOUND_TYPE = {
  USE: 'USE',
  MAINTENANCE: 'MAINTENANCE',
  TRANSFER: 'TRANSFER',
  SCRAP: 'SCRAP',
};

export const REPAIR_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export const REMOTE_ACCOUNT_TYPE = {
  SSH: 'SSH',
  TELNET: 'Telnet',
  VNC: 'VNC',
  RDP: 'RDP',
  FTP: 'FTP',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
};

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
};

export const BUSINESS_ERROR_CODE = {
  DUPLICATE_ORDER: 'DUPLICATE_ORDER',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  AREA_NOT_FOUND: 'AREA_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  BATCH_UPDATE_FAILED: 'BATCH_UPDATE_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_DEVICE_CODE: 'DUPLICATE_DEVICE_CODE',
  DUPLICATE_SERIAL_NUMBER: 'DUPLICATE_SERIAL_NUMBER',
  AREA_NAME_EXISTS: 'AREA_NAME_EXISTS',
  AREA_CODE_EXISTS: 'AREA_CODE_EXISTS',
};

export const ENV = {
  DEV: 'development',
  PROD: 'production',
  TEST: 'test',
};

export const STORAGE_KEY = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  ERROR_LOGS: 'error_logs',
  PERFORMANCE_LOGS: 'performance_logs',
  SESSION_ID: 'error_monitor_session_id',
  SETTINGS: 'app_settings',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
};

export const EVENT = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  TOKEN_REFRESH: 'token:refresh',
  ERROR_OCCURRED: 'error:occurred',
  PERFORMANCE_DATA: 'performance:data',
};

export const ROUTE_PATH = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DEVICE_MANAGEMENT: '/device-management',
  INVENTORY_MANAGEMENT: '/inventory-management',
  INBOUND_MANAGEMENT: '/inventory-management/inbound',
  OUTBOUND_MANAGEMENT: '/inventory-management/outbound',
  INSTALLATION_MANAGEMENT: '/installation-management',
  REPAIR_MANAGEMENT: '/repair-management',
  SYSTEM_MANAGEMENT: '/system-management',
  USER_MANAGEMENT: '/system-management/user',
  ROLE_MANAGEMENT: '/system-management/role',
  AREA_MANAGEMENT: '/system-management/area',
  DEVICE_TYPE_MANAGEMENT: '/system-management/device-type',
  REPORTS: '/reports',
};

export const API_PATH = {
  AUTH: '/api/auth',
  DEVICE: '/api/devices',
  INVENTORY: '/api/stock',
  INBOUND: '/api/stock/orders/inbound',
  OUTBOUND: '/api/stock/orders/outbound',
  INSTALLATION: '/api/installations',
  REPAIR: '/api/maintenance',
  USER: '/api/users',
  ROLE: '/api/roles',
  AREA: '/api/areas',
  DEVICE_TYPE: '/api/device-types',
  REPORTS: '/api/reports',
  ERROR_REPORT: '/error-report',
  PERFORMANCE_REPORT: '/performance-report',
};

export const FILE_TYPE = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
};

export default {
  TIME,
  REQUEST_TIMEOUT,
  FILE_SIZE,
  STRING_LENGTH,
  NUMBER_RANGE,
  CACHE,
  ERROR_LOG,
  PERFORMANCE,
  ERROR_MONITOR,
  TOKEN,
  RETRY,
  MESSAGE,
  DIALOG,
  TABLE,
  CHART,
  REGEX,
  DEVICE_STATUS,
  DEVICE_TYPE,
  USER_ROLE,
  OUTBOUND_TYPE,
  REPAIR_STATUS,
  REMOTE_ACCOUNT_TYPE,
  HTTP_STATUS,
  BUSINESS_ERROR_CODE,
  ENV,
  STORAGE_KEY,
  EVENT,
  ROUTE_PATH,
  API_PATH,
  FILE_TYPE,
};
