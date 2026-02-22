class ApiDataProvider {
  constructor() {
    this.baseUrl = Cypress.env('apiUrl') || 'http://localhost:8080/api'
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000
  }

  async getAuthToken() {
    const cacheKey = 'auth_token'
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data
      }
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
      const token = response.body.data.token
      this.cache.set(cacheKey, { data: token, timestamp: Date.now() })
      return token
    }
    throw new Error('Failed to get auth token')
  }

  async getRealDevices(options = {}) {
    const { page = 0, size = 10, ...filters } = options
    
    const response = await cy.request({
      method: 'GET',
      url: `${this.baseUrl}/devices`,
      qs: { page, size, ...filters },
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data) {
      return response.body.data.content || response.body.data
    }
    return []
  }

  async getRealInboundOrders(options = {}) {
    const { page = 0, size = 10, ...filters } = options
    
    const response = await cy.request({
      method: 'GET',
      url: `${this.baseUrl}/stock-orders`,
      qs: { page, size, type: 'INBOUND', ...filters },
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data) {
      return response.body.data.content || response.body.data
    }
    return []
  }

  async getRealOutboundOrders(options = {}) {
    const { page = 0, size = 10, ...filters } = options
    
    const response = await cy.request({
      method: 'GET',
      url: `${this.baseUrl}/stock-orders`,
      qs: { page, size, type: 'OUTBOUND', ...filters },
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data) {
      return response.body.data.content || response.body.data
    }
    return []
  }

  async getRealUsers(options = {}) {
    const response = await cy.request({
      method: 'GET',
      url: `${this.baseUrl}/users`,
      qs: options,
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      failOnStatusCode: false
    })

    if (response.status === 200 && response.body.data) {
      return response.body.data.content || response.body.data
    }
    return []
  }

  validateData(data, rules) {
    const errors = []
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${field}' is required but missing`)
      }
      
      if (value !== undefined && value !== null) {
        if (rule.type && typeof value !== rule.type) {
          errors.push(`Field '${field}' should be of type ${rule.type}`)
        }
        
        if (rule.minLength && String(value).length < rule.minLength) {
          errors.push(`Field '${field}' should have minimum length of ${rule.minLength}`)
        }
        
        if (rule.maxLength && String(value).length > rule.maxLength) {
          errors.push(`Field '${field}' should have maximum length of ${rule.maxLength}`)
        }
        
        if (rule.pattern && !rule.pattern.test(String(value))) {
          errors.push(`Field '${field}' does not match required pattern`)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

const apiDataProvider = new ApiDataProvider()

Cypress.Commands.add('getRealDevices', (options = {}) => {
  return cy.wrap(apiDataProvider.getRealDevices(options))
})

Cypress.Commands.add('getRealInboundOrders', (options = {}) => {
  return cy.wrap(apiDataProvider.getRealInboundOrders(options))
})

Cypress.Commands.add('getRealOutboundOrders', (options = {}) => {
  return cy.wrap(apiDataProvider.getRealOutboundOrders(options))
})

Cypress.Commands.add('getRealUsers', (options = {}) => {
  return cy.wrap(apiDataProvider.getRealUsers(options))
})

Cypress.Commands.add('validateApiData', (data, rules) => {
  return cy.wrap(apiDataProvider.validateData(data, rules))
})

export default apiDataProvider
