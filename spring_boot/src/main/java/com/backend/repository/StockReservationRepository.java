package com.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.StockReservation;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {

    List<StockReservation> findByDeviceIdAndStatus(Long deviceId, Integer status);

    List<StockReservation> findByOrderIdAndStatus(Long orderId, Integer status);

    Optional<StockReservation> findByOrderIdAndOrderItemIdAndStatus(Long orderId, Long orderItemId, Integer status);

    @Query("SELECT COALESCE(SUM(r.reservedQuantity), 0) FROM StockReservation r WHERE r.deviceId = :deviceId AND r.status = 0")
    int sumReservedQuantityByDeviceId(@Param("deviceId") Long deviceId);

    @Query("SELECT r FROM StockReservation r WHERE r.status = 0 AND r.expireTime < :now")
    List<StockReservation> findExpiredReservations(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE StockReservation r SET r.status = 3 WHERE r.status = 0 AND r.expireTime < :now")
    int markExpiredReservations(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM StockReservation r WHERE r.deviceId = :deviceId AND r.status = 0 ORDER BY r.createTime ASC")
    List<StockReservation> findActiveByDeviceIdOrderByCreateTime(@Param("deviceId") Long deviceId);

    boolean existsByOrderIdAndStatus(Long orderId, Integer status);

    List<StockReservation> findByStatus(Integer status);
}
