import { BUSINESS_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 获取业务审批列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.approvalNo - 审批编号
 * @param {string} params.businessType - 业务类型
 * @param {string} params.applicant - 申请人
 * @param {string} params.status - 审批状态
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getApprovalList = (params) => {
  return request({
    url: BUSINESS_API.APPROVAL_LIST || '/business/approval/list',
    method: 'get',
    params,
  });
};

/**
 * 获取审批详情
 * @param {string} id - 审批ID
 * @returns {Promise}
 */
export const getApprovalDetail = (id) => {
  return request({
    url: BUSINESS_API.APPROVAL_DETAIL(id) || `/business/approval/${id}`,
    method: 'get',
  });
};

/**
 * 审批通过
 * @param {string} id - 审批ID
 * @param {string} comment - 审批意见
 * @returns {Promise}
 */
export const approveBusiness = (id, comment) => {
  return request({
    url: BUSINESS_API.APPROVAL_APPROVE(id) || `/business/approval/${id}/approve`,
    method: 'post',
    data: { comment },
  });
};

/**
 * 审批驳回
 * @param {string} id - 审批ID
 * @param {string} comment - 审批意见
 * @returns {Promise}
 */
export const rejectBusiness = (id, comment) => {
  return request({
    url: BUSINESS_API.APPROVAL_REJECT(id) || `/business/approval/${id}/reject`,
    method: 'post',
    data: { comment },
  });
};

/**
 * 获取审批统计信息
 * @returns {Promise}
 */
export const getApprovalStatistics = () => {
  return request({
    url: BUSINESS_API.APPROVAL_STATISTICS || '/business/approval/statistics',
    method: 'get',
  });
};

/**
 * 获取待审批数量
 * @returns {Promise}
 */
export const getPendingApprovalCount = () => {
  return request({
    url: BUSINESS_API.APPROVAL_PENDING_COUNT || '/business/approval/pending-count',
    method: 'get',
  });
};

/**
 * 批量审批通过
 * @param {string[]} ids - 审批ID数组
 * @param {string} comment - 审批意见
 * @returns {Promise}
 */
export const batchApproveBusiness = (ids, comment) => {
  return request({
    url: BUSINESS_API.APPROVAL_BATCH_APPROVE || '/business/approval/batch-approve',
    method: 'post',
    data: { ids, comment },
  });
};

/**
 * 批量审批驳回
 * @param {string[]} ids - 审批ID数组
 * @param {string} comment - 审批意见
 * @returns {Promise}
 */
export const batchRejectBusiness = (ids, comment) => {
  return request({
    url: BUSINESS_API.APPROVAL_BATCH_REJECT || '/business/approval/batch-reject',
    method: 'post',
    data: { ids, comment },
  });
};
