package com.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import lombok.Data;

/**
 * 设备导出任务DTO
 * 
 * 功能说明：
 * 封装设备导出任务的信息和状态
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Data
public class DeviceExportTask {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 任务状态
     */
    private TaskStatus status;
    
    /**
     * 导出进度（0-100）
     */
    private AtomicInteger progress;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 完成时间
     */
    private LocalDateTime completeTime;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 文件名
     */
    private String fileName;
    
    /**
     * 文件路径
     */
    private String filePath;
    
    /**
     * 总记录数
     */
    private Long totalRecords;
    
    /**
     * 已导出记录数
     */
    private AtomicInteger exportedRecords;
    
    /**
     * 是否已取消
     */
    private volatile boolean cancelled;
    
    /**
     * 任务状态枚举
     */
    public enum TaskStatus {
        PENDING("等待中"),
        RUNNING("执行中"),
        COMPLETED("已完成"),
        FAILED("失败"),
        CANCELLED("已取消");
        
        private final String description;
        
        TaskStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * 创建新任务
     * 
     * @param userId 用户ID
     * @return 导出任务
     */
    public static DeviceExportTask create(Long userId) {
        DeviceExportTask task = new DeviceExportTask();
        task.setTaskId(UUID.randomUUID().toString().replace("-", ""));
        task.setStatus(TaskStatus.PENDING);
        task.setProgress(new AtomicInteger(0));
        task.setCreateTime(LocalDateTime.now());
        task.setUserId(userId);
        task.setFileName("设备导出_" + task.getTaskId() + ".csv");
        task.setExportedRecords(new AtomicInteger(0));
        task.setCancelled(false);
        return task;
    }
    
    /**
     * 开始任务
     */
    public void start() {
        this.status = TaskStatus.RUNNING;
    }
    
    /**
     * 更新进度
     * 
     * @param progress 进度（0-100）
     */
    public void updateProgress(int progress) {
        this.progress.set(Math.min(100, Math.max(0, progress)));
    }
    
    /**
     * 更新已导出记录数
     * 
     * @param count 记录数
     */
    public void addExportedRecords(int count) {
        this.exportedRecords.addAndGet(count);
    }
    
    /**
     * 完成任务
     */
    public void complete() {
        this.status = TaskStatus.COMPLETED;
        this.progress.set(100);
        this.completeTime = LocalDateTime.now();
    }
    
    /**
     * 标记失败
     * 
     * @param errorMessage 错误信息
     */
    public void fail(String errorMessage) {
        this.status = TaskStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completeTime = LocalDateTime.now();
    }
    
    /**
     * 取消任务
     */
    public void cancel() {
        this.cancelled = true;
        this.status = TaskStatus.CANCELLED;
        this.completeTime = LocalDateTime.now();
    }
    
    /**
     * 检查是否已取消
     * 
     * @return true表示已取消
     */
    public boolean isCancelled() {
        return cancelled;
    }
    
    /**
     * 获取进度值
     * 
     * @return 进度（0-100）
     */
    public int getProgressValue() {
        return progress != null ? progress.get() : 0;
    }
    
    /**
     * 获取已导出记录数
     * 
     * @return 记录数
     */
    public int getExportedRecordsCount() {
        return exportedRecords != null ? exportedRecords.get() : 0;
    }
}
