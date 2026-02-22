package com.backend.repository;

import com.backend.entity.StockCountItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockCountItemRepository extends JpaRepository<StockCountItem, Long> {

    List<StockCountItem> findByStockCountId(Long stockCountId);

    List<StockCountItem> findByStockCountIdOrderByDeviceCode(Long stockCountId);

    Page<StockCountItem> findByStockCountId(Long stockCountId, Pageable pageable);

    List<StockCountItem> findByDeviceId(Long deviceId);

    List<StockCountItem> findByBinId(Long binId);

    List<StockCountItem> findByStockCountIdAndStatus(Long stockCountId, Integer status);

    @Query("SELECT item FROM StockCountItem item WHERE item.stockCountId = :stockCountId AND item.differenceType = :differenceType")
    List<StockCountItem> findByStockCountIdAndDifferenceType(@Param("stockCountId") Long stockCountId, 
                                                              @Param("differenceType") Integer differenceType);

    @Query("SELECT COUNT(item) FROM StockCountItem item WHERE item.stockCountId = :stockCountId")
    long countByStockCountId(@Param("stockCountId") Long stockCountId);

    @Query("SELECT COUNT(item) FROM StockCountItem item WHERE item.stockCountId = :stockCountId AND item.status >= 1")
    long countByStockCountIdAndCounted(@Param("stockCountId") Long stockCountId);

    @Query("SELECT COUNT(item) FROM StockCountItem item WHERE item.stockCountId = :stockCountId AND item.differenceType != 0")
    long countByStockCountIdAndHasDifference(@Param("stockCountId") Long stockCountId);

    @Query("SELECT SUM(item.bookQuantity) FROM StockCountItem item WHERE item.stockCountId = :stockCountId")
    Integer sumBookQuantityByStockCountId(@Param("stockCountId") Long stockCountId);

    @Query("SELECT SUM(item.actualQuantity) FROM StockCountItem item WHERE item.stockCountId = :stockCountId AND item.actualQuantity IS NOT NULL")
    Integer sumActualQuantityByStockCountId(@Param("stockCountId") Long stockCountId);

    @Modifying
    @Query("DELETE FROM StockCountItem item WHERE item.stockCountId = :stockCountId")
    void deleteByStockCountId(@Param("stockCountId") Long stockCountId);

    boolean existsByStockCountIdAndDeviceId(Long stockCountId, Long deviceId);
}
