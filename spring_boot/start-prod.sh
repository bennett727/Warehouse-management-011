#!/bin/bash
# =====================================================================================
# 仓库管理系统 - 生产环境启动脚本 (Linux)
# =====================================================================================

echo "========================================"
echo "  仓库管理系统 - 生产环境启动"
echo "========================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查环境变量文件是否存在
if [ ! -f "$SCRIPT_DIR/.env.production" ]; then
    echo "[错误] 未找到环境变量配置文件！"
    echo ""
    echo "请按以下步骤操作："
    echo "1. 复制 .env.production.example 为 .env.production"
    echo "   cp $SCRIPT_DIR/.env.production.example $SCRIPT_DIR/.env.production"
    echo "2. 编辑 .env.production 填写实际配置值"
    echo "3. 重新运行此脚本"
    echo ""
    exit 1
fi

# 加载环境变量
set -a
source "$SCRIPT_DIR/.env.production"
set +a

# 检查必填环境变量
if [ -z "$DB_HOST" ]; then
    echo "[错误] 缺少必填环境变量: DB_HOST"
    exit 1
fi
if [ -z "$DB_PASSWORD" ]; then
    echo "[错误] 缺少必填环境变量: DB_PASSWORD"
    exit 1
fi
if [ -z "$JWT_SECRET" ]; then
    echo "[错误] 缺少必填环境变量: JWT_SECRET"
    exit 1
fi
if [ -z "$CORS_ALLOWED_ORIGINS" ]; then
    echo "[错误] 缺少必填环境变量: CORS_ALLOWED_ORIGINS"
    exit 1
fi

echo "[信息] 环境变量加载完成"
echo "[信息] 数据库: $DB_HOST:$DB_PORT/$DB_NAME"
echo "[信息] 服务端口: ${SERVER_PORT:-8080}"
echo ""

# 查找JAR文件
JAR_FILE=$(find "$SCRIPT_DIR/target" -maxdepth 1 -name "*.jar" ! -name "*original*" | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "[错误] 未找到JAR文件，请先执行 mvn clean package"
    exit 1
fi

echo "[信息] 启动服务: $JAR_FILE"
echo ""

# 导出环境变量供Java使用
export DB_HOST DB_PORT DB_NAME DB_USERNAME DB_PASSWORD
export JWT_SECRET CORS_ALLOWED_ORIGINS SERVER_PORT
export LOG_PATH LOG_LEVEL_ROOT LOG_LEVEL_APP
export REDIS_ENABLED REDIS_HOST REDIS_PORT REDIS_PASSWORD

# 启动Spring Boot应用
java -jar "$JAR_FILE" --spring.profiles.active=prod
