# Scripts 目录

本目录包含项目的各种脚本文件，用于简化开发、测试和部署流程。

## 📋 目录

- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [批处理脚本](#批处理脚本-batch)
- [PowerShell脚本](#powershell脚本-powershell)
- [使用说明](#使用说明)
- [注意事项](#注意事项)
- [脚本开发规范](#脚本开发规范)
- [维护指南](#维护指南)
- [常见问题](#常见问题)
- [相关文档](#相关文档)

## 📁 目录结构

```
scripts/
├── batch/                    # Windows批处理脚本
│   ├── run.bat              # 运行项目
│   ├── setup_mysql.bat      # 设置MySQL数据库
│   ├── watch-logs.bat      # 监控日志
│   └── verify-isolation.bat # 验证前后端隔离性
├── powershell/             # PowerShell脚本
│   └── run-tests-utf8.ps1 # 运行前端测试（UTF-8编码）
└── README.md              # 本文档
```

## 🚀 快速开始

### 常用命令

| 任务 | 命令 | 说明 |
|------|------|------|
| 运行前端测试 | `.\scripts\powershell\run-tests-utf8.ps1` | 使用UTF-8编码运行测试 |
| 验证前后端隔离性 | `scripts\batch\verify-isolation.bat` | 检查端口和配置 |
| 运行项目 | `scripts\batch\run.bat` | 启动前后端服务 |
| 监控日志 | `scripts\batch\watch-logs.bat` | 实时查看日志 |

## 🔧 批处理脚本 (batch/)

### run.bat

运行项目的批处理脚本。

**功能**:
- 启动前端开发服务器
- 启动后端Spring Boot服务
- 自动检测依赖和环境

**用法**:
```bash
scripts\batch\run.bat
```

**参数**:
- 无参数，直接运行

**示例**:
```bash
# 从项目根目录运行
scripts\batch\run.bat
```

---

### setup_mysql.bat

设置MySQL数据库的批处理脚本。

**功能**:
- 检查MySQL服务状态
- 创建数据库和用户
- 执行初始化SQL脚本
- 配置数据库连接

**用法**:
```bash
scripts\batch\setup_mysql.bat
```

**前提条件**:
- MySQL 8.0 或更高版本已安装
- 具有创建数据库和用户的权限

**示例**:
```bash
# 设置开发环境数据库
scripts\batch\setup_mysql.bat
```

---

### watch-logs.bat

监控项目日志的批处理脚本。

**功能**:
- 实时监控前端日志
- 实时监控后端日志
- 支持多窗口同时监控
- 自动滚动显示最新日志

**用法**:
```bash
scripts\batch\watch-logs.bat
```

**日志文件位置**:
- 前端日志: `frontend/logs/`
- 后端日志: `spring_boot/logs/`

**示例**:
```bash
# 监控所有日志
scripts\batch\watch-logs.bat
```

---

### verify-isolation.bat

验证前后端并行运行时的隔离性。

**功能**:
- ✅ 检查端口占用情况（前端3000，后端8080）
- ✅ 检查环境变量配置
- ✅ 检查API配置
- ✅ 检查测试隔离配置
- ✅ 生成详细的验证报告

**用法**:
```bash
scripts\batch\verify-isolation.bat
```

**输出示例**:
```
========================================
前后端并行运行隔离性验证
========================================

[1/4] 检查端口占用情况...

检查端口 3000 (前端开发服务器)...
[通过] 端口 3000 可用

检查端口 8080 (后端服务器)...
[通过] 端口 8080 可用

[2/4] 检查环境变量配置...

前端测试环境变量:
[通过] .env.test 文件存在
VITE_ENCRYPTION_SECRET_KEY=test-secret-key-for-testing

后端配置文件:
[通过] application.properties 文件存在
server.port=8080

[3/4] 检查API配置...

前端API配置:
[通过] api.js 文件存在
  API_BASE_URL,

测试环境API配置:
[通过] vitest.config.js 文件存在
      VITE_API_BASE_URL: 'http://localhost:8080/api',

[4/4] 检查测试隔离配置...

前端测试环境配置:
[通过] setup.js 文件存在

========================================
验证完成
========================================

总结:
- 前端开发服务器端口: 3000
- 后端服务器端口: 8080
- 前端测试环境使用Mock API，不依赖后端
- 前后端使用不同的端口，不会产生冲突
- 前端测试环境已配置环境隔离

结论: 前后端可以安全地并行运行，不会产生干扰或冲突
```

**使用场景**:
- 部署前环境检查
- 排查端口冲突问题
- 验证测试环境配置
- CI/CD流水线中的环境验证

---

## 💻 PowerShell脚本 (powershell/)

### run-tests-utf8.ps1

运行前端测试的PowerShell脚本，使用UTF-8编码避免中文乱码。

**功能**:
- 🔧 设置UTF-8编码（解决中文乱码问题）
- ⚙️ 配置Node.js内存限制（4GB）
- 🧪 运行完整的前端测试套件
- 📊 生成详细的测试报告
- 🎯 自动切换到前端目录

**用法**:
```powershell
.\scripts\powershell\run-tests-utf8.ps1
```

**特性**:
- ✅ 自动切换到前端目录
- ✅ 使用UTF-8编码输出
- ✅ 设置Node.js最大内存为4GB
- ✅ 详细的测试报告
- ✅ 彩色输出，易于阅读

**环境变量**:
- `NODE_OPTIONS`: `--max-old-space-size=4096`
- `OutputEncoding`: UTF-8

**示例**:
```powershell
# 从项目根目录运行
.\scripts\powershell\run-tests-utf8.ps1

# 或者从任何位置运行（使用完整路径）
d:\Warehouse management-011\scripts\powershell\run-tests-utf8.ps1
```

**输出示例**:
```
========================================
  Frontend Test Runner (UTF-8)
========================================

Running tests with UTF-8 encoding...

✓ tests/unit/utils/cache.test.js (20)
✓ tests/unit/utils/constants.test.js (3)
✓ tests/unit/api/inventory.test.js (15)
✓ tests/unit/stores/inventory.test.js (8)
...

========================================
  Tests completed
========================================
```

---

## 📖 使用说明

### 开发环境

#### 1. 启动开发服务器
```bash
# 启动前后端服务
scripts\batch\run.bat
```

#### 2. 运行测试
```powershell
# 运行前端测试
.\scripts\powershell\run-tests-utf8.ps1
```

#### 3. 监控日志
```bash
# 实时查看日志
scripts\batch\watch-logs.bat
```

### 测试环境

#### 1. 验证环境配置
```bash
# 检查前后端隔离性
scripts\batch\verify-isolation.bat
```

#### 2. 运行测试套件
```powershell
# 运行所有测试
.\scripts\powershell\run-tests-utf8.ps1
```

### 生产环境

#### 1. 部署前检查
```bash
# 验证配置
scripts\batch\verify-isolation.bat
```

#### 2. 数据库设置
```bash
# 配置生产数据库
scripts\batch\setup_mysql.bat
```

---

## ⚠️ 注意事项

### 1. 路径问题
- ✅ 所有脚本都使用相对路径，可以从项目根目录运行
- ✅ 脚本会自动切换到正确的工作目录
- ⚠️ 不建议从其他位置运行（除非使用完整路径）

### 2. 权限要求
- ✅ 大部分脚本不需要管理员权限
- ⚠️ 端口检查脚本可能需要管理员权限
- ⚠️ 数据库设置脚本需要数据库管理员权限

### 3. 编码问题
- ✅ PowerShell脚本已配置UTF-8编码，避免中文乱码
- ✅ 批处理脚本使用系统默认编码
- ⚠️ 如遇到中文乱码，请使用PowerShell脚本

### 4. 依赖环境
确保已安装以下工具：
- ✅ Node.js (v18 或更高版本)
- ✅ Java (JDK 17)
- ✅ Maven (3.8 或更高版本)
- ✅ MySQL (8.0 或更高版本)
- ✅ Git (用于版本控制)

### 5. 网络配置
- ✅ 确保端口3000和8080未被占用
- ✅ 确保数据库连接配置正确
- ⚠️ 防火墙可能需要开放相应端口

---

## 📝 脚本开发规范

### 命名规范

#### 批处理脚本
- 使用小写字母和下划线
- 示例: `run_tests.bat`, `setup_mysql.bat`
- 文件扩展名: `.bat`

#### PowerShell脚本
- 使用小写字母和连字符
- 示例: `run-tests.ps1`, `deploy-app.ps1`
- 文件扩展名: `.ps1`

### 路径处理

#### 批处理脚本
```batch
REM 获取脚本所在目录
set SCRIPT_DIR=%~dp0

REM 获取项目根目录（脚本目录的上级目录）
set PROJECT_ROOT=%~dp0..\..

REM 切换到项目根目录
cd /d "%PROJECT_ROOT%"
```

#### PowerShell脚本
```powershell
# 获取脚本所在目录
$scriptDir = $PSScriptRoot

# 获取项目根目录
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# 切换到项目根目录
Set-Location $projectRoot
```

### 错误处理

#### 批处理脚本
```batch
@echo off
setlocal enabledelayedexpansion

REM 检查命令执行结果
if %errorlevel% neq 0 (
    echo [错误] 操作失败，错误码: %errorlevel%
    exit /b %errorlevel%
)

REM 检查文件是否存在
if not exist "file.txt" (
    echo [错误] 文件不存在: file.txt
    exit /b 1
)
```

#### PowerShell脚本
```powershell
# 检查命令执行结果
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 操作失败，错误码: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# 检查文件是否存在
if (-not (Test-Path "file.txt")) {
    Write-Host "[错误] 文件不存在: file.txt" -ForegroundColor Red
    exit 1
}

# 使用try-catch处理异常
try {
    # 可能出错的代码
    Invoke-Expression "npm install"
} catch {
    Write-Host "[错误] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
```

### 文档注释

#### 批处理脚本头部
```batch
@echo off
REM ========================================
REM 脚本名称和功能说明
REM ========================================
REM 作者: 作者名
REM 创建日期: YYYY-MM-DD
REM 最后修改: YYYY-MM-DD
REM ========================================

REM 功能描述
REM - 功能1
REM - 功能2
REM - 功能3
```

#### PowerShell脚本头部
```powershell
<#
.SYNOPSIS
    脚本功能简短描述

.DESCRIPTION
    脚本功能的详细描述
    可以包含多行说明

.PARAMETER ParameterName
    参数说明

.EXAMPLE
    .\script-name.ps1 -ParameterName value

.NOTES
    作者: 作者名
    创建日期: YYYY-MM-DD
    最后修改: YYYY-MM-DD
#>
```

### 代码风格

#### 批处理脚本
- 使用大写字母表示命令
- 使用小写字母表示变量
- 使用REM添加注释
- 每个逻辑块之间添加空行

#### PowerShell脚本
- 使用PascalCase表示变量
- 使用Verb-Noun命名函数
- 使用#添加单行注释
- 使用<# #>添加多行注释

---

## 🔧 维护指南

### 添加新脚本

#### 步骤
1. **选择目录**
   - 批处理脚本 → `scripts/batch/`
   - PowerShell脚本 → `scripts/powershell/`

2. **创建文件**
   - 遵循命名规范
   - 添加头部注释
   - 实现功能逻辑

3. **测试脚本**
   - 在本地环境测试
   - 验证错误处理
   - 检查输出格式

4. **更新文档**
   - 更新本README文件
   - 添加使用示例
   - 说明注意事项

5. **提交代码**
   - 使用清晰的提交信息
   - 说明修改原因
   - 引用相关Issue

#### 示例
```powershell
# 1. 创建新脚本
New-Item -Path "scripts/powershell/new-script.ps1"

# 2. 添加内容
<#
.SYNOPSIS
    新脚本功能描述

.DESCRIPTION
    详细功能说明
#>

# 实现功能逻辑
Write-Host "Hello, World!"

# 3. 更新README
# 在README中添加新脚本的说明
```

### 修改现有脚本

#### 步骤
1. **分析影响**
   - 确定修改范围
   - 评估影响范围
   - 制定修改计划

2. **实施修改**
   - 备份原文件
   - 进行修改
   - 添加注释说明

3. **测试验证**
   - 测试修改后的功能
   - 验证向后兼容性
   - 检查错误处理

4. **更新文档**
   - 更新脚本注释
   - 更新README文档
   - 记录修改历史

5. **提交代码**
   - 使用详细的提交信息
   - 说明修改原因
   - 关联相关Issue

#### 示例
```powershell
# 1. 备份原文件
Copy-Item "scripts/powershell/run-tests-utf8.ps1" "scripts/powershell/run-tests-utf8.ps1.bak"

# 2. 进行修改
# ... 修改代码 ...

# 3. 测试
.\scripts\powershell\run-tests-utf8.ps1

# 4. 提交
git add scripts/powershell/run-tests-utf8.ps1
git commit -m "fix: 修复测试脚本在Windows 11上的兼容性问题"
```

---

## ❓ 常见问题

### Q1: 运行脚本时提示"权限被拒绝"
**A**: 以管理员身份运行命令提示符或PowerShell

### Q2: PowerShell脚本执行被阻止
**A**: 运行以下命令解除限制
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q3: 中文输出乱码
**A**: 使用PowerShell脚本（已配置UTF-8编码）而不是批处理脚本

### Q4: 端口被占用
**A**: 
1. 运行 `scripts\batch\verify-isolation.bat` 检查端口
2. 使用以下命令查找占用端口的进程
```bash
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8080"
```
3. 终止占用端口的进程或修改配置文件中的端口

### Q5: 脚本找不到文件
**A**: 确保从项目根目录运行脚本
```bash
# 正确
cd "d:\Warehouse management-011"
scripts\batch\run.bat

# 错误
cd "d:\Warehouse management-011\scripts"
batch\run.bat
```

### Q6: 测试失败
**A**: 
1. 检查依赖是否安装完整
2. 运行 `npm install` 安装依赖
3. 检查测试配置文件
4. 查看错误日志获取详细信息

---

## 📚 相关文档

- [项目规则文档](../.trae/rules/project_rules.md) - 项目整体规则和规范
- [CI/CD文档](../docs/CI_CD.md) - 持续集成和部署指南
- [安装指南](../docs/INSTALLATION.md) - 项目安装和配置说明
- [快速开始](../docs/QUICK_START.md) - 快速上手指南
- [故障排除](../docs/TROUBLESHOOTING.md) - 常见问题解决方案

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- **GitHub Issues**: [提交问题](https://github.com/your-repo/issues)
- **技术支持**: tech.support@company.com
- **项目负责人**: zhang.manager@company.com

---

**文档版本**: 2.0
**最后更新**: 2026-01-21
**维护者**: 开发团队
