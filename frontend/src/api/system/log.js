/**
 * 操作日志管理相关API服务
 * 处理操作日志的查询、统计和清理等操作
 */
import { SYSTEM_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取操作日志列表
 * @param {object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词（操作者、操作内容、模块）
 * @param {string} params.module - 操作模块
 * @param {number} params.type - 操作类型
 * @param {number} params.isSuccess - 操作状态（1-成功，0-失败）
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序方向（asc/desc）
 * @returns {Promise} 操作日志列表数据
 */
export const getLogList = async (params) => {
  return request.get(SYSTEM_API.LOG_LIST, { params });
};

/**
 * 获取操作日志详情
 * @param {string} logId - 日志ID
 * @returns {Promise} 操作日志详情
 */
export const getLogDetail = async (logId) => {
  return request.get(`${SYSTEM_API.LOG_LIST}/${logId}`);
};

/**
 * 获取最新的操作日志
 * @param {number} count - 获取数量（默认10条，最多50条）
 * @returns {Promise} 操作日志列表
 */
export const getLatestLogs = async (count = 10) => {
  return request.get(`${SYSTEM_API.LOG_LIST}/latest`, { params: { count } });
};

/**
 * 获取操作日志统计信息
 * @returns {Promise} 统计信息
 */
export const getLogStatistics = async () => {
  return request.get(SYSTEM_API.LOG_STATISTICS);
};

/**
 * 清理过期的操作日志
 * @param {number} days - 保留天数（默认90天）
 * @returns {Promise} 清理结果
 */
export const cleanExpiredLogs = async (days = 90) => {
  return request.delete(`${SYSTEM_API.LOG_LIST}/cleanup`, { params: { days } });
};

/**
 * 导出操作日志
 * @param {object} params - 查询参数（与 getLogList 相同）
 * @returns {Promise} 导出文件Blob
 */
export const exportLogs = async (params) => {
  return request.get(SYSTEM_API.LOG_EXPORT, {
    params,
    responseType: 'blob',
  });
};

/**
 * 导出所有操作日志相关API
 */
export default {
  getLogList,
  getLogDetail,
  getLatestLogs,
  getLogStatistics,
  cleanExpiredLogs,
  exportLogs,
};
