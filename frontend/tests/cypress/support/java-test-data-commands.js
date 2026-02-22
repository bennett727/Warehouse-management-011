/**
 * Java后端测试数据管理命令
 *
 * 功能说明：
 * 与Java后端TestDataInitializationService集成，提供：
 * 1. 测试数据状态检查
 * 2. 前后端数据一致性验证
 * 3. 测试数据健康检查
 *
 * 优势：
 * - 使用真实后端数据，而非Mock数据
 * - 确保前后端数据同步
 * - 可验证后端业务逻辑正确性
 *
 * @author 开发团队
 * @version 1.0.0
 * @since 2026-02-22
 */

/**
 * 检查测试数据健康状态
 * 调用后端API验证测试数据是否已正确初始化
 */
Cypress.Commands.add('checkTestDataHealth', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/test/e2e/health`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.success) {
      const health = response.body.data;
      cy.log('测试数据健康状态:', health.status);
      cy.log('  - 设备数:', health.deviceCount);
      cy.log('  - 订单数:', health.orderCount);
      cy.log('  - 用户数:', health.userCount);
      return cy.wrap(health);
    } else {
      cy.log('警告: 无法获取测试数据健康状态');
      return cy.wrap({ status: 'unknown', deviceCount: 0, orderCount: 0 });
    }
  });
});

/**
 * 验证前后端数据一致性
 * 确保前端显示的数据与后端数据库一致
 */
Cypress.Commands.add('verifyDataConsistency', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/test/e2e/consistency-check`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.success) {
      const result = response.body.data;
      cy.log('数据一致性检查结果:');
      cy.log('  - 总设备数:', result.totalDevices);
      cy.log('  - 测试设备数:', result.testDevices);
      cy.log('  - 总订单数:', result.totalOrders);
      cy.log('  - 测试订单数:', result.testOrders);
      cy.log('  - 一致性状态:', result.isConsistent ? '通过' : '失败');
      cy.log('  - 消息:', result.message);

      // 验证一致性
      expect(result.isConsistent, result.message).to.be.true;

      return cy.wrap(result);
    } else {
      throw new Error('数据一致性检查失败: ' + (response.body?.message || '未知错误'));
    }
  });
});

/**
 * 获取测试数据统计
 * 用于测试报告和数据分析
 */
Cypress.Commands.add('getTestDataStatistics', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/test/e2e/statistics`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.success) {
      const stats = response.body.data;
      cy.log('测试数据统计:');
      cy.log('  - 总设备数:', stats.totalDevices);
      cy.log('  - 测试设备数:', stats.testDevices);
      cy.log('  - 总订单数:', stats.totalOrders);
      cy.log('  - 测试订单数:', stats.testOrders);
      cy.log('  - 总用户数:', stats.totalUsers);
      return cy.wrap(stats);
    } else {
      cy.log('警告: 无法获取测试数据统计');
      return cy.wrap({});
    }
  });
});

/**
 * 等待测试数据准备就绪
 * 在测试开始前确保数据已正确初始化
 */
Cypress.Commands.add('waitForTestDataReady', (options = {}) => {
  const { timeout = 30000, interval = 1000 } = options;
  const startTime = Date.now();

  const checkDataReady = () => {
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/test/e2e/health`,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 &&
          response.body.success &&
          response.body.data.status === 'healthy') {
        cy.log('测试数据已准备就绪');
        return cy.wrap(response.body.data);
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`等待测试数据准备就绪超时 (${timeout}ms)`);
      }

      cy.log('等待测试数据准备就绪...');
      cy.wait(interval);
      return checkDataReady();
    });
  };

  return checkDataReady();
});

/**
 * 验证页面数据与后端一致性
 * 比较前端页面显示的数据与后端API返回的数据
 */
Cypress.Commands.add('verifyPageDataWithBackend', (pageType, options = {}) => {
  const { apiEndpoint, dataKey, pageSelector } = options;

  // 获取后端数据
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${apiEndpoint}`,
    failOnStatusCode: false
  }).then((apiResponse) => {
    if (apiResponse.status !== 200 || !apiResponse.body.success) {
      throw new Error(`获取后端数据失败: ${apiResponse.body?.message || '未知错误'}`);
    }

    const backendData = apiResponse.body.data;
    const backendCount = Array.isArray(backendData) ? backendData.length :
                        backendData?.content ? backendData.content.length :
                        backendData?.totalElements || 0;

    cy.log(`后端${pageType}数据数量:`, backendCount);

    // 获取前端显示的数据数量
    cy.get(pageSelector || '.el-table__body tbody tr', { timeout: 10000 })
      .then(($rows) => {
        const frontendCount = $rows.length;
        cy.log(`前端${pageType}显示数量:`, frontendCount);

        // 验证数量一致（允许一定误差，因为可能有分页）
        if (backendCount <= 10) {
          expect(frontendCount, `${pageType}数据前后端数量应一致`).to.equal(backendCount);
        } else {
          expect(frontendCount, `${pageType}前端应显示数据`).to.be.greaterThan(0);
        }

        return cy.wrap({
          backendCount,
          frontendCount,
          isConsistent: backendCount <= 10 ? backendCount === frontendCount : frontendCount > 0
        });
      });
  });
});

/**
 * 数据驱动测试 - 从后端获取真实数据进行测试
 * 替代Mock数据，使用真实业务数据
 */
Cypress.Commands.add('getRealTestData', (dataType, options = {}) => {
  const { size = 10, filters = {} } = options;

  const endpoints = {
    devices: '/devices',
    orders: '/stock-orders',
    users: '/users',
    inventory: '/inventory',
    warehouses: '/warehouses'
  };

  const endpoint = endpoints[dataType];
  if (!endpoint) {
    throw new Error(`未知的数据类型: ${dataType}`);
  }

  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    qs: { size, ...filters },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.success) {
      const data = response.body.data?.content || response.body.data || [];
      cy.log(`获取到 ${data.length} 条${dataType}真实数据`);
      return cy.wrap(data);
    } else {
      cy.log(`警告: 无法获取${dataType}数据`);
      return cy.wrap([]);
    }
  });
});

/**
 * 测试数据清理标记
 * 标记测试数据以便后续清理
 */
Cypress.Commands.add('markTestData', (dataType, dataId) => {
  cy.log(`标记${dataType}数据: ${dataId}`);
  // 将标记存储在Cypress环境变量中
  const markedData = Cypress.env('markedTestData') || {};
  if (!markedData[dataType]) {
    markedData[dataType] = [];
  }
  markedData[dataType].push(dataId);
  Cypress.env('markedTestData', markedData);
});

/**
 * 导出测试数据报告
 * 生成测试数据使用情况的报告
 */
Cypress.Commands.add('exportTestDataReport', () => {
  return cy.getTestDataStatistics().then((stats) => {
    const report = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      markedData: Cypress.env('markedTestData') || {},
      summary: {
        totalDevices: stats.totalDevices || 0,
        testDevices: stats.testDevices || 0,
        totalOrders: stats.totalOrders || 0,
        testOrders: stats.testOrders || 0
      }
    };

    cy.log('测试数据报告:');
    cy.log(JSON.stringify(report, null, 2));

    // 写入文件供后续分析
    cy.writeFile('cypress/reports/test-data-report.json', report);

    return cy.wrap(report);
  });
});

export default {
  checkTestDataHealth: () => cy.checkTestDataHealth(),
  verifyDataConsistency: () => cy.verifyDataConsistency(),
  getTestDataStatistics: () => cy.getTestDataStatistics(),
  waitForTestDataReady: (options) => cy.waitForTestDataReady(options),
  verifyPageDataWithBackend: (pageType, options) => cy.verifyPageDataWithBackend(pageType, options),
  getRealTestData: (dataType, options) => cy.getRealTestData(dataType, options),
  exportTestDataReport: () => cy.exportTestDataReport()
};
