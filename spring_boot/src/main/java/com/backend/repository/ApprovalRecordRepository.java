package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.ApprovalRecord;

@Repository
public interface ApprovalRecordRepository extends JpaRepository<ApprovalRecord, Long> {

    Optional<ApprovalRecord> findByBusinessIdAndBusinessType(Long businessId, String businessType);

    List<ApprovalRecord> findByBusinessTypeAndApprovalStatus(String businessType, Integer approvalStatus);

    List<ApprovalRecord> findByApplicantId(Long applicantId);

    @Query("SELECT ar FROM ApprovalRecord ar WHERE ar.approvalStatus = 0 AND ar.currentLevel = :level")
    List<ApprovalRecord> findPendingByLevel(@Param("level") Integer level);

    @Query("SELECT ar FROM ApprovalRecord ar WHERE ar.approvalStatus = 0 AND ar.currentLevel = :level " +
           "AND (ar.level1ApproverId = :userId OR ar.level2ApproverId = :userId OR ar.level3ApproverId = :userId)")
    List<ApprovalRecord> findPendingForUser(@Param("level") Integer level, @Param("userId") Long userId);

    @Query("SELECT ar FROM ApprovalRecord ar WHERE ar.businessType = :businessType " +
           "AND ar.approvalStatus = :status ORDER BY ar.createTime DESC")
    Page<ApprovalRecord> findByBusinessTypeAndStatus(
            @Param("businessType") String businessType,
            @Param("status") Integer status,
            Pageable pageable);

    @Query("SELECT COUNT(ar) FROM ApprovalRecord ar WHERE ar.approvalStatus = 0")
    long countPendingApprovals();

    @Query("SELECT COUNT(ar) FROM ApprovalRecord ar WHERE ar.applicantId = :applicantId AND ar.approvalStatus = 0")
    long countPendingByApplicant(@Param("applicantId") Long applicantId);

    boolean existsByBusinessIdAndBusinessTypeAndApprovalStatus(Long businessId, String businessType, Integer approvalStatus);
}
