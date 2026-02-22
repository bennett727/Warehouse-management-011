# 仓库管理系统文档目录

本文档目录包含仓库管理系统(WMS)的所有技术文档和操作指南。

## 目录结构

```
docs/
├── README.md                           # 本文档 - 文档目录说明
├── api/                                # API接口文档
│   ├── API_PATH_STANDARDIZATION.md     # API路径标准化规范
│   └── 批量操作API文档.md               # 批量操作API接口说明
├── architecture/                       # 架构设计文档
│   └── entity-relationship-diagram.md  # 实体关系图(ERD)
├── deployment/                         # 部署配置文档
│   ├── 测试环境配置规范.md              # 测试环境配置规范
│   ├── 环境迁移策略.md                  # 环境迁移策略
│   ├── 生产环境部署验证流程.md          # 生产环境部署验证流程
│   └── 生产环境配置说明.md              # 生产环境配置说明
├── devops/                             # 运维开发文档
│   ├── CI_CD_GUIDE.md                  # CI/CD流程指南
│   ├── DATABASE_MIGRATION_GUIDE.md     # 数据库迁移指南
│   ├── SPRING_SECURITY_ROLE_NAMING.md  # Spring Security角色命名规范
│   └── LOGGING_GUIDE.md                # 日志配置指南
├── operation-flow/                     # 业务流程文档
│   └── 仓库管理系统操作流程文档.md       # 系统操作流程说明
└── testing/                            # 测试相关文档
    ├── data-cy-naming-conventions.md   # E2E测试data-cy命名规范
    ├── 测试环境搭建指南.md              # 测试环境搭建指南
    └── 端到端测试流程及注意事项.md       # E2E测试流程说明
```

## 文档分类说明

### 1. API接口文档 (`api/`)
包含系统所有API接口的定义、规范和调用说明。

### 2. 架构设计文档 (`architecture/`)
包含系统架构设计、数据模型设计等技术架构文档。

### 3. 部署配置文档 (`deployment/`)
包含各环境的部署配置、环境搭建和迁移指南。

### 4. 运维开发文档 (`devops/`)
包含CI/CD流程、数据库迁移、安全规范、日志配置等运维相关文档。

**重点文档**：
- [LOGGING_GUIDE.md](./devops/LOGGING_GUIDE.md) - 日志配置指南，包含多环境配置、告警机制、ELK集成

### 5. 业务流程文档 (`operation-flow/`)
包含系统业务操作流程和用户操作手册。

### 6. 测试相关文档 (`testing/`)
包含测试规范、测试环境搭建和测试流程文档。

## 文档维护规范

1. **版本管理**：所有文档必须包含版本号、更新日期和责任人信息
2. **命名规范**：使用有意义的文件名，反映文档内容
3. **分类存放**：按文档类型存放在对应目录下
4. **定期更新**：文档应与代码保持同步更新
5. **审查机制**：重要文档变更需经过审查
6. **清理过期**：定期清理过期版本文档，保留最新版本

## 快速导航

- **开发人员**：查看 `api/` 和 `architecture/` 目录
- **运维人员**：查看 `deployment/` 和 `devops/` 目录
- **测试人员**：查看 `testing/` 目录
- **业务人员**：查看 `operation-flow/` 目录

## 项目结构文档

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 项目整体结构说明
- [DEPENDENCIES.md](./DEPENDENCIES.md) - 项目依赖说明

## 项目管理文档

### 文件结构管理
- [文件结构检查报告](./project-management/文件结构检查报告.md) - 文件结构问题分析与整改建议
- [文件整理完成报告](./project-management/文件整理完成报告.md) - 2026-02-09文件整理详细记录

### 其他管理文档
- [文档管理规范](./project-management/文档管理规范.md) - 文档编写和管理规范
- [后端项目文件分类清单](./project-management/后端项目文件分类清单.md) - 后端文件分类说明
