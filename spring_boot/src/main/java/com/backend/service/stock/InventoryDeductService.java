package com.backend.service.stock;

import com.backend.entity.Device;
import com.backend.entity.Inventory;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;

import java.util.List;

/**
 * 库存扣减服务接口
 * 
 * 功能说明：
 * 提供库存扣减、回滚、校验等核心功能
 * 支持乐观锁防止超卖，确保数据一致性
 * 
 * 核心特性：
 * - 乐观锁机制：使用版本号防止并发冲突
 * - 事务管理：确保库存操作的原子性
 * - 库存校验：出库前校验库存充足性
 * - 库存回滚：订单取消时回滚库存
 * 
 * 使用场景：
 * - 出库单执行时扣减库存
 * - 入库单执行时增加库存
 * - 库存调拨时转移库存
 * - 订单取消时回滚库存
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
public interface InventoryDeductService {

    /**
     * 扣减设备库存
     * 
     * 使用乐观锁机制，防止并发情况下的超卖
     * 
     * @param deviceId 设备ID
     * @param quantity 扣减数量
     * @param orderNo  订单号（用于日志追踪）
     * @return 扣减后的库存数量
     * @throws InsufficientStockException      库存不足时抛出
     * @throws ConcurrentModificationException 并发冲突时抛出
     */
    Integer deductDeviceStock(Long deviceId, Integer quantity, String orderNo);

    /**
     * 增加设备库存
     * 
     * @param deviceId 设备ID
     * @param quantity 增加数量
     * @param orderNo  订单号（用于日志追踪）
     * @return 增加后的库存数量
     */
    Integer increaseDeviceStock(Long deviceId, Integer quantity, String orderNo);

    /**
     * 批量扣减库存
     * 
     * 用于出库单执行，批量扣减多个设备的库存
     * 
     * @param items   库存订单明细列表
     * @param orderNo 订单号
     * @return 扣减结果列表
     */
    List<DeductResult> batchDeductStock(List<StockOrderItem> items, String orderNo);

    /**
     * 批量增加库存
     * 
     * 用于入库单执行，批量增加多个设备的库存
     * 
     * @param items   库存订单明细列表
     * @param orderNo 订单号
     * @return 增加结果列表
     */
    List<DeductResult> batchIncreaseStock(List<StockOrderItem> items, String orderNo);

    /**
     * 回滚库存
     * 
     * 订单取消或失败时回滚已扣减的库存
     * 
     * @param deviceId 设备ID
     * @param quantity 回滚数量
     * @param orderNo  订单号
     * @return 回滚后的库存数量
     */
    Integer rollbackStock(Long deviceId, Integer quantity, String orderNo);

    /**
     * 批量回滚库存
     * 
     * @param items   库存订单明细列表
     * @param orderNo 订单号
     * @return 回滚结果列表
     */
    List<DeductResult> batchRollbackStock(List<StockOrderItem> items, String orderNo);

    /**
     * 校验库存充足性
     * 
     * 在执行出库前校验库存是否充足
     * 
     * @param deviceId         设备ID
     * @param requiredQuantity 需求数量
     * @return true表示库存充足
     */
    boolean checkStockSufficient(Long deviceId, Integer requiredQuantity);

    /**
     * 批量校验库存充足性
     * 
     * @param items 库存订单明细列表
     * @return 校验结果列表
     */
    List<StockCheckResult> batchCheckStock(List<StockOrderItem> items);

    /**
     * 获取设备当前库存
     * 
     * @param deviceId 设备ID
     * @return 当前库存数量
     */
    Integer getCurrentStock(Long deviceId);

    /**
     * 获取库存详情
     * 
     * @param deviceId 设备ID
     * @return 库存对象
     */
    Inventory getInventory(Long deviceId);

    /**
     * 锁定库存
     * 
     * 订单提交时锁定库存，防止超卖
     * 
     * @param deviceId 设备ID
     * @param quantity 锁定数量
     * @param orderNo  订单号
     * @return 锁定结果
     */
    boolean lockStock(Long deviceId, Integer quantity, String orderNo);

    /**
     * 解锁库存
     * 
     * 订单取消时解锁库存
     * 
     * @param deviceId 设备ID
     * @param quantity 解锁数量
     * @param orderNo  订单号
     * @return 解锁结果
     */
    boolean unlockStock(Long deviceId, Integer quantity, String orderNo);

    /**
     * 确认扣减（从锁定转为实际扣减）
     * 
     * @param deviceId 设备ID
     * @param quantity 确认数量
     * @param orderNo  订单号
     * @return 确认结果
     */
    boolean confirmDeduct(Long deviceId, Integer quantity, String orderNo);

    /**
     * 库存扣减结果
     */
    class DeductResult {
        private Long deviceId;
        private String deviceCode;
        private boolean success;
        private String message;
        private Integer beforeStock;
        private Integer afterStock;
        private Integer deductedQuantity;

        public static DeductResult success(Long deviceId, String deviceCode,
                Integer beforeStock, Integer afterStock,
                Integer deductedQuantity) {
            DeductResult result = new DeductResult();
            result.deviceId = deviceId;
            result.deviceCode = deviceCode;
            result.success = true;
            result.beforeStock = beforeStock;
            result.afterStock = afterStock;
            result.deductedQuantity = deductedQuantity;
            return result;
        }

        public static DeductResult failure(Long deviceId, String deviceCode, String message) {
            DeductResult result = new DeductResult();
            result.deviceId = deviceId;
            result.deviceCode = deviceCode;
            result.success = false;
            result.message = message;
            return result;
        }

        // Getters and Setters
        public Long getDeviceId() {
            return deviceId;
        }

        public void setDeviceId(Long deviceId) {
            this.deviceId = deviceId;
        }

        public String getDeviceCode() {
            return deviceCode;
        }

        public void setDeviceCode(String deviceCode) {
            this.deviceCode = deviceCode;
        }

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

        public Integer getBeforeStock() {
            return beforeStock;
        }

        public void setBeforeStock(Integer beforeStock) {
            this.beforeStock = beforeStock;
        }

        public Integer getAfterStock() {
            return afterStock;
        }

        public void setAfterStock(Integer afterStock) {
            this.afterStock = afterStock;
        }

        public Integer getDeductedQuantity() {
            return deductedQuantity;
        }

        public void setDeductedQuantity(Integer deductedQuantity) {
            this.deductedQuantity = deductedQuantity;
        }
    }

    /**
     * 库存校验结果
     */
    class StockCheckResult {
        private Long deviceId;
        private String deviceCode;
        private boolean sufficient;
        private Integer requiredQuantity;
        private Integer availableStock;
        private String message;

        public static StockCheckResult sufficient(Long deviceId, String deviceCode,
                Integer requiredQuantity, Integer availableStock) {
            StockCheckResult result = new StockCheckResult();
            result.deviceId = deviceId;
            result.deviceCode = deviceCode;
            result.sufficient = true;
            result.requiredQuantity = requiredQuantity;
            result.availableStock = availableStock;
            result.message = "库存充足";
            return result;
        }

        public static StockCheckResult insufficient(Long deviceId, String deviceCode,
                Integer requiredQuantity, Integer availableStock) {
            StockCheckResult result = new StockCheckResult();
            result.deviceId = deviceId;
            result.deviceCode = deviceCode;
            result.sufficient = false;
            result.requiredQuantity = requiredQuantity;
            result.availableStock = availableStock;
            result.message = String.format("库存不足，需要%d，可用%d", requiredQuantity, availableStock);
            return result;
        }

        // Getters and Setters
        public Long getDeviceId() {
            return deviceId;
        }

        public void setDeviceId(Long deviceId) {
            this.deviceId = deviceId;
        }

        public String getDeviceCode() {
            return deviceCode;
        }

        public void setDeviceCode(String deviceCode) {
            this.deviceCode = deviceCode;
        }

        public boolean isSufficient() {
            return sufficient;
        }

        public void setSufficient(boolean sufficient) {
            this.sufficient = sufficient;
        }

        public Integer getRequiredQuantity() {
            return requiredQuantity;
        }

        public void setRequiredQuantity(Integer requiredQuantity) {
            this.requiredQuantity = requiredQuantity;
        }

        public Integer getAvailableStock() {
            return availableStock;
        }

        public void setAvailableStock(Integer availableStock) {
            this.availableStock = availableStock;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
