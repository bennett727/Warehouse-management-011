package com.backend.service.device;

import com.backend.dto.DeviceDTO;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface DeviceCoreService {
    
    DeviceDTO createDevice(DeviceDTO deviceDTO);
    
    DeviceDTO updateDevice(Long id, DeviceDTO deviceDTO);
    
    void deleteDevice(Long id);
    
    DeviceDTO getDeviceById(Long id);
    
    DeviceDTO getDeviceByCode(String deviceCode);
    
    List<DeviceDTO> getDevicesByType(Integer deviceTypeId);
    
    List<DeviceDTO> getDevicesByWarehouse(Integer warehouseId);
    
    List<DeviceDTO> getDevicesByArea(Integer areaId);
    
    PageResult<DeviceDTO> getDevices(Pageable pageable);
    
    void updateDeviceStatus(Long id, Integer status);
    
    void updateDeviceStock(Long id, Integer quantity);
}