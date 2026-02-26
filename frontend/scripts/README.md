# 脚本使用指南

本目录包含仓库管理系统前端项目的各种开发和测试脚本。

## 目录结构

```
scripts/
├── utils/                          # 共享工具库
│   └── index.js                   # 工具函数和配置
├── README.md                      # 本文档
│
├── 开发工具
│   ├── dev-with-auto-restart.js   # 带自动重启的开发服务器
│   └── analyze-performance.js     # 性能分析工具
│
├── E2E测试脚本
│   ├── run-e2e-with-health-check.js    # 带健康检查的E2E测试
│   ├── run-complete-e2e-tests.js       # 完整E2E测试套件
│   ├── run-e2e-with-backend.js         # 自动启动后端的E2E测试
│   ├── run-test-suite.js               # 稳定性测试运行
│   └── run-scheduled-tests.js          # 定时测试任务
│
├── 代码质量检查
│   ├── check-api-paths.js         # API路径一致性检查
│   ├── check-data-cy-coverage.js  # data-cy属性覆盖率检查
│   ├── check-api-constants-exports.js  # API常量导出检查
│   └── check-encoding.js          # 文件编码检查
│
├── 报告生成
│   ├── generate-test-report.js    # 测试报告生成
│   └── cleanup-test-data.js       # 测试数据清理
│
└── 安全审计
    ├── security-audit.cjs         # 安全审计脚本
    ├── clear-browser-cache.cjs    # 清理浏览器缓存
    └── production-readiness-check.cjs  # 生产环境就绪检查
```

> **注意**: 一次性迁移脚本已归档到 `docs/archive/scripts/` 目录。

## 快速开始

### 开发环境

```bash
# 启动开发服务器（带自动重启）
npm run dev

# 强制启动（不使用自动重启）
npm run dev:force
```

### 运行测试

```bash
# 单元测试
npm run test:unit

# E2E测试（需要后端服务已启动）
npm run test:e2e

# 完整E2E测试套件
npm run test:e2e:complete

# 自动启动后端并运行E2E测试
npm run test:e2e:full

# 运行单个测试模块
npm run test:e2e:login      # 登录测试
npm run test:e2e:asset      # 资产管理测试
npm run test:e2e:inventory  # 库存管理测试
npm run test:e2e:dashboard  # 仪表盘测试
npm run test:e2e:boundary   # 边界值测试
```

### 代码质量检查

```bash
# 运行所有检查
npm run check:all

# 单独检查
npm run check:api          # API路径检查
npm run check:data-cy      # data-cy覆盖率检查
npm run check:exports      # API常量导出检查

# 代码规范检查
npm run lint
npm run format:check
```

### 性能分析

```bash
# 构建并分析性能
npm run build:analyze

# 仅分析（需要先构建）
npm run analyze
```

## 脚本详细说明

### 开发工具

#### dev-with-auto-restart.js

启动开发服务器，自动检测端口占用并终止旧进程。

```bash
node scripts/dev-with-auto-restart.js
```

**功能：**
- 检测端口 5173 是否被占用
- 自动终止占用端口的 Node 进程
- 启动 Vite 开发服务器

#### analyze-performance.js

分析构建产物性能，生成优化建议。

```bash
node scripts/analyze-performance.js [选项]

选项:
  -h, --help      显示帮助信息
  -v, --verbose   显示详细日志
  --silent        静默模式
```

**功能：**
- 分析 JS/CSS/图片资源大小
- 检查性能预算
- 生成优化建议
- 输出性能报告到 `performance-report.json`

### E2E测试脚本

#### run-e2e-with-health-check.js

运行E2E测试前执行健康检查。

```bash
npm run test:e2e
# 或
node scripts/run-e2e-with-health-check.js [选项]

选项:
  -h, --help      显示帮助信息
  -v, --verbose   显示详细日志
  --silent        静默模式

环境变量:
  API_HOST        后端API主机 (默认: localhost)
  API_PORT        后端API端口 (默认: 8080)
  CYPRESS_BROWSER 测试浏览器 (默认: edge)
```

**流程：**
1. 检查后端API服务健康状态
2. 检查前端服务状态
3. 运行Cypress E2E测试
4. 输出测试结果

#### run-complete-e2e-tests.js

按顺序执行所有E2E测试套件。

```bash
npm run test:e2e:complete
# 或
node scripts/run-complete-e2e-tests.js [选项]

选项:
  --skip-health-check  跳过健康检查
  -h, --help           显示帮助信息
  -v, --verbose        显示详细日志
```

**测试顺序：**
1. 登录认证测试 (必需)
2. 仪表盘测试
3. 资产管理测试
4. 库存管理测试
5. 边界和异常测试

**特性：**
- 登录测试失败会终止后续测试
- 生成详细测试报告
- 保存报告到 `tests/cypress/reports/complete-test-report.json`

#### run-e2e-with-backend.js

自动启动后端服务并执行E2E测试。

```bash
npm run test:e2e:full
# 或
node scripts/run-e2e-with-backend.js [选项]

环境变量:
  SPRING_PROFILE      Spring环境配置 (默认: test)
  SKIP_BACKEND_START  跳过后端启动 (默认: false)
  API_HOST            后端API主机 (默认: localhost)
  API_PORT            后端API端口 (默认: 8080)
```

**流程：**
1. 检查后端服务状态
2. 如未运行，编译并启动后端
3. 等待后端就绪
4. 执行E2E测试
5. 自动清理进程

#### run-test-suite.js

多次运行测试以验证稳定性。

```bash
npm run test:stability
# 或
node scripts/run-test-suite.js [运行次数]

参数:
  运行次数  可选，默认为 3 次，最大 10 次
```

**输出：**
- 每次运行的结果
- 成功率统计
- 稳定性评级

#### run-scheduled-tests.js

用于CI/CD环境的定时测试任务。

```bash
npm run test:scheduled
# 或
node scripts/run-scheduled-tests.js [测试类型]

参数:
  测试类型  smoke | regression | full (默认: smoke)

环境变量:
  TEST_TYPE     测试类型（覆盖命令行参数）
  CI            是否在CI环境运行
```

**测试类型：**
- `smoke`: 冒烟测试（登录、仪表盘）
- `regression`: 回归测试（所有核心功能）
- `full`: 完整测试（包含边界测试）

### 代码质量检查

#### check-api-paths.js

扫描前后端代码，检查API路径定义的一致性。

```bash
npm run check:api
# 或
node scripts/check-api-paths.js [选项]

选项:
  -h, --help      显示帮助信息
  -v, --verbose   显示详细日志
```

**检查内容：**
- 前端API常量定义
- 后端Controller路径注解
- 路径命名规范

#### check-data-cy-coverage.js

检查Vue文件中data-cy测试属性的覆盖情况。

```bash
npm run check:data-cy
# 或
node scripts/check-data-cy-coverage.js [目录路径]

参数:
  目录路径  可选，默认为 src/
```

**检查元素：**
- el-button (按钮)
- el-input (输入框)
- el-table (表格)
- el-dialog (对话框)
- el-form (表单)
- 等...

#### check-api-constants-exports.js

检查API常量的导入导出一致性。

```bash
npm run check:exports
# 或
node scripts/check-api-constants-exports.js
```

**检查内容：**
- `apiConstants.js` 中导出的常量
- 使用这些常量的文件中的导入
- 报告不存在的导入

#### check-encoding.js

检查项目文件编码，确保使用UTF-8无BOM格式。

```bash
npm run check-encoding
# 或
node scripts/check-encoding.js
```

**检查内容：**
- UTF-8 BOM标记
- Unicode替换字符
- 非法控制字符

### 报告生成

#### generate-test-report.js

读取Cypress测试报告，生成汇总报告。

```bash
npm run test:report
# 或
node scripts/generate-test-report.js
```

**输入：**
- `tests/cypress/reports/.jsons/mochawesome*.json`

**输出：**
- `tests/cypress/reports/e2e-test-summary.json`

#### cleanup-test-data.js

清理后端数据库中的测试数据。

```bash
npm run test:cleanup
# 或
node scripts/cleanup-test-data.js

环境变量:
  API_URL  后端API地址 (默认: http://localhost:8080/api)
```

**安全说明：**
- 仅删除带有 `TEST_DATA_` 前缀的数据
- 需要管理员认证令牌
- 建议在测试环境使用

## 共享工具库

### utils/index.js

提供共享的工具函数和配置。

**导出内容：**

```javascript
// 常量
PROJECT_ROOT    // 项目根目录
colors          // 颜色配置
LogLevel        // 日志级别枚举
CONFIG          // 项目配置

// 函数
logger          // 日志工具
Timer           // 计时器类
formatBytes     // 格式化字节大小
parseArgs       // 解析命令行参数
showHelp        // 显示帮助信息
exit            // 退出程序
execAsync       // 异步执行命令
checkService    // 检查服务是否可访问
waitForService  // 等待服务就绪
setLogLevel     // 设置日志级别
```

**使用示例：**

```javascript
import {
  logger,
  CONFIG,
  Timer,
  parseArgs,
  showHelp,
  exit,
  checkService
} from './utils/index.js';

// 使用日志
logger.info('信息消息');
logger.success('成功消息');
logger.warning('警告消息');
logger.error('错误消息');
logger.title('标题');
logger.section('章节');

// 使用计时器
const timer = new Timer();
timer.start();
// ... 执行操作
const duration = timer.stop();
logger.info(`耗时: ${timer.format()}`);

// 检查服务
const healthy = await checkService({
  host: 'localhost',
  port: 8080,
  path: '/api/health',
  timeout: 5000
});

// 退出程序
exit(0, '成功消息');  // 正常退出
exit(1, '错误消息');  // 异常退出
```

## 环境变量

所有脚本都支持以下环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `API_HOST` | 后端API主机 | localhost |
| `API_PORT` | 后端API端口 | 8080 |
| `API_BASE_PATH` | API基础路径 | /api |
| `FRONTEND_HOST` | 前端主机 | localhost |
| `FRONTEND_PORT` | 前端端口 | 5173 |
| `CYPRESS_BROWSER` | Cypress浏览器 | edge |
| `CYPRESS_HEADLESS` | 是否无头模式 | true |
| `SPRING_PROFILE` | Spring环境配置 | test |
| `SKIP_BACKEND_START` | 跳过后端启动 | false |

## 最佳实践

### 1. 本地开发

```bash
# 终端1：启动后端
cd ../spring_boot && mvn spring-boot:run

# 终端2：启动前端
npm run dev

# 终端3：运行测试
npm run test:e2e
```

### 2. 完整测试流程

```bash
# 一键运行完整测试（自动启动后端）
npm run test:e2e:full
```

### 3. CI/CD集成

```bash
# 运行冒烟测试
npm run test:scheduled smoke

# 运行回归测试
npm run test:scheduled regression

# 生成测试报告
npm run test:report
```

### 4. 代码提交前检查

```bash
# 运行所有检查
npm run pre-commit

# 或分别运行
npm run lint
npm run check:api
npm run check:data-cy
npm run check:exports
```

## 故障排除

### 后端服务无法启动

1. 检查Java版本：`java -version` (需要 Java 17+)
2. 检查Maven安装：`mvn -version`
3. 检查端口占用：`netstat -ano | findstr :8080`

### E2E测试失败

1. 检查后端服务是否运行：`curl http://localhost:8080/api/health`
2. 检查前端服务是否运行：`curl http://localhost:5173`
3. 查看Cypress日志：`tests/cypress/reports/`

### 脚本执行失败

1. 检查Node.js版本：`node --version` (需要 Node.js 18+)
2. 检查npm版本：`npm --version`
3. 重新安装依赖：`npm install`

## 版本历史

### v2.0.0 (当前版本)

- 创建共享工具库 `utils/index.js`
- 统一脚本模块系统为ESM
- 添加统一的日志系统和命令行参数解析
- 优化脚本结构和错误处理
- 添加 `--help` 和 `--verbose` 支持

### v1.0.0

- 初始版本
- 基础功能实现
