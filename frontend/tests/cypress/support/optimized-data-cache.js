/**
 * 优化后的全局数据缓存系统
 * 减少重复API调用，提高测试执行效率
 */

class OptimizedDataCache {
  constructor() {
    this.cache = new Map()
    this.baseUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
    this.token = null
    this.tokenExpiry = null
  }

  async getAuthToken() {
    const now = Date.now()
    if (this.token && this.tokenExpiry && now < this.tokenExpiry) {
      return this.token
    }

    const response = await cy.request({
      method: 'POST',
      url: `${this.baseUrl}/auth/login`,
      body: {
        username: 'admin',
        password: 'Admin@123456'
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data?.token) {
      this.token = response.body.data.token
      this.tokenExpiry = now + 25 * 60 * 1000 // 25分钟缓存
      return this.token
    }
    throw new Error('Failed to get auth token')
  }

  async fetchData(endpoint, options = {}, cacheKey = null) {
    const key = cacheKey || `${endpoint}_${JSON.stringify(options)}`
    
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.data
      }
    }

    const token = await this.getAuthToken()
    const response = await cy.request({
      method: 'GET',
      url: `${this.baseUrl}${endpoint}`,
      qs: options,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data) {
      const data = response.body.data.content || response.body.data
      this.cache.set(key, { data, timestamp: Date.now() })
      return data
    }
    return []
  }

  async getUsers(size = 10) {
    return this.fetchData('/users', { size }, `users_${size}`)
  }

  async getDevices(size = 10) {
    return this.fetchData('/devices', { size }, `devices_${size}`)
  }

  async getInboundOrders(size = 10) {
    return this.fetchData('/stock-orders', { size, type: 'INBOUND' }, `inbound_${size}`)
  }

  async getOutboundOrders(size = 10) {
    return this.fetchData('/stock-orders', { size, type: 'OUTBOUND' }, `outbound_${size}`)
  }

  clearCache() {
    this.cache.clear()
    this.token = null
    this.tokenExpiry = null
  }

  clearSpecificCache(key) {
    this.cache.delete(key)
  }
}

const dataCache = new OptimizedDataCache()

// 全局before钩子 - 只执行一次数据预加载
Cypress.Commands.add('preloadTestData', () => {
  cy.wrap(null).then(async () => {
    const [users, devices, inboundOrders, outboundOrders] = await Promise.all([
      dataCache.getUsers(10),
      dataCache.getDevices(10),
      dataCache.getInboundOrders(10),
      dataCache.getOutboundOrders(10)
    ])
    
    Cypress.env('cachedUsers', users)
    Cypress.env('cachedDevices', devices)
    Cypress.env('cachedInboundOrders', inboundOrders)
    Cypress.env('cachedOutboundOrders', outboundOrders)
    
    cy.log('测试数据预加载完成')
  })
})

// 获取缓存数据
Cypress.Commands.add('getCachedUsers', () => {
  return cy.wrap(Cypress.env('cachedUsers') || [])
})

Cypress.Commands.add('getCachedDevices', () => {
  return cy.wrap(Cypress.env('cachedDevices') || [])
})

Cypress.Commands.add('getCachedInboundOrders', () => {
  return cy.wrap(Cypress.env('cachedInboundOrders') || [])
})

Cypress.Commands.add('getCachedOutboundOrders', () => {
  return cy.wrap(Cypress.env('cachedOutboundOrders') || [])
})

// 清理缓存
Cypress.Commands.add('clearDataCache', () => {
  dataCache.clearCache()
  cy.log('数据缓存已清理')
})

export default dataCache
