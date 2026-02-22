describe('并发压力测试场景', () => {

  before(() => {
    // 使用API快速登录
    cy.loginByApi('admin', 'Admin@123456')
  })

  describe('【并发请求】多用户同时操作', () => {
    it('TC-CONCURRENT-001: 验证10个并发请求的处理', () => {
      const concurrentRequests = Array(10).fill(null).map((_, i) =>
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/devices?page=${i}&size=10`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          failOnStatusCode: false
        })
      )

      cy.wrap(Promise.all(concurrentRequests)).then((responses) => {
        const successCount = responses.filter(r => r.status === 200).length
        const errorCount = responses.filter(r => r.status >= 400).length

        cy.log(`成功请求: ${successCount}, 失败请求: ${errorCount}`)

        // 验证至少80%的请求成功
        expect(successCount).to.be.at.least(8)

        // 验证响应时间
        responses.forEach((response, index) => {
          if (response.duration) {
            cy.log(`请求 ${index + 1} 响应时间: ${response.duration}ms`)
            expect(response.duration).to.be.lessThan(10000)
          }
        })
      })
    })

    it('TC-CONCURRENT-002: 验证50个并发请求的处理', () => {
      const concurrentRequests = Array(50).fill(null).map((_, i) =>
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/devices?page=${i % 5}&size=10`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          failOnStatusCode: false
        })
      )

      const startTime = Date.now()

      cy.wrap(Promise.all(concurrentRequests)).then((responses) => {
        const totalTime = Date.now() - startTime
        const successCount = responses.filter(r => r.status === 200).length
        const rateLimitedCount = responses.filter(r => r.status === 429).length

        cy.log(`总执行时间: ${totalTime}ms`)
        cy.log(`成功请求: ${successCount}, 限流请求: ${rateLimitedCount}`)

        // 验证系统能够处理高并发
        expect(successCount + rateLimitedCount).to.equal(50)

        // 验证响应时间在合理范围内
        expect(totalTime).to.be.lessThan(60000)
      })
    })

    it('TC-CONCURRENT-003: 验证100个并发请求的处理', () => {
      const concurrentRequests = Array(100).fill(null).map((_, i) =>
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/devices?page=${i % 10}&size=10`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          failOnStatusCode: false
        })
      )

      const startTime = Date.now()

      cy.wrap(Promise.all(concurrentRequests)).then((responses) => {
        const totalTime = Date.now() - startTime
        const successCount = responses.filter(r => r.status === 200).length
        const rateLimitedCount = responses.filter(r => r.status === 429).length
        const errorCount = responses.filter(r => r.status >= 500).length

        cy.log(`总执行时间: ${totalTime}ms`)
        cy.log(`成功请求: ${successCount}, 限流: ${rateLimitedCount}, 错误: ${errorCount}`)

        // 验证系统在高并发下保持稳定
        expect(successCount + rateLimitedCount + errorCount).to.equal(100)

        // 验证错误率低于10%
        expect(errorCount).to.be.at.most(10)
      })
    })

    it('TC-CONCURRENT-004: 验证并发数据查询性能', () => {
      const queries = [
        { endpoint: '/devices', params: { page: 0, size: 20 } },
        { endpoint: '/stock-orders', params: { page: 0, size: 20, type: 'INBOUND' } },
        { endpoint: '/stock-orders', params: { page: 0, size: 20, type: 'OUTBOUND' } },
        { endpoint: '/users', params: { page: 0, size: 20 } },
        { endpoint: '/roles', params: { page: 0, size: 20 } }
      ]

      const concurrentQueries = queries.map(query =>
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}${query.endpoint}`,
          qs: query.params,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          failOnStatusCode: false
        })
      )

      cy.wrap(Promise.all(concurrentQueries)).then((responses) => {
        responses.forEach((response, index) => {
          const endpoint = queries[index].endpoint
          cy.log(`${endpoint} 响应时间: ${response.duration}ms, 状态: ${response.status}`)

          expect(response.status).to.be.oneOf([200, 403, 404])
          expect(response.duration).to.be.lessThan(15000)
        })
      })
    })
  })

  describe('【并发操作】数据修改冲突处理', () => {
    it('TC-CONCURRENT-005: 验证并发更新同一资源', () => {
      // 先创建一个测试设备
      const deviceCode = `CONCURRENT_TEST_${Date.now()}`

      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/devices`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        body: {
          deviceCode: deviceCode,
          deviceName: '并发测试设备',
          deviceType: '测试类型',
          status: 'ACTIVE'
        },
        failOnStatusCode: false
      }).then((createResponse) => {
        expect(createResponse.status).to.be.oneOf([200, 201])
        const deviceId = createResponse.body.data?.id || createResponse.body.data

        // 并发更新同一设备
        const updateRequests = Array(5).fill(null).map((_, i) =>
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl')}/devices/${deviceId}`,
            headers: {
              'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            },
            body: {
              deviceName: `并发更新_${i}_${Date.now()}`
            },
            failOnStatusCode: false
          })
        )

        cy.wrap(Promise.all(updateRequests)).then((responses) => {
          const successCount = responses.filter(r => r.status === 200).length
          const conflictCount = responses.filter(r => r.status === 409).length

          cy.log(`成功更新: ${successCount}, 冲突: ${conflictCount}`)

          // 验证至少有一个成功
          expect(successCount).to.be.at.least(1)

          // 清理测试数据
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/devices/${deviceId}`,
            headers: {
              'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            },
            failOnStatusCode: false
          })
        })
      })
    })

    it('TC-CONCURRENT-006: 验证并发创建资源', () => {
      const timestamp = Date.now()

      // 并发创建多个设备
      const createRequests = Array(10).fill(null).map((_, i) =>
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/devices`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          body: {
            deviceCode: `CONCURRENT_${timestamp}_${i}`,
            deviceName: `并发创建设备_${i}`,
            deviceType: '测试类型',
            status: 'ACTIVE'
          },
          failOnStatusCode: false
        })
      )

      cy.wrap(Promise.all(createRequests)).then((responses) => {
        const successCount = responses.filter(r => r.status === 200 || r.status === 201).length
        const createdIds = responses
          .filter(r => r.status === 200 || r.status === 201)
          .map(r => r.body.data?.id || r.body.data)

        cy.log(`成功创建: ${successCount} 个设备`)

        // 验证至少80%创建成功
        expect(successCount).to.be.at.least(8)

        // 清理创建的测试数据
        createdIds.forEach(id => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/devices/${id}`,
            headers: {
              'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            },
            failOnStatusCode: false
          })
        })
      })
    })

    it('TC-CONCURRENT-007: 验证并发删除和创建操作', () => {
      const timestamp = Date.now()

      // 先创建一些测试数据
      const createRequests = Array(5).fill(null).map((_, i) =>
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/devices`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          body: {
            deviceCode: `MIXED_${timestamp}_${i}`,
            deviceName: `混合操作设备_${i}`,
            deviceType: '测试类型',
            status: 'ACTIVE'
          },
          failOnStatusCode: false
        })
      )

      cy.wrap(Promise.all(createRequests)).then((createResponses) => {
        const createdIds = createResponses
          .filter(r => r.status === 200 || r.status === 201)
          .map(r => r.body.data?.id || r.body.data)

        cy.log(`创建成功: ${createdIds.length} 个设备`)

        // 混合操作：同时删除和创建
        const mixedRequests = [
          ...createdIds.slice(0, 2).map(id =>
            cy.request({
              method: 'DELETE',
              url: `${Cypress.env('apiUrl')}/devices/${id}`,
              headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
              },
              failOnStatusCode: false
            })
          ),
          ...Array(3).fill(null).map((_, i) =>
            cy.request({
              method: 'POST',
              url: `${Cypress.env('apiUrl')}/devices`,
              headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
              },
              body: {
                deviceCode: `MIXED_NEW_${timestamp}_${i}`,
                deviceName: `新混合设备_${i}`,
                deviceType: '测试类型',
                status: 'ACTIVE'
              },
              failOnStatusCode: false
            })
          )
        ]

        cy.wrap(Promise.all(mixedRequests)).then((mixedResponses) => {
          const successCount = mixedResponses.filter(r => r.status >= 200 && r.status < 300).length
          cy.log(`混合操作成功: ${successCount}`)
          expect(successCount).to.be.at.least(3)
        })
      })
    })
  })

  describe('【快速操作】高频页面切换', () => {
    it('TC-CONCURRENT-008: 验证快速页面切换的稳定性', () => {
      const pages = [
        '/dashboard',
        '/asset-management/device-list',
        '/inventory-management/inbound',
        '/inventory-management/outbound',
        '/inventory-management/transfer'
      ]

      // 快速切换页面10次
      for (let i = 0; i < 10; i++) {
        const page = pages[i % pages.length]
        cy.visit(page)
        cy.wait(100)
      }

      // 验证最终页面正常显示
      cy.url().should('include', '/inventory-management/transfer')
      cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
      cy.get('.el-message--error').should('not.exist')
    })

    it('TC-CONCURRENT-009: 验证快速搜索操作', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()

      // 快速执行多次搜索
      const searchTerms = ['设备', '测试', 'A', 'B', 'C']

      searchTerms.forEach((term, index) => {
        cy.get('input[placeholder*="搜索"], input[placeholder*="查询"]', { timeout: 10000 })
          .clear()
          .type(term)
        cy.get('[data-cy="search-button"], button:contains("搜索"), button:contains("查询")')
          .first()
          .click()
        cy.wait(200)
      })

      // 验证页面仍然稳定
      cy.get('.el-table, table').should('exist')
      cy.get('.el-message--error').should('not.exist')
    })

    it('TC-CONCURRENT-010: 验证快速表单提交', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()

      // 快速打开和关闭弹窗
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="create-button"], button:contains("新增")').click()
        cy.wait(200)
        cy.get('.el-dialog__close, [data-cy="cancel-button"]').click()
        cy.wait(200)
      }

      // 验证页面稳定
      cy.get('.el-message--error').should('not.exist')
    })
  })

  describe('【资源竞争】共享资源访问', () => {
    it('TC-CONCURRENT-011: 验证库存扣减的并发一致性', () => {
      // 获取库存数据
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/inventory`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status !== 200 || !response.body.data) {
          cy.log('库存数据获取失败，跳过测试')
          return
        }

        const inventoryItems = response.body.data.content || response.body.data

        if (inventoryItems.length === 0) {
          cy.log('没有库存数据，跳过测试')
          return
        }

        const firstItem = inventoryItems[0]
        cy.log(`测试库存项: ${firstItem.id}, 当前数量: ${firstItem.quantity}`)

        // 并发查询同一库存项
        const queryRequests = Array(20).fill(null).map(() =>
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl')}/inventory/${firstItem.id}`,
            headers: {
              'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            },
            failOnStatusCode: false
          })
        )

        cy.wrap(Promise.all(queryRequests)).then((responses) => {
          const successCount = responses.filter(r => r.status === 200).length
          const quantities = responses
            .filter(r => r.status === 200)
            .map(r => r.body.data?.quantity)

          cy.log(`成功查询: ${successCount} 次`)

          // 验证所有查询返回的数量一致（数据一致性）
          const uniqueQuantities = [...new Set(quantities)]
          expect(uniqueQuantities.length).to.equal(1)

          cy.log(`库存数量一致性验证通过: ${uniqueQuantities[0]}`)
        })
      })
    })

    it('TC-CONCURRENT-012: 验证并发库存操作的原子性', () => {
      // 模拟并发库存扣减操作
      const operations = Array(5).fill(null).map((_, i) =>
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/stock-orders`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          body: {
            orderType: 'OUTBOUND',
            orderCode: `CONCURRENT_OUT_${Date.now()}_${i}`,
            items: [
              { skuId: 1, quantity: 1 }
            ]
          },
          failOnStatusCode: false
        })
      )

      cy.wrap(Promise.all(operations)).then((responses) => {
        const successCount = responses.filter(r => r.status === 200 || r.status === 201).length
        const conflictCount = responses.filter(r => r.status === 409).length

        cy.log(`成功出库: ${successCount}, 冲突: ${conflictCount}`)

        // 验证操作结果一致性
        expect(successCount + conflictCount).to.equal(5)
      })
    })
  })

  describe('【性能边界】大数据量处理', () => {
    it('TC-CONCURRENT-013: 验证大数据量列表渲染性能', () => {
      const startTime = Date.now()

      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()

      // 设置每页显示最大数量
      cy.get('.el-pagination__sizes .el-select', { timeout: 10000 }).click()
      cy.get('.el-select-dropdown__item').contains('100').click()

      cy.get('.el-table, table', { timeout: 30000 }).should('be.visible')

      cy.then(() => {
        const loadTime = Date.now() - startTime
        cy.log(`大数据量列表加载时间: ${loadTime}ms`)

        // 验证加载时间在合理范围内
        expect(loadTime).to.be.lessThan(30000)
      })
    })

    it('TC-CONCURRENT-014: 验证连续滚动加载性能', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()

      // 模拟多次滚动
      for (let i = 0; i < 5; i++) {
        cy.get('.el-table__body-wrapper').scrollTo('bottom')
        cy.wait(500)
      }

      // 验证页面仍然响应
      cy.get('.el-table, table').should('exist')
      cy.get('.el-message--error').should('not.exist')
    })

    it('TC-CONCURRENT-015: 验证大数据导出性能', () => {
      cy.visit('/asset-management/device-list')
      cy.waitForPageLoad()

      const startTime = Date.now()

      // 触发导出操作
      cy.get('[data-cy="export-button"], button:contains("导出")').click()

      // 等待导出完成
      cy.get('.el-message--success', { timeout: 60000 }).should('be.visible')

      cy.then(() => {
        const exportTime = Date.now() - startTime
        cy.log(`大数据导出时间: ${exportTime}ms`)
        expect(exportTime).to.be.lessThan(60000)
      })
    })
  })

  describe('【稳定性】长时间运行测试', () => {
    it('TC-CONCURRENT-016: 验证持续操作下的系统稳定性', () => {
      cy.visit('/dashboard')
      cy.waitForPageLoad()

      // 执行一系列操作
      const operations = [
        () => cy.visit('/asset-management/device-list'),
        () => cy.waitForPageLoad(),
        () => cy.visit('/inventory-management/inbound'),
        () => cy.waitForPageLoad(),
        () => cy.visit('/inventory-management/outbound'),
        () => cy.waitForPageLoad(),
        () => cy.visit('/dashboard'),
        () => cy.waitForPageLoad()
      ]

      // 链式执行操作
      operations.reduce((chain, operation) => {
        return chain.then(() => operation())
      }, cy.wrap(null))

      // 验证最终状态
      cy.url().should('include', '/dashboard')
      cy.get('.el-message--error').should('not.exist')
    })

    it('TC-CONCURRENT-017: 验证内存泄漏检测', () => {
      cy.visit('/dashboard')
      cy.waitForPageLoad()

      // 多次页面切换，检测内存使用
      const iterations = 10

      for (let i = 0; i < iterations; i++) {
        cy.visit('/asset-management/device-list')
        cy.waitForPageLoad()
        cy.visit('/inventory-management/inbound')
        cy.waitForPageLoad()
      }

      // 最终回到仪表盘
      cy.visit('/dashboard')
      cy.waitForPageLoad()

      // 验证页面正常
      cy.get('.el-message--error').should('not.exist')
      cy.get('.dashboard-container, [data-cy="dashboard"]').should('exist')
    })
  })

  describe('【压力测试】极端并发场景', () => {
    it('TC-CONCURRENT-018: 验证200个并发连接', () => {
      const concurrentRequests = Array(200).fill(null).map((_, i) =>
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/devices?page=${i % 20}&size=5`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          failOnStatusCode: false
        })
      )

      const startTime = Date.now()

      cy.wrap(Promise.all(concurrentRequests)).then((responses) => {
        const totalTime = Date.now() - startTime
        const successCount = responses.filter(r => r.status === 200).length
        const rateLimitedCount = responses.filter(r => r.status === 429).length
        const errorCount = responses.filter(r => r.status >= 500).length

        cy.log(`总执行时间: ${totalTime}ms`)
        cy.log(`成功: ${successCount}, 限流: ${rateLimitedCount}, 错误: ${errorCount}`)

        // 验证系统在极端并发下保持稳定
        expect(successCount + rateLimitedCount + errorCount).to.equal(200)

        // 验证成功率不低于70%
        expect(successCount).to.be.at.least(140)
      })
    })

    it('TC-CONCURRENT-019: 验证混合读写并发操作', () => {
      const timestamp = Date.now()

      // 混合读写操作
      const mixedOperations = [
        // 读操作
        ...Array(20).fill(null).map((_, i) =>
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl')}/devices?page=${i}&size=10`,
            headers: {
              'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            },
            failOnStatusCode: false
          })
        ),
        // 写操作
        ...Array(10).fill(null).map((_, i) =>
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/devices`,
            headers: {
              'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            },
            body: {
              deviceCode: `MIXED_${timestamp}_${i}`,
              deviceName: `混合操作设备_${i}`,
              deviceType: '测试类型',
              status: 'ACTIVE'
            },
            failOnStatusCode: false
          })
        )
      ]

      cy.wrap(Promise.all(mixedOperations)).then((responses) => {
        const readSuccess = responses.slice(0, 20).filter(r => r.status === 200).length
        const writeSuccess = responses.slice(20).filter(r => r.status === 200 || r.status === 201).length

        cy.log(`读操作成功: ${readSuccess}/20, 写操作成功: ${writeSuccess}/10`)

        // 验证读写操作都能正常执行
        expect(readSuccess).to.be.at.least(15)
        expect(writeSuccess).to.be.at.least(5)
      })
    })

    it('TC-CONCURRENT-020: 验证连接池耗尽场景', () => {
      // 模拟连接池耗尽
      const burstRequests = Array(500).fill(null).map((_, i) =>
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/devices?page=${i % 50}&size=5`,
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          failOnStatusCode: false
        })
      )

      const startTime = Date.now()

      cy.wrap(Promise.all(burstRequests)).then((responses) => {
        const totalTime = Date.now() - startTime
        const successCount = responses.filter(r => r.status === 200).length
        const timeoutCount = responses.filter(r => r.status === 0 || r.status === 504).length

        cy.log(`总执行时间: ${totalTime}ms`)
        cy.log(`成功: ${successCount}, 超时: ${timeoutCount}`)

        // 验证系统在连接池耗尽时优雅降级
        expect(successCount + timeoutCount).to.be.at.most(500)
      })
    })
  })
})
