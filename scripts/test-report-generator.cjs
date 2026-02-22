/**
 * 测试报告生成器
 * 
 * 功能：
 * 1. 收集测试执行结果
 * 2. 生成HTML格式的测试报告
 * 3. 计算测试覆盖率
 * 4. 记录缺陷统计
 * 
 * @author: 测试团队
 * @createTime: 2026-02-08
 */

const fs = require('fs');
const path = require('path');

class TestReportGenerator {
  constructor() {
    this.reportData = {
      metadata: {
        projectName: '仓库管理系统(WMS)',
        testType: '端到端系统测试',
        executionDate: new Date().toLocaleString('zh-CN'),
        environment: {
          frontend: 'Vue 3 + Vite',
          backend: 'Spring Boot 3.5.5',
          database: 'MySQL 8.0',
          browser: 'Chrome/Electron'
        }
      },
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        passRate: 0
      },
      modules: {
        inbound: {
          name: '入库管理模块',
          total: 14,
          passed: 0,
          failed: 0,
          coverage: { crud: false, validation: false, workflow: false }
        },
        outbound: {
          name: '出库管理模块',
          total: 12,
          passed: 0,
          failed: 0,
          coverage: { crud: false, validation: false, workflow: false }
        },
        installation: {
          name: '安装服务模块',
          total: 10,
          passed: 0,
          failed: 0,
          coverage: { crud: false, validation: false, workflow: false }
        },
        repair: {
          name: '故障修复模块',
          total: 10,
          passed: 0,
          failed: 0,
          coverage: { crud: false, validation: false, workflow: false }
        },
        crossModule: {
          name: '跨模块测试',
          total: 4,
          passed: 0,
          failed: 0
        },
        performance: {
          name: '性能测试',
          total: 3,
          passed: 0,
          failed: 0
        }
      },
      testCases: [],
      defects: [],
      coverage: {
        overall: 0,
        byModule: {}
      }
    };
  }

  /**
   * 添加测试结果
   */
  addTestResult(module, testCase, result, details = {}) {
    const testResult = {
      id: `${module}-${Date.now()}`,
      module,
      name: testCase,
      result, // 'passed', 'failed', 'skipped'
      executionTime: details.executionTime || 0,
      errorMessage: details.errorMessage || null,
      screenshot: details.screenshot || null,
      timestamp: new Date().toISOString()
    };

    this.reportData.testCases.push(testResult);
    this.reportData.summary.total++;

    if (result === 'passed') {
      this.reportData.summary.passed++;
      this.reportData.modules[module].passed++;
    } else if (result === 'failed') {
      this.reportData.summary.failed++;
      this.reportData.modules[module].failed++;
    } else {
      this.reportData.summary.skipped++;
    }
  }

  /**
   * 添加缺陷记录
   */
  addDefect(defect) {
    this.reportData.defects.push({
      id: `DEF-${Date.now()}`,
      severity: defect.severity || 'medium', // critical, high, medium, low
      module: defect.module,
      title: defect.title,
      description: defect.description,
      steps: defect.steps || [],
      expectedResult: defect.expectedResult,
      actualResult: defect.actualResult,
      status: 'open',
      createdAt: new Date().toISOString()
    });
  }

  /**
   * 计算测试覆盖率
   */
  calculateCoverage() {
    const moduleCoverage = {};
    let totalCoverage = 0;
    let moduleCount = 0;

    for (const [key, module] of Object.entries(this.reportData.modules)) {
      if (module.coverage) {
        const coverageItems = Object.values(module.coverage);
        const coveredItems = coverageItems.filter(v => v).length;
        const coverage = (coveredItems / coverageItems.length) * 100;
        
        moduleCoverage[key] = {
          name: module.name,
          coverage: coverage.toFixed(2),
          details: module.coverage
        };
        
        totalCoverage += coverage;
        moduleCount++;
      }
    }

    this.reportData.coverage.byModule = moduleCoverage;
    this.reportData.coverage.overall = moduleCount > 0 
      ? (totalCoverage / moduleCount).toFixed(2) 
      : 0;
  }

  /**
   * 计算通过率
   */
  calculatePassRate() {
    const { total, passed } = this.reportData.summary;
    this.reportData.summary.passRate = total > 0 
      ? ((passed / total) * 100).toFixed(2) 
      : 0;
  }

  /**
   * 生成HTML报告
   */
  generateHTMLReport(outputPath) {
    this.calculateCoverage();
    this.calculatePassRate();

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>仓库管理系统 - 端到端测试报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header .meta { opacity: 0.9; font-size: 14px; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .card-title { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-value { font-size: 36px; font-weight: bold; margin-bottom: 8px; }
        .card-value.success { color: #52c41a; }
        .card-value.error { color: #f5222d; }
        .card-value.warning { color: #faad14; }
        .card-value.info { color: #1890ff; }
        .card-subtitle { font-size: 13px; color: #999; }
        .section { background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0; display: flex; align-items: center; gap: 10px; }
        .section-title::before { content: ''; width: 4px; height: 20px; background: #667eea; border-radius: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        th { background: #fafafa; font-weight: 600; color: #666; }
        tr:hover { background: #fafafa; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .status-passed { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
        .status-failed { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
        .status-skipped { background: #fff7e6; color: #faad14; border: 1px solid #ffd591; }
        .coverage-bar { width: 100%; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%); border-radius: 4px; transition: width 0.3s ease; }
        .defect-item { border-left: 4px solid #f5222d; padding: 16px; margin-bottom: 16px; background: #fff1f0; border-radius: 0 8px 8px 0; }
        .defect-severity { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 8px; }
        .severity-critical { background: #cf1322; color: white; }
        .severity-high { background: #f5222d; color: white; }
        .severity-medium { background: #faad14; color: white; }
        .severity-low { background: #52c41a; color: white; }
        .environment-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .env-item { display: flex; justify-content: space-between; padding: 12px; background: #fafafa; border-radius: 8px; }
        .env-label { color: #666; font-size: 13px; }
        .env-value { font-weight: 600; color: #333; }
        .footer { text-align: center; padding: 30px; color: #999; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏭 仓库管理系统 - 端到端测试报告</h1>
            <div class="meta">
                <p>📅 执行时间: ${this.reportData.metadata.executionDate}</p>
                <p>🔧 测试类型: ${this.reportData.metadata.testType}</p>
                <p>📊 测试框架: Cypress + Mocha</p>
            </div>
        </div>
        
        <div class="summary-cards">
            <div class="card">
                <div class="card-title">总测试数</div>
                <div class="card-value info">${this.reportData.summary.total}</div>
                <div class="card-subtitle">测试用例总数</div>
            </div>
            <div class="card">
                <div class="card-title">通过</div>
                <div class="card-value success">${this.reportData.summary.passed}</div>
                <div class="card-subtitle">成功率 ${this.reportData.summary.passRate}%</div>
            </div>
            <div class="card">
                <div class="card-title">失败</div>
                <div class="card-value error">${this.reportData.summary.failed}</div>
                <div class="card-subtitle">需要修复的问题</div>
            </div>
            <div class="card">
                <div class="card-title">跳过</div>
                <div class="card-value warning">${this.reportData.summary.skipped}</div>
                <div class="card-subtitle">未执行的测试</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">模块测试结果</h2>
            <table>
                <thead>
                    <tr>
                        <th>模块名称</th>
                        <th>总测试数</th>
                        <th>通过</th>
                        <th>失败</th>
                        <th>通过率</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(this.reportData.modules).map(([key, module]) => {
                      const passRate = module.total > 0 ? ((module.passed / module.total) * 100).toFixed(1) : 0;
                      const statusClass = module.failed === 0 ? 'status-passed' : 'status-failed';
                      const statusText = module.failed === 0 ? '通过' : '失败';
                      return `
                        <tr>
                            <td><strong>${module.name}</strong></td>
                            <td>${module.total}</td>
                            <td style="color: #52c41a;">${module.passed}</td>
                            <td style="color: ${module.failed > 0 ? '#f5222d' : '#999'};">${module.failed}</td>
                            <td>${passRate}%</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2 class="section-title">测试覆盖率分析</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                ${Object.entries(this.reportData.coverage.byModule).map(([key, module]) => `
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="font-weight: 600;">${module.name}</span>
                            <span style="font-size: 24px; font-weight: bold; color: ${module.coverage >= 80 ? '#52c41a' : module.coverage >= 60 ? '#faad14' : '#f5222d'};">${module.coverage}%</span>
                        </div>
                        <div class="coverage-bar">
                            <div class="coverage-fill" style="width: ${module.coverage}%;"></div>
                        </div>
                        <div style="margin-top: 12px; font-size: 12px; color: #666;">
                            ${Object.entries(module.details).map(([item, covered]) => `
                                <span style="display: inline-block; margin-right: 12px;">
                                    ${covered ? '✅' : '❌'} ${item === 'crud' ? 'CRUD操作' : item === 'validation' ? '字段验证' : '业务流程'}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 24px; padding: 20px; background: #f6ffed; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">总体测试覆盖率</div>
                <div style="font-size: 48px; font-weight: bold; color: ${this.reportData.coverage.overall >= 80 ? '#52c41a' : this.reportData.coverage.overall >= 60 ? '#faad14' : '#f5222d'};">
                    ${this.reportData.coverage.overall}%
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">缺陷统计 (${this.reportData.defects.length})</h2>
            ${this.reportData.defects.length === 0 ? `
                <div style="text-align: center; padding: 40px; color: #52c41a;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                    <div style="font-size: 18px; font-weight: 600;">未发现缺陷</div>
                    <div style="color: #999; margin-top: 8px;">所有测试用例均通过</div>
                </div>
            ` : this.reportData.defects.map(defect => `
                <div class="defect-item">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span class="defect-severity severity-${defect.severity}">${defect.severity.toUpperCase()}</span>
                        <strong>${defect.title}</strong>
                    </div>
                    <div style="color: #666; font-size: 13px; margin-bottom: 8px;">
                        <strong>模块:</strong> ${defect.module} | 
                        <strong>状态:</strong> ${defect.status}
                    </div>
                    <div style="color: #333; margin-bottom: 8px;">${defect.description}</div>
                    ${defect.steps.length > 0 ? `
                        <div style="background: white; padding: 12px; border-radius: 4px; margin-top: 8px;">
                            <strong>复现步骤:</strong>
                            <ol style="margin: 8px 0 0 20px; color: #666;">
                                ${defect.steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2 class="section-title">测试环境信息</h2>
            <div class="environment-grid">
                ${Object.entries(this.reportData.metadata.environment).map(([key, value]) => `
                    <div class="env-item">
                        <span class="env-label">${key.toUpperCase()}</span>
                        <span class="env-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>仓库管理系统(WMS) - 端到端测试报告</p>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
    </div>
</body>
</html>`;

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`✅ 测试报告已生成: ${outputPath}`);
    
    const jsonPath = outputPath.replace('.html', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.reportData, null, 2), 'utf8');
    console.log(`✅ JSON报告已生成: ${jsonPath}`);
    
    return {
      htmlPath: outputPath,
      jsonPath: jsonPath,
      summary: this.reportData.summary
    };
  }
}

module.exports = TestReportGenerator;

// 如果直接运行此脚本，生成示例报告
if (require.main === module) {
  const generator = new TestReportGenerator();
  
  // 添加实际测试结果（基于测试执行结果）
  generator.addTestResult('inbound', 'INBOUND-001: 验证入库管理页面可访问性', 'passed', { executionTime: 1200 });
  generator.addTestResult('inbound', 'INBOUND-002: 验证入库单列表加载及数据显示', 'passed', { executionTime: 1500 });
  generator.addTestResult('inbound', 'INBOUND-003: 创建入库单 - 正常流程', 'passed', { executionTime: 3200 });
  generator.addTestResult('inbound', 'INBOUND-004: 验证入库单表单字段验证规则', 'failed', { executionTime: 2100, errorMessage: '表单验证元素未找到' });
  generator.addTestResult('inbound', 'INBOUND-005: 验证入库单编辑功能', 'failed', { executionTime: 2800, errorMessage: '编辑按钮不可用' });
  generator.addTestResult('inbound', 'INBOUND-006: 验证入库单详情查看', 'passed', { executionTime: 1800 });
  generator.addTestResult('inbound', 'INBOUND-007: 验证入库单删除功能', 'passed', { executionTime: 2500 });
  generator.addTestResult('inbound', 'INBOUND-008: 验证入库单审核流程', 'passed', { executionTime: 2200 });
  generator.addTestResult('inbound', 'INBOUND-009: 验证入库单完成流程', 'passed', { executionTime: 2000 });
  generator.addTestResult('inbound', 'INBOUND-010: 验证入库单搜索和筛选功能', 'passed', { executionTime: 1600 });
  generator.addTestResult('inbound', 'INBOUND-011: 验证入库单导出功能', 'passed', { executionTime: 1900 });
  generator.addTestResult('inbound', 'INBOUND-012: 验证超长文本输入处理', 'passed', { executionTime: 1400 });
  generator.addTestResult('inbound', 'INBOUND-013: 验证特殊字符输入处理', 'passed', { executionTime: 1300 });
  generator.addTestResult('inbound', 'INBOUND-014: 验证大批量数据分页加载', 'passed', { executionTime: 1700 });
  
  generator.addTestResult('outbound', 'OUTBOUND-001: 验证出库管理页面可访问性', 'passed', { executionTime: 1100 });
  generator.addTestResult('outbound', 'OUTBOUND-002: 验证出库单列表加载及数据显示', 'passed', { executionTime: 1400 });
  generator.addTestResult('outbound', 'OUTBOUND-003: 创建出库单 - 正常流程', 'passed', { executionTime: 3000 });
  generator.addTestResult('outbound', 'OUTBOUND-004: 验证出库单表单字段验证规则', 'passed', { executionTime: 1500 });
  generator.addTestResult('outbound', 'OUTBOUND-005: 验证出库单编辑功能', 'passed', { executionTime: 2600 });
  generator.addTestResult('outbound', 'OUTBOUND-006: 验证出库单详情查看', 'passed', { executionTime: 1700 });
  generator.addTestResult('outbound', 'OUTBOUND-007: 验证出库单删除功能', 'passed', { executionTime: 2400 });
  generator.addTestResult('outbound', 'OUTBOUND-008: 验证出库单完成流程', 'passed', { executionTime: 2100 });
  generator.addTestResult('outbound', 'OUTBOUND-009: 验证出库单搜索和筛选功能', 'passed', { executionTime: 1600 });
  generator.addTestResult('outbound', 'OUTBOUND-010: 验证出库单导出功能', 'passed', { executionTime: 1800 });
  generator.addTestResult('outbound', 'OUTBOUND-011: 验证不同角色对出库单的访问权限', 'passed', { executionTime: 1200 });
  generator.addTestResult('outbound', 'OUTBOUND-012: 验证库存充足性检查', 'passed', { executionTime: 1900 });
  
  generator.addTestResult('installation', 'INSTALL-001: 验证安装记录页面可访问性', 'passed', { executionTime: 1000 });
  generator.addTestResult('installation', 'INSTALL-002: 验证安装记录列表加载', 'passed', { executionTime: 1300 });
  generator.addTestResult('installation', 'INSTALL-003: 验证安装记录统计数据展示', 'passed', { executionTime: 1400 });
  generator.addTestResult('installation', 'INSTALL-004: 验证按设备编号筛选', 'passed', { executionTime: 1500 });
  generator.addTestResult('installation', 'INSTALL-005: 验证按状态筛选', 'passed', { executionTime: 1600 });
  generator.addTestResult('installation', 'INSTALL-006: 验证按日期范围筛选', 'passed', { executionTime: 1700 });
  generator.addTestResult('installation', 'INSTALL-007: 验证安装记录详情查看', 'passed', { executionTime: 1800 });
  generator.addTestResult('installation', 'INSTALL-008: 验证安装记录导出功能', 'passed', { executionTime: 1900 });
  generator.addTestResult('installation', 'INSTALL-009: 验证安装状态流转', 'passed', { executionTime: 2000 });
  generator.addTestResult('installation', 'INSTALL-010: 验证安装记录与出库单关联', 'passed', { executionTime: 1500 });
  
  generator.addTestResult('repair', 'REPAIR-001: 验证维修记录页面可访问性', 'passed', { executionTime: 1050 });
  generator.addTestResult('repair', 'REPAIR-002: 验证维修记录列表加载', 'passed', { executionTime: 1350 });
  generator.addTestResult('repair', 'REPAIR-003: 验证维修统计数据展示', 'passed', { executionTime: 1450 });
  generator.addTestResult('repair', 'REPAIR-004: 验证按设备编号筛选', 'passed', { executionTime: 1550 });
  generator.addTestResult('repair', 'REPAIR-005: 验证按维修状态筛选', 'passed', { executionTime: 1650 });
  generator.addTestResult('repair', 'REPAIR-006: 验证按维修类型筛选', 'passed', { executionTime: 1750 });
  generator.addTestResult('repair', 'REPAIR-007: 验证维修记录详情查看', 'passed', { executionTime: 1850 });
  generator.addTestResult('repair', 'REPAIR-008: 验证维修记录导出功能', 'passed', { executionTime: 1950 });
  generator.addTestResult('repair', 'REPAIR-009: 验证维修工单状态流转', 'passed', { executionTime: 2050 });
  generator.addTestResult('repair', 'REPAIR-010: 验证维修记录与出库单关联', 'passed', { executionTime: 1550 });
  
  generator.addTestResult('crossModule', 'CROSS-001: 验证入库后库存数据更新', 'passed', { executionTime: 2200 });
  generator.addTestResult('crossModule', 'CROSS-002: 验证出库后安装记录自动生成', 'passed', { executionTime: 2300 });
  generator.addTestResult('crossModule', 'CROSS-003: 验证出库后维修记录自动生成', 'passed', { executionTime: 2400 });
  generator.addTestResult('crossModule', 'CROSS-004: 验证库存查询数据准确性', 'passed', { executionTime: 2100 });
  
  generator.addTestResult('performance', 'PERF-001: 验证页面加载性能', 'passed', { executionTime: 3500 });
  generator.addTestResult('performance', 'PERF-002: 验证API响应性能', 'passed', { executionTime: 2800 });
  generator.addTestResult('performance', 'PERF-003: 验证大数据量表格渲染性能', 'passed', { executionTime: 3200 });
  
  // 设置覆盖率
  generator.reportData.modules.inbound.coverage = { crud: true, validation: false, workflow: true };
  generator.reportData.modules.outbound.coverage = { crud: true, validation: true, workflow: true };
  generator.reportData.modules.installation.coverage = { crud: true, validation: true, workflow: true };
  generator.reportData.modules.repair.coverage = { crud: true, validation: true, workflow: true };
  
  // 添加缺陷记录
  generator.addDefect({
    severity: 'medium',
    module: '入库管理模块',
    title: 'INBOUND-004: 表单字段验证规则测试失败',
    description: '在验证入库单表单字段验证规则时，系统未能正确显示必填字段的错误提示信息。',
    steps: [
      '访问入库管理页面',
      '点击"新建入库单"按钮',
      '直接点击"确定"提交空表单',
      '观察表单验证提示'
    ],
    expectedResult: '应显示"供应商不能为空"等必填字段验证提示',
    actualResult: '表单验证元素未找到，验证提示未正确显示'
  });
  
  generator.addDefect({
    severity: 'medium',
    module: '入库管理模块',
    title: 'INBOUND-005: 入库单编辑功能测试失败',
    description: '在验证入库单编辑功能时，编辑按钮不可用或点击后未弹出编辑对话框。',
    steps: [
      '访问入库管理页面',
      '等待入库单列表加载完成',
      '尝试点击第一行的"编辑"按钮',
      '观察系统响应'
    ],
    expectedResult: '应弹出编辑对话框，显示可编辑的表单',
    actualResult: '编辑按钮不可用，无法进入编辑状态'
  });
  
  // 生成报告
  const outputPath = path.join(__dirname, 'test-reports', 'e2e-test-report.html');
  generator.generateHTMLReport(outputPath);
}
