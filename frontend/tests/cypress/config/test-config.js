/**
 * @file: test-config.js
 * @description: Cypress测试统一配置文件
 * @author: AI架构专家
 * @createTime: 2026-02-24
 *
 * 配置原则：
 * 1. 所有测试相关配置集中管理
 * 2. 支持环境变量覆盖
 * 3. 提供配置验证机制
 * 4. 敏感信息（密码）单独管理
 */

// 测试环境配置
const TEST_ENVIRONMENTS = {
  development: {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost:8080/api',
    timeout: {
      default: 10000,
      pageLoad: 30000,
      request: 10000
    }
  },
  staging: {
    baseUrl: 'http://staging.warehouse.com',
    apiUrl: 'http://staging-api.warehouse.com/api',
    timeout: {
      default: 15000,
      pageLoad: 60000,
      request: 15000
    }
  },
  production: {
    baseUrl: 'https://warehouse.com',
    apiUrl: 'https://api.warehouse.com/api',
    timeout: {
      default: 20000,
      pageLoad: 60000,
      request: 20000
    }
  }
};

// 测试账号配置（从环境变量读取，支持本地覆盖）
const TEST_ACCOUNTS = {
  admin: {
    username: Cypress.env('TEST_ADMIN_USERNAME') || 'admin',
    password: Cypress.env('TEST_ADMIN_PASSWORD') || '123456',
    role: 'ADMIN',
    description: '系统管理员账号'
  },
  operator: {
    username: Cypress.env('TEST_OPERATOR_USERNAME') || 'operator',
    password: Cypress.env('TEST_OPERATOR_PASSWORD') || '123456',
    role: 'OPERATOR',
    description: '操作员账号'
  },
  technician: {
    username: Cypress.env('TEST_TECHNICIAN_USERNAME') || 'technician',
    password: Cypress.env('TEST_TECHNICIAN_PASSWORD') || '123456',
    role: 'TECHNICIAN',
    description: '技术员账号'
  },
  viewer: {
    username: Cypress.env('TEST_VIEWER_USERNAME') || 'viewer',
    password: Cypress.env('TEST_VIEWER_PASSWORD') || '123456',
    role: 'VIEWER',
    description: '访客账号'
  }
};

// 测试数据配置
const TEST_DATA_CONFIG = {
  prefix: Cypress.env('TEST_DATA_PREFIX') || 'TEST_DATA_',
  cache: {
    enabled: Cypress.env('SESSION_CACHE_ENABLED') !== false,
    ttl: parseInt(Cypress.env('TEST_DATA_CACHE_TTL')) || 300000 // 5分钟
  },
  cleanup: {
    enabled: true,
    retryCount: 3
  }
};

// API配置
const API_CONFIG = {
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh'
    },
    user: {
      list: '/users',
      detail: (id) => `/users/${id}`,
      create: '/users',
      update: (id) => `/users/${id}`,
      delete: (id) => `/users/${id}`
    },
    device: {
      list: '/devices',
      detail: (id) => `/devices/${id}`,
      create: '/devices',
      update: (id) => `/devices/${id}`,
      delete: (id) => `/devices/${id}`
    },
    inventory: {
      list: '/inventory',
      inbound: '/stock-orders?type=INBOUND',
      outbound: '/stock-orders?type=OUTBOUND',
      transfer: '/stock-transfers',
      count: '/stock-counts'
    }
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// 验证配置
const VALIDATION_CONFIG = {
  login: {
    requiredFields: ['username', 'password'],
    usernameMinLength: 3,
    usernameMaxLength: 50,
    passwordMinLength: 6,
    passwordMaxLength: 100
  },
  api: {
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000
  }
};

/**
 * 获取当前环境配置
 */
function getEnvironmentConfig() {
  const env = Cypress.env('TEST_ENV') || 'development';
  return TEST_ENVIRONMENTS[env] || TEST_ENVIRONMENTS.development;
}

/**
 * 获取测试账号
 * @param {string} accountType - 账号类型 (admin, operator, technician, viewer)
 * @returns {Object} 账号配置
 */
function getTestAccount(accountType = 'admin') {
  const account = TEST_ACCOUNTS[accountType];
  if (!account) {
    throw new Error(`未知的测试账号类型: ${accountType}`);
  }
  return { ...account };
}

/**
 * 获取API端点URL
 * @param {string} endpoint - 端点路径
 * @returns {string} 完整URL
 */
function getApiUrl(endpoint) {
  const env = getEnvironmentConfig();
  return `${env.apiUrl}${endpoint}`;
}

/**
 * 验证配置完整性
 * @returns {Object} 验证结果
 */
function validateConfig() {
  const errors = [];
  const warnings = [];

  // 验证环境配置
  const env = getEnvironmentConfig();
  if (!env.baseUrl) {
    errors.push('缺少 baseUrl 配置');
  }
  if (!env.apiUrl) {
    errors.push('缺少 apiUrl 配置');
  }

  // 验证测试账号
  Object.entries(TEST_ACCOUNTS).forEach(([type, account]) => {
    if (!account.username) {
      errors.push(`测试账号 ${type} 缺少用户名`);
    }
    if (!account.password) {
      errors.push(`测试账号 ${type} 缺少密码`);
    }
    if (account.password && account.password.length < 6) {
      warnings.push(`测试账号 ${type} 的密码长度小于6位`);
    }
  });

  // 检查是否使用了默认密码（生产环境警告）
  const currentEnv = Cypress.env('TEST_ENV') || 'development';
  if (currentEnv === 'production') {
    Object.entries(TEST_ACCOUNTS).forEach(([type, account]) => {
      if (account.password === '123456' || account.password === 'admin') {
        errors.push(`生产环境不能使用默认密码: ${type}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    environment: currentEnv,
    timestamp: new Date().toISOString()
  };
}

/**
 * 打印配置信息（用于调试）
 */
function printConfig() {
  const env = getEnvironmentConfig();
  const validation = validateConfig();

  cy.log('╔════════════════════════════════════════════════════════════╗');
  cy.log('║              Cypress 测试配置信息                          ║');
  cy.log('╚════════════════════════════════════════════════════════════╝');
  cy.log(`环境: ${validation.environment}`);
  cy.log(`Base URL: ${env.baseUrl}`);
  cy.log(`API URL: ${env.apiUrl}`);
  cy.log(`配置验证: ${validation.valid ? '✅ 通过' : '❌ 失败'}`);

  if (validation.warnings.length > 0) {
    cy.log('\n⚠️  警告:');
    validation.warnings.forEach(w => cy.log(`  - ${w}`));
  }

  if (validation.errors.length > 0) {
    cy.log('\n❌ 错误:');
    validation.errors.forEach(e => cy.log(`  - ${e}`));
  }

  cy.log('════════════════════════════════════════════════════════════');
}

// 导出配置
export {
  TEST_ENVIRONMENTS,
  TEST_ACCOUNTS,
  TEST_DATA_CONFIG,
  API_CONFIG,
  VALIDATION_CONFIG,
  getEnvironmentConfig,
  getTestAccount,
  getApiUrl,
  validateConfig,
  printConfig
};

// 默认导出
export default {
  getEnvironmentConfig,
  getTestAccount,
  getApiUrl,
  validateConfig,
  printConfig
};
