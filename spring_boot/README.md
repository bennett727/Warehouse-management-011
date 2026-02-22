# Spring Boot 后端项目

## 快速开始

### 环境要求

- Java 17 或 Java 21
- Maven 3.6+
- MySQL 8.0+ (生产环境) / H2 (开发/测试环境)

### 环境配置

1. 复制环境配置示例文件:
```bash
cp .env.example .env
```

2. 根据实际情况修改 `.env` 文件中的配置:
```env
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot
MAVEN_OPTS=-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
```

### 数据库初始化

首次启动项目前，需要执行数据库初始化脚本。请按照以下顺序执行 `scripts/sql/` 目录下的 SQL 脚本：

```bash
# 1. 创建数据库和基础表结构
mysql -u root -p < scripts/sql/init_database.sql

# 2. 初始化设备类型数据
mysql -u root -p < scripts/sql/init_device_type.sql

# 3. 初始化库存管理相关数据
mysql -u root -p < scripts/sql/init_stock_management.sql

# 4. 初始化默认管理员账户
mysql -u root -p < scripts/sql/init_default_admin.sql

# 5. 初始化设备状态转换规则
mysql -u root -p < scripts/sql/init_device_status_rules.sql
```

**注意事项**：
- 请根据实际环境修改数据库连接参数（用户名、密码、数据库名）
- 建议在执行前备份现有数据库
- 脚本执行顺序必须严格遵守，否则可能因外键约束导致失败

### 启动项目

#### Windows (批处理脚本)

```bash
# 构建项目
start.bat build

# 运行项目 (需要先构建)
start.bat run

# 开发模式运行
start.bat dev

# 清理构建产物
start.bat clean
```

#### Windows (PowerShell)

```powershell
# 构建项目
.\start.ps1 build

# 运行项目 (需要先构建)
.\start.ps1 run

# 开发模式运行
.\start.ps1 dev

# 清理构建产物
.\start.ps1 clean
```

### 项目结构

```
spring_boot/
├── src/
│   ├── main/
│   │   ├── java/com/backend/
│   │   │   ├── aspect/           # AOP切面
│   │   │   ├── common/           # 公共类
│   │   │   ├── config/           # 配置类
│   │   │   ├── controller/       # 控制器层
│   │   │   ├── domain/           # 领域模型
│   │   │   ├── dto/              # 数据传输对象
│   │   │   ├── entity/           # 实体类
│   │   │   ├── exception/        # 异常类
│   │   │   ├── payload/          # 请求/响应对象
│   │   │   ├── repository/       # 数据访问层
│   │   │   ├── schedule/         # 定时任务
│   │   │   ├── security/         # 安全配置
│   │   │   ├── service/          # 业务逻辑层
│   │   │   └── util/             # 工具类
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── application-test.properties
│   └── test/                     # 测试代码
├── docs/                         # 项目文档
├── scripts/                      # 脚本工具
│   ├── sql/                      # SQL脚本
│   │   ├── init_database.sql      # 数据库和表结构初始化
│   │   ├── init_device_type.sql   # 设备类型数据初始化
│   │   ├── init_stock_management.sql  # 库存管理数据初始化
│   │   ├── init_default_admin.sql  # 默认管理员账户初始化
│   │   └── init_device_status_rules.sql  # 设备状态转换规则初始化
│   ├── launch/                   # 启动脚本
│   │   ├── start.bat            # Windows批处理启动脚本
│   │   └── start.ps1            # PowerShell启动脚本
│   └── tools/                    # 工具脚本
├── tests/                        # 测试脚本
├── .env                          # 环境配置 (不提交到Git)
├── .env.example                  # 环境配置示例
├── .gitignore                    # Git忽略配置
├── .gitattributes                # Git属性配置
├── pom.xml                       # Maven配置
├── mvnw                          # Maven Wrapper（Unix/Linux）
└── mvnw.cmd                      # Maven Wrapper（Windows）
```

### 常用命令

```bash
# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包项目
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests

# 运行Spring Boot应用
mvn spring-boot:run

# 清理构建产物
mvn clean
```

### API文档

启动项目后，访问 Swagger API 文档:
- 开发环境: http://localhost:8080/api/swagger-ui.html
- 生产环境: http://localhost:8080/api/swagger-ui.html

### 注意事项

1. **环境配置**: `.env` 文件包含敏感信息，不应提交到版本控制系统
2. **端口配置**: 默认端口为 8080，可在 `.env` 文件中修改 `SERVER_PORT`
3. **Spring Profile**: 默认使用 `dev` 配置，可在 `.env` 文件中修改 `SPRING_PROFILES_ACTIVE`
4. **Java版本**: 项目支持 Java 17 和 Java 21，请在 `.env` 文件中正确配置 `JAVA_HOME`

### 故障排除

#### 找不到JAVA_HOME
确保 `.env` 文件中 `JAVA_HOME` 路径正确，并且该路径下存在 `bin/java.exe`

#### 端口被占用
修改 `.env` 文件中的 `SERVER_PORT` 配置

#### Maven依赖下载失败
检查网络连接，或配置Maven镜像源

### 开发规范

详见项目规则文档: [.trae/rules/project_rules.md](../.trae/rules/project_rules.md)
