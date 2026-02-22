# 仓库管理系统 - 运行和日志查看指南

## 📁 日志文件位置

所有日志文件位于：`logs/`（相对于项目根目录或运行目录）

### 主要日志文件

| 日志文件 | 说明 | 用途 |
|---------|------|------|
| `spring-boot.log` | 完整的应用日志 | 包含所有级别的日志信息 |
| `error.log` | 错误日志 | 仅包含ERROR级别的日志 |

**注意**：日志文件会在应用启动时自动创建。如果应用尚未运行，logs目录可能不存在。

### Tomcat 访问日志

Tomcat 访问日志位于：`logs/tomcat/`

| 日志文件 | 说明 | 用途 |
|---------|------|------|
| `access_log.yyyy-MM-dd.log` | Tomcat访问日志 | 记录所有HTTP请求的详细信息 |

**注意**：Tomcat访问日志需要应用启动后才会生成，首次启动可能需要等待一段时间才能看到文件。

## 🚀 启动应用

### 环境说明

系统支持三种运行环境，通过 **Spring Profile** 机制切换：

| 环境 | Profile | 日志路径 | 日志级别 | 适用场景 |
|-----|---------|---------|---------|---------|
| 开发环境 | `dev`（默认） | `./logs/` | DEBUG | 本地开发调试 |
| 测试环境 | `test` | `./logs/` | INFO | 自动化测试 |
| 生产环境 | `prod` | `D:/logs/wms/` | WARN | 生产部署 |

### 方法一：使用 Maven 命令（推荐开发环境）

**开发环境启动**（默认）：
```bash
cd "d:\Warehouse management-011\spring_boot"
mvn spring-boot:run
```

**测试环境启动**：
```bash
cd "d:\Warehouse management-011\spring_boot"
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

**生产环境启动**：
```bash
cd "d:\Warehouse management-011\spring_boot"
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

**访问地址**：
- 应用API：http://localhost:8080/api
- Swagger文档：http://localhost:8080/api/swagger-ui.html

### 方法二：使用 JAR 包运行（推荐生产环境）

**步骤1：构建项目**
```bash
cd "d:\Warehouse management-011\spring_boot"
mvn clean package -DskipTests
```

**步骤2：运行应用**

**开发环境**：
```bash
java -jar target\spring_boot-0.0.1-SNAPSHOT.jar
```

**测试环境**：
```bash
java -Dspring.profiles.active=test -jar target\spring_boot-0.0.1-SNAPSHOT.jar
```

**生产环境**：
```bash
# 方式1：使用部署脚本（推荐）
cd deploy
startup.bat
# 然后选择生产环境配置

# 方式2：直接运行JAR
java -Dspring.profiles.active=prod -jar target\spring_boot-0.0.1-SNAPSHOT.jar

# 方式3：使用环境变量
set SPRING_PROFILES_ACTIVE=prod
java -jar target\spring_boot-0.0.1-SNAPSHOT.jar
```

### 方法三：使用部署脚本

```bash
cd "d:\Warehouse management-011\spring_boot\deploy"
startup.bat
```

这个脚本提供交互式菜单，支持：
1. 启动应用（选择环境）
2. 停止应用
3. 重启应用
4. 查看应用状态
5. 查看日志

### 环境切换快速参考

```bash
# 开发环境（默认）
mvn spring-boot:run

# 测试环境
mvn spring-boot:run -Dspring-boot.run.profiles=test

# 生产环境
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# 生产环境 + 自定义日志路径
mvn spring-boot:run -Dspring-boot.run.profiles=prod -DLOG_PATH=E:/logs/wms
```

## 📊 实时查看日志

### 方法一：使用 PowerShell 命令

**实时查看完整日志**：
```powershell
Get-Content "logs\spring-boot.log" -Wait -Tail 50
```

**实时查看错误日志**：
```powershell
Get-Content "logs\error.log" -Wait -Tail 50
```

**实时查看Tomcat访问日志**：
```powershell
Get-ChildItem "logs\tomcat\access_log*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Get-Content $_.FullName -Wait -Tail 50 }
```

### 方法二：使用 Maven 命令（开发环境）

当你使用 `mvn spring-boot:run` 启动应用时，所有日志会直接在控制台显示，包括：
- INFO级别的应用日志
- DEBUG级别的Hibernate SQL日志
- ERROR级别的错误日志

### 方法三：使用部署脚本的日志查看功能

```bash
cd "d:\Warehouse management-011\spring_boot\deploy"
startup.bat
```

选择菜单中的"5. 查看日志"选项，可以查看启动日志。

## 🔍 日志分析技巧

### 查找特定错误

**在错误日志中搜索关键词**：
```powershell
Select-String -Path "logs\error.log" -Pattern "Cannot find cache" -Context 2,2
```

**查看最近的错误**：
```powershell
Get-Content "logs\error.log" | Select-Object -Last 100
```

### 统计错误类型

```powershell
Get-Content "logs\error.log" | Select-String "ERROR" | Group-Object | Sort-Object Count -Descending
```

### 查看特定时间段的日志

```powershell
Get-Content "logs\spring-boot.log" | Select-String "2025-12-29 22:1"
```

### 分析Tomcat访问日志

**查看最近的访问记录**：
```powershell
Get-ChildItem "logs\tomcat\access_log*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Get-Content $_.FullName | Select-Object -Last 50 }
```

**统计访问最多的端点**：
```powershell
Get-Content "logs\tomcat\access_log*.log" | ForEach-Object { ($_ -split ' ')[6] } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10
```

## 🛠️ 故障排查

### 应用无法启动

1. **检查端口占用**：
   ```powershell
   netstat -ano | findstr :8080
   ```

2. **检查Java版本**：
   ```powershell
   java -version
   ```
   需要JDK 17或更高版本

3. **检查数据库连接**：
   - 确认MySQL服务已启动
   - 检查数据库连接配置

### 日志文件过大

日志文件会自动滚动，保留最近1天的日志（配置在logback-spring.xml中）。如需清理：
```powershell
# 删除所有历史日志文件（保留当前日志）
Get-ChildItem "logs" -Filter "*.log.*" | Remove-Item

# 清理Tomcat访问日志
Get-ChildItem "logs\tomcat" -Filter "*.log.*" | Remove-Item
```

### Tomcat访问日志未生成

如果启动应用后没有看到 `access_log` 文件，请检查：

1. **确认应用正在运行**：
   ```powershell
   netstat -ano | findstr :8080
   ```

2. **发送一些HTTP请求**：
   - 访问 http://localhost:8080/api
   - 访问 http://localhost:8080/api/swagger-ui.html

3. **检查配置文件**：
   - 确认 `application.properties` 中 `server.tomcat.accesslog.enabled=true`
   - 确认 `server.tomcat.accesslog.directory=logs/tomcat/`

4. **等待一段时间**：
   - Tomcat访问日志可能需要等待一段时间才会生成文件

### 实时日志显示乱码

确保终端使用UTF-8编码：
```powershell
chcp 65001
```

## 📝 日志配置说明

日志配置文件：`src\main\resources\logback-spring.xml`

### 日志级别

- **TRACE**：最详细的调试信息
- **DEBUG**：调试信息（开发环境推荐）
- **INFO**：一般信息（生产环境推荐）
- **WARN**：警告信息
- **ERROR**：错误信息

### 日志滚动策略

- 单个日志文件最大大小：10MB
- 保留历史日志天数：1天（配置在logback-spring.xml的maxHistory中）
- 滚动文件命名：`spring-boot.yyyy-MM-dd.log`

**注意**：日志保留策略在`application.properties`中配置为30天，但实际生效的是`logback-spring.xml`中的配置（1天）。如需修改保留天数，请修改`logback-spring.xml`文件。

### 日志文件管理

**日志文件说明**：

| 日志文件 | 大小 | 说明 |
|---------|------|------|
| `spring-boot.log` | 较大 | 包含所有日志信息，是主要的日志文件 |
| `error.log` | 较小 | 仅包含ERROR级别日志，用于快速定位错误 |

**日志清理策略**：

系统会自动清理历史日志文件，保留最近1天的日志。如需手动清理：

```powershell
# 删除所有历史日志文件（保留当前日志）
Get-ChildItem "logs" -Filter "*.log.*" | Remove-Item

# 清理Tomcat访问日志
Get-ChildItem "logs\tomcat" -Filter "*.log.*" | Remove-Item
```

**日志文件大小监控**：

定期检查日志文件大小，避免占用过多磁盘空间：

```powershell
# 查看所有日志文件大小
Get-ChildItem "logs" -Recurse -Filter "*.log" | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} | Sort-Object "Size(MB)" -Descending
```

### Tomcat访问日志配置

Tomcat访问日志配置在 `application.properties` 中：

```properties
# Tomcat访问日志配置
server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.directory=logs/tomcat/
server.tomcat.accesslog.prefix=access_log
server.tomcat.accesslog.suffix=.log
server.tomcat.accesslog.file-date-format=.yyyy-MM-dd
```

**访问日志格式说明**：

访问日志记录每个HTTP请求的详细信息，包括：
- 客户端IP地址
- 访问时间
- 请求方法和路径
- HTTP状态码
- 响应字节数
- 请求处理时间
- User-Agent信息

**访问日志分析示例**：

```powershell
# 查看最近的访问记录
Get-Content "logs\tomcat\access_log.2025-12-29.log" | Select-Object -Last 10

# 统计访问最多的端点
Get-Content "logs\tomcat\access_log.2025-12-29.log" | ForEach-Object { ($_ -split ' ')[6] } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10

# 查看访问最慢的请求
Get-Content "logs\tomcat\access_log.2025-12-29.log" | ForEach-Object { $parts = $_ -split ' '; [PSCustomObject]@{Path=$parts[6]; Time=$parts[-1]} } | Sort-Object Time -Descending | Select-Object -First 10
```

## 💡 最佳实践

1. **开发环境**：使用 `mvn spring-boot:run` 启动，实时查看所有日志
2. **生产环境**：使用JAR包启动，通过日志监控脚本查看日志
3. **故障排查**：优先查看 `error.log`，然后查看相关模块的日志
4. **性能分析**：查看 `spring-boot.log` 中的时间戳和执行时间
5. **访问分析**：使用Tomcat访问日志分析API调用情况
6. **定期清理**：定期清理历史日志文件，避免占用过多磁盘空间

## 📞 获取帮助

如遇到问题，请查看：
1. 错误日志：`logs\error.log`
2. 完整日志：`logs\spring-boot.log`
3. Tomcat访问日志：`logs\tomcat\access_log.yyyy-MM-dd.log`

---

**文档版本**：3.0
**更新时间**：2026-01-03
**更新内容**：
- 修正日志文件路径为相对路径
- 更新启动脚本路径为deploy目录
- 修正日志保留策略为1天（与logback-spring.xml一致）
- 移除不存在的日志文件引用（device.log、stock.log、security.log、db-initialization.log）
- 更新日志查看方法，移除不存在的watch-logs.bat脚本
- 添加部署脚本的日志查看功能说明
