---
status: active
last_updated: 2026-02-26
maintainer: 开发团队
purpose: 记录项目的架构设计规范和代码规范
version: 1.1
---
# 仓库管理系统项目规则文档

## 1. 项目概述

本仓库管理系统(WMS)是基于Vue 3 + Spring Boot的全栈企业级应用，用于管理仓库内的设备、库存、维护记录等核心业务数据。系统采用前后端分离架构，支持多角色权限控制、设备远程连接管理和实时数据监控等功能。

## 2. 架构设计规范

### 2.1 整体架构
- **架构模式**：前后端分离架构
- **前端技术栈**：Vue 3 + Vite + Element Plus + Pinia + Vue Router
- **后端技术栈**：Spring Boot 3.5.5 + Java 17 + Spring Security + JWT + JPA
- **数据库**：MySQL (生产环境) / H2 (开发/测试环境)
- **API风格**：RESTful API

### 2.2 分层架构

#### 前端分层
```
├── src/
│   ├── components/      # 通用组件
│   ├── views/           # 页面视图
│   ├── router/          # 路由配置
│   ├── stores/          # 状态管理
│   ├── utils/           # 工具函数
│   ├── api/             # API接口定义
│   ├── assets/          # 静态资源
│   └── styles/          # 全局样式
```

#### 后端分层
```
├── src/main/java/com/backend/
│   ├── controller/      # 控制器层
│   ├── service/         # 业务逻辑层
│   ├── repository/      # 数据访问层
│   ├── entity/          # 实体类
│   ├── dto/             # 数据传输对象
│   ├── config/          # 配置类
│   ├── exception/       # 异常处理
│   └── util/            # 工具类
```

### 2.3 核心架构原则
1. **单一职责原则**：每个类和方法只负责一个明确的功能
2. **接口分离原则**：客户端不应该依赖它不需要的接口
3. **依赖倒置原则**：高层模块不应依赖低层模块，两者都应依赖抽象
4. **开闭原则**：对扩展开放，对修改关闭
5. **里氏替换原则**：子类可以替换父类，而不影响程序的正确性

## 3. 代码规范

### 3.1 命名规范

#### 前端命名规范
- **组件名**：PascalCase，如`DeviceManagement.vue`
- **变量名**：camelCase，如`deviceList`
- **常量名**：全大写+下划线，如`API_BASE_URL`
- **方法名**：camelCase（动词开头），如`getDeviceInfo()`
- **路由路径**：kebab-case，如`/device-management`

#### 后端命名规范
- **类名**：PascalCase，如`DeviceController`
- **方法名**：camelCase（动词开头），如`createDevice()`
- **变量名**：camelCase，如`deviceService`
- **常量名**：全大写+下划线，如`MAX_PAGE_SIZE`
- **包名**：小写+点分隔，如`com.backend.controller`
- **数据库表名**：下划线分隔的小写单词，如`device_info`
- **数据库字段名**：下划线分隔的小写单词，如`device_code`

### 3.2 代码风格

#### 前端代码风格
- **缩进**：2个空格
- **分号**：必须使用
- **引号**：字符串使用单引号，模板字符串使用反引号
- **空行**：函数、组件、逻辑块之间使用空行
- **注释**：关键代码使用JSDoc格式注释

#### 后端代码风格
- **缩进**：4个空格
- **括号**：左括号与语句在同一行，右括号独占一行
- **空行**：类、方法、逻辑块之间使用空行
- **注释**：使用Javadoc注释类和方法
- **异常处理**：使用try-catch处理异常

### 3.3 代码质量要求
- **可读性**：代码应易于理解，避免过度复杂的表达式
- **可维护性**：代码结构清晰，模块化设计
- **可测试性**：代码应易于测试，避免紧密耦合
- **性能**：避免不必要的计算和数据库查询
- **安全性**：遵循安全编码实践，防止常见漏洞

## 4. 接口交互规范

### 4.1 API设计原则
1. **RESTful风格**：使用HTTP方法表示操作类型
   - GET：获取资源
   - POST：创建资源
   - PUT：更新资源
   - DELETE：删除资源
   - PATCH：部分更新资源

2. **统一响应格式**：所有API返回统一的响应结构
   ```json
   {
     "success": true/false,
     "message": "操作结果描述",
     "data": { /* 返回数据 */ },
     "code": 200 /* 状态码 */
   }
   ```

3. **版本控制**：通过URL路径进行API版本控制，如`/api/v1/devices`
4. **参数验证**：所有请求参数必须进行验证
5. **错误处理**：使用统一的异常处理机制

### 4.2 前端API调用规范
- **API封装**：所有API调用必须通过`utils/request.js`封装的Axios实例
- **请求拦截器**：统一添加认证令牌、请求头
- **响应拦截器**：统一处理响应格式、错误信息、令牌刷新
- **异步处理**：使用async/await处理异步请求

### 4.3 路径统一管理规范

#### 4.3.1 路径配置原则

**后端配置**：
- 使用`context-path=/api`统一管理API上下文路径
- 所有Controller的`@RequestMapping`路径包含`/api`前缀
- 路径常量统一管理在`ApiPathConstants.java`中

**前端配置**：
- 使用Vite代理转发API请求到后端
- 前端API常量统一管理在`apiConstants.js`中
- 前端请求路径不包含`/api`前缀（由代理自动添加）

#### 4.3.2 路径映射规则

| 配置项 | 后端 | 前端 | 说明 |
|--------|------|------|------|
| context-path | `/api` | - | 后端统一上下文路径 |
| 代理配置 | - | `/api` → `http://localhost:8080` | Vite开发服务器代理 |
| API基础路径 | `/api` | `` (空字符串) | 前端常量不包含`/api` |
| 请求示例 | `@RequestMapping("/api/devices")` | `DEVICE_API.BASE` | 后端完整路径，前端相对路径 |

#### 4.3.3 路径使用规则

**后端使用规则**：
```java
// 导入路径常量
import com.backend.constants.ApiPathConstants;

// 在Controller中使用
@RestController
@RequestMapping(ApiPathConstants.DeviceApi.BASE)
public class DeviceController {
    
    @GetMapping(ApiPathConstants.DeviceApi.LIST)
    public ApiResponse<List<Device>> getDeviceList() {
        // 实现
    }
}
```

**前端使用规则**：
```javascript
// 导入API常量
import { DEVICE_API } from '@/constants/apiConstants';

// 在API文件中使用
export function getDeviceList(params) {
  return request({
    url: DEVICE_API.LIST,  // '/devices/list'
    method: 'get',
    params
  });
}
```

**监控模块特殊规则**：
```javascript
// 性能监控和错误监控直接使用fetch，不经过request.js
const PERFORMANCE_CONFIG = {
  reportUrl: '/performance-report',  // 不包含 /api 前缀
};

const ERROR_MONITOR_CONFIG = {
  reportUrl: '/error-report',  // 不包含 /api 前缀
};
```

#### 4.3.4 路径变更流程

1. **新增API路径**：
   - 后端：在`ApiPathConstants.java`中添加常量
   - 前端：在`apiConstants.js`中添加对应常量
   - 更新：同步更新`docs/api-path-management.md`文档

2. **修改API路径**：
   - 评估影响范围，确认向后兼容性
   - 更新后端和前端常量
   - 更新相关文档和测试用例
   - 通知团队成员变更内容

3. **删除API路径**：
   - 标记为@deprecated，保留至少一个版本周期
   - 更新文档说明废弃时间和替代方案
   - 逐步迁移到新路径
   - 在确认无使用后删除

#### 4.3.5 路径验证要求

- **开发阶段**：使用Swagger文档验证路径正确性
- **测试阶段**：执行E2E测试验证所有API路径
- **部署前**：检查后端访问日志，确认无404错误
- **监控阶段**：监控API调用成功率，及时发现路径问题

#### 4.3.6 常见错误与解决方案

| 错误现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| 404 Not Found | 路径重复`/api/api/xxx` | 前端路径移除`/api`前缀 |
| CORS错误 | 代理配置不正确 | 检查vite.config.js代理设置 |
| 路径不一致 | 前后端常量不同步 | 统一更新前后端常量文件 |
| 监控数据上报失败 | 监控模块路径配置错误 | 使用相对路径，不包含`/api` |

### 4.4 后端API实现规范
- **控制器层**：负责请求接收、参数验证、响应返回
- **服务层**：实现核心业务逻辑，处理事务管理
- **数据访问层**：使用JPA进行数据库操作
- **事务管理**：关键业务操作必须添加事务注解`@Transactional`
- **权限控制**：使用`@PreAuthorize`注解进行方法级权限控制

### 4.5 Spring Security权限控制规范

#### 4.5.1 角色命名规范
- **角色名称必须使用大写**：如`ADMIN`、`OPERATOR`、`TECHNICIAN`
- **禁止使用小写角色名称**：如`admin`、`operator`会导致权限验证失败
- **角色前缀**：Spring Security的`hasRole()`方法会自动添加`ROLE_`前缀
- **枚举定义**：所有角色必须在`EntityType.UserRole`枚举中定义

#### 4.5.2 权限注解使用规范

**推荐使用hasRole()**：
```java
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
```

**hasRole() vs hasAuthority()**：
- `hasRole('ADMIN')` → 自动匹配`ROLE_ADMIN`（推荐）
- `hasAuthority('ROLE_ADMIN')` → 直接匹配`ROLE_ADMIN`（不推荐，除非需要精确控制）

#### 4.5.3 常见错误示例

**错误示例**（会导致401 Unauthorized）：
```java
@PreAuthorize("hasRole('admin')")  // 小写，不匹配ROLE_ADMIN
@PreAuthorize("hasRole('operator')")  // 小写，不匹配ROLE_OPERATOR
```

**正确示例**：
```java
@PreAuthorize("hasRole('ADMIN')")  // 大写，匹配ROLE_ADMIN
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")  // 多个角色
```

#### 4.5.4 角色定义流程

1. **枚举定义**（EntityType.java）：
```java
public enum UserRole {
    ADMIN(0, "管理员"),
    OPERATOR(1, "操作员"),
    TECHNICIAN(2, "技术员");
}
```

2. **权限设置**（UserDetailsServiceImpl.java）：
```java
String roleName = UserRole.ADMIN.name();  // 返回 "ADMIN"
new SimpleGrantedAuthority("ROLE_" + roleName);  // 创建 "ROLE_ADMIN"
```

3. **权限验证**（Controller）：
```java
@PreAuthorize("hasRole('ADMIN')")  // 匹配 "ROLE_ADMIN"
```

#### 4.5.5 代码检查规则
- 所有`@PreAuthorize`注解中的角色名称必须使用大写
- 禁止使用小写角色名称
- 使用正则表达式检查：`hasRole\('[a-z]`（禁止小写）

## 5. 性能优化规范

### 5.1 前端性能优化
- **组件懒加载**：使用Vue Router的动态导入功能
- **图片优化**：使用适当尺寸的图片，支持WebP格式
- **代码分割**：使用Vite的代码分割功能
- **缓存策略**：合理使用浏览器缓存和本地存储
- **虚拟滚动**：处理大量数据列表时使用
- **减少重渲染**：使用Vue的响应式API优化

### 5.2 后端性能优化
- **数据库优化**：使用索引、避免N+1查询、分页查询、批量操作
- **缓存优化**：使用Redis缓存热点数据，合理设置过期时间
- **代码优化**：避免循环中查询数据库，使用并行流处理数据
- **API优化**：异步API处理长时间任务，实现限流和熔断机制

## 6. 安全措施规范

### 6.1 前端安全
- **XSS防护**：避免使用`innerHTML`，使用Vue安全渲染机制
- **CSRF防护**：使用JWT令牌，实现严格的CORS策略
- **其他安全**：不在前端存储敏感信息，使用HTTPS加密传输

### 6.2 后端安全
- **认证与授权**：JWT认证，RBAC权限控制，BCrypt加密存储密码
- **输入验证**：使用Bean Validation进行参数验证
- **安全配置**：禁用不必要服务和端口，配置HTTP防火墙
- **敏感数据**：加密存储敏感数据，不在日志中记录

### 6.3 安全审计
- 记录关键操作日志
- 定期进行安全扫描和漏洞检测
- 及时更新依赖库

## 7. 文档规范

### 7.1 代码文档
- **前端**：使用JSDoc注释函数、组件、模块
- **后端**：使用Javadoc注释类、方法、参数、返回值

### 7.2 API文档
- 使用SpringDoc OpenAPI (Swagger)自动生成API文档
- 文档URL：`/api/swagger-ui.html`

### 7.3 项目文档
- **README.md**：项目概述、技术栈、快速开始指南
- **CHANGELOG.md**：版本变更记录
- **DEPLOYMENT.md**：部署指南
- **USER_GUIDE.md**：用户操作手册

### 7.4 文档管理规范
- 所有项目文档必须统一存储在`docs`目录下
- 遵循文档命名规范、存储位置规范和编写规范
- 文档更新应及时，保持与代码同步
- 详细规范请参考：[docs/project-management/文档管理规范.md](../../docs/project-management/文档管理规范.md)

## 3.5 文件编码规范

### 3.5.1 编码标准
- **所有文本文件必须使用 UTF-8 编码（无 BOM）**
- 禁止使用过时的编码格式（如 GBK、GB2312、ANSI 等）
- 新建文件时，请确保编辑器设置为 UTF-8 编码

### 3.5.2 禁止的字符
文件中不得包含以下字符：
- **Unicode 替换字符** (`�`) - 表示编码损坏的字符
- **控制字符** (ASCII 0x00-0x1F，除换行、回车、制表符外)
- **BOM 标记** (Byte Order Mark)

### 3.5.3 编码检查
- 运行 `npm run check-encoding` 检查所有文件编码
- 运行 `npm run pre-commit` 进行提交前完整检查
- 详细规范请参考：[docs/coding-standards/encoding-guide.md](../../frontend/docs/coding-standards/encoding-guide.md)

## 8. 开发流程规范

### 8.1 分支管理
- **main**：生产环境代码分支
- **develop**：开发环境代码分支
- **feature/xxx**：功能开发分支
- **bugfix/xxx**：bug修复分支
- **release/xxx**：版本发布分支

### 8.2 代码提交规范
- **提交信息格式**：`类型(模块): 简短描述`
  - 类型：feat(新功能)、fix(修复bug)、docs(文档)、style(代码风格)、refactor(重构)、test(测试)、chore(构建/工具)
  - 示例：`feat(device): 添加设备批量导入功能`

### 8.3 代码审查
- 所有代码必须经过代码审查才能合并到develop分支
- 使用Pull Request (PR)机制进行代码审查

### 8.4 测试规范

#### 前端测试
- **单元测试**：使用Vitest测试组件和工具函数
- **集成测试**：测试组件之间的交互
- **端到端测试**：使用Cypress测试完整业务流程

#### 后端测试
- **单元测试**：使用JUnit 5测试服务层和工具类
- **集成测试**：测试控制器层和数据库交互
- **接口测试**：使用Postman或Swagger测试API接口

### 8.5 构建与部署

#### 前端构建
```bash
npm run dev          # 开发环境
npm run build        # 生产环境构建
```

#### 后端构建
```bash
mvn spring-boot:run                 # 开发环境
mvn clean package -DskipTests       # 生产环境构建
```

#### CI/CD流程
1. 代码提交到feature/bugfix分支
2. 自动运行单元测试和代码审查
3. 合并到develop分支后，自动构建测试环境
4. 合并到main分支后，自动构建并部署生产环境

## 9. 质量指标

### 9.1 代码质量指标
- **代码覆盖率**：单元测试覆盖率≥80%
- **代码重复率**：≤5%
- **静态代码分析**：无严重级别以上的代码规范问题

### 9.2 性能指标
- **前端加载时间**：首屏加载时间≤2秒
- **API响应时间**：平均响应时间≤500ms
- **系统吞吐量**：≥1000请求/秒
- **数据库查询时间**：复杂查询≤1秒

### 9.3 可靠性指标
- **系统可用性**：≥99.9%
- **错误率**：生产环境错误率≤0.1%
- **故障恢复时间**：≤30分钟

## 10. 违规处理机制

### 10.1 违规类型
- **代码规范违规**：不遵循命名、风格、结构规范
- **安全规范违规**：存在安全漏洞或不遵循安全编码实践
- **性能违规**：存在明显的性能问题
- **流程违规**：不遵循开发流程、分支管理、代码提交规范
- **文档违规**：文档不完整、不准确或不及时更新

### 10.2 处理流程
1. 违规识别：通过代码审查、静态代码分析等方式识别
2. 违规通知：发送违规通知，说明整改要求
3. 整改期限：根据违规严重程度设定
4. 整改验证：违规人员整改后进行验证

### 10.3 惩罚措施
- **轻度违规**：口头警告，立即整改
- **中度违规**：书面警告，扣除绩效分数
- **重度违规**：暂停开发权限，培训学习
- **严重违规**：解除劳动合同（如导致重大安全事故）

## 11. 附录

### 11.1 技术栈版本信息

#### 前端技术栈
- Vue.js 3.4.21、Vue Router 4.3.0、Pinia 2.1.7、Vite 6.3.0、Element Plus 2.6.3、Axios 1.11.0

#### 后端技术栈
- Spring Boot 3.5.5、Java 17、Spring Security 6.1.0、JWT 0.11.5、Spring Data JPA 3.1.0、MySQL 8.0

### 11.2 常用工具和命令

#### 前端工具
- **开发服务器**：`npm run dev`
- **代码检查**：`npm run lint`
- **单元测试**：`npm run test`
- **生产构建**：`npm run build`

#### 后端工具
- **开发服务器**：`mvn spring-boot:run`
- **代码检查**：`mvn checkstyle:check`
- **单元测试**：`mvn test`
- **生产构建**：`mvn clean package -DskipTests`

### 11.3 联系方式
- **项目负责人**：张经理 (zhang.manager@company.com)
- **技术支持**：技术支持团队 (tech.support@company.com)
- **问题反馈**：通过GitHub Issues提交

---

**文档版本**：1.1
**文档更新时间**：2026-02-26
**文档审核人**：李架构师