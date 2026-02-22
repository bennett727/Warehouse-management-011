package com.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.entity.OperationLog;

@Repository
public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {

    List<OperationLog> findByUserIdOrderByCreateTimeDesc(Long userId);

    List<OperationLog> findByCreateTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    List<OperationLog> findByUserIdAndCreateTimeBetween(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    Page<OperationLog> findByUsernameContaining(String username, Pageable pageable);

    Page<OperationLog> findByOperationContaining(String operation, Pageable pageable);

    Page<OperationLog> findByCreateTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    Page<OperationLog> findByUsernameContainingOrOperationContainingOrParamsContaining(
            String username, String operation, String params, Pageable pageable);
}
