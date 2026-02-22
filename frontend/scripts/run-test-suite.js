/**
 * 测试套件稳定性运行脚本
 * 多次运行测试以验证稳定性
 *
 * @file: run-test-suite.js
 * @description: 多次执行测试套件，检测 flaky tests（不稳定测试）
 * @version: 1.0.0
 *
 * 使用方法:
 *   npm run test:stability
 * 或
 *   node scripts/run-test-suite.js [运行次数]
 *
 * 参数:
 *   - 运行次数: 可选，默认为 3 次
 *
 * 功能说明:
 *   1. 解析命令行参数获取运行次数
 *   2. 循环执行测试套件指定次数
 *   3. 记录每次运行的结果
 *   4. 统计成功率和稳定性指标
 *   5. 识别不稳定的测试用例
 *   6. 生成稳定性报告
 *
 * 输出指标:
 *   - 总运行次数
 *   - 成功次数
 *   - 失败次数
 *   - 成功率
 *   - 稳定性评级
 *
 * 依赖:
 *   - Node.js内置模块: child_process
 *   - 外部命令: cypress
 */

import { spawn } from 'child_process';

// 默认配置
const DEFAULT_RUNS = 3;
const MAX_RUNS = 10;

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
 * @returns {number} - 运行次数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const runs = parseInt(args[0], 10);

  if (isNaN(runs) || runs < 1) {
    return DEFAULT_RUNS;
  }

  if (runs > MAX_RUNS) {
    log(`⚠️  最大运行次数为 ${MAX_RUNS}，已自动调整`, 'yellow');
    return MAX_RUNS;
  }

  return runs;
}

/**
 * 运行一次测试套件
 * @param {number} runNumber - 当前运行编号
 * @returns {Promise<{success: boolean, duration: number}>}
 */
function runOnce(runNumber) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    log(`\n🔄 第 ${runNumber} 次运行...`, 'cyan');

    const cypress = spawn('npx', [
      'cypress', 'run',
      '--config-file', 'config/cypress.config.js',
      '--browser', 'edge',
      '--headless'
    ], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    cypress.stdout.on('data', (data) => {
      output += data.toString();
    });

    cypress.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      if (success) {
        log(`   ✅ 通过 (${(duration / 1000).toFixed(2)}s)`, 'green');
      } else {
        log(`   ❌ 失败 (${(duration / 1000).toFixed(2)}s)`, 'red');
      }

      resolve({ success, duration, output });
    });
  });
}

/**
 * 计算稳定性评级
 * @param {number} successRate - 成功率
 * @returns {string} - 评级
 */
function getStabilityRating(successRate) {
  if (successRate === 100) return 'A+ (极佳)';
  if (successRate >= 95) return 'A (优秀)';
  if (successRate >= 90) return 'B (良好)';
  if (successRate >= 80) return 'C (一般)';
  if (successRate >= 60) return 'D (较差)';
  return 'F (不稳定)';
}

/**
 * 生成稳定性报告
 * @param {Array} results - 结果数组
 * @param {number} totalRuns - 总运行次数
 */
function generateReport(results, totalRuns) {
  const passed = results.filter(r => r.success).length;
  const failed = totalRuns - passed;
  const successRate = (passed / totalRuns) * 100;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalRuns;

  log('\n' + '='.repeat(60), 'blue');
  log('📊 测试稳定性报告', 'blue');
  log('='.repeat(60), 'blue');

  log(`\n运行统计:`, 'cyan');
  log(`  总运行次数: ${totalRuns}`, 'blue');
  log(`  成功次数: ${passed}`, 'green');
  log(`  失败次数: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`  成功率: ${successRate.toFixed(2)}%`, 'blue');
  log(`  平均耗时: ${(avgDuration / 1000).toFixed(2)} 秒`, 'blue');

  log(`\n稳定性评级: ${getStabilityRating(successRate)}`, 'cyan');

  if (successRate < 100) {
    log('\n⚠️  检测到不稳定的测试', 'yellow');
    log('建议:', 'yellow');
    log('  1. 检查测试用例的独立性', 'blue');
    log('  2. 增加等待时间和重试机制', 'blue');
    log('  3. 检查测试数据的一致性', 'blue');
  } else {
    log('\n✅ 测试套件非常稳定！', 'green');
  }

  log('\n' + '='.repeat(60), 'blue');

  return { passed, failed, successRate, avgDuration };
}

/**
 * 主函数
 */
async function main() {
  const totalRuns = parseArgs();

  log('🚀 测试稳定性检查', 'cyan');
  log(`📋 计划运行 ${totalRuns} 次测试套件\n`, 'blue');

  const results = [];

  for (let i = 1; i <= totalRuns; i++) {
    const result = await runOnce(i);
    results.push(result);

    // 运行间隔，避免资源冲突
    if (i < totalRuns) {
      log('   ⏳ 等待 3 秒...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 生成报告
  const summary = generateReport(results, totalRuns);

  // 根据成功率决定退出码
  process.exit(summary.successRate >= 80 ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ 执行出错:', error.message);
  process.exit(1);
});
