# GitHub Actions 依赖配置

## 工作流依赖关系

### ci-cd.yml（完整流水线）
```
frontend-tests ──┐
                ├──> frontend-build ──┐
frontend-e2e  ──┘                    ├──> notify-success (仅 main 分支)
backend-tests ───────────────────────┘
                │
                └──> notify-failure (任何失败)
```

### frontend.yml（前端独立流水线）
```
build-and-test ──> deploy (仅 main 分支)
       │
       └──> notify-failure (任何失败)
```

### backend.yml（后端独立流水线）
```
code-quality ──> build-and-test ──> deploy (仅 main 分支)
                        │
                        └──> notify-failure (任何失败)
```

## 触发条件矩阵

| 工作流文件 | Push 分支 | PR 分支 | 路径过滤 |
|-----------|----------|---------|---------|
| ci-cd.yml | main, develop | main, develop | 无 |
| frontend.yml | main, develop | main, develop | frontend/** |
| backend.yml | main, develop | main, develop | spring_boot/** |

## 环境变量

### 全局环境变量
```yaml
NODE_VERSION: '20'
JAVA_VERSION: '17'
JAVA_DISTRIBUTION: 'temurin'
```

### 前端环境变量
```yaml
working-directory: ./frontend
cache-dependency-path: ./frontend/package-lock.json
```

### 后端环境变量
```yaml
working-directory: ./spring_boot
cache-dependency-path: ./spring_boot/pom.xml
```

## 依赖版本

### GitHub Actions 版本
- actions/checkout@v4
- actions/setup-node@v4
- actions/setup-java@v4
- actions/upload-artifact@v4
- actions/download-artifact@v4
- actions/github-script@v7
- codecov/codecov-action@v4

### Node.js 版本
- Node.js 20.x

### Java 版本
- Java 17
- Temurin 发行版

## 缓存策略

### 前端缓存
- npm 依赖缓存
- 缓存路径：`~/.npm`
- 缓存键：`package-lock.json` 的哈希值

### 后端缓存
- Maven 依赖缓存
- 缓存路径：`~/.m2/repository`
- 缓存键：`pom.xml` 的哈希值

## 构建产物保留

### 前端产物
- 名称：`frontend-build`
- 路径：`./frontend/dist`
- 保留时间：7 天

### 后端产物
- 名称：`backend-build`
- 路径：`./spring_boot/target/*.jar`
- 保留时间：7 天

### 覆盖率报告
- 前端：`frontend-coverage-report` (7 天)
- 后端：`jacoco-report` (7 天)
- SpotBugs：`spotbugs-report` (7 天)

### E2E 测试产物
- 截图：`cypress-screenshots` (7 天)
- 视频：`cypress-videos` (7 天)

## 通知配置

### 失败通知
- 触发条件：任何作业失败
- 通知方式：创建 GitHub Issue
- 标签：`ci-failure`、`automated`、`frontend` 或 `backend`

### 成功通知
- 触发条件：所有作业成功且在 main 分支
- 通知方式：在提交上添加评论

## Codecov 配置

### 前端配置
- 文件：`./frontend/coverage/coverage-final.json`
- 标志：`frontend-unit`
- 名称：`frontend-unit-coverage`
- 失败时继续：`false`

### 后端配置
- 文件：`./spring_boot/target/site/jacoco/jacoco.xml`
- 标志：`backend`
- 名称：`backend-coverage`
- 失败时继续：`false`

## 部署条件

### 前端部署
- 触发分支：`refs/heads/main`
- 前置条件：构建和测试成功
- 部署方式：待配置（rsync 或其他）

### 后端部署
- 触发分支：`refs/heads/main`
- 前置条件：构建和测试成功
- 部署方式：待配置（SSH 或其他）

## 超时配置

### 默认超时
- 前端测试：360 分钟
- 后端测试：360 分钟
- 构建步骤：360 分钟

### E2E 测试超时
- 默认：无限制（由 Cypress 控制）

## 并发控制

### 作业并发
- 前端测试和后端测试：并行运行
- 单元测试和 E2E 测试：并行运行
- 构建步骤：依赖测试完成后运行

### 工作流并发
- 同一分支的多次提交：取消之前的运行
- 不同分支的提交：独立运行

## 安全配置

### 权限要求
- contents: read
- issues: write（用于创建 Issue）
- pull-requests: write（用于添加评论）

### Secrets 管理
- 所有敏感信息存储在 GitHub Secrets 中
- 不在代码中硬编码任何密钥或凭证
- 使用环境变量引用 Secrets

## 性能优化

### 缓存命中率
- npm 缓存：通常 > 90%
- Maven 缓存：通常 > 95%

### 执行时间估算
- 前端测试：5-10 分钟
- 前端 E2E：10-20 分钟
- 后端测试：10-15 分钟
- 构建步骤：3-5 分钟
- 总计：约 20-40 分钟（并行执行）

## 监控指标

### 成功率目标
- 整体成功率：≥ 95%
- 前端测试成功率：≥ 98%
- 后端测试成功率：≥ 98%
- 构建成功率：≥ 99%

### 覆盖率目标
- 前端覆盖率：≥ 80%
- 后端覆盖率：≥ 80%
- 关键模块覆盖率：≥ 90%

## 故障恢复

### 自动重试
- 网络相关错误：自动重试 3 次
- 依赖下载失败：自动重试
- 测试超时：不自动重试

### 手动干预
- 测试失败：需要修复代码
- 构建失败：需要修复构建配置
- 部署失败：需要检查部署配置

## 版本更新策略

### Actions 版本
- 使用主版本号（@v4, @v7）
- 定期检查更新（每月）
- 评估更新影响后升级

### 依赖版本
- Node.js：跟随 LTS 版本
- Java：跟随 LTS 版本
- Maven：使用稳定版本

## 备份和恢复

### 配置备份
- 所有工作流文件纳入 Git 版本控制
- 定期导出 GitHub Actions 配置

### 恢复策略
- 从 Git 历史恢复配置
- 使用 GitHub Actions 导入功能
- 重新创建工作流文件

---

**文档版本**：1.0
**创建时间**：2026-01-06
**维护人员**：DevOps 团队
