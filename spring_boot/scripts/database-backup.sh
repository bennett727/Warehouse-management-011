#!/bin/bash
#
# 数据库自动备份脚本
# 功能：自动备份MySQL数据库，支持全量备份和增量备份
# 作者：运维团队
# 版本：1.0.0
# 创建时间：2026-02-25
#

set -euo pipefail

# ============================================
# 配置变量
# ============================================

# 数据库配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-warehouse_management}"
DB_USER="${DB_USER:-wms_user}"
DB_PASSWORD="${DB_PASSWORD:-}"  # 从环境变量获取

# 备份配置
BACKUP_BASE_DIR="${BACKUP_DIR:-/var/backups/wms/database}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_BASE_DIR}/${BACKUP_DATE}"

# 日志配置
LOG_DIR="${BACKUP_BASE_DIR}/logs"
LOG_FILE="${LOG_DIR}/backup_${BACKUP_DATE}.log"

# 通知配置
ALERT_EMAIL="${ALERT_EMAIL:-admin@company.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
DINGTALK_WEBHOOK="${DINGTALK_WEBHOOK:-}"

# 备份类型：full(全量) | incremental(增量)
BACKUP_TYPE="${1:-full}"

# ============================================
# 颜色定义
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 日志函数
# ============================================
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    log "INFO" "$@"
}

log_warn() {
    log "WARN" "$@"
}

log_error() {
    log "ERROR" "$@"
}

log_success() {
    log "SUCCESS" "$@"
}

# ============================================
# 初始化函数
# ============================================
init() {
    log_info "开始初始化备份环境..."
    
    # 创建备份目录
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${LOG_DIR}"
    
    # 检查必要命令
    local required_commands=("mysqldump" "mysql" "gzip")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "${cmd}" &> /dev/null; then
            log_error "命令 ${cmd} 未安装"
            exit 1
        fi
    done
    
    # 检查数据库连接
    if ! mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" -e "SELECT 1;" "${DB_NAME}" &> /dev/null; then
        log_error "无法连接到数据库 ${DB_NAME}"
        exit 1
    fi
    
    log_success "初始化完成"
}

# ============================================
# 全量备份函数
# ============================================
full_backup() {
    log_info "开始全量备份..."
    
    local backup_file="${BACKUP_DIR}/full_backup_${BACKUP_DATE}.sql"
    local compressed_file="${backup_file}.gz"
    
    # 执行备份
    log_info "正在导出数据库..."
    if mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --password="${DB_PASSWORD}" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --lock-tables=false \
        --set-gtid-purged=OFF \
        "${DB_NAME}" > "${backup_file}" 2>> "${LOG_FILE}"; then
        
        log_info "数据库导出完成: ${backup_file}"
        
        # 压缩备份文件
        log_info "正在压缩备份文件..."
        if gzip -c "${backup_file}" > "${compressed_file}"; then
            rm -f "${backup_file}"
            local file_size=$(du -h "${compressed_file}" | cut -f1)
            log_success "全量备份完成: ${compressed_file} (大小: ${file_size})"
            
            # 生成校验和
            md5sum "${compressed_file}" > "${compressed_file}.md5"
            log_info "校验和已生成: ${compressed_file}.md5"
        else
            log_error "压缩备份文件失败"
            return 1
        fi
    else
        log_error "数据库导出失败"
        return 1
    fi
}

# ============================================
# 增量备份函数（基于二进制日志）
# ============================================
incremental_backup() {
    log_info "开始增量备份..."
    
    # 获取当前二进制日志位置
    local binlog_info=$(mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" -e "SHOW MASTER STATUS;" 2>/dev/null | tail -n 1)
    local current_binlog=$(echo "${binlog_info}" | awk '{print $1}')
    local current_position=$(echo "${binlog_info}" | awk '{print $2}')
    
    log_info "当前二进制日志: ${current_binlog}, 位置: ${current_position}"
    
    # 读取上次备份位置
    local last_backup_file="${BACKUP_BASE_DIR}/.last_backup"
    local last_binlog=""
    local last_position=""
    
    if [[ -f "${last_backup_file}" ]]; then
        last_binlog=$(cat "${last_backup_file}" | grep 'binlog' | cut -d= -f2)
        last_position=$(cat "${last_backup_file}" | grep 'position' | cut -d= -f2)
        log_info "上次备份位置: ${last_binlog}, ${last_position}"
    fi
    
    # 导出增量数据
    local backup_file="${BACKUP_DIR}/incremental_backup_${BACKUP_DATE}.sql"
    
    if [[ -n "${last_binlog}" ]]; then
        # 使用 mysqlbinlog 导出增量
        if mysqlbinlog \
            --read-from-remote-server \
            --host="${DB_HOST}" \
            --port="${DB_PORT}" \
            --user="${DB_USER}" \
            --password="${DB_PASSWORD}" \
            --start-position="${last_position}" \
            "${last_binlog}" > "${backup_file}" 2>> "${LOG_FILE}"; then
            
            log_success "增量备份完成: ${backup_file}"
        else
            log_warn "增量备份失败，转为全量备份"
            full_backup
            return $?
        fi
    else
        log_warn "未找到上次备份记录，执行全量备份"
        full_backup
        return $?
    fi
    
    # 保存当前位置
    echo "binlog=${current_binlog}" > "${last_backup_file}"
    echo "position=${current_position}" >> "${last_backup_file}"
    echo "timestamp=${BACKUP_DATE}" >> "${last_backup_file}"
}

# ============================================
# 备份表结构函数
# ============================================
backup_schema() {
    log_info "开始备份表结构..."
    
    local schema_file="${BACKUP_DIR}/schema_${BACKUP_DATE}.sql"
    
    if mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --password="${DB_PASSWORD}" \
        --no-data \
        --routines \
        --triggers \
        --events \
        "${DB_NAME}" > "${schema_file}" 2>> "${LOG_FILE}"; then
        
        gzip -c "${schema_file}" > "${schema_file}.gz"
        rm -f "${schema_file}"
        log_success "表结构备份完成: ${schema_file}.gz"
    else
        log_error "表结构备份失败"
    fi
}

# ============================================
# 清理旧备份函数
# ============================================
cleanup_old_backups() {
    log_info "开始清理旧备份..."
    
    local deleted_count=0
    
    # 删除超过保留期的备份
    while IFS= read -r -d '' dir; do
        local dir_name=$(basename "${dir}")
        if [[ "${dir_name}" =~ ^[0-9]{8}_[0-9]{6}$ ]]; then
            log_info "删除旧备份: ${dir}"
            rm -rf "${dir}"
            ((deleted_count++))
        fi
    done < <(find "${BACKUP_BASE_DIR}" -maxdepth 1 -type d -mtime +${BACKUP_RETENTION_DAYS} -print0 2>/dev/null)
    
    log_success "清理完成，删除了 ${deleted_count} 个旧备份"
}

# ============================================
# 验证备份函数
# ============================================
verify_backup() {
    log_info "开始验证备份..."
    
    local backup_file=$1
    
    # 检查文件是否存在
    if [[ ! -f "${backup_file}" ]]; then
        log_error "备份文件不存在: ${backup_file}"
        return 1
    fi
    
    # 检查文件大小
    local file_size=$(stat -f%z "${backup_file}" 2>/dev/null || stat -c%s "${backup_file}" 2>/dev/null)
    if [[ ${file_size} -lt 100 ]]; then
        log_error "备份文件过小，可能损坏: ${file_size} bytes"
        return 1
    fi
    
    # 验证压缩文件完整性
    if [[ "${backup_file}" == *.gz ]]; then
        if ! gzip -t "${backup_file}" 2>> "${LOG_FILE}"; then
            log_error "备份文件压缩校验失败"
            return 1
        fi
    fi
    
    # 验证校验和
    local md5_file="${backup_file}.md5"
    if [[ -f "${md5_file}" ]]; then
        if md5sum -c "${md5_file}" >> "${LOG_FILE}" 2>&1; then
            log_success "备份文件校验通过"
        else
            log_error "备份文件校验失败"
            return 1
        fi
    fi
    
    log_success "备份验证完成"
}

# ============================================
# 发送通知函数
# ============================================
send_notification() {
    local status=$1
    local message=$2
    
    # 发送邮件通知
    if command -v mail &> /dev/null && [[ -n "${ALERT_EMAIL}" ]]; then
        echo "${message}" | mail -s "[WMS数据库备份] ${status}" "${ALERT_EMAIL}"
    fi
    
    # 发送Slack通知
    if [[ -n "${SLACK_WEBHOOK}" ]]; then
        local color=$([[ "${status}" == "成功" ]] && echo "good" || echo "danger")
        curl -s -X POST "${SLACK_WEBHOOK}" \
            -H 'Content-type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"${color}\",
                    \"title\": \"WMS数据库备份${status}\",
                    \"text\": \"${message}\",
                    \"footer\": \"WMS备份系统\",
                    \"ts\": $(date +%s)
                }]
            }" > /dev/null 2>&1
    fi
    
    # 发送钉钉通知
    if [[ -n "${DINGTALK_WEBHOOK}" ]]; then
        curl -s -X POST "${DINGTALK_WEBHOOK}" \
            -H 'Content-type: application/json' \
            -d "{
                \"msgtype\": \"text\",
                \"text\": {
                    \"content\": \"WMS数据库备份${status}\\n${message}\"
                }
            }" > /dev/null 2>&1
    fi
}

# ============================================
# 生成备份报告
# ============================================
generate_report() {
    local status=$1
    local start_time=$2
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    local report_file="${BACKUP_DIR}/report.txt"
    
    cat > "${report_file}" << EOF
========================================
WMS数据库备份报告
========================================
备份时间: $(date '+%Y-%m-%d %H:%M:%S')
备份类型: ${BACKUP_TYPE}
备份状态: ${status}
执行时长: ${duration} 秒
数据库: ${DB_NAME}
主机: ${DB_HOST}:${DB_PORT}
备份目录: ${BACKUP_DIR}

备份文件列表:
$(ls -lh "${BACKUP_DIR}" 2>/dev/null || echo "无文件")

磁盘使用情况:
$(df -h "${BACKUP_BASE_DIR}")
========================================
EOF
    
    log_info "备份报告已生成: ${report_file}"
}

# ============================================
# 主函数
# ============================================
main() {
    local start_time=$(date +%s)
    local exit_code=0
    
    log_info "========================================"
    log_info "WMS数据库备份任务开始"
    log_info "备份类型: ${BACKUP_TYPE}"
    log_info "数据库: ${DB_NAME}"
    log_info "========================================"
    
    # 初始化
    init
    
    # 执行备份
    case "${BACKUP_TYPE}" in
        full)
            if full_backup; then
                backup_schema
            else
                exit_code=1
            fi
            ;;
        incremental)
            incremental_backup
            exit_code=$?
            ;;
        schema)
            backup_schema
            exit_code=$?
            ;;
        *)
            log_error "未知的备份类型: ${BACKUP_TYPE}"
            exit_code=1
            ;;
    esac
    
    # 验证备份
    if [[ ${exit_code} -eq 0 ]]; then
        local latest_backup=$(find "${BACKUP_DIR}" -name "*.gz" -type f | head -1)
        if [[ -n "${latest_backup}" ]]; then
            if ! verify_backup "${latest_backup}"; then
                exit_code=1
            fi
        fi
    fi
    
    # 清理旧备份
    cleanup_old_backups
    
    # 生成报告
    local status=$([[ ${exit_code} -eq 0 ]] && echo "成功" || echo "失败")
    generate_report "${status}" "${start_time}"
    
    # 发送通知
    local duration=$(($(date +%s) - start_time))
    local notification_message="备份类型: ${BACKUP_TYPE}
数据库: ${DB_NAME}
执行时长: ${duration} 秒
备份目录: ${BACKUP_DIR}
日志文件: ${LOG_FILE}"
    
    send_notification "${status}" "${notification_message}"
    
    log_info "========================================"
    log_info "备份任务${status}"
    log_info "========================================"
    
    return ${exit_code}
}

# 执行主函数
main "$@"
