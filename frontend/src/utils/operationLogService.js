/**
 * 操作日志服务
 * 负责记录和管理用户操作日志
 * @module operationLogService
 */

import { createLogger } from '@/utils/logger.js';

const logger = createLogger('operationLog');

/**
 * 操作类型枚举
 */
export const OPERATION_TYPES = {
  // 入库相关
  INBOUND_CREATE: 'inbound_create',
  INBOUND_UPDATE: 'inbound_update',
  INBOUND_DELETE: 'inbound_delete',
  INBOUND_SUBMIT: 'inbound_submit',
  INBOUND_APPROVE: 'inbound_approve',
  INBOUND_REJECT: 'inbound_reject',
  INBOUND_COMPLETE: 'inbound_complete',

  // 出库相关
  OUTBOUND_CREATE: 'outbound_create',
  OUTBOUND_UPDATE: 'outbound_update',
  OUTBOUND_DELETE: 'outbound_delete',
  OUTBOUND_SUBMIT: 'outbound_submit',
  OUTBOUND_APPROVE: 'outbound_approve',
  OUTBOUND_REJECT: 'outbound_reject',
  OUTBOUND_COMPLETE: 'outbound_complete',

  // 调拨相关
  TRANSFER_CREATE: 'transfer_create',
  TRANSFER_UPDATE: 'transfer_update',
  TRANSFER_DELETE: 'transfer_delete',
  TRANSFER_SUBMIT: 'transfer_submit',
  TRANSFER_APPROVE: 'transfer_approve',
  TRANSFER_REJECT: 'transfer_reject',
  TRANSFER_OUTBOUND: 'transfer_outbound',
  TRANSFER_INBOUND: 'transfer_inbound',
  TRANSFER_COMPLETE: 'transfer_complete',
  TRANSFER_CANCEL: 'transfer_cancel',

  // 盘点相关
  STOCK_COUNT_CREATE: 'stock_count_create',
  STOCK_COUNT_UPDATE: 'stock_count_update',
  STOCK_COUNT_DELETE: 'stock_count_delete',
  STOCK_COUNT_START: 'stock_count_start',
  STOCK_COUNT_COMPLETE: 'stock_count_complete',
  STOCK_COUNT_ADJUST: 'stock_count_adjust',

  // 设备安装相关
  INSTALLATION_CREATE: 'installation_create',
  INSTALLATION_UPDATE: 'installation_update',
  INSTALLATION_DELETE: 'installation_delete',
  INSTALLATION_COMPLETE: 'installation_complete',

  // 维修相关
  REPAIR_CREATE: 'repair_create',
  REPAIR_UPDATE: 'repair_update',
  REPAIR_DELETE: 'repair_delete',
  REPAIR_COMPLETE: 'repair_complete',

  // 设备管理相关
  DEVICE_CREATE: 'device_create',
  DEVICE_UPDATE: 'device_update',
  DEVICE_DELETE: 'device_delete',
  DEVICE_IMPORT: 'device_import',
  DEVICE_EXPORT: 'device_export',

  // 仓库管理相关
  WAREHOUSE_CREATE: 'warehouse_create',
  WAREHOUSE_UPDATE: 'warehouse_update',
  WAREHOUSE_DELETE: 'warehouse_delete',

  // 货位管理相关
  BIN_CREATE: 'bin_create',
  BIN_UPDATE: 'bin_update',
  BIN_DELETE: 'bin_delete',

  // 用户管理相关
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PASSWORD_CHANGE: 'user_password_change',

  // 系统管理相关
  SYSTEM_CONFIG_UPDATE: 'system_config_update',
  DATA_BACKUP: 'data_backup',
  DATA_RESTORE: 'data_restore',
};

/**
 * 操作类型标签
 */
export const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPES.INBOUND_CREATE]: '创建入库单',
  [OPERATION_TYPES.INBOUND_UPDATE]: '更新入库单',
  [OPERATION_TYPES.INBOUND_DELETE]: '删除入库单',
  [OPERATION_TYPES.INBOUND_SUBMIT]: '提交入库单',
  [OPERATION_TYPES.INBOUND_APPROVE]: '审核通过入库单',
  [OPERATION_TYPES.INBOUND_REJECT]: '审核拒绝入库单',
  [OPERATION_TYPES.INBOUND_COMPLETE]: '完成入库单',

  [OPERATION_TYPES.OUTBOUND_CREATE]: '创建出库单',
  [OPERATION_TYPES.OUTBOUND_UPDATE]: '更新出库单',
  [OPERATION_TYPES.OUTBOUND_DELETE]: '删除出库单',
  [OPERATION_TYPES.OUTBOUND_SUBMIT]: '提交出库单',
  [OPERATION_TYPES.OUTBOUND_APPROVE]: '审核通过出库单',
  [OPERATION_TYPES.OUTBOUND_REJECT]: '审核拒绝出库单',
  [OPERATION_TYPES.OUTBOUND_COMPLETE]: '完成出库单',

  [OPERATION_TYPES.TRANSFER_CREATE]: '创建调拨单',
  [OPERATION_TYPES.TRANSFER_UPDATE]: '更新调拨单',
  [OPERATION_TYPES.TRANSFER_DELETE]: '删除调拨单',
  [OPERATION_TYPES.TRANSFER_SUBMIT]: '提交调拨单',
  [OPERATION_TYPES.TRANSFER_APPROVE]: '审核通过调拨单',
  [OPERATION_TYPES.TRANSFER_REJECT]: '审核拒绝调拨单',
  [OPERATION_TYPES.TRANSFER_OUTBOUND]: '调拨出库',
  [OPERATION_TYPES.TRANSFER_INBOUND]: '调拨入库',
  [OPERATION_TYPES.TRANSFER_COMPLETE]: '完成调拨单',
  [OPERATION_TYPES.TRANSFER_CANCEL]: '取消调拨单',

  [OPERATION_TYPES.STOCK_COUNT_CREATE]: '创建盘点单',
  [OPERATION_TYPES.STOCK_COUNT_UPDATE]: '更新盘点单',
  [OPERATION_TYPES.STOCK_COUNT_DELETE]: '删除盘点单',
  [OPERATION_TYPES.STOCK_COUNT_START]: '开始盘点',
  [OPERATION_TYPES.STOCK_COUNT_COMPLETE]: '完成盘点',
  [OPERATION_TYPES.STOCK_COUNT_ADJUST]: '盘点调整',

  [OPERATION_TYPES.INSTALLATION_CREATE]: '创建安装单',
  [OPERATION_TYPES.INSTALLATION_UPDATE]: '更新安装单',
  [OPERATION_TYPES.INSTALLATION_DELETE]: '删除安装单',
  [OPERATION_TYPES.INSTALLATION_COMPLETE]: '完成安装',

  [OPERATION_TYPES.REPAIR_CREATE]: '创建维修单',
  [OPERATION_TYPES.REPAIR_UPDATE]: '更新维修单',
  [OPERATION_TYPES.REPAIR_DELETE]: '删除维修单',
  [OPERATION_TYPES.REPAIR_COMPLETE]: '完成维修',

  [OPERATION_TYPES.DEVICE_CREATE]: '创建设备',
  [OPERATION_TYPES.DEVICE_UPDATE]: '更新设备',
  [OPERATION_TYPES.DEVICE_DELETE]: '删除设备',
  [OPERATION_TYPES.DEVICE_IMPORT]: '导入设备',
  [OPERATION_TYPES.DEVICE_EXPORT]: '导出设备',

  [OPERATION_TYPES.WAREHOUSE_CREATE]: '创建仓库',
  [OPERATION_TYPES.WAREHOUSE_UPDATE]: '更新仓库',
  [OPERATION_TYPES.WAREHOUSE_DELETE]: '删除仓库',

  [OPERATION_TYPES.BIN_CREATE]: '创建货位',
  [OPERATION_TYPES.BIN_UPDATE]: '更新货位',
  [OPERATION_TYPES.BIN_DELETE]: '删除货位',

  [OPERATION_TYPES.USER_CREATE]: '创建用户',
  [OPERATION_TYPES.USER_UPDATE]: '更新用户',
  [OPERATION_TYPES.USER_DELETE]: '删除用户',
  [OPERATION_TYPES.USER_LOGIN]: '用户登录',
  [OPERATION_TYPES.USER_LOGOUT]: '用户登出',
  [OPERATION_TYPES.USER_PASSWORD_CHANGE]: '修改密码',

  [OPERATION_TYPES.SYSTEM_CONFIG_UPDATE]: '更新系统配置',
  [OPERATION_TYPES.DATA_BACKUP]: '数据备份',
  [OPERATION_TYPES.DATA_RESTORE]: '数据恢复',
};

/**
 * 操作结果枚举
 */
export const OPERATION_RESULT = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

/**
 * 操作结果标签
 */
export const OPERATION_RESULT_LABELS = {
  [OPERATION_RESULT.SUCCESS]: '成功',
  [OPERATION_RESULT.FAILURE]: '失败',
  [OPERATION_RESULT.PENDING]: '进行中',
  [OPERATION_RESULT.CANCELLED]: '已取消',
};

/**
 * 操作结果标签类型
 */
export const OPERATION_RESULT_TAG_TYPES = {
  [OPERATION_RESULT.SUCCESS]: 'success',
  [OPERATION_RESULT.FAILURE]: 'danger',
  [OPERATION_RESULT.PENDING]: 'warning',
  [OPERATION_RESULT.CANCELLED]: 'info',
};

/**
 * 操作日志服务类
 */
class OperationLogService {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 最大日志条数
    this.storageKey = 'warehouse_operation_logs';
    this.loadFromStorage();
  }

  /**
   * 从本地存储加载日志
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('从本地存储加载日志失败', error);
      this.logs = [];
    }
  }

  /**
   * 保存日志到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (error) {
      logger.error('保存日志到本地存储失败', error);
    }
  }

  /**
   * 记录操作日志
   * @param {Object} logData - 日志数据
   * @returns {Object} 日志记录
   */
  log(logData) {
    const log = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      type: logData.type,
      typeLabel: OPERATION_TYPE_LABELS[logData.type] || logData.type,
      module: logData.module || 'system',
      description: logData.description || '',
      operator: {
        id: logData.operator?.id || this.getCurrentUserId(),
        name: logData.operator?.name || this.getCurrentUserName(),
        ip: logData.operator?.ip || this.getClientIp(),
      },
      target: {
        type: logData.target?.type || '',
        id: logData.target?.id || '',
        name: logData.target?.name || '',
      },
      details: logData.details || {},
      result: logData.result || OPERATION_RESULT.SUCCESS,
      resultMessage: logData.resultMessage || '',
      duration: logData.duration || 0,
    };

    this.logs.unshift(log);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // 保存到本地存储
    this.saveToStorage();

    // 记录到控制台
    logger.info('操作日志', log);

    return log;
  }

  /**
   * 记录成功操作
   * @param {string} type - 操作类型
   * @param {Object} data - 操作数据
   * @returns {Object} 日志记录
   */
  logSuccess(type, data = {}) {
    return this.log({
      type,
      ...data,
      result: OPERATION_RESULT.SUCCESS,
    });
  }

  /**
   * 记录失败操作
   * @param {string} type - 操作类型
   * @param {string} errorMessage - 错误消息
   * @param {Object} data - 操作数据
   * @returns {Object} 日志记录
   */
  logFailure(type, errorMessage, data = {}) {
    return this.log({
      type,
      ...data,
      result: OPERATION_RESULT.FAILURE,
      resultMessage: errorMessage,
    });
  }

  /**
   * 获取日志列表
   * @param {Object} filters - 过滤条件
   * @returns {Array} 日志列表
   */
  getLogs(filters = {}) {
    let logs = [...this.logs];

    if (filters.type) {
      logs = logs.filter((log) => log.type === filters.type);
    }

    if (filters.module) {
      logs = logs.filter((log) => log.module === filters.module);
    }

    if (filters.result) {
      logs = logs.filter((log) => log.result === filters.result);
    }

    if (filters.operatorId) {
      logs = logs.filter((log) => log.operator.id === filters.operatorId);
    }

    if (filters.targetType) {
      logs = logs.filter((log) => log.target.type === filters.targetType);
    }

    if (filters.targetId) {
      logs = logs.filter((log) => log.target.id === filters.targetId);
    }

    if (filters.startDate && filters.endDate) {
      logs = logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(filters.startDate) && logDate <= new Date(filters.endDate);
      });
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.description.toLowerCase().includes(keyword) ||
          log.target.name.toLowerCase().includes(keyword) ||
          log.operator.name.toLowerCase().includes(keyword)
      );
    }

    return logs;
  }

  /**
   * 获取单条日志
   * @param {string} logId - 日志ID
   * @returns {Object|null} 日志记录
   */
  getLog(logId) {
    return this.logs.find((log) => log.id === logId) || null;
  }

  /**
   * 清除日志
   * @param {Object} filters - 过滤条件（为空则清除所有）
   */
  clearLogs(filters = null) {
    if (!filters) {
      this.logs = [];
    } else {
      const logsToKeep = this.getLogs(filters);
      this.logs = logsToKeep;
    }
    this.saveToStorage();
    logger.info('日志已清除', filters);
  }

  /**
   * 导出日志
   * @param {Object} filters - 过滤条件
   * @returns {string} CSV格式的日志数据
   */
  exportLogs(filters = {}) {
    const logs = this.getLogs(filters);
    const headers = ['时间', '操作类型', '模块', '描述', '操作人', '目标类型', '目标名称', '结果', '结果消息'];
    const rows = logs.map((log) => [
      log.timestamp,
      log.typeLabel,
      log.module,
      log.description,
      log.operator.name,
      log.target.type,
      log.target.name,
      OPERATION_RESULT_LABELS[log.result],
      log.resultMessage,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    return csvContent;
  }

  /**
   * 获取操作统计
   * @param {Object} filters - 过滤条件
   * @returns {Object} 统计数据
   */
  getStatistics(filters = {}) {
    const logs = this.getLogs(filters);
    const stats = {
      total: logs.length,
      byType: {},
      byResult: {},
      byModule: {},
      byOperator: {},
      byDate: {},
    };

    logs.forEach((log) => {
      // 按类型统计
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

      // 按结果统计
      stats.byResult[log.result] = (stats.byResult[log.result] || 0) + 1;

      // 按模块统计
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;

      // 按操作人统计
      stats.byOperator[log.operator.name] = (stats.byOperator[log.operator.name] || 0) + 1;

      // 按日期统计
      const date = log.timestamp.split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    return stats;
  }

  /**
   * 生成日志ID
   * @returns {string} 日志ID
   */
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取当前用户ID
   * @returns {string} 用户ID
   */
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * 获取当前用户名
   * @returns {string} 用户名
   */
  getCurrentUserName() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.realName || user.username || '匿名用户';
    } catch {
      return '匿名用户';
    }
  }

  /**
   * 获取客户端IP（简化处理）
   * @returns {string} IP地址
   */
  getClientIp() {
    return '127.0.0.1';
  }
}

// 导出单例
const operationLogService = new OperationLogService();
export default operationLogService;
