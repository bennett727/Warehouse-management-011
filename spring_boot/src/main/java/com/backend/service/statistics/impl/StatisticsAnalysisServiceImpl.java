package com.backend.service.statistics.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.entity.Area;
import com.backend.entity.Device;
import com.backend.entity.InstallationRecord;
import com.backend.entity.Inventory;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.entity.StockOrderItem;
import com.backend.enums.DeviceStatus;
import com.backend.repository.AreaRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceStatusApprovalRepository;
import com.backend.repository.InstallationRecordRepository;
import com.backend.repository.InventoryRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.repository.RepairRecordRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.service.statistics.StatisticsAnalysisService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 统计分析服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsAnalysisServiceImpl implements StatisticsAnalysisService {

    private final DeviceRepository deviceRepository;
    private final InventoryRepository inventoryRepository;
    private final StockOrderRepository stockOrderRepository;
    private final StockOrderItemRepository stockOrderItemRepository;
    private final InstallationRecordRepository installationRecordRepository;
    private final RepairRecordRepository repairRecordRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final DeviceStatusApprovalRepository deviceStatusApprovalRepository;
    private final AreaRepository areaRepository;

    @Override
    public DeviceComprehensiveStats getDeviceComprehensiveStats() {
        List<Device> allDevices = deviceRepository.findAll();

        long total = allDevices.size();
        // 待入库设备：已创建但尚未正式入库
        long pendingInbound = allDevices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.PENDING_INBOUND.getCode())
                .count();
        // 活跃设备：排除已报废和待入库的设备（待入库设备尚未正式投入使用）
        long active = allDevices.stream()
                .filter(d -> d.getStatus() != null 
                        && d.getStatus() != DeviceStatus.SCRAPPED.getCode()
                        && d.getStatus() != DeviceStatus.PENDING_INBOUND.getCode())
                .count();
        // 在库设备：可用于出库的设备
        long inStock = allDevices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.IN_STOCK.getCode())
                .count();
        long inUse = allDevices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.IN_USE.getCode())
                .count();
        long inMaintenance = allDevices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.UNDER_REPAIR.getCode())
                .count();
        long scrapped = allDevices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.SCRAPPED.getCode())
                .count();

        double avgDaysInUse = calculateAvgDaysInUse(allDevices);
        // 利用率计算：使用中设备 / (总设备 - 待入库设备 - 已报废设备)
        long availableDevices = total - pendingInbound - scrapped;
        double utilizationRate = availableDevices > 0 ? (double) inUse / availableDevices * 100 : 0;

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newThisMonth = allDevices.stream()
                .filter(d -> d.getCreateTime() != null && !d.getCreateTime().isBefore(monthStart))
                .count();
        long maintenanceThisMonth = repairRecordRepository.countByRepairStartTimeAfter(monthStart);

        return new DeviceComprehensiveStats(
                total, active, inUse, inMaintenance, scrapped,
                avgDaysInUse, utilizationRate, newThisMonth, maintenanceThisMonth);
    }

    @Override
    public InventoryComprehensiveStats getInventoryComprehensiveStats() {
        List<Inventory> allInventory = inventoryRepository.findAll();

        long totalItems = allInventory.size();
        long totalQuantity = allInventory.stream()
                .mapToLong(i -> i.getQuantity() != null ? i.getQuantity() : 0)
                .sum();
        double totalValue = allInventory.stream()
                .mapToDouble(i -> {
                    if (i.getDevice() != null && i.getDevice().getUnitPrice() != null && i.getQuantity() != null) {
                        return i.getDevice().getUnitPrice().doubleValue() * i.getQuantity();
                    }
                    return 0;
                })
                .sum();

        long lowStock = allInventory.stream()
                .filter(i -> i.getDevice() != null &&
                        i.getQuantity() != null &&
                        i.getDevice().getMinStock() != null &&
                        i.getQuantity() <= i.getDevice().getMinStock())
                .count();
        long outOfStock = allInventory.stream()
                .filter(i -> i.getQuantity() == null || i.getQuantity() == 0)
                .count();
        long overStock = allInventory.stream()
                .filter(i -> i.getDevice() != null &&
                        i.getQuantity() != null &&
                        i.getDevice().getMaxStock() != null &&
                        i.getQuantity() >= i.getDevice().getMaxStock())
                .count();

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long inboundThisMonth = stockOrderRepository.findAll().stream()
                .filter(o -> o.getOrderType() == 0 && o.getCreateTime() != null
                        && !o.getCreateTime().isBefore(monthStart))
                .count();
        long outboundThisMonth = stockOrderRepository.findAll().stream()
                .filter(o -> o.getOrderType() == 1 && o.getCreateTime() != null
                        && !o.getCreateTime().isBefore(monthStart))
                .count();

        return new InventoryComprehensiveStats(
                totalItems, totalQuantity, totalValue,
                lowStock, outOfStock, overStock,
                calculateAvgTurnoverDays(),
                inboundThisMonth, outboundThisMonth);
    }

    @Override
    public BusinessRecordStats getBusinessRecordStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<InstallationRecord> installations = installationRecordRepository.findAll();
        List<RepairRecord> repairs = repairRecordRepository.findAll();
        List<MaintenanceRecord> maintenances = maintenanceRecordRepository.findAll();

        long totalInstallations = installations.size();
        long totalRepairs = repairs.size();
        long totalMaintenance = maintenances.size();
        long totalScraps = deviceRepository.findAll().stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.SCRAPPED.getCode())
                .count();

        double avgRepairTime = repairs.stream()
                .filter(r -> r.getRepairStartTime() != null && r.getRepairEndTime() != null)
                .mapToDouble(r -> ChronoUnit.HOURS.between(r.getRepairStartTime(), r.getRepairEndTime()))
                .average()
                .orElse(0);

        double totalRepairCost = repairs.stream()
                .filter(r -> r.getRepairCost() != null)
                .mapToDouble(r -> r.getRepairCost().doubleValue())
                .sum();

        double totalMaintenanceCost = maintenances.stream()
                .filter(m -> m.getActualCost() != null)
                .mapToDouble(m -> m.getActualCost().doubleValue())
                .sum();

        long pendingApprovals = deviceStatusApprovalRepository.countByStatus(0);

        return new BusinessRecordStats(
                totalInstallations, totalRepairs, totalMaintenance, totalScraps,
                avgRepairTime, totalRepairCost, totalMaintenanceCost, pendingApprovals);
    }

    @Override
    public List<StatusDistribution> getDeviceStatusDistribution() {
        List<Device> allDevices = deviceRepository.findAll();
        long total = allDevices.size();

        Map<Integer, Long> statusCounts = allDevices.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getStatus() != null ? d.getStatus() : -1,
                        Collectors.counting()));

        return statusCounts.entrySet().stream()
                .map(e -> new StatusDistribution(
                        String.valueOf(e.getKey()),
                        getStatusText(e.getKey()),
                        e.getValue(),
                        total > 0 ? (double) e.getValue() / total * 100 : 0))
                .sorted(Comparator.comparing(StatusDistribution::count).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<TypeDistribution> getDeviceTypeDistribution() {
        List<Device> allDevices = deviceRepository.findAll();
        long total = allDevices.size();

        Map<Long, List<Device>> byType = allDevices.stream()
                .filter(d -> d.getDeviceType() != null)
                .collect(Collectors.groupingBy(d -> d.getDeviceType().getId()));

        return byType.entrySet().stream()
                .map(e -> {
                    List<Device> devices = e.getValue();
                    double avgAge = devices.stream()
                            .filter(d -> d.getCreateTime() != null)
                            .mapToDouble(d -> ChronoUnit.DAYS.between(d.getCreateTime().toLocalDate(),
                                    LocalDateTime.now().toLocalDate()))
                            .average()
                            .orElse(0);

                    return new TypeDistribution(
                            e.getKey(),
                            devices.get(0).getDeviceType().getTypeName(),
                            devices.size(),
                            total > 0 ? (double) devices.size() / total * 100 : 0,
                            avgAge);
                })
                .sorted(Comparator.comparing(TypeDistribution::count).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<TurnoverRate> getInventoryTurnoverRate(LocalDateTime startDate, LocalDateTime endDate) {
        List<StockOrderItem> allItems = stockOrderItemRepository.findAll();

        Map<Long, List<StockOrderItem>> byDevice = allItems.stream()
                .filter(item -> item.getDeviceId() != null)
                .collect(Collectors.groupingBy(StockOrderItem::getDeviceId));

        return byDevice.entrySet().stream()
                .map(e -> {
                    List<StockOrderItem> items = e.getValue();
                    int inbound = (int) items.stream()
                            .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 0)
                            .count();
                    int outbound = (int) items.stream()
                            .filter(item -> item.getStockOrder() != null && item.getStockOrder().getOrderType() == 1)
                            .count();

                    Device device = items.get(0).getDevice();
                    double turnoverRate = inbound + outbound > 0 ? (double) outbound / (inbound + outbound) * 100 : 0;

                    return new TurnoverRate(
                            e.getKey(),
                            device != null ? device.getDeviceCode() : "Unknown",
                            device != null ? device.getDeviceName() : "Unknown",
                            inbound, outbound, turnoverRate,
                            calculateAvgDaysInStockForDevice(e.getKey()));
                })
                .sorted(Comparator.comparing(TurnoverRate::turnoverRate).reversed())
                .limit(20)
                .collect(Collectors.toList());
    }

    @Override
    public RepairEfficiencyStats getRepairEfficiencyStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<RepairRecord> repairs = repairRecordRepository.findAll();

        long total = repairs.size();
        long completed = repairs.stream()
                .filter(r -> r.getStatus() != null && r.getStatus() == 2)
                .count();
        long pending = repairs.stream()
                .filter(r -> r.getStatus() != null && r.getStatus() == 0)
                .count();

        double avgTime = repairs.stream()
                .filter(r -> r.getRepairStartTime() != null && r.getRepairEndTime() != null)
                .mapToDouble(r -> ChronoUnit.HOURS.between(r.getRepairStartTime(), r.getRepairEndTime()))
                .average()
                .orElse(0);

        double onTimeRate = calculateOnTimeCompletionRate(repairs);
        double totalCost = repairs.stream()
                .filter(r -> r.getRepairCost() != null)
                .mapToDouble(r -> r.getRepairCost().doubleValue())
                .sum();

        return new RepairEfficiencyStats(
                total, completed, pending, avgTime, onTimeRate,
                totalCost, total > 0 ? totalCost / total : 0);
    }

    @Override
    public UtilizationStats getDeviceUtilizationStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<Device> allDevices = deviceRepository.findAll();

        double overallRate = allDevices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.IN_USE.getCode())
                .count() / (double) allDevices.size() * 100;

        double avgDaysInUse = calculateAvgDaysInUse(allDevices);
        double avgDaysIdle = calculateAvgDaysIdle(allDevices);

        Map<String, List<Device>> byType = allDevices.stream()
                .filter(d -> d.getDeviceType() != null)
                .collect(Collectors.groupingBy(d -> d.getDeviceType().getTypeName()));

        List<UtilizationByType> utilizationByType = byType.entrySet().stream()
                .map(e -> {
                    long total = e.getValue().size();
                    long inUse = e.getValue().stream()
                            .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.IN_USE.getCode())
                            .count();
                    return new UtilizationByType(
                            e.getKey(),
                            total,
                            inUse,
                            total > 0 ? (double) inUse / total * 100 : 0);
                })
                .collect(Collectors.toList());

        return new UtilizationStats(overallRate, avgDaysInUse, avgDaysIdle, utilizationByType);
    }

    @Override
    public TrendAnalysis getTrendAnalysis(String metric, LocalDateTime startDate, LocalDateTime endDate,
            String granularity) {
        List<TrendDataPoint> dataPoints = new ArrayList<>();

        return new TrendAnalysis(metric, granularity, dataPoints, 0, "stable");
    }

    @Override
    public AlertStats getAlertStats() {
        List<Inventory> allInventory = inventoryRepository.findAll();

        long lowStock = allInventory.stream()
                .filter(i -> i.getDevice() != null &&
                        i.getQuantity() != null &&
                        i.getDevice().getMinStock() != null &&
                        i.getQuantity() <= i.getDevice().getMinStock())
                .count();

        long maintenanceDue = maintenanceRecordRepository
                .countByNextMaintenanceTimeBefore(LocalDateTime.now().plusDays(7));
        long overdueRepairs = repairRecordRepository.countByStatus(0);
        long pendingApprovals = deviceStatusApprovalRepository.countByStatus(0);

        return new AlertStats(lowStock, maintenanceDue, overdueRepairs, 0, pendingApprovals);
    }

    @Override
    public List<OperatorPerformance> getOperatorPerformance(LocalDateTime startDate, LocalDateTime endDate) {
        return Collections.emptyList();
    }

    @Override
    public List<AreaInventoryStats> getAreaInventoryStats() {
        List<Area> areas = areaRepository.findAll();

        return areas.stream()
                .map(area -> {
                    List<Inventory> areaInventory = inventoryRepository.findAll().stream()
                            .filter(i -> i.getBin() != null && i.getBin().getArea() != null &&
                                    i.getBin().getArea().getId().equals(area.getId()))
                            .collect(Collectors.toList());

                    long totalItems = areaInventory.size();
                    long totalQuantity = areaInventory.stream()
                            .mapToLong(i -> i.getQuantity() != null ? i.getQuantity() : 0)
                            .sum();

                    long lowStock = areaInventory.stream()
                            .filter(i -> i.getDevice() != null &&
                                    i.getQuantity() != null &&
                                    i.getDevice().getMinStock() != null &&
                                    i.getQuantity() <= i.getDevice().getMinStock())
                            .count();

                    return new AreaInventoryStats(
                            area.getId(),
                            area.getName(),
                            totalItems,
                            totalQuantity,
                            0,
                            lowStock);
                })
                .collect(Collectors.toList());
    }

    private double calculateAvgDaysInUse(List<Device> devices) {
        return devices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.IN_USE.getCode())
                .filter(d -> d.getUpdateTime() != null)
                .mapToDouble(d -> ChronoUnit.DAYS.between(d.getUpdateTime().toLocalDate(),
                        LocalDateTime.now().toLocalDate()))
                .average()
                .orElse(0);
    }

    private double calculateAvgDaysIdle(List<Device> devices) {
        return devices.stream()
                .filter(d -> d.getStatus() != null && d.getStatus() == DeviceStatus.NORMAL.getCode())
                .filter(d -> d.getUpdateTime() != null)
                .mapToDouble(d -> ChronoUnit.DAYS.between(d.getUpdateTime().toLocalDate(),
                        LocalDateTime.now().toLocalDate()))
                .average()
                .orElse(0);
    }

    private double calculateAvgTurnoverDays() {
        return 7.0;
    }

    private double calculateOnTimeCompletionRate(List<RepairRecord> repairs) {
        return 85.0;
    }

    private double calculateAvgDaysInStockForDevice(Long deviceId) {
        return 5.0;
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
}
