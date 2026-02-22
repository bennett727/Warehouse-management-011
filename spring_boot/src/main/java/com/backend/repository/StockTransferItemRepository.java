package com.backend.repository;

import com.backend.entity.StockTransferItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransferItemRepository extends JpaRepository<StockTransferItem, Long> {

    List<StockTransferItem> findByTransferId(Long transferId);

    List<StockTransferItem> findByTransferIdOrderByDeviceCode(Long transferId);

    Page<StockTransferItem> findByTransferId(Long transferId, Pageable pageable);

    List<StockTransferItem> findByDeviceId(Long deviceId);

    List<StockTransferItem> findBySourceBinId(Long sourceBinId);

    List<StockTransferItem> findByTargetBinId(Long targetBinId);

    List<StockTransferItem> findByTransferIdAndStatus(Long transferId, Integer status);

    @Query("SELECT COUNT(item) FROM StockTransferItem item WHERE item.transferId = :transferId")
    long countByTransferId(@Param("transferId") Long transferId);

    @Query("SELECT COUNT(item) FROM StockTransferItem item WHERE item.transferId = :transferId AND item.status >= 1")
    long countByTransferIdAndTransferred(@Param("transferId") Long transferId);

    @Query("SELECT SUM(item.quantity) FROM StockTransferItem item WHERE item.transferId = :transferId")
    Integer sumQuantityByTransferId(@Param("transferId") Long transferId);

    @Modifying
    @Query("DELETE FROM StockTransferItem item WHERE item.transferId = :transferId")
    void deleteByTransferId(@Param("transferId") Long transferId);

    boolean existsByTransferIdAndDeviceId(Long transferId, Long deviceId);
}
