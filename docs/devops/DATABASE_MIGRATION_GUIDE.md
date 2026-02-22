# 数据库迁移管理建议文档

## 📋 文档概述

本文档提供仓库管理系统数据库迁移管理的改进建议，重点介绍如何引入Flyway实现统一的数据库版本管理和迁移。

## 🎯 当前现状分析

### 现有数据库管理方式

| 类型 | 位置 | 用途 | 管理方式 |
|------|------|------|---------|
| 生产环境SQL | `scripts/sql/` | MySQL生产环境初始化 | 手动执行 |
| 测试环境SQL | `src/main/resources/sql/` | H2测试数据 | Spring Boot自动加载 |
| 数据库迁移脚本 | `src/main/resources/db/migrations/` | 数据库结构变更 | Flyway（部分使用） |

### 现有迁移脚本

| 文件名 | 版本 | 描述 | 状态 |
|--------|------|------|------|
| V20260207__entity_optimization_changes.sql | 20260207 | 实体优化变更 | ✅ 已执行 |
| V20260206__create_device_status_approval_table.sql | 20260206 | 创建设备状态审批表 | ✅ 已执行 |
| V20260206__optimize_database_performance.sql | 20260206 | 数据库性能优化 | ✅ 已执行 |
| V20260201__create_refresh_token_table.sql | 20260201 | 创建刷新令牌表 | ✅ 已执行 |
| V20260131__add_foreign_keys.sql | 20260131 | 添加外键约束 | ✅ 已执行 |
| V20260131__fix_entity_naming.sql | 20260131 | 修复实体命名 | ✅ 已执行 |
| V20260131__update_entity_relationships.sql | 20260131 | 更新实体关系 | ✅ 已执行 |
| V20260131__optimize_entity_indexes.sql | 20260131 | 优化实体索引 | ✅ 已执行 |
| V20260131__create_new_entity_tables.sql | 20260131 | 创建新实体表 | ✅ 已执行 |
| V20260131__unify_audit_fields.sql | 20260131 | 统一审计字段 | ✅ 已执行 |
| V20260130__add_area_and_location_to_stock_order_item.sql | 20260130 | 添加区域和位置字段 | ✅ 已执行 |

### 当前问题

1. **初始化脚本与迁移脚本分离**
   - `init_complete_database.sql`包含完整表结构
   - 迁移脚本只包含增量变更
   - 容易导致不一致

2. **手动执行风险**
   - 生产环境SQL需要手动执行
   - 容易遗漏或执行顺序错误
   - 缺乏自动化验证

3. **版本管理不统一**
   - 初始化脚本没有版本号
   - 迁移脚本有版本号但不够规范
   - 难以追踪变更历史

4. **跨环境不一致**
   - 生产环境使用MySQL
   - 测试环境使用H2
   - 数据库结构可能不一致

## 🚀 Flyway集成方案

### 为什么选择Flyway

| 优势 | 说明 |
|------|------|
| **版本控制** | 每个迁移脚本都有唯一版本号 |
| **自动执行** | 应用启动时自动执行未应用的迁移 |
| **跨环境一致** | 确保所有环境使用相同的数据库结构 |
| **可回滚** | 支持回滚到指定版本 |
| **团队协作** | 多人开发时自动解决冲突 |
| **审计追踪** | 完整的变更历史记录 |

### Flyway工作原理

```
应用启动
    ↓
Flyway检查flyway_schema_history表
    ↓
对比已执行的迁移版本
    ↓
发现新的迁移脚本
    ↓
按版本号顺序执行
    ↓
更新flyway_schema_history表
    ↓
应用启动完成
```

## 📦 集成步骤

### 1. 添加Flyway依赖

在`pom.xml`中添加：

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
    <version>9.22.3</version>
</dependency>

<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
    <version>9.22.3</version>
</dependency>
```

### 2. 配置Flyway

在`application.properties`中添加：

```properties
# Flyway配置
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migrations
spring.flyway.table=flyway_schema_history
spring.flyway.sql-migration-separator=__
spring.flyway.sql-migration-prefix=V
spring.flyway.sql-migration-suffixes=.sql
spring.flyway.validate-on-migrate=true
spring.flyway.out-of-order=false
```

### 3. 重构现有脚本

#### 3.1 创建基线脚本

创建`V1.0.0__baseline.sql`，包含完整的初始表结构：

```sql
-- 基线脚本：V1.0.0__baseline.sql
-- 包含所有初始表结构
-- 从init_complete_database.sql迁移而来

-- 创建行政区划表
CREATE TABLE administrative_division (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    parent_id BIGINT,
    sort INT DEFAULT 0,
    status INT NOT NULL DEFAULT 1,
    remark VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    deleted_at DATETIME,
    deleted_by BIGINT,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_level (level),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status),
    CONSTRAINT fk_admin_div_parent FOREIGN KEY (parent_id)
        REFERENCES administrative_division(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ... 其他表结构
```

#### 3.2 转换现有迁移脚本

将现有迁移脚本重命名并整理：

| 原文件名 | 新文件名 | 说明 |
|---------|---------|------|
| V20260130__add_area_and_location_to_stock_order_item.sql | V1.0.1__add_area_and_location_to_stock_order_item.sql | 添加区域和位置字段 |
| V20260131__unify_audit_fields.sql | V1.0.2__unify_audit_fields.sql | 统一审计字段 |
| V20260131__create_new_entity_tables.sql | V1.0.3__create_new_entity_tables.sql | 创建新实体表 |
| V20260131__optimize_entity_indexes.sql | V1.0.4__optimize_entity_indexes.sql | 优化实体索引 |
| V20260131__update_entity_relationships.sql | V1.0.5__update_entity_relationships.sql | 更新实体关系 |
| V20260131__fix_entity_naming.sql | V1.0.6__fix_entity_naming.sql | 修复实体命名 |
| V20260131__add_foreign_keys.sql | V1.0.7__add_foreign_keys.sql | 添加外键约束 |
| V20260201__create_refresh_token_table.sql | V1.0.8__create_refresh_token_table.sql | 创建刷新令牌表 |
| V20260206__optimize_database_performance.sql | V1.0.9__optimize_database_performance.sql | 数据库性能优化 |
| V20260206__create_device_status_approval_table.sql | V1.0.10__create_device_status_approval_table.sql | 创建设备状态审批表 |
| V20260207__entity_optimization_changes.sql | V1.0.11__entity_optimization_changes.sql | 实体优化变更 |

### 4. 处理现有数据库

#### 4.1 生产环境

```bash
# 1. 备份现有数据库
mysqldump -u root -p warehouse > backup_$(date +%Y%m%d).sql

# 2. 创建flyway_schema_history表
CREATE TABLE flyway_schema_history (
    installed_rank INT NOT NULL,
    version VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INT,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time INT NOT NULL,
    success BOOLEAN NOT NULL,
    CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank),
    CONSTRAINT flyway_schema_history_s_idx UNIQUE (script, version, installed_rank, installed_on)
);

# 3. 插入已执行的迁移记录
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
VALUES
(1, '1.0.0', 'baseline', 'SQL', 'V1.0.0__baseline.sql', 123456789, 'dba', NOW(), 1000, TRUE),
(2, '1.0.1', 'add_area_and_location_to_stock_order_item', 'SQL', 'V1.0.1__add_area_and_location_to_stock_order_item.sql', 234567890, 'dba', NOW(), 500, TRUE);
-- ... 其他已执行的迁移
```

#### 4.2 测试环境

```bash
# H2数据库会自动创建，无需特殊处理
# Flyway会在应用启动时自动执行迁移
```

### 5. 验证集成

```bash
# 启动应用，检查Flyway日志
mvn spring-boot:run

# 查看日志中的Flyway输出
# Flyway Community Edition 9.22.3 by Redgate
# Database: jdbc:mysql://localhost:3306/warehouse (MySQL 8.0)
# Successfully validated 11 migrations
# Current version of schema "warehouse": 1.0.11
```

## 📝 迁移脚本规范

### 命名规范

```
V{版本号}__{描述}.sql

示例：
V1.0.12__add_user_preference_table.sql
V1.0.13__update_device_status_enum.sql
V1.1.0__refactor_inventory_management.sql
```

### 版本号规范

```
主版本.次版本.修订版本

示例：
1.0.0 - 初始版本
1.0.1 - 小修复
1.1.0 - 新功能
2.0.0 - 重大变更
```

### 描述规范

- 使用小写字母和下划线
- 简洁明了，说明变更内容
- 避免使用特殊字符

```sql
-- ✅ 好的命名
V1.0.12__add_user_preference_table.sql
V1.0.13__update_device_status_enum.sql

-- ❌ 不好的命名
V1.0.12__Add User Preference Table.sql
V1.0.13__Update Device Status Enum.sql
```

### 脚本内容规范

```sql
-- =====================================================================================
-- 迁移脚本：V1.0.12__add_user_preference_table.sql
-- 版本：1.0.12
-- 作者：张三
-- 日期：2026-02-08
-- 描述：添加用户偏好设置表，支持用户自定义界面配置
-- 影响范围：新增user_preference表
-- 回滚脚本：V1.0.12__rollback_add_user_preference_table.sql
-- =====================================================================================

-- 创建用户偏好设置表
CREATE TABLE user_preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    preference_key VARCHAR(100) NOT NULL COMMENT '偏好键',
    preference_value TEXT COMMENT '偏好值',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_key (user_id, preference_key),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_user_preference_user FOREIGN KEY (user_id)
        REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好设置表';

-- 插入默认偏好设置
INSERT INTO user_preference (user_id, preference_key, preference_value)
SELECT id, 'theme', 'light' FROM user WHERE status = 1;
```

## 🔄 迁移流程

### 开发流程

```mermaid
graph LR
    A[创建迁移脚本] --> B[本地测试]
    B --> C[代码审查]
    C --> D[合并到develop分支]
    D --> E[CI/CD自动测试]
    E --> F[部署到测试环境]
    F --> G[验证测试环境]
    G --> H[合并到main分支]
    H --> I[部署到生产环境]
```

### 具体步骤

1. **创建迁移脚本**
   ```bash
   # 在db/migrations目录创建新脚本
   touch V1.0.12__add_user_preference_table.sql
   ```

2. **编写迁移内容**
   - 遵循命名和内容规范
   - 包含必要的注释
   - 考虑回滚方案

3. **本地测试**
   ```bash
   # 启动应用，验证迁移执行
   mvn spring-boot:run

   # 检查数据库表是否正确创建
   mysql -u wms_user -p warehouse -e "SHOW TABLES;"
   ```

4. **代码审查**
   - 提交Pull Request
   - 团队成员审查迁移脚本
   - 确认无语法错误和逻辑问题

5. **合并到develop分支**
   - 通过审查后合并
   - CI/CD自动运行测试
   - 部署到测试环境

6. **验证测试环境**
   - 检查Flyway执行日志
   - 验证数据库变更
   - 运行集成测试

7. **合并到main分支**
   - 确认测试环境无问题
   - 合并到main分支
   - 部署到生产环境

8. **生产环境验证**
   - 检查Flyway执行日志
   - 验证数据库变更
   - 监控应用运行状态

## 🛡️ 最佳实践

### 1. 不可变性

- ✅ 迁移脚本一旦创建，永远不要修改
- ✅ 如果需要修改，创建新的迁移脚本
- ❌ 不要修改已执行的迁移脚本

### 2. 可重复性

- ✅ 脚本应该可以重复执行而不报错
- ✅ 使用`IF NOT EXISTS`、`DROP IF EXISTS`等
- ✅ 使用`ON DUPLICATE KEY UPDATE`处理重复数据

### 3. 向后兼容

- ✅ 新增字段使用默认值
- ✅ 删除字段前先标记为废弃
- ✅ 重命名字段前创建新字段

### 4. 性能考虑

- ✅ 大表变更使用分批处理
- ✅ 添加索引考虑对性能的影响
- ✅ 避免在高峰期执行大迁移

### 5. 安全考虑

- ✅ 迁移脚本不包含敏感数据
- ✅ 使用事务确保数据一致性
- ✅ 执行前备份重要数据

## 📊 监控和维护

### Flyway状态检查

```sql
-- 查看已执行的迁移
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- 查看当前版本
SELECT version, description, installed_on
FROM flyway_schema_history
WHERE installed_rank = (SELECT MAX(installed_rank) FROM flyway_schema_history);
```

### 迁移失败处理

```bash
# 1. 查看错误日志
tail -f logs/spring-boot.log | grep Flyway

# 2. 修复迁移脚本
# 根据错误信息修改脚本

# 3. 修复flyway_schema_history表
DELETE FROM flyway_schema_history WHERE version = '1.0.12' AND success = FALSE;

# 4. 重新启动应用
mvn spring-boot:run
```

### 回滚策略

```sql
-- 创建回滚脚本
-- V1.0.12__rollback_add_user_preference_table.sql

-- 删除用户偏好设置表
DROP TABLE IF EXISTS user_preference;

-- 清理flyway_schema_history
DELETE FROM flyway_schema_history WHERE version = '1.0.12';
```

## 📚 相关文档

- [Flyway官方文档](https://flywaydb.org/documentation/)
- [Spring Boot Flyway集成](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)
- [数据库设计文档](./database-design.md)
- [部署指南](./DEPLOYMENT.md)

## 👥 联系方式

如有问题或建议，请联系：
- **数据库管理员**：dba@company.com
- **技术负责人**：tech.lead@company.com
- **项目经理**：project.manager@company.com

---

**文档版本**：1.0
**最后更新**：2026-02-07
**维护人**：数据库团队
