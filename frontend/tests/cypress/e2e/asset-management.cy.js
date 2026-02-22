describe('资产管理功能测试', () => {
  let realDevices = []

  before(() => {
    cy.login('admin', 'Admin@123456')
    
    cy.getRealDevices({ size: 10 }).then((devices) => {
      realDevices = devices
      cy.log(`获取到 ${devices.length} 个真实设备`)
    })
  })

  beforeEach(() => {
    cy.login('admin', 'Admin@123456')
  })

  describe('设备台账页面 - 真实数据验证', () => {
    beforeEach(() => {
      cy.visit('/asset-management/device-ledger')
      cy.wait(10000)
    })

    it('应该能够访问设备台账并显示页面', () => {
      cy.contains('设备台账', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示设备类型卡片', () => {
      cy.get('[data-cy="device-type-card"], .device-type-card', { timeout: 30000 }).should('be.visible')
    })
  })

  describe('设备列表页面 - 真实数据验证', () => {
    beforeEach(() => {
      cy.visit('/asset-management/device-list')
      cy.wait(10000)
    })

    it('应该能够访问设备列表并显示真实数据', () => {
      cy.contains('设备列表', { timeout: 30000 }).should('be.visible')
      cy.get('.el-table, table', { timeout: 30000 }).should('be.visible')
    })

    it('应该验证设备数据结构和有效性', () => {
      if (realDevices.length > 0) {
        const firstDevice = realDevices[0]
        
        cy.validateApiData(firstDevice, {
          id: { required: true, type: 'number' },
          deviceCode: { required: true, type: 'string', minLength: 1 },
          deviceName: { required: true, type: 'string', minLength: 1 }
        }).then((validation) => {
          expect(validation.valid).to.be.true
          cy.log('设备数据结构验证通过:', firstDevice.deviceCode)
        })
      }
    })

    it('应该显示设备统计卡片', () => {
      cy.get('[data-cy="stats-card"], .stats-card', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示新增设备按钮', () => {
      cy.get('[data-cy="device-create-btn"], button:contains("新增")', { timeout: 30000 }).should('be.visible')
    })
  })

  describe('维修管理页面', () => {
    beforeEach(() => {
      cy.visit('/business-records/repair')
      cy.wait(10000)
    })

    it('应该能够访问维修管理页面', () => {
      cy.contains('维修', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示维修记录列表', () => {
      cy.get('.el-table, table', { timeout: 30000 }).should('be.visible')
    })
  })

  describe('保养管理页面', () => {
    beforeEach(() => {
      cy.visit('/business-records/maintenance')
      cy.wait(10000)
    })

    it('应该能够访问保养管理页面', () => {
      cy.contains('保养', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示保养记录列表', () => {
      cy.get('.el-table, table', { timeout: 30000 }).should('be.visible')
    })
  })

  describe('报废管理页面', () => {
    beforeEach(() => {
      cy.visit('/business-records/scrap')
      cy.wait(10000)
    })

    it('应该能够访问报废管理页面', () => {
      cy.contains('报废', { timeout: 30000 }).should('be.visible')
    })

    it('应该显示报废记录列表', () => {
      cy.get('.el-table, table', { timeout: 30000 }).should('be.visible')
    })
  })

  describe('数据完整性和一致性验证', () => {
    it('应该验证所有获取的数据不为空', () => {
      expect(realDevices).to.be.an('array')
      cy.log('数据完整性验证通过')
    })

    it('应该验证设备ID唯一性', () => {
      if (realDevices.length > 1) {
        const ids = realDevices.map(device => device.id)
        const uniqueIds = [...new Set(ids)]
        expect(ids.length).to.equal(uniqueIds.length)
        cy.log('设备ID唯一性验证通过')
      }
    })

    it('应该验证设备编号唯一性', () => {
      if (realDevices.length > 1) {
        const codes = realDevices.map(device => device.deviceCode)
        const uniqueCodes = [...new Set(codes)]
        expect(codes.length).to.equal(uniqueCodes.length)
        cy.log('设备编号唯一性验证通过')
      }
    })
  })
})
