# 数据库自动备份配置指南

## 📋 概述

本指南介绍如何配置仓库管理系统(WMS)的数据库自动备份，支持全量备份、增量备份和表结构备份。

## 🎯 备份策略

### 推荐备份计划

| 备份类型 | 频率 | 保留时间 | 说明 |
|---------|------|---------|------|
| 全量备份 | 每日 02:00 | 30天 | 完整数据库备份 |
| 增量备份 | 每6小时 | 7天 | 基于二进制日志的增量备份 |
| 表结构备份 | 每周日 01:00 | 90天 | 仅备份表结构 |

## 🔧 环境准备

### 1. Linux/macOS 环境

#### 安装必要工具

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-client gzip

# CentOS/RHEL
sudo yum install mysql gzip

# macOS
brew install mysql-client
```

#### 配置环境变量

```bash
# 编辑 ~/.bashrc 或 ~/.zshrc
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=warehouse_management
export DB_USER=wms_user
export DB_PASSWORD=your_password
export BACKUP_DIR=/var/backups/wms/database
export BACKUP_RETENTION_DAYS=30
export ALERT_EMAIL=admin@company.com
export SLACK_WEBHOOK=https://hooks.slack.com/services/xxx
export DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
```

### 2. Windows 环境

#### 安装 MySQL 客户端

1. 下载并安装 MySQL Community Server
2. 将 MySQL bin 目录添加到系统 PATH

#### 配置环境变量

```powershell
# 使用 PowerShell 设置环境变量
[Environment]::SetEnvironmentVariable("DB_HOST", "localhost", "Machine")
[Environment]::SetEnvironmentVariable("DB_PORT", "3306", "Machine")
[Environment]::SetEnvironmentVariable("DB_NAME", "warehouse_management", "Machine")
[Environment]::SetEnvironmentVariable("DB_USER", "wms_user", "Machine")
[Environment]::SetEnvironmentVariable("DB_PASSWORD", "your_password", "Machine")
[Environment]::SetEnvironmentVariable("BACKUP_DIR", "D:\Backups\WMS\Database", "Machine")
[Environment]::SetEnvironmentVariable("BACKUP_RETENTION_DAYS", "30", "Machine")
```

## 📅 配置定时任务

### Linux - 使用 Cron

```bash
# 编辑 crontab
crontab -e

# 添加以下任务

# 每日 02:00 执行全量备份
0 2 * * * /bin/bash /path/to/wms/spring_boot/scripts/database-backup.sh full

# 每6小时执行增量备份
0 */6 * * * /bin/bash /path/to/wms/spring_boot/scripts/database-backup.sh incremental

# 每周日 01:00 执行表结构备份
0 1 * * 0 /bin/bash /path/to/wms/spring_boot/scripts/database-backup.sh schema
```

### Windows - 使用任务计划程序

#### 使用 PowerShell 创建任务

```powershell
# 创建全量备份任务（每日 02:00）
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File D:\WMS\spring_boot\scripts\database-backup.ps1 -BackupType full"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "WMS-Database-Full-Backup" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "WMS数据库全量备份任务"

# 创建表结构备份任务（每周日 01:00）
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File D:\WMS\spring_boot\scripts\database-backup.ps1 -BackupType schema"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "01:00"

Register-ScheduledTask -TaskName "WMS-Database-Schema-Backup" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "WMS数据库表结构备份任务"
```

#### 使用图形界面

1. 打开 **任务计划程序**（Task Scheduler）
2. 点击 **创建基本任务**
3. 输入任务名称："WMS-Database-Full-Backup"
4. 选择触发器：**每天**，时间设置为 02:00
5. 选择操作：**启动程序**
6. 程序/脚本：`powershell.exe`
7. 添加参数：`-ExecutionPolicy Bypass -File "D:\WMS\spring_boot\scripts\database-backup.ps1" -BackupType full`
8. 完成创建

## 🚀 手动执行备份

### Linux/macOS

```bash
# 全量备份
./spring_boot/scripts/database-backup.sh full

# 增量备份
./spring_boot/scripts/database-backup.sh incremental

# 表结构备份
./spring_boot/scripts/database-backup.sh schema
```

### Windows

```powershell
# 全量备份
.\spring_boot\scripts\database-backup.ps1 -BackupType full

# 表结构备份
.\spring_boot\scripts\database-backup.ps1 -BackupType schema
```

## 📊 备份文件结构

```
/var/backups/wms/database/          # 备份根目录
├── 20260225_020000/                # 备份目录（按时间命名）
│   ├── full_backup_20260225_020000.sql.gz
│   ├── full_backup_20260225_020000.sql.gz.md5
│   ├── schema_20260225_020000.sql.gz
│   └── report.txt                  # 备份报告
├── 20260225_080000/                # 增量备份目录
│   ├── incremental_backup_20260225_080000.sql
│   └── report.txt
└── logs/                           # 日志目录
    ├── backup_20260225_020000.log
    └── backup_20260225_080000.log
```

## 🔄 数据恢复

### 从全量备份恢复

```bash
# 1. 解压备份文件
gunzip full_backup_20260225_020000.sql.gz

# 2. 恢复数据库
mysql -h localhost -u wms_user -p warehouse_management < full_backup_20260225_020000.sql
```

### 从增量备份恢复

```bash
# 1. 先恢复全量备份
mysql -h localhost -u wms_user -p warehouse_management < full_backup_20260225_020000.sql

# 2. 再应用增量备份
mysqlbinlog incremental_backup_20260225_080000.sql | mysql -h localhost -u wms_user -p warehouse_management
```

## 🔔 通知配置

### 邮件通知

确保系统已配置邮件发送功能：

```bash
# Linux 安装邮件工具
sudo apt-get install mailutils  # Ubuntu/Debian
sudo yum install mailx          # CentOS/RHEL

# 配置 SMTP
# 编辑 /etc/mail.rc 或 ~/.mailrc
set smtp=smtp.company.com
set smtp-auth-user=backup@company.com
set smtp-auth-password=your_password
set smtp-auth=login
```

### Slack 通知

1. 在 Slack 中创建 Incoming Webhook
2. 复制 Webhook URL
3. 设置环境变量：`export SLACK_WEBHOOK=https://hooks.slack.com/services/xxx`

### 钉钉通知

1. 在钉钉群中添加自定义机器人
2. 获取 Webhook 地址
3. 设置环境变量：`export DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx`

## 📈 监控与告警

### 检查备份状态

```bash
# 查看最新备份
ls -lt /var/backups/wms/database/ | head -10

# 查看备份日志
tail -f /var/backups/wms/database/logs/backup_*.log

# 检查备份文件大小
du -sh /var/backups/wms/database/*/
```

### 设置磁盘空间告警

```bash
# 添加到 crontab，每小时检查一次磁盘空间
0 * * * * df -h /var/backups | awk 'NR==2 {if ($5+0 > 80) print "磁盘空间不足: "$5}' | mail -s "WMS备份磁盘告警" admin@company.com
```

## 🔒 安全建议

1. **密码安全**：不要将密码硬编码在脚本中，使用环境变量
2. **权限控制**：备份目录设置适当的权限（`chmod 700`）
3. **加密传输**：使用 SSL/TLS 连接数据库
4. **异地备份**：定期将备份文件复制到异地存储
5. **访问控制**：限制备份文件的访问权限

```bash
# 设置备份目录权限
chmod 700 /var/backups/wms/database
chown backup:backup /var/backups/wms/database

# 设置文件权限
chmod 600 /var/backups/wms/database/*/*.gz
```

## 🐛 故障排查

### 常见问题

#### 1. 备份失败：权限不足

```bash
# 检查 MySQL 用户权限
mysql -u root -p -e "GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON warehouse_management.* TO 'wms_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

#### 2. 备份文件为空

```bash
# 检查数据库连接
mysql -h localhost -u wms_user -p -e "SHOW DATABASES;"

# 检查 mysqldump 是否正常工作
mysqldump --version
```

#### 3. 磁盘空间不足

```bash
# 清理旧备份
find /var/backups/wms/database -type d -mtime +30 -exec rm -rf {} \;

# 检查磁盘空间
df -h
```

#### 4. 定时任务不执行

```bash
# 检查 crontab 是否正确配置
crontab -l

# 检查 cron 服务状态
sudo systemctl status cron  # Ubuntu/Debian
sudo systemctl status crond # CentOS/RHEL

# 查看 cron 日志
tail -f /var/log/cron
```

## 📚 相关文档

- [生产环境部署检查清单](./生产环境部署检查清单.md)
- [监控配置指南](./monitoring-setup.md)
- [数据库维护手册](../database/数据库维护手册.md)

---

**文档版本**: 1.0  
**更新日期**: 2026-02-25  
**维护人员**: 运维团队
