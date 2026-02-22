package com.backend.service.stock;

import com.backend.entity.StockTransfer;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

public interface StockTransferService {
    List<StockTransfer> getAllStockTransfers();
    StockTransfer getStockTransferById(Long id);
    StockTransfer createStockTransfer(Map<String, Object> stockTransferData);
    StockTransfer updateStockTransfer(Long id, Map<String, Object> stockTransferData);
    void deleteStockTransfer(Long id);
    PageResult<StockTransfer> getStockTransfers(Pageable pageable);
    void executeStockTransfer(Long id);
    void approveStockTransfer(Long id, Long approverId);
}