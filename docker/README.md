# Docker 部署配置

本目录包含Docker部署相关的配置文件。

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | Docker Compose主配置文件（生产环境） |
| `docker-compose.staging.yml` | 预生产环境配置 |
| `nginx.conf` | Nginx反向代理配置 |

---

## 🚀 快速开始

### 方案A: 使用Windows一键部署脚本（推荐）

```bash
# 双击运行
scripts\deploy\windows\一键部署.bat
```

### 方案B: 手动使用Docker Compose

```bash
# 1. 构建并启动所有服务
docker-compose up --build -d

# 2. 查看日志
docker-compose logs -f

# 3. 停止服务
docker-compose down
```

---

## 📋 服务架构

```
┌─────────────────────────────────────────┐
│              Nginx (前端)                │
│         端口: 80 (映射到主机)             │
│    静态资源 + API反向代理                 │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Spring Boot (后端)               │
│         端口: 8080 (内部)                │
│         上下文路径: /api                 │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          MySQL 8.0 (数据库)              │
│         端口: 3306 (映射到主机)           │
│         数据库: warehouse                │
└─────────────────────────────────────────┘
```

---

## ⚙️ 配置说明

### docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123      # root密码
      MYSQL_DATABASE: warehouse          # 默认数据库
      MYSQL_USER: wms                    # 应用用户
      MYSQL_PASSWORD: wms123             # 应用密码
    ports:
      - "3306:3306"                     # 映射到主机3306端口
    volumes:
      - mysql_data:/var/lib/mysql       # 数据持久化

  backend:
    build:
      context: ../spring_boot           # 后端代码目录
      dockerfile: Dockerfile
    environment:
      DB_URL: jdbc:mysql://mysql:3306/warehouse
      DB_USERNAME: wms
      DB_PASSWORD: wms123
      JWT_SECRET: ...                   # JWT密钥
    ports:
      - "8080:8080"
    depends_on:
      - mysql

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"                        # 映射到主机80端口
    volumes:
      - ../frontend/dist:/usr/share/nginx/html  # 前端构建产物
      - ./nginx.conf:/etc/nginx/conf.d/default.conf  # Nginx配置
    depends_on:
      - backend
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;  # 支持Vue Router History模式
    }

    # API反向代理
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 常用命令

### 基础操作

```bash
# 启动服务（后台运行）
docker-compose up -d

# 启动服务（前台运行，查看日志）
docker-compose up

# 停止服务
docker-compose down

# 停止并删除数据卷（清理所有数据）
docker-compose down -v

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 实时跟踪日志
docker-compose logs -f

# 查看指定服务日志
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend
```

### 数据管理

```bash
# 备份数据库
docker exec wms-mysql mysqldump -u wms -pwms123 warehouse > backup.sql

# 恢复数据库
docker exec -i wms-mysql mysql -u wms -pwms123 warehouse < backup.sql

# 进入MySQL容器
docker exec -it wms-mysql mysql -u wms -p

# 进入后端容器
docker exec -it wms-backend /bin/sh
```

---

## 🔒 安全配置

### 生产环境修改项

1. **修改默认密码**
   ```yaml
   environment:
     MYSQL_ROOT_PASSWORD: YourStrongRootPassword
     MYSQL_PASSWORD: YourStrongAppPassword
   ```

2. **修改JWT密钥**
   ```bash
   # 生成新密钥
   openssl rand -base64 64
   
   # 更新docker-compose.yml中的JWT_SECRET
   ```

3. **限制端口访问**
   ```yaml
   # 只暴露必要的端口
   ports:
     - "80:80"      # 只暴露HTTP端口
   # - "3306:3306"  # 不暴露MySQL端口到公网
   # - "8080:8080"  # 不暴露后端端口到公网
   ```

---

## 🐛 故障排查

### 问题1: 端口被占用

**错误信息**: `bind: address already in use`

**解决**:
```bash
# 查看占用端口的进程
netstat -ano | findstr :80

# 停止占用进程，或修改docker-compose.yml中的端口映射
# 例如: "8080:80" 改为 "8888:80"
```

### 问题2: 数据库连接失败

**错误信息**: `Communications link failure`

**解决**:
```bash
# 1. 检查MySQL容器状态
docker-compose ps

# 2. 查看MySQL日志
docker-compose logs mysql

# 3. 重启服务
docker-compose restart mysql
```

### 问题3: 前端页面空白

**解决**:
```bash
# 1. 检查前端是否构建成功
ls -la frontend/dist/

# 2. 重新构建前端
cd frontend && npm run build

# 3. 重启容器
docker-compose restart frontend
```

### 问题4: 权限错误

**错误信息**: `Permission denied`

**解决**:
```bash
# Windows: 以管理员身份运行PowerShell或CMD
# Linux/Mac: 使用sudo
sudo docker-compose up -d
```

---

## 📊 性能优化

### 调整MySQL内存

```yaml
services:
  mysql:
    command: >
      --default-authentication-plugin=mysql_native_password
      --innodb-buffer-pool-size=1G
      --max-connections=200
```

### 调整JVM内存

```yaml
services:
  backend:
    environment:
      JAVA_OPTS: "-Xms512m -Xmx2g"
```

---

## 📚 参考文档

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [部署方案选择指南](../docs/deployment/部署方案选择指南.md)
- [生产环境部署指南](../docs/deployment/production-deployment-guide.md)

---

**最后更新**: 2026-02-25
