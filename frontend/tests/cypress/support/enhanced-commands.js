/**
 * @file: enhanced-commands.js
 * @description: 增强版Cypress命令 - 包含严格的登录验证和Session管理
 * @author: AI架构专家
 * @createTime: 2026-02-24
 */

import {
  getTestAccount,
  getApiUrl,
  API_CONFIG,
  VALIDATION_CONFIG,
  printConfig,
  validateConfig
} from '../config/test-config.js';

/**
 * 清理所有Session和缓存
 * 在每个测试套件开始前调用，确保干净的测试环境
 */
Cypress.Commands.add('clearAllSessions', () => {
  cy.log('🧹 清理所有Session和缓存...');

  // 清理Cypress session
  Cypress.session.clearAllSavedSessions();

  // 清理localStorage
  cy.window().then((win) => {
    win.localStorage.clear();
  });

  // 清理cookies
  cy.clearCookies();

  // 清理所有缓存数据
  cy.wrap(null).then(() => {
    Cypress.env('cachedToken', null);
    Cypress.env('cachedUsers', null);
    Cypress.env('cachedRoles', null);
    Cypress.env('cachedDevices', null);
  });

  cy.log('✅ Session和缓存清理完成');
});

/**
 * 验证配置并打印
 */
Cypress.Commands.add('validateAndPrintConfig', () => {
  const validation = validateConfig();

  if (!validation.valid) {
    throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
  }

  printConfig();
});

/**
 * 增强版登录命令 - 带严格验证
 * @param {string} accountType - 账号类型 (admin, operator, technician, viewer)
 * @param {Object} options - 登录选项
 */
Cypress.Commands.add('loginEnhanced', (accountType = 'admin', options = {}) => {
  const {
    useSession = true,
    verifyLogin = true,
    maxRetries = 3
  } = options;

  const account = getTestAccount(accountType);
  const sessionKey = `session_${accountType}_${account.username}`;

  cy.log(`🔐 开始登录: ${account.username} (${account.role})`);

  const performLoginWithRetry = (retryCount = 0) => {
    cy.log(`📝 执行登录操作 (尝试 ${retryCount + 1}/${maxRetries})...`);

    // 访问登录页面
    cy.visit('/login');
    cy.url().should('include', '/login');

    // 验证登录页面元素
    cy.get('[data-cy="login-username-input"]')
      .should('be.visible')
      .and('not.be.disabled');
    cy.get('[data-cy="login-password-input"]')
      .should('be.visible')
      .and('not.be.disabled');
    cy.get('[data-cy="login-submit-button"]')
      .should('be.visible')
      .and('not.be.disabled');

    // 输入用户名和密码
    cy.get('[data-cy="login-username-input"]')
      .clear()
      .type(account.username)
      .should('have.value', account.username);

    cy.get('[data-cy="login-password-input"]')
      .clear()
      .type(account.password)
      .should('have.value', account.password);

    // 点击登录按钮
    cy.get('[data-cy="login-submit-button"]').click();

    // 等待登录响应
    cy.wait(1000);

    // 验证登录结果
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      const userInfo = win.localStorage.getItem('userInfo');

      if (!token) {
        if (retryCount < maxRetries - 1) {
          cy.log(`⚠️ 登录失败，未获取到token，准备重试...`);
          cy.wait(2000);
          performLoginWithRetry(retryCount + 1);
        } else {
          throw new Error(`登录失败: 未能获取到认证token (已重试${maxRetries}次)`);
        }
      } else {
        cy.log('✅ 登录成功，已获取token');

        // 验证token格式
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Token格式不正确');
          }
          cy.log('✅ Token格式验证通过');
        } catch (e) {
          throw new Error(`Token验证失败: ${e.message}`);
        }

        // 验证用户信息
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo);
            if (user.username !== account.username) {
              throw new Error(`用户信息不匹配: 期望 ${account.username}, 实际 ${user.username}`);
            }
            cy.log(`✅ 用户信息验证通过: ${user.username}`);
          } catch (e) {
            cy.log(`⚠️ 用户信息解析失败: ${e.message}`);
          }
        }
      }
    });
  };

  if (useSession) {
    cy.session(sessionKey, () => {
      performLoginWithRetry();
    }, {
      validate: () => {
        cy.window().then((win) => {
          const token = win.localStorage.getItem('token');
          expect(token).to.exist;
          expect(token.split('.')).to.have.length(3);
        });
      },
      cacheAcrossSpecs: false // 不在测试间共享session，确保每个测试独立
    });
  } else {
    performLoginWithRetry();
  }

  // 验证登录后的页面跳转
  if (verifyLogin) {
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.get('.el-loading-mask', { timeout: 5000 }).should('not.exist');
    cy.log('✅ 登录验证完成');
  }
});

/**
 * 增强版API登录 - 带严格验证
 * @param {string} accountType - 账号类型
 * @param {Object} options - 选项
 */
Cypress.Commands.add('loginByApiEnhanced', (accountType = 'admin', options = {}) => {
  const {
    verifyToken = true,
    failOnError = true
  } = options;

  const account = getTestAccount(accountType);
  const loginUrl = getApiUrl(API_CONFIG.endpoints.auth.login);

  cy.log(`🔐 API登录: ${account.username}`);
  cy.log(`📡 请求地址: ${loginUrl}`);

  cy.request({
    method: 'POST',
    url: loginUrl,
    body: {
      username: account.username,
      password: account.password
    },
    headers: API_CONFIG.headers,
    failOnStatusCode: failOnError
  }).then((response) => {
    // 严格验证响应
    expect(response.status, 'HTTP状态码应为200').to.eq(200);
    expect(response.body, '响应体不应为空').to.exist;
    expect(response.body.success, '登录应成功').to.be.true;
    expect(response.body.data, '响应数据不应为空').to.exist;
    expect(response.body.data.token, '应返回token').to.exist;

    const token = response.body.data.token;

    // 验证token格式
    const tokenParts = token.split('.');
    expect(tokenParts, 'Token应包含3部分').to.have.length(3);

    // 验证token内容（解码payload）
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      expect(payload.sub || payload.username, 'Token应包含用户信息').to.exist;
      cy.log(`✅ Token验证通过，用户: ${payload.sub || payload.username}`);
    } catch (e) {
      throw new Error(`Token解析失败: ${e.message}`);
    }

    // 存储token
    cy.window().then((win) => {
      win.localStorage.setItem('token', token);
      if (response.body.data.userInfo) {
        win.localStorage.setItem('userInfo', JSON.stringify(response.body.data.userInfo));
      }
    });

    cy.setCookie('auth_token', token);

    cy.log('✅ API登录成功，token已存储');

    return cy.wrap({ token, userInfo: response.body.data.userInfo });
  });
});

/**
 * 验证登录状态
 */
Cypress.Commands.add('verifyLoginStatus', () => {
  cy.log('🔍 验证登录状态...');

  cy.window().then((win) => {
    const token = win.localStorage.getItem('token');
    expect(token, '应存在token').to.exist;

    // 验证token未过期
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (exp) {
        const now = Math.floor(Date.now() / 1000);
        expect(exp, 'Token不应过期').to.be.greaterThan(now);
        cy.log(`✅ Token有效，剩余时间: ${exp - now}秒`);
      }
    } catch (e) {
      cy.log(`⚠️ Token验证警告: ${e.message}`);
    }
  });

  // 验证页面可访问
  cy.visit('/dashboard');
  cy.url().should('include', '/dashboard');
  cy.contains('数据仪表盘', { timeout: 10000 }).should('be.visible');

  cy.log('✅ 登录状态验证通过');
});

/**
 * 登出命令
 */
Cypress.Commands.add('logoutEnhanced', () => {
  cy.log('🚪 执行登出...');

  // 调用登出API
  const logoutUrl = getApiUrl(API_CONFIG.endpoints.auth.logout);
  cy.request({
    method: 'POST',
    url: logoutUrl,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    },
    failOnStatusCode: false
  });

  // 清理本地存储
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('userInfo');
    win.localStorage.removeItem('permissions');
  });

  cy.clearCookies();
  Cypress.session.clearAllSavedSessions();

  cy.visit('/login');
  cy.url().should('include', '/login');

  cy.log('✅ 登出完成');
});

/**
 * 等待页面加载完成
 */
Cypress.Commands.add('waitForPageReady', (options = {}) => {
  const { timeout = 10000, checkApi = false } = options;

  cy.log('⏳ 等待页面加载...');

  // 等待加载动画消失
  cy.get('.el-loading-mask', { timeout })
    .should('not.exist')
    .then(() => {
      cy.log('✅ 加载动画已消失');
    });

  // 等待骨架屏消失
  cy.get('.el-skeleton', { timeout })
    .should('not.exist')
    .then(() => {
      cy.log('✅ 骨架屏已消失');
    });

  // 等待API请求完成（可选）
  if (checkApi) {
    cy.wait(500);
  }

  cy.log('✅ 页面加载完成');
});

/**
 * 安全访问页面（带登录检查）
 */
Cypress.Commands.add('safeVisit', (path, options = {}) => {
  const { requireAuth = true, accountType = 'admin' } = options;

  cy.log(`🌐 安全访问: ${path}`);

  if (requireAuth) {
    // 检查是否已登录
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      if (!token) {
        cy.log('⚠️ 未检测到登录状态，自动登录...');
        cy.loginEnhanced(accountType);
      }
    });
  }

  cy.visit(path);
  cy.url().should('include', path);
  cy.waitForPageReady();

  cy.log(`✅ 页面访问成功: ${path}`);
});

/**
 * 验证API响应结构
 */
Cypress.Commands.add('validateApiResponse', (response, schema) => {
  cy.log('🔍 验证API响应结构...');

  // 验证基本结构
  expect(response).to.have.property('status');
  expect(response).to.have.property('body');

  if (schema) {
    // 验证schema
    Object.entries(schema).forEach(([key, rules]) => {
      if (rules.required) {
        expect(response.body).to.have.property(key);
      }

      if (response.body[key] !== undefined && rules.type) {
        expect(typeof response.body[key]).to.eq(rules.type);
      }
    });
  }

  cy.log('✅ API响应结构验证通过');
});

/**
 * 简化的API登录命令
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
Cypress.Commands.add('apiLogin', (username, password) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api';

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    body: {
      username: username,
      password: password
    },
    failOnStatusCode: false
  });
});

/**
 * 简化的UI登录命令
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
Cypress.Commands.add('uiLogin', (username, password) => {
  cy.visit('/login');
  cy.get('[data-cy="login-username-input"]').clear().type(username);
  cy.get('[data-cy="login-password-input"]').clear().type(password);
  cy.get('[data-cy="login-submit-button"]').click();
  cy.wait(2000);
});

// 导出增强命令
export {
  getTestAccount,
  getApiUrl,
  validateConfig
};
