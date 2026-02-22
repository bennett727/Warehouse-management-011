package com.backend.service;

import com.backend.entity.Bin;
import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceStatusSyncService {

    private final DeviceRepository deviceRepository;
    private final BinRepository binRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public void syncOnInbound(Device device, Long binId, Long operatorId, String operatorName) {
        log.info("入库同步设备状态: deviceId={}, binId={}", device.getId(), binId);
        
        Bin bin = binRepository.findById(binId)
                .orElseThrow(() -> new RuntimeException("货位不存在: " + binId));
        
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        device.setBinId(binId);
        device.setAreaId(bin.getAreaId());
        
        if (bin.getArea() != null) {
            device.setAreaName(bin.getArea().getName());
            if (bin.getArea().getWarehouse() != null) {
                device.setWarehouseId(bin.getArea().getWarehouseId());
                device.setWarehouseName(bin.getArea().getWarehouse().getWarehouseName());
            }
        }
        device.setBinName(bin.getCode());
        
        device.setInboundPersonId(operatorId);
        device.setInboundPersonName(operatorName);
        device.setInboundTime(LocalDateTime.now());
        device.setCurrentLocationType(0);
        device.setCurrentLocation(device.getCurrentDisplayLocation());
        
        deviceRepository.save(device);
        log.info("设备入库状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.IN_STOCK.getDescription());
    }

    @Transactional
    public void syncOnInstallOutbound(Device device, Long operatorId, String operatorName,
                                       String province, String city, String district, String address) {
        log.info("安装出库同步设备状态: deviceId={}", device.getId());
        
        device.setStatus(DeviceStatus.IN_USE.getCode());
        device.setBinId(null);
        device.setAreaId(null);
        device.setBinName(null);
        device.setAreaName(null);
        
        device.setInstallationProvince(province);
        device.setInstallationCity(city);
        device.setInstallationDistrict(district);
        device.setInstallationAddress(address);
        
        StringBuilder location = new StringBuilder();
        if (province != null) location.append(province);
        if (city != null) location.append(location.length() > 0 ? " > " : "").append(city);
        if (district != null) location.append(location.length() > 0 ? " > " : "").append(district);
        if (address != null) location.append(location.length() > 0 ? " > " : "").append(address);
        device.setInstallationLocation(location.toString());
        device.setInstallationTime(LocalDateTime.now());
        
        device.setOutboundPersonId(operatorId);
        device.setOutboundPersonName(operatorName);
        device.setOutboundTime(LocalDateTime.now());
        device.setCurrentLocationType(1);
        device.setCurrentLocation(location.toString());
        
        deviceRepository.save(device);
        log.info("设备安装出库状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.IN_USE.getDescription());
    }

    @Transactional
    public void syncOnRepairOutbound(Device device, Long operatorId, String operatorName) {
        log.info("维修出库同步设备状态: deviceId={}", device.getId());
        
        device.setStatus(DeviceStatus.UNDER_REPAIR.getCode());
        device.setOutboundPersonId(operatorId);
        device.setOutboundPersonName(operatorName);
        device.setOutboundTime(LocalDateTime.now());
        
        deviceRepository.save(device);
        log.info("设备维修出库状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.UNDER_REPAIR.getDescription());
    }

    @Transactional
    public void syncOnRepairComplete(Device device, Long binId, Long operatorId, String operatorName) {
        log.info("维修完成回库同步设备状态: deviceId={}, binId={}", device.getId(), binId);
        
        Bin bin = binRepository.findById(binId)
                .orElseThrow(() -> new RuntimeException("货位不存在: " + binId));
        
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        device.setBinId(binId);
        device.setAreaId(bin.getAreaId());
        
        if (bin.getArea() != null) {
            device.setAreaName(bin.getArea().getName());
            if (bin.getArea().getWarehouse() != null) {
                device.setWarehouseId(bin.getArea().getWarehouseId());
                device.setWarehouseName(bin.getArea().getWarehouse().getWarehouseName());
            }
        }
        device.setBinName(bin.getCode());
        
        device.setInboundPersonId(operatorId);
        device.setInboundPersonName(operatorName);
        device.setInboundTime(LocalDateTime.now());
        device.setCurrentLocationType(0);
        device.setCurrentLocation(device.getCurrentDisplayLocation());
        
        deviceRepository.save(device);
        log.info("设备维修完成状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.IN_STOCK.getDescription());
    }

    @Transactional
    public void syncOnMaintenanceStart(Device device) {
        log.info("保养开始同步设备状态: deviceId={}", device.getId());
        
        device.setStatus(DeviceStatus.MAINTENANCE.getCode());
        deviceRepository.save(device);
        
        log.info("设备保养开始状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.MAINTENANCE.getDescription());
    }

    @Transactional
    public void syncOnMaintenanceComplete(Device device) {
        log.info("保养完成同步设备状态: deviceId={}", device.getId());
        
        device.setStatus(DeviceStatus.IN_STOCK.getCode());
        deviceRepository.save(device);
        
        log.info("设备保养完成状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.IN_STOCK.getDescription());
    }

    @Transactional
    public void syncOnScrap(Device device, String reason) {
        log.info("报废同步设备状态: deviceId={}", device.getId());
        
        device.setStatus(DeviceStatus.SCRAPPED.getCode());
        device.setScrapReason(reason);
        device.setScrapTime(LocalDateTime.now());
        device.setBinId(null);
        device.setAreaId(null);
        device.setBinName(null);
        device.setAreaName(null);
        device.setCurrentLocation(null);
        
        deviceRepository.save(device);
        
        inventoryRepository.deleteByDeviceId(device.getId());
        
        log.info("设备报废状态同步完成: deviceCode={}, status={}", device.getDeviceCode(), DeviceStatus.SCRAPPED.getDescription());
    }

    @Transactional
    public void syncOnTransfer(Device device, Long targetBinId) {
        log.info("调拨同步设备位置: deviceId={}, targetBinId={}", device.getId(), targetBinId);
        
        Bin targetBin = binRepository.findById(targetBinId)
                .orElseThrow(() -> new RuntimeException("目标货位不存在: " + targetBinId));
        
        device.setBinId(targetBinId);
        device.setAreaId(targetBin.getAreaId());
        
        if (targetBin.getArea() != null) {
            device.setAreaName(targetBin.getArea().getName());
            if (targetBin.getArea().getWarehouse() != null) {
                device.setWarehouseId(targetBin.getArea().getWarehouseId());
                device.setWarehouseName(targetBin.getArea().getWarehouse().getWarehouseName());
            }
        }
        device.setBinName(targetBin.getCode());
        device.setCurrentLocation(device.getCurrentDisplayLocation());
        
        deviceRepository.save(device);
        
        log.info("设备调拨位置同步完成: deviceCode={}, newBinCode={}", device.getDeviceCode(), targetBin.getCode());
    }
}
