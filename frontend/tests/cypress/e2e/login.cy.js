describe('登录功能测试', () => {
  let realUsers = []

  before(() => {
    cy.getRealUsers({ size: 10 }).then((users) => {
      realUsers = users
      cy.log(`获取到 ${users.length} 个真实用户`)
    })
  })

  beforeEach(() => {
    cy.visit('/login')
  })

  describe('登录页面基础功能', () => {
    it('应该显示登录页面', () => {
      cy.contains('小型仓库管理系统').should('be.visible')
      cy.contains('用户名').should('be.visible')
      cy.contains('密码').should('be.visible')
      cy.contains('登录').should('be.visible')
    })

    it('应该能够输入用户名和密码', () => {
      cy.get('[data-cy="login-username-input"]').clear().type('admin').should('have.value', 'admin')
      cy.get('[data-cy="login-password-input"]').clear().type('Admin@123456').should('have.value', 'Admin@123456')
    })

    it('应该显示记住我复选框', () => {
      cy.get('[data-cy="login-remember-checkbox"]').should('be.visible')
      cy.get('[data-cy="login-remember-checkbox"]').click()
      cy.get('[data-cy="login-remember-checkbox"] input[type="checkbox"]').should('be.checked')
    })

    it('应该显示登录按钮', () => {
      cy.get('[data-cy="login-submit-button"]').should('be.visible')
      cy.get('[data-cy="login-submit-button"]').should('contain', '登录')
    })
  })

  describe('使用真实用户数据登录', () => {
    it('应该能够使用管理员账号成功登录', () => {
      cy.get('[data-cy="login-username-input"]').clear().type('admin')
      cy.get('[data-cy="login-password-input"]').clear().type('Admin@123456')
      cy.get('[data-cy="login-submit-button"]').click()
      
      cy.url({ timeout: 20000 }).should('not.include', '/login')
      cy.url().should('include', '/dashboard')
      
      cy.contains('数据仪表盘', { timeout: 10000 }).should('be.visible')
    })

    it('应该验证真实用户数据的有效性', () => {
      expect(realUsers).to.be.an('array')
      
      if (realUsers.length > 0) {
        const firstUser = realUsers[0]
        
        cy.validateApiData(firstUser, {
          id: { required: true, type: 'number' },
          username: { required: true, type: 'string', minLength: 1 },
          email: { required: false, type: 'string' },
          status: { required: false, type: 'string' }
        }).then((validation) => {
          expect(validation.valid).to.be.true
          cy.log('用户数据结构验证通过')
        })
      }
    })
  })

  describe('登录验证和错误处理', () => {
    it('应该显示错误提示当使用错误密码', () => {
      cy.get('[data-cy="login-username-input"]').clear().type('admin')
      cy.get('[data-cy="login-password-input"]').clear().type('wrongpassword')
      cy.get('[data-cy="login-submit-button"]').click()
      
      cy.get('.el-message--error', { timeout: 10000 }).should('be.visible')
      cy.url().should('include', '/login')
    })

    it('应该显示错误提示当使用不存在的用户名', () => {
      cy.get('[data-cy="login-username-input"]').clear().type('nonexistentuser123')
      cy.get('[data-cy="login-password-input"]').clear().type('somepassword')
      cy.get('[data-cy="login-submit-button"]').click()
      
      cy.get('.el-message--error', { timeout: 10000 }).should('be.visible')
    })

    it('应该验证用户名和密码不能为空', () => {
      cy.get('[data-cy="login-submit-button"]').click()
      cy.get('.el-form-item__error', { timeout: 5000 }).should('exist')
    })
  })

  describe('登录状态持久化', () => {
    it('应该保持登录状态在页面刷新后', () => {
      cy.login('admin', 'Admin@123456')
      cy.reload()
      cy.url().should('not.include', '/login')
      cy.contains('数据仪表盘', { timeout: 10000 }).should('be.visible')
    })
  })
})
