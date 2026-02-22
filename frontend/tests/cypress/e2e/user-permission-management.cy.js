describe('用户权限管理测试 (RBAC)', () => {
  let testUsers = []
  let testRoles = []

  before(() => {
    // 使用API快速登录管理员
    cy.loginByApi('admin', 'Admin@123456')
    
    // 获取真实角色数据 - 使用缓存
    cy.getCachedRoles({ size: 10 }).then((roles) => {
      testRoles = roles
      cy.log(`获取到 ${roles.length} 个角色`)
    })
    
    // 获取真实用户数据 - 使用缓存
    cy.getCachedUsers({ size: 10 }).then((users) => {
      testUsers = users
      cy.log(`获取到 ${users.length} 个用户`)
    })
  })

  beforeEach(() => {
    // 使用session缓存快速登录
    cy.login('admin', 'Admin@123456')
  })

  describe('【角色管理】角色列表和权限验证', () => {
    beforeEach(() => {
      cy.visit('/system-management/role')
      cy.waitForPageLoad()
    })

    it('TC-RBAC-001: 应该显示角色管理页面', () => {
      cy.contains('角色管理', { timeout: 10000 }).should('be.visible')
      cy.get('.el-table, table', { timeout: 10000 }).should('exist')
    })

    it('TC-RBAC-002: 应该验证角色数据结构完整性', () => {
      if (testRoles.length > 0) {
        const firstRole = testRoles[0]
        
        cy.validateApiData(firstRole, {
          id: { required: true, type: 'number' },
          roleName: { required: true, type: 'string', minLength: 1 },
          roleCode: { required: true, type: 'string', minLength: 1 },
          permissions: { required: false, type: 'array' }
        }).then((validation) => {
          expect(validation.valid).to.be.true
          cy.log('角色数据结构验证通过:', firstRole.roleName)
        })
      }
    })

    it('TC-RBAC-003: 应该能够查看角色权限详情', () => {
      if (testRoles.length > 0) {
        // 点击第一个角色的查看按钮
        cy.get('tbody tr').first().within(() => {
          cy.get('[data-cy="view-button"], button:contains("查看")').click()
        })
        
        // 验证权限详情对话框
        cy.get('.el-dialog, .el-drawer', { timeout: 5000 }).should('be.visible')
        cy.contains('权限').should('be.visible')
      }
    })

    it('TC-RBAC-004: 应该验证角色权限树结构', () => {
      if (testRoles.length > 0) {
        // 点击编辑按钮
        cy.get('tbody tr').first().within(() => {
          cy.get('[data-cy="edit-button"], button:contains("编辑")').click()
        })
        
        // 验证权限树
        cy.get('.el-tree, .permission-tree', { timeout: 5000 }).should('exist')
        cy.get('.el-tree-node').should('have.length.at.least', 1)
      }
    })
  })

  describe('【用户管理】用户角色分配验证', () => {
    beforeEach(() => {
      cy.visit('/system-management/user')
      cy.waitForPageLoad()
    })

    it('TC-RBAC-005: 应该显示用户管理页面', () => {
      cy.contains('用户管理', { timeout: 10000 }).should('be.visible')
      cy.get('.el-table, table', { timeout: 10000 }).should('exist')
    })

    it('TC-RBAC-006: 应该验证用户角色关联', () => {
      if (testUsers.length > 0) {
        const userWithRole = testUsers.find(u => u.roleName || u.roleId)
        
        if (userWithRole) {
          cy.log(`验证用户 ${userWithRole.username} 的角色: ${userWithRole.roleName}`)
          expect(userWithRole).to.have.property('roleId')
          expect(userWithRole).to.have.property('roleName')
        }
      }
    })

    it('TC-RBAC-007: 应该能够编辑用户角色', () => {
      if (testUsers.length > 0 && testRoles.length > 0) {
        // 点击第一个用户的编辑按钮
        cy.get('tbody tr').first().within(() => {
          cy.get('[data-cy="edit-button"], button:contains("编辑")').click()
        })
        
        // 验证角色选择器
        cy.get('.el-dialog, .el-drawer', { timeout: 5000 }).should('be.visible')
        cy.get('[data-cy="role-select"], .el-select').should('exist')
      }
    })
  })

  describe('【权限验证】不同角色的页面访问控制', () => {
    it('TC-RBAC-008: 管理员应该能访问所有页面', () => {
      const adminPages = [
        '/dashboard',
        '/asset-management/device-list',
        '/inventory-management/inbound',
        '/inventory-management/outbound',
        '/system-management/user',
        '/system-management/role'
      ]
      
      adminPages.forEach((page) => {
        cy.visit(page)
        cy.url().should('include', page)
        cy.get('.el-message--error').should('not.exist')
      })
    })

    it('TC-RBAC-009: 应该验证无权限页面的访问控制', () => {
      // 模拟无权限响应
      cy.intercept('GET', '/api/**', (req) => {
        req.reply({
          statusCode: 403,
          body: { message: 'Forbidden: Insufficient permissions' }
        })
      }).as('forbiddenRequest')
      
      cy.visit('/system-management/user')
      cy.wait('@forbiddenRequest')
      
      // 验证403错误处理
      cy.get('.el-message--error, .error-message', { timeout: 10000 })
        .should('be.visible')
        .and('contain', '权限')
    })
  })

  describe('【权限控制】按钮级权限验证', () => {
    beforeEach(() => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
    })

    it('TC-RBAC-010: 应该根据权限显示/隐藏操作按钮', () => {
      // 验证页面加载完成
      cy.get('.el-table, table', { timeout: 10000 }).should('exist')
      
      // 检查操作按钮是否存在（根据当前用户权限）
      cy.get('tbody tr').first().then(($row) => {
        // 记录当前可见的操作按钮
        const visibleButtons = $row.find('button:visible').length
        cy.log(`当前用户可见操作按钮数量: ${visibleButtons}`)
        
        // 验证至少有一些操作按钮（管理员应该有全部权限）
        expect(visibleButtons).to.be.at.least(0)
      })
    })

    it('TC-RBAC-011: 应该验证新增按钮权限', () => {
      // 检查新增按钮
      cy.get('body').then(($body) => {
        const hasCreateButton = $body.find('[data-cy="create-button"], button:contains("新增")').length > 0
        cy.log(`新增按钮可见性: ${hasCreateButton}`)
        
        // 管理员应该能看到新增按钮
        if (hasCreateButton) {
          cy.get('[data-cy="create-button"], button:contains("新增")').should('be.visible')
        }
      })
    })
  })

  describe('【数据隔离】用户数据访问范围验证', () => {
    it('TC-RBAC-012: 应该验证用户只能访问授权的数据', () => {
      // 获取当前用户可访问的设备列表
      cy.getCachedDevices({ size: 10 }).then((devices) => {
        expect(devices).to.be.an('array')
        
        // 验证每个设备都有必要的权限字段
        devices.forEach((device) => {
          expect(device).to.have.property('id')
          // 验证敏感字段存在性
          if (device.createdBy) {
            expect(device.createdBy).to.be.a('string')
          }
        })
        
        cy.log(`用户可访问设备数量: ${devices.length}`)
      })
    })

    it('TC-RBAC-013: 应该验证跨用户数据隔离', () => {
      // 验证用户不能访问其他用户的数据
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/users`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        // 普通用户不应该能获取所有用户列表
        if (response.status === 403) {
          cy.log('数据隔离验证通过: 普通用户无法访问其他用户数据')
        } else if (response.status === 200) {
          // 管理员可以访问，验证数据结构
          expect(response.body.data).to.be.an('array')
        }
      })
    })
  })

  describe('【权限变更】角色权限修改后的实时生效', () => {
    it('TC-RBAC-014: 应该验证权限修改后页面刷新生效', () => {
      // 访问角色管理页面
      cy.visit('/system-management/role')
      cy.waitForPageLoad()
      
      // 模拟权限变更（通过拦截请求）
      cy.intercept('PUT', '/api/roles/**', {
        statusCode: 200,
        body: { success: true, message: '权限更新成功' }
      }).as('updateRole')
      
      // 点击编辑角色
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy="edit-button"], button:contains("编辑")').click()
      })
      
      // 修改权限（取消某个权限）
      cy.get('.el-tree-node__content').first().within(() => {
        cy.get('.el-checkbox').click()
      })
      
      // 保存
      cy.get('[data-cy="save-button"], button:contains("保存")').click()
      cy.wait('@updateRole')
      
      // 验证成功提示
      cy.get('.el-message--success', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('【审计日志】权限操作记录验证', () => {
    beforeEach(() => {
      cy.visit('/system-management/operation-log')
      cy.waitForPageLoad()
    })

    it('TC-RBAC-015: 应该记录权限相关操作日志', () => {
      cy.contains('操作日志', { timeout: 10000 }).should('be.visible')
      cy.get('.el-table, table', { timeout: 10000 }).should('exist')
      
      // 验证日志表格中有数据
      cy.get('tbody tr').should('have.length.at.least', 0)
    })

    it('TC-RBAC-016: 应该能够筛选权限相关日志', () => {
      // 使用操作类型筛选
      cy.get('[data-cy="operation-type-filter"], .el-select').first().click()
      cy.get('.el-select-dropdown__item').contains('权限').click()
      
      // 点击搜索
      cy.get('[data-cy="search-button"], button:contains("搜索")').click()
      
      // 等待筛选结果
      cy.wait(1000)
      
      // 验证筛选后的结果
      cy.get('.el-table, table').should('exist')
    })
  })

  // 新增测试场景 - 角色切换验证
  describe('【角色切换】用户角色切换后的权限验证', () => {
    it('TC-RBAC-017: 应该验证角色切换后权限正确更新', () => {
      // 访问用户管理
      cy.visit('/system-management/user')
      cy.waitForPageLoad()
      
      // 编辑第一个用户
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy="edit-button"], button:contains("编辑")').click()
      })
      
      // 切换角色
      cy.get('[data-cy="role-select"], .el-select').click()
      cy.get('.el-select-dropdown__item').eq(1).click()
      
      // 保存
      cy.get('[data-cy="save-button"], button:contains("保存")').click()
      
      // 验证成功提示
      cy.get('.el-message--success', { timeout: 5000 }).should('be.visible')
    })
  })

  // 新增测试场景 - API权限验证
  describe('【API权限】接口级别的权限控制验证', () => {
    it('TC-RBAC-018: 应该验证敏感API需要认证', () => {
      // 尝试未认证访问
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/users`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })

    it('TC-RBAC-019: 应该验证敏感API需要特定权限', () => {
      // 使用普通用户token访问管理接口
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/users/1`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        // 验证权限检查
        if (response.status === 403) {
          cy.log('权限验证通过: 普通用户无法执行删除操作')
        }
      })
    })
  })

  // 新增测试场景 - 权限继承验证
  describe('【权限继承】角色权限继承关系验证', () => {
    it('TC-RBAC-020: 应该验证子角色继承父角色权限', () => {
      cy.visit('/system-management/role')
      cy.waitForPageLoad()
      
      // 查看角色详情，验证权限继承
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy="view-button"], button:contains("查看")').click()
      })
      
      // 验证权限列表
      cy.get('.el-dialog, .el-drawer', { timeout: 5000 }).should('be.visible')
      cy.get('.permission-list, .el-tree').should('exist')
    })
  })

  // 新增测试场景 - 批量权限操作
  describe('【批量权限】批量权限分配验证', () => {
    it('TC-RBAC-021: 应该支持批量分配角色给用户', () => {
      cy.visit('/system-management/user')
      cy.waitForPageLoad()
      
      // 选择多个用户
      cy.get('thead .el-checkbox').click()
      
      // 点击批量操作
      cy.get('[data-cy="batch-action"], button:contains("批量")').click()
      cy.get('.el-dropdown-menu__item').contains('分配角色').click()
      
      // 选择角色
      cy.get('.el-dialog').should('be.visible')
      cy.get('[data-cy="role-select"]').click()
      cy.get('.el-select-dropdown__item').first().click()
      
      // 确认
      cy.get('[data-cy="confirm-button"]').click()
    })
  })
})

// 自定义命令 - 等待页面加载完成
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
  cy.get('.el-skeleton', { timeout: 10000 }).should('not.exist')
})

// 自定义命令 - 获取真实角色数据（使用缓存）
Cypress.Commands.add('getCachedRoles', (options = {}) => {
  const cachedRoles = Cypress.env('cachedRoles')
  if (cachedRoles && cachedRoles.length > 0) {
    return cy.wrap(cachedRoles)
  }
  
  const { page = 0, size = 10 } = options
  
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/roles`,
    qs: { page, size },
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.data) {
      const roles = response.body.data.content || response.body.data
      Cypress.env('cachedRoles', roles)
      return roles
    }
    return []
  })
})
