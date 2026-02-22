package com.backend.service.dashboard;

import java.util.Map;

public interface DashboardService {
    
    Map<String, Object> getSystemOverview();
    
    Map<String, Object> getRecentActivities();
    
    Map<String, Object> getStatistics();
    
    Map<String, Object> getDeviceStatistics();
    
    Map<String, Object> getStockStatistics();
    
    Map<String, Object> getMaintenanceStatistics();
    
    Map<String, Object> getInventoryStatistics();
    
    Map<String, Object> getAreaDistribution();
    
    Map<String, Object> getTrendData(Map<String, Object> params);
    
    Map<String, Object> getPendingTasks();
    
    Map<String, Object> getSystemHealth();
}