package com.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.AlertConfigEntity;
import com.backend.service.AlertConfigService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/alert-config")
@RequiredArgsConstructor
public class AlertConfigController {

    private final AlertConfigService alertConfigService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResult<Map<String, Object>>> getAlertConfigList(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        
        return alertConfigService.getAlertConfigList(name, type, status, pageRequest);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getAlertConfigDetail(@PathVariable Long id) {
        return alertConfigService.getAlertConfigDetail(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> createAlertConfig(@RequestBody AlertConfigEntity entity) {
        return alertConfigService.createAlertConfig(entity);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> updateAlertConfig(
            @PathVariable Long id,
            @RequestBody AlertConfigEntity entity) {
        return alertConfigService.updateAlertConfig(id, entity);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteAlertConfig(@PathVariable Long id) {
        return alertConfigService.deleteAlertConfig(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        return alertConfigService.updateStatus(id, status);
    }

    @PutMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> batchUpdate(@RequestBody List<AlertConfigEntity> entities) {
        return alertConfigService.batchUpdate(entities);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getStatistics() {
        return alertConfigService.getStatistics();
    }
}
