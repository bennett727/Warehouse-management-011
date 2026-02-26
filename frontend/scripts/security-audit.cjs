/**
 * 安全审计脚本
 * 用于定期检查项目依赖的安全漏洞
 * 
 * 使用方法:
 * node scripts/security-audit.js
 * 
 * 建议配置到CI/CD流程中定期执行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 高危漏洞阈值
  HIGH_SEVERITY_THRESHOLD: 5,
  // 审计报告输出路径
  REPORT_PATH: path.join(__dirname, '../docs/security/audit-report.md'),
  // 忽略的漏洞（已知且已评估的）
  IGNORED_VULNERABILITIES: [
    // exceljs 的深层依赖漏洞，已评估为低风险
    'GHSA-3ppc-4f35-3m26', // minimatch ReDoS
  ]
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runAudit() {
  log('🔍 开始执行安全审计...', 'blue');
  
  try {
    // 执行 npm audit
    const auditOutput = execSync('npm audit --json', { 
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const auditResult = JSON.parse(auditOutput);
    generateReport(auditResult);
    
  } catch (error) {
    // npm audit 在发现漏洞时会返回非零退出码
    if (error.stdout) {
      try {
        const auditResult = JSON.parse(error.stdout);
        generateReport(auditResult);
        process.exit(1);
      } catch (parseError) {
        log('❌ 解析审计结果失败', 'red');
        console.error(parseError);
        process.exit(1);
      }
    } else {
      log('❌ 执行审计失败', 'red');
      console.error(error.message);
      process.exit(1);
    }
  }
}

function generateReport(auditResult) {
  const { vulnerabilities, metadata } = auditResult;
  
  // 统计漏洞数量
  let critical = 0;
  let high = 0;
  let moderate = 0;
  let low = 0;
  let info = 0;
  
  const vulnerablePackages = [];
  
  for (const [pkgName, vulnInfo] of Object.entries(vulnerabilities || {})) {
    vulnerablePackages.push({
      name: pkgName,
      severity: vulnInfo.severity,
      via: vulnInfo.via,
      effects: vulnInfo.effects,
      range: vulnInfo.range,
      fixAvailable: vulnInfo.fixAvailable
    });
    
    switch (vulnInfo.severity) {
      case 'critical': critical++; break;
      case 'high': high++; break;
      case 'moderate': moderate++; break;
      case 'low': low++; break;
      case 'info': info++; break;
    }
  }
  
  // 控制台输出
  log('\n📊 安全审计报告', 'blue');
  log('================', 'blue');
  log(`总依赖数: ${metadata?.dependencies?.total || 'N/A'}`);
  log(`漏洞统计:`, 'yellow');
  if (critical > 0) log(`  严重: ${critical}`, 'red');
  if (high > 0) log(`  高危: ${high}`, 'red');
  if (moderate > 0) log(`  中危: ${moderate}`, 'yellow');
  if (low > 0) log(`  低危: ${low}`);
  if (info > 0) log(`  信息: ${info}`);
  
  if (vulnerablePackages.length === 0) {
    log('\n✅ 未发现安全漏洞！', 'green');
  } else {
    log('\n📦 存在漏洞的包:', 'yellow');
    vulnerablePackages.forEach(pkg => {
      const color = pkg.severity === 'critical' || pkg.severity === 'high' ? 'red' : 'yellow';
      log(`  • ${pkg.name} (${pkg.severity})`, color);
      if (pkg.fixAvailable) {
        log(`    修复可用: ${pkg.fixAvailable.name}@${pkg.fixAvailable.version}`, 'green');
      }
    });
  }
  
  // 生成Markdown报告
  const reportContent = generateMarkdownReport({
    timestamp: new Date().toISOString(),
    summary: { critical, high, moderate, low, info },
    packages: vulnerablePackages,
    metadata
  });
  
  // 确保目录存在
  const reportDir = path.dirname(CONFIG.REPORT_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // 写入报告
  fs.writeFileSync(CONFIG.REPORT_PATH, reportContent);
  log(`\n📝 报告已保存: ${CONFIG.REPORT_PATH}`, 'green');
  
  // 检查是否超过阈值
  if (high > CONFIG.HIGH_SEVERITY_THRESHOLD) {
    log(`\n⚠️ 警告: 高危漏洞数量(${high})超过阈值(${CONFIG.HIGH_SEVERITY_THRESHOLD})`, 'red');
    process.exit(1);
  }
}

function generateMarkdownReport(data) {
  const { timestamp, summary, packages, metadata } = data;
  
  return `# 安全审计报告

**审计时间**: ${timestamp}

## 摘要

- **总依赖数**: ${metadata?.dependencies?.total || 'N/A'}
- **生产依赖**: ${metadata?.dependencies?.prod || 'N/A'}
- **开发依赖**: ${metadata?.dependencies?.dev || 'N/A'}

### 漏洞统计

| 严重程度 | 数量 |
|---------|------|
| 严重 (Critical) | ${summary.critical} |
| 高危 (High) | ${summary.high} |
| 中危 (Moderate) | ${summary.moderate} |
| 低危 (Low) | ${summary.low} |
| 信息 (Info) | ${summary.info} |
| **总计** | **${summary.critical + summary.high + summary.moderate + summary.low + summary.info}** |

## 详细漏洞列表

${packages.length === 0 ? '✅ 未发现安全漏洞' : packages.map(pkg => `
### ${pkg.name}

- **严重程度**: ${pkg.severity}
- **影响范围**: ${pkg.range}
- **依赖路径**: ${Array.isArray(pkg.via) ? pkg.via.map(v => v.title || v).join(', ') : pkg.via}
- **修复状态**: ${pkg.fixAvailable ? `✅ 可用 (${pkg.fixAvailable.name}@${pkg.fixAvailable.version})` : '❌ 暂无修复方案'}
`).join('\n')}

## 修复建议

1. **立即修复**: 处理严重和高危漏洞
   \`\`\`bash
   npm audit fix
   # 或
   npm audit fix --force
   \`\`\`

2. **更新依赖**: 定期更新依赖包
   \`\`\`bash
   npm update
   \`\`\`

3. **查看详情**:
   \`\`\`bash
   npm audit
   \`\`\`

## 已知问题说明

### exceljs 相关漏洞

当前项目使用 exceljs 处理 Excel 文件，该库存在一些已知的安全漏洞：

1. **ReDoS 漏洞** (通过 minimatch 依赖)
   - **风险等级**: 中
   - **影响范围**: 前端浏览器环境
   - **缓解措施**: 
     - 仅处理可信来源的文件
     - 添加文件大小限制（10MB）
     - 添加文件类型验证
   - **状态**: 等待官方修复，已添加安全使用说明

## 监控机制

- **自动审计**: 建议每周运行一次此脚本
- **CI/CD集成**: 在构建流程中集成安全审计
- **告警阈值**: 高危漏洞超过 5 个时触发告警

---
*此报告由 security-audit.js 自动生成*
`;
}

// 主入口
if (require.main === module) {
  runAudit();
}

module.exports = { runAudit, generateReport };
