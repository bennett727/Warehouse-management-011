package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.DeviceType;

@Repository
public interface DeviceTypeRepository extends JpaRepository<DeviceType, Long> {

    Optional<DeviceType> findByTypeCode(String typeCode);

    Optional<DeviceType> findByTypeName(String typeName);

    boolean existsByTypeCode(String typeCode);

    boolean existsByTypeName(String typeName);

    @Query("SELECT dt FROM DeviceType dt WHERE dt.parent IS NULL AND dt.status = 1 ORDER BY dt.createTime")
    List<DeviceType> findRootTypes();

    @Query("SELECT dt FROM DeviceType dt WHERE dt.parent IS NULL")
    List<DeviceType> findByParentIdIsNull();

    @Query("SELECT dt FROM DeviceType dt LEFT JOIN dt.parent p WHERE p.id = :parentId AND dt.status = 1")
    List<DeviceType> findByParentId(@Param("parentId") Long parentId);
}
