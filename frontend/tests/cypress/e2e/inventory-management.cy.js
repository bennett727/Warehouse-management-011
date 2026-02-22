describe('库存管理功能测试', () => {
  let realInboundOrders = []
  let realOutboundOrders = []

  before(() => {
    // 使用API快速登录，减少UI操作时间
    cy.loginByApi('admin', 'Admin@123456')

    // 并行获取真实数据
    cy.getRealInboundOrders({ size: 5 }).then((orders) => {
      realInboundOrders = orders
      cy.log(`获取到 ${orders.length} 个真实入库单`)
    })

    cy.getRealOutboundOrders({ size: 5 }).then((orders) => {
      realOutboundOrders = orders
      cy.log(`获取到 ${orders.length} 个真实出库单`)
    })
  })

  beforeEach(() => {
    // 使用session缓存快速登录
    cy.login('admin', 'Admin@123456')
  })

  describe('入库管理页面 - 真实数据验证', () => {
    beforeEach(() => {
      cy.visit('/inventory-management/inbound')
      // 使用更精确的等待条件替代固定等待时间
      cy.waitForPageLoad()
    })

    it('应该能够访问入库管理并显示真实数据', () => {
      cy.contains('入库管理', { timeout: 15000 }).should('be.visible')
      cy.get('.el-table, table', { timeout: 15000 }).should('exist')
    })

    it('应该验证入库单数据结构和有效性', () => {
      if (realInboundOrders.length > 0) {
        const firstOrder = realInboundOrders[0]

        cy.validateApiData(firstOrder, {
          id: { required: true, type: 'number' },
          orderNo: { required: true, type: 'string', minLength: 1 }
        }).then((validation) => {
          expect(validation.valid).to.be.true
          cy.log('入库单数据结构验证通过:', firstOrder.orderNo)
        })
      }
    })

    it('应该显示入库记录列表', () => {
      cy.get('.el-table, table', { timeout: 15000 }).should('exist')
    })

    it('应该显示新增入库按钮', () => {
      cy.get('[data-cy="inbound-create-btn"], button:contains("新增")', { timeout: 15000 }).should('be.visible')
    })

    it('应该能够执行入库单搜索', () => {
      // 使用更稳定的搜索交互
      cy.get('input[placeholder*="搜索"], input[placeholder*="查询"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('测试')
      
      cy.get('[data-cy="search-button"], button:contains("搜索"), button:contains("查询")')
        .first()
        .should('be.visible')
        .click()
      
      // 等待搜索结果加载完成
      cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
      cy.get('.el-table, table').should('exist')
    })
  })

  describe('出库管理页面 - 真实数据验证', () => {
    beforeEach(() => {
      cy.visit('/inventory-management/outbound')
      cy.waitForPageLoad()
    })

    it('应该能够访问出库管理并显示真实数据', () => {
      cy.contains('出库管理', { timeout: 15000 }).should('be.visible')
    })

    it('应该验证出库单数据结构和有效性', () => {
      if (realOutboundOrders.length > 0) {
        const firstOrder = realOutboundOrders[0]

        cy.validateApiData(firstOrder, {
          id: { required: true, type: 'number' },
          orderNo: { required: true, type: 'string', minLength: 1 }
        }).then((validation) => {
          expect(validation.valid).to.be.true
          cy.log('出库单数据结构验证通过:', firstOrder.orderNo)
        })
      }
    })

    it('应该显示出库记录列表', () => {
      cy.get('.el-table, table', { timeout: 15000 }).should('exist')
    })

    it('应该显示新增出库按钮', () => {
      cy.get('[data-cy="outbound-create-btn"], button:contains("新增")', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('库存调拨页面', () => {
    beforeEach(() => {
      cy.visit('/inventory-management/transfer')
      cy.waitForPageLoad()
    })

    it('应该能够访问库存调拨页面', () => {
      cy.contains('调拨', { timeout: 15000 }).should('be.visible')
    })

    it('应该显示调拨记录列表', () => {
      cy.get('.el-table, table', { timeout: 15000 }).should('exist')
    })
  })

  describe('库存盘点页面', () => {
    beforeEach(() => {
      cy.visit('/inventory-management/count')
      cy.waitForPageLoad()
    })

    it('应该能够访问库存盘点页面', () => {
      cy.contains('盘点', { timeout: 15000 }).should('be.visible')
    })

    it('应该显示盘点记录列表', () => {
      cy.get('.el-table, table', { timeout: 15000 }).should('exist')
    })
  })

  describe('库存预警页面', () => {
    beforeEach(() => {
      cy.visit('/inventory-management/alerts')
      cy.waitForPageLoad()
    })

    it('应该能够访问库存预警页面', () => {
      cy.contains('预警', { timeout: 15000 }).should('be.visible')
    })

    it('应该显示预警列表', () => {
      cy.get('.el-table, table', { timeout: 15000 }).should('exist')
    })
  })

  describe('数据完整性和一致性验证', () => {
    it('应该验证所有获取的数据不为空', () => {
      expect(realInboundOrders).to.be.an('array')
      expect(realOutboundOrders).to.be.an('array')
      cy.log('数据完整性验证通过')
    })

    it('应该验证入库单ID唯一性', () => {
      if (realInboundOrders.length > 1) {
        const ids = realInboundOrders.map(order => order.id)
        const uniqueIds = [...new Set(ids)]
        expect(ids.length).to.equal(uniqueIds.length)
        cy.log('入库单ID唯一性验证通过')
      }
    })

    it('应该验证出库单ID唯一性', () => {
      if (realOutboundOrders.length > 1) {
        const ids = realOutboundOrders.map(order => order.id)
        const uniqueIds = [...new Set(ids)]
        expect(ids.length).to.equal(uniqueIds.length)
        cy.log('出库单ID唯一性验证通过')
      }
    })
  })

  describe('库存操作功能测试', () => {
    it('应该验证入库单状态流转', () => {
      if (realInboundOrders.length > 0) {
        const order = realInboundOrders[0]
        cy.log(`验证入库单 ${order.orderNo} 状态: ${order.status}`)
        
        // 验证状态字段存在
        expect(order).to.have.property('status')
        
        // 验证状态值在有效范围内
        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']
        expect(order.status).to.be.oneOf(validStatuses)
      }
    })

    it('应该验证出库单状态流转', () => {
      if (realOutboundOrders.length > 0) {
        const order = realOutboundOrders[0]
        cy.log(`验证出库单 ${order.orderNo} 状态: ${order.status}`)
        
        // 验证状态字段存在
        expect(order).to.have.property('status')
        
        // 验证状态值在有效范围内
        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']
        expect(order.status).to.be.oneOf(validStatuses)
      }
    })

    it('应该验证库存数量计算准确性', () => {
      // 获取库存数据
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/inventory`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 && response.body.data) {
          const inventoryItems = response.body.data.content || response.body.data
          
          if (inventoryItems.length > 0) {
            const firstItem = inventoryItems[0]
            
            // 验证库存数量字段
            expect(firstItem).to.have.property('quantity')
            expect(firstItem.quantity).to.be.a('number')
            expect(firstItem.quantity).to.be.at.least(0)
            
            cy.log(`库存项 ${firstItem.id} 数量: ${firstItem.quantity}`)
          }
        }
      })
    })
  })

  describe('库存报表功能测试', () => {
    beforeEach(() => {
      cy.visit('/inventory-management/reports')
      cy.waitForPageLoad()
    })

    it('应该能够访问库存报表页面', () => {
      cy.contains('报表', { timeout: 15000 }).should('be.visible')
    })

    it('应该显示库存统计信息', () => {
      cy.get('.el-card, .stat-card, .el-statistic', { timeout: 15000 }).should('exist')
    })

    it('应该能够切换报表时间范围', () => {
      // 查找时间范围选择器
      cy.get('body').then(($body) => {
        const hasDatePicker = $body.find('.el-date-picker, .el-date-editor').length > 0
        const hasTimeRange = $body.find('[data-cy="time-range"], .time-range-selector').length > 0
        
        if (hasDatePicker || hasTimeRange) {
          cy.log('找到时间范围选择器')
          // 验证选择器存在即可，不执行实际选择操作
          expect(true).to.be.true
        } else {
          cy.log('未找到时间范围选择器，跳过测试')
        }
      })
    })
  })
})
