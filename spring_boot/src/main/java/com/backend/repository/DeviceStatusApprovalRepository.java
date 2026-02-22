package com.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.DeviceStatusApproval;

@Repository
public interface DeviceStatusApprovalRepository extends JpaRepository<DeviceStatusApproval, Long> {

    Page<DeviceStatusApproval> findByStatusOrderByCreateTimeDesc(Integer status, Pageable pageable);

    Page<DeviceStatusApproval> findByApplicantIdOrderByCreateTimeDesc(Long applicantId, Pageable pageable);

    List<DeviceStatusApproval> findByDeviceIdOrderByCreateTimeDesc(Long deviceId);

    @Query("SELECT COUNT(a) FROM DeviceStatusApproval a WHERE a.status = :status")
    long countByStatus(@Param("status") Integer status);

    @Query("SELECT a.status, COUNT(a) FROM DeviceStatusApproval a GROUP BY a.status")
    List<Object[]> countByStatusGrouped();
}