package com.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.StockOrderItem;

@Repository
public interface StockOrderItemRepository extends JpaRepository<StockOrderItem, Long> {

    List<StockOrderItem> findByStockOrderId(Long stockOrderId);

    List<StockOrderItem> findByStockOrderIdAndDeviceId(Long stockOrderId, Long deviceId);

    List<StockOrderItem> findByDeviceId(Long deviceId);

    @Transactional
    @Modifying
    @Query("DELETE FROM StockOrderItem s WHERE s.stockOrderId = :stockOrderId")
    void deleteByStockOrderId(@org.springframework.data.repository.query.Param("stockOrderId") Long stockOrderId);
}