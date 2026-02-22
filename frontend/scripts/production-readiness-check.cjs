/**
 * 生产环境就绪检查脚本
 * 全面评估项目是否可以上线
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 配置
const CONFIG = {
  frontend: {
    url: 'http://localhost:5173',
    buildDir: 'dist',
    springBootStaticDir: '../spring_boot/src/main/resources/static',
  },
  backend: {
    url: 'http://localhost:8080',
    healthEndpoint: '/api/health',
  },
  thresholds: {
    minTestPassRate: 0.8,      // 最低测试通过率 80%
    maxBundleSize: 50 * 1024 * 1024, // 最大包大小 50MB
    maxBuildTime: 120000,      // 最大构建时间 2分钟
    apiResponseTime: 3000,     // API响应时间 3秒
  },
};

// 检查结果
const checkResults = {
  timestamp: new Date().toISOString(),
  status: 'PENDING',
  checks: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  },
};

/**
 * 执行检查
 */
function runCheck(name, checkFn) {
  console.log(`\n🔍 检查: ${name}`);
  checkResults.summary.total++;

  try {
    const result = checkFn();
    checkResults.checks[name] = result;

    if (result.status === 'PASS') {
      console.log(`  ✅ ${result.message}`);
      checkResults.summary.passed++;
    } else if (result.status === 'WARN') {
      console.log(`  ⚠️  ${result.message}`);
      checkResults.summary.warnings++;
    } else {
      console.log(`  ❌ ${result.message}`);
      checkResults.summary.failed++;
    }

    return result;
  } catch (error) {
    console.log(`  ❌ 检查失败: ${error.message}`);
    checkResults.checks[name] = {
      status: 'FAIL',
      message: error.message,
    };
    checkResults.summary.failed++;
    return { status: 'FAIL', message: error.message };
  }
}

/**
 * 检查1: 前端服务是否可访问
 */
function checkFrontendAccessibility() {
  return new Promise((resolve) => {
    const req = http.get(CONFIG.frontend.url, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'PASS', message: '前端服务正常运行' });
      } else {
        resolve({ status: 'FAIL', message: `前端服务返回状态码 ${res.statusCode}` });
      }
    });

    req.on('error', () => {
      resolve({ status: 'FAIL', message: '前端服务无法访问' });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 'FAIL', message: '前端服务连接超时' });
    });
  });
}

/**
 * 检查2: 后端服务是否可访问
 */
function checkBackendAccessibility() {
  return new Promise((resolve) => {
    const req = http.get(CONFIG.backend.url + CONFIG.backend.healthEndpoint, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'PASS', message: '后端服务正常运行' });
      } else {
        resolve({ status: 'FAIL', message: `后端服务返回状态码 ${res.statusCode}` });
      }
    });

    req.on('error', () => {
      resolve({ status: 'FAIL', message: '后端服务无法访问' });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 'FAIL', message: '后端服务连接超时' });
    });
  });
}

/**
 * 检查3: 构建产物是否存在
 */
function checkBuildArtifacts() {
  // 检查标准 dist 目录
  const buildPath = path.join(process.cwd(), CONFIG.frontend.buildDir);
  // 检查 Spring Boot static 目录
  const springBootPath = path.join(process.cwd(), CONFIG.frontend.springBootStaticDir);

  let actualBuildPath = null;

  if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
    actualBuildPath = buildPath;
  } else if (fs.existsSync(springBootPath) && fs.existsSync(path.join(springBootPath, 'index.html'))) {
    actualBuildPath = springBootPath;
  } else {
    return { status: 'FAIL', message: '构建产物目录不存在 (dist/ 或 spring_boot static/)' };
  }

  const indexHtml = path.join(actualBuildPath, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    return { status: 'FAIL', message: 'index.html 不存在' };
  }

  // 计算构建产物大小
  let totalSize = 0;
  function calculateSize(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stat.size;
      }
    }
  }
  calculateSize(actualBuildPath);

  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);

  if (totalSize > CONFIG.thresholds.maxBundleSize) {
    return {
      status: 'WARN',
      message: `构建产物大小 ${sizeInMB}MB，超过阈值 ${(CONFIG.thresholds.maxBundleSize / 1024 / 1024).toFixed(0)}MB`
    };
  }

  return { status: 'PASS', message: `构建产物大小 ${sizeInMB}MB` };
}

/**
 * 检查4: 关键配置文件是否存在
 */
function checkConfigFiles() {
  const requiredFiles = [
    'config/vite.config.js',
    'config/cypress.config.js',
    'package.json',
  ];

  const missingFiles = [];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    return { status: 'FAIL', message: `缺少配置文件: ${missingFiles.join(', ')}` };
  }

  return { status: 'PASS', message: '所有关键配置文件存在' };
}

/**
 * 检查5: 环境变量配置
 */
function checkEnvironmentVariables() {
  const envFiles = ['.env', '.env.production', '.env.development'];
  const existingFiles = envFiles.filter(f => fs.existsSync(path.join(process.cwd(), f)));

  if (existingFiles.length === 0) {
    return { status: 'WARN', message: '未找到环境变量配置文件' };
  }

  return { status: 'PASS', message: `找到 ${existingFiles.length} 个环境变量配置文件` };
}

/**
 * 检查6: 依赖安全性
 */
function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // 检查是否有严重漏洞（简化检查）
    const hasLockFile = fs.existsSync('package-lock.json');

    if (!hasLockFile) {
      return { status: 'WARN', message: '缺少 package-lock.json' };
    }

    return { status: 'PASS', message: '依赖管理文件完整' };
  } catch (error) {
    return { status: 'FAIL', message: '无法读取 package.json' };
  }
}

/**
 * 检查7: 测试覆盖率
 */
function checkTestCoverage() {
  const coverageDir = path.join(process.cwd(), 'coverage');

  if (!fs.existsSync(coverageDir)) {
    return { status: 'WARN', message: '未找到测试覆盖率报告' };
  }

  return { status: 'PASS', message: '测试覆盖率报告存在' };
}

/**
 * 检查8: API端点可用性
 */
async function checkApiEndpoints() {
  const endpoints = [
    '/api/auth/login',
    '/api/devices',
    '/api/dashboard/statistics',
  ];

  const results = [];
  for (const endpoint of endpoints) {
    const result = await new Promise((resolve) => {
      const req = http.get(CONFIG.backend.url + endpoint, { method: 'OPTIONS' }, (res) => {
        resolve(res.statusCode !== 404);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    });
    results.push({ endpoint, available: result });
  }

  const availableCount = results.filter(r => r.available).length;

  if (availableCount === 0) {
    return { status: 'FAIL', message: '所有API端点都不可用' };
  }

  if (availableCount < endpoints.length) {
    return { status: 'WARN', message: `${availableCount}/${endpoints.length} 个API端点可用` };
  }

  return { status: 'PASS', message: '所有关键API端点可用' };
}

/**
 * 生成报告
 */
function generateReport() {
  // 确定总体状态
  if (checkResults.summary.failed === 0 && checkResults.summary.warnings === 0) {
    checkResults.status = 'READY';
  } else if (checkResults.summary.failed === 0) {
    checkResults.status = 'READY_WITH_WARNINGS';
  } else {
    checkResults.status = 'NOT_READY';
  }

  // 保存报告
  const reportPath = path.join('reports', `production-readiness-report-${Date.now()}.json`);
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(checkResults, null, 2));

  return reportPath;
}

/**
 * 打印报告
 */
function printReport(reportPath) {
  console.log('\n' + '='.repeat(70));
  console.log('📋 生产环境就绪检查报告');
  console.log('='.repeat(70));

  console.log(`\n检查时间: ${checkResults.timestamp}`);
  console.log(`总体状态: ${getStatusEmoji(checkResults.status)} ${checkResults.status}`);

  console.log(`\n检查统计:`);
  console.log(`  ✅ 通过: ${checkResults.summary.passed}`);
  console.log(`  ⚠️  警告: ${checkResults.summary.warnings}`);
  console.log(`  ❌ 失败: ${checkResults.summary.failed}`);
  console.log(`  📊 总计: ${checkResults.summary.total}`);

  console.log(`\n详细结果:`);
  for (const [name, result] of Object.entries(checkResults.checks)) {
    const emoji = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`  ${emoji} ${name}: ${result.message}`);
  }

  console.log(`\n报告文件: ${reportPath}`);

  console.log('\n' + '='.repeat(70));

  // 上线建议
  if (checkResults.status === 'READY') {
    console.log('✅ 项目已就绪，可以上线！');
  } else if (checkResults.status === 'READY_WITH_WARNINGS') {
    console.log('⚠️  项目可以上线，但建议处理警告项');
  } else {
    console.log('❌ 项目未就绪，请修复失败项后再尝试上线');
  }

  console.log('='.repeat(70) + '\n');
}

/**
 * 获取状态表情
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'READY': return '✅';
    case 'READY_WITH_WARNINGS': return '⚠️';
    case 'NOT_READY': return '❌';
    default: return '⏳';
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生产环境就绪检查...\n');

  // 运行所有检查
  runCheck('前端服务可访问性', () => checkFrontendAccessibility());
  runCheck('后端服务可访问性', () => checkBackendAccessibility());
  runCheck('构建产物检查', checkBuildArtifacts);
  runCheck('配置文件检查', checkConfigFiles);
  runCheck('环境变量检查', checkEnvironmentVariables);
  runCheck('依赖管理检查', checkDependencies);
  runCheck('测试覆盖率检查', checkTestCoverage);
  runCheck('API端点检查', () => checkApiEndpoints());

  // 等待异步检查完成
  await Promise.all(Object.values(checkResults.checks).map(async (check) => {
    if (check instanceof Promise) {
      await check;
    }
  }));

  // 生成报告
  const reportPath = generateReport();

  // 打印报告
  printReport(reportPath);

  // 根据状态退出
  process.exit(checkResults.status === 'NOT_READY' ? 1 : 0);
}

// 运行
main().catch(error => {
  console.error('❌ 检查过程出错:', error);
  process.exit(1);
});
