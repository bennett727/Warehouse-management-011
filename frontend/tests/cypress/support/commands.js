// 优化后的登录命令 - 支持session缓存和快速验证
Cypress.Commands.add('login', (username, password) => {
  const user = username || 'admin'
  const pass = password || '123456'
  const sessionKey = `session_${user}`
  
  // 检查是否启用session缓存
  const cacheEnabled = Cypress.env('SESSION_CACHE_ENABLED') !== false
  
  if (cacheEnabled) {
    cy.session(sessionKey, () => {
      performLogin(user, pass)
    }, {
      validate: () => {
        // 快速验证session有效性 - 检查localStorage中的access_token
        cy.window().then((win) => {
          const token = win.localStorage.getItem('access_token')
          expect(token).to.exist
          expect(token).to.not.be.empty
        })
      },
      cacheAcrossSpecs: true
    })
  } else {
    performLogin(user, pass)
  }
})

// 提取登录逻辑为独立函数
function performLogin(username, password) {
  cy.visit('/login')
  cy.get('[data-cy="login-username-input"]').should('be.visible')
  cy.get('[data-cy="login-username-input"]').clear().type(username)
  cy.get('[data-cy="login-password-input"]').clear().type(password)
  cy.get('[data-cy="login-submit-button"]').click()
  
  // 等待登录成功 - 使用更精确的条件
  cy.url({ timeout: 15000 }).should('not.include', '/login')
  cy.get('.el-loading-mask', { timeout: 5000 }).should('not.exist')
  
  // 等待token被存储并验证token不为空
  cy.window().then((win) => {
    const token = win.localStorage.getItem('access_token')
    expect(token).to.exist
    expect(token).to.not.be.empty
  })
}

// 快速登录 - 使用API直接获取token，跳过UI操作
Cypress.Commands.add('loginByApi', (username, password) => {
  const user = username || 'admin'
  const pass = password || '123456'

  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { username: user, password: pass },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(200)
    const token = response.body.data?.accessToken || response.body.data?.token
    expect(token).to.exist
    
    // 设置token到localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('access_token', token)
    })
    
    // 设置到cookie以保持兼容性
    cy.setCookie('auth_token', token)
  })
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.get('[data-cy="logout-button"]').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(path)
  cy.url().should('include', path)
})

Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`)
})

Cypress.Commands.add('verifyDownload', (pattern) => {
  cy.verifyDownload(pattern, { timeout: 10000 })
})

Cypress.Commands.add('confirmDialog', () => {
  cy.get('[data-cy="confirm-dialog"]').should('be.visible')
  cy.get('[data-cy="confirm-button"]').click()
})

Cypress.Commands.add('cancelDialog', () => {
  cy.get('[data-cy="confirm-dialog"]').should('be.visible')
  cy.get('[data-cy="cancel-button"]').click()
})

Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach((key) => {
    cy.get(`[data-cy="${key}"]`).clear().type(formData[key])
  })
})

Cypress.Commands.add('selectOption', (selector, optionText) => {
  cy.get(selector).click()
  cy.get('.el-select-dropdown__item').contains(optionText).click()
})

Cypress.Commands.add('checkNotification', (message) => {
  cy.get('.el-notification').should('be.visible')
  cy.get('.el-notification').should('contain', message)
})

Cypress.Commands.add('waitForLoading', () => {
  cy.get('.el-loading-mask').should('be.visible')
  cy.get('.el-loading-mask').should('not.exist')
})

Cypress.Commands.add('clickTableRowAction', (rowIndex, action) => {
  cy.get('tbody tr').eq(rowIndex).within(() => {
    cy.get(`[data-cy="${action}-button"]`).click()
  })
})

Cypress.Commands.add('searchAndVerify', (searchInput, searchTerm, tableSelector) => {
  cy.get(searchInput).clear().type(searchTerm)
  cy.get('[data-cy="search-button"]').click()
  cy.get(tableSelector).should('be.visible')
})

Cypress.Commands.add('getByCy', (selector, options = {}) => {
  return cy.get(`[data-cy="${selector}"]`, options)
})

Cypress.Commands.add('findByCy', (selector, options = {}) => {
  return cy.find(`[data-cy="${selector}"]`, options)
})

Cypress.Commands.add('containsByCy', (text, options = {}) => {
  return cy.contains(`[data-cy]`, text, options)
})
