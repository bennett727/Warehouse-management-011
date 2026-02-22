package com.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.MaintenancePlan;

@Repository
public interface MaintenancePlanRepository extends JpaRepository<MaintenancePlan, Long> {

    Optional<MaintenancePlan> findByPlanNo(String planNo);

    List<MaintenancePlan> findByDeviceId(Long deviceId);

    Optional<MaintenancePlan> findTopByDeviceIdOrderByCreateTimeDesc(Long deviceId);

    List<MaintenancePlan> findByStatus(Integer status);

    @Query("SELECT p FROM MaintenancePlan p WHERE p.status = 1 AND p.nextMaintenanceDate <= :date")
    List<MaintenancePlan> findDuePlans(@Param("date") LocalDate date);

    @Query("SELECT p FROM MaintenancePlan p WHERE p.status = 1 AND p.nextMaintenanceDate BETWEEN :startDate AND :endDate")
    List<MaintenancePlan> findPlansBetweenDates(@Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM MaintenancePlan p WHERE p.status = 1 AND p.nextMaintenanceDate <= :reminderDate")
    List<MaintenancePlan> findPlansNeedingReminder(@Param("reminderDate") LocalDate reminderDate);

    @Query("SELECT COUNT(p) FROM MaintenancePlan p WHERE p.status = 1 AND p.nextMaintenanceDate <= :date")
    long countOverduePlans(@Param("date") LocalDate date);

    @Query("SELECT p FROM MaintenancePlan p WHERE p.deviceId = :deviceId AND p.status = 1 ORDER BY p.nextMaintenanceDate ASC")
    List<MaintenancePlan> findActivePlansByDeviceId(@Param("deviceId") Long deviceId);

    boolean existsByDeviceIdAndStatus(Long deviceId, Integer status);
}
