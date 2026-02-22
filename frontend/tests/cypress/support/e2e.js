import './commands'
import './api-data-provider'
import './test-data-manager'
import './optimized-data-cache'
import './java-test-data-commands'

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})

// 全局数据预加载 - 只在所有测试开始前执行一次
before(() => {
  cy.preloadTestData()
})

beforeEach(() => {
  cy.viewport(1280, 720)
})

afterEach(() => {
  cy.screenshot({ capture: 'viewport' })
})

after(() => {
  cy.cleanupAllTestData().then(() => {
    cy.log('测试数据清理完成')
  }).catch((err) => {
    cy.log(`测试数据清理失败: ${err.message}`)
  })
})

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    console.log(`Test failed: ${test.title}`)
    console.log(`Error: ${test.err?.message}`)
  }
})

Cypress.on('command:retry', (options) => {
  console.log(`Retrying command: ${options.name}`)
})

Cypress.on('fail', (error, runnable) => {
  console.error('Test failed:', error)
  console.error('Runnable:', runnable)
})
