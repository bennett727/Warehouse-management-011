# 仓库管理系统 - 生产环境部署指南

## 📋 部署前准备

### 1. 服务器要求

| 组件 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 磁盘 | 50GB | 100GB+ SSD |
| 操作系统 | CentOS 7+/Ubuntu 18.04+ | CentOS 8/Ubuntu 20.04 LTS |

### 2. 软件环境

- **JDK**: OpenJDK 17
- **MySQL**: 8.0+
- **Nginx**: 1.18+
- **Node.js**: 18+ (构建前端)
- **Maven**: 3.8+ (构建后端)

### 3. 网络要求

- 开放端口：80, 443, 8080 (内部)
- 域名解析已配置
- SSL证书已准备

---

## 🚀 部署方式一：手动部署

### 步骤1：环境准备

```bash
# 1. 创建应用目录
sudo mkdir -p /opt/wms
sudo mkdir -p /opt/wms/logs
sudo mkdir -p /opt/wms/uploads
sudo mkdir -p /opt/wms/backup

# 2. 设置目录权限
sudo chown -R $USER:$USER /opt/wms

# 3. 安装依赖（以CentOS为例）
# JDK 17
sudo yum install -y java-17-openjdk-devel

# Nginx
sudo yum install -y nginx

# MySQL 8.0
sudo rpm -Uvh https://repo.mysql.com/mysql80-community-release-el7.rpm
sudo yum install -y mysql-community-server
sudo systemctl enable mysqld
sudo systemctl start mysqld
```

### 步骤2：数据库初始化

```bash
# 1. 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 2. 登录并修改密码
mysql -u root -p

# 3. 执行以下SQL
CREATE DATABASE IF NOT EXISTS warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wms_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON warehouse.* TO 'wms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 步骤3：后端部署

```bash
# 1. 进入后端目录
cd /opt/wms/spring_boot

# 2. 创建生产环境配置文件
mkdir -p config
cat > config/application-prod.properties << 'EOF'
# 生产环境配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# 连接池配置
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.max-lifetime=1200000

# JPA配置
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT配置
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS配置
cors.allowed-origins=${CORS_ALLOWED_ORIGINS}
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=Authorization,Content-Type,X-Requested-With,Accept,Origin
cors.allow-credentials=true
cors.max-age=3600

# 日志配置
logging.file.path=/opt/wms/logs
logging.level.root=WARN
logging.level.com.backend=INFO
logging.level.org.hibernate.SQL=OFF

# 文件上传
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=100MB

# 禁用数据初始化
app.data.initialize=false
EOF

# 3. 构建应用
mvn clean package -DskipTests -P prod

# 4. 创建启动脚本
cat > start.sh << 'EOF'
#!/bin/bash
export DB_URL="jdbc:mysql://localhost:3306/warehouse?useSSL=true&serverTimezone=Asia/Shanghai"
export DB_USERNAME="wms_user"
export DB_PASSWORD="YourSecurePassword123!"
export JWT_SECRET="$(openssl rand -base64 64)"
export CORS_ALLOWED_ORIGINS="https://your-domain.com"
export DDL_AUTO="validate"

java -jar target/spring_boot-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.config.additional-location=file:config/
EOF

chmod +x start.sh
```

### 步骤4：前端部署

```bash
# 1. 进入前端目录
cd /opt/wms/frontend

# 2. 安装依赖
npm ci

# 3. 构建生产版本
npm run build

# 4. 复制到Nginx目录
sudo cp -r dist/* /usr/share/nginx/html/
```

### 步骤5：Nginx配置

```bash
# 创建Nginx配置文件
sudo tee /etc/nginx/conf.d/wms.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 步骤6：系统服务配置

```bash
# 创建Systemd服务
sudo tee /etc/systemd/system/wms.service << 'EOF'
[Unit]
Description=Warehouse Management System
After=syslog.target network.target mysqld.service

[Service]
User=wms
Group=wms
WorkingDirectory=/opt/wms/spring_boot
Environment="DB_URL=jdbc:mysql://localhost:3306/warehouse?useSSL=true&serverTimezone=Asia/Shanghai"
Environment="DB_USERNAME=wms_user"
Environment="DB_PASSWORD=YourSecurePassword123!"
Environment="JWT_SECRET=your-generated-jwt-secret"
Environment="CORS_ALLOWED_ORIGINS=https://your-domain.com"
Environment="DDL_AUTO=validate"
ExecStart=/usr/bin/java -jar /opt/wms/spring_boot/target/spring_boot-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 创建wms用户
sudo useradd -r -s /bin/false wms
sudo chown -R wms:wms /opt/wms

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable wms
sudo systemctl start wms
```

---

## 🐳 部署方式二：Docker部署

### 步骤1：安装Docker

```bash
# CentOS
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 步骤2：创建Docker Compose配置

```bash
mkdir -p /opt/wms-docker
cd /opt/wms-docker

# 创建docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: wms-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: warehouse
      MYSQL_USER: wms_user
      MYSQL_PASSWORD: wms_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - wms-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./spring_boot
      dockerfile: Dockerfile
    container_name: wms-backend
    environment:
      DB_URL: jdbc:mysql://wms-mysql:3306/warehouse?useSSL=false&serverTimezone=Asia/Shanghai
      DB_USERNAME: wms_user
      DB_PASSWORD: wms_password
      JWT_SECRET: ${JWT_SECRET}
      CORS_ALLOWED_ORIGINS: http://localhost
      DDL_AUTO: validate
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - wms-network
    restart: always

  frontend:
    image: nginx:alpine
    container_name: wms-frontend
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - wms-network
    restart: always

volumes:
  mysql_data:

networks:
  wms-network:
    driver: bridge
EOF
```

### 步骤3：启动服务

```bash
# 生成JWT密钥
export JWT_SECRET=$(openssl rand -base64 64)

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## ✅ 部署验证

### 1. 健康检查

```bash
# 后端健康检查
curl http://localhost:8080/api/health

# 预期响应
{
  "success": true,
  "code": 200,
  "message": "系统正常",
  "data": {
    "service": "warehouse-management-system",
    "status": "UP"
  }
}
```

### 2. 前端访问

打开浏览器访问：`https://your-domain.com`

### 3. 登录测试

使用默认管理员账号登录：
- 用户名：`admin`
- 密码：`admin123` (生产环境请立即修改)

---

## 🔒 安全加固

### 1. 修改默认密码

首次登录后，立即修改管理员密码。

### 2. 配置防火墙

```bash
# 仅开放必要端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 定期备份

```bash
# 数据库备份脚本
cat > /opt/wms/backup/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u wms_user -p'YourSecurePassword123!' warehouse > /opt/wms/backup/warehouse_$DATE.sql
find /opt/wms/backup -name "warehouse_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/wms/backup/backup.sh

# 添加定时任务
echo "0 2 * * * /opt/wms/backup/backup.sh" | sudo crontab -
```

---

## 🐛 常见问题

### Q1: 后端启动失败

**检查日志：**
```bash
sudo journalctl -u wms -f
```

**常见原因：**
- 数据库连接失败
- 端口被占用
- 环境变量未设置

### Q2: 前端无法访问API

**检查：**
1. Nginx配置是否正确
2. 后端服务是否运行
3. CORS配置是否正确

### Q3: 数据库连接失败

**检查：**
1. MySQL是否运行：`sudo systemctl status mysqld`
2. 用户名密码是否正确
3. 数据库是否存在

---

## 📞 技术支持

如有问题，请检查日志或联系技术支持。
