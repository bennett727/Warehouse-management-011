/**
 * E2E测试运行脚本（带健康检查）
 * 在运行E2E测试前执行环境和健康检查
 *
 * @file: run-e2e-with-health-check.js
 * @description: 检查后端服务健康状态，然后运行Cypress E2E测试
 * @version: 2.0.0
 *
 * 使用方法:
 *   npm run test:e2e
 *   node scripts/run-e2e-with-health-check.js
 *   node scripts/run-e2e-with-health-check.js --help
 *   node scripts/run-e2e-with-health-check.js -v
 *
 * 功能说明:
 *   1. 检查后端API服务是否可访问
 *   2. 检查前端开发服务器是否运行
 *   3. 执行健康检查端点验证
 *   4. 环境就绪后启动Cypress E2E测试
 *   5. 输出测试执行结果和统计信息
 *
 * 环境变量:
 *   - API_HOST: 后端API主机 (默认: localhost)
 *   - API_PORT: 后端API端口 (默认: 8080)
 *   - CYPRESS_BROWSER: 测试浏览器 (默认: edge)
 *   - CYPRESS_HEADLESS: 是否无头模式 (默认: true)
 */

import { spawn } from 'child_process';
import {
  logger,
  CONFIG,
  Timer,
  parseArgs,
  showHelp,
  exit,
  checkService,
  setLogLevel,
  LogLevel
} from './utils/index.js';

// 解析命令行参数
const args = parseArgs();

// 显示帮助
if (args.flags.help || args.flags.h) {
  showHelp('run-e2e-with-health-check.js', {
    examples: [
      'npm run test:e2e',
      'node scripts/run-e2e-with-health-check.js',
      'node scripts/run-e2e-with-health-check.js -v  # 详细模式'
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

// 计时器
const timer = new Timer();

/**
 * 运行Cypress测试
 * @returns {Promise<number>} - 退出码
 */
function runCypress() {
  return new Promise((resolve) => {
    logger.info('启动Cypress E2E测试...\n');

    const cypressArgs = [
      'run',
      '--config-file', CONFIG.cypress.configFile,
      '--browser', CONFIG.cypress.browser
    ];

    if (CONFIG.cypress.headless) {
      cypressArgs.push('--headless');
    }

    const cypress = spawn('npx', ['cypress', ...cypressArgs], {
      stdio: 'inherit',
      shell: true
    });

    cypress.on('close', (code) => {
      resolve(code);
    });

    cypress.on('error', (err) => {
      logger.error(`启动Cypress失败: ${err.message}`);
      resolve(1);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  logger.title('E2E测试运行（带健康检查）');
  timer.start();

  try {
    // 1. 检查后端API服务
    logger.section('服务健康检查');

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
      exit(1, '健康检查失败');
    }
    logger.success('后端API服务健康');

    // 2. 检查前端服务（可选）
    logger.info(`检查前端服务: ${CONFIG.frontend.url}`);
    const frontendHealthy = await checkService({
      host: CONFIG.frontend.host,
      port: CONFIG.frontend.port,
      timeout: 3000
    });

    if (frontendHealthy.ok) {
      logger.success('前端服务运行中');
    } else {
      logger.warning('前端服务未运行（测试将直接访问构建产物）');
    }

    // 3. 运行E2E测试
    logger.section('执行E2E测试');
    const exitCode = await runCypress();

    // 4. 输出结果
    logger.section('测试完成');
    const duration = timer.stop();

    if (exitCode === 0) {
      logger.success(`所有测试通过！耗时: ${timer.format()}`);
    } else {
      logger.error(`测试失败（退出码: ${exitCode}）耗时: ${timer.format()}`);
    }

    exit(exitCode);

  } catch (error) {
    logger.error(`执行出错: ${error.message}`);
    logger.debug(error.stack);
    exit(1, '执行失败');
  }
}

// 执行主函数
main();
