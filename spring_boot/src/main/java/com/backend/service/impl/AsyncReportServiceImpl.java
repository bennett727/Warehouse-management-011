package com.backend.service.impl;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.backend.service.notification.WebSocketNotificationService;
import com.backend.service.report.AsyncReportService;

import lombok.extern.slf4j.Slf4j;

/**
 * 异步报表服务实现类
 *
 * 功能说明：
 * 实现报表的异步生成和导出功能
 *
 * 核心特性：
 * - 异步执行：报表生成在后台线程执行
 * - 任务管理：支持任务状态跟踪和取消
 * - 进度通知：通过WebSocket实时推送进度
 * - 结果缓存：生成结果缓存一定时间
 *
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Slf4j
@Service
public class AsyncReportServiceImpl implements AsyncReportService {

    @Autowired
    private WebSocketNotificationService notificationService;

    // 任务存储（实际应用应使用Redis）
    private final Map<String, TaskInfo> taskStore = new ConcurrentHashMap<>();
    private final Map<String, ReportResult> resultStore = new ConcurrentHashMap<>();

    /**
     * 提交报表生成任务
     *
     * @param reportType 报表类型
     * @param params     报表参数
     * @param userId     用户ID
     * @return 任务ID
     */
    @Override
    public String submitReportTask(ReportType reportType, ReportParams params, Long userId) {
        // 生成任务ID
        String taskId = generateTaskId();

        // 创建任务信息
        TaskInfo taskInfo = new TaskInfo();
        taskInfo.setTaskId(taskId);
        taskInfo.setReportType(reportType);
        taskInfo.setStatus(TaskStatus.PENDING);
        taskInfo.setProgress(0);
        taskInfo.setUserId(userId);
        taskInfo.setSubmitTime(System.currentTimeMillis());

        // 保存任务
        taskStore.put(taskId, taskInfo);

        log.info("提交报表任务: taskId={}, type={}, userId={}", taskId, reportType.getDisplayName(), userId);

        // 异步执行报表生成
        generateReportAsync(taskId, reportType, params, userId);

        return taskId;
    }

    /**
     * 异步生成报表
     *
     * @param taskId     任务ID
     * @param reportType 报表类型
     * @param params     报表参数
     * @param userId     用户ID
     * @return CompletableFuture对象
     */
    @Override
    @Async("taskExecutor")
    public CompletableFuture<ReportResult> generateReportAsync(String taskId, ReportType reportType,
            ReportParams params, Long userId) {
        TaskInfo taskInfo = taskStore.get(taskId);
        if (taskInfo == null) {
            return CompletableFuture.completedFuture(
                    ReportResult.failure(taskId, "任务不存在"));
        }

        // 更新任务状态为执行中
        taskInfo.setStatus(TaskStatus.RUNNING);
        taskInfo.setStartTime(System.currentTimeMillis());

        long startTime = System.currentTimeMillis();

        try {
            // 模拟报表生成过程
            log.info("开始生成报表: taskId={}, type={}", taskId, reportType.getDisplayName());

            // 更新进度：10%
            updateProgress(taskId, 10);
            Thread.sleep(500);

            // 更新进度：30%
            updateProgress(taskId, 30);
            Thread.sleep(1000);

            // 更新进度：60%
            updateProgress(taskId, 60);
            Thread.sleep(1000);

            // 更新进度：90%
            updateProgress(taskId, 90);
            Thread.sleep(500);

            // 生成完成
            updateProgress(taskId, 100);

            // 生成文件URL（实际应从文件服务获取）
            String fileName = reportType.getCode() + "_" + System.currentTimeMillis() + ".xlsx";
            String fileUrl = "/api/reports/download/" + taskId;

            long generateTime = System.currentTimeMillis() - startTime;

            // 创建结果
            ReportResult result = ReportResult.success(
                    taskId, fileUrl, fileName, 1024L * 1024, 1000, generateTime);

            // 保存结果
            resultStore.put(taskId, result);

            // 更新任务状态
            taskInfo.setStatus(TaskStatus.COMPLETED);
            taskInfo.setCompleteTime(System.currentTimeMillis());

            // 发送完成通知
            notificationService.sendReportComplete(userId, reportType.getDisplayName(), fileUrl);

            log.info("报表生成完成: taskId={}, time={}ms", taskId, generateTime);

            return CompletableFuture.completedFuture(result);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            taskInfo.setStatus(TaskStatus.FAILED);
            taskInfo.setMessage("任务被中断");
            return CompletableFuture.completedFuture(
                    ReportResult.failure(taskId, "任务被中断"));
        } catch (Exception e) {
            taskInfo.setStatus(TaskStatus.FAILED);
            taskInfo.setMessage(e.getMessage());
            log.error("报表生成失败: taskId={}, error={}", taskId, e.getMessage());
            return CompletableFuture.completedFuture(
                    ReportResult.failure(taskId, "生成失败: " + e.getMessage()));
        }
    }

    /**
     * 获取任务状态
     *
     * @param taskId 任务ID
     * @return 任务状态
     */
    @Override
    public TaskStatus getTaskStatus(String taskId) {
        TaskInfo taskInfo = taskStore.get(taskId);
        return taskInfo != null ? taskInfo.getStatus() : null;
    }

    /**
     * 获取任务进度
     *
     * @param taskId 任务ID
     * @return 进度百分比（0-100）
     */
    @Override
    public int getTaskProgress(String taskId) {
        TaskInfo taskInfo = taskStore.get(taskId);
        return taskInfo != null ? taskInfo.getProgress() : 0;
    }

    /**
     * 取消任务
     *
     * @param taskId 任务ID
     * @return true表示取消成功
     */
    @Override
    public boolean cancelTask(String taskId) {
        TaskInfo taskInfo = taskStore.get(taskId);
        if (taskInfo == null) {
            return false;
        }

        // 只能取消等待中或执行中的任务
        if (taskInfo.getStatus() == TaskStatus.PENDING ||
                taskInfo.getStatus() == TaskStatus.RUNNING) {
            taskInfo.setStatus(TaskStatus.CANCELLED);
            log.info("取消报表任务: taskId={}", taskId);
            return true;
        }

        return false;
    }

    /**
     * 获取任务结果
     *
     * @param taskId 任务ID
     * @return 报表结果
     */
    @Override
    public ReportResult getTaskResult(String taskId) {
        return resultStore.get(taskId);
    }

    /**
     * 获取用户任务列表
     *
     * @param userId 用户ID
     * @return 任务列表
     */
    @Override
    public List<TaskInfo> getUserTasks(Long userId) {
        return taskStore.values().stream()
                .filter(task -> task.getUserId().equals(userId))
                .toList();
    }

    /**
     * 清理过期任务
     *
     * @param expireDays 过期天数
     * @return 清理的任务数量
     */
    @Override
    public int cleanExpiredTasks(int expireDays) {
        long expireTime = System.currentTimeMillis() - (expireDays * 24 * 60 * 60 * 1000L);

        int count = 0;
        taskStore.entrySet().removeIf(entry -> {
            TaskInfo task = entry.getValue();
            return (task.getStatus() == TaskStatus.COMPLETED ||
                    task.getStatus() == TaskStatus.CANCELLED ||
                    task.getStatus() == TaskStatus.FAILED) &&
                    task.getCompleteTime() != null &&
                    task.getCompleteTime() < expireTime;
        });

        log.info("清理过期报表任务: count={}", count);
        return count;
    }

    // ==================== 私有方法 ====================

    /**
     * 生成任务ID
     */
    private String generateTaskId() {
        return "RPT" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    /**
     * 更新任务进度
     */
    private void updateProgress(String taskId, int progress) {
        TaskInfo taskInfo = taskStore.get(taskId);
        if (taskInfo != null) {
            taskInfo.setProgress(progress);
            log.debug("报表任务进度更新: taskId={}, progress={}%", taskId, progress);
        }
    }
}
