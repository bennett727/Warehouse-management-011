package com.backend.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.repository.DeviceRepository;
import com.backend.service.device.DeviceStatusTransitionService;

import lombok.extern.slf4j.Slf4j;

/**
 * 设备状态流转服务实现类
 *
 * 功能说明：
 * 实现设备状态流转规则引擎，管理设备状态变更的完整生命周期
 *
 * 状态流转规则：
 * - 在库(0) → 使用中(1)：设备出库
 * - 使用中(1) → 在库(0)：设备归还
 * - 在库(0) → 维修中(4)：设备报修
 * - 维修中(4) → 在库(0)：维修完成
 * - 维修中(4) → 报废(5)：无法修复
 * - 使用中(1) → 维修中(4)：使用中故障
 * - 使用中(1) → 报废(5)：严重损坏
 * - 报废(5) → 在库(0)：不允许（不可逆）
 *
 * 审批规则：
 * - 借用设备：需要审批
 * - 报废设备：需要审批
 * - 其他状态变更：不需要审批
 *
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Slf4j
@Service
public class DeviceStatusTransitionServiceImpl implements DeviceStatusTransitionService {

    @Autowired
    private DeviceRepository deviceRepository;

    // 状态流转规则表：当前状态 -> 允许的目标状态列表
    private static final Map<Integer, List<Integer>> TRANSITION_RULES = new HashMap<>();

    // 需要审批的状态流转
    private static final Set<String> NEED_APPROVAL_TRANSITIONS = new HashSet<>();

    static {
        // 初始化状态流转规则
        // 在库状态
        TRANSITION_RULES.put(DeviceStatus.IN_STOCK.getCode(),
                Arrays.asList(
                        DeviceStatus.IN_USE.getCode(),
                        DeviceStatus.MAINTENANCE.getCode()));

        // 使用中状态
        TRANSITION_RULES.put(DeviceStatus.IN_USE.getCode(),
                Arrays.asList(
                        DeviceStatus.IN_STOCK.getCode(),
                        DeviceStatus.MAINTENANCE.getCode(),
                        DeviceStatus.SCRAPPED.getCode()));

        // 维修中状态
        TRANSITION_RULES.put(DeviceStatus.MAINTENANCE.getCode(),
                Arrays.asList(
                        DeviceStatus.IN_STOCK.getCode(),
                        DeviceStatus.SCRAPPED.getCode()));

        // 报废状态（不可逆）
        TRANSITION_RULES.put(DeviceStatus.SCRAPPED.getCode(), Collections.emptyList());

        // 初始化需要审批的流转
        // 格式："当前状态->目标状态"
        NEED_APPROVAL_TRANSITIONS.add(
                DeviceStatus.IN_STOCK.getCode() + "->" +
                        DeviceStatus.IN_USE.getCode()); // 借用需要审批
        NEED_APPROVAL_TRANSITIONS.add(
                DeviceStatus.MAINTENANCE.getCode() + "->" +
                        DeviceStatus.SCRAPPED.getCode()); // 报废需要审批
        NEED_APPROVAL_TRANSITIONS.add(
                DeviceStatus.IN_USE.getCode() + "->" +
                        DeviceStatus.SCRAPPED.getCode()); // 使用中报废需要审批
    }

    /**
     * 验证状态流转是否合法
     *
     * @param deviceId   设备ID
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @return true表示流转合法
     */
    @Override
    public boolean validateTransition(Long deviceId, DeviceStatus fromStatus, DeviceStatus toStatus) {
        TransitionValidationResult result = validateTransitionWithMessage(deviceId, fromStatus, toStatus);
        return result.isValid();
    }

    /**
     * 验证状态流转是否合法（带错误信息）
     *
     * @param deviceId   设备ID
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @return 验证结果，包含是否合法和错误信息
     */
    @Override
    public TransitionValidationResult validateTransitionWithMessage(Long deviceId, DeviceStatus fromStatus,
            DeviceStatus toStatus) {
        Device device = deviceRepository.findById(deviceId).orElse(null);

        if (device == null) {
            return TransitionValidationResult.invalid("设备不存在");
        }

        Integer currentStatus = device.getStatus();

        if (!currentStatus.equals(fromStatus.getCode())) {
            return TransitionValidationResult.invalid(
                    String.format("设备当前状态[%s]与传入状态[%s]不匹配",
                            getStatusName(currentStatus), fromStatus.getDescription()));
        }

        return validateTransition(device, toStatus.getCode());
    }

    /**
     * 获取可用的目标状态列表
     *
     * @param deviceId      设备ID
     * @param currentStatus 当前状态
     * @return 可用的目标状态列表
     */
    @Override
    public List<DeviceStatus> getAvailableTargetStatuses(Long deviceId, DeviceStatus currentStatus) {
        List<Integer> allowedStatuses = TRANSITION_RULES.get(currentStatus.getCode());
        if (allowedStatuses == null || allowedStatuses.isEmpty()) {
            return Collections.emptyList();
        }

        return allowedStatuses.stream()
                .map(DeviceStatus::fromCode)
                .collect(Collectors.toList());
    }

    /**
     * 获取可用的目标状态列表（根据设备类型）
     *
     * @param deviceTypeId  设备类型ID
     * @param currentStatus 当前状态
     * @return 可用的目标状态列表
     */
    @Override
    public List<DeviceStatus> getAvailableTargetStatusesByType(Long deviceTypeId, DeviceStatus currentStatus) {
        return getAvailableTargetStatuses(null, currentStatus);
    }

    /**
     * 判断状态变更是否需要审批
     *
     * @param fromStatus 当前状态
     * @param toStatus   目标状态
     * @return true表示需要审批
     */
    @Override
    public boolean requiresApproval(DeviceStatus fromStatus, DeviceStatus toStatus) {
        return NEED_APPROVAL_TRANSITIONS.contains(fromStatus.getCode() + "->" + toStatus.getCode());
    }

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
    @Override
    public Long createStatusApproval(Long deviceId, DeviceStatus fromStatus, DeviceStatus toStatus,
            Long applicantId, String reason) {
        String approvalNo = submitApproval(deviceId, toStatus.getCode(), applicantId, reason);
        return Long.parseLong(approvalNo.substring(2));
    }

    /**
     * 验证状态流转是否合法
     *
     * @param device       设备对象
     * @param targetStatus 目标状态
     * @return 验证结果
     */
    private TransitionValidationResult validateTransition(Device device, Integer targetStatus) {
        if (device == null) {
            return TransitionValidationResult.invalid("设备不能为空");
        }

        Integer currentStatus = device.getStatus();

        // 验证状态值是否有效
        if (!isValidStatus(currentStatus)) {
            return TransitionValidationResult.invalid("当前设备状态无效: " + currentStatus);
        }

        if (!isValidStatus(targetStatus)) {
            return TransitionValidationResult.invalid("目标状态无效: " + targetStatus);
        }

        // 检查是否允许流转
        List<Integer> allowedStatuses = TRANSITION_RULES.get(currentStatus);
        if (allowedStatuses == null || !allowedStatuses.contains(targetStatus)) {
            String currentStatusName = getStatusName(currentStatus);
            String targetStatusName = getStatusName(targetStatus);
            return TransitionValidationResult.invalid(
                    String.format("不允许从状态[%s]流转到[%s]", currentStatusName, targetStatusName));
        }

        // 检查是否需要审批
        boolean needApproval = NEED_APPROVAL_TRANSITIONS.contains(currentStatus + "->" + targetStatus);

        return TransitionValidationResult.valid().setRequiresApproval(needApproval);
    }

    /**
     * 执行状态流转
     *
     * @param deviceId     设备ID
     * @param targetStatus 目标状态
     * @param operatorId   操作人ID
     * @param remark       备注
     * @return 更新后的设备
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Device executeTransition(Device device, DeviceStatus toStatus, Long operatorId, String remark) {
        Long deviceId = device.getId();
        Integer targetStatus = toStatus.getCode();

        // 1. 验证流转合法性
        TransitionValidationResult validationResult = validateTransition(device, targetStatus);
        if (!validationResult.isValid()) {
            throw new BusinessException(ErrorCode.DEVICE_STATUS_TRANSITION_INVALID, validationResult.getMessage());
        }

        // 2. 如果需要审批，抛出异常
        if (validationResult.isRequiresApproval()) {
            throw new BusinessException(ErrorCode.DEVICE_STATUS_NEED_APPROVAL,
                    "此状态变更需要审批，请先提交审批申请");
        }

        Integer oldStatus = device.getStatus();

        // 3. 执行状态变更
        device.setStatus(targetStatus);
        device.setUpdateTime(LocalDateTime.now());

        // 4. 保存设备
        Device updatedDevice = deviceRepository.save(device);

        // 5. 记录流转历史（可以扩展为保存到历史表）
        logTransitionHistory(deviceId, oldStatus, targetStatus, operatorId, remark);

        log.info("设备状态流转成功: deviceId={}, {} -> {}, operatorId={}",
                deviceId, getStatusName(oldStatus), getStatusName(targetStatus), operatorId);

        return updatedDevice;
    }

    /**
     * 批量执行状态流转
     *
     * @param deviceIds    设备ID列表
     * @param targetStatus 目标状态
     * @param operatorId   操作人ID
     * @param remark       备注
     * @return 批量操作结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public BatchTransitionResult batchExecuteTransition(List<Long> deviceIds, DeviceStatus toStatus, Long operatorId,
            String remark) {
        if (deviceIds == null || deviceIds.isEmpty()) {
            return BatchTransitionResult.success(new ArrayList<>(), new ArrayList<>());
        }

        List<Long> successIds = new ArrayList<>();
        List<TransitionFailure> failures = new ArrayList<>();

        for (Long deviceId : deviceIds) {
            try {
                Device device = deviceRepository.findById(deviceId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
                executeTransition(device, toStatus, operatorId, remark);
                successIds.add(deviceId);
            } catch (Exception e) {
                log.error("批量状态流转失败: deviceId={}, error={}", deviceId, e.getMessage());
                failures.add(new TransitionFailure(deviceId, e.getMessage()));
            }
        }

        return BatchTransitionResult.success(successIds, failures);
    }

    /**
     * 提交状态变更审批
     *
     * @param deviceId     设备ID
     * @param targetStatus 目标状态
     * @param applicantId  申请人ID
     * @param reason       申请原因
     * @return 审批单号
     */
    public String submitApproval(Long deviceId, Integer targetStatus, Long applicantId, String reason) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

        // 1. 验证流转合法性
        TransitionValidationResult validationResult = validateTransition(device, targetStatus);
        if (!validationResult.isValid()) {
            throw new BusinessException(ErrorCode.DEVICE_STATUS_TRANSITION_INVALID, validationResult.getMessage());
        }

        // 2. 验证是否需要审批
        if (!validationResult.isRequiresApproval()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "此状态变更不需要审批");
        }

        // 3. 生成审批单号
        String approvalNo = generateApprovalNo();

        // 4. 保存审批申请（可以扩展为保存到审批表）
        log.info("提交状态变更审批: approvalNo={}, deviceId={}, targetStatus={}, applicantId={}",
                approvalNo, deviceId, targetStatus, applicantId);

        // TODO: 实现审批流程，保存到审批表

        return approvalNo;
    }

    /**
     * 审批状态变更申请
     *
     * @param approvalId 审批记录ID
     * @param approved   是否通过
     * @param approverId 审批人ID
     * @param remark     审批意见
     * @return 审批结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveStatusTransition(Long approvalId, boolean approved, Long approverId, String remark) {
        // TODO: 实现审批逻辑
        log.info("审批状态变更申请: approvalId={}, approved={}, approverId={}",
                approvalId, approved, approverId);
        return true;
    }

    /**
     * 获取设备状态流转历史
     *
     * @param deviceId 设备ID
     * @return 流转历史列表
     */
    @Override
    public List<StatusTransitionRecord> getTransitionHistory(Long deviceId) {
        // TODO: 从流转历史表查询
        // 临时返回空列表
        return new ArrayList<>();
    }

    /**
     * 获取允许的流转状态列表
     *
     * @param currentStatus 当前状态
     * @return 允许的目标状态列表
     */
    @Override
    public List<StatusTransitionInfo> getAllowedTransitions(Integer currentStatus) {
        List<Integer> allowedStatuses = TRANSITION_RULES.get(currentStatus);
        if (allowedStatuses == null || allowedStatuses.isEmpty()) {
            return Collections.emptyList();
        }

        return allowedStatuses.stream()
                .map(status -> {
                    StatusTransitionInfo info = new StatusTransitionInfo();
                    info.setFromStatus(currentStatus);
                    info.setFromStatusName(getStatusName(currentStatus));
                    info.setToStatus(status);
                    info.setToStatusName(getStatusName(status));
                    info.setNeedApproval(NEED_APPROVAL_TRANSITIONS.contains(currentStatus + "->" + status));
                    return info;
                })
                .collect(Collectors.toList());
    }

    // ==================== 私有方法 ====================

    /**
     * 验证状态值是否有效
     */
    private boolean isValidStatus(Integer status) {
        if (status == null) {
            return false;
        }
        for (DeviceStatus ds : DeviceStatus.values()) {
            if (ds.getCode() == status) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取状态名称
     */
    private String getStatusName(Integer status) {
        for (DeviceStatus ds : DeviceStatus.values()) {
            if (ds.getCode() == status) {
                return ds.getDescription();
            }
        }
        return "未知状态";
    }

    /**
     * 记录流转历史
     */
    private void logTransitionHistory(Long deviceId, Integer oldStatus, Integer newStatus,
            Long operatorId, String remark) {
        // TODO: 保存到流转历史表
        log.debug("记录设备状态流转历史: deviceId={}, {} -> {}, operatorId={}",
                deviceId, getStatusName(oldStatus), getStatusName(newStatus), operatorId);
    }

    /**
     * 生成审批单号
     */
    private String generateApprovalNo() {
        return "SP" + System.currentTimeMillis();
    }
}
