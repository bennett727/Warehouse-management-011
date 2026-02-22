# 项目结构说明文档

## 📁 项目根目录结构

```
Warehouse management-011/
├── .github/                      # GitHub配置
│   ├── workflows/                # CI/CD工作流
│   │   ├── backend.yml           # 后端CI/CD配置
│   │   ├── ci-cd.yml             # 主CI/CD配置
│   │   └── frontend.yml          # 前端CI/CD配置
│   └── DEPENDENCIES.md           # 依赖说明文档
│
├── .trae/                        # Trae AI配置
│   └── rules/                    # 项目规则文档
│       ├── api-definitions.md    # API定义规范
│       ├── feature-modules.md    # 功能模块规范
│       ├── project_rules.md      # 项目规则
│       ├── 接口与功能映射文档.md
│       ├── 权限控制规则.md
│       ├── 路径引用规范.md
│       └── 错误处理规范.md
│
├── docs/                         # 项目文档
│   ├── api/                      # API文档
│   │   └── 前后端数据字段命名规范.md
│   │
│   ├── project-management/       # 项目管理文档
│   │   ├── user_rules.md
│   │   ├── 后端项目文件分类清单.md
│   │   ├── 文档整理完成报告.md
│   │   ├── 文档整理最终报告.md
│   │   ├── 文档整理计划.md
│   │   └── 文档管理规范.md
│   │
│   ├── security/                 # 安全文档
│   │   └── API_SECURITY_CHECK_REPORT.md
│   │
│   ├── testing/                  # 测试文档
│   │   ├── API路径前缀修复总结报告.md
│   │   ├── E2E测试总结报告.md
│   │   ├── e2e-test-execution-guide.md
│   │   ├── e2e-test-plan.md
│   │   ├── test-selectors-specification.md
│   │   ├── 全面测试结果报告.md
│   │   ├── 全面测试计划.md
│   │   ├── 测试文档索引.md
│   │   ├── 测试问题修复总结报告.md
│   │   ├── 测试验证执行报告.md
│   │   └── 问题分析与修复方案.md
│   │
│   ├── CI_CD.md                  # CI/CD文档
│   ├── CI_CD_QUICKSTART.md       # CI/CD快速开始
│   ├── INSTALLATION.md           # 安装指南
│   ├── QUICK_START.md            # 快速开始
│   ├── README.md                 # 项目说明
│   ├── SECURITY_IMPROVEMENTS.md   # 安全改进
│   └── TROUBLESHOOTING.md        # 故障排除
│
├── frontend/                     # 前端项目
│   ├── .husky/                   # Git钩子
│   ├── config/                   # 配置文件
│   │   ├── env/                  # 环境变量
│   │   ├── cypress.config.js     # Cypress配置
│   │   ├── eslint.config.js      # ESLint配置
│   │   ├── vite.config.js        # Vite配置
│   │   └── vitest.config.js      # Vitest配置
│   │
│   ├── docs/                     # 前端文档
│   │   └── FAVICON_GUIDE.md      # Favicon配置指南
│   │
│   ├── public/                   # 静态资源
│   │
│   ├── reports/                  # 测试报告
│   │   ├── e2e/                  # E2E测试报告
│   │   │   └── e2e-test-summary.md
│   │   └── performance-report.json  # 性能测试报告
│   ├── src/                      # 源代码
│   │   ├── api/                  # API接口
│   │   │   ├── auth/             # 认证API
│   │   │   ├── device/           # 设备API
│   │   │   ├── inventory/        # 库存API
│   │   │   ├── maintenance/      # 维护API
│   │   │   ├── repair/           # 维修API
│   │   │   ├── reports/          # 报表API
│   │   │   ├── system/           # 系统API
│   │   │   ├── installation/     # 安装API
│   │   │   ├── dashboard/        # 仪表盘API
│   │   │   ├── services/         # API服务
│   │   │   ├── base/             # 基础API
│   │   │   ├── ApiManager.js     # API管理器
│   │   │   └── index.js         # API入口
│   │   │
│   │   ├── assets/               # 资源文件
│   │   ├── components/           # 组件
│   │   ├── composables/          # 组合式函数
│   │   ├── config/               # 配置
│   │   ├── constants/            # 常量
│   │   │   ├── apiConstants.js   # API路径常量（统一管理）
│   │   │   ├── appConstants.js   # 应用常量
│   │   │   ├── deviceStatus.js   # 设备状态常量
│   │   │   ├── batchStatus.js    # 批次状态常量
│   │   │   └── index.js         # 常量入口
│   │   │
│   │   ├── router/               # 路由
│   │   ├── stores/               # 状态管理
│   │   ├── utils/                # 工具函数
│   │   │   ├── request.js       # HTTP请求封装
│   │   │   ├── performanceMonitor.js  # 性能监控
│   │   │   ├── errorMonitor.js  # 错误监控
│   │   │   └── tokenManager.js # 令牌管理
│   │   ├── views/                # 页面视图
│   │   ├── App.vue               # 根组件
│   │   └── main.js               # 入口文件
│   │
│   ├── tests/                    # 测试文件
│   │   └── cypress/              # Cypress测试
│   │       ├── e2e/              # E2E测试
│   │       └── fixtures/         # 测试数据
│   │
│   ├── .browserslistrc           # 浏览器兼容性
│   ├── .gitignore                # Git忽略文件
│   ├── .lintstagedrc.json        # Lint-staged配置
│   ├── .prettierignore           # Prettier忽略
│   ├── .prettierrc               # Prettier配置
│   ├── index.html                # HTML入口
│   ├── package.json              # 依赖配置
│   ├── postcss.config.cjs        # PostCSS配置
│   ├── run-tests.bat             # 测试运行脚本
│   └── test-results.json         # 测试结果
│
├── scripts/                      # 脚本文件
│   ├── batch/                    # 批处理脚本
│   │   ├── run.bat               # 运行脚本
│   │   ├── setup_mysql.bat       # MySQL设置
│   │   ├── verify-isolation.bat  # 隔离验证
│   │   └── watch-logs.bat        # 日志监控
│   │
│   ├── powershell/               # PowerShell脚本
│   │   ├── fix_login_selectors.ps1          # 修复登录选择器
│   │   ├── run-tests-utf8.ps1               # UTF-8测试运行
│   │   ├── test_crud.ps1                    # CRUD测试
│   │   ├── test_crud_fixed.ps1              # 修复版CRUD测试
│   │   ├── test_simple_api.ps1               # 简单API测试
│   │   ├── test_enhanced_security.ps1        # 增强安全测试
│   │   ├── test_api_security.ps1             # API安全测试
│   │   ├── test_api_security_invalid_token.ps1  # 无效令牌测试
│   │   ├── test_api_security_expired_token.ps1  # 过期令牌测试
│   │   ├── test_api_diagnostic.ps1           # API诊断测试
│   │   └── test_api_diagnostic_en.ps1        # API诊断测试(英文)
│   │
│   ├── test-report-generator.cjs # 测试报告生成器
│   │
│   └── README.md                 # 脚本说明
│
├── reports/                      # 报告文件
│   ├── security/                 # 安全报告
│   │   ├── api_security_test_expired_token_20260122_225701.txt
│   │   ├── api_security_test_invalid_token_20260122_225607.txt
│   │   ├── api_security_test_report_20260122_225242.txt
│   │   └── api_security_test_report_20260122_225415.txt
│   │
│   └── testing/                 # 测试报告
│
├── spring_boot/                  # 后端项目
│   ├── config/                   # 配置文件
│   ├── docs/                     # 后端文档
│   │   ├── architecture/         # 架构文档
│   │   ├── deployment/           # 部署文档
│   │   ├── development/          # 开发文档
│   │   ├── project-management/   # 项目管理
│   │   └── testing/              # 测试文档
│   │
│   ├── scripts/                  # 后端脚本
│   │   ├── launch/               # 启动脚本
│   │   ├── sql/                  # SQL脚本
│   │   └── tools/                # 工具脚本
│   │
│   ├── src/                      # 源代码
│   │   └── main/
│   │       ├── java/             # Java源代码
│   │       └── resources/        # 资源文件
│   │
│   ├── tests/                    # 测试文件
│   │   ├── api/                  # API测试
│   │   ├── integration/          # 集成测试
│   │   └── modules/              # 模块测试
│   │
│   ├── README.md                 # 后端说明
│   ├── mvnw                      # Maven包装器
│   ├── mvnw.cmd                  # Maven包装器(Windows)
│   └── pom.xml                   # Maven配置
│
├── .gitignore                    # Git忽略文件
├── package-lock.json             # 锁定依赖版本
└── package.json                  # 项目依赖配置
```

## 📂 目录分类说明

### 1. 配置文件目录
- **`.github/`**: GitHub相关配置，包括CI/CD工作流
- **`.trae/`**: Trae AI工具的配置和规则
- **`.idea/`**: IDE配置文件（应在.gitignore中）
- **`.vscode/`**: VS Code配置文件

### 2. 文档目录
- **`docs/`**: 项目文档，按类型分类
  - `api/`: API相关文档
  - `project-management/`: 项目管理文档
  - `security/`: 安全相关文档
  - `testing/`: 测试相关文档

### 3. 源代码目录
- **`frontend/`**: 前端项目（Vue 3 + Vite）
- **`spring_boot/`**: 后端项目（Spring Boot）

### 4. 脚本目录
- **`scripts/`**: 各种脚本文件
  - `batch/`: Windows批处理脚本
  - `powershell/`: PowerShell脚本
  - `test-report-generator.cjs`: 测试报告生成器（Node.js脚本）
  - `encoding-utils.cjs`: 编码检查工具（位于frontend/scripts/）

### 5. 报告目录
- **`reports/`**: 各种报告文件
  - `security/`: 安全测试报告
  - `testing/`: 测试报告

### 6. 根目录文件
- **`.gitignore`**: Git忽略规则
- **`package.json`**: Node.js项目配置
- **`package-lock.json`**: 依赖版本锁定

## 🎯 文件分类原则

### 按文件类型分类
1. **配置文件**: 放在相应的配置目录或根目录
2. **文档文件**: 放在`docs/`目录下，按类型子目录分类
3. **脚本文件**: 放在`scripts/`目录下，按脚本类型子目录分类
4. **报告文件**: 放在`reports/`目录下，按报告类型子目录分类
5. **源代码**: 放在`frontend/`或`spring_boot/`目录下

### 按功能模块分类
1. **API相关**: `docs/api/`, `frontend/src/api/`, `spring_boot/src/main/java/com/backend/controller/`
2. **测试相关**: `docs/testing/`, `frontend/tests/`, `spring_boot/tests/`, `reports/testing/`
3. **安全相关**: `docs/security/`, `reports/security/`
4. **部署相关**: `docs/deployment/`, `scripts/`

## 📝 文件命名规范

### 文档文件
- 使用中文命名，便于理解
- 使用`.md`扩展名
- 示例：`API安全检查报告.md`

### 脚本文件
- 使用英文命名，便于跨平台使用
- PowerShell脚本使用`.ps1`扩展名
- 批处理脚本使用`.bat`扩展名
- 示例：`test_api_security.ps1`

### 报告文件
- 使用英文命名，包含时间戳
- 使用`.txt`或`.json`扩展名
- 示例：`api_security_test_report_20260122_225242.txt`

## 🔧 整理后的优势

1. **结构清晰**: 文件分类明确，易于查找
2. **便于维护**: 相关文件集中管理
3. **提高效率**: 减少查找文件的时间
4. **规范统一**: 遵循行业标准的项目结构
5. **易于协作**: 团队成员能快速理解项目结构

## 📌 注意事项

1. **不要随意移动**: 已有文件路径的引用需要同步更新
2. **保持一致性**: 新增文件应遵循相同的分类规则
3. **定期清理**: 及时删除不再需要的文件
4. **文档更新**: 文件移动后应及时更新相关文档
5. **版本控制**: 重要的文件移动应提交到版本控制系统

## 🚀 后续优化建议

1. **创建README**: 为每个主要目录创建README说明文件
2. **统一命名**: 确保同类文件使用统一的命名规范
3. **添加注释**: 为复杂的脚本文件添加详细注释
4. **自动化**: 使用脚本自动维护项目结构
5. **文档化**: 保持项目结构文档的实时更新

## 🔌 路径管理模块设计

### 模块概述

路径管理模块是确保前后端API路径一致性的核心组件，通过统一管理路径常量，避免路径不一致导致的404错误和通信失败。

### 设计目标

1. **统一管理**：所有API路径在单一位置定义和管理
2. **类型安全**：使用常量而非字符串，减少拼写错误
3. **易于维护**：修改路径时只需更新一处
4. **前后端同步**：确保前后端路径定义保持一致
5. **文档化**：提供完整的路径映射文档

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    路径管理模块架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │   前端路径管理    │         │   后端路径管理    │           │
│  │                 │         │                 │           │
│  │ apiConstants.js │         │ApiPathConstants │           │
│  │                 │         │    .java        │           │
│  └────────┬────────┘         └────────┬────────┘           │
│           │                           │                      │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌─────────────────────────────────────────────┐           │
│  │           路径映射与同步机制              │           │
│  │                                             │           │
│  │  前端请求路径  →  Vite代理  →  后端接收路径   │           │
│  │  /devices/list  →  /api/*   →  /api/devices/list│           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │              文档与验证                    │           │
│  │                                             │           │
│  │  api-path-management.md  路径映射文档      │           │
│  │  Swagger文档            API验证工具        │           │
│  │  E2E测试               路径验证测试       │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 前端路径管理

#### 核心文件

**`frontend/src/constants/apiConstants.js`**
- 位置：`frontend/src/constants/apiConstants.js`
- 作用：集中管理所有前端API路径常量
- 特点：
  - 使用空字符串作为API_BASE（由代理自动添加`/api`）
  - 支持函数形式的动态路径（如`DETAIL(id)`）
  - 按业务模块分组组织

#### 使用示例

```javascript
// 导入API常量
import { DEVICE_API, INVENTORY_API, AUTH_API } from '@/constants/apiConstants';

// 在API文件中使用
export function getDeviceList(params) {
  return request({
    url: DEVICE_API.LIST,  // '/devices/list'
    method: 'get',
    params
  });
}

// 动态路径使用
export function getDeviceDetail(id) {
  return request({
    url: DEVICE_API.DETAIL(id),  // '/devices/123'
    method: 'get'
  });
}
```

#### 监控模块特殊处理

性能监控和错误监控模块直接使用fetch，不经过request.js，因此路径配置需要特殊处理：

```javascript
// performanceMonitor.js
const PERFORMANCE_CONFIG = {
  reportUrl: '/performance-report',  // 不包含 /api 前缀
};

// errorMonitor.js
const ERROR_MONITOR_CONFIG = {
  reportUrl: '/error-report',  // 不包含 /api 前缀
};
```

### 后端路径管理

#### 核心文件

**`spring_boot/src/main/java/com/backend/constants/ApiPathConstants.java`**
- 位置：`spring_boot/src/main/java/com/backend/constants/ApiPathConstants.java`
- 作用：集中管理所有后端API路径常量
- 特点：
  - 使用`/api`作为基础路径
  - 按业务模块分组为内部静态类
  - 支持路径参数占位符（如`{id}`）

#### 使用示例

```java
// 导入路径常量
import com.backend.constants.ApiPathConstants;
import com.backend.constants.ApiPathConstants.DeviceApi;

// 在Controller中使用
@RestController
@RequestMapping(DeviceApi.BASE)
public class DeviceController {
    
    @GetMapping(DeviceApi.LIST)
    public ApiResponse<List<Device>> getDeviceList() {
        // 实现
    }
    
    @GetMapping(DeviceApi.DETAIL)
    public ApiResponse<Device> getDeviceDetail(@PathVariable Long id) {
        // 实现
    }
}
```

### 路径映射机制

#### 配置说明

**后端配置** (`application.properties`):
```properties
server.servlet.context-path=/api
server.port=8080
```

**前端配置** (`vite.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

#### 请求流程

```
1. 前端发送请求
   fetch('/devices/list')

2. Vite代理拦截
   匹配 /api 代理规则

3. 代理转发到后端
   http://localhost:8080/devices/list

4. 后端接收请求
   context-path=/api 添加前缀
   实际路径: /api/devices/list

5. Controller匹配
   @RequestMapping("/api/devices")
   成功匹配
```

#### 路径映射对照表

| 后端Controller路径 | 前端请求路径 | 实际HTTP请求路径 | 说明 |
|-------------------|--------------|-----------------|------|
| `/api/auth/login` | `/auth/login` | `http://localhost:8080/api/auth/login` | 登录接口 |
| `/api/devices/list` | `/devices/list` | `http://localhost:8080/api/devices/list` | 设备列表 |
| `/api/inventory/list` | `/inventory/list` | `http://localhost:8080/api/inventory/list` | 库存列表 |
| `/api/performance-report` | `/performance-report` | `http://localhost:8080/api/performance-report` | 性能监控上报 |
| `/api/error-report` | `/error-report` | `http://localhost:8080/api/error-report` | 错误监控上报 |

### 模块化设计

#### 前端模块划分

```javascript
// apiConstants.js 模块结构
export const AUTH_API = { ... };           // 认证模块
export const DEVICE_API = { ... };         // 设备模块
export const INVENTORY_API = { ... };      // 库存模块
export const MAINTENANCE_API = { ... };    // 维护模块
export const REPAIR_API = { ... };         // 维修模块
export const REPORTS_API = { ... };       // 报表模块
export const SYSTEM_API = { ... };         // 系统模块
export const INSTALLATION_API = { ... };   // 安装模块
export const DASHBOARD_API = { ... };      // 仪表盘模块
```

#### 后端模块划分

```java
// ApiPathConstants.java 模块结构
public static final class Auth { ... }                    // 认证模块
public static final class DeviceApi { ... }               // 设备模块
public static final class InventoryApi { ... }            // 库存模块
public static final class MaintenanceApi { ... }          // 维护模块
public static final class InstallationApi { ... }          // 安装模块
public static final class SystemApi { ... }              // 系统模块
public static final class DeviceStatusApi { ... }        // 设备状态模块
public static final class MonitorApi { ... }             // 监控模块
```

### 验证与测试

#### 开发阶段验证

1. **Swagger文档验证**
   - 访问：`http://localhost:8080/api/swagger-ui.html`
   - 检查所有API路径是否正确注册

2. **前端代理验证**
   - 检查Vite代理配置是否正确
   - 验证请求是否正确转发到后端

#### 测试阶段验证

1. **E2E测试**
   - 执行完整的端到端测试
   - 验证所有API路径调用成功

2. **单元测试**
   - 测试API常量的正确性
   - 验证路径拼接逻辑

#### 部署前验证

1. **日志检查**
   - 检查后端访问日志
   - 确认无404错误

2. **监控验证**
   - 检查性能监控数据上报
   - 验证错误监控数据上报

### 维护与更新

#### 新增API路径

1. 后端添加常量到`ApiPathConstants.java`
2. 前端添加常量到`apiConstants.js`
3. 更新`docs/api-path-management.md`文档
4. 执行测试验证路径正确性

#### 修改API路径

1. 评估影响范围和向后兼容性
2. 更新前后端常量文件
3. 更新相关文档和测试用例
4. 通知团队成员变更内容

#### 删除API路径

1. 标记为@deprecated，保留一个版本周期
2. 更新文档说明废弃时间和替代方案
3. 逐步迁移到新路径
4. 确认无使用后删除

### 最佳实践

1. **始终使用常量**：避免硬编码路径字符串
2. **保持同步**：前后端路径常量必须保持一致
3. **及时更新文档**：路径变更后立即更新文档
4. **充分测试**：路径变更后执行完整测试
5. **版本控制**：使用Git追踪路径变更历史
6. **代码审查**：路径变更必须经过代码审查
7. **监控告警**：监控API调用成功率，及时发现路径问题

### 常见问题解决

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 404 Not Found | 路径重复`/api/api/xxx` | 前端路径移除`/api`前缀 |
| CORS错误 | 代理配置不正确 | 检查vite.config.js代理设置 |
| 路径不一致 | 前后端常量不同步 | 统一更新前后端常量文件 |
| 监控数据上报失败 | 监控模块路径配置错误 | 使用相对路径，不包含`/api` |
| Swagger文档404 | context-path配置问题 | 检查application.properties配置 |

---

## 📋 文件整理记录

### 2026-02-09 文件结构整理

#### 整理内容
1. **删除冗余文件**: 29个历史遗留的临时脚本文件
   - 25个 `fix-encoding*.cjs` 文件
   - 4个 `check-encoding*.cjs` 文件

2. **合并脚本**: 4个check-encoding脚本合并为1个
   - 新文件: `frontend/scripts/encoding-utils.cjs`
   - 功能: 文件编码检查、显示指定行、批量检查

3. **迁移文件**: 6个文件移至规范位置
   - `test-report-generator.cjs` → `scripts/`
   - `DEPENDENCIES.md` → `docs/`
   - `PROJECT_STRUCTURE.md` → `docs/`
   - `FAVICON_GUIDE.md` → `frontend/docs/`
   - `performance-report.json` → `frontend/reports/`
   - `e2e-test-summary.md` → `frontend/reports/e2e/`

#### 整理成果
- 符合规范率: 从85%提升至98%
- 根目录清理: 无.cjs和.md文件
- fix-encoding目录: 从31个文件减少到3个

#### 相关文档
- [文件结构检查报告](project-management/文件结构检查报告.md)
- [文件整理完成报告](project-management/文件整理完成报告.md)

---

**文档版本**: 1.2  
**创建时间**: 2026-01-26  
**最后更新**: 2026-02-09  
**维护人**: 项目团队
