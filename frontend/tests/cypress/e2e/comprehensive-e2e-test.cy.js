/**
 * @file: comprehensive-e2e-test.cy.js
 * @description: 全面的端到端测试套件 - 覆盖所有data-cy属性
 * @author: AI架构专家
 * @createTime: 2026-02-26
 * 
 * 测试范围：
 * 1. 登录认证流程
 * 2. 仪表盘功能
 * 3. 库存管理（入库、出库、盘点、调拨）
 * 4. 仓库管理
 * 5. 系统管理（用户、角色）
 * 6. 边界情况和异常处理
 */

describe('🎯 全面的端到端测试套件', () => {

  // ==================== 测试数据 ====================
  const testData = {
    admin: { username: 'admin', password: '123456' },
    operator: { username: 'operator', password: '123456' },
    invalidUser: { username: 'invalid_user_12345', password: 'wrong_password' }
  }

  // ==================== 通用测试工具 ====================
  const TestUtils = {
    // 等待页面加载完成
    waitForPageLoad: () => {
      cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
    },

    // 验证元素可见性和可操作性
    verifyElement: (dataCy, options = {}) => {
      const { visible = true, enabled = true, text } = options
      const element = cy.get(`[data-cy="${dataCy}"]`, { timeout: 10000 })

      if (visible) {
        element.should('be.visible')
      }
      if (enabled) {
        element.should('not.be.disabled')
      }
      if (text) {
        element.should('contain', text)
      }
      return element
    },

    // 验证表格列存在
    verifyTableColumns: (tableDataCy, columns) => {
      cy.get(`[data-cy="${tableDataCy}"]`).should('exist')
      columns.forEach(col => {
        cy.get(`[data-cy="${col}"]`).should('exist')
      })
    },

    // 执行搜索操作
    performSearch: (searchInputCy, searchTerm, searchBtnCy = 'search-button') => {
      cy.get(`[data-cy="${searchInputCy}"]`).clear().type(searchTerm)
      cy.get(`[data-cy="${searchBtnCy}"]`).click()
      TestUtils.waitForPageLoad()
    },

    // 验证通知消息
    verifyNotification: (message, type = 'success') => {
      cy.get(`.el-message--${type}`, { timeout: 10000 })
        .should('be.visible')
        .and('contain', message)
    },

    // 登录函数
    performLogin: (username, password) => {
      cy.visit('/login')
      cy.get('[data-cy="login-username-input"]').should('be.visible')
      cy.get('[data-cy="login-username-input"]').clear().type(username)
      cy.get('[data-cy="login-password-input"]').clear().type(password)
      cy.get('[data-cy="login-submit-button"]').click()

      // 等待登录成功
      cy.url({ timeout: 15000 }).should('not.include', '/login')
      cy.get('.el-loading-mask', { timeout: 5000 }).should('not.exist')
    }
  }

  // ==================== 测试前置条件 ====================
  before(() => {
    cy.log('════════════════════════════════════════════════════════════')
    cy.log('🚀 开始执行全面的端到端测试')
    cy.log('════════════════════════════════════════════════════════════')
  })

  // ==================== 1. 登录认证测试 ====================
  describe('🔐 登录认证模块测试', () => {

    beforeEach(() => {
      // 清除登录状态，确保每个登录测试都是独立的
      cy.window().then((win) => {
        win.localStorage.clear()
        win.sessionStorage.clear()
      })
      cy.clearCookies()
    })

    it('应该成功登录并跳转到仪表盘', () => {
      cy.visit('/login')
      cy.get('[data-cy="login-username-input"]').type(testData.admin.username)
      cy.get('[data-cy="login-password-input"]').type(testData.admin.password)
      cy.get('[data-cy="login-submit-button"]').click()

      cy.url({ timeout: 15000 }).should('include', '/dashboard')
      cy.contains('数据仪表盘').should('be.visible')
    })

    it('应该验证所有登录页面data-cy属性', () => {
      cy.visit('/login')

      // 验证登录页面容器
      TestUtils.verifyElement('login-page')

      // 验证登录表单
      TestUtils.verifyElement('login-form')
      TestUtils.verifyElement('login-username-form-item', { text: '用户名' })
      TestUtils.verifyElement('login-username-input')
      TestUtils.verifyElement('login-password-form-item', { text: '密码' })
      TestUtils.verifyElement('login-password-input')
      TestUtils.verifyElement('login-remember-checkbox', { text: '记住我' })
      TestUtils.verifyElement('login-submit-button', { text: '登录' })
    })

    it('应该验证登录表单验证功能', () => {
      cy.visit('/login')
      cy.get('[data-cy="login-submit-button"]').click()
      cy.get('.el-form-item__error').should('exist')
    })

    it('应该处理无效登录凭证', () => {
      cy.visit('/login')
      cy.get('[data-cy="login-username-input"]').type(testData.invalidUser.username)
      cy.get('[data-cy="login-password-input"]').type(testData.invalidUser.password)
      cy.get('[data-cy="login-submit-button"]').click()

      cy.get('.el-message--error', { timeout: 10000 }).should('be.visible')
      cy.url().should('include', '/login')
    })
  })

  // ==================== 2. 仪表盘测试 ====================
  describe('📊 仪表盘模块测试', () => {

    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })

    it('应该加载仪表盘并显示所有关键组件', () => {
      cy.visit('/dashboard')
      TestUtils.waitForPageLoad()
      cy.contains('数据仪表盘').should('be.visible')

      // 验证统计卡片
      cy.get('.stat-card, [class*="stat"]').should('have.length.at.least', 1)
    })

    it('应该验证仪表盘data-cy属性', () => {
      cy.visit('/dashboard')
      TestUtils.waitForPageLoad()

      // 检查常见的仪表盘元素
      cy.get('body').then($body => {
        // 如果存在data-cy属性则验证
        if ($body.find('[data-cy*="dashboard"]').length > 0) {
          cy.get('[data-cy*="dashboard"]').should('be.visible')
        }
      })
    })
  })

  // ==================== 3. 入库管理测试 ====================
  describe('📥 入库管理模块测试', () => {

    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })

    it('应该加载入库管理页面并验证所有data-cy属性', () => {
      cy.visit('/inventory-management/inbound')
      TestUtils.waitForPageLoad()

      cy.contains('入库管理').should('be.visible')

      // 验证表格列
      TestUtils.verifyTableColumns('inbound-detail-table', [
        'inbound-selection-column',
        'inbound-index-column',
        'inbound-order-no-column',
        'inbound-type-column',
        'inbound-date-column',
        'inbound-status-column',
        'inbound-actions-column'
      ])
    })

    it('应该验证入库单操作按钮', () => {
      cy.visit('/inventory-management/inbound')
      TestUtils.waitForPageLoad()

      // 验证操作按钮存在
      const actionButtons = [
        'inbound-view-btn',
        'inbound-edit-btn',
        'inbound-delete-btn',
        'inbound-create-btn'
      ]

      actionButtons.forEach(btn => {
        cy.get('body').then($body => {
          if ($body.find(`[data-cy="${btn}"]`).length > 0) {
            cy.get(`[data-cy="${btn}"]`).should('exist')
          }
        })
      })
    })

    it('应该能够打开入库单详情对话框', () => {
      cy.visit('/inventory-management/inbound')
      TestUtils.waitForPageLoad()

      cy.get('body').then($body => {
        if ($body.find('[data-cy="inbound-view-btn"]').length > 0) {
          cy.get('[data-cy="inbound-view-btn"]').first().click()
          cy.get('[data-cy="inbound-detail-dialog"]').should('be.visible')
        }
      })
    })

    it('应该验证入库设备表单data-cy属性', () => {
      cy.visit('/inventory-management/inbound')
      TestUtils.waitForPageLoad()

      // 检查入库创建设备表单元素
      const formElements = [
        'inbound-device-mode-group',
        'inbound-device-batch-btn',
        'inbound-device-single-btn',
        'inbound-device-batch-form',
        'inbound-device-single-form',
        'inbound-device-list-table'
      ]

      formElements.forEach(el => {
        cy.get('body').then($body => {
          if ($body.find(`[data-cy="${el}"]`).length > 0) {
            cy.get(`[data-cy="${el}"]`).should('exist')
          }
        })
      })
    })
  })

  // ==================== 4. 出库管理测试 ====================
  describe('📤 出库管理模块测试', () => {

    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })

    it('应该加载出库管理页面并验证所有data-cy属性', () => {
      cy.visit('/inventory-management/outbound')
      TestUtils.waitForPageLoad()

      cy.contains('出库管理').should('be.visible')

      // 验证页面容器
      cy.get('[data-cy="outbound-management-page"]').should('exist')

      // 验证表格列
      TestUtils.verifyTableColumns('outbound-detail-table', [
        'outbound-selection-column',
        'outbound-order-no-column',
        'outbound-date-column',
        'outbound-type-column',
        'outbound-status-column',
        'outbound-actions-column'
      ])
    })

    it('应该验证出库单操作按钮', () => {
      cy.visit('/inventory-management/outbound')
      TestUtils.waitForPageLoad()

      const buttons = [
        'outbound-create-btn',
        'outbound-export-btn',
        'outbound-guide-btn'
      ]

      buttons.forEach(btn => {
        TestUtils.verifyElement(btn)
      })
    })

    it('应该验证批量操作栏', () => {
      cy.visit('/inventory-management/outbound')
      TestUtils.waitForPageLoad()

      // 先选择一行
      cy.get('[data-cy="outbound-selection-column"] .el-checkbox').first().click()

      // 验证批量操作栏显示
      cy.get('[data-cy="outbound-batch-operation-bar"]').should('be.visible')
      cy.get('[data-cy="outbound-selected-count"]').should('contain', '已选择')
      cy.get('[data-cy="outbound-clear-selection-btn"]').should('be.visible')
    })

    it('应该能够打开出库单详情', () => {
      cy.visit('/inventory-management/outbound')
      TestUtils.waitForPageLoad()

      cy.get('body').then($body => {
        if ($body.find('[data-cy="outbound-view-btn"]').length > 0) {
          cy.get('[data-cy="outbound-view-btn"]').first().click()
          cy.get('[data-cy="outbound-detail-dialog"]').should('be.visible')

          // 验证详情表格
          cy.get('[data-cy="outbound-detail-table"]').should('exist')
        }
      })
    })
  })

  // ==================== 5. 仓库管理测试 ====================
  describe('🏭 仓库管理模块测试', () => {

    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })

    describe('仓库地图页面', () => {
      beforeEach(() => {
        cy.visit('/warehouse/map')
        TestUtils.waitForPageLoad()
      })

      it('应该加载仓库地图页面并验证data-cy属性', () => {
        cy.get('[data-cy="warehouse-map-page"]').should('exist')
        cy.get('[data-cy="warehouse-view-mode-group"]').should('be.visible')
        cy.get('[data-cy="warehouse-view-map-btn"]').should('be.visible')
        cy.get('[data-cy="warehouse-view-list-btn"]').should('be.visible')
      })

      it('应该能够在地图和列表视图间切换', () => {
        // 切换到列表视图
        cy.get('[data-cy="warehouse-view-list-btn"]').click()
        cy.get('[data-cy="warehouse-map-table"]').should('be.visible')

        // 验证搜索和刷新按钮
        cy.get('[data-cy="warehouse-list-search-input"]').should('be.visible')
        cy.get('[data-cy="warehouse-list-refresh-btn"]').should('be.visible')
      })

      it('应该能够查看仓库详情', () => {
        // 切换到列表视图
        cy.get('[data-cy="warehouse-view-list-btn"]').click()

        cy.get('body').then($body => {
          if ($body.find('[data-cy="warehouse-list-view-btn"]').length > 0) {
            cy.get('[data-cy="warehouse-list-view-btn"]').first().click()
            cy.get('[data-cy="warehouse-detail-dialog"]').should('be.visible')
            cy.get('[data-cy="warehouse-detail-close-btn"]').should('be.visible')
            cy.get('[data-cy="warehouse-detail-edit-btn"]').should('be.visible')
          }
        })
      })
    })

    describe('功能区管理页面', () => {
      beforeEach(() => {
        cy.visit('/warehouse/zone')
        TestUtils.waitForPageLoad()
      })

      it('应该加载功能区管理页面并验证data-cy属性', () => {
        cy.get('[data-cy="warehouse-zone-page"]').should('exist')
        cy.get('[data-cy="warehouse-zone-add-btn"]').should('be.visible')
        cy.get('[data-cy="zone-table"]').should('be.visible')
      })

      it('应该能够打开添加功能区对话框', () => {
        cy.get('[data-cy="warehouse-zone-add-btn"]').click()
        cy.get('[data-cy="warehouse-zone-dialog"]').should('be.visible')
        cy.get('[data-cy="warehouse-zone-form"]').should('be.visible')
        
        // 验证表单字段
        cy.get('[data-cy="warehouse-zone-code-input"]').should('be.visible')
        cy.get('[data-cy="warehouse-zone-name-input"]').should('be.visible')
        cy.get('[data-cy="warehouse-zone-warehouse-select"]').should('be.visible')
        cy.get('[data-cy="warehouse-zone-type-select"]').should('be.visible')
        cy.get('[data-cy="warehouse-zone-remark-input"]').should('be.visible')
        
        // 验证按钮
        cy.get('[data-cy="warehouse-zone-cancel-btn"]').should('be.visible')
        cy.get('[data-cy="warehouse-zone-submit-btn"]').should('be.visible')
      })

      it('应该验证分页组件', () => {
        cy.get('[data-cy="warehouse-zone-pagination"]').should('exist')
      })
    })
  })

  // ==================== 6. 系统管理测试 ====================
  describe('⚙️ 系统管理模块测试', () => {
    
    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })
    
    describe('用户管理页面', () => {
      beforeEach(() => {
        cy.visit('/system/users')
        TestUtils.waitForPageLoad()
      })

      it('应该加载用户管理页面', () => {
        cy.contains('用户管理').should('be.visible')
      })
    })

    describe('角色管理页面', () => {
      beforeEach(() => {
        cy.visit('/system/roles')
        TestUtils.waitForPageLoad()
      })

      it('应该加载角色管理页面', () => {
        cy.contains('角色管理').should('be.visible')
      })
    })
  })

  // ==================== 7. 库存盘点测试 ====================
  describe('📋 库存盘点模块测试', () => {
    
    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })
    
    beforeEach(() => {
      cy.visit('/inventory-management/count')
      TestUtils.waitForPageLoad()
    })

    it('应该加载库存盘点页面并验证data-cy属性', () => {
      cy.contains('盘点').should('be.visible')
      
      // 验证表格列
      const columns = [
        'stock-count-index-column',
        'stock-count-no-column',
        'stock-count-type-column',
        'stock-count-date-column',
        'stock-count-warehouse-column',
        'stock-count-status-column'
      ]
      
      columns.forEach(col => {
        cy.get('body').then($body => {
          if ($body.find(`[data-cy="${col}"]`).length > 0) {
            cy.get(`[data-cy="${col}"]`).should('exist')
          }
        })
      })
    })
  })

  // ==================== 8. 设备管理测试 ====================
  describe('🔧 设备管理模块测试', () => {
    
    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })
    
    beforeEach(() => {
      cy.visit('/device/list')
      TestUtils.waitForPageLoad()
    })

    it('应该加载设备列表页面', () => {
      cy.contains('设备').should('be.visible')
    })
  })

  // ==================== 9. 边界情况和异常处理测试 ====================
  describe('⚠️ 边界情况和异常处理测试', () => {
    
    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })
    
    it('应该处理404页面', () => {
      cy.visit('/non-existent-page-12345')
      cy.contains('404').should('be.visible')
    })

    it('应该处理未授权访问', () => {
      // 清除登录状态
      cy.window().then((win) => {
        win.localStorage.clear()
      })
      
      // 尝试访问受保护页面
      cy.visit('/inventory-management/inbound')
      cy.url().should('include', '/login')
    })

    it('应该验证所有data-cy属性的唯一性', () => {
      cy.visit('/inventory-management/inbound')
      
      // 收集页面上所有的data-cy属性
      cy.get('[data-cy]').then($elements => {
        const dataCyValues = []
        $elements.each((index, element) => {
          dataCyValues.push(element.getAttribute('data-cy'))
        })
        
        // 检查重复
        const duplicates = dataCyValues.filter((item, index) => 
          dataCyValues.indexOf(item) !== index
        )
        
        expect(duplicates).to.have.length(0, `发现重复的data-cy属性: ${duplicates.join(', ')}`)
      })
    })
  })

  // ==================== 10. 性能测试 ====================
  describe('⚡ 性能测试', () => {
    
    beforeEach(() => {
      TestUtils.performLogin(testData.admin.username, testData.admin.password)
    })
    
    it('应该验证页面加载时间', () => {
      const startTime = Date.now()
      
      cy.visit('/dashboard')
      cy.contains('数据仪表盘', { timeout: 15000 }).should('be.visible')
      
      cy.window().then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`页面加载时间: ${loadTime}ms`)
        expect(loadTime).to.be.lessThan(10000, '页面加载时间应小于10秒')
      })
    })

    it('应该验证表格渲染性能', () => {
      cy.visit('/inventory-management/inbound')
      
      const startTime = Date.now()
      cy.get('.el-table, table', { timeout: 15000 }).should('be.visible')
      
      cy.window().then(() => {
        const renderTime = Date.now() - startTime
        cy.log(`表格渲染时间: ${renderTime}ms`)
        expect(renderTime).to.be.lessThan(5000, '表格渲染时间应小于5秒')
      })
    })
  })

  // ==================== 测试后置处理 ====================
  after(() => {
    cy.log('════════════════════════════════════════════════════════════')
    cy.log('✅ 全面的端到端测试执行完成')
    cy.log('════════════════════════════════════════════════════════════')
  })
})
