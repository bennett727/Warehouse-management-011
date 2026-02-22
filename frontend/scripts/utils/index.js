/**
 * 脚本工具库
 * 提供共享的工具函数和配置
 * @module scripts/utils
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 项目根目录
 */
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * 颜色配置
 */
export const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * 日志级别
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
};

/**
 * 当前日志级别
 */
let currentLogLevel = LogLevel.INFO;

/**
 * 设置日志级别
 * @param {number} level - 日志级别
 */
export function setLogLevel(level) {
  currentLogLevel = level;
}

/**
 * 日志输出函数
 */
export const logger = {
  debug: (msg) => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(`${colors.gray}[DEBUG] ${msg}${colors.reset}`);
    }
  },
  info: (msg) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
    }
  },
  success: (msg) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(`${colors.green}✅ ${msg}${colors.reset}`);
    }
  },
  warning: (msg) => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
    }
  },
  error: (msg) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.log(`${colors.red}❌ ${msg}${colors.reset}`);
    }
  },
  title: (msg) => {
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  ${msg}${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  },
  section: (msg) => {
    console.log(`\n${colors.magenta}─── ${msg} ───${colors.reset}\n`);
  }
};

/**
 * 项目配置
 */
export const CONFIG = {
  api: {
    host: process.env.API_HOST || 'localhost',
    port: parseInt(process.env.API_PORT, 10) || 8080,
    basePath: process.env.API_BASE_PATH || '/api',
    get url() {
      return `http://${this.host}:${this.port}${this.basePath}`;
    },
    healthPath: '/health',
    readyPath: '/test/e2e/health'
  },
  frontend: {
    host: process.env.FRONTEND_HOST || 'localhost',
    port: parseInt(process.env.FRONTEND_PORT, 10) || 5173,
    get url() {
      return `http://${this.host}:${this.port}`;
    }
  },
  cypress: {
    browser: process.env.CYPRESS_BROWSER || 'edge',
    headless: process.env.CYPRESS_HEADLESS !== 'false',
    configFile: 'config/cypress.config.js'
  },
  paths: {
    src: path.join(PROJECT_ROOT, 'src'),
    tests: path.join(PROJECT_ROOT, 'tests'),
    cypress: path.join(PROJECT_ROOT, 'tests', 'cypress'),
    reports: path.join(PROJECT_ROOT, 'tests', 'cypress', 'reports'),
    dist: path.join(PROJECT_ROOT, 'dist'),
    backend: path.join(PROJECT_ROOT, '..', 'spring_boot')
  }
};

/**
 * 执行时间统计
 */
export class Timer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.endTime = null;
  }

  stop() {
    this.endTime = Date.now();
    return this.duration;
  }

  get duration() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

  format() {
    const ms = this.duration;
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(1);
    return `${mins}m ${secs}s`;
  }
}

/**
 * 格式化字节大小
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的字符串
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 解析命令行参数
 * @returns {Object} - 解析后的参数
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    _: [],
    flags: {}
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result.flags[key] = args[i + 1];
        i++;
      } else {
        result.flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      result.flags[arg.slice(1)] = true;
    } else {
      result._.push(arg);
    }
  }

  return result;
}

/**
 * 显示帮助信息
 * @param {string} scriptName - 脚本名称
 * @param {Object} options - 选项配置
 */
export function showHelp(scriptName, options = {}) {
  console.log(`
${colors.cyan}用法: node scripts/${scriptName} [选项]${colors.reset}

${colors.yellow}选项:${colors.reset}
  -h, --help      显示帮助信息
  -v, --verbose   显示详细日志
  --silent        静默模式（只显示错误）

${colors.yellow}环境变量:${colors.reset}
  API_HOST        API主机地址 (默认: localhost)
  API_PORT        API端口 (默认: 8080)
  CYPRESS_BROWSER 测试浏览器 (默认: edge)
`);

  if (options.examples) {
    console.log(`${colors.yellow}示例:${colors.reset}`);
    options.examples.forEach(ex => {
      console.log(`  ${ex}`);
    });
  }

  process.exit(0);
}

/**
 * 处理脚本退出
 * @param {number} code - 退出码
 * @param {string} message - 退出消息
 */
export function exit(code = 0, message = null) {
  if (message) {
    if (code === 0) {
      logger.success(message);
    } else {
      logger.error(message);
    }
  }
  process.exit(code);
}

/**
 * 异步执行命令
 * @param {string} command - 命令
 * @param {Array} args - 参数
 * @param {Object} options - 选项
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
export function execAsync(command, args = [], options = {}) {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: options.stdio || 'pipe',
      shell: options.shell !== false,
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...options.env }
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (options.onData) options.onData(data.toString());
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (err) => {
      resolve({ code: 1, stdout, stderr: err.message });
    });
  });
}

/**
 * 检查服务是否可访问
 * @param {Object} options - 检查选项
 * @returns {Promise<{ok: boolean, statusCode?: number, error?: string}>}
 */
export async function checkService(options) {
  const http = await import('http');
  
  return new Promise((resolve) => {
    const req = http.request({
      host: options.host,
      port: options.port,
      path: options.path || '/',
      method: 'GET',
      timeout: options.timeout || 3000
    }, (res) => {
      resolve({
        ok: res.statusCode < 500,
        statusCode: res.statusCode
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });

    req.end();
  });
}

/**
 * 等待服务就绪
 * @param {Object} options - 服务配置
 * @param {string} name - 服务名称
 * @returns {Promise<boolean>}
 */
export async function waitForService(options, name) {
  const maxRetries = options.maxRetries || 30;
  const retryInterval = options.retryInterval || 2000;

  logger.info(`等待 ${name} 就绪...`);

  for (let i = 0; i < maxRetries; i++) {
    const result = await checkService(options);
    if (result.ok) {
      logger.success(`${name} 已就绪`);
      return true;
    }
    process.stdout.write(`  重试 ${i + 1}/${maxRetries}...\r`);
    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  logger.error(`${name} 启动超时`);
  return false;
}

export default {
  PROJECT_ROOT,
  colors,
  LogLevel,
  setLogLevel,
  logger,
  CONFIG,
  Timer,
  formatBytes,
  parseArgs,
  showHelp,
  exit,
  execAsync,
  checkService,
  waitForService
};
