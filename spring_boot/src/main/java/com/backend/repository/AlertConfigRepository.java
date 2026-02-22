package com.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.AlertConfigEntity;

@Repository
public interface AlertConfigRepository extends JpaRepository<AlertConfigEntity, Long> {

    List<AlertConfigEntity> findByStatus(Integer status);

    List<AlertConfigEntity> findByType(String type);

    Page<AlertConfigEntity> findByNameContaining(String name, Pageable pageable);

    @Query("SELECT a FROM AlertConfigEntity a WHERE " +
           "(:name IS NULL OR :name = '' OR a.name LIKE %:name%) AND " +
           "(:type IS NULL OR :type = '' OR a.type = :type) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<AlertConfigEntity> searchAlertConfigs(
            @Param("name") String name,
            @Param("type") String type,
            @Param("status") Integer status,
            Pageable pageable);

    @Query("SELECT a FROM AlertConfigEntity a WHERE a.status = 1 AND a.type = :type")
    List<AlertConfigEntity> findActiveByType(@Param("type") String type);

    boolean existsByName(String name);

    long countByStatus(Integer status);
}
