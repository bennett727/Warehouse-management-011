const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      reportPageTitle: 'WMS E2E Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      reportDir: 'tests/cypress/reports',
      overwrite: false,
      html: true,
      json: true
    },
    retries: {
      runMode: 2,
      openMode: 0
    },
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    waitForAnimations: true,
    animationDistanceThreshold: 5,
    numTestsKeptInMemory: 5,
    experimentalMemoryManagement: true,
    experimentalRunAllSpecs: true,
    modifyObstructiveCode: true,
    chromeWebSecurity: false,
    trashAssetsBeforeRuns: true,
    testIsolation: true,
    // 启用并行执行配置
    experimentalStudio: true,
    // 环境变量配置 - 使用exposeInEnvironment替代不安全的allowCypressEnv
    env: {
      apiUrl: 'http://localhost:8080/api',
      testUser: 'admin',
      testPassword: 'Admin@123456',
      testDataPrefix: 'TEST_DATA_',
      // 并行执行配置
      ENABLE_PARALLEL: true,
      PARALLEL_WORKERS: 4,
      SESSION_CACHE_ENABLED: true,
      // 性能优化配置
      TEST_DATA_CACHE_TTL: 300000, // 5分钟缓存
      ENABLE_REQUEST_INTERCEPTION: false
    },
    // 并行执行配置
    experimentalWebKitSupport: true,
    // 优化内存使用
    experimentalModifyObstructiveThirdPartyCode: true,
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(data) {
          console.table(data)
          return null
        }
      })
      
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-extensions')
        }
        return launchOptions
      })
      
      return config
    }
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig: {
        configFile: 'config/vite.config.js'
      }
    },
    specPattern: 'tests/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/component.js'
  }
})
