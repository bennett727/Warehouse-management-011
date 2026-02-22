# 仓库管理系统日志配置指南

## 概述

本文档详细说明仓库管理系统的日志配置，包括开发环境和生产环境的不同配置方式、日志监控和告警机制。

## 日志架构

### 日志类型

| 日志类型 | 文件名 | 用途 | 保留策略 |
|---------|--------|------|---------|
| 主日志 | `warehouse-management-system.log` | 应用启动、框架日志、所有INFO级别以上日志 | 30天，3GB |
| 业务日志 | `warehouse-management-system-business.log` | 业务操作、数据初始化、缓存预热等 | 90天，2GB |
| 错误日志 | `warehouse-management-system-error.log` | 仅ERROR级别日志，包含完整异常堆栈 | 60天，1GB |
| SQL日志 | `warehouse-management-system-sql.log` | Hibernate执行的SQL语句和参数 | 7天，1GB |
| 告警日志 | `alerts/alert.log` | 错误告警专用日志（JSON格式） | 90天，500MB |
| 性能日志 | `warehouse-management-system-performance.json.log` | API性能监控数据 | 30天，1GB |
| **Tomcat访问日志** | `tomcat/access_log.yyyy-MM-dd.log` | HTTP请求访问记录（IP、URL、状态码、响应时间等） | 按日期滚动 |

### Tomcat访问日志

Spring Boot内置Tomcat的访问日志记录所有HTTP请求信息，与Logback应用日志分离管理。

**配置位置**: `application.properties`

```properties
# 启用Tomcat访问日志
server.tomcat.accesslog.enabled=true
# 访问日志存放目录
server.tomcat.accesslog.directory=logs/tomcat
# 访问日志文件名前缀
server.tomcat.accesslog.prefix=access_log
# 访问日志文件名后缀
server.tomcat.accesslog.suffix=.log
# 日志格式（combined格式包含完整信息）
server.tomcat.accesslog.pattern=combined
# 日志文件日期格式
server.tomcat.accesslog.file-date-format=.yyyy-MM-dd
```

**日志格式说明**:
- `combined` 格式包含：客户端IP、请求时间、请求方法、URL、协议、状态码、响应大小、Referer、User-Agent等
- 日志文件按天滚动：`access_log.2026-02-09.log`

**日志示例**:
```
127.0.0.1 - - [09/Feb/2026:20:30:15 +0800] "GET /api/devices/list HTTP/1.1" 200 1234 "http://localhost:5173/" "Mozilla/5.0..."
```

### 日志格式

**文本格式**（开发环境）：
```
2026-02-09 20:07:37.909 [background-preinit] INFO  o.h.validator.internal.util.Version - HV000001: Hibernate Validator 8.0.3.Final
```

**JSON格式**（生产环境，便于ELK收集）：
```json
{
  "@timestamp": "2026-02-09T20:07:37.909+08:00",
  "level": "INFO",
  "logger_name": "com.backend.Application",
  "message": "Starting Application...",
  "app_name": "warehouse-management-system",
  "env": "prod",
  "traceId": "abc123",
  "userId": "admin"
}
```

## 环境配置

系统使用 **Spring Profile** 机制，通过单个配置文件 `logback-spring.xml` 管理多环境配置。

### 配置文件结构

```
logback-spring.xml
├── 通用Appender配置（所有环境共享）
│   ├── CONSOLE / CONSOLE_COLOR    # 控制台输出
│   ├── FILE_MAIN / FILE_MAIN_JSON # 主日志（文本/JSON）
│   ├── FILE_ERROR / FILE_ALERT    # 错误日志/告警日志
│   ├── FILE_BUSINESS              # 业务日志
│   ├── FILE_SQL / FILE_API        # SQL/API日志
│   └── ALERT_APPENDER             # 错误告警
│
├── dev（开发环境）                 # 彩色输出、DEBUG级别
├── test（测试环境）                # INFO级别、简化配置
├── prod（生产环境）                # JSON格式、告警机制
└── default（默认配置）             # 基础配置
```

### 开发环境

**激活方式**：默认激活（无需额外配置）

**配置位置**：`src/main/resources/logback-spring.xml` 中的 `<springProfile name="dev">`

**特点**：
- 使用相对路径 `logs/`
- 彩色控制台输出（支持ANSI颜色）
- DEBUG级别详细日志
- SQL语句完整输出（含参数）
- 便于本地调试和问题排查

**启动命令**：
```bash
mvn spring-boot:run
# 或
java -jar app.jar
```

### 测试环境

**激活方式**：`spring.profiles.active=test`

**配置位置**：`src/main/resources/logback-spring.xml` 中的 `<springProfile name="test">`

**特点**：
- 使用相对路径 `logs/`
- INFO级别日志
- 简化配置，减少日志量
- 适合自动化测试

**启动命令**：
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=test
# 或
java -Dspring.profiles.active=test -jar app.jar
```

### 生产环境

**激活方式**：`spring.profiles.active=prod`

**配置位置**：`src/main/resources/logback-spring.xml` 中的 `<springProfile name="prod">`

**特点**：
- 使用绝对路径 `D:/logs/wms`（可通过环境变量覆盖）
- JSON格式日志，便于ELK收集分析
- 结构化业务日志
- 错误自动告警（钉钉/企业微信）
- 性能监控独立日志
- WARN级别减少噪音

**启动命令**：
```bash
# 方式1：Maven命令
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# 方式2：JVM参数
java -Dspring.profiles.active=prod -jar app.jar

# 方式3：环境变量
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar

# 方式4：配置文件
# 在 application.properties 中添加：
# spring.profiles.active=prod
```

## 日志路径配置

### 默认路径

- **开发环境**：`./logs/`（应用启动目录下的logs文件夹）
- **生产环境**：`D:/logs/wms/`（绝对路径）

### 自定义路径

通过环境变量或JVM参数修改日志路径：

```bash
# Linux/Mac
export LOG_PATH=/var/log/wms

# Windows
set LOG_PATH=D:\logs\wms

# JVM参数
java -DLOG_PATH=/var/log/wms -jar app.jar
```

## 日志告警配置

### 告警方式

系统支持以下告警方式：

1. **钉钉告警** - 通过钉钉机器人发送消息
2. **企业微信告警** - 通过企业微信机器人发送消息
3. **日志文件告警** - 独立的告警日志文件

### 配置方法

在服务器环境变量中配置：

```bash
# 启用告警
export ALERT_ENABLED=true

# 钉钉机器人Webhook（从钉钉群设置中获取）
export DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx

# 企业微信机器人Webhook（从企业微信群设置中获取）
export WECHAT_WEBHOOK=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx
```

### 告警规则

- **触发条件**：发生ERROR级别日志
- **频率控制**：同一错误5分钟内只告警一次
- **告警内容**：包含时间、错误级别、类名、错误消息、异常堆栈

### 告警消息示例

钉钉消息格式：
```markdown
## 🚨 仓库管理系统异常告警

**时间:** 2026-02-09 20:15:30

**级别:** 🔴 ERROR

**服务:** com.backend.service.DeviceService

**消息:**
> 设备查询失败：数据库连接超时

**异常类型:** `java.sql.SQLException`

---
*请尽快处理此异常*
```

## 日志监控

### 自动监控

系统内置 `LogMonitor` 组件，自动执行以下监控任务：

1. **磁盘空间监控**（每5分钟）
   - 检查磁盘使用率
   - 超过80%时发送告警

2. **日志文件大小监控**（每5分钟）
   - 检查单个日志文件大小
   - 超过100MB时发送告警

3. **错误日志监控**（每5分钟）
   - 统计新增错误数量
   - 超过100条时发送告警

4. **日志清理**（每天凌晨2点）
   - 自动清理过期归档日志
   - 由Logback的maxHistory自动处理

### 监控报告示例

```
========== 日志监控报告 ==========
时间: 2026-02-09 20:20:00
日志路径: logs

日志文件统计:
  - warehouse-management-system.log: 3.42 MB
  - warehouse-management-system-business.log: 1.02 MB
  - warehouse-management-system-error.log: 0.97 MB
  - warehouse-management-system-sql.log: 0.38 MB

归档文件数量: 0
================================
```

## 日志管理API

系统提供RESTful API用于日志管理，仅管理员可访问。

### API列表

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/system/logs/statistics` | GET | 获取日志统计信息 |
| `/api/system/logs/files` | GET | 获取日志文件列表 |
| `/api/system/logs/content/{fileName}` | GET | 查看日志内容（支持分页和搜索） |
| `/api/system/logs/tail/{fileName}` | GET | 获取日志最后N行 |
| `/api/system/logs/download/{fileName}` | GET | 下载日志文件 |
| `/api/system/logs/cleanup` | POST | 清理过期日志文件 |
| `/api/system/logs/search` | GET | 跨文件搜索日志 |

### API使用示例

```bash
# 获取日志统计
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/system/logs/statistics

# 查看日志文件列表
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/system/logs/files

# 查看日志内容（分页）
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/system/logs/content/warehouse-management-system.log?page=1&pageSize=50"

# 查看日志最后100行
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/system/logs/tail/warehouse-management-system.log?lines=100"

# 搜索日志
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/system/logs/search?keyword=ERROR&filePattern=error"

# 下载日志文件
curl -H "Authorization: Bearer $TOKEN" \
  -O http://localhost:8080/api/system/logs/download/warehouse-management-system.log

# 清理7天前的归档日志
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/system/logs/cleanup?keepDays=7"
```

## 日志分析

### 常用分析命令

```bash
# 统计错误数量
grep -c "ERROR" logs/warehouse-management-system-error.log

# 查看最近的错误
tail -n 50 logs/warehouse-management-system-error.log

# 按小时统计错误
grep "ERROR" logs/warehouse-management-system.log | awk '{print $1" "$2}' | cut -d: -f1,2 | sort | uniq -c

# 查找特定异常
grep "NullPointerException" logs/warehouse-management-system-error.log

# 统计API响应时间（性能日志）
cat logs/warehouse-management-system-performance.json.log | jq -r '.message' | grep "API执行"
```

### ELK集成

生产环境的JSON格式日志可直接对接ELK（Elasticsearch + Logstash + Kibana）进行集中式日志分析。

**Logstash配置示例**：
```conf
input {
  file {
    path => "/var/log/wms/*.json.log"
    codec => json
  }
}

filter {
  date {
    match => [ "@timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "wms-logs-%{+YYYY.MM.dd}"
  }
}
```

## 最佳实践

### 1. 日志级别规范

- **TRACE**：最详细的跟踪信息，仅在调试时使用
- **DEBUG**：调试信息，开发环境开启
- **INFO**：业务操作记录，生产环境保留
- **WARN**：警告信息，需要关注但不影响运行
- **ERROR**：错误信息，需要立即处理

### 2. 日志输出规范

```java
// 推荐使用占位符，避免字符串拼接
logger.info("用户登录成功: {}, IP: {}", username, ip);

// 异常日志要包含堆栈
logger.error("数据库查询失败: {}", e.getMessage(), e);

// 业务日志添加标记
logger.info("[业务操作] 设备入库: 设备ID={}, 操作人={}", deviceId, operator);

// 性能日志
logger.info("[性能统计] API: {}, 耗时: {}ms", apiName, duration);
```

### 3. 敏感信息处理

- 禁止在日志中输出密码、Token等敏感信息
- 手机号、身份证号等脱敏处理
- 用户隐私数据加密存储

```java
// 错误示例
logger.info("用户登录: 用户名={}, 密码={}", username, password); // ❌ 禁止

// 正确示例
logger.info("用户登录: 用户名={}", username); // ✅ 正确
```

### 4. 日志轮转监控

定期检查日志轮转是否正常：
- 归档文件是否生成
- 过期文件是否清理
- 磁盘空间是否充足

### 5. 生产环境建议

- 使用SSD存储日志，提高写入性能
- 日志目录单独挂载，避免影响系统盘
- 配置日志收集代理（Filebeat/Fluentd）
- 设置日志保留策略，避免磁盘占满

## 故障排查

### 常见问题

**1. 日志文件不生成**
- 检查日志目录权限
- 检查磁盘空间
- 检查Logback配置是否正确加载

**2. 日志文件过大**
- 调整日志级别，减少DEBUG日志
- 缩短日志保留时间
- 检查是否有循环日志输出

**3. 告警不发送**
- 检查环境变量是否配置正确
- 检查网络连接
- 查看应用日志中的告警发送记录

**4. 中文乱码**
- 确保日志文件使用UTF-8编码
- 检查控制台编码设置
- 配置Logback编码器charset为UTF-8

## 附录

### 配置文件位置

- 开发环境：`src/main/resources/logback-spring.xml`
- 生产环境：`src/main/resources/logback-spring-prod.xml`
- 应用配置：`src/main/resources/application.properties`

### 相关类

- 告警Appender：`com.backend.config.AlertLogAppender`
- 日志监控：`com.backend.util.LogMonitor`
- 日志管理API：`com.backend.controller.LogMonitorController`

### 版本历史

| 版本 | 日期 | 说明 |
|-----|------|------|
| 1.0 | 2026-02-09 | 初始版本，包含完整日志配置和监控功能 |
