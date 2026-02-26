# Scripts 目录

本目录包含项目的各种脚本文件，用于简化开发、测试和部署流程。

---

## 📁 目录结构

```
scripts/
├── README.md                          # 本文档
├── deploy/                            # 部署脚本
│   ├── windows/                       # Windows部署脚本
│   │   ├── 一键部署.bat              # Docker一键部署（推荐）
│   │   └── 本地部署-方案B.bat        # 本地环境部署
│   ├── linux/                         # Linux部署脚本
│   │   ├── cloud-deploy.sh           # 云服务器一键部署
│   │   └── deploy.sh                 # 生产环境部署
│   ├── deploy-staging.ps1            # 预生产环境部署
│   └── load-test.js                  # 压力测试脚本
├── batch/                             # Windows批处理脚本
│   ├── run.bat                       # 运行项目
│   └── setup_mysql.bat               # 设置MySQL数据库
└── powershell/                        # PowerShell脚本
    ├── run-tests-utf8.ps1            # 运行前端测试（UTF-8编码）
    ├── test_api_security.ps1         # API安全测试
    ├── test_api_security_expired_token.ps1  # Token过期测试
    ├── test_api_security_invalid_token.ps1  # 无效Token测试
    └── test_enhanced_security.ps1    # 增强安全测试
```

---

## 🚀 快速开始

### 部署相关

#### 方案A: Docker一键部署（推荐新手）

```bash
# Windows: 双击运行
scripts\deploy\windows\一键部署.bat

# 或命令行
cd scripts\deploy\windows
.\一键部署.bat
```

**前置条件**: 已安装 Docker Desktop

#### 方案B: 本地环境部署

```bash
# Windows: 双击运行
scripts\deploy\windows\本地部署-方案B.bat

# 或命令行
cd scripts\deploy\windows
.\本地部署-方案B.bat
```

**前置条件**: 已安装 JDK 17、MySQL 8.0、Node.js 18

#### 方案C: 云服务器部署

```bash
# 1. 上传代码到服务器
scp -r spring_boot frontend root@your-server-ip:/opt/wms/

# 2. SSH登录后运行
ssh root@your-server-ip
cd /opt/wms
sudo bash scripts/deploy/linux/cloud-deploy.sh
```

**前置条件**: Linux服务器（Ubuntu/CentOS）、root权限

#### 其他部署命令

| 任务 | 命令 | 说明 |
|------|------|------|
| 预生产部署 | `.\scripts\deploy\deploy-staging.ps1 -Action up` | 启动预生产环境 |
| 压力测试 | `k6 run scripts/deploy/load-test.js` | 执行压力测试 |

### 开发相关

| 任务 | 命令 | 说明 |
|------|------|------|
| 运行项目 | `scripts\batch\run.bat` | 启动前后端服务 |
| 运行测试 | `.\scripts\powershell\run-tests-utf8.ps1` | 使用UTF-8编码运行测试 |

---

## 🔧 详细说明

### 部署脚本 (deploy/)

#### Windows部署脚本 (deploy/windows/)

##### 一键部署.bat
Docker一键部署脚本，适合快速搭建测试环境：

**功能**:
- 自动构建前端项目
- 启动MySQL、后端、前端三个Docker容器
- 自动配置网络和数据库

**使用方法**:
```bash
# 双击运行
scripts\deploy\windows\一键部署.bat
```

**访问地址**:
- 前端: http://localhost
- 后端API: http://localhost:8080/api

**常用命令**:
```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

##### 本地部署-方案B.bat
使用本地环境部署，适合开发调试：

**功能**:
- 检查MySQL是否运行
- 自动创建数据库和用户
- 构建前端项目
- 生成后端启动脚本

**使用方法**:
```bash
# 1. 双击运行部署脚本
scripts\deploy\windows\本地部署-方案B.bat

# 2. 按提示运行生成的启动脚本
.\启动后端.bat

# 3. 在另一个终端启动前端
cd frontend && npm run dev
```

**访问地址**:
- 前端: http://localhost:5173
- 后端API: http://localhost:8080/api

---

#### Linux部署脚本 (deploy/linux/)

##### cloud-deploy.sh
云服务器一键部署脚本，支持阿里云/腾讯云/华为云：

**功能**:
- 自动检测操作系统（Ubuntu/CentOS）
- 安装JDK、MySQL、Nginx、Node.js等依赖
- 自动配置数据库
- 构建前后端项目
- 配置Nginx反向代理
- 创建systemd服务，支持开机自启

**使用方法**:
```bash
# 1. 上传代码到服务器
scp -r spring_boot frontend root@your-server-ip:/opt/wms/

# 2. SSH登录服务器
ssh root@your-server-ip
cd /opt/wms

# 3. 运行部署脚本
sudo bash scripts/deploy/linux/cloud-deploy.sh
```

**访问地址**:
- 前端: http://your-server-ip
- 后端API: http://your-server-ip/api

**常用命令**:
```bash
# 查看服务日志
sudo journalctl -u wms -f

# 重启服务
sudo systemctl restart wms

# 停止服务
sudo systemctl stop wms

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
```

##### deploy.sh
生产环境手动部署脚本，提供更多自定义选项：

**功能**:
- 支持自定义配置（域名、密码等）
- 详细的部署步骤和验证
- 完整的错误处理和日志记录

**使用方法**:
```bash
# 编辑脚本中的配置变量
vim scripts/deploy/linux/deploy.sh

# 运行部署
sudo bash scripts/deploy/linux/deploy.sh
```

**配置变量**:
```bash
APP_DIR="/opt/wms"                    # 应用目录
DB_PASSWORD="YourSecurePassword"      # 数据库密码
JWT_SECRET="YourJWTSecret"            # JWT密钥
DOMAIN="your-domain.com"              # 域名
```

---

#### deploy-staging.ps1

预生产环境部署脚本，支持以下操作：

```powershell
# 启动服务
.\scripts\deploy\deploy-staging.ps1 -Action up

# 构建并启动
.\scripts\deploy\deploy-staging.ps1 -Action up -Build

# 停止服务
.\scripts\deploy\deploy-staging.ps1 -Action down

# 重启服务
.\scripts\deploy\deploy-staging.ps1 -Action restart

# 查看日志
.\scripts\deploy\deploy-staging.ps1 -Action logs

# 查看状态
.\scripts\deploy\deploy-staging.ps1 -Action status
```

**环境变量要求**:
- `DB_PASSWORD` - 数据库密码
- `JWT_SECRET` - JWT密钥
- `MYSQL_ROOT_PASSWORD` - MySQL root密码

#### load-test.js

k6压力测试脚本，模拟真实用户负载：

```bash
# 本地测试
k6 run scripts/deploy/load-test.js

# 指定目标环境
k6 run -e BASE_URL=http://staging-server:8080/api scripts/deploy/load-test.js
```

**测试场景**:
- 设备管理API
- 库存管理API
- 用户管理API
- 报表API

**性能指标**:
- 95%请求响应时间 < 500ms
- 错误率 < 1%
- 最大并发用户: 200

---

### 批处理脚本 (batch/)

#### run.bat

一键运行项目的批处理脚本：
- 启动前端开发服务器
- 启动后端Spring Boot服务
- 自动检查端口占用

#### setup_mysql.bat

MySQL数据库初始化脚本：
- 创建数据库
- 创建用户
- 导入初始数据

---

### PowerShell脚本 (powershell/)

#### run-tests-utf8.ps1

解决Windows PowerShell UTF-8编码问题的测试运行脚本：

```powershell
.\scripts\powershell\run-tests-utf8.ps1
```

#### 安全测试脚本

| 脚本 | 用途 |
|------|------|
| `test_api_security.ps1` | API基础安全测试 |
| `test_api_security_expired_token.ps1` | Token过期场景测试 |
| `test_api_security_invalid_token.ps1` | 无效Token场景测试 |
| `test_enhanced_security.ps1` | 增强安全测试套件 |

---

## 📝 脚本开发规范

### 命名规范

- **PowerShell脚本**: 使用PascalCase，如 `Deploy-Staging.ps1`
- **批处理脚本**: 使用小写，如 `run.bat`
- **JavaScript脚本**: 使用kebab-case，如 `load-test.js`

### 文件头规范

所有脚本必须包含文件头注释：

```powershell
# ===========================================
# 脚本名称
# ===========================================
# 描述: 脚本功能说明
# 作者: 作者名称
# 日期: 创建日期
# ===========================================
```

### 错误处理

PowerShell脚本必须包含错误处理：

```powershell
$ErrorActionPreference = "Stop"

try {
    # 脚本逻辑
} catch {
    Write-Error "错误: $_"
    exit 1
}
```

---

## 🔒 安全注意事项

1. **环境变量**: 不要在脚本中硬编码敏感信息
2. **权限控制**: 确保脚本执行权限正确
3. **日志记录**: 重要操作需要记录日志
4. **输入验证**: 验证所有用户输入

---

## 📞 支持

如有问题，请联系：
- **技术支持**: tech.support@company.com
- **运维团队**: ops@company.com

---

**最后更新**: 2026-02-25
