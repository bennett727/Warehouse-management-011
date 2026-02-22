package com.backend.service.notification;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WebSocketNotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendToUser(Long userId, NotificationMessage notification) {
        try {
            String destination = "/user/" + userId + "/queue/notifications";
            messagingTemplate.convertAndSend(destination, notification);
            log.debug("发送通知给用户 {}: {}", userId, notification.getTitle());
        } catch (Exception e) {
            log.error("发送通知给用户 {} 失败: {}", userId, e.getMessage());
        }
    }

    public void sendToUsers(List<Long> userIds, NotificationMessage notification) {
        for (Long userId : userIds) {
            sendToUser(userId, notification);
        }
    }

    public void broadcast(NotificationMessage notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.debug("广播通知: {}", notification.getTitle());
        } catch (Exception e) {
            log.error("广播通知失败: {}", e.getMessage());
        }
    }

    public void sendStockWarning(Long userId, String deviceCode, String deviceName, 
                                  Integer currentStock, Integer safetyStock) {
        NotificationMessage notification = new NotificationMessage();
        notification.setType(NotificationType.STOCK_WARNING);
        notification.setTitle("库存预警");
        notification.setContent(String.format("设备 %s(%s) 库存不足，当前库存：%d，安全库存：%d",
                deviceName, deviceCode, currentStock, safetyStock));
        notification.putData("deviceCode", deviceCode);
        notification.putData("deviceName", deviceName);
        notification.putData("currentStock", currentStock);
        notification.putData("safetyStock", safetyStock);
        notification.setTimestamp(System.currentTimeMillis());
        
        sendToUser(userId, notification);
    }

    public void sendOrderStatusChange(Long userId, String orderNo, String orderType,
                                       String oldStatus, String newStatus) {
        NotificationMessage notification = new NotificationMessage();
        notification.setType(NotificationType.ORDER_STATUS_CHANGE);
        notification.setTitle("订单状态变更");
        notification.setContent(String.format("订单 %s 状态已从 %s 变更为 %s",
                orderNo, oldStatus, newStatus));
        notification.putData("orderNo", orderNo);
        notification.putData("orderType", orderType);
        notification.putData("oldStatus", oldStatus);
        notification.putData("newStatus", newStatus);
        notification.setTimestamp(System.currentTimeMillis());
        
        sendToUser(userId, notification);
    }

    public void sendDeviceStatusChange(Long userId, String deviceCode, String deviceName,
                                        String oldStatus, String newStatus) {
        NotificationMessage notification = new NotificationMessage();
        notification.setType(NotificationType.DEVICE_STATUS_CHANGE);
        notification.setTitle("设备状态变更");
        notification.setContent(String.format("设备 %s(%s) 状态已从 %s 变更为 %s",
                deviceName, deviceCode, oldStatus, newStatus));
        notification.putData("deviceCode", deviceCode);
        notification.putData("deviceName", deviceName);
        notification.putData("oldStatus", oldStatus);
        notification.putData("newStatus", newStatus);
        notification.setTimestamp(System.currentTimeMillis());
        
        sendToUser(userId, notification);
    }

    public void sendReportComplete(Long userId, String reportName, String fileUrl) {
        NotificationMessage notification = new NotificationMessage();
        notification.setType(NotificationType.REPORT_COMPLETE);
        notification.setTitle("报表生成完成");
        notification.setContent(String.format("报表 %s 已生成完成，请点击下载", reportName));
        notification.putData("reportName", reportName);
        notification.putData("fileUrl", fileUrl);
        notification.setTimestamp(System.currentTimeMillis());
        
        sendToUser(userId, notification);
    }

    public void sendSystemAnnouncement(String title, String content) {
        NotificationMessage notification = new NotificationMessage();
        notification.setType(NotificationType.SYSTEM_ANNOUNCEMENT);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setTimestamp(System.currentTimeMillis());
        
        broadcast(notification);
    }

    public enum NotificationType {
        STOCK_WARNING("库存预警"),
        ORDER_STATUS_CHANGE("订单状态变更"),
        DEVICE_STATUS_CHANGE("设备状态变更"),
        REPORT_COMPLETE("报表完成"),
        SYSTEM_ANNOUNCEMENT("系统公告"),
        TASK_REMINDER("任务提醒");

        private final String displayName;

        NotificationType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}