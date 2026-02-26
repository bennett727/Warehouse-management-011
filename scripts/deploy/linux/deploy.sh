#!/bin/bash
# =============================================================================
# 仓库管理系统 - 生产环境自动化部署脚本
# =============================================================================
# 使用方法：
#   1. 设置环境变量（或在脚本中修改默认值）
#   2. 运行脚本：sudo ./deploy.sh
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量（请根据实际情况修改）
APP_NAME="wms"
APP_DIR="/opt/wms"
DB_NAME="warehouse"
DB_USER="wms_user"
DB_PASSWORD="${DB_PASSWORD:-YourSecurePassword123!}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 64)}"
DOMAIN="${DOMAIN:-your-domain.com}"
CORS_ORIGINS="${CORS_ORIGINS:-https://$DOMAIN}"

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
   log_error "请使用 sudo 运行此脚本"
   exit 1
fi

log_info "开始部署仓库管理系统..."
log_info "应用目录: $APP_DIR"
log_info "域名: $DOMAIN"

# =============================================================================
# 步骤1：系统环境检查
# =============================================================================
log_info "步骤1/8: 检查系统环境..."

# 检查操作系统
if [[ -f /etc/redhat-release ]]; then
    OS="centos"
    PKG_MANAGER="yum"
elif [[ -f /etc/lsb-release ]]; then
    OS="ubuntu"
    PKG_MANAGER="apt-get"
else
    log_error "不支持的操作系统"
    exit 1
fi

log_info "检测到操作系统: $OS"

# =============================================================================
# 步骤2：安装依赖
# =============================================================================
log_info "步骤2/8: 安装系统依赖..."

if [[ $OS == "centos" ]]; then
    # CentOS
    yum update -y
    yum install -y curl wget vim nginx git
    
    # 安装JDK 17
    if ! command -v java &> /dev/null; then
        log_info "安装 OpenJDK 17..."
        yum install -y java-17-openjdk-devel
    fi
    
    # 安装MySQL
    if ! command -v mysql &> /dev/null; then
        log_info "安装 MySQL 8.0..."
        rpm -Uvh https://repo.mysql.com/mysql80-community-release-el7.rpm || true
        yum install -y mysql-community-server
        systemctl enable mysqld
        systemctl start mysqld
    fi
    
    # 安装Maven
    if ! command -v mvn &> /dev/null; then
        log_info "安装 Maven..."
        yum install -y maven
    fi
    
    # 安装Node.js
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js 18..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    fi
    
else
    # Ubuntu
    apt-get update
    apt-get install -y curl wget vim nginx git
    
    # 安装JDK 17
    if ! command -v java &> /dev/null; then
        log_info "安装 OpenJDK 17..."
        apt-get install -y openjdk-17-jdk
    fi
    
    # 安装MySQL
    if ! command -v mysql &> /dev/null; then
        log_info "安装 MySQL 8.0..."
        apt-get install -y mysql-server
        systemctl enable mysql
        systemctl start mysql
    fi
    
    # 安装Maven
    if ! command -v mvn &> /dev/null; then
        log_info "安装 Maven..."
        apt-get install -y maven
    fi
    
    # 安装Node.js
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
fi

# 验证安装
java -version
mvn -version
node -v
npm -v

# =============================================================================
# 步骤3：创建应用目录
# =============================================================================
log_info "步骤3/8: 创建应用目录..."

mkdir -p $APP_DIR/{logs,uploads,backup,config}
mkdir -p /var/log/wms

# 创建用户
if ! id -u wms &>/dev/null; then
    useradd -r -s /bin/false wms
fi

chown -R wms:wms $APP_DIR

# =============================================================================
# 步骤4：初始化数据库
# =============================================================================
log_info "步骤4/8: 初始化数据库..."

# 等待MySQL启动
sleep 5

# 检查数据库是否存在
if mysql -u root -e "USE $DB_NAME;" 2>/dev/null; then
    log_warn "数据库 $DB_NAME 已存在，跳过创建"
else
    log_info "创建数据库 $DB_NAME..."
    mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    log_info "数据库创建完成"
fi

# =============================================================================
# 步骤5：构建后端
# =============================================================================
log_info "步骤5/8: 构建后端应用..."

cd $APP_DIR/spring_boot

# 创建生产环境配置文件
mkdir -p config
cat > config/application-prod.properties << EOF
# 生产环境配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/$DB_NAME?useSSL=true&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=$DB_USER
spring.datasource.password=$DB_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# 连接池配置
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=20
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.connection-timeout=30000

# JPA配置
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# JWT配置
jwt.secret=$JWT_SECRET
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS配置
cors.allowed-origins=$CORS_ORIGINS

# 日志配置
logging.file.path=$APP_DIR/logs
logging.level.root=WARN
logging.level.com.backend=INFO

# 禁用数据初始化
app.data.initialize=false
EOF

# 构建应用
log_info "执行 Maven 构建..."
mvn clean package -DskipTests -P prod

# =============================================================================
# 步骤6：构建前端
# =============================================================================
log_info "步骤6/8: 构建前端应用..."

cd $APP_DIR/frontend

# 安装依赖
npm ci

# 构建生产版本
npm run build

# 复制到Nginx目录
cp -r dist/* /usr/share/nginx/html/

# =============================================================================
# 步骤7：配置Nginx
# =============================================================================
log_info "步骤7/8: 配置 Nginx..."

cat > /etc/nginx/conf.d/wms.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# =============================================================================
# 步骤8：配置系统服务
# =============================================================================
log_info "步骤8/8: 配置系统服务..."

cat > /etc/systemd/system/wms.service << EOF
[Unit]
Description=Warehouse Management System
After=syslog.target network.target mysqld.service

[Service]
User=wms
Group=wms
WorkingDirectory=$APP_DIR/spring_boot
Environment="DB_URL=jdbc:mysql://localhost:3306/$DB_NAME?useSSL=true&serverTimezone=Asia/Shanghai"
Environment="DB_USERNAME=$DB_USER"
Environment="DB_PASSWORD=$DB_PASSWORD"
Environment="JWT_SECRET=$JWT_SECRET"
Environment="CORS_ALLOWED_ORIGINS=$CORS_ORIGINS"
Environment="DDL_AUTO=validate"
ExecStart=/usr/bin/java -jar $APP_DIR/spring_boot/target/spring_boot-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --spring.config.additional-location=file:$APP_DIR/spring_boot/config/
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
systemctl daemon-reload
systemctl enable wms

# 启动服务
log_info "启动 WMS 服务..."
systemctl start wms

# 等待服务启动
sleep 10

# =============================================================================
# 部署验证
# =============================================================================
log_info "验证部署..."

# 检查后端健康状态
if curl -s http://localhost:8080/api/health | grep -q '"status":"UP"'; then
    log_info "后端服务运行正常"
else
    log_error "后端服务启动失败，请检查日志"
    journalctl -u wms -n 50
    exit 1
fi

# 检查Nginx
if systemctl is-active --quiet nginx; then
    log_info "Nginx 运行正常"
else
    log_error "Nginx 启动失败"
    exit 1
fi

# =============================================================================
# 部署完成
# =============================================================================
log_info "========================================"
log_info "部署完成！"
log_info "========================================"
log_info "访问地址: http://$DOMAIN"
log_info "API地址: http://$DOMAIN/api"
log_info "日志目录: $APP_DIR/logs"
log_info "备份目录: $APP_DIR/backup"
log_info ""
log_info "常用命令:"
log_info "  查看日志: sudo journalctl -u wms -f"
log_info "  重启服务: sudo systemctl restart wms"
log_info "  停止服务: sudo systemctl stop wms"
log_info "  查看状态: sudo systemctl status wms"
log_info ""
log_warn "请立即修改默认管理员密码！"
log_info "========================================"
