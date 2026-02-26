class TestDataManager {
  constructor() {
    this.baseUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
    this.testDataPrefix = 'TEST_DATA_'
    this.createdResources = new Map()
  }

  async getAuthToken() {
    const response = await cy.request({
      method: 'POST',
      url: `${this.baseUrl}/auth/login`,
      body: {
        username: 'admin',
        password: '123456'
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data?.token) {
      return response.body.data.token
    }
    throw new Error('Failed to get auth token')
  }

  async createTestDevice(deviceData = {}) {
    const token = await this.getAuthToken()
    const defaultDevice = {
      deviceCode: `${this.testDataPrefix}DEVICE_${Date.now()}`,
      deviceName: `测试设备_${Date.now()}`,
      deviceType: '测试类型',
      status: 'ACTIVE',
      ...deviceData
    }

    const response = await cy.request({
      method: 'POST',
      url: `${this.baseUrl}/devices`,
      headers: { 'Authorization': `Bearer ${token}` },
      body: defaultDevice,
      failOnStatusCode: false
    })

    if (response.status === 200 || response.status === 201) {
      const deviceId = response.body.data?.id || response.body.data
      this.createdResources.set(`device_${deviceId}`, deviceId)
      return { ...defaultDevice, id: deviceId }
    }
    return null
  }

  async createTestInboundOrder(orderData = {}) {
    const token = await this.getAuthToken()
    const defaultOrder = {
      orderNo: `${this.testDataPrefix}IN_${Date.now()}`,
      type: 'INBOUND',
      status: 'PENDING',
      ...orderData
    }

    const response = await cy.request({
      method: 'POST',
      url: `${this.baseUrl}/stock-orders`,
      headers: { 'Authorization': `Bearer ${token}` },
      body: defaultOrder,
      failOnStatusCode: false
    })

    if (response.status === 200 || response.status === 201) {
      const orderId = response.body.data?.id || response.body.data
      this.createdResources.set(`order_${orderId}`, orderId)
      return { ...defaultOrder, id: orderId }
    }
    return null
  }

  async createTestOutboundOrder(orderData = {}) {
    const token = await this.getAuthToken()
    const defaultOrder = {
      orderNo: `${this.testDataPrefix}OUT_${Date.now()}`,
      type: 'OUTBOUND',
      status: 'PENDING',
      ...orderData
    }

    const response = await cy.request({
      method: 'POST',
      url: `${this.baseUrl}/stock-orders`,
      headers: { 'Authorization': `Bearer ${token}` },
      body: defaultOrder,
      failOnStatusCode: false
    })

    if (response.status === 200 || response.status === 201) {
      const orderId = response.body.data?.id || response.body.data
      this.createdResources.set(`order_${orderId}`, orderId)
      return { ...defaultOrder, id: orderId }
    }
    return null
  }

  async createTestUser(userData = {}) {
    const token = await this.getAuthToken()
    const defaultUser = {
      username: `${this.testDataPrefix}USER_${Date.now()}`,
      password: 'Test@123456',
      email: `test_${Date.now()}@test.com`,
      role: 'OPERATOR',
      ...userData
    }

    const response = await cy.request({
      method: 'POST',
      url: `${this.baseUrl}/users`,
      headers: { 'Authorization': `Bearer ${token}` },
      body: defaultUser,
      failOnStatusCode: false
    })

    if (response.status === 200 || response.status === 201) {
      const userId = response.body.data?.id || response.body.data
      this.createdResources.set(`user_${userId}`, userId)
      return { ...defaultUser, id: userId }
    }
    return null
  }

  async cleanupTestDevice(deviceId) {
    const token = await this.getAuthToken()
    await cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}/devices/${deviceId}`,
      headers: { 'Authorization': `Bearer ${token}` },
      failOnStatusCode: false
    })
    this.createdResources.delete(`device_${deviceId}`)
  }

  async cleanupTestOrder(orderId) {
    const token = await this.getAuthToken()
    await cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}/stock-orders/${orderId}`,
      headers: { 'Authorization': `Bearer ${token}` },
      failOnStatusCode: false
    })
    this.createdResources.delete(`order_${orderId}`)
  }

  async cleanupTestUser(userId) {
    const token = await this.getAuthToken()
    await cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}/users/${userId}`,
      headers: { 'Authorization': `Bearer ${token}` },
      failOnStatusCode: false
    })
    this.createdResources.delete(`user_${userId}`)
  }

  async cleanupAllTestData() {
    const token = await this.getAuthToken()
    
    for (const [key, id] of this.createdResources) {
      try {
        let endpoint = ''
        if (key.startsWith('device_')) {
          endpoint = `${this.baseUrl}/devices/${id}`
        } else if (key.startsWith('order_')) {
          endpoint = `${this.baseUrl}/stock-orders/${id}`
        } else if (key.startsWith('user_')) {
          endpoint = `${this.baseUrl}/users/${id}`
        }
        
        if (endpoint) {
          await cy.request({
            method: 'DELETE',
            url: endpoint,
            headers: { 'Authorization': `Bearer ${token}` },
            failOnStatusCode: false
          })
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${key}:`, error.message)
      }
    }
    
    this.createdResources.clear()
  }

  async cleanupTestDataByPrefix(prefix = this.testDataPrefix) {
    const token = await this.getAuthToken()
    
    const endpoints = [
      { url: `${this.baseUrl}/devices`, resource: 'device' },
      { url: `${this.baseUrl}/stock-orders`, resource: 'order' },
      { url: `${this.baseUrl}/users`, resource: 'user' }
    ]
    
    for (const { url, resource } of endpoints) {
      try {
        const response = await cy.request({
          method: 'GET',
          url: url,
          headers: { 'Authorization': `Bearer ${token}` },
          failOnStatusCode: false
        })
        
        if (response.status === 200 && response.body.data) {
          const items = response.body.data.content || response.body.data
          for (const item of items) {
            const nameField = item.deviceCode || item.orderNo || item.username || ''
            if (nameField.startsWith(prefix)) {
              await cy.request({
                method: 'DELETE',
                url: `${url}/${item.id}`,
                headers: { 'Authorization': `Bearer ${token}` },
                failOnStatusCode: false
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${resource}s:`, error.message)
      }
    }
  }

  getCreatedResources() {
    return Array.from(this.createdResources.entries())
  }

  getResourceCount() {
    return this.createdResources.size
  }
}

const testDataManager = new TestDataManager()

Cypress.Commands.add('createTestDevice', (deviceData = {}) => {
  return cy.wrap(testDataManager.createTestDevice(deviceData))
})

Cypress.Commands.add('createTestInboundOrder', (orderData = {}) => {
  return cy.wrap(testDataManager.createTestInboundOrder(orderData))
})

Cypress.Commands.add('createTestOutboundOrder', (orderData = {}) => {
  return cy.wrap(testDataManager.createTestOutboundOrder(orderData))
})

Cypress.Commands.add('createTestUser', (userData = {}) => {
  return cy.wrap(testDataManager.createTestUser(userData))
})

Cypress.Commands.add('cleanupTestDevice', (deviceId) => {
  return cy.wrap(testDataManager.cleanupTestDevice(deviceId))
})

Cypress.Commands.add('cleanupTestOrder', (orderId) => {
  return cy.wrap(testDataManager.cleanupTestOrder(orderId))
})

Cypress.Commands.add('cleanupTestUser', (userId) => {
  return cy.wrap(testDataManager.cleanupTestUser(userId))
})

Cypress.Commands.add('cleanupAllTestData', () => {
  return cy.wrap(testDataManager.cleanupAllTestData())
})

Cypress.Commands.add('cleanupTestDataByPrefix', (prefix) => {
  return cy.wrap(testDataManager.cleanupTestDataByPrefix(prefix))
})

export default testDataManager
