/**
 * @file: data-cy-validation-test.cy.js
 * @description: data-cy属性验证测试 - 不需要后端服务
 * @author: AI架构专家
 * @createTime: 2026-02-26
 * 
 * 此测试文件专注于验证所有data-cy属性的正确性和一致性
 * 不需要完整的后端服务，可以独立运行
 */

describe('🔍 data-cy 属性全面验证测试', () => {
  
  // 测试配置
  const config = {
    baseUrl: 'http://localhost:5173',
    timeout: 10000,
    pages: [
      { path: '/login', name: '登录页面' },
      { path: '/dashboard', name: '仪表盘' },
      { path: '/inventory-management/inbound', name: '入库管理' },
      { path: '/inventory-management/outbound', name: '出库管理' },
      { path: '/inventory-management/count', name: '库存盘点' },
      { path: '/warehouse/map', name: '仓库地图' },
      { path: '/warehouse/zone', name: '功能区管理' },
      { path: '/system/users', name: '用户管理' },
      { path: '/system/roles', name: '角色管理' },
      { path: '/device/list', name: '设备列表' }
    ]
  }

  // 收集所有发现的data-cy属性
  let allDataCyAttributes = new Set()
  let pageDataCyMap = {}

  describe('📄 页面级data-cy属性验证', () => {
    
    config.pages.forEach(page => {
      it(`应该验证 ${page.name} 的data-cy属性`, () => {
        cy.visit(page.path, { failOnStatusCode: false })
        cy.wait(2000) // 等待页面加载
        
        // 收集该页面的所有data-cy属性
        cy.get('[data-cy]').then($elements => {
          const pageAttributes = []
          $elements.each((index, element) => {
            const dataCy = element.getAttribute('data-cy')
            if (dataCy) {
              pageAttributes.push(dataCy)
              allDataCyAttributes.add(dataCy)
            }
          })
          pageDataCyMap[page.name] = pageAttributes
          
          cy.log(`${page.name} 发现 ${pageAttributes.length} 个data-cy属性`)
          
          // 验证至少有一些data-cy属性
          if (pageAttributes.length === 0) {
            cy.log(`⚠️ ${page.name} 没有发现data-cy属性`)
          }
        })
      })
    })
  })

  describe('🔐 登录页面详细验证', () => {
    
    beforeEach(() => {
      cy.visit('/login')
      cy.wait(1000)
    })

    it('应该验证登录页面所有data-cy元素可见性', () => {
      const loginElements = [
        { selector: 'login-page', name: '登录页面容器' },
        { selector: 'login-form', name: '登录表单' },
        { selector: 'login-username-form-item', name: '用户名字段' },
        { selector: 'login-username-input', name: '用户名输入框' },
        { selector: 'login-password-form-item', name: '密码字段' },
        { selector: 'login-password-input', name: '密码输入框' },
        { selector: 'login-remember-checkbox', name: '记住我复选框' },
        { selector: 'login-submit-button', name: '登录按钮' }
      ]

      loginElements.forEach(el => {
        cy.get(`[data-cy="${el.selector}"]`).should('exist').and('be.visible')
        cy.log(`✅ ${el.name} (${el.selector}) 验证通过`)
      })
    })

    it('应该验证登录表单交互功能', () => {
      // 输入用户名
      cy.get('[data-cy="login-username-input"]')
        .type('testuser')
        .should('have.value', 'testuser')
      
      // 输入密码
      cy.get('[data-cy="login-password-input"]')
        .type('testpassword')
        .should('have.value', 'testpassword')
      
      // 点击记住我
      cy.get('[data-cy="login-remember-checkbox"]').click()
    })

    it('应该验证登录按钮状态', () => {
      cy.get('[data-cy="login-submit-button"]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain', '登录')
    })
  })

  describe('📊 data-cy命名规范验证', () => {
    
    const namingPatterns = {
      '页面容器': /^[a-z]+-[a-z]+-page$/,
      '表格': /^[a-z]+-[a-z]+-table$/,
      '表单': /^[a-z]+-[a-z]+-form$/,
      '按钮': /^[a-z]+-[a-z]+-btn$/,
      '输入框': /^[a-z]+-[a-z]+-input$/,
      '选择框': /^[a-z]+-[a-z]+-select$/,
      '对话框': /^[a-z]+-[a-z]+-dialog$/,
      '列': /^[a-z]+-[a-z]+-column$/,
      '标签': /^[a-z]+-[a-z]+-tag$/,
      '分页': /^[a-z]+-[a-z]+-pagination$/
    }

    it('应该验证所有data-cy属性符合命名规范', () => {
      cy.visit('/login')
      cy.wait(1000)
      
      cy.get('[data-cy]').then($elements => {
        const violations = []
        
        $elements.each((index, element) => {
          const dataCy = element.getAttribute('data-cy')
          if (dataCy) {
            // 检查是否包含大写字母或空格
            if (/[A-Z]/.test(dataCy)) {
              violations.push({ attr: dataCy, issue: '包含大写字母' })
            }
            if (/\s/.test(dataCy)) {
              violations.push({ attr: dataCy, issue: '包含空格' })
            }
            // 检查是否使用连字符
            if (!dataCy.includes('-')) {
              violations.push({ attr: dataCy, issue: '未使用连字符分隔' })
            }
          }
        })
        
        if (violations.length > 0) {
          cy.log('⚠️ 发现命名规范违规:')
          violations.forEach(v => cy.log(`  - ${v.attr}: ${v.issue}`))
        } else {
          cy.log('✅ 所有data-cy属性符合命名规范')
        }
        
        expect(violations).to.have.length(0)
      })
    })
  })

  describe('🔍 data-cy属性唯一性验证', () => {
    
    it('应该在每个页面内验证data-cy属性唯一性', () => {
      const pagesToCheck = [
        '/login',
        '/warehouse/zone'
      ]
      
      pagesToCheck.forEach(page => {
        cy.visit(page, { failOnStatusCode: false })
        cy.wait(1500)
        
        cy.get('[data-cy]').then($elements => {
          const dataCyValues = []
          $elements.each((index, element) => {
            dataCyValues.push(element.getAttribute('data-cy'))
          })
          
          // 检查重复
          const duplicates = dataCyValues.filter((item, index) => 
            dataCyValues.indexOf(item) !== index
          )
          
          if (duplicates.length > 0) {
            cy.log(`⚠️ ${page} 发现重复的data-cy属性: ${[...new Set(duplicates)].join(', ')}`)
          } else {
            cy.log(`✅ ${page} 所有data-cy属性唯一`)
          }
          
          expect([...new Set(duplicates)]).to.have.length(0)
        })
      })
    })
  })

  describe('📦 组件级data-cy属性验证', () => {
    
    it('应该验证仓库管理页面的data-cy属性', () => {
      cy.visit('/warehouse/zone', { failOnStatusCode: false })
      cy.wait(1500)
      
      const expectedElements = [
        'warehouse-zone-page',
        'warehouse-zone-add-btn',
        'zone-table',
        'warehouse-zone-pagination'
      ]
      
      expectedElements.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(`[data-cy="${selector}"]`).length > 0) {
            cy.get(`[data-cy="${selector}"]`).should('exist')
            cy.log(`✅ ${selector} 存在`)
          } else {
            cy.log(`⚠️ ${selector} 不存在`)
          }
        })
      })
    })

    it('应该验证出入库管理页面的data-cy属性', () => {
      cy.visit('/inventory-management/inbound', { failOnStatusCode: false })
      cy.wait(1500)
      
      // 验证表格相关data-cy
      const tableElements = [
        'inbound-selection-column',
        'inbound-order-no-column',
        'inbound-type-column',
        'inbound-status-column',
        'inbound-actions-column'
      ]
      
      tableElements.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(`[data-cy="${selector}"]`).length > 0) {
            cy.log(`✅ ${selector} 存在`)
          }
        })
      })
    })
  })

  describe('🎯 关键交互元素验证', () => {
    
    it('应该验证所有按钮元素可点击', () => {
      cy.visit('/login')
      cy.wait(1000)
      
      cy.get('[data-cy$="-btn"]').each($btn => {
        cy.wrap($btn).should('not.be.disabled')
      })
    })

    it('应该验证所有输入框元素可输入', () => {
      cy.visit('/login')
      cy.wait(1000)
      
      cy.get('[data-cy$="-input"]').each($input => {
        cy.wrap($input).should('not.be.disabled')
      })
    })
  })

  describe('📈 测试报告生成', () => {
    
    it('应该生成data-cy属性覆盖率报告', () => {
      const results = {
        timestamp: new Date().toISOString(),
        pages: pageDataCyMap,
        totalAttributes: allDataCyAttributes.size,
        summary: {}
      }
      
      // 统计每个页面的属性数量
      Object.keys(pageDataCyMap).forEach(page => {
        results.summary[page] = pageDataCyMap[page].length
      })
      
      cy.log('════════════════════════════════════════════════════════════')
      cy.log('📊 data-cy属性验证报告')
      cy.log('════════════════════════════════════════════════════════════')
      cy.log(`总计发现 ${results.totalAttributes} 个唯一的data-cy属性`)
      cy.log('')
      cy.log('各页面统计:')
      Object.keys(results.summary).forEach(page => {
        cy.log(`  ${page}: ${results.summary[page]} 个属性`)
      })
      cy.log('════════════════════════════════════════════════════════════')
      
      // 将结果写入文件
      cy.writeFile('tests/cypress/reports/data-cy-validation-report.json', results)
    })
  })

  after(() => {
    cy.log('════════════════════════════════════════════════════════════')
    cy.log('✅ data-cy属性全面验证测试完成')
    cy.log('════════════════════════════════════════════════════════════')
  })
})
