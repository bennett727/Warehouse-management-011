/**
 * @file: test-env-validator.js
 * @description: 测试环境验证脚本 - 确保测试环境配置正确
 * @author: AI架构专家
 * @createTime: 2026-02-24
 */

import { validateConfig, getTestAccount, getApiUrl } from '../config/test-config.js'

/**
 * 测试环境验证器
 */
class TestEnvironmentValidator {
  constructor() {
    this.validationResults = []
    this.errors = []
    this.warnings = []
  }

  /**
   * 验证测试环境
   */
  async validateEnvironment() {
    cy.log('╔════════════════════════════════════════════════════════════╗')
    cy.log('║           测试环境验证开始                                 ║')
    cy.log('╚════════════════════════════════════════════════════════════╝')

    // 1. 验证配置
    await this.validateConfiguration()

    // 2. 验证后端服务
    await this.validateBackendService()

    // 3. 验证前端服务
    await this.validateFrontendService()

    // 4. 验证数据库连接
    await this.validateDatabaseConnection()

    // 5. 验证测试账号
    await this.validateTestAccounts()

    // 6. 验证API端点
    await this.validateApiEndpoints()

    // 打印验证结果
    this.printValidationResults()

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      results: this.validationResults
    }
  }

  /**
   * 验证配置
   */
  async validateConfiguration() {
    cy.log('\n📋 验证配置...')

    const validation = validateConfig()

    this.validationResults.push({
      name: '配置验证',
      status: validation.valid ? '通过' : '失败',
      details: validation
    })

    if (!validation.valid) {
      this.errors.push(...validation.errors)
    }

    if (validation.warnings.length > 0) {
      this.warnings.push(...validation.warnings)
    }

    cy.log(`✅ 配置验证: ${validation.valid ? '通过' : '失败'}`)
  }

  /**
   * 验证后端服务
   */
  async validateBackendService() {
    cy.log('\n🔌 验证后端服务...')

    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
    const healthUrl = `${apiUrl}/health`

    try {
      const response = await cy.request({
        method: 'GET',
        url: healthUrl,
        failOnStatusCode: false,
        timeout: 10000
      })

      const isHealthy = response.status === 200

      this.validationResults.push({
        name: '后端服务',
        status: isHealthy ? '通过' : '失败',
        url: healthUrl,
        statusCode: response.status
      })

      if (!isHealthy) {
        this.errors.push(`后端服务健康检查失败: HTTP ${response.status}`)
      }

      cy.log(`✅ 后端服务: ${isHealthy ? '运行中' : '不可用'}`)
    } catch (error) {
      this.validationResults.push({
        name: '后端服务',
        status: '失败',
        error: error.message
      })
      this.errors.push(`后端服务连接失败: ${error.message}`)
      cy.log(`❌ 后端服务连接失败: ${error.message}`)
    }
  }

  /**
   * 验证前端服务
   */
  async validateFrontendService() {
    cy.log('\n🌐 验证前端服务...')

    const baseUrl = Cypress.config('baseUrl') || 'http://localhost:5173'

    try {
      const response = await cy.request({
        method: 'GET',
        url: baseUrl,
        failOnStatusCode: false,
        timeout: 10000
      })

      const isAvailable = response.status === 200

      this.validationResults.push({
        name: '前端服务',
        status: isAvailable ? '通过' : '失败',
        url: baseUrl,
        statusCode: response.status
      })

      if (!isAvailable) {
        this.errors.push(`前端服务不可用: HTTP ${response.status}`)
      }

      cy.log(`✅ 前端服务: ${isAvailable ? '运行中' : '不可用'}`)
    } catch (error) {
      this.validationResults.push({
        name: '前端服务',
        status: '失败',
        error: error.message
      })
      this.errors.push(`前端服务连接失败: ${error.message}`)
      cy.log(`❌ 前端服务连接失败: ${error.message}`)
    }
  }

  /**
   * 验证数据库连接
   */
  async validateDatabaseConnection() {
    cy.log('\n🗄️ 验证数据库连接...')

    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
    const dbHealthUrl = `${apiUrl}/health/db`

    try {
      const response = await cy.request({
        method: 'GET',
        url: dbHealthUrl,
        failOnStatusCode: false,
        timeout: 10000
      })

      const isConnected = response.status === 200 && response.body?.data?.database === 'connected'

      this.validationResults.push({
        name: '数据库连接',
        status: isConnected ? '通过' : '失败',
        details: response.body?.data
      })

      if (!isConnected) {
        this.warnings.push('数据库连接可能存在问题')
      }

      cy.log(`✅ 数据库连接: ${isConnected ? '正常' : '异常'}`)
    } catch (error) {
      this.validationResults.push({
        name: '数据库连接',
        status: '警告',
        error: error.message
      })
      this.warnings.push(`数据库健康检查失败: ${error.message}`)
      cy.log(`⚠️ 数据库健康检查失败: ${error.message}`)
    }
  }

  /**
   * 验证测试账号
   */
  async validateTestAccounts() {
    cy.log('\n👤 验证测试账号...')

    const accountTypes = ['admin', 'operator', 'technician', 'viewer']
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
    const loginUrl = `${apiUrl}/auth/login`

    for (const type of accountTypes) {
      try {
        const account = getTestAccount(type)

        const response = await cy.request({
          method: 'POST',
          url: loginUrl,
          body: {
            username: account.username,
            password: account.password
          },
          failOnStatusCode: false,
          timeout: 10000
        })

        const isValid = response.status === 200 && response.body?.success === true

        this.validationResults.push({
          name: `测试账号: ${type}`,
          status: isValid ? '通过' : '失败',
          username: account.username,
          statusCode: response.status
        })

        if (!isValid) {
          this.errors.push(`测试账号 ${type} (${account.username}) 验证失败`)
        }

        cy.log(`✅ 测试账号 ${type}: ${isValid ? '有效' : '无效'}`)
      } catch (error) {
        this.validationResults.push({
          name: `测试账号: ${type}`,
          status: '失败',
          error: error.message
        })
        this.errors.push(`测试账号 ${type} 验证异常: ${error.message}`)
        cy.log(`❌ 测试账号 ${type} 验证异常: ${error.message}`)
      }
    }
  }

  /**
   * 验证API端点
   */
  async validateApiEndpoints() {
    cy.log('\n🔌 验证API端点...')

    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'

    const endpoints = [
      { path: '/auth/login', method: 'POST', required: true },
      { path: '/users', method: 'GET', required: true },
      { path: '/devices', method: 'GET', required: true },
      { path: '/inventory', method: 'GET', required: true },
      { path: '/stock-orders', method: 'GET', required: true }
    ]

    // 先登录获取token
    let token = null
    try {
      const admin = getTestAccount('admin')
      const loginResponse = await cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {
          username: admin.username,
          password: admin.password
        },
        failOnStatusCode: false
      })

      if (loginResponse.status === 200 && loginResponse.body?.data?.token) {
        token = loginResponse.body.data.token
      }
    } catch (error) {
      cy.log('⚠️ 无法获取测试token，某些端点验证可能失败')
    }

    for (const endpoint of endpoints) {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        const url = `${apiUrl}${endpoint.path}`

        const response = await cy.request({
          method: endpoint.method,
          url: url,
          headers: headers,
          failOnStatusCode: false,
          timeout: 10000
        })

        const isAvailable = response.status < 500 // 只要不是服务器错误就算可用

        this.validationResults.push({
          name: `API端点: ${endpoint.method} ${endpoint.path}`,
          status: isAvailable ? '通过' : '失败',
          statusCode: response.status,
          required: endpoint.required
        })

        if (!isAvailable && endpoint.required) {
          this.errors.push(`API端点 ${endpoint.path} 不可用: HTTP ${response.status}`)
        }

        cy.log(`✅ API端点 ${endpoint.path}: ${isAvailable ? '可用' : '不可用'}`)
      } catch (error) {
        this.validationResults.push({
          name: `API端点: ${endpoint.method} ${endpoint.path}`,
          status: '失败',
          error: error.message
        })

        if (endpoint.required) {
          this.errors.push(`API端点 ${endpoint.path} 验证异常: ${error.message}`)
        }

        cy.log(`❌ API端点 ${endpoint.path} 验证异常: ${error.message}`)
      }
    }
  }

  /**
   * 打印验证结果
   */
  printValidationResults() {
    cy.log('\n╔════════════════════════════════════════════════════════════╗')
    cy.log('║           测试环境验证结果                                 ║')
    cy.log('╚════════════════════════════════════════════════════════════╝')

    // 统计
    const passed = this.validationResults.filter(r => r.status === '通过').length
    const failed = this.validationResults.filter(r => r.status === '失败').length
    const warnings = this.validationResults.filter(r => r.status === '警告').length

    cy.log(`\n验证统计:`)
    cy.log(`  ✅ 通过: ${passed}`)
    cy.log(`  ❌ 失败: ${failed}`)
    cy.log(`  ⚠️ 警告: ${warnings}`)
    cy.log(`  📊 总计: ${this.validationResults.length}`)

    // 错误详情
    if (this.errors.length > 0) {
      cy.log('\n❌ 错误列表:')
      this.errors.forEach((error, index) => {
        cy.log(`  ${index + 1}. ${error}`)
      })
    }

    // 警告详情
    if (this.warnings.length > 0) {
      cy.log('\n⚠️ 警告列表:')
      this.warnings.forEach((warning, index) => {
        cy.log(`  ${index + 1}. ${warning}`)
      })
    }

    // 总体结果
    const overallStatus = this.errors.length === 0 ? '通过' : '失败'
    cy.log(`\n总体结果: ${overallStatus === '通过' ? '✅' : '❌'} ${overallStatus}`)
    cy.log('════════════════════════════════════════════════════════════')

    return overallStatus === '通过'
  }
}

// 创建验证器实例
const validator = new TestEnvironmentValidator()

// Cypress命令
Cypress.Commands.add('validateTestEnvironment', () => {
  return validator.validateEnvironment()
})

Cypress.Commands.add('checkTestEnvironment', () => {
  return cy.validateTestEnvironment().then((result) => {
    if (!result.success) {
      throw new Error(`测试环境验证失败: ${result.errors.join(', ')}`)
    }
    cy.log('✅ 测试环境验证通过')
  })
})

// 导出验证器
export { TestEnvironmentValidator, validator }
export default validator
