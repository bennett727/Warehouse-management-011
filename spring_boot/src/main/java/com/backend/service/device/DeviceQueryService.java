package com.backend.service.device;

import com.backend.dto.DeviceDTO;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

public interface DeviceQueryService {
    
    PageResult<DeviceDTO> getDevices(Pageable pageable);
    
    DeviceDTO getDeviceById(Long id);
    
    DeviceDTO getDeviceByCode(String deviceCode);
    
    List<DeviceDTO> getDevicesByType(Integer deviceTypeId);
    
    List<DeviceDTO> getDevicesByWarehouse(Integer warehouseId);
    
    List<DeviceDTO> getDevicesByArea(Integer areaId);
    
    List<DeviceDTO> getDevicesByStatus(Integer status);
    
    Map<String, Integer> getDeviceStatistics();
    
    PageResult<DeviceDTO> searchDevices(String keyword, Pageable pageable);
    
    List<DeviceDTO> getExpiredDevices();
    
    List<DeviceDTO> getLowStockDevices(Integer threshold);
    
    long getRecentOutboundStats(int days);
    
    long getRecentMaintenanceStats(int days);
    
    Map<String, Long> getDeviceTypeStats();
    
    Map<String, Long> getDeviceStatusStats();
    
    Map<String, Object> getEnhancedInventoryStatistics();
    
    List<Map<String, Object>> getAreaInventoryStatistics();
    
    List<Map<String, Object>> getDeviceTypeInventoryStatistics();
    
    List<Map<String, Object>> getPrincipalDeviceStatistics();
    
    Map<String, Object> getInventoryStatistics();
    
    List<Map<String, Object>> getPurchaseTrendStatistics(int months);
    
    List<Map<String, Object>> getDevicesExpiringSoon(int days);
}