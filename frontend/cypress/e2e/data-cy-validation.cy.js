/**
 * Data-Cy 属性验证测试套件
 * @description: 验证所有组件的data-cy属性是否正确设置和可访问
 * @author: AI架构专家
 * @createTime: 2026-02-25
 */

describe('Data-Cy 属性完整性验证', () => {
  beforeEach(() => {
    // 登录系统
    cy.visit('/login')
    cy.get('[data-cy="login-username-input"]').type('admin')
    cy.get('[data-cy="login-password-input"]').type('admin123')
    cy.get('[data-cy="login-submit-button"]').click()
    cy.url().should('include', '/dashboard')
  })

  describe('登录页面', () => {
    it('应包含所有必要的data-cy属性', () => {
      cy.visit('/login')
      cy.get('[data-cy="login-page"]').should('exist')
      cy.get('[data-cy="login-form"]').should('exist')
      cy.get('[data-cy="login-username-input"]').should('exist')
      cy.get('[data-cy="login-password-input"]').should('exist')
      cy.get('[data-cy="login-remember-checkbox"]').should('exist')
      cy.get('[data-cy="login-submit-button"]').should('exist')
    })
  })

  describe('布局组件', () => {
    it('应包含侧边栏导航的data-cy属性', () => {
      cy.get('[data-cy="sidebar"]').should('exist')
      cy.get('[data-cy="main-menu"]').should('exist')
      cy.get('[data-cy="menu-dashboard"]').should('exist')
      cy.get('[data-cy="menu-asset-management"]').should('exist')
    })

    it('应包含顶部导航的data-cy属性', () => {
      cy.get('[data-cy="header"]').should('exist')
      cy.get('[data-cy="sidebar-toggle-button"]').should('exist')
      cy.get('[data-cy="user-menu"]').should('exist')
    })
  })

  describe('仪表盘页面', () => {
    it('应包含所有data-cy属性', () => {
      cy.get('[data-cy="dashboard-page"]').should('exist')
      cy.get('[data-cy="refresh-btn"]').should('exist')
      cy.get('[data-cy="kpi-card"]').should('exist')
      cy.get('[data-cy="quick-access"]').should('exist')
    })
  })

  describe('设备列表页面', () => {
    beforeEach(() => {
      cy.visit('/device/list')
    })

    it('应包含页面级data-cy属性', () => {
      cy.get('[data-cy="device-list-page"]').should('exist')
      cy.get('[data-cy="device-add-button"]').should('exist')
      cy.get('[data-cy="device-export-button"]').should('exist')
    })

    it('应包含表格data-cy属性', () => {
      cy.get('[data-cy="device-table"]').should('exist')
      cy.get('[data-cy="device-pagination"]').should('exist')
    })
  })

  describe('入库管理页面', () => {
    beforeEach(() => {
      cy.visit('/inventory/inbound')
    })

    it('应包含页面级data-cy属性', () => {
      cy.get('[data-cy="inbound-management-page"]').should('exist')
      cy.get('[data-cy="inbound-create-btn"]').should('exist')
      cy.get('[data-cy="inbound-export-btn"]').should('exist')
      cy.get('[data-cy="inbound-guide-btn"]').should('exist')
    })

    it('应包含批量操作栏data-cy属性', () => {
      // 先选择一行数据
      cy.get('table tbody tr').first().find('.el-checkbox').click()
      cy.get('[data-cy="inbound-batch-operation-bar"]').should('exist')
      cy.get('[data-cy="inbound-select-all-checkbox"]').should('exist')
      cy.get('[data-cy="inbound-selected-count"]').should('exist')
      cy.get('[data-cy="inbound-clear-selection-btn"]').should('exist')
    })
  })

  describe('入库向导对话框', () => {
    beforeEach(() => {
      cy.visit('/inventory/inbound')
      cy.get('[data-cy="inbound-create-btn"]').click()
    })

    it('应包含向导对话框data-cy属性', () => {
      cy.get('[data-cy="inbound-creation-wizard"]').should('be.visible')
      cy.get('[data-cy="inbound-wizard-footer"]').should('exist')
      cy.get('[data-cy="inbound-wizard-next-btn"]').should('exist')
      cy.get('[data-cy="inbound-wizard-cancel-btn"]').should('exist')
      cy.get('[data-cy="inbound-wizard-save-draft-btn"]').should('exist')
    })

    it('应能进行步骤导航', () => {
      cy.get('[data-cy="inbound-wizard-next-btn"]').click()
      cy.get('[data-cy="inbound-wizard-prev-btn"]').should('exist')
    })
  })

  describe('入库单对话框', () => {
    it('应包含对话框data-cy属性', () => {
      // 通过某些操作打开对话框
      cy.get('[data-cy="inbound-order-dialog"]').should('exist')
      cy.get('[data-cy="inbound-order-footer"]').should('exist')
      cy.get('[data-cy="inbound-order-cancel-btn"]').should('exist')
      cy.get('[data-cy="inbound-order-submit-btn"]').should('exist')
    })
  })

  describe('出库单对话框', () => {
    it('应包含对话框data-cy属性', () => {
      cy.get('[data-cy="outbound-order-dialog"]').should('exist')
      cy.get('[data-cy="outbound-order-footer"]').should('exist')
      cy.get('[data-cy="outbound-order-cancel-btn"]').should('exist')
      cy.get('[data-cy="outbound-order-next-btn"]').should('exist')
    })
  })

  describe('库存审核对话框', () => {
    it('应包含审核对话框data-cy属性', () => {
      cy.get('[data-cy="inventory-audit-dialog"]').should('exist')
      cy.get('[data-cy="inventory-audit-form"]').should('exist')
      cy.get('[data-cy="audit-result-radio-group"]').should('exist')
      cy.get('[data-cy="audit-result-approved"]').should('exist')
      cy.get('[data-cy="audit-result-rejected"]').should('exist')
      cy.get('[data-cy="inventory-audit-footer"]').should('exist')
      cy.get('[data-cy="inventory-audit-cancel-btn"]').should('exist')
    })
  })

  describe('设备选择器', () => {
    it('应包含设备选择器data-cy属性', () => {
      cy.get('[data-cy="device-selector-dialog"]').should('exist')
      cy.get('[data-cy="device-selector-filter"]').should('exist')
      cy.get('[data-cy="device-selector-search-input"]').should('exist')
      cy.get('[data-cy="device-selector-type-select"]').should('exist')
      cy.get('[data-cy="device-selector-status-select"]').should('exist')
      cy.get('[data-cy="device-selector-search-btn"]').should('exist')
      cy.get('[data-cy="device-selector-reset-btn"]').should('exist')
      cy.get('[data-cy="device-selector-footer"]').should('exist')
      cy.get('[data-cy="device-selector-cancel-btn"]').should('exist')
      cy.get('[data-cy="device-selector-confirm-btn"]').should('exist')
    })
  })

  describe('基础组件', () => {
    it('应包含操作栏data-cy属性', () => {
      cy.get('[data-cy="action-bar"]').should('exist')
      cy.get('[data-cy="action-bar-left"]').should('exist')
      cy.get('[data-cy="action-bar-right"]').should('exist')
    })

    it('应包含面包屑data-cy属性', () => {
      cy.get('[data-cy="breadcrumb-nav"]').should('exist')
    })

    it('应包含筛选栏data-cy属性', () => {
      cy.get('[data-cy="unified-filter-bar"]').should('exist')
      cy.get('[data-cy="filter-bar-header"]').should('exist')
      cy.get('[data-cy="filter-bar-footer"]').should('exist')
    })
  })

  describe('动态生成元素的data-cy属性', () => {
    it('应包含动态步骤按钮', () => {
      // 验证动态生成的批量操作按钮
      cy.get('[data-cy^="inbound-batch-"]').should('exist')
    })

    it('应包含动态设备标签', () => {
      // 验证动态生成的设备标签
      cy.get('[data-cy^="device-selector-tag-"]').should('exist')
    })

    it('应包含动态详情项', () => {
      // 验证动态生成的详情项
      cy.get('[data-cy^="inventory-detail-item-"]').should('exist')
    })
  })
})

describe('Data-Cy 属性唯一性验证', () => {
  it('所有data-cy属性应该是唯一的', () => {
    cy.visit('/device/list')
    cy.get('[data-cy]').then($elements => {
      const dataCyValues = []
      $elements.each((index, element) => {
        const value = Cypress.$(element).attr('data-cy')
        if (value && !value.includes('{') && !value.includes('${')) {
          // 排除动态模板
          expect(dataCyValues).not.to.include(value, `重复的data-cy值: ${value}`)
          dataCyValues.push(value)
        }
      })
    })
  })
})

describe('Data-Cy 属性可访问性验证', () => {
  it('data-cy属性不应包含敏感信息', () => {
    const sensitivePatterns = ['password', 'token', 'secret', 'key', 'credential']
    cy.visit('/')
    cy.get('[data-cy]').each($element => {
      const value = $element.attr('data-cy')
      sensitivePatterns.forEach(pattern => {
        expect(value.toLowerCase()).not.to.include(pattern)
      })
    })
  })

  it('data-cy属性应使用小写字母和连字符', () => {
    cy.visit('/')
    cy.get('[data-cy]').each($element => {
      const value = $element.attr('data-cy')
      // 允许动态模板中的${}和{}字符
      const cleanValue = value.replace(/\$\{[^}]+\}|\{[^}]+\}/g, 'placeholder')
      expect(cleanValue).to.match(/^[a-z0-9-]+$/, `data-cy值格式不正确: ${value}`)
    })
  })
})

describe('货位管理页面 Data-Cy 验证', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/inventory/bin')
  })

  it('应包含页面级data-cy属性', () => {
    cy.get('[data-cy="bin-management-page"]').should('exist')
    cy.get('[data-cy="bin-add-button"]').should('exist')
    cy.get('[data-cy="bin-batch-create-button"]').should('exist')
    cy.get('[data-cy="bin-import-button"]').should('exist')
    cy.get('[data-cy="bin-export-button"]').should('exist')
  })

  it('应包含表格data-cy属性', () => {
    cy.get('[data-cy="bin-table"]').should('exist')
    cy.get('[data-cy="bin-pagination"]').should('exist')
  })

  it('应包含表格操作按钮data-cy属性', () => {
    cy.get('[data-cy="bin-view-button"]').should('exist')
    cy.get('[data-cy="bin-edit-button"]').should('exist')
    cy.get('[data-cy="bin-delete-button"]').should('exist')
  })

  it('应包含货位表单对话框data-cy属性', () => {
    cy.get('[data-cy="bin-add-button"]').click()
    cy.get('[data-cy="bin-form-dialog"]').should('be.visible')
    cy.get('[data-cy="bin-form"]').should('exist')
    cy.get('[data-cy="bin-code-input"]').should('exist')
    cy.get('[data-cy="bin-zone-input"]').should('exist')
    cy.get('[data-cy="bin-row-input"]').should('exist')
    cy.get('[data-cy="bin-column-input"]').should('exist')
    cy.get('[data-cy="bin-level-input"]').should('exist')
    cy.get('[data-cy="bin-type-select"]').should('exist')
    cy.get('[data-cy="bin-status-select"]').should('exist')
    cy.get('[data-cy="bin-form-cancel-button"]').should('exist')
    cy.get('[data-cy="bin-form-submit-button"]').should('exist')
  })

  it('应包含批量生成对话框data-cy属性', () => {
    cy.get('[data-cy="bin-batch-create-button"]').click()
    cy.get('[data-cy="bin-batch-create-dialog"]').should('be.visible')
    cy.get('[data-cy="bin-batch-form"]').should('exist')
    cy.get('[data-cy="bin-batch-zone-input"]').should('exist')
    cy.get('[data-cy="bin-batch-type-select"]').should('exist')
    cy.get('[data-cy="bin-batch-cancel-button"]').should('exist')
    cy.get('[data-cy="bin-batch-submit-button"]').should('exist')
  })

  it('应包含详情对话框data-cy属性', () => {
    cy.get('[data-cy="bin-view-button"]').first().click()
    cy.get('[data-cy="bin-detail-dialog"]').should('be.visible')
    cy.get('[data-cy="bin-detail-descriptions"]').should('exist')
    cy.get('[data-cy="bin-detail-close-button"]').should('exist')
  })
})

describe('用户管理页面 Data-Cy 验证', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/system/users')
  })

  it('应包含页面级data-cy属性', () => {
    cy.get('[data-cy="users-management-page"]').should('exist')
    cy.get('[data-cy="users-add-button"]').should('exist')
    cy.get('[data-cy="users-batch-delete-button"]').should('exist')
    cy.get('[data-cy="users-guide-button"]').should('exist')
  })

  it('应包含表格data-cy属性', () => {
    cy.get('[data-cy="users-table"]').should('exist')
    cy.get('[data-cy="users-view-button"]').should('exist')
    cy.get('[data-cy="users-edit-button"]').should('exist')
    cy.get('[data-cy="users-delete-button"]').should('exist')
  })

  it('应包含添加用户对话框data-cy属性', () => {
    cy.get('[data-cy="users-add-button"]').click()
    cy.get('[data-cy="users-add-dialog"]').should('be.visible')
    cy.get('[data-cy="users-add-form"]').should('exist')
    cy.get('[data-cy="users-add-username-input"]').should('exist')
    cy.get('[data-cy="users-add-password-input"]').should('exist')
    cy.get('[data-cy="users-add-realname-input"]').should('exist')
    cy.get('[data-cy="users-add-email-input"]').should('exist')
    cy.get('[data-cy="users-add-phone-input"]').should('exist')
    cy.get('[data-cy="users-add-role-select"]').should('exist')
    cy.get('[data-cy="users-add-status-radio-group"]').should('exist')
    cy.get('[data-cy="users-add-cancel-button"]').should('exist')
    cy.get('[data-cy="users-add-submit-button"]').should('exist')
  })

  it('应包含编辑用户对话框data-cy属性', () => {
    cy.get('[data-cy="users-edit-button"]').first().click()
    cy.get('[data-cy="users-edit-dialog"]').should('be.visible')
    cy.get('[data-cy="users-edit-form"]').should('exist')
    cy.get('[data-cy="users-edit-username-input"]').should('exist')
    cy.get('[data-cy="users-edit-realname-input"]').should('exist')
    cy.get('[data-cy="users-edit-email-input"]').should('exist')
    cy.get('[data-cy="users-edit-phone-input"]').should('exist')
    cy.get('[data-cy="users-edit-role-select"]').should('exist')
    cy.get('[data-cy="users-edit-status-radio-group"]').should('exist')
    cy.get('[data-cy="users-edit-cancel-button"]').should('exist')
    cy.get('[data-cy="users-edit-submit-button"]').should('exist')
  })

  it('应包含用户详情对话框data-cy属性', () => {
    cy.get('[data-cy="users-view-button"]').first().click()
    cy.get('[data-cy="users-detail-dialog"]').should('be.visible')
    cy.get('[data-cy="users-detail-descriptions"]').should('exist')
    cy.get('[data-cy="users-detail-close-button"]').should('exist')
  })
})

describe('审批对话框 Data-Cy 验证', () => {
  it('应包含审批对话框所有data-cy属性', () => {
    cy.get('[data-cy="approval-dialog"]').should('exist')
    cy.get('[data-cy="approval-business-info"]').should('exist')
    cy.get('[data-cy="approval-form"]').should('exist')
    cy.get('[data-cy="approval-result-radio-group"]').should('exist')
    cy.get('[data-cy="approval-approve-radio"]').should('exist')
    cy.get('[data-cy="approval-reject-radio"]').should('exist')
    cy.get('[data-cy="approval-comment-input"]').should('exist')
    cy.get('[data-cy="approval-cancel-button"]').should('exist')
  })
})

describe('筛选栏表单 Data-Cy 验证', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/device/list')
  })

  it('应包含动态筛选字段data-cy属性', () => {
    cy.get('[data-cy="unified-filter-bar"]').should('exist')
    // 验证动态生成的筛选字段
    cy.get('[data-cy^="filter-"]').should('exist')
  })

  it('应包含筛选栏按钮data-cy属性', () => {
    cy.get('[data-cy="filter-bar-search-btn"]').should('exist')
    cy.get('[data-cy="filter-bar-reset-btn"]').should('exist')
  })
})

describe('基础对话框组件 Data-Cy 验证', () => {
  it('应包含基础对话框按钮data-cy属性', () => {
    cy.get('[data-cy="dialog-overlay"]').should('exist')
    cy.get('[data-cy="dialog-container"]').should('exist')
    cy.get('[data-cy="dialog-cancel-button"]').should('exist')
    cy.get('[data-cy="dialog-confirm-button"]').should('exist')
  })
})

describe('数据表格组件 Data-Cy 验证', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/device/list')
  })

  it('应包含数据表格分页data-cy属性', () => {
    cy.get('[data-cy="data-table"]').should('exist')
    cy.get('[data-cy="data-table-pagination"]').should('exist')
  })
})
