package com.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Device;
import com.backend.entity.ScrapRecord;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.ScrapRecordRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScrapRecordService {

    private final ScrapRecordRepository scrapRecordRepository;
    private final DeviceRepository deviceRepository;
    private final InventoryRepository inventoryRepository;
    private final DeviceStatusSyncService deviceStatusSyncService;

    public List<ScrapRecord> getAllScrapRecords() {
        return scrapRecordRepository.findAll();
    }

    public ScrapRecord getScrapRecordById(Long id) {
        return scrapRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ScrapRecord", "id", id));
    }

    public Page<ScrapRecord> getScrapRecords(Pageable pageable) {
        return scrapRecordRepository.findAll(pageable);
    }

    public Page<ScrapRecord> getScrapRecordsByStatus(Integer status, Pageable pageable) {
        return scrapRecordRepository.findByStatus(status, pageable);
    }

    public List<ScrapRecord> getScrapRecordsByDeviceId(Long deviceId) {
        return scrapRecordRepository.findByDeviceId(deviceId);
    }

    @Transactional
    public ScrapRecord createScrapRecord(ScrapRecord scrapRecord) {
        log.info("创建报废记录: deviceId={}", scrapRecord.getDeviceId());

        Device device = deviceRepository.findById(scrapRecord.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", scrapRecord.getDeviceId()));

        if (device.getStatus() == DeviceStatus.SCRAPPED.getCode()) {
            throw new BusinessException("设备已报废，不能重复报废");
        }

        scrapRecord.setDevice(device);
        scrapRecord.setDeviceCode(device.getDeviceCode());
        scrapRecord.setDeviceName(device.getDeviceName());
        scrapRecord.setDeviceModel(device.getModel());
        scrapRecord.setStatus(0);
        scrapRecord.setCreateTime(LocalDateTime.now());
        scrapRecord.setUpdateTime(LocalDateTime.now());

        return scrapRecordRepository.save(scrapRecord);
    }

    @Transactional
    public ScrapRecord approveScrap(Long scrapId, String approverName, String approvalComment) {
        log.info("审批报废记录: scrapId={}, approver={}", scrapId, approverName);

        ScrapRecord record = scrapRecordRepository.findById(scrapId)
                .orElseThrow(() -> new ResourceNotFoundException("ScrapRecord", "id", scrapId));

        if (record.getStatus() != 0) {
            throw new BusinessException("只能审批待审批状态的报废申请");
        }

        record.setStatus(1);
        record.setApprover(approverName);
        record.setApprovalDate(LocalDateTime.now());
        record.setApprovalComment(approvalComment);
        record.setUpdateTime(LocalDateTime.now());

        Device device = deviceRepository.findById(record.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", record.getDeviceId()));

        deviceStatusSyncService.syncOnScrap(device, record.getScrapReason());

        scrapRecordRepository.save(record);

        log.info("报废审批完成: scrapId={}, deviceCode={}", scrapId, device.getDeviceCode());
        return record;
    }

    @Transactional
    public ScrapRecord rejectScrap(Long scrapId, String approverName, String rejectReason) {
        log.info("拒绝报废申请: scrapId={}, approver={}", scrapId, approverName);

        ScrapRecord record = scrapRecordRepository.findById(scrapId)
                .orElseThrow(() -> new ResourceNotFoundException("ScrapRecord", "id", scrapId));

        if (record.getStatus() != 0) {
            throw new BusinessException("只能拒绝待审批状态的报废申请");
        }

        record.setStatus(2);
        record.setApprover(approverName);
        record.setApprovalDate(LocalDateTime.now());
        record.setApprovalComment(rejectReason);
        record.setUpdateTime(LocalDateTime.now());

        return scrapRecordRepository.save(record);
    }

    @Transactional
    public void deleteScrapRecord(Long id) {
        log.info("删除报废记录: id={}", id);

        ScrapRecord record = scrapRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ScrapRecord", "id", id));

        if (record.getStatus() != 0) {
            throw new BusinessException("只能删除待审批状态的报废记录");
        }

        scrapRecordRepository.deleteById(id);
    }

    public long countByStatus(Integer status) {
        return scrapRecordRepository.countByStatus(status);
    }

    public long countPendingApproval() {
        return scrapRecordRepository.countByStatus(0);
    }

    public long countApproved() {
        return scrapRecordRepository.countByStatus(1);
    }
}
