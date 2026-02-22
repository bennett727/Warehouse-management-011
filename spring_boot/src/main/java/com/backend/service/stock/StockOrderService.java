package com.backend.service.stock;

import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface StockOrderService {
    List<StockOrder> getAllStockOrders();
    StockOrder getStockOrderById(Long id);
    StockOrder getStockOrderByNo(String orderNo);
    StockOrder createStockOrder(StockOrder stockOrder);
    StockOrder updateStockOrder(Long id, StockOrder stockOrder);
    void deleteStockOrder(Long id);
    PageResult<StockOrder> getStockOrders(Pageable pageable);
    List<StockOrderItem> getStockOrderItems(Long orderId);

    StockOrder submitOrder(Long orderId, Long operatorId);
    StockOrder approveOrder(Long orderId, boolean approved, Long auditorId, String remark);
    StockOrder cancelOrder(Long orderId, Long operatorId, String reason);

    OrderExecuteResult executeOrder(Long orderId, Long operatorId);
    OrderStatistics getOrderStatistics();

    class OrderExecuteResult {
        private boolean success;
        private String message;
        private int processedCount;
        private int failedCount;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public int getProcessedCount() {
            return processedCount;
        }

        public void setProcessedCount(int processedCount) {
            this.processedCount = processedCount;
        }

        public int getFailedCount() {
            return failedCount;
        }

        public void setFailedCount(int failedCount) {
            this.failedCount = failedCount;
        }
    }

    class OrderStatistics {
        private int totalCount;
        private int draftCount;
        private int pendingCount;
        private int approvedCount;
        private int completedCount;
        private int cancelledCount;

        public int getTotalCount() {
            return totalCount;
        }

        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }

        public int getDraftCount() {
            return draftCount;
        }

        public void setDraftCount(int draftCount) {
            this.draftCount = draftCount;
        }

        public int getPendingCount() {
            return pendingCount;
        }

        public void setPendingCount(int pendingCount) {
            this.pendingCount = pendingCount;
        }

        public int getApprovedCount() {
            return approvedCount;
        }

        public void setApprovedCount(int approvedCount) {
            this.approvedCount = approvedCount;
        }

        public int getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(int completedCount) {
            this.completedCount = completedCount;
        }

        public int getCancelledCount() {
            return cancelledCount;
        }

        public void setCancelledCount(int cancelledCount) {
            this.cancelledCount = cancelledCount;
        }
    }
}