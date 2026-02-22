package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.Area;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {

        Optional<Area> findByCode(String code);

        Optional<Area> findByName(String name);

        boolean existsByCode(String code);

        boolean existsByName(String name);

        @Query("SELECT a FROM Area a WHERE a.name LIKE %:name%")
        Page<Area> findByNameContaining(@Param("name") String name, Pageable pageable);

        @Query("SELECT a FROM Area a WHERE a.status = :status")
        Page<Area> findByStatus(@Param("status") Integer status, Pageable pageable);

        @Query("SELECT a FROM Area a WHERE " +
                        "(:warehouseId IS NULL OR a.warehouseId = :warehouseId) AND " +
                        "(:keyword IS NULL OR a.code LIKE %:keyword% OR a.name LIKE %:keyword%)")
        Page<Area> findByConditions(@Param("warehouseId") Long warehouseId,
                        @Param("keyword") String keyword,
                        Pageable pageable);

        @Query("SELECT a FROM Area a WHERE a.status = 1 ORDER BY a.sort, a.createTime")
        List<Area> findAllActive();

        @Query("SELECT a FROM Area a LEFT JOIN a.city c WHERE c.id = :cityId AND a.status = 1")
        List<Area> findByCityId(@Param("cityId") Long cityId);

        @Query("SELECT COUNT(d) FROM Device d WHERE d.areaId = :areaId")
        Long countDevicesByAreaId(@Param("areaId") Long areaId);

        @Query("SELECT COUNT(a) > 0 FROM Area a WHERE a.code = :code AND a.id <> :excludeId")
        boolean existsByCodeAndIdNot(@Param("code") String code, @Param("excludeId") Long excludeId);

        @Query("SELECT COUNT(a) FROM Area a WHERE a.status = :status")
        Long countByStatus(@Param("status") Integer status);

        @Query("SELECT a FROM Area a WHERE a.status = :status")
        List<Area> findByStatus(@Param("status") Integer status);

        @Query("SELECT DISTINCT c.name FROM Area a LEFT JOIN a.city c WHERE c IS NOT NULL ORDER BY c.name")
        List<String> findAllCities();

        @Query("SELECT DISTINCT d.name FROM Area a LEFT JOIN a.city c LEFT JOIN a.district d WHERE c.name = :city AND d IS NOT NULL ORDER BY d.name")
        List<String> findDistrictsByCity(@Param("city") String city);

        @Query("SELECT DISTINCT a.location FROM Area a LEFT JOIN a.city c LEFT JOIN a.district d WHERE c.name = :city AND d.name = :district AND a.location IS NOT NULL ORDER BY a.location")
        List<String> findLocationsByCityAndDistrict(@Param("city") String city, @Param("district") String district);

        @Query("SELECT COUNT(a) > 0 FROM Area a LEFT JOIN a.city c LEFT JOIN a.district d WHERE c.name = :city AND d.name = :district AND a.location = :location AND (:excludeId IS NULL OR a.id <> :excludeId)")
        boolean existsByLocation(@Param("city") String city, @Param("district") String district,
                        @Param("location") String location, @Param("excludeId") Long excludeId);

        @Query("SELECT a FROM Area a LEFT JOIN a.city c LEFT JOIN a.district d WHERE c.name = :city AND d.name = :district AND a.location = :location")
        Optional<Area> findByCityAndDistrictAndLocation(@Param("city") String city, @Param("district") String district,
                        @Param("location") String location);

        @Query("SELECT a FROM Area a LEFT JOIN a.city c WHERE c.name = :city AND a.status = :status")
        List<Area> findByCityNameAndStatus(@Param("city") String city, @Param("status") Integer status);

        @Query("SELECT COUNT(a) > 0 FROM Area a WHERE a.warehouseId = :warehouseId AND a.name = :name")
        boolean existsByWarehouseIdAndName(@Param("warehouseId") Long warehouseId, @Param("name") String name);
}
