/**
 * 性能分析脚本
 * 分析构建产物和运行性能
 * @file: analyze-performance.js
 * @description: 性能分析和优化建议
 * @version: 2.0.0
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  logger,
  CONFIG,
  Timer,
  parseArgs,
  showHelp,
  exit,
  setLogLevel,
  LogLevel,
  formatBytes,
  PROJECT_ROOT
} from './utils/index.js';

// 解析命令行参数
const args = parseArgs();

// 显示帮助
if (args.flags.help || args.flags.h) {
  showHelp('analyze-performance.js', {
    examples: [
      'npm run analyze',
      'node scripts/analyze-performance.js',
      'node scripts/analyze-performance.js -v'
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

// 性能预算配置
const BUDGET = {
  js: 200 * 1024,      // 200KB
  css: 50 * 1024,      // 50KB
  image: 500 * 1024,   // 500KB
  total: 2 * 1024 * 1024  // 2MB
};

// 性能阈值
const THRESHOLDS = {
  fcp: 1800,
  lcp: 2500,
  tti: 3800,
  cls: 0.1
};

/**
 * 获取大小状态
 * @param {number} size - 当前大小
 * @param {number} budget - 预算大小
 * @returns {string}
 */
function getSizeStatus(size, budget) {
  const ratio = size / budget;
  if (ratio > 1) {
    return logger.colors.red + '⚠️ 超出预算 ' + ((ratio - 1) * 100).toFixed(1) + '%' + logger.colors.reset;
  } else if (ratio > 0.8) {
    return logger.colors.yellow + '⚡ 接近预算 ' + (ratio * 100).toFixed(1) + '%' + logger.colors.reset;
  }
  return logger.colors.green + '✅ 良好 ' + (ratio * 100).toFixed(1) + '%' + logger.colors.reset;
}

/**
 * 分析构建产物
 * @returns {Object|null}
 */
function analyzeBuildArtifacts() {
  logger.section('分析构建产物');

  const buildDir = CONFIG.paths.dist;

  if (!fs.existsSync(buildDir)) {
    logger.error('构建目录不存在，请先运行 npm run build');
    return null;
  }

  const stats = {
    js: { size: 0, files: [] },
    css: { size: 0, files: [] },
    images: { size: 0, files: [] },
    other: { size: 0, files: [] },
    total: 0
  };

  function traverseDir(dir, basePath = '') {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDir(fullPath, relativePath);
      } else {
        const size = stat.size;
        stats.total += size;

        if (item.endsWith('.js')) {
          stats.js.size += size;
          stats.js.files.push({ name: relativePath, size });
        } else if (item.endsWith('.css')) {
          stats.css.size += size;
          stats.css.files.push({ name: relativePath, size });
        } else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(item)) {
          stats.images.size += size;
          stats.images.files.push({ name: relativePath, size });
        } else {
          stats.other.size += size;
          stats.other.files.push({ name: relativePath, size });
        }
      }
    });
  }

  traverseDir(buildDir);

  // 排序文件
  stats.js.files.sort((a, b) => b.size - a.size);
  stats.css.files.sort((a, b) => b.size - a.size);
  stats.images.files.sort((a, b) => b.size - a.size);

  return stats;
}

/**
 * 打印构建分析结果
 * @param {Object} stats - 统计数据
 */
function printBuildAnalysis(stats) {
  if (!stats) return;

  logger.title('构建产物分析');

  // JavaScript
  logger.section('JavaScript 文件');
  logger.info(`总大小: ${formatBytes(stats.js.size)} ${getSizeStatus(stats.js.size, BUDGET.js)}`);
  logger.info(`文件数: ${stats.js.files.length}`);
  logger.info('最大的文件:');
  stats.js.files.slice(0, 5).forEach((file) => {
    logger.info(`  - ${file.name}: ${formatBytes(file.size)}`);
  });

  // CSS
  logger.section('CSS 文件');
  logger.info(`总大小: ${formatBytes(stats.css.size)} ${getSizeStatus(stats.css.size, BUDGET.css)}`);
  logger.info(`文件数: ${stats.css.files.length}`);
  logger.info('最大的文件:');
  stats.css.files.slice(0, 5).forEach((file) => {
    logger.info(`  - ${file.name}: ${formatBytes(file.size)}`);
  });

  // Images
  logger.section('图片文件');
  logger.info(`总大小: ${formatBytes(stats.images.size)} ${getSizeStatus(stats.images.size, BUDGET.image)}`);
  logger.info(`文件数: ${stats.images.files.length}`);
  logger.info('最大的文件:');
  stats.images.files.slice(0, 5).forEach((file) => {
    logger.info(`  - ${file.name}: ${formatBytes(file.size)}`);
  });

  // Total
  logger.section('总体统计');
  logger.info(`总大小: ${formatBytes(stats.total)} ${getSizeStatus(stats.total, BUDGET.total)}`);
  logger.info(`总文件数: ${stats.js.files.length + stats.css.files.length + stats.images.files.length + stats.other.files.length}`);
}

/**
 * 分析依赖
 */
function analyzeDependencies() {
  logger.section('分析依赖');

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
    );

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const depList = Object.entries(deps).map(([name, version]) => ({
      name,
      version: version.replace('^', '').replace('~', '')
    }));

    logger.title('依赖分析');
    logger.info(`总依赖数: ${depList.length}`);
    logger.info(`生产依赖: ${Object.keys(packageJson.dependencies || {}).length}`);
    logger.info(`开发依赖: ${Object.keys(packageJson.devDependencies || {}).length}`);

    // 检查大型依赖
    const largeDeps = [
      'element-plus',
      'echarts',
      'exceljs',
      'vue',
      'vue-router',
      'pinia'
    ];

    logger.section('关键依赖检查');
    largeDeps.forEach((dep) => {
      if (deps[dep]) {
        logger.success(`${dep}: ${deps[dep]}`);
      } else {
        logger.warning(`${dep}: 未安装`);
      }
    });

  } catch (error) {
    logger.error(`依赖分析失败: ${error.message}`);
  }
}

/**
 * 生成优化建议
 * @param {Object} stats - 统计数据
 */
function generateOptimizationSuggestions(stats) {
  logger.title('优化建议');

  const suggestions = [];

  if (stats) {
    // JavaScript 优化建议
    if (stats.js.size > BUDGET.js) {
      suggestions.push({
        priority: 'high',
        category: 'JavaScript',
        title: 'JS 文件超出预算',
        description: `当前: ${formatBytes(stats.js.size)}, 预算: ${formatBytes(BUDGET.js)}`,
        actions: [
          '启用代码分割，按需加载业务模块',
          '使用路由懒加载',
          '检查并移除未使用的代码',
          '使用 Tree Shaking 优化',
          '考虑使用 CDN 加载大型库'
        ]
      });
    }

    // CSS 优化建议
    if (stats.css.size > BUDGET.css) {
      suggestions.push({
        priority: 'medium',
        category: 'CSS',
        title: 'CSS 文件超出预算',
        description: `当前: ${formatBytes(stats.css.size)}, 预算: ${formatBytes(BUDGET.css)}`,
        actions: [
          '启用 CSS 代码分割',
          '使用 PurgeCSS 移除未使用的样式',
          '压缩 CSS 文件',
          '使用 CSS 变量减少重复代码'
        ]
      });
    }

    // 图片优化建议
    if (stats.images.size > BUDGET.image) {
      suggestions.push({
        priority: 'medium',
        category: 'Images',
        title: '图片资源超出预算',
        description: `当前: ${formatBytes(stats.images.size)}, 预算: ${formatBytes(BUDGET.image)}`,
        actions: [
          '使用 WebP 格式替代 PNG/JPG',
          '实现图片懒加载',
          '使用响应式图片',
          '压缩图片资源',
          '使用 SVG 替代小图标'
        ]
      });
    }

    // 总体优化建议
    if (stats.total > BUDGET.total) {
      suggestions.push({
        priority: 'high',
        category: 'Total',
        title: '总体构建产物超出预算',
        description: `当前: ${formatBytes(stats.total)}, 预算: ${formatBytes(BUDGET.total)}`,
        actions: [
          '启用 Gzip/Brotli 压缩',
          '配置 CDN 加速',
          '优化代码分割策略',
          '延迟加载非关键资源'
        ]
      });
    }
  }

  // 通用优化建议
  suggestions.push({
    priority: 'low',
    category: 'General',
    title: '通用性能优化',
    description: '适用于所有项目的优化建议',
    actions: [
      '启用 HTTP/2 服务器推送',
      '配置浏览器缓存策略',
      '使用 Service Worker 实现离线缓存',
      '优化字体加载策略',
      '实现骨架屏提升感知性能'
    ]
  });

  // 打印建议
  suggestions.forEach((suggestion, index) => {
    const priorityColor = suggestion.priority === 'high' ? logger.colors.red :
                         suggestion.priority === 'medium' ? logger.colors.yellow : logger.colors.green;

    logger.section(`${index + 1}. ${suggestion.title}`);
    logger.info(`优先级: ${priorityColor}[${suggestion.priority.toUpperCase()}]${logger.colors.reset}`);
    logger.info(`类别: ${suggestion.category}`);
    logger.info(`描述: ${suggestion.description}`);
    logger.info('建议操作:');
    suggestion.actions.forEach((action) => {
      logger.info(`  • ${action}`);
    });
  });
}

/**
 * 运行 Lighthouse 分析
 */
async function runLighthouseAnalysis() {
  logger.section('运行 Lighthouse 分析');

  try {
    execSync('npx lighthouse --version', { stdio: 'ignore' });
    logger.warning('Lighthouse 分析需要在构建后的应用上运行');
    logger.info('运行命令: npx lighthouse http://localhost:5173 --output=html --output-path=./lighthouse-report.html');
  } catch (error) {
    logger.warning('Lighthouse 未安装，跳过分析');
    logger.info('安装命令: npm install -g lighthouse');
  }
}

/**
 * 生成性能报告
 * @param {Object} stats - 统计数据
 */
function generatePerformanceReport(stats) {
  const reportPath = path.join(PROJECT_ROOT, 'performance-report.json');

  const report = {
    timestamp: new Date().toISOString(),
    build: stats ? {
      js: {
        size: stats.js.size,
        files: stats.js.files.length,
        budget: BUDGET.js,
        status: stats.js.size > BUDGET.js ? 'exceeded' : 'ok'
      },
      css: {
        size: stats.css.size,
        files: stats.css.files.length,
        budget: BUDGET.css,
        status: stats.css.size > BUDGET.css ? 'exceeded' : 'ok'
      },
      images: {
        size: stats.images.size,
        files: stats.images.files.length,
        budget: BUDGET.image,
        status: stats.images.size > BUDGET.image ? 'exceeded' : 'ok'
      },
      total: {
        size: stats.total,
        budget: BUDGET.total,
        status: stats.total > BUDGET.total ? 'exceeded' : 'ok'
      }
    } : null,
    thresholds: THRESHOLDS
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logger.success(`性能报告已生成: ${reportPath}`);
}

/**
 * 主函数
 */
async function main() {
  logger.title('性能分析工具');
  const timer = new Timer();
  timer.start();

  try {
    // 分析构建产物
    const stats = analyzeBuildArtifacts();
    printBuildAnalysis(stats);

    // 分析依赖
    analyzeDependencies();

    // 生成优化建议
    generateOptimizationSuggestions(stats);

    // 运行 Lighthouse 分析
    await runLighthouseAnalysis();

    // 生成性能报告
    generatePerformanceReport(stats);

    // 输出总耗时
    const duration = timer.stop();
    logger.section('分析完成');
    logger.info(`总耗时: ${timer.format()}`);

    exit(0);

  } catch (error) {
    logger.error(`分析失败: ${error.message}`);
    logger.debug(error.stack);
    exit(1);
  }
}

// 执行主函数
main();
