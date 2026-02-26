# 仓库管理系统 - 生产环境部署清单

**文档版本**: 1.0  
**更新日期**: 2026-02-25  
**适用场景**: 生产环境首次部署

---

## 🚀 快速部署步骤（Windows本地/服务器）

### 方案A：Docker部署（推荐，最简单）

#### 步骤1：配置环境变量
```powershell
# 复制配置文件
copy spring_boot\config\.env.production spring_boot\.env

# 编辑配置文件，修改以下关键配置
notepad spring_boot\.env
```

**必须修改的配置**：
- `DB_PASSWORD` - 数据库密码
- `JWT_SECRET` - JWT密钥（至少64个字符）
- `CORS_ALLOWED_ORIGINS` - 允许的域名

#### 步骤2：运行一键部署脚本
```powershell
# 双击运行
scripts\deploy\windows\一键部署.bat
```

#### 步骤3：访问系统
- 打开浏览器访问：http://localhost
- 默认账号：admin / admin123

---

### 方案B：本地运行（使用现有环境）

#### 步骤1：准备数据库
```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（建议不使用root）
CREATE USER 'wms_user'@'localhost' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON warehouse.* TO 'wms_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 步骤2：配置后端
```powershell
# 1. 复制生产环境配置
copy spring_boot\config\.env.production spring_boot\.env

# 2. 编辑配置，修改数据库密码和JWT密钥
notepad spring_boot\.env

# 3. 启动后端
cd spring_boot
mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

#### 步骤3：配置前端
```powershell
# 前端配置已自动完成，直接构建
cd frontend
npm run build

# 使用Nginx或其他静态服务器托管 dist 目录
```

---

## ⚙️ 配置文件说明

### 前端配置（已自动配置）
**文件**: `frontend\config\env\.env.production`

| 配置项 | 值 | 说明 |
|--------|-----|------|
| VITE_STORAGE_KEY | ✅ 已生成 | 本地存储加密密钥 |
| VITE_SOURCE_MAP_ENABLED | false | 关闭Source Map |
| VITE_AMAP_KEY | 空 | 高德地图（可选） |

### 后端配置（需要修改）
**文件**: `spring_boot\config\.env.production`

| 配置项 | 当前值 | 必须修改 |
|--------|--------|----------|
| DB_PASSWORD | change_this_password_in_production | ✅ 是 |
| JWT_SECRET | change_this_jwt_secret... | ✅ 是 |
| CORS_ALLOWED_ORIGINS | http://localhost | ✅ 是 |

---

## 🔐 安全加固步骤

### 1. 生成强密码
```powershell
# 数据库密码（24字节）
powershell -Command "[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))"

# JWT密钥（64字节）
powershell -Command "[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))"
```

### 2. 修改后端配置
编辑 `spring_boot\.env`：
```properties
# 数据库密码
DB_PASSWORD=你生成的强密码

# JWT密钥（至少64个字符）
JWT_SECRET=你生成的JWT密钥

# 允许的域名（多个用逗号分隔）
CORS_ALLOWED_ORIGINS=http://localhost,http://你的IP
```

### 3. 修改默认管理员密码
首次登录后，立即修改默认密码：
- 用户名：admin
- 默认密码：admin123
- 修改路径：系统设置 → 用户管理 → 修改密码

---

## ✅ 部署检查清单

### 部署前检查
- [ ] 已安装 Docker Desktop（方案A）或 JDK 17 + MySQL（方案B）
- [ ] 已修改数据库密码
- [ ] 已修改JWT密钥
- [ ] 已配置CORS允许域名
- [ ] 数据库已创建且可连接

### 部署后检查
- [ ] 后端服务正常启动（端口8080）
- [ ] 前端可以正常访问
- [ ] 可以正常登录
- [ ] 设备管理功能正常
- [ ] 库存管理功能正常

### 安全检查
- [ ] 已修改默认管理员密码
- [ ] 数据库密码强度足够
- [ ] JWT密钥长度至少64字符
- [ ] 日志级别设置为WARN或ERROR

---

## 🛠️ 常见问题

### 问题1：后端启动失败，提示数据库连接错误
**解决**：
1. 检查MySQL是否运行
2. 检查数据库用户名密码是否正确
3. 检查数据库 `warehouse` 是否已创建

### 问题2：前端无法连接后端API
**解决**：
1. 检查后端是否启动（端口8080）
2. 检查CORS配置是否包含前端域名
3. 检查防火墙是否放行8080端口

### 问题3：登录失败，提示认证错误
**解决**：
1. 检查JWT密钥是否已修改（不能是默认值）
2. 检查数据库中是否有默认用户数据
3. 清除浏览器缓存后重试

---

## 📞 技术支持

如遇到问题，请检查：
1. 后端日志：`spring_boot/logs/`
2. 前端控制台（F12）
3. Docker日志：`docker-compose logs`

---

**部署完成后，请立即修改默认密码！**
