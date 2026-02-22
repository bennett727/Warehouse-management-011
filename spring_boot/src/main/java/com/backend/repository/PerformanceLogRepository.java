package com.backend.repository;

import com.backend.entity.PerformanceLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PerformanceLogRepository extends JpaRepository<PerformanceLog, Long> {

    Page<PerformanceLog> findByMetricTypeOrderByCreateTimeDesc(String metricType, Pageable pageable);

    Page<PerformanceLog> findByPageUrlOrderByCreateTimeDesc(String pageUrl, Pageable pageable);

    @Query("SELECT p FROM PerformanceLog p WHERE p.createTime BETWEEN :startTime AND :endTime ORDER BY p.createTime DESC")
    Page<PerformanceLog> findByCreateTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime, Pageable pageable);

    @Query("SELECT p.metricType, p.metricName, AVG(p.metricValue), COUNT(p) FROM PerformanceLog p GROUP BY p.metricType, p.metricName")
    List<Object[]> getPerformanceStatistics();

    @Query("SELECT p.metricType, AVG(p.metricValue) FROM PerformanceLog p WHERE p.createTime >= :startTime GROUP BY p.metricType")
    List<Object[]> getAverageMetricsSince(@Param("startTime") LocalDateTime startTime);

    @Query("SELECT COUNT(p) FROM PerformanceLog p WHERE p.createTime >= :startTime")
    long countLogsSince(@Param("startTime") LocalDateTime startTime);
}