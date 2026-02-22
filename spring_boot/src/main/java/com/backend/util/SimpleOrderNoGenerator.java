package com.backend.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * 简单订单号生成器（内存实现）
 * 
 * 当Redis禁用时使用本地内存生成订单号
 * 注意：仅适用于单实例部署
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "false")
public class SimpleOrderNoGenerator {

    private final AtomicLong localSequence = new AtomicLong(0);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int SEQUENCE_LENGTH = 6;
    private static final int MAX_SEQUENCE = 999999;

    public enum OrderType {
        OUTBOUND(0, "CK", "出库单"),
        INBOUND(1, "RK", "入库单"),
        TRANSFER(2, "DB", "调拨单"),
        INVENTORY(3, "PD", "盘点单"),
        MAINTENANCE(4, "WX", "维修单"),
        SCRAP(5, "BF", "报废单"),
        PURCHASE(6, "CG", "采购单"),
        RETURN(7, "TH", "退货单");

        private final int code;
        private final String prefix;
        private final String description;

        OrderType(int code, String prefix, String description) {
            this.code = code;
            this.prefix = prefix;
            this.description = description;
        }

        public String getPrefix() {
            return prefix;
        }

        public String getDescription() {
            return description;
        }
    }

    public String generateOrderNo(OrderType orderType) {
        String prefix = orderType.getPrefix();
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        long sequence = localSequence.incrementAndGet();
        if (sequence > MAX_SEQUENCE) {
            synchronized (this) {
                if (localSequence.get() > MAX_SEQUENCE) {
                    localSequence.set(1);
                }
                sequence = localSequence.get();
            }
        }
        String orderNo = prefix + dateStr + String.format("%0" + SEQUENCE_LENGTH + "d", sequence);
        log.debug("生成订单号: type={}, orderNo={}", orderType.getDescription(), orderNo);
        return orderNo;
    }

    public String generateOutboundOrderNo() {
        return generateOrderNo(OrderType.OUTBOUND);
    }

    public String generateInboundOrderNo() {
        return generateOrderNo(OrderType.INBOUND);
    }

    public String generateTransferOrderNo() {
        return generateOrderNo(OrderType.TRANSFER);
    }

    public String generateInventoryOrderNo() {
        return generateOrderNo(OrderType.INVENTORY);
    }

    public String generateMaintenanceOrderNo() {
        return generateOrderNo(OrderType.MAINTENANCE);
    }

    public String generateScrapOrderNo() {
        return generateOrderNo(OrderType.SCRAP);
    }
}
