package com.backend.service.devicestatus.impl;

import com.backend.entity.Device;
import com.backend.entity.DeviceStatusApproval;
import com.backend.enums.ApprovalStatus;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceStatusApprovalRepository;
import com.backend.service.devicestatus.DeviceStatusApprovalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DeviceStatusApprovalServiceImpl implements DeviceStatusApprovalService {

    private static final Logger logger = LoggerFactory.getLogger(DeviceStatusApprovalServiceImpl.class);

    private final DeviceStatusApprovalRepository approvalRepository;
    private final DeviceRepository deviceRepository;

    public DeviceStatusApprovalServiceImpl(DeviceStatusApprovalRepository approvalRepository, DeviceRepository deviceRepository) {
        this.approvalRepository = approvalRepository;
        this.deviceRepository = deviceRepository;
    }

    @Override
    public List<DeviceStatusApproval> getAllApprovals() {
        logger.info("获取所有设备状态审批记录");
        return approvalRepository.findAll();
    }

    @Override
    public DeviceStatusApproval getApprovalById(Long id) {
        logger.info("获取设备状态审批记录，ID: {}", id);
        return approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceStatusApproval", "id", id));
    }

    @Override
    public List<DeviceStatusApproval> getPendingApprovals() {
        logger.info("获取待审批的设备状态审批记录");
        Pageable pageable = PageRequest.of(0, 100);
        Page<DeviceStatusApproval> page = approvalRepository.findByStatusOrderByCreateTimeDesc(
                ApprovalStatus.PENDING.getCode(), pageable);
        return page.getContent();
    }

    @Override
    public List<DeviceStatusApproval> getMyApprovals(Long applicantId) {
        logger.info("获取我的设备状态审批记录，申请人ID: {}", applicantId);
        Pageable pageable = PageRequest.of(0, 100);
        Page<DeviceStatusApproval> page = approvalRepository.findByApplicantIdOrderByCreateTimeDesc(applicantId, pageable);
        return page.getContent();
    }

    @Override
    @Transactional
    public DeviceStatusApproval createApproval(DeviceStatusApproval approval) {
        logger.info("创建设备状态审批申请，设备ID: {}", approval.getDeviceId());

        Device device = deviceRepository.findById(approval.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", approval.getDeviceId()));

        if (!device.getStatus().equals(approval.getFromStatus())) {
            throw new BusinessException("设备当前状态与申请的源状态不匹配");
        }

        approval.setStatus(ApprovalStatus.PENDING.getCode());
        approval.setCreateTime(LocalDateTime.now());

        DeviceStatusApproval savedApproval = approvalRepository.save(approval);
        logger.info("设备状态审批申请创建成功，ID: {}", savedApproval.getId());

        return savedApproval;
    }

    @Override
    @Transactional
    public DeviceStatusApproval approveApproval(Long id, String comment, Long approverId, String approverName) {
        logger.info("批准设备状态审批申请，ID: {}", id);

        DeviceStatusApproval approval = getApprovalById(id);

        if (!approval.getStatus().equals(ApprovalStatus.PENDING.getCode())) {
            throw new BusinessException("只能审批待审批状态的申请");
        }

        Device device = deviceRepository.findById(approval.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", approval.getDeviceId()));

        device.setStatus(approval.getToStatus());
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        approval.setStatus(ApprovalStatus.APPROVED.getCode());
        approval.setApproverId(approverId);
        approval.setApproverName(approverName);
        approval.setApprovalTime(LocalDateTime.now());
        approval.setApprovalComment(comment);
        approval.setUpdateTime(LocalDateTime.now());

        DeviceStatusApproval updatedApproval = approvalRepository.save(approval);
        logger.info("设备状态审批申请批准成功，ID: {}", updatedApproval.getId());

        return updatedApproval;
    }

    @Override
    @Transactional
    public DeviceStatusApproval rejectApproval(Long id, String comment, Long approverId, String approverName) {
        logger.info("拒绝设备状态审批申请，ID: {}", id);

        DeviceStatusApproval approval = getApprovalById(id);

        if (!approval.getStatus().equals(ApprovalStatus.PENDING.getCode())) {
            throw new BusinessException("只能审批待审批状态的申请");
        }

        approval.setStatus(ApprovalStatus.REJECTED.getCode());
        approval.setApproverId(approverId);
        approval.setApproverName(approverName);
        approval.setApprovalTime(LocalDateTime.now());
        approval.setApprovalComment(comment);
        approval.setUpdateTime(LocalDateTime.now());

        DeviceStatusApproval updatedApproval = approvalRepository.save(approval);
        logger.info("设备状态审批申请拒绝成功，ID: {}", updatedApproval.getId());

        return updatedApproval;
    }

    @Override
    @Transactional
    public DeviceStatusApproval cancelApproval(Long id) {
        logger.info("取消设备状态审批申请，ID: {}", id);

        DeviceStatusApproval approval = getApprovalById(id);

        if (!approval.getStatus().equals(ApprovalStatus.PENDING.getCode())) {
            throw new BusinessException("只能取消待审批状态的申请");
        }

        approval.setStatus(ApprovalStatus.CANCELLED.getCode());
        approval.setUpdateTime(LocalDateTime.now());

        DeviceStatusApproval updatedApproval = approvalRepository.save(approval);
        logger.info("设备状态审批申请取消成功，ID: {}", updatedApproval.getId());

        return updatedApproval;
    }

    @Override
    @Transactional
    public void batchApprove(List<Long> ids, String comment, Long approverId, String approverName) {
        logger.info("批量批准设备状态审批申请，数量: {}", ids.size());

        for (Long id : ids) {
            try {
                approveApproval(id, comment, approverId, approverName);
            } catch (Exception e) {
                logger.error("批量批准失败，ID: {}, 错误: {}", id, e.getMessage());
            }
        }

        logger.info("批量批准设备状态审批申请完成");
    }

    @Override
    @Transactional
    public void batchReject(List<Long> ids, String comment, Long approverId, String approverName) {
        logger.info("批量拒绝设备状态审批申请，数量: {}", ids.size());

        for (Long id : ids) {
            try {
                rejectApproval(id, comment, approverId, approverName);
            } catch (Exception e) {
                logger.error("批量拒绝失败，ID: {}, 错误: {}", id, e.getMessage());
            }
        }

        logger.info("批量拒绝设备状态审批申请完成");
    }

    @Override
    public Map<String, Object> getStats() {
        logger.info("获取设备状态审批统计");

        Map<String, Object> stats = new HashMap<>();

        List<Object[]> statusStats = approvalRepository.countByStatusGrouped();

        for (Object[] stat : statusStats) {
            Integer status = (Integer) stat[0];
            Long count = ((Number) stat[1]).longValue();

            ApprovalStatus approvalStatus = ApprovalStatus.fromCode(status);
            stats.put(approvalStatus.name().toLowerCase(Locale.ROOT) + "Count", count);
        }

        stats.put("totalCount", approvalRepository.count());

        return stats;
    }
}