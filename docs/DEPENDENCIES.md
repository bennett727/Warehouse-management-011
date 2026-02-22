# 仓库管理系统 - 依赖项清单

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | 1.0.0 |
| **更新日期** | 2026-02-08 |
| **责任人** | 开发团队 |
| **适用范围** | 仓库管理系统(WMS)所有开发、测试、生产环境 |

---

## 1. 前端依赖项

### 1.1 运行时依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| vue | ^3.4.21 | 核心框架 | ✅ |
| vue-router | ^4.3.0 | 路由管理 | ✅ |
| pinia | ^2.1.7 | 状态管理 | ✅ |
| axios | ^1.11.0 | HTTP客户端 | ✅ |
| element-plus | ^2.6.3 | UI组件库 | ✅ |
| @element-plus/icons-vue | ^2.3.1 | 图标库 | ✅ |
| dayjs | ^1.11.10 | 日期处理 | ✅ |
| lodash-es | ^4.17.21 | 工具函数库 | ✅ |
| js-cookie | ^3.0.5 | Cookie操作 | ✅ |
| nprogress | ^0.2.0 | 进度条 | ✅ |
| screenfull | ^6.0.2 | 全屏控制 | ✅ |
| echarts | ^5.4.3 | 图表库 | ✅ |
| vue-echarts | ^6.6.1 | ECharts Vue封装 | ✅ |
| xlsx | ^0.18.5 | Excel处理 | ✅ |
| file-saver | ^2.0.5 | 文件保存 | ✅ |

### 1.2 开发依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| vite | ^6.3.0 | 构建工具 | ❌ |
| @vitejs/plugin-vue | ^5.0.4 | Vue插件 | ❌ |
| @vitejs/plugin-legacy | ^5.3.2 | 浏览器兼容 | ❌ |
| eslint | ^8.57.0 | 代码检查 | ❌ |
| eslint-plugin-vue | ^9.24.0 | Vue ESLint规则 | ❌ |
| prettier | ^3.2.5 | 代码格式化 | ❌ |
| sass | ^1.72.0 | CSS预处理器 | ❌ |
| typescript | ^5.4.5 | 类型系统 | ❌ |
| vue-tsc | ^2.0.11 | Vue类型检查 | ❌ |
| cypress | ^15.0.0 | E2E测试框架 | ❌ |
| @cypress/vue | ^6.0.0 | Cypress Vue支持 | ❌ |
| vitest | ^1.4.0 | 单元测试框架 | ❌ |
| @vue/test-utils | ^2.4.5 | Vue测试工具 | ❌ |
| jsdom | ^24.0.0 | DOM模拟环境 | ❌ |

### 1.3 可选依赖

| 依赖名称 | 版本 | 用途 | 说明 |
|---------|------|------|------|
| @sentry/vue | ^7.108.0 | 错误监控 | 生产环境启用 |
| @sentry/tracing | ^7.108.0 | 性能追踪 | 生产环境启用 |
| workbox-window | ^7.0.0 | PWA支持 | 可选功能 |

---

## 2. 后端依赖项

### 2.1 Spring Boot Starter依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| spring-boot-starter-web | 3.5.5 | Web应用 | ✅ |
| spring-boot-starter-data-jpa | 3.5.5 | 数据访问 | ✅ |
| spring-boot-starter-security | 3.5.5 | 安全认证 | ✅ |
| spring-boot-starter-validation | 3.5.5 | 参数验证 | ✅ |
| spring-boot-starter-cache | 3.5.5 | 缓存支持 | ✅ |
| spring-boot-starter-actuator | 3.5.5 | 监控端点 | ✅ |
| spring-boot-starter-websocket | 3.5.5 | WebSocket | ✅ |
| spring-boot-starter-mail | 3.5.5 | 邮件服务 | ✅ |
| spring-boot-starter-test | 3.5.5 | 测试支持 | ❌ |

### 2.2 数据库相关依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| mysql-connector-j | 8.3.0 | MySQL驱动 | ✅ |
| HikariCP | 5.1.0 | 连接池 | ✅ |
| flyway-core | 10.10.0 | 数据库迁移 | ✅ |
| flyway-mysql | 10.10.0 | MySQL迁移支持 | ✅ |
| h2 | 2.2.224 | 内存数据库 | ❌ |

### 2.3 安全与认证依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| jjwt-api | 0.12.5 | JWT API | ✅ |
| jjwt-impl | 0.12.5 | JWT实现 | ✅ |
| jjwt-jackson | 0.12.5 | JWT JSON支持 | ✅ |
| spring-security-crypto | 6.2.4 | 加密工具 | ✅ |

### 2.4 工具类依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| lombok | 1.18.32 | 代码简化 | ✅ |
| mapstruct | 1.5.5.Final | 对象映射 | ✅ |
| mapstruct-processor | 1.5.5.Final | MapStruct处理器 | ✅ |
| commons-lang3 | 3.14.0 | 工具类 | ✅ |
| commons-io | 2.15.1 | IO工具 | ✅ |
| guava | 33.1.0-jre | Google工具库 | ✅ |
| jackson-datatype-jsr310 | 2.17.0 | 日期时间序列化 | ✅ |

### 2.5 缓存与消息队列依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| spring-boot-starter-data-redis | 3.5.5 | Redis支持 | ✅ |
| lettuce-core | 6.3.5.RELEASE | Redis客户端 | ✅ |
| spring-boot-starter-amqp | 3.5.5 | RabbitMQ支持 | ✅ |

### 2.6 监控与日志依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| micrometer-registry-prometheus | 1.12.4 | Prometheus监控 | ✅ |
| logstash-logback-encoder | 7.4 | ELK日志集成 | ✅ |
| skywalking-toolkit-trace | 9.1.0 | SkyWalking追踪 | ✅ |

### 2.7 文档依赖

| 依赖名称 | 版本 | 用途 | 生产环境 |
|---------|------|------|----------|
| springdoc-openapi-starter-webmvc-ui | 2.4.0 | OpenAPI文档 | ✅ |

---

## 3. 基础设施依赖

### 3.1 运行时环境

| 组件 | 版本 | 用途 | 说明 |
|------|------|------|------|
| Node.js | 20.x LTS | 前端运行时 | 必须 |
| Java | 21 LTS | 后端运行时 | 必须 |
| MySQL | 8.0+ | 数据库 | 必须 |
| Redis | 7.0+ | 缓存 | 推荐 |
| Nginx | 1.24+ | 反向代理 | 生产环境 |
| RabbitMQ | 3.12+ | 消息队列 | 可选 |

### 3.2 开发工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Maven | 3.9+ | Java构建工具 |
| npm | 10.x | Node包管理器 |
| Git | 2.40+ | 版本控制 |
| Docker | 24.x+ | 容器化部署 |
| Docker Compose | 2.20+ | 多容器编排 |

---

## 4. 依赖管理规范

### 4.1 版本锁定策略

1. **生产依赖**：使用精确版本号（如 `^1.2.3`）
2. **开发依赖**：允许小版本更新（如 `~1.2.3`）
3. **安全补丁**：及时更新到最新补丁版本
4. **大版本升级**：经过充分测试后统一升级

### 4.2 依赖更新流程

```
1. 评估更新影响
   ↓
2. 在开发环境测试
   ↓
3. 更新依赖版本
   ↓
4. 运行自动化测试
   ↓
5. 代码审查
   ↓
6. 合并到主分支
   ↓
7. 部署到测试环境
   ↓
8. 验证功能正常
   ↓
9. 部署到生产环境
```

### 4.3 安全漏洞处理

| 严重程度 | 响应时间 | 处理措施 |
|---------|---------|---------|
| 严重 (Critical) | 24小时内 | 立即更新或临时禁用 |
| 高危 (High) | 72小时内 | 优先安排更新 |
| 中危 (Medium) | 1周内 | 纳入下个迭代 |
| 低危 (Low) | 1个月内 | 随常规更新处理 |

### 4.4 依赖扫描工具

| 工具 | 用途 | 集成方式 |
|------|------|---------|
| npm audit | 前端依赖安全检查 | CI/CD |
| OWASP Dependency-Check | 后端依赖安全检查 | CI/CD |
| Snyk | 综合安全扫描 | GitHub集成 |
| Dependabot | 自动依赖更新 | GitHub集成 |

---

## 5. 依赖安装命令

### 5.1 前端依赖安装

```bash
# 进入前端目录
cd frontend

# 安装所有依赖
npm install

# 仅安装生产依赖
npm ci --production

# 安装特定依赖
npm install package-name@version

# 更新依赖
npm update

# 安全审计
npm audit
npm audit fix
```

### 5.2 后端依赖安装

```bash
# 进入后端目录
cd spring_boot

# 安装所有依赖
mvn clean install

# 跳过测试安装
mvn clean install -DskipTests

# 仅编译
mvn clean compile

# 依赖树分析
mvn dependency:tree

# 依赖检查
mvn dependency:analyze
```

---

## 6. 文档更新记录

| 版本 | 日期 | 更新内容 | 责任人 |
|------|------|---------|--------|
| 1.0.0 | 2026-02-08 | 初始版本，包含完整的前后端依赖清单及管理规范 | 开发团队 |

---

## 附录

### A. 相关文档

- [package.json](./frontend/package.json) - 前端依赖详细配置
- [pom.xml](./spring_boot/pom.xml) - 后端依赖详细配置
- [package-lock.json](./frontend/package-lock.json) - 前端依赖锁定文件

### B. 联系方式

- **开发团队**: dev-team@company.com
- **运维团队**: ops-team@company.com
- **安全团队**: security@company.com
