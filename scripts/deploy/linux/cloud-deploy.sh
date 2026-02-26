#!/bin/bash
# =============================================================================
# 仓库管理系统 - 云服务器一键部署脚本
# 支持：阿里云、腾讯云、华为云、AWS、Azure
# =============================================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 配置（可以修改这些值）
APP_NAME="wms"
APP_DIR="/opt/wms"
DB_NAME="warehouse"
DB_USER="wms_user"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 12)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 64)}"
DOMAIN="${DOMAIN:-$(curl -s ifconfig.me)}"  # 自动获取公网IP

log_info "========================================"
log_info "  仓库管理系统 - 云服务器部署"
log_info "========================================"
log_info ""
log_info "应用目录: $APP_DIR"
log_info "数据库密码: $DB_PASSWORD"
log_info "访问地址: http://$DOMAIN"
log_info ""

# 检查root权限
if [[ $EUID -ne 0 ]]; then
   log_error "请使用 sudo 运行此脚本"
   exit 1
fi

# 检测操作系统
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$ID
else
    log_error "无法检测操作系统"
    exit 1
fi

log_info "检测到操作系统: $OS"

# =============================================================================
# 步骤1: 安装依赖
# =============================================================================
log_step "步骤 1/6: 安装系统依赖..."

install_packages() {
    if [[ $OS == "ubuntu" ]] || [[ $OS == "debian" ]]; then
        apt-get update -qq
        apt-get install -y -qq curl wget git nginx mysql-server openjdk-17-jdk maven nodejs npm
    elif [[ $OS == "centos" ]] || [[ $OS == "rhel" ]] || [[ $OS == "fedora" ]]; then
        yum update -y -q
        yum install -y -q curl wget git nginx java-17-openjdk-devel maven nodejs npm
        # CentOS需要单独安装MySQL
        if ! command -v mysql &> /dev/null; then
            rpm -Uvh https://repo.mysql.com/mysql80-community-release-el7.rpm 2>/dev/null || true
            yum install -y -q mysql-community-server
        fi
    else
        log_error "不支持的操作系统: $OS"
        exit 1
    fi
}

install_packages

# 验证安装
java -version 2>&1 | head -1
mvn -version 2>&1 | head -1
node --version

log_info "依赖安装完成"

# =============================================================================
# 步骤2: 配置MySQL
# =============================================================================
log_step "步骤 2/6: 配置数据库..."

# 启动MySQL
if [[ $OS == "ubuntu" ]] || [[ $OS == "debian" ]]; then
    systemctl start mysql
    systemctl enable mysql
else
    systemctl start mysqld
    systemctl enable mysqld
fi

# 等待MySQL启动
sleep 3

# 创建数据库和用户
mysql -u root << EOF 2>/dev/null || mysql -u root -p"" << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

log_info "数据库配置完成"

# =============================================================================
# 步骤3: 准备应用目录
# =============================================================================
log_step "步骤 3/6: 准备应用目录..."

mkdir -p $APP_DIR/{logs,uploads,backup}

# 创建专用用户
if ! id -u wms &>/dev/null; then
    useradd -r -s /bin/false wms
fi

# 如果代码已经在当前目录，复制到目标目录
if [[ -d "spring_boot" ]] && [[ -d "frontend" ]]; then
    log_info "发现本地代码，复制到 $APP_DIR"
    cp -r spring_boot frontend $APP_DIR/
else
    log_warn "请将代码上传到 $APP_DIR 目录后再运行此脚本"
    log_info "上传命令示例:"
    log_info "  scp -r spring_boot frontend root@$DOMAIN:$APP_DIR/"
fi

chown -R wms:wms $APP_DIR

# =============================================================================
# 步骤4: 构建应用
# =============================================================================
log_step "步骤 4/6: 构建应用..."

if [[ -d "$APP_DIR/spring_boot" ]]; then
    cd $APP_DIR/spring_boot
    
    # 创建生产配置
    mkdir -p config
    cat > config/application-prod.properties << EOF
server.port=8080
server.servlet.context-path=/api
spring.datasource.url=jdbc:mysql://localhost:3306/$DB_NAME?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=$DB_USER
spring.datasource.password=$DB_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.hikari.maximum-pool-size=20
spring.jpa.hibernate.ddl-auto=update
jwt.secret=$JWT_SECRET
jwt.expiration=86400000
cors.allowed-origins=http://$DOMAIN,http://localhost
logging.file.path=$APP_DIR/logs
logging.level.root=WARN
logging.level.com.backend=INFO
EOF

    log_info "构建后端..."
    mvn clean package -DskipTests -q
    log_info "后端构建完成"
fi

if [[ -d "$APP_DIR/frontend" ]]; then
    cd $APP_DIR/frontend
    log_info "构建前端..."
    npm ci --silent
    npm run build 2>&1 | tail -5
    log_info "前端构建完成"
fi

# =============================================================================
# 步骤5: 配置Nginx
# =============================================================================
log_step "步骤 5/6: 配置Nginx..."

cat > /etc/nginx/sites-available/wms << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 100M;
    
    location / {
        root /opt/wms/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 启用配置
if [[ $OS == "ubuntu" ]] || [[ $OS == "debian" ]]; then
    ln -sf /etc/nginx/sites-available/wms /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
else
    cat > /etc/nginx/conf.d/wms.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 100M;
    
    location / {
        root /opt/wms/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
fi

nginx -t && systemctl restart nginx
systemctl enable nginx

log_info "Nginx配置完成"

# =============================================================================
# 步骤6: 创建系统服务
# =============================================================================
log_step "步骤 6/6: 创建系统服务..."

cat > /etc/systemd/system/wms.service << EOF
[Unit]
Description=Warehouse Management System
After=network.target mysql.service

[Service]
Type=simple
User=wms
Group=wms
WorkingDirectory=$APP_DIR/spring_boot
Environment="DB_URL=jdbc:mysql://localhost:3306/$DB_NAME?useSSL=false&serverTimezone=Asia/Shanghai"
Environment="DB_USERNAME=$DB_USER"
Environment="DB_PASSWORD=$DB_PASSWORD"
Environment="JWT_SECRET=$JWT_SECRET"
Environment="CORS_ALLOWED_ORIGINS=http://$DOMAIN"
Environment="DDL_AUTO=update"
ExecStart=/usr/bin/java -jar $APP_DIR/spring_boot/target/spring_boot-0.0.1-SNAPSHOT.jar --spring.profiles.active=default --spring.config.additional-location=file:$APP_DIR/spring_boot/config/
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable wms

# =============================================================================
# 启动服务
# =============================================================================
log_info "启动服务..."
systemctl start wms

# 等待启动
sleep 15

# 验证
curl -s http://localhost:8080/api/health > /dev/null && log_info "后端服务运行正常" || log_warn "后端服务启动中..."

# =============================================================================
# 完成
# =============================================================================
echo ""
log_info "========================================"
log_info "  部署完成！"
log_info "========================================"
echo ""
log_info "访问地址: http://$DOMAIN"
log_info "API地址: http://$DOMAIN/api"
log_info ""
log_info "数据库信息:"
log_info "  数据库名: $DB_NAME"
log_info "  用户名: $DB_USER"
log_info "  密码: $DB_PASSWORD"
log_info ""
log_info "默认账号:"
log_info "  用户名: admin"
log_info "  密码: admin123"
log_info ""
log_warn "请立即修改默认密码！"
log_info ""
log_info "常用命令:"
log_info "  查看日志: sudo journalctl -u wms -f"
log_info "  重启服务: sudo systemctl restart wms"
log_info "  停止服务: sudo systemctl stop wms"
log_info "========================================"
