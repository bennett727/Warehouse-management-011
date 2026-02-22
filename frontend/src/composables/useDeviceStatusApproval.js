/**
 * 设备状态变更审批管理 Composable
 * 提供设备状态变更审批的业务逻辑封装
 */
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, reactive, ref } from 'vue';

import {
  approveStatusChange,
  batchApproveStatusChange,
  cancelStatusChangeApproval,
  getApprovalDetail,
  getMyApprovals,
  getPendingApprovals,
  getStatusChangeApprovals,
  rejectStatusChange,
  submitStatusChangeApproval,
} from '@/api/device/device-status-approval';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useDeviceStatusApproval');

/**
 * 设备状态变更审批管理 Hook
 * @returns {object} 审批管理相关状态和方法
 */
export function useDeviceStatusApproval() {
  const loading = reactive({
    list: false,
    detail: false,
    submit: false,
    approve: false,
    reject: false,
    cancel: false,
    batch: false,
  });

  const approvalList = ref([]);
  const pendingList = ref([]);
  const myApprovalList = ref([]);
  const approvalDetail = ref(null);
  const approvalStats = ref({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const queryParams = reactive({
    status: '',
    deviceCode: '',
    applicant: '',
    startTime: '',
    endTime: '',
  });

  const approvalStatusOptions = [
    { label: '待审批', value: 'pending', type: 'warning' },
    { label: '已通过', value: 'approved', type: 'success' },
    { label: '已拒绝', value: 'rejected', type: 'danger' },
    { label: '已撤销', value: 'cancelled', type: 'info' },
  ];

  const deviceStatusOptions = [
    { label: '在库', value: 'in_stock' },
    { label: '已安装', value: 'installed' },
    { label: '维修中', value: 'repairing' },
    { label: '已报废', value: 'scrapped' },
  ];

  const getStatusType = (status) => {
    const option = approvalStatusOptions.find((item) => item.value === status);
    return option?.type || 'info';
  };

  const getStatusText = (status) => {
    const option = approvalStatusOptions.find((item) => item.value === status);
    return option?.label || status;
  };

  const getDeviceStatusText = (status) => {
    const option = deviceStatusOptions.find((item) => item.value === status);
    return option?.label || status;
  };

  const loadApprovalList = async () => {
    loading.list = true;
    try {
      const params = {
        ...queryParams,
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      const response = await getStatusChangeApprovals(params);
      if (response.success) {
        approvalList.value = response.data.records || response.data || [];
        pagination.total = response.data.total || 0;
      }
    } catch (error) {
      logger.error('[useDeviceStatusApproval.loadApprovalList] 加载审批列表失败:', error);
      ElMessage.error('加载审批列表失败');
    } finally {
      loading.list = false;
    }
  };

  const loadPendingApprovals = async () => {
    loading.list = true;
    try {
      const response = await getPendingApprovals();
      if (response.success) {
        pendingList.value = response.data || [];
      }
    } catch (error) {
      logger.error('[useDeviceStatusApproval.loadPendingApprovals] 加载待审批列表失败:', error);
      ElMessage.error('加载待审批列表失败');
    } finally {
      loading.list = false;
    }
  };

  const loadMyApprovals = async () => {
    loading.list = true;
    try {
      const response = await getMyApprovals();
      if (response.success) {
        myApprovalList.value = response.data.records || response.data || [];
      }
    } catch (error) {
      logger.error('[useDeviceStatusApproval.loadMyApprovals] 加载我的审批列表失败:', error);
      ElMessage.error('加载我的审批列表失败');
    } finally {
      loading.list = false;
    }
  };

  const loadApprovalDetail = async (approvalId) => {
    loading.detail = true;
    try {
      const response = await getApprovalDetail(approvalId);
      if (response.success) {
        approvalDetail.value = response.data;
      }
    } catch (error) {
      logger.error('[useDeviceStatusApproval.loadApprovalDetail] 加载审批详情失败:', error);
      ElMessage.error('加载审批详情失败');
    } finally {
      loading.detail = false;
    }
  };

  const submitApproval = async (approvalData) => {
    loading.submit = true;
    try {
      const response = await submitStatusChangeApproval(approvalData);
      if (response.success) {
        ElMessage.success('提交审批申请成功');
        await loadApprovalList();
        return response.data;
      }
      ElMessage.error(response.message || '提交审批申请失败');
      throw new Error(response.message || '提交审批申请失败');
    } catch (error) {
      logger.error('[useDeviceStatusApproval.submitApproval] 提交审批申请失败:', error);
      throw error;
    } finally {
      loading.submit = false;
    }
  };

  const approve = async (approvalId, approvalData = {}) => {
    loading.approve = true;
    try {
      const response = await approveStatusChange(approvalId, approvalData);
      if (response.success) {
        ElMessage.success('审批通过成功');
        await loadApprovalList();
        return true;
      }
      ElMessage.error(response.message || '审批通过失败');
      return false;
    } catch (error) {
      logger.error('[useDeviceStatusApproval.approve] 审批通过失败:', error);
      ElMessage.error('审批通过失败');
      return false;
    } finally {
      loading.approve = false;
    }
  };

  const reject = async (approvalId, rejectionData = {}) => {
    loading.reject = true;
    try {
      const response = await rejectStatusChange(approvalId, rejectionData);
      if (response.success) {
        ElMessage.success('审批拒绝成功');
        await loadApprovalList();
        return true;
      }
      ElMessage.error(response.message || '审批拒绝失败');
      return false;
    } catch (error) {
      logger.error('[useDeviceStatusApproval.reject] 审批拒绝失败:', error);
      ElMessage.error('审批拒绝失败');
      return false;
    } finally {
      loading.reject = false;
    }
  };

  const cancel = async (approvalId, cancelReason = '') => {
    loading.cancel = true;
    try {
      const response = await cancelStatusChangeApproval(approvalId, { cancelReason });
      if (response.success) {
        ElMessage.success('撤销申请成功');
        await loadApprovalList();
        return true;
      }
      ElMessage.error(response.message || '撤销申请失败');
      return false;
    } catch (error) {
      logger.error('[useDeviceStatusApproval.cancel] 撤销申请失败:', error);
      ElMessage.error('撤销申请失败');
      return false;
    } finally {
      loading.cancel = false;
    }
  };

  const batchApprove = async (approvalIds, action, comment = '') => {
    loading.batch = true;
    try {
      const response = await batchApproveStatusChange({
        ids: approvalIds,
        action,
        comment,
      });
      if (response.success) {
        ElMessage.success('批量审批成功');
        await loadApprovalList();
        return true;
      }
      ElMessage.error(response.message || '批量审批失败');
      return false;
    } catch (error) {
      logger.error('[useDeviceStatusApproval.batchApprove] 批量审批失败:', error);
      ElMessage.error('批量审批失败');
      return false;
    } finally {
      loading.batch = false;
    }
  };

  const handleApprove = async (approvalId, comment = '') => {
    try {
      await ElMessageBox.confirm('确定要通过该审批申请吗？', '确认审批', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      return await approve(approvalId, { comment });
    } catch {
      return false;
    }
  };

  const handleReject = async (approvalId, reason = '') => {
    if (!reason) {
      try {
        const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝审批', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '请输入拒绝原因',
        });
        reason = value;
      } catch {
        return false;
      }
    }
    return await reject(approvalId, { comment: reason });
  };

  const handleCancel = async (approvalId) => {
    try {
      const { value } = await ElMessageBox.prompt('请输入撤销原因', '撤销申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入撤销原因',
      });
      return await cancel(approvalId, value);
    } catch {
      return false;
    }
  };

  const handleBatchApprove = async (approvalIds) => {
    try {
      const { value } = await ElMessageBox.prompt('请输入审批意见', '批量审批', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '可选',
      });
      return await batchApprove(approvalIds, 'approve', value || '');
    } catch {
      return false;
    }
  };

  const handleBatchReject = async (approvalIds) => {
    try {
      const { value } = await ElMessageBox.prompt('请输入拒绝原因', '批量拒绝', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入拒绝原因',
      });
      return await batchApprove(approvalIds, 'reject', value);
    } catch {
      return false;
    }
  };

  const resetQuery = () => {
    Object.assign(queryParams, {
      status: '',
      deviceCode: '',
      applicant: '',
      startTime: '',
      endTime: '',
    });
    pagination.current = 1;
  };

  const handlePageChange = (page) => {
    pagination.current = page;
    loadApprovalList();
  };

  const handleSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.current = 1;
    loadApprovalList();
  };

  const pendingCount = computed(() => pendingList.value.length);

  return {
    loading,
    approvalList,
    pendingList,
    myApprovalList,
    approvalDetail,
    approvalStats,
    pagination,
    queryParams,
    approvalStatusOptions,
    deviceStatusOptions,
    pendingCount,
    getStatusType,
    getStatusText,
    getDeviceStatusText,
    loadApprovalList,
    loadPendingApprovals,
    loadMyApprovals,
    loadApprovalDetail,
    submitApproval,
    approve,
    reject,
    cancel,
    batchApprove,
    handleApprove,
    handleReject,
    handleCancel,
    handleBatchApprove,
    handleBatchReject,
    resetQuery,
    handlePageChange,
    handleSizeChange,
  };
}
