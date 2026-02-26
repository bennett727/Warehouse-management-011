# 仓库管理系统 - 项目结构

本文档描述仓库管理系统（WMS）的项目结构和文件组织。

---

## 📁 目录结构概览

```
warehouse-management/
├── .github/                    # GitHub配置
│   └── workflows/              # CI/CD工作流
├── .trae/                      # Trae IDE配置
│   └── rules/                  # 项目规则
├── docker/                     # Docker部署配置
├── docs/                       # 项目文档
│   ├── api/                    # API文档
│   ├── architecture/           # 架构文档
│   ├── deployment/             # 部署文档
│   ├── features/               # 功能文档
│   ├── testing/                # 测试文档
│   └── user-guide/             # 用户手册
├── frontend/                   # 前端项目（Vue 3 + Vite）
├── scripts/                    # 项目脚本
│   ├── deploy/                 # 部署脚本
│   │   ├── linux/              # Linux部署脚本
│   │   └── windows/            # Windows部署脚本
│   └── powershell/             # PowerShell脚本
├── spring_boot/                # 后端项目（Spring Boot）
└── README.md                   # 项目主文档
```

---

## 📂 详细目录说明

### 1. Docker配置 (`docker/`)

| 文件/目录 | 说明 |
|-----------|------|
| `docker-compose.yml` | Docker Compose主配置（生产环境） |
| `docker-compose.staging.yml` | 预生产环境配置 |
| `nginx.conf` | Nginx反向代理配置 |
| `README.md` | Docker部署说明文档 |

**用途**: 容器化部署配置，支持一键启动所有服务。

---

### 2. 项目文档 (`docs/`)

#### API文档 (`docs/api/`)
- `API_DOCUMENTATION.md` - API接口文档

#### 架构文档 (`docs/architecture/`)
- `entity-relationship-diagram.md` - 实体关系图
- `inventory-management-design-spec.md` - 库存管理设计规范
- `后端架构设计方案.md` - 后端架构设计

#### 部署文档 (`docs/deployment/`)
- `部署方案选择指南.md` - 三种部署方案对比
- `production-deployment-guide.md` - 生产环境部署指南
- `database-backup-guide.md` - 数据库备份指南
- `monitoring-setup.md` - 监控设置指南
- `生产环境部署检查清单.md` - 部署检查清单
- `生产环境部署验证流程.md` - 部署验证流程
- `生产环境配置说明.md` - 配置说明
- `环境迁移策略.md` - 环境迁移策略

#### 功能文档 (`docs/features/`)
- `excel-export-api.md` - Excel导出API文档

#### 测试文档 (`docs/testing/`)
- `api-test-cases.md` - API测试用例

#### 用户手册 (`docs/user-guide/`)
- `入库流程操作手册.md` - 入库流程操作指南

---

### 3. 前端项目 (`frontend/`)

```
frontend/
├── config/                     # 配置文件
│   ├── env/                    # 环境变量
│   ├── cypress.config.js       # Cypress测试配置
│   ├── vite.config.js          # Vite配置
│   └── ...
├── public/                     # 静态资源
├── scripts/                    # 项目脚本
├── src/                        # 源代码
│   ├── api/                    # API接口
│   ├── assets/                 # 资源文件
│   ├── components/             # 组件
│   ├── composables/            # 组合式函数
│   ├── config/                 # 应用配置
│   ├── constants/              # 常量定义
│   ├── router/                 # 路由配置
│   ├── services/               # 服务
│   ├── stores/                 # Pinia状态管理
│   └── utils/                  # 工具函数
└── tests/                      # 测试文件
    ├── cypress/                # E2E测试
    └── unit/                   # 单元测试
```

**技术栈**: Vue 3 + Vite + Element Plus + Pinia + Vue Router

---

### 4. 部署脚本 (`scripts/`)

#### Linux部署脚本 (`scripts/deploy/linux/`)
| 文件 | 说明 |
|------|------|
| `cloud-deploy.sh` | 云服务器一键部署脚本（推荐） |
| `deploy.sh` | 生产环境手动部署脚本 |

#### Windows部署脚本 (`scripts/deploy/windows/`)
| 文件 | 说明 |
|------|------|
| `一键部署.bat` | Docker一键部署（最简单） |
| `本地部署-方案B.bat` | 本地环境部署 |

#### PowerShell脚本 (`scripts/powershell/`)
| 文件 | 说明 |
|------|------|
| `run-tests-utf8.ps1` | 运行测试（UTF-8编码） |

---

### 5. 后端项目 (`spring_boot/`)

```
spring_boot/
├── config/                     # 配置文件
│   ├── checkstyle-security.xml
│   ├── spotbugs-exclude.xml
│   └── ...
├── docs/                       # 项目文档
│   └── monitoring/             # 监控配置
├── scripts/                    # 项目脚本
│   ├── database-backup.sh      # 数据库备份脚本
│   └── launch/                 # 启动脚本
├── src/                        # 源代码
│   ├── main/
│   │   ├── java/
│   │   │   └── com/backend/
│   │   │       ├── aspect/     # AOP切面
│   │   │       ├── common/     # 公共类
│   │   │       ├── config/     # 配置类
│   │   │       ├── constants/  # 常量
│   │   │       ├── controller/ # 控制器
│   │   │       ├── dto/        # 数据传输对象
│   │   │       ├── entity/     # 实体类
│   │   │       ├── enums/      # 枚举
│   │   │       ├── exception/  # 异常处理
│   │   │       ├── repository/ # 数据访问层
│   │   │       └── ...
│   │   └── resources/          # 资源文件
│   └── test/                   # 测试代码
├── Dockerfile                  # Docker构建文件
├── pom.xml                     # Maven配置
└── README.md                   # 项目说明
```

**技术栈**: Spring Boot 3.5.5 + Java 17 + Spring Security + JPA + MySQL

---

## 🚀 快速开始

### 方案A: Docker部署（推荐新手）

```bash
# Windows
scripts\deploy\windows\一键部署.bat

# 或手动
cd docker
docker-compose up --build -d
```

### 方案B: 本地开发

```bash
# 启动后端
cd spring_boot
mvn spring-boot:run

# 启动前端
cd frontend
npm run dev
```

### 方案C: 云服务器部署

```bash
# 上传代码后执行
sudo bash scripts/deploy/linux/cloud-deploy.sh
```

---

## 📝 开发规范

### 代码规范
- **前端**: ESLint + Prettier
- **后端**: Checkstyle + SpotBugs

### 提交规范
```
类型(模块): 描述

类型: feat, fix, docs, style, refactor, test, chore
```

### 分支管理
- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

---

## 🔧 常用命令

### 前端
```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run test         # 运行测试
npm run lint         # 代码检查
```

### 后端
```bash
mvn spring-boot:run  # 启动应用
mvn test             # 运行测试
mvn package          # 打包
```

### Docker
```bash
docker-compose up -d     # 启动服务
docker-compose down      # 停止服务
docker-compose logs -f   # 查看日志
```

---

## 📚 相关文档

- [部署方案选择指南](docs/deployment/部署方案选择指南.md)
- [生产环境部署指南](docs/deployment/production-deployment-guide.md)
- [API文档](docs/api/API_DOCUMENTATION.md)
- [用户手册](docs/user-guide/入库流程操作手册.md)

---

## 🔒 安全说明

1. **生产环境必做**
   - 修改默认密码
   - 配置JWT密钥
   - 启用HTTPS
   - 配置防火墙

2. **敏感信息**
   - 数据库密码使用环境变量
   - JWT密钥定期更换
   - 不在代码中硬编码密钥

---

**最后更新**: 2026-02-25
