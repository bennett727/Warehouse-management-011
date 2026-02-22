package com.backend.service.device.maintenance.impl;

import com.backend.entity.MaintenanceRecord;
import com.backend.service.device.maintenance.MaintenanceRecordService;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaintenanceRecordServiceImpl implements MaintenanceRecordService {

    private final com.backend.repository.MaintenanceRecordRepository maintenanceRecordRepository;

    public MaintenanceRecordServiceImpl(com.backend.repository.MaintenanceRecordRepository maintenanceRecordRepository) {
        this.maintenanceRecordRepository = maintenanceRecordRepository;
    }

    @Override
    public List<MaintenanceRecord> getAllMaintenanceRecords() {
        return maintenanceRecordRepository.findAll();
    }

    @Override
    public MaintenanceRecord getMaintenanceRecordById(Long id) {
        return maintenanceRecordRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public MaintenanceRecord createMaintenanceRecord(MaintenanceRecord maintenanceRecord) {
        return maintenanceRecordRepository.save(maintenanceRecord);
    }

    @Override
    @Transactional
    public MaintenanceRecord updateMaintenanceRecord(Long id, MaintenanceRecord maintenanceRecord) {
        maintenanceRecord.setId(id);
        return maintenanceRecordRepository.save(maintenanceRecord);
    }

    @Override
    @Transactional
    public void deleteMaintenanceRecord(Long id) {
        maintenanceRecordRepository.deleteById(id);
    }

    @Override
    public PageResult<MaintenanceRecord> getMaintenanceRecords(Pageable pageable) {
        Page<MaintenanceRecord> page = maintenanceRecordRepository.findAll(pageable);
        return PageResult.of(page);
    }
}