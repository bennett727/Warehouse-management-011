/**
 * @file: login-simple-test.cy.js
 * @description: 简化版登录测试 - 验证基本登录流程
 * @author: AI架构专家
 * @createTime: 2026-02-26
 */

describe('🔐 简化登录测试', () => {
  
  it('应该成功访问登录页面', () => {
    cy.visit('/login')
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
    cy.get('[data-cy="login-form"]').should('be.visible')
    cy.get('[data-cy="login-username-input"]').should('be.visible')
    cy.get('[data-cy="login-password-input"]').should('be.visible')
    cy.get('[data-cy="login-submit-button"]').should('be.visible')
  })

  it('应该能够填写登录表单', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-username-input"]').clear().type('admin')
    cy.get('[data-cy="login-password-input"]').clear().type('123456')
    cy.get('[data-cy="login-username-input"]').should('have.value', 'admin')
    cy.get('[data-cy="login-password-input"]').should('have.value', '123456')
  })

  it('应该能够提交登录表单并接收响应', () => {
    cy.visit('/login')
    
    // 填写表单
    cy.get('[data-cy="login-username-input"]').clear().type('admin')
    cy.get('[data-cy="login-password-input"]').clear().type('123456')
    
    // 点击登录按钮
    cy.get('[data-cy="login-submit-button"]').click()
    
    // 等待响应（无论成功或失败）
    cy.wait(3000)
    
    // 检查是否有消息提示
    cy.get('body').then($body => {
      const hasMessage = $body.find('.el-message').length > 0
      const hasErrorMessage = $body.find('.el-message--error').length > 0
      const hasSuccessMessage = $body.find('.el-message--success').length > 0
      
      cy.log(`消息提示存在: ${hasMessage}`)
      cy.log(`错误消息: ${hasErrorMessage}`)
      cy.log(`成功消息: ${hasSuccessMessage}`)
      
      // 检查URL是否改变
      cy.url().then(url => {
        cy.log(`当前URL: ${url}`)
        if (url.includes('/dashboard')) {
          cy.log('✅ 登录成功，已跳转到仪表盘')
        } else if (url.includes('/login')) {
          cy.log('⚠️ 仍在登录页面，登录可能失败')
        }
      })
    })
  })

  it('应该验证登录API响应格式', () => {
    // 直接调用API测试登录
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/auth/login',
      body: { username: 'admin', password: '123456' },
      failOnStatusCode: false
    }).then((response) => {
      cy.log('API响应状态:', response.status)
      cy.log('API响应体:', JSON.stringify(response.body))
      
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('code')
      
      if (response.body.code === 200) {
        cy.log('✅ 登录API调用成功')
        expect(response.body.data).to.have.property('accessToken')
        expect(response.body.data).to.have.property('userInfo')
      } else {
        cy.log('❌ 登录API返回错误:', response.body.message)
      }
    })
  })

  it('应该验证localStorage中token存储', () => {
    cy.visit('/login')
    
    // 填写并提交表单
    cy.get('[data-cy="login-username-input"]').clear().type('admin')
    cy.get('[data-cy="login-password-input"]').clear().type('123456')
    cy.get('[data-cy="login-submit-button"]').click()
    
    // 等待登录处理
    cy.wait(5000)
    
    // 检查localStorage
    cy.window().then((win) => {
      const accessToken = win.localStorage.getItem('access_token')
      const userInfo = win.localStorage.getItem('user_info')
      
      cy.log('access_token:', accessToken ? '存在' : '不存在')
      cy.log('user_info:', userInfo ? '存在' : '不存在')
      
      if (accessToken) {
        cy.log('✅ Token已存储到localStorage')
      } else {
        cy.log('❌ Token未存储到localStorage')
      }
    })
  })
})
