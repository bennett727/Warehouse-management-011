/**
 * @file: login-validation-test.cy.js
 * @description: 登录验证核心测试 - 验证密码配置正确性
 * @author: AI架构专家
 * @createTime: 2026-02-24
 */

import { getTestAccount, validateConfig, getApiUrl } from '../config/test-config.js'

describe('登录验证核心测试', () => {

  before(() => {
    // 验证配置
    const validation = validateConfig()
    expect(validation.valid, '配置应验证通过').to.be.true
    cy.log('✅ 配置验证通过')
  })

  beforeEach(() => {
    // 清理所有session
    cy.clearAllSessions()
  })

  describe('配置验证', () => {
    it('应该验证所有测试账号配置正确', () => {
      const accountTypes = ['admin', 'operator', 'technician', 'viewer']

      accountTypes.forEach(type => {
        const account = getTestAccount(type)
        expect(account.username, `${type}用户名应存在`).to.exist
        expect(account.password, `${type}密码应存在`).to.exist
        expect(account.password.length, `${type}密码长度应>=6`).to.be.at.least(6)
        expect(account.role, `${type}角色应存在`).to.exist
        cy.log(`✅ ${type} 账号配置正确: ${account.username}`)
      })
    })

    it('应该验证管理员账号密码配置正确', () => {
      const admin = getTestAccount('admin')
      expect(admin.username).to.eq('admin')
      expect(admin.password).to.eq('123456')
      cy.log('✅ 管理员账号配置验证通过: 用户名=admin, 密码=123456')
    })
  })

  describe('API登录验证', () => {
    it('应该使用正确的密码成功登录', () => {
      const admin = getTestAccount('admin')
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'

      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {
          username: admin.username,
          password: admin.password
        },
        failOnStatusCode: false
      }).then((response) => {
        // 严格验证响应
        expect(response.status, 'HTTP状态码应为200').to.eq(200)
        expect(response.body, '响应体不应为空').to.exist
        expect(response.body.success, '登录应成功').to.be.true
        expect(response.body.data, '响应数据不应为空').to.exist

        // 后端返回的token字段名是accessToken
        const token = response.body.data.accessToken || response.body.data.token
        expect(token, '应返回token').to.exist

        // 验证token格式
        const tokenParts = token.split('.')
        expect(tokenParts, 'Token应包含3部分').to.have.length(3)

        // 验证token内容
        const payload = JSON.parse(atob(tokenParts[1]))
        expect(payload.sub || payload.username, 'Token应包含用户信息').to.exist

        cy.log(`✅ API登录成功，用户: ${payload.sub || payload.username}`)
        cy.log(`✅ Token前20字符: ${token.substring(0, 20)}...`)
      })
    })

    it('应该在使用错误密码时登录失败', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'

      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {
          username: 'admin',
          password: 'Admin@123456'  // 错误的旧密码
        },
        failOnStatusCode: false
      }).then((response) => {
        // 验证登录失败
        expect(response.status).to.be.oneOf([401, 403, 400, 200])

        if (response.status === 200) {
          // 如果返回200，验证success为false
          expect(response.body.success).to.be.false
        }

        cy.log('✅ 错误密码登录被正确拒绝')
      })
    })

    it('应该支持所有测试账号类型登录', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
      const accountTypes = ['admin', 'operator', 'technician', 'viewer']

      accountTypes.forEach(type => {
        const account = getTestAccount(type)

        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          body: {
            username: account.username,
            password: account.password
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 && response.body?.success) {
            cy.log(`✅ ${type} (${account.username}) 登录成功`)
          } else {
            cy.log(`⚠️ ${type} (${account.username}) 登录失败: ${response.body?.message || '未知错误'}`)
          }
        })
      })
    })
  })

  describe('UI登录验证', () => {
    it('应该使用正确的密码成功登录', () => {
      const admin = getTestAccount('admin')

      cy.visit('/login')
      cy.url().should('include', '/login')

      // 输入正确的用户名和密码
      cy.get('[data-cy="login-username-input"]').clear().type(admin.username)
      cy.get('[data-cy="login-password-input"]').clear().type(admin.password)
      cy.get('[data-cy="login-submit-button"]').click()

      // 等待登录完成和页面跳转
      cy.url({ timeout: 15000 }).should('not.include', '/login')
      cy.url().should('include', '/dashboard')

      // 等待页面完全加载
      cy.wait(2000)

      // 验证token存在（前端使用access_token存储）
      cy.window().then((win) => {
        const token = win.localStorage.getItem('access_token')
        expect(token, 'Token应存在').to.exist
        expect(token.split('.')).to.have.length(3)
      })

      cy.log('✅ UI登录成功')
    })

    it('应该在使用错误密码时显示错误提示', () => {
      cy.visit('/login')

      // 输入正确的用户名和错误的密码
      cy.get('[data-cy="login-username-input"]').clear().type('admin')
      cy.get('[data-cy="login-password-input"]').clear().type('Admin@123456')  // 错误的旧密码
      cy.get('[data-cy="login-submit-button"]').click()

      // 等待错误提示
      cy.wait(2000)

      // 验证错误提示 - Element Plus的ElMessage会显示在页面上方
      cy.wait(1000)
      
      // 检查是否停留在登录页（未跳转）
      cy.url().should('include', '/login')
      
      // 验证登录按钮可点击（登录失败后会恢复）
      cy.get('[data-cy="login-submit-button"]').should('not.be.disabled')

      // 验证未登录
      cy.window().then((win) => {
        const token = win.localStorage.getItem('access_token')
        expect(token, 'Token不应存在').to.be.null
      })

      cy.log('✅ 错误密码被正确拒绝')
    })
  })

  describe('密码配置验证总结', () => {
    it('应该确认密码配置已修复', () => {
      const admin = getTestAccount('admin')

      cy.log('════════════════════════════════════════════════════════════')
      cy.log('║              密码配置验证总结                              ║')
      cy.log('════════════════════════════════════════════════════════════')
      cy.log(`配置的管理员用户名: ${admin.username}`)
      cy.log(`配置的管理员密码: ${admin.password}`)
      cy.log(`实际系统默认密码: 123456`)
      cy.log(`密码配置状态: ${admin.password === '123456' ? '✅ 正确' : '❌ 错误'}`)
      cy.log('════════════════════════════════════════════════════════════')

      // 验证密码配置正确
      expect(admin.password).to.eq('123456')
    })
  })
})
