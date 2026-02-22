package com.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Device;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.entity.StockReservation;
import com.backend.repository.DeviceRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.repository.StockReservationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockReservationService {

    private final StockReservationRepository reservationRepository;
    private final DeviceRepository deviceRepository;
    private final StockOrderRepository orderRepository;
    private final StockOrderItemRepository orderItemRepository;

    private static final int DEFAULT_RESERVATION_HOURS = 24;

    @Transactional
    public StockReservation reserveStock(Long deviceId, Long orderId, Long orderItemId, Integer quantity, String remark) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("设备不存在"));

        int currentStock = device.getCurrentStock() != null ? device.getCurrentStock() : 0;
        int reservedQuantity = getReservedQuantity(deviceId);
        int availableStock = currentStock - reservedQuantity;

        if (availableStock < quantity) {
            throw new IllegalStateException(
                    String.format("库存不足，可用库存：%d，需预占：%d", availableStock, quantity));
        }

        StockOrder order = orderRepository.findById(orderId).orElse(null);

        StockReservation reservation = new StockReservation();
        reservation.setDeviceId(deviceId);
        reservation.setOrderId(orderId);
        reservation.setOrderNo(order != null ? order.getOrderNo() : null);
        reservation.setOrderItemId(orderItemId);
        reservation.setReservedQuantity(quantity);
        reservation.setStatus(StockReservation.STATUS_ACTIVE);
        reservation.setReservationType("OUTBOUND");
        reservation.setExpireTime(LocalDateTime.now().plusHours(DEFAULT_RESERVATION_HOURS));
        reservation.setRemark(remark);

        StockReservation saved = reservationRepository.save(reservation);
        log.info("库存预占成功：deviceId={}, orderId={}, quantity={}, reservationId={}",
                deviceId, orderId, quantity, saved.getId());
        return saved;
    }

    @Transactional
    public void reserveStockForOrder(StockOrder order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }

        for (StockOrderItem item : order.getItems()) {
            if (item.getDeviceId() != null && item.getQuantity() != null) {
                try {
                    reserveStock(
                            item.getDeviceId(),
                            order.getId(),
                            item.getId(),
                            item.getQuantity(),
                            "出库单预占：" + order.getOrderNo());
                } catch (Exception e) {
                    log.error("库存预占失败：deviceId={}, orderId={}, error={}",
                            item.getDeviceId(), order.getId(), e.getMessage());
                    throw e;
                }
            }
        }
        log.info("订单库存预占完成：orderId={}", order.getId());
    }

    @Transactional
    public void releaseReservation(Long reservationId) {
        StockReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("预占记录不存在"));

        if (!reservation.canRelease()) {
            throw new IllegalStateException("预占记录无法释放");
        }

        reservation.setStatus(StockReservation.STATUS_RELEASED);
        reservation.setReleasedTime(LocalDateTime.now());
        reservation.setReleasedQuantity(reservation.getReservedQuantity());

        reservationRepository.save(reservation);
        log.info("库存预占释放成功：reservationId={}, deviceId={}, quantity={}",
                reservationId, reservation.getDeviceId(), reservation.getReservedQuantity());
    }

    @Transactional
    public void releaseReservationByOrder(Long orderId) {
        List<StockReservation> reservations = reservationRepository.findByOrderIdAndStatus(
                orderId, StockReservation.STATUS_ACTIVE);

        for (StockReservation reservation : reservations) {
            reservation.setStatus(StockReservation.STATUS_RELEASED);
            reservation.setReleasedTime(LocalDateTime.now());
            reservation.setReleasedQuantity(reservation.getReservedQuantity());
        }

        reservationRepository.saveAll(reservations);
        log.info("订单库存预占释放完成：orderId={}, count={}", orderId, reservations.size());
    }

    @Transactional
    public void convertReservationToOutbound(Long orderId, Long orderItemId) {
        Optional<StockReservation> reservationOpt = reservationRepository
                .findByOrderIdAndOrderItemIdAndStatus(orderId, orderItemId, StockReservation.STATUS_ACTIVE);

        if (reservationOpt.isPresent()) {
            StockReservation reservation = reservationOpt.get();
            reservation.setStatus(StockReservation.STATUS_CONVERTED);
            reservation.setReleasedTime(LocalDateTime.now());
            reservation.setReleasedQuantity(reservation.getReservedQuantity());
            reservationRepository.save(reservation);
            log.info("预占转换为出库：reservationId={}, orderId={}", reservation.getId(), orderId);
        }
    }

    public int getReservedQuantity(Long deviceId) {
        return reservationRepository.sumReservedQuantityByDeviceId(deviceId);
    }

    public int getAvailableStock(Long deviceId) {
        Device device = deviceRepository.findById(deviceId).orElse(null);
        if (device == null) {
            return 0;
        }
        int currentStock = device.getCurrentStock() != null ? device.getCurrentStock() : 0;
        int reserved = getReservedQuantity(deviceId);
        return currentStock - reserved;
    }

    public List<StockReservation> getActiveReservations(Long deviceId) {
        return reservationRepository.findByDeviceIdAndStatus(deviceId, StockReservation.STATUS_ACTIVE);
    }

    public List<StockReservation> getReservationsByOrder(Long orderId) {
        return reservationRepository.findByOrderIdAndStatus(orderId, StockReservation.STATUS_ACTIVE);
    }

    public boolean hasActiveReservation(Long orderId) {
        return reservationRepository.existsByOrderIdAndStatus(orderId, StockReservation.STATUS_ACTIVE);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void processExpiredReservations() {
        log.info("开始处理过期预占记录...");
        List<StockReservation> expired = reservationRepository.findExpiredReservations(LocalDateTime.now());

        for (StockReservation reservation : expired) {
            reservation.setStatus(StockReservation.STATUS_EXPIRED);
            log.info("预占记录已过期：reservationId={}, deviceId={}, orderId={}",
                    reservation.getId(), reservation.getDeviceId(), reservation.getOrderId());
        }

        if (!expired.isEmpty()) {
            reservationRepository.saveAll(expired);
            log.info("过期预占处理完成：count={}", expired.size());
        }
    }

    @Transactional
    public void extendReservation(Long reservationId, int hours) {
        StockReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("预占记录不存在"));

        if (!reservation.isActive()) {
            throw new IllegalStateException("只能延长有效的预占记录");
        }

        reservation.setExpireTime(LocalDateTime.now().plusHours(hours));
        reservationRepository.save(reservation);
        log.info("预占时间延长：reservationId={}, hours={}", reservationId, hours);
    }

    public StockReservationInfo getReservationInfo(Long deviceId) {
        Device device = deviceRepository.findById(deviceId).orElse(null);
        if (device == null) {
            return null;
        }

        int currentStock = device.getCurrentStock() != null ? device.getCurrentStock() : 0;
        int reservedQuantity = getReservedQuantity(deviceId);
        int availableStock = currentStock - reservedQuantity;

        StockReservationInfo info = new StockReservationInfo();
        info.setDeviceId(deviceId);
        info.setDeviceCode(device.getDeviceCode());
        info.setDeviceName(device.getDeviceName());
        info.setCurrentStock(currentStock);
        info.setReservedQuantity(reservedQuantity);
        info.setAvailableStock(availableStock);

        return info;
    }

    public static class StockReservationInfo {
        private Long deviceId;
        private String deviceCode;
        private String deviceName;
        private int currentStock;
        private int reservedQuantity;
        private int availableStock;

        public Long getDeviceId() { return deviceId; }
        public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }
        public String getDeviceCode() { return deviceCode; }
        public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
        public String getDeviceName() { return deviceName; }
        public void setDeviceName(String deviceName) { this.deviceName = deviceName; }
        public int getCurrentStock() { return currentStock; }
        public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }
        public int getReservedQuantity() { return reservedQuantity; }
        public void setReservedQuantity(int reservedQuantity) { this.reservedQuantity = reservedQuantity; }
        public int getAvailableStock() { return availableStock; }
        public void setAvailableStock(int availableStock) { this.availableStock = availableStock; }
    }
}
