package com.backend.repository;

import com.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByDeviceId(Long deviceId);

    List<Inventory> findByBinId(Long binId);

    Optional<Inventory> findByDeviceIdAndBinId(Long deviceId, Long binId);

    List<Inventory> findByBatchNo(String batchNo);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= 0")
    List<Inventory> findEmptyInventory();

    @Query("SELECT SUM(i.quantity) FROM Inventory i WHERE i.device.id = :deviceId")
    Integer getTotalQuantityByDeviceId(@Param("deviceId") Long deviceId);

    @Query("SELECT i FROM Inventory i LEFT JOIN i.bin b LEFT JOIN b.area a WHERE a.id = :areaId")
    List<Inventory> findByAreaId(@Param("areaId") Long areaId);

    @Modifying
    @Query("DELETE FROM Inventory i WHERE i.device.id = :deviceId")
    void deleteByDeviceId(@Param("deviceId") Long deviceId);

    @Query("SELECT i FROM Inventory i LEFT JOIN i.bin b LEFT JOIN b.area a LEFT JOIN a.warehouse w WHERE w.id = :warehouseId")
    List<Inventory> findByWarehouseId(@Param("warehouseId") Long warehouseId);
}
