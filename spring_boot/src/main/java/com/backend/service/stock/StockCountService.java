package com.backend.service.stock;

import com.backend.entity.StockCount;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface StockCountService {
    List<StockCount> getAllStockCounts();
    StockCount getStockCountById(Long id);
    StockCount createStockCount(StockCount stockCount);
    StockCount updateStockCount(Long id, StockCount stockCount);
    void deleteStockCount(Long id);
    PageResult<StockCount> getStockCounts(Pageable pageable);
    void executeStockCount(Long id);
    void approveStockCount(Long id, Long approverId);
}