import { DEVICE_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取报废记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 关键词（设备编号/名称）
 * @param {number} params.typeId - 设备类型ID
 * @param {number} params.areaId - 区域ID
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getScrapRecords = (params) => {
  return request({
    url: DEVICE_API.SCRAP_RECORDS,
    method: 'get',
    params: {
      ...params,
      status: 5,
    },
  });
};

/**
 * 获取报废记录详情
 * @param {string} id - 记录ID
 * @returns {Promise}
 */
export const getScrapRecordDetail = (id) => {
  return request({
    url: DEVICE_API.SCRAP_DETAIL(id),
    method: 'get',
  });
};

/**
 * 审批报废记录
 * @param {string} id - 记录ID
 * @param {Object} data - 审批数据
 * @param {string} data.approvalStatus - 审批状态（approved/rejected）
 * @param {string} data.approvalRemark - 审批备注
 * @returns {Promise}
 */
export const approveScrapRecord = (id, data) => {
  return request({
    url: DEVICE_API.SCRAP_APPROVE(id),
    method: 'post',
    data,
  });
};

/**
 * 拒绝报废记录
 * @param {string} id - 记录ID
 * @param {Object} data - 拒绝数据
 * @param {string} data.rejectionReason - 拒绝原因
 * @returns {Promise}
 */
export const rejectScrapRecord = (id, data) => {
  return request({
    url: DEVICE_API.SCRAP_REJECT(id),
    method: 'post',
    data,
  });
};

/**
 * 导出报废记录
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const exportScrapRecords = (params) => {
  return request({
    url: DEVICE_API.SCRAP_EXPORT,
    method: 'get',
    params,
    responseType: 'blob',
  });
};
