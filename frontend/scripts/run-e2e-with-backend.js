/**
 * E2E测试完整运行脚本
 * 自动启动后端服务并执行E2E测试
 *
 * @file: run-e2e-with-backend.js
 * @description: 自动启动后端服务，等待服务就绪后执行Cypress E2E测试
 * @version: 2.0.0
 *
 * 使用方法:
 *   npm run test:e2e:full
 *   node scripts/run-e2e-with-backend.js
 *   node scripts/run-e2e-with-backend.js --help
 *   SKIP_BACKEND_START=true node scripts/run-e2e-with-backend.js
 *
 * 功能说明:
 *   1. 自动编译并启动后端Spring Boot服务
 *   2. 等待后端服务健康检查通过
 *   3. 检查前端服务状态
 *   4. 执行Cypress E2E测试
 *   5. 测试完成后自动清理进程
 *
 * 环境变量:
 *   - SPRING_PROFILE: Spring环境配置（默认: test）
 *   - API_HOST: 后端API主机 (默认: localhost)
 *   - API_PORT: 后端API端口 (默认: 8080)
 *   - CYPRESS_BROWSER: 测试浏览器（默认: edge）
 *   - SKIP_BACKEND_START: 跳过后端启动（默认: false）
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import {
  logger,
  CONFIG,
  Timer,
  parseArgs,
  showHelp,
  exit,
  checkService,
  waitForService,
  setLogLevel,
  LogLevel,
  PROJECT_ROOT
} from './utils/index.js';

const execAsync = promisify(exec);

// Spring Boot 目录
const springBootDir = join(PROJECT_ROOT, '..', 'spring_boot');

// 解析命令行参数
const args = parseArgs();

// 显示帮助
if (args.flags.help || args.flags.h) {
  showHelp('run-e2e-with-backend.js', {
    examples: [
      'npm run test:e2e:full',
      'node scripts/run-e2e-with-backend.js',
      'SKIP_BACKEND_START=true node scripts/run-e2e-with-backend.js'
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

// 进程管理
let backendProcess = null;
let frontendProcess = null;

// 全局计时器
const globalTimer = new Timer();

/**
 * 编译后端项目
 * @returns {Promise<boolean>}
 */
async function buildBackend() {
  logger.section('编译后端项目');

  try {
    const { stdout, stderr } = await execAsync(
      'mvn clean package -DskipTests -q',
      { cwd: springBootDir }
    );
    logger.success('后端编译成功');
    return true;
  } catch (error) {
    logger.error(`后端编译失败: ${error.message}`);
    return false;
  }
}

/**
 * 启动后端服务
 * @returns {Promise<void>}
 */
async function startBackend() {
  logger.section('启动后端服务');
  logger.info(`环境配置: ${process.env.SPRING_PROFILE || 'test'}`);

  return new Promise((resolve, reject) => {
    backendProcess = spawn(
      'mvn',
      [
        'spring-boot:run',
        `-Dspring-boot.run.profiles=${process.env.SPRING_PROFILE || 'test'}`,
        '-q'
      ],
      {
        cwd: springBootDir,
        stdio: 'pipe',
        shell: true
      }
    );

    backendProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.includes('Started Application') ||
            line.includes('JVM running') ||
            line.includes('数据库初始化') ||
            line.includes('测试数据初始化')) {
          logger.info(`[后端] ${line.trim()}`);
        }
      });
    });

    backendProcess.stderr.on('data', (data) => {
      logger.debug(`[后端错误] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      logger.error(`启动后端服务失败: ${error.message}`);
      reject(error);
    });

    // 等待几秒让服务开始启动
    setTimeout(() => resolve(), 3000);
  });
}

/**
 * 启动前端开发服务器
 * @returns {Promise<void>}
 */
async function startFrontend() {
  logger.section('启动前端开发服务器');

  return new Promise((resolve, reject) => {
    frontendProcess = spawn(
      'npm',
      ['run', 'dev'],
      {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        shell: true
      }
    );

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('ready')) {
        logger.info(`[前端] ${output.trim()}`);
      }
    });

    frontendProcess.on('error', (error) => {
      logger.error(`启动前端服务失败: ${error.message}`);
      reject(error);
    });

    // 等待几秒让服务开始启动
    setTimeout(() => resolve(), 5000);
  });
}

/**
 * 运行Cypress测试
 * @returns {Promise<number>}
 */
async function runCypress() {
  logger.section('启动Cypress E2E测试');

  return new Promise((resolve) => {
    const cypressArgs = [
      'run',
      '--config-file', CONFIG.cypress.configFile,
      '--browser', CONFIG.cypress.browser
    ];

    if (CONFIG.cypress.headless) {
      cypressArgs.push('--headless');
    }

    const cypress = spawn('npx', ['cypress', ...cypressArgs], {
      cwd: PROJECT_ROOT,
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
 * 清理进程
 */
async function cleanup() {
  logger.section('清理进程');

  if (backendProcess) {
    logger.info('停止后端服务...');
    backendProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!backendProcess.killed) {
      backendProcess.kill('SIGKILL');
    }
    logger.success('后端服务已停止');
  }

  if (frontendProcess) {
    logger.info('停止前端服务...');
    frontendProcess.kill('SIGTERM');
    logger.success('前端服务已停止');
  }
}

/**
 * 主函数
 */
async function main() {
  logger.title('E2E测试完整运行流程');
  globalTimer.start();

  const skipBackendStart = process.env.SKIP_BACKEND_START === 'true';
  let servicesStarted = false;

  try {
    // 1. 检查或启动后端服务
    logger.section('后端服务检查');

    const backendRunning = await checkService({
      host: CONFIG.api.host,
      port: CONFIG.api.port,
      path: CONFIG.api.healthPath,
      timeout: 3000
    });

    if (backendRunning.ok) {
      logger.success('后端服务已在运行');
    } else if (!skipBackendStart) {
      // 编译并启动后端
      const built = await buildBackend();
      if (!built) {
        exit(1, '后端编译失败');
      }

      await startBackend();
      servicesStarted = true;

      // 等待后端就绪
      const backendReady = await waitForService({
        host: CONFIG.api.host,
        port: CONFIG.api.port,
        path: CONFIG.api.readyPath,
        maxRetries: 60,
        retryInterval: 5000
      }, '后端服务');

      if (!backendReady) {
        throw new Error('后端服务启动超时');
      }
    } else {
      logger.error('后端服务未运行，且设置了 SKIP_BACKEND_START=true');
      exit(1, '无法启动后端服务');
    }

    // 2. 检查或启动前端服务
    logger.section('前端服务检查');

    const frontendRunning = await checkService({
      host: CONFIG.frontend.host,
      port: CONFIG.frontend.port,
      timeout: 3000
    });

    if (frontendRunning.ok) {
      logger.success('前端服务已在运行');
    } else {
      logger.warning('前端服务未运行，将直接访问构建后的静态文件');
    }

    // 3. 执行E2E测试
    const exitCode = await runCypress();

    // 4. 输出结果
    logger.title('E2E测试执行结果');
    const duration = globalTimer.stop();
    logger.info(`总耗时: ${(duration / 1000).toFixed(2)} 秒`);

    if (exitCode === 0) {
      logger.success('E2E测试执行成功');
    } else {
      logger.error(`E2E测试执行失败 (退出码: ${exitCode})`);
    }

    exit(exitCode);

  } catch (error) {
    logger.error(`执行出错: ${error.message}`);
    logger.debug(error.stack);
    exit(1, '执行失败');
  } finally {
    if (servicesStarted) {
      await cleanup();
    }
  }
}

// 处理进程终止信号
process.on('SIGINT', async () => {
  logger.warning('\n收到中断信号，正在清理...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.warning('\n收到终止信号，正在清理...');
  await cleanup();
  process.exit(0);
});

// 运行主函数
main();
