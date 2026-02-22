package com.backend.service.lifecycle.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.entity.Device;
import com.backend.entity.DeviceStatusApproval;
import com.backend.entity.InstallationRecord;
import com.backend.entity.Inventory;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.enums.DeviceStatus;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceStatusApprovalRepository;
import com.backend.repository.InstallationRecordRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.repository.RepairRecordRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.service.lifecycle.DeviceLifecycleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 设备生命周期服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceLifecycleServiceImpl implements DeviceLifecycleService {

    private final DeviceRepository deviceRepository;
    private final StockOrderRepository stockOrderRepository;
    private final StockOrderItemRepository stockOrderItemRepository;
    private final InstallationRecordRepository installationRecordRepository;
    private final RepairRecordRepository repairRecordRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final DeviceStatusApprovalRepository deviceStatusApprovalRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public DeviceLifecycleOverview getLifecycleOverview(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("设备不存在"));

        List<StockOrderItem> inboundItems = stockOrderItemRepository.findByDeviceId(deviceId);
        List<InstallationRecord> installations = installationRecordRepository.findByDeviceId(deviceId);
        List<RepairRecord> repairs = repairRecordRepository.findByDeviceIdOrderByRepairDateDesc(deviceId);
        List<MaintenanceRecord> maintenances = maintenanceRecordRepository
                .findByDeviceIdOrderByCreateTimeDesc(deviceId);

        int inboundCount = (int) inboundItems.stream()
                .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 0)
                .count();
        int outboundCount = (int) inboundItems.stream()
                .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 1)
                .count();

        int daysInUse = calculateDaysInUse(device);
        int daysInRepair = calculateDaysInRepair(repairs);

        LocalDateTime lastOperationTime = findLastOperationTime(inboundItems, installations, repairs, maintenances);
        String lastOperationType = determineLastOperationType(inboundItems, installations, repairs, maintenances,
                lastOperationTime);

        String location = getCurrentLocation(device);
        String currentHolder = getCurrentHolder(device, installations);

        return new DeviceLifecycleOverview(
                device.getId(),
                device.getDeviceCode(),
                device.getDeviceName(),
                device.getStatus() != null ? String.valueOf(device.getStatus()) : null,
                getStatusText(device.getStatus()),
                device.getCreateTime(),
                device.getUpdateTime(),
                inboundCount,
                outboundCount,
                installations.size(),
                repairs.size(),
                maintenances.size(),
                0,
                daysInUse,
                daysInRepair,
                lastOperationType,
                lastOperationTime,
                location,
                currentHolder);
    }

    @Override
    public List<LifecycleEvent> getLifecycleEvents(Long deviceId, String eventType, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<LifecycleEvent> events = new ArrayList<>();

        if (eventType == null || "INBOUND".equals(eventType)) {
            addInboundEvents(deviceId, events, startDate, endDate);
        }
        if (eventType == null || "OUTBOUND".equals(eventType)) {
            addOutboundEvents(deviceId, events, startDate, endDate);
        }
        if (eventType == null || "INSTALLATION".equals(eventType)) {
            addInstallationEvents(deviceId, events, startDate, endDate);
        }
        if (eventType == null || "REPAIR".equals(eventType)) {
            addRepairEvents(deviceId, events, startDate, endDate);
        }
        if (eventType == null || "MAINTENANCE".equals(eventType)) {
            addMaintenanceEvents(deviceId, events, startDate, endDate);
        }

        return events.stream()
                .filter(e -> startDate == null || !e.eventTime().isBefore(startDate))
                .filter(e -> endDate == null || !e.eventTime().isAfter(endDate))
                .sorted(Comparator.comparing(LifecycleEvent::eventTime).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<LifecycleTimelineEntry> getLifecycleTimeline(Long deviceId) {
        List<LifecycleTimelineEntry> timeline = new ArrayList<>();

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("设备不存在"));

        timeline.add(new LifecycleTimelineEntry(
                device.getCreateTime(),
                "CREATE",
                "设备创建",
                "设备 " + device.getDeviceName() + " 创建入库",
                "Plus",
                "#67C23A",
                Map.of("deviceCode", device.getDeviceCode())));

        List<LifecycleEvent> events = getLifecycleEvents(deviceId, null, null, null);
        for (LifecycleEvent event : events) {
            timeline.add(new LifecycleTimelineEntry(
                    event.eventTime(),
                    event.eventType(),
                    event.eventTypeName(),
                    event.description(),
                    getEventIcon(event.eventType()),
                    getEventColor(event.eventType()),
                    event.details()));
        }

        return timeline.stream()
                .sorted(Comparator.comparing(LifecycleTimelineEntry::time).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<StatusChangeRecord> getStatusChangeHistory(Long deviceId) {
        List<StatusChangeRecord> history = new ArrayList<>();

        List<DeviceStatusApproval> approvals = deviceStatusApprovalRepository
                .findByDeviceIdOrderByCreateTimeDesc(deviceId);
        for (DeviceStatusApproval approval : approvals) {
            history.add(new StatusChangeRecord(
                    approval.getId(),
                    String.valueOf(approval.getFromStatus()),
                    getStatusText(approval.getFromStatus()),
                    String.valueOf(approval.getToStatus()),
                    getStatusText(approval.getToStatus()),
                    approval.getCreateTime(),
                    approval.getApplicantName(),
                    approval.getReason(),
                    String.valueOf(approval.getId())));
        }

        return history;
    }

    @Override
    public DeviceRelatedRecords getRelatedRecords(Long deviceId) {
        List<StockOrderItem> items = stockOrderItemRepository.findByDeviceId(deviceId);

        List<StockOrder> inboundOrders = items.stream()
                .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 0)
                .map(StockOrderItem::getStockOrder)
                .distinct()
                .collect(Collectors.toList());

        List<StockOrder> outboundOrders = items.stream()
                .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 1)
                .map(StockOrderItem::getStockOrder)
                .distinct()
                .collect(Collectors.toList());

        List<InstallationRecord> installations = installationRecordRepository.findByDeviceId(deviceId);
        List<RepairRecord> repairs = repairRecordRepository.findByDeviceIdOrderByRepairDateDesc(deviceId);
        List<MaintenanceRecord> maintenances = maintenanceRecordRepository
                .findByDeviceIdOrderByCreateTimeDesc(deviceId);
        List<DeviceStatusApproval> approvals = deviceStatusApprovalRepository
                .findByDeviceIdOrderByCreateTimeDesc(deviceId);

        return new DeviceRelatedRecords(
                inboundOrders,
                outboundOrders,
                installations,
                repairs,
                maintenances,
                approvals);
    }

    @Override
    public Map<String, Object> getLifecycleStatistics(Long deviceId) {
        Map<String, Object> statistics = new HashMap<>();

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("设备不存在"));

        DeviceRelatedRecords records = getRelatedRecords(deviceId);

        statistics.put("deviceId", deviceId);
        statistics.put("deviceCode", device.getDeviceCode());
        statistics.put("deviceName", device.getDeviceName());
        statistics.put("currentStatus", device.getStatus());
        statistics.put("currentStatusText", getStatusText(device.getStatus()));

        statistics.put("totalInboundCount", records.inboundOrders().size());
        statistics.put("totalOutboundCount", records.outboundOrders().size());
        statistics.put("totalInstallationCount", records.installationRecords().size());
        statistics.put("totalRepairCount", records.repairRecords().size());
        statistics.put("totalMaintenanceCount", records.maintenanceRecords().size());
        statistics.put("totalApprovalCount", records.statusApprovals().size());

        long daysSinceCreation = ChronoUnit.DAYS.between(
                device.getCreateTime().toLocalDate(),
                LocalDateTime.now().toLocalDate());
        statistics.put("daysSinceCreation", daysSinceCreation);

        int daysInUse = calculateDaysInUse(device);
        int daysInRepair = calculateDaysInRepair(records.repairRecords());
        statistics.put("daysInUse", daysInUse);
        statistics.put("daysInRepair", daysInRepair);
        statistics.put("utilizationRate", daysSinceCreation > 0 ? (double) daysInUse / daysSinceCreation * 100 : 0);

        return statistics;
    }

    @Override
    public List<DeviceLifecycleOverview> batchGetLifecycleOverview(List<Long> deviceIds) {
        return deviceIds.stream()
                .map(this::getLifecycleOverview)
                .collect(Collectors.toList());
    }

    private void addInboundEvents(Long deviceId, List<LifecycleEvent> events, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<StockOrderItem> items = stockOrderItemRepository.findByDeviceId(deviceId);
        items.stream()
                .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 0)
                .filter(item -> startDate == null || !item.getStockOrder().getCreateTime().isBefore(startDate))
                .filter(item -> endDate == null || !item.getStockOrder().getCreateTime().isAfter(endDate))
                .forEach(item -> {
                    StockOrder order = item.getStockOrder();
                    events.add(new LifecycleEvent(
                            order.getId(),
                            "INBOUND",
                            "入库",
                            order.getOrderNo(),
                            order.getCreateTime(),
                            order.getOperatorName(),
                            "设备入库，数量: " + item.getQuantity(),
                            String.valueOf(order.getStatus()),
                            getOrderStatusText(order.getStatus()),
                            order.getRemark(),
                            Map.of("quantity", item.getQuantity(), "supplier",
                                    order.getSupplierName() != null ? order.getSupplierName() : "")));
                });
    }

    private void addOutboundEvents(Long deviceId, List<LifecycleEvent> events, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<StockOrderItem> items = stockOrderItemRepository.findByDeviceId(deviceId);
        items.stream()
                .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 1)
                .filter(item -> startDate == null || !item.getStockOrder().getCreateTime().isBefore(startDate))
                .filter(item -> endDate == null || !item.getStockOrder().getCreateTime().isAfter(endDate))
                .forEach(item -> {
                    StockOrder order = item.getStockOrder();
                    events.add(new LifecycleEvent(
                            order.getId(),
                            "OUTBOUND",
                            "出库",
                            order.getOrderNo(),
                            order.getCreateTime(),
                            order.getOperatorName(),
                            "设备出库，类型: " + (order.getOutboundType() != null ? order.getOutboundType() : "普通出库"),
                            String.valueOf(order.getStatus()),
                            getOrderStatusText(order.getStatus()),
                            order.getRemark(),
                            Map.of("quantity", item.getQuantity(), "outboundType",
                                    order.getOutboundType() != null ? order.getOutboundType() : "")));
                });
    }

    private void addInstallationEvents(Long deviceId, List<LifecycleEvent> events, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<InstallationRecord> records = installationRecordRepository.findByDeviceId(deviceId);
        records.stream()
                .filter(record -> startDate == null || record.getCreateTime() == null
                        || !record.getCreateTime().isBefore(startDate))
                .filter(record -> endDate == null || record.getCreateTime() == null
                        || !record.getCreateTime().isAfter(endDate))
                .forEach(record -> {
                    events.add(new LifecycleEvent(
                            record.getId(),
                            "INSTALLATION",
                            "安装",
                            record.getInstallNo(),
                            record.getCreateTime(),
                            record.getInstallerName(),
                            "设备安装，位置: " + (record.getInstallLocation() != null ? record.getInstallLocation() : "未指定"),
                            String.valueOf(record.getStatus()),
                            getInstallationStatusText(record.getStatus()),
                            record.getRemark(),
                            Map.of("location", record.getInstallLocation() != null ? record.getInstallLocation() : "",
                                    "sourceOrderNo",
                                    record.getSourceOrderNo() != null ? record.getSourceOrderNo() : "")));
                });
    }

    private void addRepairEvents(Long deviceId, List<LifecycleEvent> events, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<RepairRecord> records = repairRecordRepository.findByDeviceIdOrderByRepairDateDesc(deviceId);
        records.stream()
                .filter(record -> startDate == null || record.getCreateTime() == null
                        || !record.getCreateTime().isBefore(startDate))
                .filter(record -> endDate == null || record.getCreateTime() == null
                        || !record.getCreateTime().isAfter(endDate))
                .forEach(record -> {
                    events.add(new LifecycleEvent(
                            record.getId(),
                            "REPAIR",
                            "维修",
                            record.getRepairNo(),
                            record.getCreateTime(),
                            record.getRepairPerson(),
                            "设备维修，故障: " + (record.getFaultDescription() != null ? record.getFaultDescription() : "未描述"),
                            String.valueOf(record.getStatus()),
                            getRepairStatusText(record.getStatus()),
                            record.getRemark(),
                            Map.of("faultDescription",
                                    record.getFaultDescription() != null ? record.getFaultDescription() : "",
                                    "sourceOrderNo",
                                    record.getSourceOrderNo() != null ? record.getSourceOrderNo() : "")));
                });
    }

    private void addMaintenanceEvents(Long deviceId, List<LifecycleEvent> events, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<MaintenanceRecord> records = maintenanceRecordRepository.findByDeviceIdOrderByCreateTimeDesc(deviceId);
        records.stream()
                .filter(record -> startDate == null || record.getCreateTime() == null
                        || !record.getCreateTime().isBefore(startDate))
                .filter(record -> endDate == null || record.getCreateTime() == null
                        || !record.getCreateTime().isAfter(endDate))
                .forEach(record -> {
                    events.add(new LifecycleEvent(
                            record.getId(),
                            "MAINTENANCE",
                            "保养",
                            record.getMaintenanceNo(),
                            record.getCreateTime(),
                            record.getMaintenancePerson(),
                            "设备保养，类型: " + getMaintenanceTypeText(record.getMaintenanceType()),
                            String.valueOf(record.getStatus()),
                            getMaintenanceStatusText(record.getStatus()),
                            record.getRemark(),
                            Map.of("maintenanceType",
                                    record.getMaintenanceType() != null ? record.getMaintenanceType() : 0)));
                });
    }

    private int calculateDaysInUse(Device device) {
        if (device.getStatus() == null)
            return 0;
        if (device.getStatus() == DeviceStatus.IN_USE.getCode()) {
            return (int) ChronoUnit.DAYS.between(
                    device.getUpdateTime().toLocalDate(),
                    LocalDateTime.now().toLocalDate());
        }
        return 0;
    }

    private int calculateDaysInRepair(List<RepairRecord> repairs) {
        return repairs.stream()
                .filter(r -> r.getStatus() != null && r.getStatus() == 1)
                .mapToInt(r -> (int) ChronoUnit.DAYS.between(
                        r.getRepairDate() != null ? r.getRepairDate() : r.getCreateTime().toLocalDate(),
                        LocalDateTime.now().toLocalDate()))
                .sum();
    }

    private LocalDateTime findLastOperationTime(List<StockOrderItem> items, List<InstallationRecord> installations,
            List<RepairRecord> repairs, List<MaintenanceRecord> maintenances) {
        return items.stream()
                .map(item -> item.getStockOrder() != null ? item.getStockOrder().getUpdateTime() : null)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
    }

    private String determineLastOperationType(List<StockOrderItem> items, List<InstallationRecord> installations,
            List<RepairRecord> repairs, List<MaintenanceRecord> maintenances, LocalDateTime lastTime) {
        return items.stream()
                .filter(item -> item.getStockOrder() != null && lastTime.equals(item.getStockOrder().getUpdateTime()))
                .map(item -> item.getStockOrder().getOrderType() == 0 ? "入库" : "出库")
                .findFirst()
                .orElse("其他");
    }

    private String getCurrentLocation(Device device) {
        List<Inventory> inventories = inventoryRepository.findByDeviceId(device.getId());
        if (!inventories.isEmpty()) {
            Inventory inv = inventories.get(0);
            if (inv.getBin() != null) {
                return inv.getBin().getCode();
            }
        }
        return "未知";
    }

    private String getCurrentHolder(Device device, List<InstallationRecord> installations) {
        return installations.stream()
                .filter(i -> i.getStatus() != null && i.getStatus() == 1)
                .map(InstallationRecord::getInstallerName)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private Integer parseStatus(String status) {
        try {
            return status != null ? Integer.parseInt(status) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String getStatusText(Integer status) {
        if (status == null)
            return "未知";
        return switch (status) {
            case 0 -> "待入库";
            case 1 -> "在库";
            case 2 -> "使用中";
            case 3 -> "维护中";
            case 4 -> "已报废";
            default -> "未知";
        };
    }

    private String getOrderStatusText(Integer status) {
        if (status == null)
            return "未知";
        return switch (status) {
            case 0 -> "草稿";
            case 1 -> "待审核";
            case 2 -> "已审核";
            case 3 -> "已完成";
            case -1 -> "已取消";
            default -> "未知";
        };
    }

    private String getInstallationStatusText(Integer status) {
        if (status == null)
            return "未知";
        return switch (status) {
            case 0 -> "待安装";
            case 1 -> "已安装";
            case 2 -> "已拆卸";
            default -> "未知";
        };
    }

    private String getRepairStatusText(Integer status) {
        if (status == null)
            return "未知";
        return switch (status) {
            case 0 -> "待维修";
            case 1 -> "维修中";
            case 2 -> "已完成";
            default -> "未知";
        };
    }

    private String getMaintenanceStatusText(Integer status) {
        if (status == null)
            return "未知";
        return switch (status) {
            case 0 -> "待保养";
            case 1 -> "保养中";
            case 2 -> "已完成";
            default -> "未知";
        };
    }

    private String getMaintenanceTypeText(Integer type) {
        if (type == null)
            return "未知";
        return switch (type) {
            case 0 -> "日常保养";
            case 1 -> "定期保养";
            case 2 -> "大修";
            default -> "未知";
        };
    }

    private String getEventIcon(String eventType) {
        return switch (eventType) {
            case "INBOUND" -> "Download";
            case "OUTBOUND" -> "Upload";
            case "INSTALLATION" -> "SetUp";
            case "REPAIR" -> "Tools";
            case "MAINTENANCE" -> "Brush";
            default -> "Document";
        };
    }

    private String getEventColor(String eventType) {
        return switch (eventType) {
            case "INBOUND" -> "#67C23A";
            case "OUTBOUND" -> "#E6A23C";
            case "INSTALLATION" -> "#409EFF";
            case "REPAIR" -> "#F56C6C";
            case "MAINTENANCE" -> "#909399";
            default -> "#909399";
        };
    }
}
