package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.InstallationRecord;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 业务记录控制器
 *
 * 功能说明：
 * 提供设备安装、维修、维护记录的RESTful API接口，支持设备全生命周期管理。
 *
 * 记录类型：
 * - 安装记录：/api/records/installation
 * - 维修记录：/api/records/repair
 * - 维护记录：/api/records/maintenance
 *
 * 权限控制：
 * - ADMIN: 所有操作
 * - OPERATOR: 创建、查看记录
 * - TECHNICIAN: 查看、更新记录
 *
 * API路径：/api/records
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@RestController
@RequestMapping("/records")
@RequiredArgsConstructor
public class RecordController {

    /** 业务记录服务 */
    private final RecordService recordService;

    // ==================== 安装记录接口 ====================

    /**
     * 获取安装记录列表
     *
     * 接口说明：
     * 查询设备安装记录，支持按设备、安装人员、日期范围筛选
     *
     * 请求示例：
     * GET /api/records/installation?deviceId=1&installer=张三&page=1&size=10
     *
     * @param deviceId  设备ID，可选
     * @param installer 安装人员，可选
     * @param startDate 开始日期，可选
     * @param endDate   结束日期，可选
     * @param pageReq   分页参数对象（page/size/sort/order）
     * @return 分页安装记录列表
     */
    @GetMapping("/installation")
    public ApiResponse<PageResult<Map<String, Object>>> getInstallationRecords(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) String installer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return recordService.getInstallationRecords(deviceId, installer, startDate, endDate, pageable);
    }

    /**
     * 创建设备安装记录
     *
     * 接口说明：
     * 记录设备的安装信息，同时更新设备状态为在用
     *
     * 请求示例：
     * POST /api/records/installation
     * {
     * "deviceId": 1,
     * "installationLocation": "A区-01号货架",
     * "installationDate": "2025-01-15T10:00:00",
     * "installer": "张三",
     * "installationCost": 500.00,
     * "warrantyPeriod": 12,
     * "warrantyStart": "2025-01-15",
     * "warrantyEnd": "2026-01-14",
     * "remark": "正常安装"
     * }
     *
     * @param record 安装记录信息
     * @return 创建结果
     */
    @PostMapping("/installation")
    public ApiResponse<Map<String, Object>> createInstallationRecord(@RequestBody InstallationRecord record) {
        return recordService.createInstallationRecord(record);
    }

    // ==================== 维修记录接口 ====================

    /**
     * 获取维修记录列表
     *
     * 接口说明：
     * 查询设备维修记录，支持按设备、故障类型、状态、日期范围筛选
     *
     * 请求示例：
     * GET /api/records/repair?deviceId=1&status=0&page=1&size=10
     *
     * @param deviceId  设备ID，可选
     * @param faultType 故障类型，可选
     * @param status    维修状态（0-待维修，1-维修中，2-已完成），可选
     * @param startDate 开始日期，可选
     * @param endDate   结束日期，可选
     * @param pageReq   分页参数对象（page/size/sort/order）
     * @return 分页维修记录列表
     */
    @GetMapping("/repair")
    public ApiResponse<PageResult<Map<String, Object>>> getRepairRecords(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) String faultType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return recordService.getRepairRecords(deviceId, faultType, status, startDate, endDate, pageable);
    }

    /**
     * 创建设备维修记录
     *
     * 接口说明：
     * 记录设备故障信息，同时更新设备状态为维修中
     *
     * 请求示例：
     * POST /api/records/repair
     * {
     * "deviceId": 1,
     * "faultType": "硬件故障",
     * "faultDescription": "电源模块损坏",
     * "faultLevel": 2,
     * "repairStartTime": "2025-01-15T10:00:00",
     * "repairPerson": "李四",
     * "remark": "需要更换配件"
     * }
     *
     * @param record 维修记录信息
     * @return 创建结果
     */
    @PostMapping("/repair")
    public ApiResponse<Map<String, Object>> createRepairRecord(@RequestBody RepairRecord record) {
        return recordService.createRepairRecord(record);
    }

    /**
     * 完成设备维修
     *
     * 接口说明：
     * 更新维修记录为完成状态，同时恢复设备状态为正常
     *
     * 请求示例：
     * POST /api/records/repair/1/complete
     * {
     * "repairResult": "已更换电源模块，设备正常运行",
     * "repairCost": 800.00
     * }
     *
     * @param id      维修记录ID
     * @param request 完成请求
     * @return 完成结果
     */
    @PostMapping("/repair/{id}/complete")
    public ApiResponse<Void> completeRepair(@PathVariable Long id, @RequestBody CompleteRepairRequest request) {
        return recordService.completeRepair(id, request.getRepairResult(), request.getRepairCost());
    }

    // ==================== 维护记录接口 ====================

    /**
     * 获取维护记录列表
     *
     * 接口说明：
     * 查询设备维护记录，支持按设备、维护类型、状态、日期范围筛选
     *
     * 请求示例：
     * GET /api/records/maintenance?deviceId=1&status=0&page=1&size=10
     *
     * @param deviceId        设备ID，可选
     * @param maintenanceType 维护类型（1-日常保养，2-定期检修，3-故障预防，4-部件更换），可选
     * @param status          维护状态（0-待执行，1-执行中，2-已完成，3-已取消），可选
     * @param startDate       开始日期，可选
     * @param endDate         结束日期，可选
     * @param pageReq         分页参数对象（page/size/sort/order）
     * @return 分页维护记录列表
     */
    @GetMapping("/maintenance")
    public ApiResponse<PageResult<Map<String, Object>>> getMaintenanceRecords(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) Integer maintenanceType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        Pageable pageable = buildPageable(pageReq);
        return recordService.getMaintenanceRecords(deviceId, maintenanceType, status, startDate, endDate, pageable);
    }

    /**
     * 创建设备维护记录
     *
     * 接口说明：
     * 创建设备维护计划，设置维护状态和周期
     *
     * 请求示例：
     * POST /api/records/maintenance
     * {
     * "deviceId": 1,
     * "maintenanceType": 1,
     * "maintenanceContent": "清洁设备表面，检查连接线缆",
     * "maintenanceCycle": 30,
     * "plannedStartTime": "2025-01-20T09:00:00",
     * "plannedEndTime": "2025-01-20T11:00:00",
     * "maintenancePerson": "王五",
     * "estimatedCost": 200.00,
     * "remark": "定期保养"
     * }
     *
     * @param record 维护记录信息
     * @return 创建结果
     */
    @PostMapping("/maintenance")
    public ApiResponse<Map<String, Object>> createMaintenanceRecord(@RequestBody MaintenanceRecord record) {
        return recordService.createMaintenanceRecord(record);
    }

    /**
     * 完成设备维护
     *
     * 接口说明：
     * 更新维护记录为完成状态，自动计算下次维护时间
     *
     * 请求示例：
     * POST /api/records/maintenance/1/complete
     * {
     * "maintenanceResult": "已完成清洁和检查，设备运行正常",
     * "actualCost": 180.00
     * }
     *
     * @param id      维护记录ID
     * @param request 完成请求
     * @return 完成结果
     */
    @PostMapping("/maintenance/{id}/complete")
    public ApiResponse<Void> completeMaintenance(@PathVariable Long id,
            @RequestBody CompleteMaintenanceRequest request) {
        return recordService.completeMaintenance(id, request.getMaintenanceResult(), request.getActualCost());
    }

    // ==================== 统计接口 ====================

    /**
     * 获取业务记录统计
     *
     * 接口说明：
     * 获取维修和维护的统计信息，包括待处理数量、本月完成数量等
     *
     * 请求示例：
     * GET /api/records/statistics
     *
     * @return 统计数据
     */
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getRecordStatistics() {
        return recordService.getRecordStatistics();
    }

    /**
     * 根据PageRequest构建JPA Pageable对象
     *
     * @param pageReq 分页请求对象
     * @return JPA Pageable对象
     */
    private Pageable buildPageable(PageRequest pageReq) {
        if (pageReq.getSort() != null && !pageReq.getSort().isEmpty()) {
            org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(pageReq.getValidOrder())
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;
            return org.springframework.data.domain.PageRequest.of(
                    pageReq.getJpaPage(), pageReq.getSafeSize(),
                    org.springframework.data.domain.Sort.by(direction, pageReq.getSort()));
        }
        return org.springframework.data.domain.PageRequest.of(
                pageReq.getJpaPage(), pageReq.getSafeSize());
    }

    // ==================== 请求对象 ====================

    /**
     * 完成维修请求对象
     */
    public static class CompleteRepairRequest {
        private String repairResult;
        private Double repairCost;

        public String getRepairResult() {
            return repairResult;
        }

        public void setRepairResult(String repairResult) {
            this.repairResult = repairResult;
        }

        public Double getRepairCost() {
            return repairCost;
        }

        public void setRepairCost(Double repairCost) {
            this.repairCost = repairCost;
        }
    }

    /**
     * 完成维护请求对象
     */
    public static class CompleteMaintenanceRequest {
        private String maintenanceResult;
        private Double actualCost;

        public String getMaintenanceResult() {
            return maintenanceResult;
        }

        public void setMaintenanceResult(String maintenanceResult) {
            this.maintenanceResult = maintenanceResult;
        }

        public Double getActualCost() {
            return actualCost;
        }

        public void setActualCost(Double actualCost) {
            this.actualCost = actualCost;
        }
    }
}
