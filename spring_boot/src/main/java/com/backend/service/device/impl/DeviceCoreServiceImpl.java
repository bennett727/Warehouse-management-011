package com.backend.service.device.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.DeviceDTO;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.entity.DeviceType;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceTypeRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.service.base.AbstractCrudService;
import com.backend.service.device.DeviceCoreService;
import com.backend.service.device.DeviceLifecycleValidator;

@Service
@Primary
public class DeviceCoreServiceImpl extends AbstractCrudService<Device, Long> implements DeviceCoreService {
    private static final Logger logger = LoggerFactory.getLogger(DeviceCoreServiceImpl.class);

    private final DeviceRepository deviceRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final StockOrderItemRepository stockOrderItemRepository;

    public DeviceCoreServiceImpl(DeviceRepository deviceRepository, DeviceTypeRepository deviceTypeRepository,
            StockOrderItemRepository stockOrderItemRepository) {
        super(deviceRepository, "设备");
        this.deviceRepository = deviceRepository;
        this.deviceTypeRepository = deviceTypeRepository;
        this.stockOrderItemRepository = stockOrderItemRepository;
    }

    @Override
    @Transactional
    @CacheEvict(value = { "deviceStatistics", "deviceTypeStats", "deviceStatusStats",
            "inventoryStatistics" }, allEntries = true)
    public DeviceDTO createDevice(DeviceDTO deviceDTO) {
        logger.info("创建新设备，编号: {}", deviceDTO.getDeviceCode());

        // 验证设备类型必须选择
        validateDeviceType(deviceDTO);

        Device device = convertToEntity(deviceDTO);
        Device savedDevice = save(device);

        return convertToDTO(savedDevice);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "deviceStatistics", "deviceTypeStats", "deviceStatusStats",
            "inventoryStatistics" }, allEntries = true)
    public DeviceDTO updateDevice(Long id, DeviceDTO deviceDTO) {
        logger.info("更新设备信息，ID: {}", id);

        Device existingDevice = findById(id);
        if (existingDevice == null) {
            throw new BusinessException(ErrorCode.DEVICE_NOT_FOUND);
        }

        // 验证设备类型必须选择
        validateDeviceType(deviceDTO);

        Device deviceDetails = convertToEntity(deviceDTO);
        updateDeviceFields(existingDevice, deviceDetails);

        Device updatedDevice = save(existingDevice);
        logger.info("设备更新成功，ID: {}", id);

        return convertToDTO(updatedDevice);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "deviceStatistics", "deviceTypeStats", "deviceStatusStats",
            "inventoryStatistics" }, allEntries = true)
    public void deleteDevice(Long id) {
        logger.info("删除设备，ID: {}", id);

        Device device = findById(id);
        if (device == null) {
            throw new ResourceNotFoundException("Device", "id", id);
        }

        validateDeviceDeletion(device);
        handleDeviceRelatedData(device);

        deviceRepository.delete(device);
        logger.info("设备删除成功，ID: {}, 编号: {}", id, device.getDeviceCode());
    }

    @Override
    public DeviceDTO getDeviceById(Long id) {
        logger.debug("根据ID获取设备，ID: {}", id);
        Device device = findById(id);
        return device != null ? convertToDTO(device) : null;
    }

    @Override
    public DeviceDTO getDeviceByCode(String deviceCode) {
        logger.debug("根据设备编号获取设备，编号: {}", deviceCode);
        Device device = deviceRepository.findByDeviceCode(deviceCode).orElse(null);
        return device != null ? convertToDTO(device) : null;
    }

    @Override
    public List<DeviceDTO> getDevicesByType(Integer deviceTypeId) {
        logger.debug("根据设备类型获取设备列表，类型ID: {}", deviceTypeId);
        List<Device> devices = deviceRepository.findByDeviceTypeId(deviceTypeId.longValue());
        return devices.stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<DeviceDTO> getDevicesByWarehouse(Integer warehouseId) {
        logger.debug("根据仓库获取设备列表，仓库ID: {}", warehouseId);
        List<Device> devices = deviceRepository.findByWarehouseId(warehouseId.longValue());
        return devices.stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<DeviceDTO> getDevicesByArea(Integer areaId) {
        logger.debug("根据区域获取设备列表，区域ID: {}", areaId);
        List<Device> devices = deviceRepository.findByAreaId(areaId.longValue());
        return devices.stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public PageResult<DeviceDTO> getDevices(Pageable pageable) {
        logger.info("分页获取设备列表，页码: {}, 大小: {}", pageable.getPageNumber(), pageable.getPageSize());
        org.springframework.data.domain.Page<Device> page = deviceRepository.findAll(pageable);
        List<DeviceDTO> dtoList = page.getContent().stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
        return PageResult.of(page, dtoList);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "deviceStatistics", "deviceTypeStats", "deviceStatusStats",
            "inventoryStatistics" }, allEntries = true)
    public void updateDeviceStatus(Long id, Integer status) {
        logger.info("更新设备状态，ID: {}, 状态: {}", id, status);
        Device device = findById(id);
        if (device == null) {
            throw new BusinessException(ErrorCode.DEVICE_NOT_FOUND);
        }
        device.setStatus(status);
        save(device);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "deviceStatistics", "deviceTypeStats", "deviceStatusStats",
            "inventoryStatistics" }, allEntries = true)
    public void updateDeviceStock(Long id, Integer quantity) {
        logger.info("更新设备库存，ID: {}, 数量: {}", id, quantity);
        Device device = findById(id);
        if (device == null) {
            throw new BusinessException(ErrorCode.DEVICE_NOT_FOUND);
        }
        device.setCurrentStock(quantity);
        save(device);
    }

    public DeviceDTO convertToDTO(Device device) {
        logger.debug("将设备实体转换为DTO，设备ID: {}", device.getId());

        DeviceDTO deviceDTO = new DeviceDTO();
        deviceDTO.setId(device.getId());
        deviceDTO.setDeviceCode(device.getDeviceCode());
        deviceDTO.setDeviceName(device.getDeviceName());
        deviceDTO.setDeviceModel(device.getModel());
        deviceDTO.setDeviceSpec(device.getSerialNumber());
        deviceDTO.setManufacturer(device.getManufacturer());

        deviceDTO.setDeviceTypeId(device.getTypeId() != null ? device.getTypeId().intValue() : null);
        if (device.getDeviceType() != null) {
            deviceDTO.setDeviceTypeName(device.getDeviceType().getTypeName());
        }

        deviceDTO.setStatus(device.getStatus());
        deviceDTO.setStatusName(getStatusName(device.getStatus()));

        deviceDTO.setCurrentStock(device.getCurrentStock());
        deviceDTO.setTotalStock(device.getCurrentStock());

        deviceDTO.setAreaId(device.getAreaId() != null ? device.getAreaId().intValue() : null);
        if (device.getArea() != null) {
            deviceDTO.setAreaName(device.getArea().getName());
        }

        if (device.getPurchaseDate() != null) {
            deviceDTO.setPurchaseDate(device.getPurchaseDate().toString());
        }

        deviceDTO.setWarrantyPeriod(device.getWarrantyPeriod() != null ? device.getWarrantyPeriod().toString() : null);

        deviceDTO.setPurchasePrice(device.getPurchasePrice() != null ? device.getPurchasePrice().doubleValue() : null);

        deviceDTO.setRemark(device.getSpecifications());

        // 安装位置信息
        deviceDTO.setInstallationLocation(device.getInstallationLocation());
        deviceDTO.setInstallationProvince(device.getInstallationProvince());
        deviceDTO.setInstallationCity(device.getInstallationCity());
        deviceDTO.setInstallationDistrict(device.getInstallationDistrict());
        deviceDTO.setInstallationAddress(device.getInstallationAddress());

        // 安装人员信息
        deviceDTO.setInstallerId(device.getInstallerId());
        deviceDTO.setInstallerName(device.getInstallerName());

        // 负责人信息
        deviceDTO.setPrincipalName(device.getPrincipalName());

        // 供应商信息
        deviceDTO.setSupplierId(device.getSupplierId());
        deviceDTO.setSupplierName(device.getSupplierName());

        // 其他字段
        deviceDTO.setSerialNumber(device.getSerialNumber());
        deviceDTO.setProductionDate(device.getProductionDate());
        deviceDTO.setWarrantyStart(device.getWarrantyStart());
        deviceDTO.setWarrantyEnd(device.getWarrantyEnd());
        deviceDTO.setSpecifications(device.getSpecifications());
        deviceDTO.setPrice(device.getPrice() != null ? device.getPrice().doubleValue() : null);
        deviceDTO.setImageUrl(device.getImageUrl());
        deviceDTO.setDescription(device.getDescription());

        // 仓库信息
        deviceDTO.setWarehouseId(device.getWarehouseId() != null ? device.getWarehouseId().intValue() : null);
        deviceDTO.setWarehouseName(device.getWarehouseName());
        deviceDTO.setAreaId(device.getAreaId() != null ? device.getAreaId().intValue() : null);
        deviceDTO.setAreaName(device.getAreaName());
        deviceDTO.setBinId(device.getBinId() != null ? device.getBinId().intValue() : null);
        deviceDTO.setBinName(device.getBinName());

        // ==================== 出入库信息（新增） ====================
        deviceDTO.setInboundPersonId(device.getInboundPersonId());
        deviceDTO.setInboundPersonName(device.getInboundPersonName());
        deviceDTO.setInboundTime(device.getInboundTime());

        deviceDTO.setOutboundPersonId(device.getOutboundPersonId());
        deviceDTO.setOutboundPersonName(device.getOutboundPersonName());
        deviceDTO.setOutboundTime(device.getOutboundTime());

        deviceDTO.setCurrentLocation(device.getCurrentDisplayLocation());
        deviceDTO.setCurrentLocationType(device.getCurrentLocationType());
        deviceDTO.setCurrentLocationTypeName(getLocationTypeName(device.getCurrentLocationType()));

        deviceDTO.setCreateTime(device.getCreateTime());
        deviceDTO.setUpdateTime(device.getUpdateTime());

        return deviceDTO;
    }

    public Device convertToEntity(DeviceDTO deviceDTO) {
        logger.debug("将设备DTO转换为实体，设备编号: {}", deviceDTO.getDeviceCode());

        Device device = new Device();

        device.setDeviceCode(deviceDTO.getDeviceCode());
        device.setDeviceName(deviceDTO.getDeviceName());
        device.setModel(deviceDTO.getDeviceModel());
        device.setSerialNumber(deviceDTO.getDeviceSpec());

        if (deviceDTO.getDeviceTypeId() != null) {
            DeviceType deviceType = deviceTypeRepository.findById(deviceDTO.getDeviceTypeId().longValue()).orElse(null);
            if (deviceType != null) {
                device.setDeviceType(deviceType);
            } else {
                logger.warn("无效的设备类型ID: {}", deviceDTO.getDeviceTypeId());
            }
        }

        device.setStatus(deviceDTO.getStatus());
        device.setCurrentStock(deviceDTO.getCurrentStock());
        device.setSpecifications(deviceDTO.getRemark());

        if (deviceDTO.getPurchaseDate() != null) {
            try {
                device.setPurchaseDate(java.time.LocalDate.parse(deviceDTO.getPurchaseDate()));
            } catch (Exception e) {
                logger.warn("无效的采购日期格式: {}", deviceDTO.getPurchaseDate());
            }
        }

        return device;
    }

    private String getStatusName(Integer status) {
        if (status == null)
            return "未知";
        switch (status) {
            case -1:
                return "待入库";
            case 0:
                return "在库";
            case 1:
                return "使用中";
            case 2:
                return "维护中";
            case 3:
                return "已报废";
            default:
                return "未知";
        }
    }

    private String getLocationTypeName(Integer locationType) {
        if (locationType == null)
            return "未知";
        switch (locationType) {
            case 0:
                return "仓库";
            case 1:
                return "安装现场";
            default:
                return "未知";
        }
    }

    private void updateDeviceFields(Device existingDevice, Device deviceDetails) {
        logger.debug("开始更新设备字段");

        if (existingDevice == null || deviceDetails == null) {
            logger.warn("更新设备字段失败：设备对象为空");
            return;
        }

        if (deviceDetails.getDeviceCode() != null && !deviceDetails.getDeviceCode().isEmpty()) {
            existingDevice.setDeviceCode(deviceDetails.getDeviceCode());
        }

        if (deviceDetails.getDeviceName() != null && !deviceDetails.getDeviceName().isEmpty()) {
            existingDevice.setDeviceName(deviceDetails.getDeviceName());
        }

        if (deviceDetails.getModel() != null && !deviceDetails.getModel().isEmpty()) {
            existingDevice.setModel(deviceDetails.getModel());
        }

        if (deviceDetails.getSerialNumber() != null) {
            existingDevice.setSerialNumber(deviceDetails.getSerialNumber());
        }

        if (deviceDetails.getManufacturer() != null) {
            existingDevice.setManufacturer(deviceDetails.getManufacturer());
        }

        if (deviceDetails.getPurchaseDate() != null) {
            existingDevice.setPurchaseDate(deviceDetails.getPurchaseDate());
        }

        if (deviceDetails.getProductionDate() != null) {
            existingDevice.setProductionDate(deviceDetails.getProductionDate());
        }

        if (deviceDetails.getWarrantyPeriod() != null) {
            existingDevice.setWarrantyPeriod(deviceDetails.getWarrantyPeriod());
        }

        if (deviceDetails.getWarrantyEnd() != null) {
            existingDevice.setWarrantyEnd(deviceDetails.getWarrantyEnd());
        }

        if (deviceDetails.getStatus() != null) {
            existingDevice.setStatus(deviceDetails.getStatus());
        }

        if (deviceDetails.getDeviceType() != null) {
            existingDevice.setDeviceType(deviceDetails.getDeviceType());
        }

        if (deviceDetails.getArea() != null) {
            existingDevice.setArea(deviceDetails.getArea());
        }

        if (deviceDetails.getBin() != null) {
            existingDevice.setBin(deviceDetails.getBin());
        }

        if (deviceDetails.getPrincipal() != null) {
            existingDevice.setPrincipal(deviceDetails.getPrincipal());
        }

        if (deviceDetails.getSupplier() != null) {
            existingDevice.setSupplier(deviceDetails.getSupplier());
        }

        if (deviceDetails.getPrice() != null) {
            existingDevice.setPrice(deviceDetails.getPrice());
        }

        if (deviceDetails.getSpecifications() != null) {
            existingDevice.setSpecifications(deviceDetails.getSpecifications());
        }

        if (deviceDetails.getCurrentStock() != null) {
            existingDevice.setCurrentStock(deviceDetails.getCurrentStock());
        }

        if (deviceDetails.getMinStock() != null) {
            existingDevice.setMinStock(deviceDetails.getMinStock());
        }

        if (deviceDetails.getMaxStock() != null) {
            existingDevice.setMaxStock(deviceDetails.getMaxStock());
        }

        logger.debug("设备字段更新完成");
    }

    private void validateDeviceDeletion(Device device) {
        logger.debug("验证设备删除条件，设备ID: {}, 编号: {}", device.getId(), device.getDeviceCode());
        DeviceLifecycleValidator.validateDeviceForDeletion(device);
    }

    private void handleDeviceRelatedData(Device device) {
        logger.debug("开始处理设备关联数据");
        logger.debug("设备关联数据处理完成");
    }

    /**
     * 验证设备类型必须选择
     * 
     * @param deviceDTO 设备DTO
     * @throws BusinessException 当设备类型未选择时抛出异常
     */
    private void validateDeviceType(DeviceDTO deviceDTO) {
        if (deviceDTO.getDeviceTypeId() == null) {
            logger.warn("创建设备失败：设备类型未选择");
            throw new BusinessException(ErrorCode.PARAM_ERROR, "设备类型必须选择");
        }
    }
}
