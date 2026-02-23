package com.backend.service.inventory.impl;

import com.backend.entity.Device;
import com.backend.entity.InventoryAdjustment;
import com.backend.enums.ApprovalStatus;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryAdjustmentRepository;
import com.backend.service.inventory.InventoryAdjustmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class InventoryAdjustmentServiceImpl implements InventoryAdjustmentService {

    private static final Logger logger = LoggerFactory.getLogger(InventoryAdjustmentServiceImpl.class);

    private final InventoryAdjustmentRepository adjustmentRepository;
    private final DeviceRepository deviceRepository;

    public InventoryAdjustmentServiceImpl(InventoryAdjustmentRepository adjustmentRepository, DeviceRepository deviceRepository) {
        this.adjustmentRepository = adjustmentRepository;
        this.deviceRepository = deviceRepository;
    }

    @Override
    public List<InventoryAdjustment> getAllAdjustments() {
        logger.info("获取所有库存调整记录");
        return adjustmentRepository.findAll();
    }

    @Override
    public InventoryAdjustment getAdjustmentById(Long id) {
        logger.info("获取库存调整记录，ID: {}", id);
        return adjustmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryAdjustment", "id", id));
    }

    @Override
    public List<InventoryAdjustment> getMyAdjustments(Long applicantId) {
        logger.info("获取我的库存调整记录，申请人ID: {}", applicantId);
        Pageable pageable = PageRequest.of(0, 100);
        Page<InventoryAdjustment> page = adjustmentRepository.findByApplicantIdOrderByCreateTimeDesc(applicantId, pageable);
        return page.getContent();
    }

    @Override
    @Transactional
    public InventoryAdjustment createAdjustment(InventoryAdjustment adjustment) {
        logger.info("创建库存调整申请，设备ID: {}", adjustment.getDeviceId());

        Device device = deviceRepository.findById(adjustment.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", adjustment.getDeviceId()));

        adjustment.setDeviceCode(device.getDeviceCode());
        adjustment.setDeviceName(device.getDeviceName());
        adjustment.setBeforeQuantity(device.getCurrentStock() != null ? device.getCurrentStock() : 0);
        adjustment.setAdjustmentQuantity(adjustment.getAfterQuantity() - adjustment.getBeforeQuantity());

        if (adjustment.getAdjustmentQuantity() == 0) {
            throw new BusinessException("调整数量不能为0");
        }

        adjustment.setStatus(ApprovalStatus.PENDING.getCode());
        adjustment.setAdjustmentNo(generateAdjustmentNo());
        adjustment.setCreateTime(LocalDateTime.now());

        InventoryAdjustment savedAdjustment = adjustmentRepository.save(adjustment);
        logger.info("库存调整申请创建成功，ID: {}", savedAdjustment.getId());

        return savedAdjustment;
    }

    @Override
    @Transactional
    public InventoryAdjustment approveAdjustment(Long id, String comment, Long approverId, String approverName) {
        logger.info("批准库存调整申请，ID: {}", id);

        InventoryAdjustment adjustment = getAdjustmentById(id);

        if (!adjustment.getStatus().equals(ApprovalStatus.PENDING.getCode())) {
            throw new BusinessException("只能审批待审批状态的申请");
        }

        Device device = deviceRepository.findById(adjustment.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("设备不存在: " + adjustment.getDeviceId()));

        device.setCurrentStock(adjustment.getAfterQuantity());
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        adjustment.setStatus(ApprovalStatus.APPROVED.getCode());
        adjustment.setApproverId(approverId);
        adjustment.setApproverName(approverName);
        adjustment.setApprovalTime(LocalDateTime.now());
        adjustment.setApprovalComment(comment);
        adjustment.setUpdateTime(LocalDateTime.now());

        InventoryAdjustment updatedAdjustment = adjustmentRepository.save(adjustment);
        logger.info("库存调整申请批准成功，ID: {}", updatedAdjustment.getId());

        return updatedAdjustment;
    }

    @Override
    @Transactional
    public void deleteAdjustment(Long id) {
        logger.info("删除库存调整记录，ID: {}", id);

        if (!adjustmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("库存调整记录不存在: " + id);
        }

        adjustmentRepository.deleteById(id);
        logger.info("库存调整记录删除成功，ID: {}", id);
    }

    private String generateAdjustmentNo() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return "ADJ" + datePrefix + uuid;
    }
}