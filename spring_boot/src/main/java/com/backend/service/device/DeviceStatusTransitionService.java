package com.backend.service.device;

import java.util.List;

import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;

/**
 * 设备状态流转服务接口
 * 
 * 功能说明：
 * 管理设备全生命周期中的状态流转规则
 * 支持自定义状态流转路径和审批流程
 * 
 * 状态流转规则：
 * - 待入库 → 在库 → 已安装 → 使用中
 * - 使用中 → 维护中/维修中 → 恢复使用/报废
 * - 任意状态 → 报废（需审批）
 * 
 * 审批流程：
 * - 关键状态变更需要审批
 * - 支持多级审批
 * - 审批通过后才可执行状态变更
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
public interface DeviceStatusTransitionService {

    /**
     * 验证状态流转是否合法
     * 
     * 根据设备类型和当前状态，验证目标状态是否允许
     * 
     * @param deviceId   设备ID
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @return true表示流转合法
     */
    boolean validateTransition(Long deviceId, DeviceStatus fromStatus, DeviceStatus toStatus);

    /**
     * 验证状态流转是否合法（带错误信息）
     * 
     * @param deviceId   设备ID
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @return 验证结果，包含是否合法和错误信息
     */
    TransitionValidationResult validateTransitionWithMessage(Long deviceId, DeviceStatus fromStatus,
            DeviceStatus toStatus);

    /**
     * 获取可用的目标状态列表
     * 
     * 根据设备当前状态，返回所有允许流转的目标状态
     * 
     * @param deviceId      设备ID
     * @param currentStatus 当前状态
     * @return 可用的目标状态列表
     */
    List<DeviceStatus> getAvailableTargetStatuses(Long deviceId, DeviceStatus currentStatus);

    /**
     * 获取可用的目标状态列表（根据设备类型）
     * 
     * @param deviceTypeId  设备类型ID
     * @param currentStatus 当前状态
     * @return 可用的目标状态列表
     */
    List<DeviceStatus> getAvailableTargetStatusesByType(Long deviceTypeId, DeviceStatus currentStatus);

    /**
     * 判断状态变更是否需要审批
     * 
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @return true表示需要审批
     */
    boolean requiresApproval(DeviceStatus fromStatus, DeviceStatus toStatus);

    /**
     * 执行状态流转
     * 
     * 验证通过后执行状态变更
     * 
     * @param device     设备对象
     * @param toStatus   目标状态
     * @param operatorId 操作人ID
     * @param remark     备注
     * @return 更新后的设备对象
     */
    Device executeTransition(Device device, DeviceStatus toStatus, Long operatorId, String remark);

    /**
     * 批量执行状态流转
     * 
     * @param deviceIds  设备ID列表
     * @param toStatus   目标状态
     * @param operatorId 操作人ID
     * @param remark     备注
     * @return 批量操作结果
     */
    BatchTransitionResult batchExecuteTransition(List<Long> deviceIds, DeviceStatus toStatus, Long operatorId, String remark);

    /**
     * 获取状态流转历史
     * 
     * @param deviceId 设备ID
     * @return 状态流转历史记录
     */
    List<StatusTransitionRecord> getTransitionHistory(Long deviceId);

    /**
     * 创建设备状态变更审批
     * 
     * @param deviceId    设备ID
     * @param fromStatus  当前状态
     * @param toStatus    目标状态
     * @param applicantId 申请人ID
     * @param reason      申请原因
     * @return 审批记录ID
     */
    Long createStatusApproval(Long deviceId, DeviceStatus fromStatus, DeviceStatus toStatus,
            Long applicantId, String reason);

    /**
     * 审批状态变更申请
     * 
     * @param approvalId 审批记录ID
     * @param approved   是否批准
     * @param approverId 审批人ID
     * @param remark     审批意见
     * @return 审批结果
     */
    boolean approveStatusTransition(Long approvalId, boolean approved, Long approverId, String remark);

    /**
     * 获取允许的流转状态列表
     *
     * @param currentStatus 当前状态
     * @return 允许的目标状态列表
     */
    List<StatusTransitionInfo> getAllowedTransitions(Integer currentStatus);

    /**
     * 批量状态流转结果
     */
    class BatchTransitionResult {
        private List<Long> successIds;
        private List<TransitionFailure> failures;
        private String message;
        private boolean success;

        public static BatchTransitionResult success(List<Long> successIds, List<TransitionFailure> failures) {
            BatchTransitionResult result = new BatchTransitionResult();
            result.successIds = successIds;
            result.failures = failures;
            result.success = true;
            result.message = "批量操作完成";
            return result;
        }

        public static BatchTransitionResult fail(String message) {
            BatchTransitionResult result = new BatchTransitionResult();
            result.success = false;
            result.message = message;
            return result;
        }

        public List<Long> getSuccessIds() {
            return successIds;
        }

        public void setSuccessIds(List<Long> successIds) {
            this.successIds = successIds;
        }

        public List<TransitionFailure> getFailures() {
            return failures;
        }

        public void setFailures(List<TransitionFailure> failures) {
            this.failures = failures;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }
    }

    /**
     * 状态流转失败信息
     */
    class TransitionFailure {
        private Long deviceId;
        private String errorMessage;

        public TransitionFailure(Long deviceId, String errorMessage) {
            this.deviceId = deviceId;
            this.errorMessage = errorMessage;
        }

        public Long getDeviceId() {
            return deviceId;
        }

        public void setDeviceId(Long deviceId) {
            this.deviceId = deviceId;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }

    /**
     * 状态流转信息
     */
    class StatusTransitionInfo {
        private Integer fromStatus;
        private String fromStatusName;
        private Integer toStatus;
        private String toStatusName;
        private boolean needApproval;

        public Integer getFromStatus() {
            return fromStatus;
        }

        public void setFromStatus(Integer fromStatus) {
            this.fromStatus = fromStatus;
        }

        public String getFromStatusName() {
            return fromStatusName;
        }

        public void setFromStatusName(String fromStatusName) {
            this.fromStatusName = fromStatusName;
        }

        public Integer getToStatus() {
            return toStatus;
        }

        public void setToStatus(Integer toStatus) {
            this.toStatus = toStatus;
        }

        public String getToStatusName() {
            return toStatusName;
        }

        public void setToStatusName(String toStatusName) {
            this.toStatusName = toStatusName;
        }

        public boolean isNeedApproval() {
            return needApproval;
        }

        public void setNeedApproval(boolean needApproval) {
            this.needApproval = needApproval;
        }
    }

    /**
     * 状态流转验证结果
     */
    class TransitionValidationResult {
        private boolean valid;
        private String message;
        private boolean requiresApproval;

        public static TransitionValidationResult valid() {
            TransitionValidationResult result = new TransitionValidationResult();
            result.valid = true;
            result.message = "状态流转合法";
            result.requiresApproval = false;
            return result;
        }

        public static TransitionValidationResult invalid(String message) {
            TransitionValidationResult result = new TransitionValidationResult();
            result.valid = false;
            result.message = message;
            return result;
        }

        public static TransitionValidationResult needApproval(String message) {
            TransitionValidationResult result = new TransitionValidationResult();
            result.valid = true;
            result.requiresApproval = true;
            result.message = message;
            return result;
        }

        public TransitionValidationResult setRequiresApproval(boolean requiresApproval) {
            this.requiresApproval = requiresApproval;
            return this;
        }

        // Getters and Setters
        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public boolean isRequiresApproval() {
            return requiresApproval;
        }
    }

    /**
     * 状态流转记录
     */
    class StatusTransitionRecord {
        private Long id;
        private Long deviceId;
        private DeviceStatus fromStatus;
        private DeviceStatus toStatus;
        private Long operatorId;
        private String operatorName;
        private String remark;
        private Long transitionTime;
        private boolean approved;
        private Long approverId;
        private String approverName;

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getDeviceId() {
            return deviceId;
        }

        public void setDeviceId(Long deviceId) {
            this.deviceId = deviceId;
        }

        public DeviceStatus getFromStatus() {
            return fromStatus;
        }

        public void setFromStatus(DeviceStatus fromStatus) {
            this.fromStatus = fromStatus;
        }

        public DeviceStatus getToStatus() {
            return toStatus;
        }

        public void setToStatus(DeviceStatus toStatus) {
            this.toStatus = toStatus;
        }

        public Long getOperatorId() {
            return operatorId;
        }

        public void setOperatorId(Long operatorId) {
            this.operatorId = operatorId;
        }

        public String getOperatorName() {
            return operatorName;
        }

        public void setOperatorName(String operatorName) {
            this.operatorName = operatorName;
        }

        public String getRemark() {
            return remark;
        }

        public void setRemark(String remark) {
            this.remark = remark;
        }

        public Long getTransitionTime() {
            return transitionTime;
        }

        public void setTransitionTime(Long transitionTime) {
            this.transitionTime = transitionTime;
        }

        public boolean isApproved() {
            return approved;
        }

        public void setApproved(boolean approved) {
            this.approved = approved;
        }

        public Long getApproverId() {
            return approverId;
        }

        public void setApproverId(Long approverId) {
            this.approverId = approverId;
        }

        public String getApproverName() {
            return approverName;
        }

        public void setApproverName(String approverName) {
            this.approverName = approverName;
        }
    }
}
