/**
 * API路径一致性检查脚本
 * 检查前后端API路径是否一致
 * @file: check-api-paths.js
 * @description: 扫描前后端代码，检查API路径定义的一致性
 * @version: 2.0.0
 */

import fs from 'fs';
import path from 'path';
import {
  logger,
  CONFIG,
  Timer,
  parseArgs,
  showHelp,
  exit,
  setLogLevel,
  LogLevel,
  PROJECT_ROOT
} from './utils/index.js';

// 解析命令行参数
const args = parseArgs();

// 显示帮助
if (args.flags.help || args.flags.h) {
  showHelp('check-api-paths.js', {
    examples: [
      'npm run check:api',
      'node scripts/check-api-paths.js',
      'node scripts/check-api-paths.js -v'
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

// 后端目录
const backendDir = path.join(PROJECT_ROOT, '..', 'spring_boot', 'src');

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {string|null}
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

/**
 * 提取前端API路径
 * @param {string} content - 文件内容
 * @returns {Array}
 */
function extractFrontendApiPaths(content) {
  const paths = [];
  const patterns = [
    /export\s+const\s+(\w+_API)\s*=\s*\{([\s\S]*?)^};/gm,
    /(\w+):\s*`([^`]+)`/g,
    /url:\s*['"`]([^'"`]+)['"`]/g,
    /url:\s*(\w+_API\.\w+)/g,
  ];

  const constMatches = content.matchAll(patterns[0]);
  for (const match of constMatches) {
    const constName = match[1];
    const constBody = match[2];

    const pathMatches = constBody.matchAll(patterns[1]);
    for (const pathMatch of pathMatches) {
      const key = pathMatch[1];
      const value = pathMatch[2];
      if (value.includes('${API_BASE}') || (value.startsWith('/') && !value.includes('${'))) {
        paths.push({ source: constName, key, path: value, type: 'constant' });
      }
    }
  }

  const urlMatches = content.matchAll(patterns[2]);
  for (const match of urlMatches) {
    const url = match[1];
    if (url.startsWith('/') && !url.includes('http')) {
      paths.push({ source: 'inline', key: null, path: url, type: 'inline' });
    }
  }

  return paths;
}

/**
 * 提取后端API路径
 * @param {string} content - 文件内容
 * @returns {Array}
 */
function extractBackendApiPaths(content) {
  const paths = [];
  const patterns = [
    /public\s+static\s+final\s+String\s+(\w+)\s*=\s*["']([^"']+)["']/g,
    /@RequestMapping\s*\(\s*["']([^"']+)["']/g,
    /@(Get|Post|Put|Delete|Patch)Mapping\s*\(\s*["']([^"']+)["']/g,
  ];

  const constMatches = content.matchAll(patterns[0]);
  for (const match of constMatches) {
    const key = match[1];
    const value = match[2];
    if (value.startsWith('/')) {
      paths.push({ source: 'constant', key, path: value, type: 'constant' });
    }
  }

  const mappingMatches = content.matchAll(patterns[1]);
  for (const match of mappingMatches) {
    const path = match[1];
    paths.push({ source: 'annotation', key: '@RequestMapping', path, type: 'annotation' });
  }

  const httpMethodMatches = content.matchAll(patterns[2]);
  for (const match of httpMethodMatches) {
    const method = match[1];
    const path = match[2];
    paths.push({ source: 'annotation', key: `@${method}Mapping`, path, type: 'annotation' });
  }

  return paths;
}

/**
 * 扫描目录
 * @param {string} dir - 目录路径
 * @param {Array} extensions - 文件扩展名
 * @param {Function} callback - 回调函数
 */
function scanDirectory(dir, extensions, callback) {
  if (!fs.existsSync(dir)) {
    logger.warning(`目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'target') {
        scanDirectory(filePath, extensions, callback);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      callback(filePath);
    }
  }
}

/**
 * 主检查函数
 */
function checkApiPaths() {
  logger.title('API路径一致性检查');

  const frontendPaths = [];
  const backendPaths = [];
  const timer = new Timer();
  timer.start();

  // 扫描前端代码
  logger.section('扫描前端代码');
  const frontendDir = CONFIG.paths.src;
  if (fs.existsSync(frontendDir)) {
    logger.info(`扫描目录: ${frontendDir}`);
    scanDirectory(frontendDir, ['.js', '.ts', '.vue'], (filePath) => {
      const content = readFile(filePath);
      if (content) {
        const paths = extractFrontendApiPaths(content);
        if (paths.length > 0) {
          paths.forEach((p) => {
            frontendPaths.push({ ...p, file: path.relative(frontendDir, filePath) });
          });
        }
      }
    });
    logger.success(`找到 ${frontendPaths.length} 个API路径定义`);
  } else {
    logger.error(`前端目录不存在: ${frontendDir}`);
  }

  // 扫描后端代码
  logger.section('扫描后端代码');
  if (fs.existsSync(backendDir)) {
    logger.info(`扫描目录: ${backendDir}`);
    scanDirectory(backendDir, ['.java'], (filePath) => {
      const content = readFile(filePath);
      if (content) {
        const paths = extractBackendApiPaths(content);
        if (paths.length > 0) {
          paths.forEach((p) => {
            backendPaths.push({ ...p, file: path.relative(backendDir, filePath) });
          });
        }
      }
    });
    logger.success(`找到 ${backendPaths.length} 个API路径定义`);
  } else {
    logger.warning(`后端目录不存在: ${backendDir}`);
  }

  // 显示结果
  logger.section('检查结果');

  if (frontendPaths.length > 0) {
    logger.info('前端API路径:');
    frontendPaths.slice(0, 10).forEach((p) => {
      logger.info(`  ${p.source}.${p.key}: ${p.path}`);
    });
    if (frontendPaths.length > 10) {
      logger.info(`  ... 还有 ${frontendPaths.length - 10} 个`);
    }
  }

  if (backendPaths.length > 0) {
    logger.info('\n后端API路径:');
    backendPaths.slice(0, 10).forEach((p) => {
      logger.info(`  ${p.key}: ${p.path}`);
    });
    if (backendPaths.length > 10) {
      logger.info(`  ... 还有 ${backendPaths.length - 10} 个`);
    }
  }

  const duration = timer.stop();
  logger.section('检查完成');
  logger.info(`总耗时: ${timer.format()}`);
  logger.success(`前端路径: ${frontendPaths.length} 个, 后端路径: ${backendPaths.length} 个`);

  return { frontendPaths, backendPaths };
}

// 执行检查
try {
  checkApiPaths();
  exit(0);
} catch (error) {
  logger.error(`检查失败: ${error.message}`);
  logger.debug(error.stack);
  exit(1);
}
