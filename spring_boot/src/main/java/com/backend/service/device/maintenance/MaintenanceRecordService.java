package com.backend.service.device.maintenance;

import com.backend.entity.MaintenanceRecord;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface MaintenanceRecordService {
    List<MaintenanceRecord> getAllMaintenanceRecords();
    MaintenanceRecord getMaintenanceRecordById(Long id);
    MaintenanceRecord createMaintenanceRecord(MaintenanceRecord maintenanceRecord);
    MaintenanceRecord updateMaintenanceRecord(Long id, MaintenanceRecord maintenanceRecord);
    void deleteMaintenanceRecord(Long id);
    PageResult<MaintenanceRecord> getMaintenanceRecords(Pageable pageable);
}