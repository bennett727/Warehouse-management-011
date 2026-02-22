/**
 * 设备状态变更审批API
 * 处理设备状态变更审批的申请、审批、查询等操作
 */
import { DEVICE_STATUS_APPROVAL_API } from '@/constants/apiConstants';
import request from '@/utils/request';

/**
 * 提交设备状态变更审批申请
 * @param {object} approvalData - 审批数据
 * @param {string} approvalData.deviceId - 设备ID
 * @param {string} approvalData.deviceCode - 设备编号
 * @param {string} approvalData.deviceName - 设备名称
 * @param {string} approvalData.currentStatus - 当前状态
 * @param {string} approvalData.targetStatus - 目标状态
 * @param {string} approvalData.reason - 变更原因
 * @param {string} approvalData.remark - 备注
 * @param {Array} approvalData.attachments - 附件列表
 * @returns {Promise} 申请结果
 */
export const submitStatusChangeApproval = async (approvalData) => {
  return request.post(DEVICE_STATUS_APPROVAL_API.BASE, approvalData);
};

/**
 * 获取审批申请列表
 * @param {object} params - 查询参数
 * @param {string} params.status - 审批状态 (pending/approved/rejected/cancelled)
 * @param {string} params.deviceCode - 设备编号
 * @param {string} params.applicant - 申请人
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 审批申请列表
 */
export const getStatusChangeApprovals = async (params) => {
  return request.get(DEVICE_STATUS_APPROVAL_API.LIST, { params });
};

/**
 * 获取待审批列表
 * @param {object} params - 查询参数
 * @returns {Promise} 待审批列表
 */
export const getPendingApprovals = async (params = {}) => {
  return request.get(DEVICE_STATUS_APPROVAL_API.PENDING, { params });
};

/**
 * 获取我的审批申请
 * @param {object} params - 查询参数
 * @returns {Promise} 我的审批申请列表
 */
export const getMyApprovals = async (params = {}) => {
  return request.get(DEVICE_STATUS_APPROVAL_API.MY, { params });
};

/**
 * 获取审批申请详情
 * @param {string} approvalId - 审批ID
 * @returns {Promise} 审批详情
 */
export const getApprovalDetail = async (approvalId) => {
  return request.get(DEVICE_STATUS_APPROVAL_API.DETAIL(approvalId));
};

/**
 * 审批通过
 * @param {string} approvalId - 审批ID
 * @param {object} approvalData - 审批数据
 * @param {string} approvalData.approvalComment - 审批意见
 * @returns {Promise} 审批结果
 */
export const approveStatusChange = async (approvalId, approvalData) => {
  return request.put(DEVICE_STATUS_APPROVAL_API.APPROVE(approvalId), approvalData);
};

/**
 * 审批拒绝
 * @param {string} approvalId - 审批ID
 * @param {object} rejectionData - 拒绝数据
 * @param {string} rejectionData.rejectionReason - 拒绝原因
 * @returns {Promise} 拒绝结果
 */
export const rejectStatusChange = async (approvalId, rejectionData) => {
  return request.put(DEVICE_STATUS_APPROVAL_API.REJECT(approvalId), rejectionData);
};

/**
 * 撤销审批申请
 * @param {string} approvalId - 审批ID
 * @param {object} data - 撤销数据
 * @param {string} data.cancelReason - 撤销原因
 * @returns {Promise} 撤销结果
 */
export const cancelStatusChangeApproval = async (approvalId, data) => {
  return request.put(DEVICE_STATUS_APPROVAL_API.CANCEL(approvalId), data);
};

/**
 * 批量审批
 * @param {object} batchData - 批量审批数据
 * @param {Array<string>} batchData.approvalIds - 审批ID列表
 * @param {string} batchData.action - 操作 (approve/reject)
 * @param {string} batchData.comment - 审批意见
 * @returns {Promise} 批量审批结果
 */
export const batchApproveStatusChange = async (batchData) => {
  return request.post(DEVICE_STATUS_APPROVAL_API.BATCH, batchData);
};

/**
 * 获取审批统计
 * @param {object} params - 查询参数
 * @returns {Promise} 审批统计数据
 */
export const getApprovalStats = async (params = {}) => {
  return request.get(DEVICE_STATUS_APPROVAL_API.STATS, { params });
};

/**
 * 设备状态变更审批API集合
 */
export const deviceStatusApprovalApi = {
  submit: submitStatusChangeApproval,
  list: getStatusChangeApprovals,
  pending: getPendingApprovals,
  my: getMyApprovals,
  detail: getApprovalDetail,
  approve: approveStatusChange,
  reject: rejectStatusChange,
  cancel: cancelStatusChangeApproval,
  batchApprove: batchApproveStatusChange,
  stats: getApprovalStats,
};
