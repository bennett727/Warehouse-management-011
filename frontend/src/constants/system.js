/**
 * 系统级常量配置
 * 包含分页、请求、防抖等系统级配置常量
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_CURRENT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000,
};

export const REQUEST = {
  TIMEOUT: 30000,
  RETRY_COUNT: 2,
  RETRY_DELAY: 2000,
  LONG_REQUEST_TIMEOUT: 60000,
  SHORT_REQUEST_TIMEOUT: 10000,
  UPLOAD_TIMEOUT: 120000,
};

export const DEBOUNCE = {
  DEFAULT_DELAY: 300,
  SEARCH_DELAY: 500,
  FORM_DELAY: 200,
};

export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000,
  MAX_SIZE: 100,
};

export const STORAGE = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_info',
  THEME_KEY: 'theme',
  LANGUAGE_KEY: 'language',
};
