package com.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.StockOrder;

@Repository
public interface StockOrderRepository extends JpaRepository<StockOrder, Long> {

        Optional<StockOrder> findByOrderNo(String orderNo);

        boolean existsByOrderNo(String orderNo);

        @EntityGraph(attributePaths = { "sourceArea", "targetArea", "area", "operator", "auditor", "supplier" })
        @Query("SELECT so FROM StockOrder so WHERE " +
                        "(:orderNo IS NULL OR so.orderNo LIKE %:orderNo%) AND " +
                        "(:orderType IS NULL OR so.orderType = :orderType) AND " +
                        "(:status IS NULL OR so.status = :status) AND " +
                        "(:startDate IS NULL OR so.createTime >= :startDate) AND " +
                        "(:endDate IS NULL OR so.createTime <= :endDate)")
        Page<StockOrder> findByConditions(@Param("orderNo") String orderNo,
                        @Param("orderType") Integer orderType,
                        @Param("status") Integer status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        Pageable pageable);

        @Query("SELECT COUNT(so) FROM StockOrder so WHERE so.orderType = :orderType AND so.status = :status")
        Long countByOrderTypeAndStatus(@Param("orderType") Integer orderType, @Param("status") Integer status);

        @Query("SELECT COUNT(so) FROM StockOrder so WHERE so.orderNo LIKE :pattern")
        Long countByOrderNoLike(@Param("pattern") String pattern);

        @Query("SELECT so.orderType, COUNT(so) FROM StockOrder so GROUP BY so.orderType")
        List<Object[]> countByOrderType();

        @Query("SELECT so.status, COUNT(so) FROM StockOrder so GROUP BY so.status")
        List<Object[]> countByStatus();

        @Query("SELECT COUNT(so) FROM StockOrder so WHERE so.createTime >= :startTime")
        Long countByCreateTimeAfter(@Param("startTime") LocalDateTime startTime);

        @Query("SELECT COUNT(so) FROM StockOrder so WHERE so.createTime >= :startDate AND so.createTime <= :endDate")
        Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
