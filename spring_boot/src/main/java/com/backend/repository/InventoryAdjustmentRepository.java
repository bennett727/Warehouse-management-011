package com.backend.repository;

import com.backend.entity.InventoryAdjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, Long> {

    Page<InventoryAdjustment> findByStatusOrderByCreateTimeDesc(Integer status, Pageable pageable);

    Page<InventoryAdjustment> findByApplicantIdOrderByCreateTimeDesc(Long applicantId, Pageable pageable);

    @Query("SELECT a FROM InventoryAdjustment a WHERE a.adjustmentNo = :adjustmentNo")
    InventoryAdjustment findByAdjustmentNo(@Param("adjustmentNo") String adjustmentNo);

    @Query("SELECT COUNT(a) FROM InventoryAdjustment a WHERE a.status = :status")
    long countByStatus(@Param("status") Integer status);

    @Query("SELECT a.status, COUNT(a) FROM InventoryAdjustment a GROUP BY a.status")
    java.util.List<Object[]> countByStatusGrouped();

    @Query("SELECT a FROM InventoryAdjustment a WHERE a.createTime BETWEEN :startTime AND :endTime")
    java.util.List<InventoryAdjustment> findByCreateTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}