package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.InstallationRecord;
import com.backend.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 安装记录控制器（兼容旧版API）
 * 
 * 功能说明：
 * 提供设备安装记录的RESTful API接口，兼容前端旧版API路径
 * 
 * API路径：/api/installations
 * 
 * @author 系统开发团队
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/installations")
@RequiredArgsConstructor
public class InstallationController {

    private final RecordService recordService;

    @GetMapping("/list")
    public ApiResponse<PageResult<Map<String, Object>>> getInstallationList(
            @RequestParam(required = false) Long deviceId,
            @RequestParam(required = false) String installer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Valid PageRequest pageReq) {
        log.info("获取安装记录列表: deviceId={}, installer={}", deviceId, installer);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getInstallationRecords(deviceId, installer, startDate, endDate, pageable);
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> createInstallation(@RequestBody InstallationRecord record) {
        log.info("创建安装记录: deviceId={}", record.getDeviceId());
        return recordService.createInstallationRecord(record);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> getInstallationById(@PathVariable Long id) {
        log.info("获取安装记录详情: id={}", id);
        return recordService.getInstallationById(id);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateInstallation(@PathVariable Long id, @RequestBody InstallationRecord record) {
        log.info("更新安装记录: id={}", id);
        return recordService.updateInstallationRecord(id, record);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInstallation(@PathVariable Long id) {
        log.info("删除安装记录: id={}", id);
        return recordService.deleteInstallationRecord(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> approveInstallation(@PathVariable Long id) {
        log.info("批准安装记录: id={}", id);
        return recordService.approveInstallationRecord(id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> rejectInstallation(@PathVariable Long id) {
        log.info("拒绝安装记录: id={}", id);
        return recordService.rejectInstallationRecord(id);
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<Void> completeInstallation(@PathVariable Long id) {
        log.info("完成安装记录: id={}", id);
        return recordService.completeInstallationRecord(id);
    }

    @GetMapping("/device/{deviceId}")
    public ApiResponse<PageResult<Map<String, Object>>> getDeviceInstallations(
            @PathVariable Long deviceId,
            @Valid PageRequest pageReq) {
        log.info("获取设备安装记录: deviceId={}", deviceId);
        Pageable pageable = buildPageable(pageReq);
        return recordService.getDeviceInstallations(deviceId, pageable);
    }

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
}
