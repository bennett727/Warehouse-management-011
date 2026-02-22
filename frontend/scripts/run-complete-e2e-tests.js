/**
 * 完整E2E测试套件运行脚本
 * 按顺序执行所有E2E测试，生成完整测试报告
 *
 * @file: run-complete-e2e-tests.js
 * @description: 运行完整的端到端测试套件，包括所有模块的测试
 * @version: 2.0.0
 *
 * 使用方法:
 *   npm run test:e2e:complete
 *   node scripts/run-complete-e2e-tests.js
 *   node scripts/run-complete-e2e-tests.js --help
 *   node scripts/run-complete-e2e-tests.js --skip-health-check
 *
 * 功能说明:
 *   1. 执行环境预检查
 *   2. 按优先级顺序运行测试套件
 *   3. 收集所有测试结果
 *   4. 生成汇总报告
 *   5. 输出测试统计信息
 *
 * 环境变量:
 *   - API_HOST: 后端API主机 (默认: localhost)
 *   - API_PORT: 后端API端口 (默认: 8080)
 *   - CYPRESS_BROWSER: 测试浏览器 (默认: edge)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  logger,
  CONFIG,
  Timer,
  parseArgs,
  showHelp,
  exit,
  checkService,
  setLogLevel,
  LogLevel,
  formatBytes
} from './utils/index.js';

// 解析命令行参数
const args = parseArgs();

// 显示帮助
if (args.flags.help || args.flags.h) {
  showHelp('run-complete-e2e-tests.js', {
    examples: [
      'npm run test:e2e:complete',
      'node scripts/run-complete-e2e-tests.js',
      'node scripts/run-complete-e2e-tests.js --skip-health-check'
    ]
  });
}

// 设置日志级别
if (args.flags.verbose || args.flags.v) {
  setLogLevel(LogLevel.DEBUG);
}
if (args.flags.silent) {
  setLogLevel(LogLevel.ERROR);
}

// 是否跳过健康检查
const skipHealthCheck = args.flags['skip-health-check'] || args.flags.skipHealthCheck;

// 测试套件配置
const TEST_SUITES = [
  {
    name: '登录认证测试',
    file: 'login.cy.js',
    priority: 1,
    required: true,
    description: '验证用户登录、登出和权限控制'
  },
  {
    name: '仪表盘测试',
    file: 'dashboard.cy.js',
    priority: 2,
    required: false,
    description: '验证仪表盘数据展示和交互'
  },
  {
    name: '资产管理测试',
    file: 'asset-management.cy.js',
    priority: 3,
    required: false,
    description: '验证设备资产的CRUD操作'
  },
  {
    name: '库存管理测试',
    file: 'inventory-management.cy.js',
    priority: 4,
    required: false,
    description: '验证库存订单和库存查询功能'
  },
  {
    name: '边界和异常测试',
    file: 'boundary-and-exception-tests.cy.js',
    priority: 5,
    required: false,
    description: '验证边界值处理和异常场景'
  }
];

// 全局计时器
const globalTimer = new Timer();

/**
 * 运行单个测试套件
 * @param {Object} suite - 测试套件配置
 * @returns {Promise<{success: boolean, duration: number, output: string}>}
 */
function runTestSuite(suite) {
  return new Promise((resolve) => {
    const timer = new Timer();
    const specPath = path.join('tests/cypress/e2e', suite.file);

    logger.section(suite.name);
    logger.info(`文件: ${suite.file}`);
    logger.info(`描述: ${suite.description}`);
    if (suite.required) {
      logger.warning('此测试为必需项，失败将终止后续测试');
    }

    timer.start();

    const cypressArgs = [
      'run',
      '--config-file', CONFIG.cypress.configFile,
      '--spec', specPath,
      '--browser', CONFIG.cypress.browser,
      '--headless'
    ];

    const cypress = spawn('npx', ['cypress', ...cypressArgs], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    cypress.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    cypress.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    cypress.on('close', (code) => {
      const duration = timer.stop();
      const success = code === 0;

      if (success) {
        logger.success(`测试通过，耗时: ${timer.format()}`);
      } else {
        logger.error(`测试失败，耗时: ${timer.format()}`);
      }

      resolve({ success, duration, output, suite });
    });

    cypress.on('error', (err) => {
      logger.error(`启动测试失败: ${err.message}`);
      resolve({ success: false, duration: timer.stop(), output, suite, error: err.message });
    });
  });
}

/**
 * 执行健康检查
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  if (skipHealthCheck) {
    logger.warning('跳过健康检查（--skip-health-check）');
    return true;
  }

  logger.section('环境健康检查');

  logger.info(`检查后端API服务: ${CONFIG.api.url}`);
  const apiHealthy = await checkService({
    host: CONFIG.api.host,
    port: CONFIG.api.port,
    path: CONFIG.api.healthPath,
    timeout: 5000
  });

  if (!apiHealthy.ok) {
    logger.error('后端API服务未运行或无法访问');
    logger.info('请先启动后端服务: cd ../spring_boot && mvn spring-boot:run');
    return false;
  }
  logger.success('后端API服务健康');

  return true;
}

/**
 * 生成测试报告
 * @param {Array} results - 测试结果数组
 */
function generateReport(results) {
  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = total - passed;
  const skipped = results.filter(r => r.skipped).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  logger.title('完整E2E测试报告');

  // 详细结果
  logger.section('详细结果');
  results.forEach((result, index) => {
    const suite = TEST_SUITES[index];
    const statusIcon = result.skipped ? '⏭️ ' : (result.success ? '✅' : '❌');
    const statusText = result.skipped ? '跳过' : (result.success ? '通过' : '失败');

    if (result.skipped) {
      logger.warning(`${index + 1}. ${suite.name}: ${statusIcon} ${statusText}`);
    } else if (result.success) {
      logger.success(`${index + 1}. ${suite.name}: ${statusIcon} ${statusText} (${new Timer().format.call({duration: result.duration})})`);
    } else {
      logger.error(`${index + 1}. ${suite.name}: ${statusIcon} ${statusText} (${new Timer().format.call({duration: result.duration})})`);
    }
  });

  // 汇总统计
  logger.section('汇总统计');
  logger.info(`总套件数: ${total}`);
  logger.success(`通过: ${passed}`);
  if (failed > 0) logger.error(`失败: ${failed}`);
  if (skipped > 0) logger.warning(`跳过: ${skipped}`);
  logger.info(`总耗时: ${(totalDuration / 1000).toFixed(2)} 秒`);
  logger.info(`成功率: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);

  // 保存详细报告
  const reportPath = path.join(CONFIG.paths.reports, 'complete-test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      skipped,
      totalDuration,
      passRate: ((passed / (total - skipped)) * 100).toFixed(1) + '%'
    },
    results: results.map((r, i) => ({
      suite: TEST_SUITES[i].name,
      file: TEST_SUITES[i].file,
      success: r.success,
      skipped: r.skipped || false,
      duration: r.duration,
      error: r.error || null
    }))
  };

  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    logger.info(`详细报告已保存: ${reportPath}`);
  } catch (err) {
    logger.warning(`保存报告失败: ${err.message}`);
  }

  return { total, passed, failed, skipped, totalDuration };
}

/**
 * 主函数
 */
async function main() {
  logger.title('完整E2E测试套件');
  globalTimer.start();

  try {
    // 1. 健康检查
    const healthy = await healthCheck();
    if (!healthy) {
      exit(1, '健康检查失败，测试终止');
    }

    // 2. 执行测试套件
    logger.info(`\n计划运行 ${TEST_SUITES.length} 个测试套件\n`);

    const results = [];
    let shouldContinue = true;

    for (const suite of TEST_SUITES) {
      if (!shouldContinue) {
        logger.warning(`\n跳过: ${suite.name} (前置测试失败)`);
        results.push({ success: false, duration: 0, skipped: true, suite });
        continue;
      }

      const result = await runTestSuite(suite);
      results.push(result);

      // 如果必需的测试失败，停止后续测试
      if (suite.required && !result.success) {
        logger.error('\n必需测试失败，停止执行后续测试');
        shouldContinue = false;
      }
    }

    // 3. 生成报告
    const summary = generateReport(results);

    // 4. 输出总耗时
    const globalDuration = globalTimer.stop();
    logger.section('执行完成');
    logger.info(`总执行时间: ${(globalDuration / 1000).toFixed(2)} 秒`);

    // 5. 退出
    if (summary.failed === 0) {
      exit(0, '所有测试通过！');
    } else {
      exit(1, `测试完成，${summary.failed} 个套件失败`);
    }

  } catch (error) {
    logger.error(`执行出错: ${error.message}`);
    logger.debug(error.stack);
    exit(1, '执行失败');
  }
}

// 执行主函数
main();
