/**
 * 测试报告生成脚本
 * 读取Cypress测试报告JSON文件，生成汇总报告
 * 
 * @file: generate-test-report.js
 * @description: 解析mochawesome生成的JSON报告，输出测试统计信息
 * @version: 1.0.0
 * 
 * 使用方法:
 *   npm run test:report
 * 或
 *   node scripts/generate-test-report.js
 * 
 * 功能说明:
 *   1. 读取 tests/cypress/reports/.jsons/ 目录下的所有mochawesome报告
 *   2. 统计测试总数、通过数、失败数和执行时间
 *   3. 按测试套件分类汇总结果
 *   4. 输出格式化的测试报告到控制台
 * 
 * 依赖:
 *   - mochawesome报告文件（由Cypress测试生成）
 *   - Node.js内置模块: fs, path
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const reportsDir = path.join(__dirname, '..', 'tests', 'cypress', 'reports', '.jsons');
const outputDir = path.join(__dirname, '..', 'tests', 'cypress', 'reports');

function generateTestReport() {
  console.log('📊 正在生成测试报告...\n');
  
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('mochawesome') && file.endsWith('.json'))
    .map(file => path.join(reportsDir, file));
  
  if (reportFiles.length === 0) {
    console.log('❌ 未找到测试报告文件');
    return;
  }
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalDuration = 0;
  const suites = [];
  
  reportFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const report = JSON.parse(content);
      
      if (report.stats) {
        totalTests += report.stats.tests || 0;
        totalPassed += report.stats.passes || 0;
        totalFailed += report.stats.failures || 0;
        totalDuration += report.stats.duration || 0;
      }
      
      if (report.results) {
        report.results.forEach(result => {
          extractSuites(result, suites);
        });
      }
    } catch (err) {
      console.warn(`⚠️ 无法解析报告文件 ${file}: ${err.message}`);
    }
  });
  
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0;
  const durationMinutes = Math.floor(totalDuration / 60000);
  const durationSeconds = Math.floor((totalDuration % 60000) / 1000);
  
  const summary = {
    reportTitle: '仓库管理系统端到端测试报告',
    reportDate: new Date().toISOString(),
    summary: {
      totalSuites: suites.length,
      totalTests,
      passedTests: totalPassed,
      failedTests: totalFailed,
      skippedTests: 0,
      passRate: `${passRate}%`,
      totalDuration: `${durationMinutes}分${durationSeconds}秒`
    },
    suites,
    issues: [],
    risks: [],
    recommendations: [
      '建议将E2E测试集成到CI/CD流程中，实现自动化测试',
      '建议增加测试数据清理机制，确保测试环境的一致性',
      '建议增加视觉回归测试，确保UI一致性',
      '建议增加API性能测试，监控接口响应时间'
    ]
  };
  
  const reportPath = path.join(outputDir, 'e2e-test-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');
  
  console.log('📈 测试报告摘要');
  console.log('='.repeat(50));
  console.log(`测试套件总数: ${suites.length}`);
  console.log(`测试用例总数: ${totalTests}`);
  console.log(`通过用例: ${totalPassed}`);
  console.log(`失败用例: ${totalFailed}`);
  console.log(`通过率: ${passRate}%`);
  console.log(`执行时间: ${durationMinutes}分${durationSeconds}秒`);
  console.log('='.repeat(50));
  console.log(`\n✅ 测试报告已生成: ${reportPath}`);
  
  return summary;
}

function extractSuites(result, suites, parentTitle = '') {
  if (result.suites && result.suites.length > 0) {
    result.suites.forEach(suite => {
      const fullTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
      
      if (suite.tests && suite.tests.length > 0) {
        suites.push({
          name: suite.title,
          tests: suite.tests.length,
          passed: suite.tests.filter(t => t.state === 'passed').length,
          failed: suite.tests.filter(t => t.state === 'failed').length,
          duration: suite.duration || 0
        });
      }
      
      extractSuites(suite, suites, fullTitle);
    });
  }
}

generateTestReport();
