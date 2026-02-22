package com.backend.repository;

import com.backend.entity.ErrorLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {

    Page<ErrorLog> findByResolvedOrderByCreateTimeDesc(Boolean resolved, Pageable pageable);

    Page<ErrorLog> findByErrorTypeContainingOrderByCreateTimeDesc(String errorType, Pageable pageable);

    @Query("SELECT e FROM ErrorLog e WHERE e.createTime BETWEEN :startTime AND :endTime ORDER BY e.createTime DESC")
    Page<ErrorLog> findByCreateTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime, Pageable pageable);

    @Query("SELECT e.errorType, COUNT(e) FROM ErrorLog e GROUP BY e.errorType ORDER BY COUNT(e) DESC")
    List<Object[]> countByErrorTypeGrouped();

    @Query("SELECT COUNT(e) FROM ErrorLog e WHERE e.resolved = false")
    long countUnresolvedErrors();

    @Query("SELECT COUNT(e) FROM ErrorLog e WHERE e.createTime >= :startTime")
    long countErrorsSince(@Param("startTime") LocalDateTime startTime);
}