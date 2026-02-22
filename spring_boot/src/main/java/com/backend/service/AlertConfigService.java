package com.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.dto.PageResult;
import com.backend.entity.AlertConfigEntity;
import com.backend.repository.AlertConfigRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertConfigService {

    private final AlertConfigRepository alertConfigRepository;

    public ApiResponse<PageResult<Map<String, Object>>> getAlertConfigList(
            String name, String type, Integer status, PageRequest pageRequest) {
        try {
            Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    pageRequest.getJpaPage(),
                    pageRequest.getSafeSize(),
                    Sort.by(Sort.Direction.DESC, "createTime"));

            Page<AlertConfigEntity> page = alertConfigRepository.searchAlertConfigs(name, type, status, pageable);

            List<Map<String, Object>> list = page.getContent().stream().map(this::convertToMap).toList();

            PageResult<Map<String, Object>> result = PageResult.of(page, list);

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("获取预警配置列表失败", e);
            return ApiResponse.error("获取预警配置列表失败: " + e.getMessage());
        }
    }

    public ApiResponse<Map<String, Object>> getAlertConfigDetail(Long id) {
        try {
            return alertConfigRepository.findById(id)
                    .map(entity -> ApiResponse.success(convertToMap(entity)))
                    .orElse(ApiResponse.error("预警配置不存在"));
        } catch (Exception e) {
            log.error("获取预警配置详情失败", e);
            return ApiResponse.error("获取预警配置详情失败: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<Map<String, Object>> createAlertConfig(AlertConfigEntity entity) {
        try {
            if (alertConfigRepository.existsByName(entity.getName())) {
                return ApiResponse.error("配置名称已存在");
            }

            entity.setCreateTime(LocalDateTime.now());
            entity.setUpdateTime(LocalDateTime.now());
            entity.setTriggerCount(0);

            AlertConfigEntity saved = alertConfigRepository.save(entity);
            log.info("创建预警配置成功: {}", saved.getName());
            return ApiResponse.success(convertToMap(saved));
        } catch (Exception e) {
            log.error("创建预警配置失败", e);
            return ApiResponse.error("创建预警配置失败: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<Map<String, Object>> updateAlertConfig(Long id, AlertConfigEntity entity) {
        try {
            return alertConfigRepository.findById(id)
                    .map(existing -> {
                        existing.setName(entity.getName());
                        existing.setType(entity.getType());
                        existing.setThreshold(entity.getThreshold());
                        existing.setStatus(entity.getStatus());
                        existing.setNotifyMethods(entity.getNotifyMethods());
                        existing.setRemark(entity.getRemark());
                        existing.setDeviceTypeId(entity.getDeviceTypeId());
                        existing.setWarehouseId(entity.getWarehouseId());
                        existing.setMinValue(entity.getMinValue());
                        existing.setMaxValue(entity.getMaxValue());
                        existing.setUnit(entity.getUnit());
                        existing.setPriority(entity.getPriority());
                        existing.setCooldownMinutes(entity.getCooldownMinutes());
                        existing.setUpdateTime(LocalDateTime.now());

                        AlertConfigEntity saved = alertConfigRepository.save(existing);
                        log.info("更新预警配置成功: {}", saved.getName());
                        return ApiResponse.success(convertToMap(saved));
                    })
                    .orElse(ApiResponse.error("预警配置不存在"));
        } catch (Exception e) {
            log.error("更新预警配置失败", e);
            return ApiResponse.error("更新预警配置失败: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<Void> deleteAlertConfig(Long id) {
        try {
            if (!alertConfigRepository.existsById(id)) {
                return ApiResponse.error("预警配置不存在");
            }
            alertConfigRepository.deleteById(id);
            log.info("删除预警配置成功: {}", id);
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("删除预警配置失败", e);
            return ApiResponse.error("删除预警配置失败: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<Map<String, Object>> updateStatus(Long id, Integer status) {
        try {
            return alertConfigRepository.findById(id)
                    .map(entity -> {
                        entity.setStatus(status);
                        entity.setUpdateTime(LocalDateTime.now());
                        AlertConfigEntity saved = alertConfigRepository.save(entity);
                        log.info("更新预警配置状态成功: {} -> {}", id, status);
                        return ApiResponse.success(convertToMap(saved));
                    })
                    .orElse(ApiResponse.error("预警配置不存在"));
        } catch (Exception e) {
            log.error("更新预警配置状态失败", e);
            return ApiResponse.error("更新预警配置状态失败: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<Void> batchUpdate(List<AlertConfigEntity> entities) {
        try {
            for (AlertConfigEntity entity : entities) {
                if (entity.getId() != null) {
                    alertConfigRepository.findById(entity.getId()).ifPresent(existing -> {
                        if (entity.getStatus() != null) {
                            existing.setStatus(entity.getStatus());
                        }
                        existing.setUpdateTime(LocalDateTime.now());
                        alertConfigRepository.save(existing);
                    });
                }
            }
            log.info("批量更新预警配置成功: {} 条", entities.size());
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("批量更新预警配置失败", e);
            return ApiResponse.error("批量更新预警配置失败: " + e.getMessage());
        }
    }

    public ApiResponse<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", alertConfigRepository.count());
            stats.put("enabled", alertConfigRepository.countByStatus(1));
            stats.put("disabled", alertConfigRepository.countByStatus(0));
            return ApiResponse.success(stats);
        } catch (Exception e) {
            log.error("获取预警配置统计失败", e);
            return ApiResponse.error("获取预警配置统计失败: " + e.getMessage());
        }
    }

    private Map<String, Object> convertToMap(AlertConfigEntity entity) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", entity.getId());
        map.put("name", entity.getName());
        map.put("type", entity.getType());
        map.put("typeText", getTypeText(entity.getType()));
        map.put("threshold", entity.getThreshold());
        map.put("status", entity.getStatus());
        map.put("notifyMethods", entity.getNotifyMethods());
        map.put("remark", entity.getRemark());
        map.put("deviceTypeId", entity.getDeviceTypeId());
        map.put("warehouseId", entity.getWarehouseId());
        map.put("minValue", entity.getMinValue());
        map.put("maxValue", entity.getMaxValue());
        map.put("unit", entity.getUnit());
        map.put("priority", entity.getPriority());
        map.put("cooldownMinutes", entity.getCooldownMinutes());
        map.put("lastTriggeredAt", entity.getLastTriggeredAt());
        map.put("triggerCount", entity.getTriggerCount());
        map.put("createTime", entity.getCreateTime());
        map.put("updateTime", entity.getUpdateTime());
        return map;
    }

    private String getTypeText(String type) {
        if (type == null)
            return "";
        return switch (type) {
            case "low_stock" -> "库存不足";
            case "over_stock" -> "库存积压";
            case "expire" -> "过期预警";
            case "abnormal" -> "异常预警";
            default -> type;
        };
    }
}
