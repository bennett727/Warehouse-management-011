/**
 * @file: e2e.js
 * @description: Cypress E2E测试支持文件 - 增强版
 * @author: AI架构专家
 * @createTime: 2026-02-24
 */

// 导入原有命令
import './commands'
import './api-data-provider'
import './test-data-manager'
import './optimized-data-cache'
import './java-test-data-commands'

// 导入增强版命令
import './enhanced-commands'

// 导入环境验证器
import './test-env-validator'

// 导入配置
import { validateConfig, printConfig } from '../config/test-config.js'

// 忽略未捕获的异常
Cypress.on('uncaught:exception', (err, runnable) => {
  console.warn('未捕获的异常:', err.message)
  return false
})

// 全局配置验证 - 在所有测试开始前执行
before(() => {
  cy.log('════════════════════════════════════════════════════════════')
  cy.log('🚀 开始执行E2E测试套件')
  cy.log('════════════════════════════════════════════════════════════')

  // 验证配置
  const validation = validateConfig()
  if (!validation.valid) {
    throw new Error(`配置验证失败: ${validation.errors.join(', ')}`)
  }

  // 打印配置信息
  printConfig()

  // 清理所有session和缓存
  cy.clearAllSessions()

  // 尝试预加载测试数据（如果命令存在）
  if (Cypress.Commands.hasOwnProperty('preloadTestData')) {
    cy.preloadTestData().then(() => {
      cy.log('✅ 测试数据预加载完成')
    }).catch((err) => {
      cy.log(`⚠️ 测试数据预加载失败: ${err.message}`)
    })
  } else {
    cy.log('ℹ️ 预加载测试数据命令不可用，跳过')
  }
})

// 每个测试前的设置
beforeEach(() => {
  // 设置视口大小
  cy.viewport(1280, 720)

  // 验证登录状态（如果测试需要认证）
  const testTitle = Cypress.currentTest?.title || ''
  if (!testTitle.includes('登录') && !testTitle.includes('login')) {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token')
      if (token) {
        cy.log('✅ 检测到已登录状态')
      }
    })
  }
})

// 每个测试后的清理
afterEach(() => {
  // 截图（仅失败时）
  const testState = Cypress.currentTest?.state
  if (testState === 'failed') {
    cy.screenshot({ capture: 'viewport' })
  }
})

// 所有测试后的清理
after(() => {
  cy.log('════════════════════════════════════════════════════════════')
  cy.log('🧹 执行测试后清理...')
  cy.log('════════════════════════════════════════════════════════════')

  // 尝试清理测试数据（如果命令存在）
  if (Cypress.Commands.hasOwnProperty('cleanupAllTestData')) {
    cy.cleanupAllTestData().then(() => {
      cy.log('✅ 测试数据清理完成')
    }).catch((err) => {
      cy.log(`⚠️ 测试数据清理失败: ${err.message}`)
    })
  } else {
    cy.log('ℹ️ 清理测试数据命令不可用，跳过')
  }

  // 清理所有session
  cy.clearAllSessions()

  cy.log('════════════════════════════════════════════════════════════')
  cy.log('✅ E2E测试套件执行完成')
  cy.log('════════════════════════════════════════════════════════════')
})

// 测试失败事件处理
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    console.error(`❌ 测试失败: ${test.title}`)
    console.error(`错误信息: ${test.err?.message}`)
    console.error(`堆栈: ${test.err?.stack}`)
  } else if (test.state === 'passed') {
    console.log(`✅ 测试通过: ${test.title}`)
  }
})

// 命令重试事件
Cypress.on('command:retry', (options) => {
  console.warn(`⚠️ 命令重试: ${options.name}`)
})

// 全局失败处理
Cypress.on('fail', (error, runnable) => {
  console.error('❌ 测试失败:', error.message)
  console.error('测试:', runnable.title)
  throw error
})

// 请求失败处理
Cypress.on('request:failed', (request) => {
  console.error(`❌ 请求失败: ${request.method} ${request.url}`)
})

// 页面加载错误处理
Cypress.on('window:load', (win) => {
  // 监听页面错误
  win.addEventListener('error', (event) => {
    console.error('页面错误:', event.error)
  })

  // 监听未处理的Promise拒绝
  win.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
  })
})

// 自定义日志格式
Cypress.Commands.overwrite('log', (originalFn, message, ...args) => {
  const timestamp = new Date().toISOString()
  const formattedMessage = `[${timestamp}] ${message}`
  return originalFn(formattedMessage, ...args)
})

// 导出配置验证函数
export { validateConfig, printConfig }
