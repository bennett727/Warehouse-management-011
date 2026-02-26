# 仓库管理系统文档中心

## 📚 文档导航

本文档中心包含仓库管理系统(WMS)的所有技术文档、用户手册和开发指南。

---

## 📁 文档结构

```
docs/
├── README.md                          # 本文档 - 文档导航入口
├── PROJECT_STRUCTURE.md               # 项目结构说明
├── DEPENDENCIES.md                    # 项目依赖说明
├── USER_MANUAL.md                     # 用户操作手册
├── ISSUE_TRACKING_GUIDE.md            # 问题追踪指南
├── api/                               # API文档
│   └── API_DOCUMENTATION.md
├── architecture/                      # 架构设计文档
│   ├── entity-relationship-diagram.md # 实体关系图
│   ├── inventory-management-design-spec.md # 库存管理设计规范
│   └── 后端架构设计方案.md
├── deployment/                        # 部署相关文档
│   ├── 生产环境配置说明.md
│   ├── 生产环境部署验证流程.md
│   └── 环境迁移策略.md
├── devops/                            # DevOps文档
│   ├── DATABASE_MIGRATION_GUIDE.md
│   └── SPRING_SECURITY_ROLE_NAMING.md
├── features/                          # 功能特性文档
│   └── excel-export-api.md
├── archive/                           # 归档文档
│   └── security/
│       └── excel-processing-security-plan.md
├── security/                          # 安全相关文档
│   ├── frontend-audit-report.md       # 前端安全审计报告
│   └── team-security-training.md      # 团队安全培训
├── testing/                           # 测试文档
│   ├── E2E测试全面评估报告.md
│   └── api-test-cases.md
└── user-guide/                        # 用户指南
    └── 入库流程操作手册.md
```

---

## 🚀 快速开始

### 开发人员
1. 阅读 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 了解项目结构
2. 查看 [.trae/rules/project_rules.md](../.trae/rules/project_rules.md) 了解开发规范
3. 参考 [部署文档](./deployment/生产环境配置说明.md) 进行环境搭建

### 运维人员
1. 查看 [部署文档](./deployment/生产环境配置说明.md)
2. 参考 [环境迁移策略](./deployment/环境迁移策略.md)
3. 查看 [数据库迁移指南](./devops/DATABASE_MIGRATION_GUIDE.md)

### 终端用户
1. 阅读 [用户手册](./USER_MANUAL.md)
2. 查看 [入库流程操作手册](./user-guide/入库流程操作手册.md)

---

## 📖 核心文档索引

### 项目概述
| 文档 | 说明 | 目标读者 |
|------|------|----------|
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | 项目整体结构说明 | 全体人员 |
| [DEPENDENCIES.md](./DEPENDENCIES.md) | 技术栈和依赖说明 | 开发人员 |

### 开发规范
| 文档 | 说明 | 位置 |
|------|------|------|
| 项目规则 | 编码规范、架构原则 | [.trae/rules/project_rules.md](../.trae/rules/project_rules.md) |
| 权限控制规则 | Spring Security权限规范 | [.trae/rules/权限控制规则.md](../.trae/rules/权限控制规则.md) |
| 错误处理规范 | 异常处理标准 | [.trae/rules/错误处理规范.md](../.trae/rules/错误处理规范.md) |
| 路径引用规范 | 前后端路径规范 | [.trae/rules/路径引用规范.md](../.trae/rules/路径引用规范.md) |

### 架构设计
| 文档 | 说明 | 目标读者 |
|------|------|----------|
| [实体关系图](./architecture/entity-relationship-diagram.md) | 数据库实体关系 | 开发人员 |
| [库存管理设计规范](./architecture/inventory-management-design-spec.md) | 库存模块设计 | 开发人员 |

### 部署运维
| 文档 | 说明 | 目标读者 |
|------|------|----------|
| [生产环境配置说明](./deployment/生产环境配置说明.md) | 生产环境部署指南 | 运维人员 |
| [生产环境部署验证流程](./deployment/生产环境部署验证流程.md) | 部署检查清单 | 运维人员 |
| [环境迁移策略](./deployment/环境迁移策略.md) | 环境迁移方案 | 运维人员 |
| [数据库迁移指南](./devops/DATABASE_MIGRATION_GUIDE.md) | 数据库升级指南 | 开发人员 |
| [API优化报告](./api-optimization-complete-report.md) | 接口优化总结 | 开发人员 |

### API文档
| 文档 | 说明 | 访问地址 |
|------|------|----------|
| API文档 | 接口详细说明 | [API_DOCUMENTATION.md](./api/API_DOCUMENTATION.md) |
| Swagger UI | 在线API文档 | http://localhost:8080/api/swagger-ui.html |

### 安全文档
| 文档 | 说明 | 目标读者 |
|------|------|----------|
| [团队安全培训](./security/team-security-training.md) | 安全开发规范 | 全体人员 |
| [Spring Security角色命名](./devops/SPRING_SECURITY_ROLE_NAMING.md) | 权限命名规范 | 开发人员 |

### 测试文档
| 文档 | 说明 | 目标读者 |
|------|------|----------|
| [E2E测试评估报告](./testing/E2E测试全面评估报告.md) | 端到端测试分析 | 测试人员 |
| [API测试用例](./testing/api-test-cases.md) | 接口测试用例 | 测试人员 |

### 用户手册
| 文档 | 说明 | 目标读者 |
|------|------|----------|
| [用户手册](./USER_MANUAL.md) | 系统操作指南 | 终端用户 |
| [入库流程操作手册](./user-guide/入库流程操作手册.md) | 入库操作详细说明 | 仓库操作员 |

---

## 🔧 脚本工具

项目脚本位于 `scripts/` 目录：

```
scripts/
├── README.md                      # 脚本使用说明
├── test-report-generator.cjs     # 测试报告生成器
├── powershell/                   # PowerShell脚本
│   └── run-tests-utf8.ps1       # 测试运行器
└── deploy/                       # 部署脚本（已清理）
```

### 常用脚本

| 任务 | 命令 | 说明 |
|------|------|------|
| 生产环境启动 | `spring_boot\start-prod.bat` | 启动生产环境服务 |
| 运行测试 | `.\scripts\powershell\run-tests-utf8.ps1` | 使用UTF-8编码运行测试 |
| 生成报告 | `node scripts\test-report-generator.cjs` | 生成测试报告 |

---

## 📝 文档维护规范

### 文档命名
- 使用英文或中文命名，保持一致性
- 重要文档使用大写字母（如README.md）
- 日期类文档格式：`文档名_YYYY-MM-DD.md`

### 文档更新
- 技术文档随代码同步更新
- 定期清理过时文档（每季度）
- 重要变更需更新文档索引

### 文档归档
- 已完成的项目文档保留在项目目录
- 删除临时性、过程性文档
- 保留重要决策记录

---

## ❓ 常见问题

**Q: 如何找到特定的文档？**
A: 使用本文档的索引表，或通过文件搜索功能查找关键词。

**Q: 文档过时了怎么办？**
A: 请提交Issue或联系开发团队更新。

**Q: 可以添加新文档吗？**
A: 可以，请遵循文档命名规范，并更新本文档索引。

---

## 📞 联系方式

- **技术支持**: tech.support@company.com
- **文档维护**: doc.maintainer@company.com

---

**文档版本**: 1.1  
**最后更新**: 2026-02-24  
**维护人员**: 开发团队
