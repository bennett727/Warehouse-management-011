/**
 * 定时测试运行脚本
 * 用于CI/CD环境的定时测试任务
 *
 * @file: run-scheduled-tests.js
 * @description: 按计划执行测试套件，支持多种测试类型和报告输出
 * @version: 1.0.0
 *
 * 使用方法:
 *   npm run test:scheduled
 * 或
 *   node scripts/run-scheduled-tests.js [测试类型]
 *
 * 参数:
 *   - 测试类型: smoke（冒烟测试）| regression（回归测试）| full（完整测试）
 *   - 默认为 smoke
 *
 * 功能说明:
 *   1. 解析测试类型参数
 *   2. 根据类型选择测试用例:
 *      - smoke: 核心功能快速验证
 *      - regression: 全量回归测试
 *      - full: 包含边界和性能测试
 *   3. 执行选定的测试套件
 *   4. 生成JSON格式报告
 *   5. 支持CI环境集成
 *
 * 环境变量:
 *   - CI: 是否在CI环境运行（true/false）
 *   - TEST_TYPE: 测试类型（覆盖命令行参数）
 *   - SLACK_WEBHOOK: Slack通知Webhook（可选）
 *
 * 输出:
 *   - 控制台输出
 *   - tests/cypress/reports/scheduled-test-report.json
 *
 * 依赖:
 *   - Node.js内置模块: child_process, fs, path
 *   - 外部命令: cypress
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试类型配置
const TEST_CONFIGS = {
  smoke: {
    name: '冒烟测试',
    specs: [
      'tests/cypress/e2e/login.cy.js',
      'tests/cypress/e2e/dashboard.cy.js'
    ],
    timeout: 300000 // 5分钟
  },
  regression: {
    name: '回归测试',
    specs: [
      'tests/cypress/e2e/login.cy.js',
      'tests/cypress/e2e/dashboard.cy.js',
      'tests/cypress/e2e/asset-management.cy.js',
      'tests/cypress/e2e/inventory-management.cy.js'
    ],
    timeout: 600000 // 10分钟
  },
  full: {
    name: '完整测试',
    specs: [
      'tests/cypress/e2e/*.cy.js'
    ],
    timeout: 1200000 // 20分钟
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 解析测试类型
 * @returns {string} - 测试类型
 */
function parseTestType() {
  const envType = process.env.TEST_TYPE;
  if (envType && TEST_CONFIGS[envType]) {
    return envType;
  }

  const args = process.argv.slice(2);
  const type = args[0];

  if (type && TEST_CONFIGS[type]) {
    return type;
  }

  return 'smoke';
}

/**
 * 运行测试
 * @param {Object} config - 测试配置
 * @returns {Promise<{success: boolean, duration: number}>}
 */
function runTests(config) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    log(`\n🚀 开始执行: ${config.name}`, 'cyan');
    log(`📋 测试用例: ${config.specs.join(', ')}`, 'blue');

    const specArg = config.specs.length === 1
      ? config.specs[0]
      : config.specs.join(',');

    const args = [
      'run',
      '--config-file', 'config/cypress.config.js',
      '--spec', `"${specArg}"`,
      '--browser', 'edge',
      '--headless'
    ];

    const cypress = spawn('npx', ['cypress', ...args], {
      stdio: 'inherit',
      shell: true
    });

    cypress.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      if (success) {
        log(`\n✅ ${config.name} 完成`, 'green');
      } else {
        log(`\n❌ ${config.name} 失败`, 'red');
      }

      resolve({ success, duration });
    });
  });
}

/**
 * 保存测试报告
 * @param {Object} result - 测试结果
 * @param {string} testType - 测试类型
 */
function saveReport(result, testType) {
  const reportDir = path.join(__dirname, '..', 'tests', 'cypress', 'reports');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    testType,
    testName: TEST_CONFIGS[testType].name,
    result: result.success ? 'PASSED' : 'FAILED',
    duration: result.duration,
    environment: {
      ci: process.env.CI === 'true',
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  const reportPath = path.join(reportDir, 'scheduled-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`\n📄 报告已保存: ${reportPath}`, 'blue');
}

/**
 * 主函数
 */
async function main() {
  const testType = parseTestType();
  const config = TEST_CONFIGS[testType];

  log('⏰ 定时测试任务', 'cyan');
  log(`📋 测试类型: ${config.name}\n`, 'blue');

  const result = await runTests(config);

  // 保存报告
  saveReport(result, testType);

  // 输出摘要
  log('\n' + '='.repeat(60), 'blue');
  log('测试摘要', 'blue');
  log('='.repeat(60), 'blue');
  log(`类型: ${config.name}`, 'cyan');
  log(`结果: ${result.success ? '✅ 通过' : '❌ 失败'}`, result.success ? 'green' : 'red');
  log(`耗时: ${(result.duration / 1000).toFixed(2)} 秒`, 'blue');
  log('='.repeat(60), 'blue');

  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ 执行出错:', error.message);
  process.exit(1);
});
