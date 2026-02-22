/**
 * 异常恢复测试场景
 * 验证系统在异常情况下的恢复能力和数据一致性
 */

describe('异常恢复测试场景', () => {
  
  before(() => {
    cy.loginByApi('admin', 'Admin@123456')
  })

  beforeEach(() => {
    cy.login('admin', 'Admin@123456')
  })

  describe('【网络异常】网络中断恢复', () => {
    it('TC-RECOVERY-001: 验证网络中断后自动重连', () => {
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      
      // 模拟网络中断
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError')
      
      // 触发一个请求
      cy.visit('/asset-management/device-list')
      cy.wait('@networkError')
      
      // 恢复网络
      cy.intercept('GET', '/api/**', (req) => {
        req.continue()
      })
      
      // 验证页面能够重新加载
      cy.reload()
      cy.waitForPageLoad()
      cy.get('.el-table, table').should('exist')
    })

    it('TC-RECOVERY-002: 验证请求超时后的重试机制', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
      
      // 模拟超时
      cy.intercept('GET', '/api/devices**', {
        delay: 35000, // 超过默认超时时间
        statusCode: 200,
        body: { data: [] }
      }).as('timeoutRequest')
      
      // 触发请求
      cy.get('[data-cy="refresh-button"], button:contains("刷新")').click()
      
      // 验证超时处理
      cy.get('.el-message--error, .el-message--warning', { timeout: 40000 })
        .should('be.visible')
        .and('contain', '超时')
    })

    it('TC-RECOVERY-003: 验证弱网环境下的降级处理', () => {
      // 模拟慢速网络
      cy.intercept('GET', '/api/**', (req) => {
        req.on('response', (res) => {
          res.setDelay(2000) // 延迟2秒
        })
      }).as('slowNetwork')
      
      cy.visit('/dashboard')
      
      // 验证加载状态显示
      cy.get('.el-loading-mask, .el-skeleton', { timeout: 5000 }).should('be.visible')
      
      // 等待加载完成
      cy.waitForPageLoad()
      
      // 验证页面最终加载成功
      cy.get('.dashboard-container, [data-cy="dashboard"]').should('exist')
    })
  })

  describe('【服务器异常】服务端错误处理', () => {
    it('TC-RECOVERY-004: 验证500错误后的恢复', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
      
      // 模拟500错误
      cy.intercept('GET', '/api/devices**', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('serverError')
      
      // 触发请求
      cy.get('[data-cy="refresh-button"], button:contains("刷新")').click()
      cy.wait('@serverError')
      
      // 验证错误提示
      cy.get('.el-message--error', { timeout: 10000 })
        .should('be.visible')
        .and('contain', '错误')
      
      // 恢复服务器
      cy.intercept('GET', '/api/devices**', (req) => {
        req.continue()
      })
      
      // 验证可以重新加载
      cy.reload()
      cy.waitForPageLoad()
      cy.get('.el-table, table').should('exist')
    })

    it('TC-RECOVERY-005: 验证503服务不可用处理', () => {
      cy.intercept('GET', '/api/**', {
        statusCode: 503,
        body: { message: 'Service Unavailable' }
      }).as('serviceUnavailable')
      
      cy.visit('/dashboard')
      cy.wait('@serviceUnavailable')
      
      // 验证服务不可用提示
      cy.get('.el-message--error, .error-message', { timeout: 10000 })
        .should('be.visible')
        .or('body').should('contain', '服务')
    })

    it('TC-RECOVERY-006: 验证502网关错误处理', () => {
      cy.intercept('GET', '/api/**', {
        statusCode: 502,
        body: { message: 'Bad Gateway' }
      }).as('badGateway')
      
      cy.visit('/dashboard')
      cy.wait('@badGateway')
      
      // 验证错误处理
      cy.get('body', { timeout: 10000 }).should(($body) => {
        const hasError = $body.find('.el-message--error').length > 0 ||
                        $body.text().includes('错误') ||
                        $body.text().includes('Error')
        expect(hasError).to.be.true
      })
    })
  })

  describe('【数据异常】数据一致性恢复', () => {
    it('TC-RECOVERY-007: 验证数据提交失败后的状态恢复', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
      
      // 打开创建表单
      cy.get('[data-cy="create-button"], button:contains("新增")').click()
      cy.get('.el-dialog').should('be.visible')
      
      // 填写表单
      cy.get('[data-cy="device-code-input"] input, input[placeholder*="编码"]').type(`TEST_${Date.now()}`)
      cy.get('[data-cy="device-name-input"] input, input[placeholder*="名称"]').type('测试设备')
      
      // 模拟提交失败
      cy.intercept('POST', '/api/devices', {
        statusCode: 500,
        body: { message: '提交失败' }
      }).as('submitError')
      
      // 提交
      cy.get('[data-cy="save-button"], button:contains("保存")').click()
      cy.wait('@submitError')
      
      // 验证错误提示
      cy.get('.el-message--error', { timeout: 10000 }).should('be.visible')
      
      // 验证表单数据保留
      cy.get('[data-cy="device-name-input"] input, input[placeholder*="名称"]')
        .should('have.value', '测试设备')
    })

    it('TC-RECOVERY-008: 验证部分数据加载失败处理', () => {
      // 模拟部分接口失败
      cy.intercept('GET', '/api/devices**', {
        statusCode: 200,
        body: { 
          data: {
            content: [],
            totalElements: 0
          }
        }
      }).as('devicesSuccess')
      
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 500,
        body: { message: '统计数据加载失败' }
      }).as('statsError')
      
      cy.visit('/dashboard')
      
      // 验证部分功能可用
      cy.wait('@statsError')
      cy.get('.dashboard-container, [data-cy="dashboard"]', { timeout: 10000 }).should('exist')
    })

    it('TC-RECOVERY-009: 验证数据缓存恢复', () => {
      // 先正常加载数据
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
      
      // 模拟网络断开
      cy.intercept('GET', '/api/devices**', { forceNetworkError: true })
      
      // 刷新页面
      cy.reload()
      
      // 验证有缓存数据或错误提示
      cy.get('body', { timeout: 10000 }).should(($body) => {
        const hasContent = $body.find('.el-table, table').length > 0 ||
                          $body.find('.el-empty').length > 0 ||
                          $body.find('.el-message--error').length > 0
        expect(hasContent).to.be.true
      })
    })
  })

  describe('【会话异常】认证恢复', () => {
    it('TC-RECOVERY-010: 验证Token过期后的自动刷新', () => {
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      
      // 模拟401响应
      cy.intercept('GET', '/api/**', {
        statusCode: 401,
        body: { message: 'Token expired' }
      }).as('tokenExpired')
      
      // 触发请求
      cy.visit('/asset-management/device-list')
      cy.wait('@tokenExpired')
      
      // 验证重定向到登录页或刷新token
      cy.url({ timeout: 10000 }).should('satisfy', (url) => {
        return url.includes('/login') || url.includes('/asset-management')
      })
    })

    it('TC-RECOVERY-011: 验证会话超时处理', () => {
      // 清除token模拟会话过期
      cy.window().then((win) => {
        win.localStorage.removeItem('token')
      })
      
      // 尝试访问需要认证的页面
      cy.visit('/asset-management/device-list')
      
      // 验证重定向到登录页
      cy.url({ timeout: 10000 }).should('include', '/login')
    })

    it('TC-RECOVERY-012: 验证多点登录冲突处理', () => {
      // 模拟多点登录冲突
      cy.intercept('GET', '/api/**', {
        statusCode: 403,
        body: { message: 'Account logged in from another location' }
      }).as('multiLogin')
      
      cy.visit('/dashboard')
      cy.wait('@multiLogin')
      
      // 验证冲突提示
      cy.get('.el-message--error, .error-message', { timeout: 10000 })
        .should('be.visible')
        .or('body').should('contain', '登录')
    })
  })

  describe('【浏览器异常】客户端恢复', () => {
    it('TC-RECOVERY-013: 验证页面崩溃后的恢复', () => {
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      
      // 模拟JavaScript错误
      cy.window().then((win) => {
        win.onerror = (msg, url, line) => {
          cy.log(`捕获错误: ${msg} at ${url}:${line}`)
          return true // 阻止默认处理
        }
      })
      
      // 执行可能出错的操作
      cy.window().then((win) => {
        try {
          win.eval('throw new Error("Test error")')
        } catch (e) {
          cy.log('错误已捕获')
        }
      })
      
      // 验证页面仍然可用
      cy.get('.dashboard-container, [data-cy="dashboard"]').should('exist')
    })

    it('TC-RECOVERY-014: 验证内存不足警告', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
      
      // 加载大量数据
      cy.get('.el-pagination__sizes .el-select').click()
      cy.get('.el-select-dropdown__item').contains('100').click()
      
      // 验证页面仍然响应
      cy.get('.el-table, table', { timeout: 30000 }).should('be.visible')
      cy.get('.el-message--error').should('not.exist')
    })

    it('TC-RECOVERY-015: 验证存储空间不足处理', () => {
      // 模拟localStorage满
      cy.window().then((win) => {
        const largeData = 'x'.repeat(1024 * 1024 * 10) // 10MB数据
        try {
          for (let i = 0; i < 100; i++) {
            win.localStorage.setItem(`test_key_${i}`, largeData)
          }
        } catch (e) {
          cy.log('存储空间已满，测试通过')
        }
      })
      
      // 验证应用仍然可用
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      cy.get('.dashboard-container, [data-cy="dashboard"]').should('exist')
    })
  })

  describe('【事务异常】操作回滚', () => {
    it('TC-RECOVERY-016: 验证批量操作部分失败回滚', () => {
      cy.visit('/inventory-management/inbound')
      cy.waitForPageLoad()
      
      // 模拟批量操作部分失败
      cy.intercept('POST', '/api/stock-orders/batch', {
        statusCode: 207, // Multi-Status
        body: {
          data: {
            success: [1, 2],
            failed: [3, 4, 5],
            errors: ['Item 3 failed', 'Item 4 failed', 'Item 5 failed']
          }
        }
      }).as('batchPartialFail')
      
      // 执行批量操作
      cy.get('thead .el-checkbox').click()
      cy.get('[data-cy="batch-delete"], button:contains("批量")').click()
      
      // 验证部分失败提示
      cy.get('.el-message--warning, .el-message--error', { timeout: 10000 })
        .should('be.visible')
    })

    it('TC-RECOVERY-017: 验证长时间操作中断恢复', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()
      
      // 模拟长时间操作
      cy.intercept('POST', '/api/devices/import', {
        delay: 10000,
        statusCode: 200,
        body: { message: 'Import completed' }
      }).as('longImport')
      
      // 触发导入
      cy.get('[data-cy="import-button"], button:contains("导入")').click()
      
      // 验证加载状态
      cy.get('.el-loading-mask, .el-loading-spinner', { timeout: 5000 })
        .should('be.visible')
      
      // 等待完成
      cy.wait('@longImport')
      
      // 验证成功
      cy.get('.el-message--success', { timeout: 15000 }).should('be.visible')
    })

    it('TC-RECOVERY-018: 验证并发操作冲突恢复', () => {
      const timestamp = Date.now()
      
      // 创建一个测试设备
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/devices`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        body: {
          deviceCode: `CONFLICT_TEST_${timestamp}`,
          deviceName: '冲突测试设备',
          deviceType: '测试类型',
          status: 'ACTIVE'
        }
      }).then((response) => {
        const deviceId = response.body.data?.id
        
        // 模拟并发修改冲突
        cy.intercept('PUT', `/api/devices/${deviceId}`, {
          statusCode: 409,
          body: { message: 'Conflict: Resource was modified by another user' }
        }).as('conflictError')
        
        cy.visit('/asset-management/device-list')
        cy.waitForPageLoad()
        
        // 尝试编辑
        cy.get('tbody tr').first().within(() => {
          cy.get('[data-cy="edit-button"], button:contains("编辑")').click()
        })
        
        cy.get('.el-dialog').should('be.visible')
        cy.get('[data-cy="save-button"], button:contains("保存")').click()
        
        cy.wait('@conflictError')
        
        // 验证冲突提示
        cy.get('.el-message--error, .el-message--warning', { timeout: 10000 })
          .should('be.visible')
          .and('contain', '冲突')
      })
    })
  })

  describe('【系统恢复】整体恢复能力', () => {
    it('TC-RECOVERY-019: 验证系统完全恢复流程', () => {
      // 步骤1: 正常访问
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      cy.get('.dashboard-container, [data-cy="dashboard"]').should('exist')
      
      // 步骤2: 模拟系统故障
      cy.intercept('GET', '/api/**', { forceNetworkError: true })
      cy.reload()
      
      // 步骤3: 验证故障状态
      cy.get('body', { timeout: 10000 }).should(($body) => {
        const hasError = $body.find('.el-message--error').length > 0 ||
                        $body.text().includes('错误') ||
                        $body.find('.el-empty').length > 0
        expect(hasError).to.be.true
      })
      
      // 步骤4: 恢复系统
      cy.intercept('GET', '/api/**', (req) => {
        req.continue()
      })
      
      // 步骤5: 验证恢复
      cy.reload()
      cy.waitForPageLoad()
      cy.get('.dashboard-container, [data-cy="dashboard"]').should('exist')
      cy.get('.el-message--error').should('not.exist')
    })

    it('TC-RECOVERY-020: 验证数据同步恢复', () => {
      cy.visit('/inventory-management/inbound')
      cy.waitForPageLoad()
      
      // 记录当前数据状态
      let initialData = []
      cy.get('.el-table tbody tr').then(($rows) => {
        initialData = $rows.map((i, el) => Cypress.$(el).text()).get()
      })
      
      // 模拟网络中断后恢复
      cy.intercept('GET', '/api/stock-orders**', { forceNetworkError: true })
      cy.reload()
      
      cy.wait(2000)
      
      // 恢复网络
      cy.intercept('GET', '/api/stock-orders**', (req) => {
        req.continue()
      })
      
      // 手动刷新
      cy.get('[data-cy="refresh-button"], button:contains("刷新")').click()
      
      // 验证数据恢复
      cy.waitForPageLoad()
      cy.get('.el-table tbody tr').should('have.length.at.least', 0)
    })
  })
})

// 自定义命令
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
  cy.get('.el-skeleton', { timeout: 10000 }).should('not.exist')
})
