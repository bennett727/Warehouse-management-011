package com.backend.util;

import com.backend.entity.Warehouse;
import com.backend.entity.WarehouseZone;
import com.backend.entity.ZoneType;
import com.backend.entity.AdministrativeDivision;
import com.backend.repository.WarehouseRepository;
import com.backend.repository.WarehouseZoneRepository;
import com.backend.repository.ZoneTypeRepository;
import com.backend.repository.AdministrativeDivisionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 数据迁移工具类
 * 用于验证和修复迁移后的数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataMigrationUtil {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseZoneRepository warehouseZoneRepository;
    private final ZoneTypeRepository zoneTypeRepository;
    private final AdministrativeDivisionRepository administrativeDivisionRepository;

    /**
     * 验证仓库地址数据完整性
     * @return 验证报告
     */
    public String validateWarehouseAddressData() {
        StringBuilder report = new StringBuilder();
        report.append("=== 仓库地址数据验证报告 ===\n\n");

        List<Warehouse> warehouses = warehouseRepository.findAll();
        int total = warehouses.size();
        int withProvince = 0;
        int withCity = 0;
        int withDistrict = 0;
        int withLocation = 0;
        int withAddress = 0;

        for (Warehouse w : warehouses) {
            if (w.getProvinceId() != null) withProvince++;
            if (w.getCityId() != null) withCity++;
            if (w.getDistrictId() != null) withDistrict++;
            if (w.getLongitude() != null && w.getLatitude() != null) withLocation++;
            if (w.getAddress() != null && !w.getAddress().isEmpty()) withAddress++;
        }

        report.append(String.format("仓库总数: %d\n", total));
        report.append(String.format("有省份信息: %d (%.1f%%)\n", withProvince, total > 0 ? 100.0 * withProvince / total : 0));
        report.append(String.format("有城市信息: %d (%.1f%%)\n", withCity, total > 0 ? 100.0 * withCity / total : 0));
        report.append(String.format("有区县信息: %d (%.1f%%)\n", withDistrict, total > 0 ? 100.0 * withDistrict / total : 0));
        report.append(String.format("有坐标信息: %d (%.1f%%)\n", withLocation, total > 0 ? 100.0 * withLocation / total : 0));
        report.append(String.format("有详细地址: %d (%.1f%%)\n", withAddress, total > 0 ? 100.0 * withAddress / total : 0));

        // 检查行政区划关联是否有效
        int invalidProvince = 0;
        int invalidCity = 0;
        int invalidDistrict = 0;

        for (Warehouse w : warehouses) {
            if (w.getProvinceId() != null) {
                Optional<AdministrativeDivision> province = administrativeDivisionRepository.findById(w.getProvinceId());
                if (province.isEmpty() || province.get().getLevel() != 1) {
                    invalidProvince++;
                    report.append(String.format("\n警告: 仓库 '%s' 的省份ID %d 无效\n", w.getWarehouseName(), w.getProvinceId()));
                }
            }
            if (w.getCityId() != null) {
                Optional<AdministrativeDivision> city = administrativeDivisionRepository.findById(w.getCityId());
                if (city.isEmpty() || city.get().getLevel() != 2) {
                    invalidCity++;
                    report.append(String.format("警告: 仓库 '%s' 的城市ID %d 无效\n", w.getWarehouseName(), w.getCityId()));
                }
            }
            if (w.getDistrictId() != null) {
                Optional<AdministrativeDivision> district = administrativeDivisionRepository.findById(w.getDistrictId());
                if (district.isEmpty() || district.get().getLevel() != 3) {
                    invalidDistrict++;
                    report.append(String.format("警告: 仓库 '%s' 的区县ID %d 无效\n", w.getWarehouseName(), w.getDistrictId()));
                }
            }
        }

        if (invalidProvince > 0 || invalidCity > 0 || invalidDistrict > 0) {
            report.append(String.format("\n发现 %d 个无效省份关联, %d 个无效城市关联, %d 个无效区县关联\n",
                    invalidProvince, invalidCity, invalidDistrict));
        } else {
            report.append("\n所有行政区划关联验证通过\n");
        }

        return report.toString();
    }

    /**
     * 验证功能区类型数据
     * @return 验证报告
     */
    public String validateZoneTypeData() {
        StringBuilder report = new StringBuilder();
        report.append("=== 功能区类型数据验证报告 ===\n\n");

        // 检查系统预设类型
        List<ZoneType> systemTypes = zoneTypeRepository.findByIsSystemTrue();
        report.append(String.format("系统预设类型数量: %d\n", systemTypes.size()));

        String[] expectedCodes = {"RECEIVING", "STORAGE", "PICKING", "SHIPPING", "RETURN", "QC", "REPAIR", "TEMPORARY"};
        for (String code : expectedCodes) {
            Optional<ZoneType> type = zoneTypeRepository.findByCode(code);
            if (type.isPresent()) {
                report.append(String.format("✓ 系统类型 '%s' (%s) 存在\n", type.get().getName(), code));
            } else {
                report.append(String.format("✗ 系统类型 '%s' 缺失\n", code));
            }
        }

        // 检查功能区类型关联
        List<WarehouseZone> zones = warehouseZoneRepository.findAll();
        int withType = 0;
        int withoutType = 0;

        for (WarehouseZone zone : zones) {
            if (zone.getZoneTypeId() != null) {
                withType++;
            } else {
                withoutType++;
            }
        }

        report.append(String.format("\n功能区总数: %d\n", zones.size()));
        report.append(String.format("已关联类型: %d (%.1f%%)\n", withType, zones.size() > 0 ? 100.0 * withType / zones.size() : 0));
        report.append(String.format("未关联类型: %d (%.1f%%)\n", withoutType, zones.size() > 0 ? 100.0 * withoutType / zones.size() : 0));

        return report.toString();
    }

    /**
     * 修复仓库坐标数据
     * 清除无效坐标
     * @return 修复数量
     */
    @Transactional
    public int fixInvalidCoordinates() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        int fixedCount = 0;

        for (Warehouse w : warehouses) {
            boolean needFix = false;

            if (w.getLongitude() != null) {
                if (w.getLongitude() < -180 || w.getLongitude() > 180) {
                    w.setLongitude(null);
                    needFix = true;
                }
            }

            if (w.getLatitude() != null) {
                if (w.getLatitude() < -90 || w.getLatitude() > 90) {
                    w.setLatitude(null);
                    needFix = true;
                }
            }

            if (needFix) {
                warehouseRepository.save(w);
                fixedCount++;
                log.info("修复仓库 '{}' 的无效坐标", w.getWarehouseName());
            }
        }

        return fixedCount;
    }

    /**
     * 为未设置类型的功能区设置默认类型
     * @return 修复数量
     */
    @Transactional
    public int fixMissingZoneTypes() {
        // 获取默认类型（存储区）
        ZoneType defaultType = zoneTypeRepository.findByCode("STORAGE")
                .orElseThrow(() -> new RuntimeException("默认类型 STORAGE 不存在"));

        List<WarehouseZone> zones = warehouseZoneRepository.findAll();
        int fixedCount = 0;

        for (WarehouseZone zone : zones) {
            if (zone.getZoneTypeId() == null) {
                zone.setZoneTypeId(defaultType.getId());
                zone.setZoneTypeCode(defaultType.getCode());
                zone.setZoneTypeName(defaultType.getName());
                warehouseZoneRepository.save(zone);
                fixedCount++;
                log.info("为功能区 '{}' 设置默认类型", zone.getZoneName());
            }
        }

        return fixedCount;
    }

    /**
     * 验证坐标范围
     * @param longitude 经度
     * @param latitude 纬度
     * @return 是否有效
     */
    public static boolean isValidCoordinate(Double longitude, Double latitude) {
        if (longitude == null || latitude == null) {
            return false;
        }
        return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
    }

    /**
     * 获取数据迁移状态摘要
     * @return 状态摘要
     */
    public String getMigrationStatus() {
        StringBuilder status = new StringBuilder();
        status.append("=== 数据迁移状态摘要 ===\n\n");

        // 行政区划
        long provinceCount = administrativeDivisionRepository.countByLevel(1);
        long cityCount = administrativeDivisionRepository.countByLevel(2);
        long districtCount = administrativeDivisionRepository.countByLevel(3);
        status.append(String.format("行政区划数据:\n"));
        status.append(String.format("  - 省份: %d\n", provinceCount));
        status.append(String.format("  - 城市: %d\n", cityCount));
        status.append(String.format("  - 区县: %d\n", districtCount));

        // 仓库
        long warehouseCount = warehouseRepository.count();
        long warehouseWithLocation = warehouseRepository.countByLongitudeIsNotNullAndLatitudeIsNotNull();
        status.append(String.format("\n仓库数据:\n"));
        status.append(String.format("  - 总数: %d\n", warehouseCount));
        status.append(String.format("  - 有坐标: %d\n", warehouseWithLocation));

        // 功能区类型
        long zoneTypeCount = zoneTypeRepository.count();
        long systemZoneTypeCount = zoneTypeRepository.countByIsSystemTrue();
        status.append(String.format("\n功能区类型:\n"));
        status.append(String.format("  - 总数: %d\n", zoneTypeCount));
        status.append(String.format("  - 系统预设: %d\n", systemZoneTypeCount));

        // 功能区
        long zoneCount = warehouseZoneRepository.count();
        long zoneWithType = warehouseZoneRepository.countByZoneTypeIdIsNotNull();
        status.append(String.format("\n功能区:\n"));
        status.append(String.format("  - 总数: %d\n", zoneCount));
        status.append(String.format("  - 已关联类型: %d\n", zoneWithType));

        return status.toString();
    }
}
