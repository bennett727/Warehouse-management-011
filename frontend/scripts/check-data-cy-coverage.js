/**
 * data-cy属性覆盖率检查脚本
 * 检查页面组件中data-cy测试属性的覆盖情况
 *
 * @file: check-data-cy-coverage.js
 * @description: 扫描Vue文件，统计data-cy属性的覆盖率
 * @version: 1.0.0
 *
 * 使用方法:
 *   npm run check:data-cy
 * 或
 *   node scripts/check-data-cy-coverage.js [目录路径]
 *
 * 参数:
 *   - 目录路径: 可选，默认为 src/
 *
 * 功能说明:
 *   1. 递归扫描指定目录下的所有.vue文件
 *   2. 识别包含data-cy属性的元素
 *   3. 统计可测试元素的覆盖率
 *   4. 识别缺少data-cy属性的关键元素:
 *      - 按钮 (el-button)
 *      - 输入框 (el-input)
 *      - 表格 (el-table)
 *      - 对话框 (el-dialog)
 *      - 表单 (el-form)
 *   5. 生成覆盖率报告
 *   6. 提供改进建议
 *
 * 输出指标:
 *   - 扫描文件总数
 *   - 包含data-cy的文件数
 *   - 总元素数
 *   - 已覆盖元素数
 *   - 覆盖率百分比
 *   - 缺失data-cy的元素列表
 *
 * 依赖:
 *   - Node.js内置模块: fs, path
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 默认配置
const DEFAULT_SCAN_DIR = path.join(__dirname, '..', 'src');

// 需要检查data-cy属性的元素
const TESTABLE_ELEMENTS = [
  { tag: 'el-button', name: '按钮' },
  { tag: 'el-input', name: '输入框' },
  { tag: 'el-select', name: '选择器' },
  { tag: 'el-table', name: '表格' },
  { tag: 'el-dialog', name: '对话框' },
  { tag: 'el-form', name: '表单' },
  { tag: 'el-pagination', name: '分页' },
  { tag: 'el-tabs', name: '标签页' },
  { tag: 'el-menu', name: '菜单' },
  { tag: 'button', name: '原生按钮' }
];

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
 * 解析命令行参数
 * @returns {string} - 扫描目录
 */
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const customPath = path.resolve(args[0]);
    if (fs.existsSync(customPath)) {
      return customPath;
    }
    log(`⚠️  指定路径不存在: ${args[0]}，使用默认路径`, 'yellow');
  }
  return DEFAULT_SCAN_DIR;
}

/**
 * 递归获取所有.vue文件
 * @param {string} dir - 目录路径
 * @returns {string[]} - 文件路径数组
 */
function getVueFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.vue')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * 分析文件中的data-cy覆盖情况
 * @param {string} filePath - 文件路径
 * @returns {Object} - 分析结果
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);

  const result = {
    file: relativePath,
    hasDataCy: false,
    elements: [],
    coveredElements: [],
    missingElements: []
  };

  // 检查是否有data-cy属性（包括静态和动态绑定）
  const dataCyStaticRegex = /data-cy=["']([^"']+)["']/g;
  const dataCyDynamicRegex = /:data-cy=["']([^"']+)["']/g;
  const dataCyVBindRegex = /v-bind:data-cy=["']([^"']+)["']/g;

  let match;
  while ((match = dataCyStaticRegex.exec(content)) !== null) {
    result.hasDataCy = true;
    result.coveredElements.push(match[1]);
  }

  while ((match = dataCyDynamicRegex.exec(content)) !== null) {
    result.hasDataCy = true;
    result.coveredElements.push(match[1]);
  }

  while ((match = dataCyVBindRegex.exec(content)) !== null) {
    result.hasDataCy = true;
    result.coveredElements.push(match[1]);
  }

  // 检查可测试元素（支持多行标签和带引号的属性值）
  for (const element of TESTABLE_ELEMENTS) {
    // 使用更复杂的正则表达式匹配标签，处理带引号的属性值
    const tagRegex = new RegExp(`<${element.tag}(?:\\s+(?:[^>"']|"[^"]*"|'[^']*')*)?>`, 'g');
    let tagMatch;
    while ((tagMatch = tagRegex.exec(content)) !== null) {
      const tagContent = tagMatch[0];
      const hasDataCy = /data-cy=/.test(tagContent);

      result.elements.push({
        tag: element.tag,
        name: element.name,
        hasDataCy
      });

      if (!hasDataCy) {
        result.missingElements.push({
          tag: element.tag,
          name: element.name,
          context: tagContent.substring(0, 50) + (tagContent.length > 50 ? '...' : ''),
          fullContext: tagContent
        });
      }
    }
  }

  return result;
}

/**
 * 生成覆盖率报告
 * @param {Array} results - 分析结果数组
 */
function generateReport(results) {
  const totalFiles = results.length;
  const filesWithDataCy = results.filter(r => r.hasDataCy).length;
  const totalElements = results.reduce((sum, r) => sum + r.elements.length, 0);
  const coveredElements = results.reduce((sum, r) =>
    sum + r.elements.filter(e => e.hasDataCy).length, 0
  );
  const coverageRate = totalElements > 0
    ? ((coveredElements / totalElements) * 100).toFixed(2)
    : 0;

  log('\n' + '='.repeat(60), 'blue');
  log('📊 data-cy 覆盖率报告', 'blue');
  log('='.repeat(60), 'blue');

  log(`\n扫描统计:`, 'cyan');
  log(`  扫描文件数: ${totalFiles}`, 'blue');
  log(`  含data-cy文件: ${filesWithDataCy}`, 'blue');
  log(`  总元素数: ${totalElements}`, 'blue');
  log(`  已覆盖元素: ${coveredElements}`, 'blue');
  log(`  覆盖率: ${coverageRate}%`, coverageRate >= 80 ? 'green' : 'yellow');

  // 按元素类型统计
  log(`\n元素类型覆盖情况:`, 'cyan');
  const elementStats = {};
  for (const result of results) {
    for (const elem of result.elements) {
      if (!elementStats[elem.tag]) {
        elementStats[elem.tag] = { total: 0, covered: 0 };
      }
      elementStats[elem.tag].total++;
      if (elem.hasDataCy) {
        elementStats[elem.tag].covered++;
      }
    }
  }

  for (const [tag, stats] of Object.entries(elementStats)) {
    const rate = ((stats.covered / stats.total) * 100).toFixed(1);
    const color = rate >= 80 ? 'green' : rate >= 50 ? 'yellow' : 'red';
    log(`  ${tag}: ${stats.covered}/${stats.total} (${rate}%)`, color);
  }

  // 显示缺少data-cy的文件
  const filesWithMissing = results.filter(r => r.missingElements.length > 0);
  if (filesWithMissing.length > 0) {
    log(`\n⚠️  需要添加data-cy的文件 (${filesWithMissing.length}个):`, 'yellow');
    for (const result of filesWithMissing.slice(0, 10)) {
      log(`  - ${result.file} (${result.missingElements.length}个元素)`, 'blue');
      for (const missing of result.missingElements.slice(0, 3)) {
        log(`    ❌ <${missing.tag}> ${missing.context}`, 'red');
      }
    }
    if (filesWithMissing.length > 10) {
      log(`  ... 还有 ${filesWithMissing.length - 10} 个文件`, 'blue');
    }
  }

  // 覆盖率评级
  let rating;
  if (coverageRate >= 90) rating = 'A (优秀)';
  else if (coverageRate >= 80) rating = 'B (良好)';
  else if (coverageRate >= 60) rating = 'C (一般)';
  else rating = 'D (需改进)';

  log(`\n覆盖率评级: ${rating}`, 'cyan');

  if (coverageRate < 80) {
    log('\n💡 改进建议:', 'yellow');
    log('  1. 为所有交互元素添加data-cy属性', 'blue');
    log('  2. 使用有意义的命名: data-cy="submit-button"', 'blue');
    log('  3. 避免使用动态生成的data-cy值', 'blue');
    log('  4. 在代码审查中检查data-cy覆盖率', 'blue');
  }

  log('\n' + '='.repeat(60), 'blue');

  return {
    totalFiles,
    filesWithDataCy,
    totalElements,
    coveredElements,
    coverageRate: parseFloat(coverageRate)
  };
}

/**
 * 主函数
 */
async function main() {
  const scanDir = parseArgs();

  log('🔍 data-cy 覆盖率检查', 'cyan');
  log(`📁 扫描目录: ${scanDir}\n`, 'blue');

  // 获取所有Vue文件
  const vueFiles = getVueFiles(scanDir);

  if (vueFiles.length === 0) {
    log('⚠️  未找到.vue文件', 'yellow');
    process.exit(0);
  }

  log(`找到 ${vueFiles.length} 个Vue文件，开始分析...\n`, 'blue');

  // 分析每个文件
  const results = [];
  for (const file of vueFiles) {
    const result = analyzeFile(file);
    results.push(result);
  }

  // 生成报告
  const summary = generateReport(results);

  // 根据覆盖率决定退出码
  process.exit(summary.coverageRate >= 60 ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ 执行出错:', error.message);
  process.exit(1);
});
