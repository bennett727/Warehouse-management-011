package com.backend.service.report;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 异步报表服务接口
 * 
 * 功能说明：
 * 提供报表的异步生成和导出功能，避免阻塞用户请求
 * 
 * 核心特性：
 * - 异步生成：报表生成在后台执行，不阻塞用户请求
 * - 进度跟踪：实时跟踪报表生成进度
 * - 结果通知：生成完成后通过WebSocket或邮件通知用户
 * - 任务队列：支持任务队列管理，控制并发数量
 * 
 * 使用场景：
 * - 大数据量报表（超过10万条记录）
 * - 复杂统计报表（多表关联、聚合计算）
 * - 定时报表任务
 * 
 * 报表类型：
 * - 库存报表：库存汇总、库存明细、库存预警
 * - 设备报表：设备台账、设备状态统计、设备维修记录
 * - 订单报表：出入库统计、订单执行分析
 * - 综合报表：多维度数据分析
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
public interface AsyncReportService {

    /**
     * 提交报表生成任务
     * 
     * 将报表生成任务提交到异步队列
     * 
     * @param reportType 报表类型
     * @param params     报表参数
     * @param userId     用户ID
     * @return 任务ID
     */
    String submitReportTask(ReportType reportType, ReportParams params, Long userId);

    /**
     * 异步生成报表
     * 
     * @param taskId     任务ID
     * @param reportType 报表类型
     * @param params     报表参数
     * @param userId     用户ID
     * @return CompletableFuture对象
     */
    CompletableFuture<ReportResult> generateReportAsync(String taskId, ReportType reportType,
            ReportParams params, Long userId);

    /**
     * 获取任务状态
     * 
     * @param taskId 任务ID
     * @return 任务状态
     */
    TaskStatus getTaskStatus(String taskId);

    /**
     * 获取任务进度
     * 
     * @param taskId 任务ID
     * @return 进度百分比（0-100）
     */
    int getTaskProgress(String taskId);

    /**
     * 取消任务
     * 
     * @param taskId 任务ID
     * @return true表示取消成功
     */
    boolean cancelTask(String taskId);

    /**
     * 获取任务结果
     * 
     * @param taskId 任务ID
     * @return 报表结果
     */
    ReportResult getTaskResult(String taskId);

    /**
     * 获取用户任务列表
     * 
     * @param userId 用户ID
     * @return 任务列表
     */
    List<TaskInfo> getUserTasks(Long userId);

    /**
     * 清理过期任务
     * 
     * 清理已完成或已取消超过指定时间的任务
     * 
     * @param expireDays 过期天数
     * @return 清理的任务数量
     */
    int cleanExpiredTasks(int expireDays);

    /**
     * 报表类型枚举
     */
    enum ReportType {
        /**
         * 库存汇总报表
         */
        INVENTORY_SUMMARY("库存汇总报表", "inventory_summary"),

        /**
         * 库存明细报表
         */
        INVENTORY_DETAIL("库存明细报表", "inventory_detail"),

        /**
         * 库存预警报表
         */
        INVENTORY_WARNING("库存预警报表", "inventory_warning"),

        /**
         * 设备台账报表
         */
        DEVICE_LEDGER("设备台账报表", "device_ledger"),

        /**
         * 设备状态统计报表
         */
        DEVICE_STATUS_STATS("设备状态统计报表", "device_status_stats"),

        /**
         * 设备维修记录报表
         */
        DEVICE_MAINTENANCE("设备维修记录报表", "device_maintenance"),

        /**
         * 出入库统计报表
         */
        STOCK_IN_OUT_STATS("出入库统计报表", "stock_in_out_stats"),

        /**
         * 订单执行分析报表
         */
        ORDER_EXECUTION_ANALYSIS("订单执行分析报表", "order_execution_analysis"),

        /**
         * 综合数据报表
         */
        COMPREHENSIVE_DATA("综合数据报表", "comprehensive_data");

        private final String displayName;
        private final String code;

        ReportType(String displayName, String code) {
            this.displayName = displayName;
            this.code = code;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getCode() {
            return code;
        }
    }

    /**
     * 报表参数类
     */
    class ReportParams {
        private String startDate;
        private String endDate;
        private Long areaId;
        private Long deviceTypeId;
        private Integer status;
        private String keyword;
        private String exportFormat; // excel, pdf, csv
        private List<String> columns; // 需要导出的列

        // Getters and Setters
        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }

        public Long getAreaId() {
            return areaId;
        }

        public void setAreaId(Long areaId) {
            this.areaId = areaId;
        }

        public Long getDeviceTypeId() {
            return deviceTypeId;
        }

        public void setDeviceTypeId(Long deviceTypeId) {
            this.deviceTypeId = deviceTypeId;
        }

        public Integer getStatus() {
            return status;
        }

        public void setStatus(Integer status) {
            this.status = status;
        }

        public String getKeyword() {
            return keyword;
        }

        public void setKeyword(String keyword) {
            this.keyword = keyword;
        }

        public String getExportFormat() {
            return exportFormat;
        }

        public void setExportFormat(String exportFormat) {
            this.exportFormat = exportFormat;
        }

        public List<String> getColumns() {
            return columns;
        }

        public void setColumns(List<String> columns) {
            this.columns = columns;
        }
    }

    /**
     * 报表结果类
     */
    class ReportResult {
        private String taskId;
        private boolean success;
        private String message;
        private String fileUrl;
        private String fileName;
        private Long fileSize;
        private Integer recordCount;
        private Long generateTime; // 生成耗时（毫秒）
        private Long completedTime;

        public static ReportResult success(String taskId, String fileUrl, String fileName,
                Long fileSize, Integer recordCount, Long generateTime) {
            ReportResult result = new ReportResult();
            result.taskId = taskId;
            result.success = true;
            result.fileUrl = fileUrl;
            result.fileName = fileName;
            result.fileSize = fileSize;
            result.recordCount = recordCount;
            result.generateTime = generateTime;
            result.completedTime = System.currentTimeMillis();
            return result;
        }

        public static ReportResult failure(String taskId, String message) {
            ReportResult result = new ReportResult();
            result.taskId = taskId;
            result.success = false;
            result.message = message;
            result.completedTime = System.currentTimeMillis();
            return result;
        }

        // Getters and Setters
        public String getTaskId() {
            return taskId;
        }

        public void setTaskId(String taskId) {
            this.taskId = taskId;
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

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public Long getFileSize() {
            return fileSize;
        }

        public void setFileSize(Long fileSize) {
            this.fileSize = fileSize;
        }

        public Integer getRecordCount() {
            return recordCount;
        }

        public void setRecordCount(Integer recordCount) {
            this.recordCount = recordCount;
        }

        public Long getGenerateTime() {
            return generateTime;
        }

        public void setGenerateTime(Long generateTime) {
            this.generateTime = generateTime;
        }

        public Long getCompletedTime() {
            return completedTime;
        }

        public void setCompletedTime(Long completedTime) {
            this.completedTime = completedTime;
        }
    }

    /**
     * 任务状态枚举
     */
    enum TaskStatus {
        PENDING("等待中"),
        RUNNING("执行中"),
        COMPLETED("已完成"),
        FAILED("执行失败"),
        CANCELLED("已取消"),
        TIMEOUT("执行超时");

        private final String displayName;

        TaskStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 任务信息类
     */
    class TaskInfo {
        private String taskId;
        private ReportType reportType;
        private TaskStatus status;
        private int progress;
        private Long userId;
        private Long submitTime;
        private Long startTime;
        private Long completeTime;
        private String message;

        // Getters and Setters
        public String getTaskId() {
            return taskId;
        }

        public void setTaskId(String taskId) {
            this.taskId = taskId;
        }

        public ReportType getReportType() {
            return reportType;
        }

        public void setReportType(ReportType reportType) {
            this.reportType = reportType;
        }

        public TaskStatus getStatus() {
            return status;
        }

        public void setStatus(TaskStatus status) {
            this.status = status;
        }

        public int getProgress() {
            return progress;
        }

        public void setProgress(int progress) {
            this.progress = progress;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Long getSubmitTime() {
            return submitTime;
        }

        public void setSubmitTime(Long submitTime) {
            this.submitTime = submitTime;
        }

        public Long getStartTime() {
            return startTime;
        }

        public void setStartTime(Long startTime) {
            this.startTime = startTime;
        }

        public Long getCompleteTime() {
            return completeTime;
        }

        public void setCompleteTime(Long completeTime) {
            this.completeTime = completeTime;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
