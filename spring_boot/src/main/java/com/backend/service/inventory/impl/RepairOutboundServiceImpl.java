package com.backend.service.inventory.impl;

import com.backend.dto.repair.RepairOutboundDTO;
import com.backend.dto.repair.RepairOutboundProgressDTO;
import com.backend.dto.repair.RepairOutboundCompleteDTO;
import com.backend.entity.*;
import com.backend.enums.DeviceStatus;
import com.backend.repository.*;
import com.backend.service.BusinessRecordLinkageService;
import com.backend.service.inventory.RepairOutboundService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 修复出库服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RepairOutboundServiceImpl implements RepairOutboundService {

    private final RepairOutboundRepository repairOutboundRepository;
    private final RepairRecordRepository repairRecordRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final BusinessRecordLinkageService businessRecordLinkageService;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RepairOutbound createRepairOutbound(RepairOutboundDTO dto, Long creatorId) {
        log.info("创建修复出库单，设备ID: {}, 创建人ID: {}", dto.getDeviceId(), creatorId);

        // 验证设备
        Device device = deviceRepository.findById(dto.getDeviceId())
                .orElseThrow(() -> new RuntimeException("设备不存在"));

        // 验证库存
        List<Inventory> inventories = inventoryRepository.findByDeviceId(device.getId());
        if (inventories.isEmpty()) {
            throw new RuntimeException("设备库存不存在");
        }
        Inventory inventory = inventories.get(0);

        if (inventory.getQuantity() <= 0) {
            throw new RuntimeException("设备库存不足，无法出库");
        }

        // 创建修复出库记录
        RepairOutbound repairOutbound = new RepairOutbound();
        repairOutbound.setRepairNo(generateRepairNo());
        repairOutbound.setDevice(device);
        repairOutbound.setDeviceId(device.getId());
        repairOutbound.setFaultDescription(dto.getFaultDescription());

        // 处理故障图片
        if (dto.getFaultImages() != null && !dto.getFaultImages().isEmpty()) {
            try {
                repairOutbound.setFaultImages(objectMapper.writeValueAsString(dto.getFaultImages()));
            } catch (JsonProcessingException e) {
                log.error("故障图片序列化失败", e);
            }
        }

        // 设置修复人员
        if (dto.getRepairPersonId() != null) {
            User repairPerson = userRepository.findById(dto.getRepairPersonId())
                    .orElseThrow(() -> new RuntimeException("修复人员不存在"));
            repairOutbound.setRepairPerson(repairPerson);
            repairOutbound.setRepairPersonId(repairPerson.getId());
        }

        // 设置出库人员
        if (dto.getOperatorId() != null) {
            User operator = userRepository.findById(dto.getOperatorId())
                    .orElseThrow(() -> new RuntimeException("出库人员不存在"));
            repairOutbound.setOperator(operator);
            repairOutbound.setOperatorId(operator.getId());
        }

        repairOutbound.setEstimatedDays(dto.getEstimatedDays());
        repairOutbound.setRepairLocation(dto.getRepairLocation());
        repairOutbound.setRepairVendor(dto.getRepairVendor());
        repairOutbound.setStatus(1); // 已出库
        repairOutbound.setOutboundTime(LocalDateTime.now());

        // 计算预计完成时间
        if (dto.getEstimatedDays() != null) {
            repairOutbound.setEstimatedCompleteTime(
                    LocalDateTime.now().plusDays(dto.getEstimatedDays())
            );
        }

        repairOutbound.setRemark(dto.getRemark());

        // 设置创建人
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("创建人不存在"));
        repairOutbound.setCreator(creator);
        repairOutbound.setCreatorId(creatorId);

        // 减少库存
        inventory.setQuantity(inventory.getQuantity() - 1);
        inventoryRepository.save(inventory);

        // 更新设备状态为维修中
        device.setStatus(DeviceStatus.UNDER_REPAIR.getCode());
        deviceRepository.save(device);

        // 保存修复出库记录
        RepairOutbound saved = repairOutboundRepository.save(repairOutbound);

        // 同时创建维修记录，实现数据统一
        RepairRecord repairRecord = new RepairRecord();
        repairRecord.setDevice(device);
        repairRecord.setDeviceId(device.getId());
        repairRecord.setDeviceCode(device.getDeviceCode());
        repairRecord.setDeviceName(device.getDeviceName());
        repairRecord.setRepairNo(saved.getRepairNo());
        repairRecord.setFaultDescription(dto.getFaultDescription());
        repairRecord.setRepairPerson(repairOutbound.getRepairPerson() != null ? repairOutbound.getRepairPerson().getUsername() : null);
        repairRecord.setRepairDate(LocalDate.now());
        repairRecord.setStatus(0); // 待维修
        repairRecord.setSourceOrderNo(saved.getRepairNo());
        repairRecord.setSourceOrderId(saved.getId());
        repairRecord.setRemark("由修复出库单自动创建: " + saved.getRepairNo());
        repairRecordRepository.save(repairRecord);

        // 建立关联关系
        saved.setRepairRecord(repairRecord);
        saved.setRepairRecordId(repairRecord.getId());
        repairOutboundRepository.save(saved);

        log.info("修复出库单创建成功，单号: {}，关联维修记录ID: {}", saved.getRepairNo(), repairRecord.getId());

        return saved;
    }

    @Override
    public Page<RepairOutbound> getRepairOutboundList(Integer status, String deviceName, Pageable pageable) {
        Specification<RepairOutbound> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (deviceName != null && !deviceName.isEmpty()) {
                predicates.add(cb.like(root.get("device").get("deviceName"), "%" + deviceName + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repairOutboundRepository.findAll(spec, pageable);
    }

    @Override
    public RepairOutbound getRepairOutboundDetail(Long id) {
        return repairOutboundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("修复出库记录不存在"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RepairOutbound updateRepairProgress(Long id, RepairOutboundProgressDTO dto, Long updaterId) {
        log.info("更新修复进度，ID: {}, 状态: {}", id, dto.getStatus());

        RepairOutbound repairOutbound = repairOutboundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("修复出库记录不存在"));

        // 验证状态流转
        if (dto.getStatus() != null) {
            if (dto.getStatus() < repairOutbound.getStatus()) {
                throw new RuntimeException("修复状态不能回退");
            }
            repairOutbound.setStatus(dto.getStatus());
        }

        // 更新进度图片
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            try {
                repairOutbound.setRepairImages(objectMapper.writeValueAsString(dto.getImages()));
            } catch (JsonProcessingException e) {
                log.error("进度图片序列化失败", e);
            }
        }

        if (dto.getRemark() != null) {
            repairOutbound.setRemark(dto.getRemark());
        }

        // 设置更新人
        User updater = userRepository.findById(updaterId)
                .orElseThrow(() -> new RuntimeException("更新人不存在"));
        repairOutbound.setUpdater(updater);
        repairOutbound.setUpdaterId(updaterId);

        return repairOutboundRepository.save(repairOutbound);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RepairOutbound completeRepairInbound(Long id, RepairOutboundCompleteDTO dto, Long operatorId) {
        log.info("完成修复入库，ID: {}", id);

        RepairOutbound repairOutbound = repairOutboundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("修复出库记录不存在"));

        if (repairOutbound.getStatus() != 2 && repairOutbound.getStatus() != 3) {
            throw new RuntimeException("当前状态不允许完成入库");
        }

        // 更新修复信息
        repairOutbound.setRepairResult(dto.getRepairResult());
        repairOutbound.setActualCost(dto.getActualCost());

        // 处理修复后图片
        if (dto.getRepairImages() != null && !dto.getRepairImages().isEmpty()) {
            try {
                repairOutbound.setRepairImages(objectMapper.writeValueAsString(dto.getRepairImages()));
            } catch (JsonProcessingException e) {
                log.error("修复图片序列化失败", e);
            }
        }

        repairOutbound.setStatus(4); // 已入库
        repairOutbound.setActualCompleteTime(LocalDateTime.now());
        repairOutbound.setRemark(dto.getRemark());

        // 恢复库存
        Device device = repairOutbound.getDevice();
        List<Inventory> inventories = inventoryRepository.findByDeviceId(device.getId());

        if (!inventories.isEmpty()) {
            Inventory inventory = inventories.get(0);
            inventory.setQuantity(inventory.getQuantity() + 1);
            inventoryRepository.save(inventory);
        } else {
            // 创建新库存记录
            Inventory newInventory = new Inventory();
            newInventory.setDevice(device);
            newInventory.setQuantity(1);
            inventoryRepository.save(newInventory);
        }

        // 更新设备状态为正常
        device.setStatus(DeviceStatus.NORMAL.getCode());
        deviceRepository.save(device);

        // 设置更新人
        User updater = userRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("操作人不存在"));
        repairOutbound.setUpdater(updater);
        repairOutbound.setUpdaterId(operatorId);

        return repairOutboundRepository.save(repairOutbound);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelRepairOutbound(Long id, String reason, Long operatorId) {
        log.info("取消修复出库，ID: {}, 原因: {}", id, reason);

        RepairOutbound repairOutbound = repairOutboundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("修复出库记录不存在"));

        if (repairOutbound.getStatus() != 0 && repairOutbound.getStatus() != 1) {
            throw new RuntimeException("当前状态不允许取消");
        }

        repairOutbound.setStatus(-1); // 已取消
        repairOutbound.setRemark((repairOutbound.getRemark() != null ? repairOutbound.getRemark() + "; " : "") + "取消原因: " + reason);

        // 如果已出库，恢复库存
        if (repairOutbound.getStatus() == 1) {
            Device device = repairOutbound.getDevice();
            List<Inventory> inventories = inventoryRepository.findByDeviceId(device.getId());
            if (inventories.isEmpty()) {
                throw new RuntimeException("库存记录不存在");
            }
            Inventory inventory = inventories.get(0);

            inventory.setQuantity(inventory.getQuantity() + 1);
            inventoryRepository.save(inventory);

            // 恢复设备状态
            device.setStatus(DeviceStatus.NORMAL.getCode());
            deviceRepository.save(device);
        }

        // 设置更新人
        User updater = userRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("操作人不存在"));
        repairOutbound.setUpdater(updater);
        repairOutbound.setUpdaterId(operatorId);

        repairOutboundRepository.save(repairOutbound);
    }

    @Override
    public Map<String, Object> getRepairStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> statistics = new HashMap<>();

        // 各状态数量统计
        statistics.put("pendingCount", repairOutboundRepository.countByStatus(0));
        statistics.put("outboundCount", repairOutboundRepository.countByStatus(1));
        statistics.put("repairingCount", repairOutboundRepository.countByStatus(2));
        statistics.put("completedCount", repairOutboundRepository.countByStatus(3));
        statistics.put("inboundCount", repairOutboundRepository.countByStatus(4));
        statistics.put("cancelledCount", repairOutboundRepository.countByStatus(-1));

        // 时间范围内的统计
        if (startDate != null && endDate != null) {
            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            Page<RepairOutbound> page = repairOutboundRepository.findByOutboundTimeBetween(startDate, endDate, pageable);
            List<RepairOutbound> list = page.getContent();

            BigDecimal totalCost = list.stream()
                    .map(RepairOutbound::getActualCost)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            statistics.put("totalCount", list.size());
            statistics.put("totalCost", totalCost);
        }

        return statistics;
    }

    @Override
    public List<RepairOutbound> getDeviceRepairHistory(Long deviceId) {
        Pageable pageable = PageRequest.of(0, 100);
        return repairOutboundRepository.findLatestByDeviceId(deviceId, pageable);
    }

    @Override
    public String generateRepairNo() {
        String prefix = "REP";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", random.nextInt(10000));
        return prefix + dateStr + randomStr;
    }
}
