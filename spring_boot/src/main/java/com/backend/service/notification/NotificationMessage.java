package com.backend.service.notification;

import java.util.HashMap;
import java.util.Map;

/**
 * 通知消息类
 *
 * 功能说明：
 * WebSocket通知的消息格式定义
 *
 * 消息结构：
 * - type: 通知类型
 * - title: 通知标题
 * - content: 通知内容
 * - data: 附加数据（Map结构）
 * - timestamp: 时间戳
 *
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
public class NotificationMessage {

    /**
     * 通知类型
     */
    private WebSocketNotificationService.NotificationType type;

    /**
     * 通知标题
     */
    private String title;

    /**
     * 通知内容
     */
    private String content;

    /**
     * 附加数据
     */
    private Map<String, Object> data;

    /**
     * 时间戳
     */
    private Long timestamp;

    public NotificationMessage() {
        this.data = new HashMap<>();
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 添加附加数据
     *
     * @param key   键
     * @param value 值
     */
    public void putData(String key, Object value) {
        if (this.data == null) {
            this.data = new HashMap<>();
        }
        this.data.put(key, value);
    }

    /**
     * 获取附加数据
     *
     * @param key 键
     * @return 值
     */
    public Object getData(String key) {
        return this.data != null ? this.data.get(key) : null;
    }

    // Getters and Setters
    public WebSocketNotificationService.NotificationType getType() {
        return type;
    }

    public void setType(WebSocketNotificationService.NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "NotificationMessage{" +
                "type=" + type +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", data=" + data +
                ", timestamp=" + timestamp +
                '}';
    }
}
