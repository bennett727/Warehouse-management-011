package com.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Device;
import com.backend.entity.InstallationRecord;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.entity.ScrapRecord;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InstallationRecordRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.repository.RepairRecordRepository;
import com.backend.repository.ScrapRecordRepository;
import com.backend.repository.StockOrderItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 业务记录联动服务
 *
 * 功能说明：
 * 1. 在出库单执行时自动创建对应的业务记录（安装/维修/保养/报废）
 * 2. 建立出库单与业务记录之间的关联关系
 * 3. 确保数据一致性，避免重复存储
 *
 * 业务类型映射（统一使用数字类型）：
 * - 出库单类型 1 (安装出库) → 安装记录
 * - 出库单类型 2 (维修出库) → 维修记录
 * - 出库单类型 3 (保养出库) → 保养记录
 * - 出库单类型 4 (报废出库) → 报废记录
 * - 出库单类型 5 (调拨出库) → 调拨记录（无需单独创建）
 * - 出库单类型 6 (其他出库) → 不创建特定业务记录
 *
 * @author 开发团队
 * @since 2026-02-13
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessRecordLinkageService {

    private final InstallationRecordRepository installationRecordRepository;
    private final RepairRecordRepository repairRecordRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final ScrapRecordRepository scrapRecordRepository;
    private final DeviceRepository deviceRepository;
    private final StockOrderItemRepository stockOrderItemRepository;

    /**
     * 创建业务记录
     * 根据出库单类型自动创建对应的业务记录
     *
     * 类型判断优先级：
     * 1. 优先使用 outboundType 字段（整数类型：1=安装/2=维修/3=保养/4=报废/5=调拨/6=其他）
     * 2. outboundType 表示出库类型，orderType 表示订单类型（1=入库/2=出库/3=调拨）
     *
     * @param order  出库单
     * @param item   出库单项
     * @param device 设备
     * @return 创建的业务记录ID
     */
    @Transactional
    public Long createBusinessRecord(StockOrder order, StockOrderItem item, Device device) {
        if (order == null || item == null || device == null) {
            log.warn("创建业务记录失败：参数不能为空");
            return null;
        }

        try {
            Integer outboundType = order.getOutboundType();

            if (outboundType != null) {
                return createBusinessRecordByOutboundType(order, item, device, outboundType);
            }

            log.warn("创建业务记录失败：出库类型为空");
            return null;
        } catch (Exception e) {
            log.error("创建业务记录失败：orderNo={}, deviceId={}, error={}",
                    order.getOrderNo(), device.getId(), e.getMessage(), e);
            throw new RuntimeException("创建业务记录失败：" + e.getMessage(), e);
        }
    }

    /**
     * 根据outboundType创建业务记录
     */
    private Long createBusinessRecordByOutboundType(StockOrder order, StockOrderItem item, Device device,
            Integer outboundType) {
        log.info("根据outboundType创建业务记录：orderNo={}, outboundType={}", order.getOrderNo(), outboundType);

        switch (outboundType) {
            case 1:
                return createInstallationRecord(order, item, device);
            case 2:
                return createRepairRecord(order, item, device);
            case 3:
                return createMaintenanceRecord(order, item, device);
            case 4:
                return createScrapRecord(order, item, device);
            case 5:
                log.info("调拨出库，无需创建单独业务记录：orderNo={}", order.getOrderNo());
                return order.getId();
            case 6:
                log.info("其他出库类型，不创建特定业务记录：orderNo={}", order.getOrderNo());
                return null;
            default:
                log.warn("未知的outboundType：{}，不创建业务记录", outboundType);
                return null;
        }
    }

    /**
     * 创建安装记录
     */
    private Long createInstallationRecord(StockOrder order, StockOrderItem item, Device device) {
        log.info("创建安装记录：orderNo={}, deviceCode={}", order.getOrderNo(), device.getDeviceCode());

        InstallationRecord record = new InstallationRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setInstallNo(generateBusinessNo("AZ"));
        record.setSourceOrderId(order.getId());
        record.setSourceOrderItemId(item.getId());
        record.setSourceOrderNo(order.getOrderNo());

        // 设备信息冗余
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());

        // 从出库单获取安装地址信息
        if (order.getInstallationProvinceId() != null) {
            record.setInstallationProvinceId(order.getInstallationProvinceId());
            record.setInstallationProvince(order.getInstallationProvince());
        }
        if (order.getInstallationCityId() != null) {
            record.setInstallationCityId(order.getInstallationCityId());
            record.setInstallationCity(order.getInstallationCity());
        }
        if (order.getInstallationDistrictId() != null) {
            record.setInstallationDistrictId(order.getInstallationDistrictId());
            record.setInstallationDistrict(order.getInstallationDistrict());
        }
        record.setInstallationDetailAddress(order.getInstallationDetailAddress());
        record.assembleFullAddress();

        // 默认状态：待安装
        record.setStatus(0);

        // 保存记录
        InstallationRecord saved = installationRecordRepository.save(record);

        // 更新出库单项的关联ID
        item.setInstallationRecordId(saved.getId());
        stockOrderItemRepository.save(item);

        log.info("安装记录创建成功：recordId={}", saved.getId());
        return saved.getId();
    }

    /**
     * 创建维修记录
     */
    private Long createRepairRecord(StockOrder order, StockOrderItem item, Device device) {
        log.info("创建维修记录：orderNo={}, deviceCode={}", order.getOrderNo(), device.getDeviceCode());

        RepairRecord record = new RepairRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setRepairNo(generateBusinessNo("WX"));
        record.setSourceOrderId(order.getId());
        record.setSourceOrderItemId(item.getId());
        record.setSourceOrderNo(order.getOrderNo());

        // 设备信息冗余
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());

        // 默认状态：待维修
        record.setStatus(0);

        // 保存记录
        RepairRecord saved = repairRecordRepository.save(record);

        // 更新出库单项的关联ID
        item.setRepairRecordId(saved.getId());
        stockOrderItemRepository.save(item);

        log.info("维修记录创建成功：recordId={}", saved.getId());
        return saved.getId();
    }

    /**
     * 创建保养记录
     */
    private Long createMaintenanceRecord(StockOrder order, StockOrderItem item, Device device) {
        log.info("创建保养记录：orderNo={}, deviceCode={}", order.getOrderNo(), device.getDeviceCode());

        MaintenanceRecord record = new MaintenanceRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setMaintenanceNo(generateBusinessNo("BY"));
        record.setSourceOrderId(order.getId());
        record.setSourceOrderItemId(item.getId());
        record.setSourceOrderNo(order.getOrderNo());

        // 设备信息冗余
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());

        // 默认状态：待保养
        record.setStatus(0);

        // 保存记录
        MaintenanceRecord saved = maintenanceRecordRepository.save(record);

        // 更新出库单项的关联ID
        item.setMaintenanceRecordId(saved.getId());
        stockOrderItemRepository.save(item);

        log.info("保养记录创建成功：recordId={}", saved.getId());
        return saved.getId();
    }

    /**
     * 创建报废记录
     */
    private Long createScrapRecord(StockOrder order, StockOrderItem item, Device device) {
        log.info("创建报废记录：orderNo={}, deviceCode={}", order.getOrderNo(), device.getDeviceCode());

        ScrapRecord record = new ScrapRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setScrapNo(generateBusinessNo("BF"));
        record.setSourceOrderId(order.getId());
        record.setSourceOrderItemId(item.getId());
        record.setSourceOrderNo(order.getOrderNo());

        // 设备信息冗余
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());
        record.setDeviceModel(device.getModel());

        // 默认状态：待审批
        record.setStatus(0);

        // 保存记录
        ScrapRecord saved = scrapRecordRepository.save(record);

        // 更新出库单项的关联ID
        item.setScrapRecordId(saved.getId());
        stockOrderItemRepository.save(item);

        log.info("报废记录创建成功：recordId={}", saved.getId());
        return saved.getId();
    }

    /**
     * 生成业务记录单号
     * 格式：前缀 + 年月日 + 4位序号
     *
     * @param prefix 前缀（AZ=安装, WX=维修, BY=保养, BF=报废）
     * @return 业务记录单号
     */
    private String generateBusinessNo(String prefix) {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8);
        return String.format("%s%s%s", prefix, dateStr, timestamp);
    }

    /**
     * 根据出库单项获取业务记录
     *
     * @param item 出库单项
     * @return 业务记录
     */
    public Object getBusinessRecord(StockOrderItem item) {
        if (item == null) {
            return null;
        }

        if (item.getInstallationRecordId() != null) {
            return installationRecordRepository.findById(item.getInstallationRecordId()).orElse(null);
        }
        if (item.getRepairRecordId() != null) {
            return repairRecordRepository.findById(item.getRepairRecordId()).orElse(null);
        }
        if (item.getMaintenanceRecordId() != null) {
            return maintenanceRecordRepository.findById(item.getMaintenanceRecordId()).orElse(null);
        }
        if (item.getScrapRecordId() != null) {
            return scrapRecordRepository.findById(item.getScrapRecordId()).orElse(null);
        }

        return null;
    }

    /**
     * 检查出库单项是否已创建业务记录
     *
     * @param item 出库单项
     * @return 是否已创建
     */
    public boolean hasBusinessRecord(StockOrderItem item) {
        return item != null && item.hasBusinessRecord();
    }
}
