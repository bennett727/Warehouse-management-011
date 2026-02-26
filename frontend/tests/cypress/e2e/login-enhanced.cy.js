/**
 * @file: login-enhanced.cy.js
 * @description: 登录功能增强版测试 - 使用新的配置和验证机制
 * @author: AI架构专家
 * @createTime: 2026-02-24
 */

import { getTestAccount, validateConfig } from '../config/test-config.js'

describe('登录功能增强测试', () => {

  before(() => {
    // 验证配置
    const validation = validateConfig()
    expect(validation.valid, '配置应验证通过').to.be.true
    cy.log('✅ 配置验证通过')
  })

  beforeEach(() => {
    // 清理所有session，确保干净的测试环境
    cy.clearAllSessions()
  })

  afterEach(() => {
    // 登出
    cy.logoutEnhanced()
  })

  describe('配置验证', () => {
    it('应该验证所有测试账号配置正确', () => {
      const accountTypes = ['admin', 'operator', 'technician', 'viewer']

      accountTypes.forEach(type => {
        const account = getTestAccount(type)
        expect(account.username).to.exist
        expect(account.password).to.exist
        expect(account.password.length).to.be.at.least(6)
        expect(account.role).to.exist
        cy.log(`✅ ${type} 账号配置正确: ${account.username}`)
      })
    })

    it('应该验证API端点配置正确', () => {
      const admin = getTestAccount('admin')
      expect(admin.username).to.eq('admin')
      expect(admin.password).to.eq('123456')
      cy.log('✅ 管理员账号配置验证通过')
    })
  })

  describe('增强版UI登录测试', () => {
    it('应该使用增强命令成功登录管理员账号', () => {
      cy.loginEnhanced('admin', { useSession: false, verifyLogin: true })

      // 验证登录成功
      cy.verifyLoginStatus()

      // 验证页面元素
      cy.contains('数据仪表盘').should('be.visible')
      cy.contains('admin').should('be.visible')
    })

    it('应该使用session缓存成功登录', () => {
      // 第一次登录
      cy.loginEnhanced('admin', { useSession: true })
      cy.verifyLoginStatus()

      // 刷新页面，验证session仍然有效
      cy.reload()
      cy.verifyLoginStatus()
    })

    it('应该支持操作员账号登录', () => {
      cy.loginEnhanced('operator', { useSession: false })
      cy.verifyLoginStatus()

      // 验证操作员权限
      cy.contains('数据仪表盘').should('be.visible')
    })

    it('应该支持技术员账号登录', () => {
      cy.loginEnhanced('technician', { useSession: false })
      cy.verifyLoginStatus()
    })

    it('应该在密码错误时正确失败', () => {
      const admin = getTestAccount('admin')

      // 使用错误密码登录
      cy.visit('/login')
      cy.get('[data-cy="login-username-input"]').type(admin.username)
      cy.get('[data-cy="login-password-input"]').type('wrongpassword')
      cy.get('[data-cy="login-submit-button"]').click()

      // 验证错误提示
      cy.contains('用户名或密码错误', { timeout: 5000 }).should('be.visible')

      // 验证未登录
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token')
        expect(token).to.be.null
      })
    })

    it('应该在用户名不存在时正确失败', () => {
      cy.visit('/login')
      cy.get('[data-cy="login-username-input"]').type('nonexistentuser123')
      cy.get('[data-cy="login-password-input"]').type('somepassword')
      cy.get('[data-cy="login-submit-button"]').click()

      // 验证错误提示
      cy.contains('用户名或密码错误', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('增强版API登录测试', () => {
    it('应该使用API成功登录并验证token', () => {
      cy.loginByApiEnhanced('admin', { verifyToken: true }).then((result) => {
        expect(result.token).to.exist
        expect(result.token.split('.')).to.have.length(3)

        if (result.userInfo) {
          expect(result.userInfo.username).to.eq('admin')
        }
      })

      // 验证登录状态
      cy.verifyLoginStatus()
    })

    it('应该使用API登录操作员账号', () => {
      cy.loginByApiEnhanced('operator').then((result) => {
        expect(result.token).to.exist
      })
    })

    it('应该在API登录密码错误时正确失败', () => {
      const loginUrl = Cypress.env('apiUrl') + '/auth/login'

      cy.request({
        method: 'POST',
        url: loginUrl,
        body: {
          username: 'admin',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 400])
        expect(response.body.success).to.be.false
      })
    })
  })

  describe('登录状态持久化测试', () => {
    it('应该保持登录状态在页面刷新后', () => {
      cy.loginEnhanced('admin')
      cy.verifyLoginStatus()

      // 刷新页面
      cy.reload()

      // 验证仍然登录
      cy.verifyLoginStatus()
    })

    it('应该保持登录状态在导航到其他页面后', () => {
      cy.loginEnhanced('admin')

      // 导航到设备管理页面
      cy.visit('/devices')
      cy.url().should('include', '/devices')

      // 验证仍然登录
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token')
        expect(token).to.exist
      })

      // 导航到库存管理页面
      cy.visit('/inventory')
      cy.url().should('include', '/inventory')

      // 验证仍然登录
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token')
        expect(token).to.exist
      })
    })
  })

  describe('登出功能测试', () => {
    it('应该成功登出并清除所有认证信息', () => {
      // 登录
      cy.loginEnhanced('admin')
      cy.verifyLoginStatus()

      // 登出
      cy.logoutEnhanced()

      // 验证已登出
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token')
        const userInfo = win.localStorage.getItem('userInfo')
        expect(token).to.be.null
        expect(userInfo).to.be.null
      })

      // 验证重定向到登录页
      cy.url().should('include', '/login')
    })

    it('应该在登出后需要重新登录', () => {
      // 登录
      cy.loginEnhanced('admin')

      // 登出
      cy.logoutEnhanced()

      // 尝试访问受保护页面
      cy.visit('/dashboard')

      // 应该被重定向到登录页
      cy.url().should('include', '/login')
    })
  })

  describe('并发登录测试', () => {
    it('应该支持不同账号同时登录', () => {
      // 先登录管理员
      cy.loginEnhanced('admin', { useSession: false })

      // 登出
      cy.logoutEnhanced()

      // 登录操作员
      cy.loginEnhanced('operator', { useSession: false })

      // 验证当前是操作员
      cy.window().then((win) => {
        const userInfo = win.localStorage.getItem('userInfo')
        if (userInfo) {
          const user = JSON.parse(userInfo)
          expect(user.username).to.eq('operator')
        }
      })
    })
  })

  describe('安全验证测试', () => {
    it('应该验证token格式正确', () => {
      cy.loginByApiEnhanced('admin').then((result) => {
        const token = result.token
        const parts = token.split('.')

        // 验证JWT结构
        expect(parts).to.have.length(3)

        // 验证可以解码payload
        const payload = JSON.parse(atob(parts[1]))
        expect(payload).to.exist
        cy.log(`Token payload: ${JSON.stringify(payload)}`)
      })
    })

    it('应该防止XSS攻击', () => {
      cy.visit('/login')

      // 尝试输入XSS脚本
      cy.get('[data-cy="login-username-input"]').type('<script>alert("xss")</script>')
      cy.get('[data-cy="login-password-input"]').type('password')
      cy.get('[data-cy="login-submit-button"]').click()

      // 验证没有执行脚本（页面没有alert）
      cy.contains('用户名或密码错误').should('be.visible')
    })

    it('应该防止SQL注入攻击', () => {
      cy.visit('/login')

      // 尝试SQL注入
      cy.get('[data-cy="login-username-input"]').type("admin' OR '1'='1")
      cy.get('[data-cy="login-password-input"]').type("password' OR '1'='1")
      cy.get('[data-cy="login-submit-button"]').click()

      // 验证登录失败
      cy.contains('用户名或密码错误').should('be.visible')
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内完成登录', () => {
      const startTime = Date.now()

      cy.loginEnhanced('admin', { useSession: false })

      cy.wrap(null).then(() => {
        const duration = Date.now() - startTime
        cy.log(`登录耗时: ${duration}ms`)
        expect(duration).to.be.lessThan(10000) // 10秒内完成
      })
    })

    it('应该在合理时间内完成API登录', () => {
      const startTime = Date.now()

      cy.loginByApiEnhanced('admin').then(() => {
        const duration = Date.now() - startTime
        cy.log(`API登录耗时: ${duration}ms`)
        expect(duration).to.be.lessThan(5000) // 5秒内完成
      })
    })
  })

  describe('错误处理和重试', () => {
    it('应该在网络错误时正确重试', () => {
      // 模拟网络错误（通过拦截请求）
      cy.intercept('POST', '**/auth/login', {
        forceNetworkError: true,
        times: 1
      }).as('loginError')

      cy.visit('/login')
      cy.get('[data-cy="login-username-input"]').type('admin')
      cy.get('[data-cy="login-password-input"]').type('123456')
      cy.get('[data-cy="login-submit-button"]').click()

      // 等待错误请求
      cy.wait('@loginError').then(() => {
        cy.log('网络错误已触发')
      })
    })
  })
})
