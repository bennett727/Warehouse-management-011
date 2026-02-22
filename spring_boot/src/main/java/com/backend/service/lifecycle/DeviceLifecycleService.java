package com.backend.service.lifecycle;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.backend.entity.DeviceStatusApproval;
import com.backend.entity.InstallationRecord;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.entity.StockOrder;

/**
 * 设备生命周期服务接口
 * 
 * 功能说明：
 * 提供设备全生命周期追踪功能，整合设备的入库、出库、安装、维修、保养、报废等全流程记录
 * 
 * 业务规则：
 * - 设备生命周期从入库开始，到报废结束
 * - 支持跨模块数据追溯
 * - 提供设备状态变更历史
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2026-02-12
 */
public interface DeviceLifecycleService {

    /**
     * 获取设备生命周期概览
     * 
     * @param deviceId 设备ID
     * @return 生命周期概览信息
     */
    DeviceLifecycleOverview getLifecycleOverview(Long deviceId);

    /**
     * 获取设备生命周期事件列表
     * 
     * @param deviceId  设备ID
     * @param eventType 事件类型（可选）：INBOUND, OUTBOUND, INSTALLATION, REPAIR,
     *                  MAINTENANCE, SCRAP
     * @param startDate 开始日期（可选）
     * @param endDate   结束日期（可选）
     * @return 事件列表
     */
    List<LifecycleEvent> getLifecycleEvents(Long deviceId, String eventType, LocalDateTime startDate,
            LocalDateTime endDate);

    /**
     * 获取设备生命周期时间线
     * 
     * @param deviceId 设备ID
     * @return 时间线数据
     */
    List<LifecycleTimelineEntry> getLifecycleTimeline(Long deviceId);

    /**
     * 获取设备状态变更历史
     * 
     * @param deviceId 设备ID
     * @return 状态变更历史
     */
    List<StatusChangeRecord> getStatusChangeHistory(Long deviceId);

    /**
     * 获取设备关联的业务记录
     * 
     * @param deviceId 设备ID
     * @return 关联记录
     */
    DeviceRelatedRecords getRelatedRecords(Long deviceId);

    /**
     * 获取设备生命周期统计
     * 
     * @param deviceId 设备ID
     * @return 统计信息
     */
    Map<String, Object> getLifecycleStatistics(Long deviceId);

    /**
     * 批量获取设备生命周期概览
     * 
     * @param deviceIds 设备ID列表
     * @return 生命周期概览列表
     */
    List<DeviceLifecycleOverview> batchGetLifecycleOverview(List<Long> deviceIds);

    /**
     * 设备生命周期概览
     */
    record DeviceLifecycleOverview(
            Long deviceId,
            String deviceCode,
            String deviceName,
            String currentStatus,
            String statusText,
            LocalDateTime createTime,
            LocalDateTime lastUpdateTime,
            Integer totalInboundCount,
            Integer totalOutboundCount,
            Integer totalInstallationCount,
            Integer totalRepairCount,
            Integer totalMaintenanceCount,
            Integer totalScrapCount,
            Integer daysInUse,
            Integer daysInRepair,
            String lastOperationType,
            LocalDateTime lastOperationTime,
            String location,
            String currentHolder) {
    }

    /**
     * 生命周期事件
     */
    record LifecycleEvent(
            Long id,
            String eventType,
            String eventTypeName,
            String eventNo,
            LocalDateTime eventTime,
            String operator,
            String description,
            String status,
            String statusText,
            String remark,
            Map<String, Object> details) {
    }

    /**
     * 生命周期时间线条目
     */
    record LifecycleTimelineEntry(
            LocalDateTime time,
            String eventType,
            String title,
            String description,
            String icon,
            String color,
            Map<String, Object> extra) {
    }

    /**
     * 状态变更记录
     */
    record StatusChangeRecord(
            Long id,
            String fromStatus,
            String fromStatusText,
            String toStatus,
            String toStatusText,
            LocalDateTime changeTime,
            String operator,
            String reason,
            String relatedOrderNo) {
    }

    /**
     * 设备关联记录
     */
    record DeviceRelatedRecords(
            List<StockOrder> inboundOrders,
            List<StockOrder> outboundOrders,
            List<InstallationRecord> installationRecords,
            List<RepairRecord> repairRecords,
            List<MaintenanceRecord> maintenanceRecords,
            List<DeviceStatusApproval> statusApprovals) {
    }
}
