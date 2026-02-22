describe('仓库管理系统边界条件和异常场景测试', () => {
  beforeEach(() => {
    cy.login('admin', 'Admin@123456')
  })

  describe('【边界条件测试】数据量边界测试', () => {
    it('TC-BOUNDARY-001: 验证空数据列表显示', () => {
      cy.visit('/inventory-management/inbound')
      cy.get('input[placeholder*="单号"]', { timeout: 30000 }).type('NONEXISTENT_ORDER_99999')
      cy.get('[data-cy="search-btn"], button:contains("搜索"), button:contains("查询")').first().click()
      cy.wait(3000)
      cy.get('.el-empty, .el-table__empty-text, .no-data, .empty-state', { timeout: 10000 }).should('be.visible')
    })

    it('TC-BOUNDARY-002: 验证超长文本输入处理', () => {
      cy.visit('/inventory-management/inbound')
      const longText = 'A'.repeat(500)
      cy.get('input[placeholder*="单号"]', { timeout: 30000 }).type(longText)
      cy.get('[data-cy="search-btn"], button:contains("搜索"), button:contains("查询")').first().click()
      cy.wait(3000)
      cy.get('.el-message--error, .el-message--warning, .error-message', { timeout: 10000 }).should('be.visible')
    })

    it('TC-BOUNDARY-003: 验证特殊字符输入处理', () => {
      cy.visit('/inventory-management/inbound')
      const specialChars = '<script>alert("test")</script>'
      cy.get('input[placeholder*="单号"]', { timeout: 30000 }).type(specialChars)
      cy.get('[data-cy="search-btn"], button:contains("搜索"), button:contains("查询")').first().click()
      cy.wait(3000)
      cy.get('.el-message--error, .el-message--warning', { timeout: 10000 }).should('be.visible')
    })

    it('TC-BOUNDARY-004: 验证分页边界 - 最后一页', () => {
      cy.visit('/asset-management/device-list')
      cy.wait(5000)
      cy.get('.el-pagination__total, .pagination-total', { timeout: 30000 }).invoke('text').then((text) => {
        const total = parseInt(text.replace(/\D/g, '')) || 0
        if (total > 10) {
          cy.get('.el-pager li:last-child, .pagination-last').click({ force: true })
          cy.wait(3000)
          cy.get('.el-table, table').should('be.visible')
        }
      })
    })
  })

  describe('【异常场景测试】网络异常处理', () => {
    it('TC-EXCEPTION-001: 验证网络断开时的错误提示', () => {
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError')
      cy.visit('/inventory-management/inbound')
      cy.wait(5000)
      cy.get('.el-message--error, .error-message, .network-error', { timeout: 15000 }).should('be.visible')
    })

    it('TC-EXCEPTION-002: 验证API超时处理', () => {
      cy.intercept('GET', '/api/**', (req) => {
        req.reply((res) => {
          res.delay = 60000
        })
      }).as('apiTimeout')
      cy.visit('/inventory-management/inbound', { timeout: 70000 })
      cy.wait(5000)
      cy.get('.el-loading-mask').should('be.visible')
    })

    it('TC-EXCEPTION-003: 验证服务器错误响应处理', () => {
      cy.intercept('GET', '/api/**', { statusCode: 500, body: { message: 'Internal Server Error' } }).as('serverError')
      cy.visit('/inventory-management/inbound')
      cy.wait(5000)
      cy.get('.el-message--error, .error-message', { timeout: 15000 }).should('be.visible')
    })

    it('TC-EXCEPTION-004: 验证401未授权响应处理', () => {
      cy.intercept('GET', '/api/**', { statusCode: 401, body: { message: 'Unauthorized' } }).as('unauthorized')
      cy.visit('/inventory-management/inbound')
      cy.wait(5000)
      cy.url().should('include', '/login')
    })
  })

  describe('【异常场景测试】表单验证', () => {
    it('TC-FORM-001: 验证必填字段为空时的错误提示', () => {
      cy.visit('/inventory-management/inbound')
      cy.get('[data-cy="inbound-create-btn"], button:contains("新增")').first().click()
      cy.wait(2000)
      cy.get('.el-dialog, .el-drawer', { timeout: 10000 }).should('be.visible')
      cy.get('[data-cy="submit-btn"], button:contains("提交"), button:contains("保存")').last().click()
      cy.get('.el-form-item__error, .error-message', { timeout: 5000 }).should('be.visible')
    })

    it('TC-FORM-002: 验证数值输入边界', () => {
      cy.visit('/inventory-management/inbound')
      cy.get('[data-cy="inbound-create-btn"], button:contains("新增")').first().click()
      cy.wait(2000)
      cy.get('.el-dialog, .el-drawer', { timeout: 10000 }).should('be.visible')
      cy.get('input[type="number"]').each(($input) => {
        cy.wrap($input).clear().type('-1')
        cy.wrap($input).blur()
      })
    })

    it('TC-FORM-003: 验证日期选择边界', () => {
      cy.visit('/inventory-management/inbound')
      cy.get('[data-cy="inbound-create-btn"], button:contains("新增")').first().click()
      cy.wait(2000)
      cy.get('.el-dialog, .el-drawer', { timeout: 10000 }).should('be.visible')
      cy.get('.el-date-editor input, input[type="date"]').first().click()
      cy.get('.el-date-picker__prev-btn, .el-date-picker__next-btn').should('be.visible')
    })
  })

  describe('【并发操作测试】', () => {
    it('TC-CONCURRENT-001: 验证同时发起多个请求的处理', () => {
      const requests = Array(5).fill(null).map((_, i) => 
        cy.request({
          method: 'GET',
          url: `/api/devices?page=${i}&size=10`,
          failOnStatusCode: false
        })
      )
      
      Promise.all(requests).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.be.lessThan(500)
        })
      })
    })

    it('TC-CONCURRENT-002: 验证快速切换页面的处理', () => {
      const pages = [
        '/dashboard',
        '/asset-management/device-list',
        '/inventory-management/inbound',
        '/inventory-management/outbound'
      ]
      
      pages.forEach((page) => {
        cy.visit(page)
        cy.wait(500)
      })
      
      cy.url().should('include', '/inventory-management/outbound')
    })
  })

  describe('【性能边界测试】', () => {
    it('TC-PERF-001: 验证大数据量列表渲染性能', () => {
      const startTime = Date.now()
      cy.visit('/asset-management/device-list')
      cy.get('.el-table, table', { timeout: 60000 }).should('be.visible')
      cy.then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`列表加载时间: ${loadTime}ms`)
        expect(loadTime).to.be.lessThan(30000)
      })
    })

    it('TC-PERF-002: 验证搜索响应性能', () => {
      cy.visit('/inventory-management/inbound')
      cy.wait(3000)
      const startTime = Date.now()
      cy.get('input[placeholder*="单号"]', { timeout: 30000 }).type('test')
      cy.get('[data-cy="search-btn"], button:contains("搜索"), button:contains("查询")').first().click()
      cy.wait(3000)
      cy.then(() => {
        const searchTime = Date.now() - startTime
        cy.log(`搜索响应时间: ${searchTime}ms`)
        expect(searchTime).to.be.lessThan(10000)
      })
    })
  })

  describe('【数据完整性测试】', () => {
    it('TC-DATA-001: 验证数据格式一致性', () => {
      cy.getRealDevices({ size: 10 }).then((devices) => {
        devices.forEach((device) => {
          expect(device).to.have.property('id')
          expect(device).to.have.property('deviceCode')
          expect(device).to.have.property('deviceName')
        })
      })
    })

    it('TC-DATA-002: 验证数据类型正确性', () => {
      cy.getRealDevices({ size: 10 }).then((devices) => {
        devices.forEach((device) => {
          expect(device.id).to.be.a('number')
          expect(device.deviceCode).to.be.a('string')
          expect(device.deviceName).to.be.a('string')
        })
      })
    })
  })
})
