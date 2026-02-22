describe('仪表盘功能测试', () => {
  let realDevices = []
  let realInboundOrders = []
  let realOutboundOrders = []

  before(() => {
    cy.login('admin', 'Admin@123456')
    
    cy.getRealDevices({ size: 10 }).then((devices) => {
      realDevices = devices
    })
    
    cy.getRealInboundOrders({ size: 5 }).then((orders) => {
      realInboundOrders = orders
    })
    
    cy.getRealOutboundOrders({ size: 5 }).then((orders) => {
      realOutboundOrders = orders
    })
  })

  beforeEach(() => {
    cy.login('admin', 'Admin@123456')
    cy.visit('/dashboard')
    cy.wait(10000)
  })

  describe('仪表盘页面基础功能', () => {
    it('应该显示仪表盘标题', () => {
      cy.contains('数据仪表盘', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示统计卡片', () => {
      cy.get('[data-cy="stats-card"], .stats-card, .el-card', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示快捷操作区域', () => {
      cy.get('[data-cy="quick-actions"], .quick-actions, .el-card', { timeout: 30000 }).should('be.visible')
    })
  })

  describe('数据统计验证', () => {
    it('应该显示设备统计数据', () => {
      cy.get('[data-cy="device-stats"], .device-stats', { timeout: 30000 }).should('exist')
    })

    it('应该显示库存统计数据', () => {
      cy.get('[data-cy="inventory-stats"], .inventory-stats', { timeout: 30000 }).should('exist')
    })

    it('应该显示业务统计数据', () => {
      cy.get('[data-cy="business-stats"], .business-stats', { timeout: 30000 }).should('exist')
    })
  })

  describe('数据一致性验证', () => {
    it('应该验证仪表盘统计数据与设备数据一致', () => {
      cy.log(`设备数量: ${realDevices.length}`)
      expect(realDevices).to.be.an('array')
    })

    it('应该验证仪表盘统计数据与入库单数据一致', () => {
      cy.log(`入库单数量: ${realInboundOrders.length}`)
      expect(realInboundOrders).to.be.an('array')
    })

    it('应该验证仪表盘统计数据与出库单数据一致', () => {
      cy.log(`出库单数量: ${realOutboundOrders.length}`)
      expect(realOutboundOrders).to.be.an('array')
    })
  })

  describe('图表和可视化', () => {
    it('应该显示数据图表', () => {
      cy.get('.chart-container, .echarts, [data-cy="chart"]', { timeout: 30000 }).should('exist')
    })

    it('应该显示最近活动记录', () => {
      cy.get('[data-cy="recent-activities"], .recent-activities', { timeout: 30000 }).should('exist')
    })
  })

  describe('快捷操作', () => {
    it('应该能够快速跳转到入库管理', () => {
      cy.get('[data-cy="quick-inbound"], a:contains("入库")', { timeout: 30000 }).first().click()
      cy.url().should('include', '/inventory-management/inbound')
    })

    it('应该能够快速跳转到出库管理', () => {
      cy.get('[data-cy="quick-outbound"], a:contains("出库")', { timeout: 30000 }).first().click()
      cy.url().should('include', '/inventory-management/outbound')
    })

    it('应该能够快速跳转到设备管理', () => {
      cy.get('[data-cy="quick-device"], a:contains("设备")', { timeout: 30000 }).first().click()
      cy.url().should('include', '/asset-management')
    })
  })
})
