package com.backend.service;

import com.backend.entity.WarehouseZone;
import com.backend.entity.ZoneType;
import com.backend.entity.Warehouse;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.WarehouseZoneRepository;
import com.backend.repository.ZoneTypeRepository;
import com.backend.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 仓库功能区服务类
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WarehouseZoneService {

    private final WarehouseZoneRepository warehouseZoneRepository;
    private final ZoneTypeRepository zoneTypeRepository;
    private final WarehouseRepository warehouseRepository;

    /**
     * 分页查询功能区列表
     *
     * @param page       分页参数
     * @param keyword    关键词
     * @param warehouseId 仓库ID
     * @param zoneTypeId 功能区类型ID
     * @param status     状态
     * @return 分页结果
     */
    public Page<WarehouseZone> findZones(Pageable page, String keyword, Long warehouseId,
                                          Long zoneTypeId, Integer status) {
        if (keyword != null && !keyword.isEmpty()) {
            return warehouseZoneRepository.findByNameContainingOrCodeContaining(keyword, keyword, page);
        }
        if (warehouseId != null) {
            if (zoneTypeId != null) {
                return warehouseZoneRepository.findByWarehouseIdAndZoneTypeId(warehouseId, zoneTypeId, page);
            }
            if (status != null) {
                return warehouseZoneRepository.findByWarehouseIdAndStatus(warehouseId, status, page);
            }
            return warehouseZoneRepository.findByWarehouseId(warehouseId, page);
        }
        if (zoneTypeId != null) {
            return warehouseZoneRepository.findByZoneTypeId(zoneTypeId, page);
        }
        if (status != null) {
            return warehouseZoneRepository.findByStatus(status, page);
        }
        return warehouseZoneRepository.findAll(page);
    }

    /**
     * 根据ID查询功能区
     *
     * @param id 功能区ID
     * @return 功能区实体
     */
    public WarehouseZone findById(Long id) {
        return warehouseZoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("功能区不存在: " + id));
    }

    /**
     * 根据仓库ID查询功能区列表
     *
     * @param warehouseId 仓库ID
     * @return 功能区列表
     */
    public List<WarehouseZone> findByWarehouseId(Long warehouseId) {
        return warehouseZoneRepository.findByWarehouseIdOrderBySortAsc(warehouseId);
    }

    /**
     * 创建功能区
     *
     * @param zone 功能区实体
     * @return 创建后的功能区
     */
    @Transactional
    public WarehouseZone createZone(WarehouseZone zone) {
        // 检查编码是否已存在
        if (warehouseZoneRepository.existsByCode(zone.getCode())) {
            throw new IllegalArgumentException("功能区编码已存在: " + zone.getCode());
        }

        // 验证仓库是否存在
        if (zone.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(zone.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("仓库不存在: " + zone.getWarehouseId()));
            zone.setWarehouse(warehouse);
        }

        // 验证功能区类型
        if (zone.getZoneTypeId() != null) {
            ZoneType zoneType = zoneTypeRepository.findById(zone.getZoneTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("功能区类型不存在: " + zone.getZoneTypeId()));
            zone.setZoneType(zoneType);
            zone.setZoneTypeCode(zoneType.getCode());
            zone.setZoneTypeName(zoneType.getName());
        }

        // 设置已使用容量为0
        zone.setUsedCapacity(0);

        WarehouseZone savedZone = warehouseZoneRepository.save(zone);
        log.info("创建功能区成功: {}", savedZone.getCode());
        return savedZone;
    }

    /**
     * 更新功能区
     *
     * @param id   功能区ID
     * @param zone 功能区实体
     * @return 更新后的功能区
     */
    @Transactional
    public WarehouseZone updateZone(Long id, WarehouseZone zone) {
        WarehouseZone existingZone = findById(id);

        // 检查编码是否被其他功能区使用
        if (!existingZone.getCode().equals(zone.getCode()) &&
                warehouseZoneRepository.existsByCode(zone.getCode())) {
            throw new IllegalArgumentException("功能区编码已存在: " + zone.getCode());
        }

        // 更新基本信息
        existingZone.setCode(zone.getCode());
        existingZone.setName(zone.getName());
        existingZone.setSort(zone.getSort());
        existingZone.setStatus(zone.getStatus());
        existingZone.setRemark(zone.getRemark());
        existingZone.setCapacity(zone.getCapacity());

        // 更新仓库
        if (zone.getWarehouseId() != null && !zone.getWarehouseId().equals(existingZone.getWarehouseId())) {
            Warehouse warehouse = warehouseRepository.findById(zone.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("仓库不存在: " + zone.getWarehouseId()));
            existingZone.setWarehouse(warehouse);
            existingZone.setWarehouseId(zone.getWarehouseId());
        }

        // 更新功能区类型
        if (zone.getZoneTypeId() != null && !zone.getZoneTypeId().equals(existingZone.getZoneTypeId())) {
            ZoneType zoneType = zoneTypeRepository.findById(zone.getZoneTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("功能区类型不存在: " + zone.getZoneTypeId()));
            existingZone.setZoneType(zoneType);
            existingZone.setZoneTypeId(zone.getZoneTypeId());
            existingZone.setZoneTypeCode(zoneType.getCode());
            existingZone.setZoneTypeName(zoneType.getName());
        }

        WarehouseZone savedZone = warehouseZoneRepository.save(existingZone);
        log.info("更新功能区成功: {}", savedZone.getCode());
        return savedZone;
    }

    /**
     * 删除功能区
     *
     * @param id 功能区ID
     */
    @Transactional
    public void deleteZone(Long id) {
        WarehouseZone zone = findById(id);
        warehouseZoneRepository.delete(zone);
        log.info("删除功能区成功: {}", zone.getCode());
    }

    /**
     * 更新功能区状态
     *
     * @param id     功能区ID
     * @param status 状态
     * @return 更新后的功能区
     */
    @Transactional
    public WarehouseZone updateStatus(Long id, Integer status) {
        WarehouseZone zone = findById(id);
        zone.setStatus(status);
        return warehouseZoneRepository.save(zone);
    }

    /**
     * 获取统计信息
     *
     * @return 统计数据
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", warehouseZoneRepository.count());
        stats.put("activeCount", warehouseZoneRepository.countByStatus(1));
        stats.put("inactiveCount", warehouseZoneRepository.countByStatus(0));
        return stats;
    }

    /**
     * 根据仓库ID统计功能区数量
     *
     * @param warehouseId 仓库ID
     * @return 数量
     */
    public long countByWarehouseId(Long warehouseId) {
        return warehouseZoneRepository.countByWarehouseId(warehouseId);
    }
}
