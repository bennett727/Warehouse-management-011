package com.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.entity.InstallationRecord;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.enums.DeviceStatus;
import com.backend.exception.BusinessException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InstallationRecordRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.repository.RepairRecordRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 业务记录服务类
 * 
 * 功能说明：
 * 1. 设备安装记录管理
 * 2. 设备维修记录管理
 * 3. 设备维护记录管理
 * 4. 支持分页查询和条件筛选
 * 
 * 记录类型：
 * - 安装记录：记录设备的安装信息，包括安装位置、安装人员、安装时间等
 * - 维修记录：记录设备的故障维修信息，包括故障描述、维修措施、维修费用等
 * - 维护记录：记录设备的定期维护信息，包括维护内容、维护周期、维护结果等
 * 
 * 使用场景：
 * - 追踪设备全生命周期
 * - 设备维护计划管理
 * - 维修历史查询
 * - 维护成本统计
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecordService {

    /** 安装记录数据访问接口 */
    private final InstallationRecordRepository installationRecordRepository;

    /** 维修记录数据访问接口 */
    private final RepairRecordRepository repairRecordRepository;

    /** 维护记录数据访问接口 */
    private final MaintenanceRecordRepository maintenanceRecordRepository;

    /** 设备数据访问接口 */
    private final DeviceRepository deviceRepository;

    // ==================== 安装记录管理 ====================

    /**
     * 获取安装记录列表
     * 
     * 查询条件：
     * - 设备ID
     * - 安装人员
     * - 安装日期范围
     * 
     * @param deviceId  设备ID
     * @param installer 安装人员
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @param pageable  分页参数
     * @return 分页安装记录列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getInstallationRecords(
            Long deviceId, String installer, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        // 将 LocalDateTime 转换为 LocalDate
        java.time.LocalDate start = startDate != null ? startDate.toLocalDate() : null;
        java.time.LocalDate end = endDate != null ? endDate.toLocalDate() : null;

        // 注意：repository 方法使用 status 参数而不是 installer
        Page<InstallationRecord> page = installationRecordRepository.findByConditions(
                deviceId, null, start, end, pageable);

        List<Map<String, Object>> records = page.getContent().stream()
                .map(this::convertInstallationToMap)
                .collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    /**
     * 创建设备安装记录
     * 
     * 业务规则：
     * 1. 记录设备安装信息
     * 2. 验证设备状态必须为"在库"
     * 3. 更新设备安装状态
     * 4. 记录安装位置和安装人员
     * 5. 必须包含完整的省市区地址信息
     * 
     * @param record 安装记录信息
     * @return 创建结果
     */
    @Transactional
    public ApiResponse<Map<String, Object>> createInstallationRecord(InstallationRecord record) {
        // 验证设备是否存在
        Device device = deviceRepository.findById(record.getDeviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

        // 验证设备状态：只能为"在库"状态的设备创建安装记录
        if (device.getStatus() != DeviceStatus.IN_STOCK.getCode()) {
            throw new BusinessException(ErrorCode.INVALID_DEVICE_STATUS, 
                "只能为\"在库\"状态的设备创建安装记录，当前设备状态为：" + DeviceStatus.fromCode(device.getStatus()).getDescription());
        }

        // 验证必须包含完整的省市区地址信息
        if (record.getInstallationProvince() == null || record.getInstallationProvince().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "安装省份不能为空");
        }
        if (record.getInstallationCity() == null || record.getInstallationCity().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "安装城市不能为空");
        }
        if (record.getInstallationDistrict() == null || record.getInstallationDistrict().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "安装区县不能为空");
        }

        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        InstallationRecord saved = installationRecordRepository.save(record);

        // 更新设备安装状态和省市区地址信息
        device.setStatus(DeviceStatus.IN_USE.getCode()); // 设置为使用中状态
        device.setInstallationProvince(record.getInstallationProvince());
        device.setInstallationCity(record.getInstallationCity());
        device.setInstallationDistrict(record.getInstallationDistrict());
        device.setInstallationAddress(record.getInstallLocation());
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("deviceId", saved.getDeviceId());

        return ApiResponse.success("安装记录创建成功", result);
    }

    // ==================== 维修记录管理 ====================

    /**
     * 获取维修记录列表
     * 
     * 查询条件：
     * - 设备ID
     * - 故障类型
     * - 维修状态
     * - 维修日期范围
     * 
     * @param deviceId  设备ID
     * @param faultType 故障类型
     * @param status    维修状态
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @param pageable  分页参数
     * @return 分页维修记录列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getRepairRecords(
            Long deviceId, String faultType, Integer status,
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        // 将 LocalDateTime 转换为 LocalDate
        java.time.LocalDate start = startDate != null ? startDate.toLocalDate() : null;
        java.time.LocalDate end = endDate != null ? endDate.toLocalDate() : null;

        Page<RepairRecord> page = repairRecordRepository.findByConditions(
                deviceId, status, start, end, pageable);

        List<Map<String, Object>> records = page.getContent().stream()
                .map(this::convertRepairToMap)
                .collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    /**
     * 创建设备维修记录
     * 
     * 业务规则：
     * 1. 记录设备故障信息
     * 2. 设置维修状态为待维修
     * 3. 更新设备状态为维修中
     * 
     * @param record 维修记录信息
     * @return 创建结果
     */
    @Transactional
    public ApiResponse<Map<String, Object>> createRepairRecord(RepairRecord record) {
        // 验证设备是否存在
        Device device = deviceRepository.findById(record.getDeviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

        record.setStatus(0); // 待维修
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        RepairRecord saved = repairRecordRepository.save(record);

        // 更新设备状态为维修中
        device.setStatus(2); // 维修中
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("deviceId", saved.getDeviceId());

        return ApiResponse.success("维修记录创建成功", result);
    }

    /**
     * 完成维修
     * 
     * 业务规则：
     * 1. 更新维修记录状态为已完成
     * 2. 记录维修结果和费用
     * 3. 根据目标状态更新设备状态
     * 
     * @param id                 维修记录ID
     * @param repairResult       维修结果
     * @param repairCost         维修费用
     * @param targetDeviceStatus 设备目标状态（0:返回库存, 1:继续使用）
     * @return 完成结果
     */
    @Transactional
    public ApiResponse<Void> completeRepair(Long id, String repairResult, Double repairCost, Integer targetDeviceStatus) {
        RepairRecord record = repairRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));

        record.setStatus(2); // 已完成
        record.setRepairResult(repairResult);
        record.setRepairCost(repairCost != null ? java.math.BigDecimal.valueOf(repairCost) : null);
        record.setRepairEndTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        repairRecordRepository.save(record);

        // 更新设备状态
        Device device = deviceRepository.findById(record.getDeviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
        
        // 根据目标状态更新设备
        if (targetDeviceStatus != null) {
            if (targetDeviceStatus == DeviceStatus.IN_STOCK.getCode()) {
                device.setStatus(DeviceStatus.IN_STOCK.getCode());
            } else if (targetDeviceStatus == DeviceStatus.IN_USE.getCode()) {
                device.setStatus(DeviceStatus.IN_USE.getCode());
            } else {
                device.setStatus(DeviceStatus.NORMAL.getCode());
            }
        } else {
            device.setStatus(DeviceStatus.IN_STOCK.getCode());
        }
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);

        return ApiResponse.success("维修完成", null);
    }

    /**
     * 完成维修（兼容旧版API）
     * 
     * @param id           维修记录ID
     * @param repairResult 维修结果
     * @param repairCost   维修费用
     * @return 完成结果
     */
    @Transactional
    public ApiResponse<Void> completeRepair(Long id, String repairResult, Double repairCost) {
        return completeRepair(id, repairResult, repairCost, DeviceStatus.IN_STOCK.getCode());
    }

    // ==================== 维护记录管理 ====================

    /**
     * 获取维护记录列表
     * 
     * 查询条件：
     * - 设备ID
     * - 维护类型
     * - 维护状态
     * - 维护日期范围
     * 
     * @param deviceId        设备ID
     * @param maintenanceType 维护类型
     * @param status          维护状态
     * @param startDate       开始日期
     * @param endDate         结束日期
     * @param pageable        分页参数
     * @return 分页维护记录列表
     */
    public ApiResponse<PageResult<Map<String, Object>>> getMaintenanceRecords(
            Long deviceId, Integer maintenanceType, Integer status,
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {

        // 将 LocalDateTime 转换为 LocalDate
        java.time.LocalDate start = startDate != null ? startDate.toLocalDate() : null;
        java.time.LocalDate end = endDate != null ? endDate.toLocalDate() : null;

        Page<MaintenanceRecord> page = maintenanceRecordRepository.findByConditions(
                deviceId, maintenanceType, status, start, end, pageable);

        List<Map<String, Object>> records = page.getContent().stream()
                .map(this::convertMaintenanceToMap)
                .collect(Collectors.toList());

        return ApiResponse.success(PageResult.of(page, records));
    }

    /**
     * 创建设备维护记录
     * 
     * 业务规则：
     * 1. 记录维护计划和内容
     * 2. 设置维护状态为待执行
     * 3. 记录维护周期和预计时间
     * 
     * @param record 维护记录信息
     * @return 创建结果
     */
    @Transactional
    public ApiResponse<Map<String, Object>> createMaintenanceRecord(MaintenanceRecord record) {
        // 验证设备是否存在
        Device device = deviceRepository.findById(record.getDeviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));

        record.setStatus(0); // 待执行
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        MaintenanceRecord saved = maintenanceRecordRepository.save(record);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("deviceId", saved.getDeviceId());

        return ApiResponse.success("维护记录创建成功", result);
    }

    /**
     * 执行设备维护
     * 
     * 业务规则：
     * 1. 更新维护记录状态为已完成
     * 2. 记录维护结果和实际费用
     * 3. 计算下次维护时间
     * 
     * @param id                维护记录ID
     * @param maintenanceResult 维护结果
     * @param actualCost        实际费用
     * @return 执行结果
     */
    @Transactional
    public ApiResponse<Void> completeMaintenance(Long id, String maintenanceResult, Double actualCost) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAINTENANCE_RECORD_NOT_FOUND));

        record.setStatus(1); // 已完成
        record.setMaintenanceResult(maintenanceResult);
        record.setActualCost(actualCost != null ? java.math.BigDecimal.valueOf(actualCost) : null);
        record.setActualEndTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        // 计算下次维护时间（如果有维护周期）
        if (record.getMaintenanceCycle() != null && record.getMaintenanceCycle() > 0) {
            record.setNextMaintenanceTime(
                    record.getActualEndTime().plusDays(record.getMaintenanceCycle()));
        }

        maintenanceRecordRepository.save(record);

        return ApiResponse.success("维护完成", null);
    }

    // ==================== 统计查询 ====================

    /**
     * 获取设备维护统计
     * 
     * 统计维度：
     * - 待维修设备数量
     * - 维修中设备数量
     * - 本月维修次数
     * - 本月维护次数
     * - 即将到期的维护计划
     * 
     * @return 统计数据
     */
    public ApiResponse<Map<String, Object>> getRecordStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // 维修统计
        Long pendingRepairs = repairRecordRepository.countByStatus(0);
        Long inProgressRepairs = repairRecordRepository.countByStatus(1);

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        Long monthRepairs = repairRecordRepository.countByRepairStartTimeAfter(monthStart);

        stats.put("pendingRepairs", pendingRepairs);
        stats.put("inProgressRepairs", inProgressRepairs);
        stats.put("monthRepairs", monthRepairs);

        // 维护统计
        Long pendingMaintenance = maintenanceRecordRepository.countByStatus(0);
        Long monthMaintenance = maintenanceRecordRepository.countByPlannedStartTimeAfter(monthStart);

        stats.put("pendingMaintenance", pendingMaintenance);
        stats.put("monthMaintenance", monthMaintenance);

        // 即将到期的维护（7天内）
        LocalDateTime nextWeek = LocalDateTime.now().plusDays(7);
        Long upcomingMaintenance = maintenanceRecordRepository.countByNextMaintenanceTimeBefore(nextWeek);
        stats.put("upcomingMaintenance", upcomingMaintenance);

        return ApiResponse.success(stats);
    }

    // ==================== 安装记录扩展方法 ====================

    public ApiResponse<Map<String, Object>> getInstallationById(Long id) {
        InstallationRecord record = installationRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        return ApiResponse.success(convertInstallationToMap(record));
    }

    public ApiResponse<Void> updateInstallationRecord(Long id, InstallationRecord record) {
        InstallationRecord existing = installationRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        
        existing.setInstallLocation(record.getInstallLocation());
        existing.setInstallDate(record.getInstallDate());
        existing.setInstaller(record.getInstaller());
        existing.setInstallationCost(record.getInstallationCost());
        existing.setWarrantyPeriod(record.getWarrantyPeriod());
        existing.setWarrantyStart(record.getWarrantyStart());
        existing.setWarrantyEnd(record.getWarrantyEnd());
        existing.setRemark(record.getRemark());
        existing.setUpdateTime(LocalDateTime.now());
        
        installationRecordRepository.save(existing);
        return ApiResponse.success("更新成功", null);
    }

    public ApiResponse<Void> deleteInstallationRecord(Long id) {
        installationRecordRepository.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    public ApiResponse<Void> approveInstallationRecord(Long id) {
        InstallationRecord record = installationRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        record.setUpdateTime(LocalDateTime.now());
        installationRecordRepository.save(record);
        return ApiResponse.success("批准成功", null);
    }

    public ApiResponse<Void> rejectInstallationRecord(Long id) {
        InstallationRecord record = installationRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        record.setUpdateTime(LocalDateTime.now());
        installationRecordRepository.save(record);
        return ApiResponse.success("拒绝成功", null);
    }

    public ApiResponse<Void> completeInstallationRecord(Long id) {
        InstallationRecord record = installationRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        
        // 获取关联设备
        Device device = deviceRepository.findById(record.getDeviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVICE_NOT_FOUND));
        
        // 验证安装地址信息完整性
        if (record.getInstallationProvince() == null || record.getInstallationCity() == null || 
            record.getInstallationDistrict() == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "安装记录必须包含完整的省市区地址信息");
        }
        
        // 更新安装记录状态为已完成
        record.setStatus(1);
        record.setUpdateTime(LocalDateTime.now());
        installationRecordRepository.save(record);
        
        // 更新设备状态为已安装
        device.setStatus(DeviceStatus.IN_USE.getCode());
        
        // 设置设备安装地址信息
        device.setInstallationProvince(record.getInstallationProvince());
        device.setInstallationCity(record.getInstallationCity());
        device.setInstallationDistrict(record.getInstallationDistrict());
        device.setInstallationAddress(record.getInstallationDetailAddress());
        device.setInstallationLocation(record.getInstallationProvince() + record.getInstallationCity() + 
                                       record.getInstallationDistrict() + record.getInstallationDetailAddress());
        device.setInstallationTime(LocalDateTime.now());
        device.setInstallerId(record.getInstallerId());
        device.setInstallerName(record.getInstallerName());
        
        // 清除设备的仓库货位信息（已安装设备不在仓库中）
        device.setWarehouseId(null);
        device.setWarehouseName(null);
        device.setAreaId(null);
        device.setAreaName(null);
        device.setBinId(null);
        device.setBinName(null);
        device.setCurrentLocation(device.getInstallationProvince() + " > " + device.getInstallationCity() + 
                                   " > " + device.getInstallationDistrict() + " > " + device.getInstallationAddress());
        
        device.setUpdateTime(LocalDateTime.now());
        deviceRepository.save(device);
        
        log.info("安装记录完成，设备状态已更新为已安装，设备ID: {}, 安装地址: {}", 
                device.getId(), device.getCurrentLocation());
        
        return ApiResponse.success("完成成功", null);
    }

    public ApiResponse<PageResult<Map<String, Object>>> getDeviceInstallations(Long deviceId, Pageable pageable) {
        Page<InstallationRecord> page = installationRecordRepository.findByDeviceId(deviceId, pageable);
        List<Map<String, Object>> records = page.getContent().stream()
                .map(this::convertInstallationToMap)
                .collect(Collectors.toList());
        return ApiResponse.success(PageResult.of(page, records));
    }

    // ==================== 维护记录扩展方法 ====================

    public ApiResponse<Map<String, Object>> getMaintenanceById(Long id) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAINTENANCE_RECORD_NOT_FOUND));
        return ApiResponse.success(convertMaintenanceToMap(record));
    }

    public ApiResponse<Void> updateMaintenanceRecord(Long id, MaintenanceRecord record) {
        MaintenanceRecord existing = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAINTENANCE_RECORD_NOT_FOUND));
        
        existing.setMaintenanceType(record.getMaintenanceType());
        existing.setMaintenanceContent(record.getMaintenanceContent());
        existing.setMaintenanceCycle(record.getMaintenanceCycle());
        existing.setPlannedStartTime(record.getPlannedStartTime());
        existing.setPlannedEndTime(record.getPlannedEndTime());
        existing.setMaintenancePerson(record.getMaintenancePerson());
        existing.setEstimatedCost(record.getEstimatedCost());
        existing.setRemark(record.getRemark());
        existing.setUpdateTime(LocalDateTime.now());
        
        maintenanceRecordRepository.save(existing);
        return ApiResponse.success("更新成功", null);
    }

    public ApiResponse<Void> deleteMaintenanceRecord(Long id) {
        maintenanceRecordRepository.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    public ApiResponse<Void> approveMaintenanceRecord(Long id) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAINTENANCE_RECORD_NOT_FOUND));
        record.setUpdateTime(LocalDateTime.now());
        maintenanceRecordRepository.save(record);
        return ApiResponse.success("批准成功", null);
    }

    public ApiResponse<Void> rejectMaintenanceRecord(Long id) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAINTENANCE_RECORD_NOT_FOUND));
        record.setUpdateTime(LocalDateTime.now());
        maintenanceRecordRepository.save(record);
        return ApiResponse.success("拒绝成功", null);
    }

    public ApiResponse<PageResult<Map<String, Object>>> getDeviceMaintenance(Long deviceId, Pageable pageable) {
        Page<MaintenanceRecord> page = maintenanceRecordRepository.findByDeviceId(deviceId, pageable);
        List<Map<String, Object>> records = page.getContent().stream()
                .map(this::convertMaintenanceToMap)
                .collect(Collectors.toList());
        return ApiResponse.success(PageResult.of(page, records));
    }

    public ApiResponse<Map<String, Object>> getMaintenanceStatistics() {
        Map<String, Object> stats = new HashMap<>();
        Long pending = maintenanceRecordRepository.countByStatus(0);
        Long inProgress = maintenanceRecordRepository.countByStatus(1);
        Long completed = maintenanceRecordRepository.countByStatus(2);
        stats.put("pending", pending);
        stats.put("inProgress", inProgress);
        stats.put("completed", completed);
        return ApiResponse.success(stats);
    }

    // ==================== 私有方法 ====================

    /**
     * 转换安装记录为Map
     */
    private Map<String, Object> convertInstallationToMap(InstallationRecord record) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", record.getId());
        map.put("deviceId", record.getDeviceId());
        map.put("deviceCode", record.getDevice() != null ? record.getDevice().getDeviceCode() : null);
        map.put("deviceName", record.getDevice() != null ? record.getDevice().getDeviceName() : null);
        map.put("installationLocation", record.getInstallLocation());
        map.put("installationDate", record.getInstallDate());
        map.put("installer", record.getInstaller());
        map.put("installationCost", record.getInstallationCost());
        map.put("warrantyPeriod", record.getWarrantyPeriod());
        map.put("warrantyStart", record.getWarrantyStart());
        map.put("warrantyEnd", record.getWarrantyEnd());
        map.put("remark", record.getRemark());
        map.put("createTime", record.getCreateTime());
        map.put("updateTime", record.getUpdateTime());
        return map;
    }

    /**
     * 转换维修记录为Map
     */
    private Map<String, Object> convertRepairToMap(RepairRecord record) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", record.getId());
        map.put("deviceId", record.getDeviceId());
        map.put("deviceCode", record.getDeviceCode() != null ? record.getDeviceCode() : 
                (record.getDevice() != null ? record.getDevice().getDeviceCode() : null));
        map.put("deviceName", record.getDeviceName() != null ? record.getDeviceName() : 
                (record.getDevice() != null ? record.getDevice().getDeviceName() : null));
        map.put("repairNo", record.getRepairNo());
        map.put("faultType", record.getFaultType());
        map.put("faultDescription", record.getFaultDescription());
        map.put("faultLevel", record.getFaultLevel());
        map.put("repairStartTime", record.getRepairStartTime());
        map.put("repairEndTime", record.getRepairEndTime());
        map.put("repairPerson", record.getRepairPerson());
        map.put("repairMeasures", record.getRepairMeasures());
        map.put("repairResult", record.getRepairResult());
        map.put("repairCost", record.getRepairCost());
        map.put("status", record.getStatus());
        map.put("statusName", getRepairStatusName(record.getStatus()));
        map.put("remark", record.getRemark());
        map.put("createTime", record.getCreateTime());
        map.put("updateTime", record.getUpdateTime());
        map.put("repairDate", record.getRepairDate());
        map.put("repairContent", record.getRepairContent());
        map.put("sourceOutboundNo", record.getSourceOrderNo());
        map.put("sourceOutboundId", record.getSourceOrderId());
        return map;
    }

    /**
     * 转换维护记录为Map
     */
    private Map<String, Object> convertMaintenanceToMap(MaintenanceRecord record) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", record.getId());
        map.put("deviceId", record.getDeviceId());
        map.put("deviceCode", record.getDevice() != null ? record.getDevice().getDeviceCode() : null);
        map.put("deviceName", record.getDevice() != null ? record.getDevice().getDeviceName() : null);
        map.put("maintenanceType", record.getMaintenanceType());
        map.put("maintenanceTypeName", getMaintenanceTypeName(record.getMaintenanceType()));
        map.put("maintenanceContent", record.getMaintenanceContent());
        map.put("maintenanceCycle", record.getMaintenanceCycle());
        map.put("plannedStartTime", record.getPlannedStartTime());
        map.put("plannedEndTime", record.getPlannedEndTime());
        map.put("actualStartTime", record.getActualStartTime());
        map.put("actualEndTime", record.getActualEndTime());
        map.put("maintenancePerson", record.getMaintenancePerson());
        map.put("maintenanceResult", record.getMaintenanceResult());
        map.put("estimatedCost", record.getEstimatedCost());
        map.put("actualCost", record.getActualCost());
        map.put("nextMaintenanceTime", record.getNextMaintenanceTime());
        map.put("status", record.getStatus());
        map.put("statusName", getMaintenanceStatusName(record.getStatus()));
        map.put("remark", record.getRemark());
        map.put("createTime", record.getCreateTime());
        map.put("updateTime", record.getUpdateTime());
        return map;
    }

    /**
     * 获取维修状态名称
     */
    private String getRepairStatusName(Integer status) {
        switch (status) {
            case 0:
                return "待维修";
            case 1:
                return "维修中";
            case 2:
                return "已完成";
            default:
                return "未知";
        }
    }

    /**
     * 获取维护类型名称
     */
    private String getMaintenanceTypeName(Integer type) {
        switch (type) {
            case 1:
                return "日常保养";
            case 2:
                return "定期检修";
            case 3:
                return "故障预防";
            case 4:
                return "部件更换";
            default:
                return "其他";
        }
    }

    /**
     * 获取维护状态名称
     */
    private String getMaintenanceStatusName(Integer status) {
        switch (status) {
            case 0:
                return "待执行";
            case 1:
                return "执行中";
            case 2:
                return "已完成";
            case 3:
                return "已取消";
            default:
                return "未知";
        }
    }

    // ==================== 维修记录扩展方法 ====================

    /**
     * 根据ID获取维修记录
     */
    public ApiResponse<Map<String, Object>> getRepairById(Long id) {
        RepairRecord record = repairRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        return ApiResponse.success(convertRepairToMap(record));
    }

    /**
     * 更新维修记录
     */
    public ApiResponse<Void> updateRepairRecord(Long id, RepairRecord record) {
        RepairRecord existing = repairRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.REPAIR_RECORD_NOT_FOUND));
        
        existing.setFaultType(record.getFaultType());
        existing.setFaultDescription(record.getFaultDescription());
        existing.setFaultLevel(record.getFaultLevel());
        existing.setRepairPerson(record.getRepairPerson());
        existing.setRepairMeasures(record.getRepairMeasures());
        existing.setRepairCost(record.getRepairCost());
        existing.setRemark(record.getRemark());
        existing.setUpdateTime(LocalDateTime.now());
        
        repairRecordRepository.save(existing);
        return ApiResponse.success("更新成功", null);
    }

    /**
     * 删除维修记录
     */
    public ApiResponse<Void> deleteRepairRecord(Long id) {
        repairRecordRepository.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 获取设备的维修历史
     */
    public ApiResponse<PageResult<Map<String, Object>>> getDeviceRepairs(Long deviceId, Pageable pageable) {
        Page<RepairRecord> page = repairRecordRepository.findByDeviceId(deviceId, pageable);
        List<Map<String, Object>> records = page.getContent().stream()
                .map(this::convertRepairToMap)
                .collect(Collectors.toList());
        return ApiResponse.success(PageResult.of(page, records));
    }

    /**
     * 获取维修统计信息
     */
    public ApiResponse<Map<String, Object>> getRepairStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        Long pending = repairRecordRepository.countByStatus(0);
        Long inProgress = repairRecordRepository.countByStatus(1);
        Long completed = repairRecordRepository.countByStatus(2);
        
        stats.put("pending", pending);
        stats.put("inProgress", inProgress);
        stats.put("completed", completed);
        stats.put("total", pending + inProgress + completed);
        
        return ApiResponse.success(stats);
    }
}
