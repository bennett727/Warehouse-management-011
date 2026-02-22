package com.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.MaintenanceRecord;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

        Optional<MaintenanceRecord> findByDeviceId(Long deviceId);

        Page<MaintenanceRecord> findByDeviceId(Long deviceId, Pageable pageable);

        List<MaintenanceRecord> findByDeviceIdOrderByCreateTimeDesc(Long deviceId);

        List<MaintenanceRecord> findByProcessStatus(Integer processStatus);

        List<MaintenanceRecord> findByProcessStatusAndDeviceId(Integer processStatus, Long deviceId);

        @Query("SELECT r FROM MaintenanceRecord r WHERE " +
                        "(:deviceId IS NULL OR r.device.id = :deviceId) AND " +
                        "(:maintenanceType IS NULL OR r.maintenanceType = :maintenanceType) AND " +
                        "(:status IS NULL OR r.processStatus = :status) AND " +
                        "(:startDate IS NULL OR r.maintenanceDate >= :startDate) AND " +
                        "(:endDate IS NULL OR r.maintenanceDate <= :endDate)")
        Page<MaintenanceRecord> findByConditions(@Param("deviceId") Long deviceId,
                        @Param("maintenanceType") Integer maintenanceType,
                        @Param("status") Integer status,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);

        long countByStatus(Integer status);

        @Query("SELECT COUNT(r) FROM MaintenanceRecord r WHERE r.maintenanceDate >= :startDate")
        Long countByPlannedStartTimeAfter(@Param("startDate") java.time.LocalDateTime startDate);

        @Query("SELECT COUNT(r) FROM MaintenanceRecord r WHERE r.nextMaintenanceTime <= :time")
        Long countByNextMaintenanceTimeBefore(@Param("time") java.time.LocalDateTime time);

        @Query("SELECT COUNT(r) FROM MaintenanceRecord r WHERE r.createTime >= :startTime")
        Long countByCreateTimeAfter(@Param("startTime") java.time.LocalDateTime startTime);
}
