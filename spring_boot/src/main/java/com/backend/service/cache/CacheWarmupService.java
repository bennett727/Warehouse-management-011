package com.backend.service.cache;

import com.backend.entity.Area;
import com.backend.entity.DeviceType;
import com.backend.entity.Supplier;
import com.backend.repository.AreaRepository;
import com.backend.repository.DeviceTypeRepository;
import com.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 缓存预热服务
 *
 * 功能说明：
 * 系统启动时自动预热基础数据缓存
 * 预热数据：
 * 1. 设备类型列表（变化较少，适合长期缓存）
 * 2. 区域/库区数据（几乎不变，适合长期缓存）
 * 3. 供应商列表（变化较少，适合长期缓存）
 *
 * 预热策略：
 * - 启动时自动加载
 * - 支持手动触发重新预热
 * - 记录预热耗时和结果
 *
 * @author 后端优化团队
 * @version 1.0
 * @since 2025-02-08
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheWarmupService implements ApplicationRunner {

    private final DeviceTypeRepository deviceTypeRepository;
    private final AreaRepository areaRepository;
    private final SupplierRepository supplierRepository;

    /**
     * 系统启动时自动执行缓存预热
     *
     * @param args 应用参数
     */
    @Override
    public void run(ApplicationArguments args) {
        log.info("========== 开始缓存预热 ==========");
        warmupAllCaches();
        log.info("========== 缓存预热完成 ==========");
    }

    /**
     * 预热所有缓存
     *
     * @return 预热结果统计
     */
    public WarmupResult warmupAllCaches() {
        long startTime = System.currentTimeMillis();
        WarmupResult result = new WarmupResult();

        try {
            // 预热设备类型缓存
            result.addResult("deviceType", warmupDeviceTypeCache());

            // 预热区域缓存
            result.addResult("area", warmupAreaCache());

            // 预热供应商缓存
            result.addResult("supplier", warmupSupplierCache());

        } catch (Exception e) {
            log.error("缓存预热失败: {}", e.getMessage(), e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        result.setTotalTime(System.currentTimeMillis() - startTime);
        log.info("缓存预热完成: {}", result);

        return result;
    }

    /**
     * 预热设备类型缓存
     *
     * @return 预热结果
     */
    @Cacheable(value = "deviceType", key = "'all'")
    public List<DeviceType> warmupDeviceTypeCache() {
        log.info("预热设备类型缓存...");
        long startTime = System.currentTimeMillis();

        List<DeviceType> deviceTypes = deviceTypeRepository.findAll();

        long duration = System.currentTimeMillis() - startTime;
        log.info("设备类型缓存预热完成: count={}, time={}ms", deviceTypes.size(), duration);

        return deviceTypes;
    }

    /**
     * 预热区域缓存
     *
     * @return 预热结果
     */
    @Cacheable(value = "area", key = "'all'")
    public List<Area> warmupAreaCache() {
        log.info("预热区域缓存...");
        long startTime = System.currentTimeMillis();

        List<Area> areas = areaRepository.findAll();

        long duration = System.currentTimeMillis() - startTime;
        log.info("区域缓存预热完成: count={}, time={}ms", areas.size(), duration);

        return areas;
    }

    /**
     * 预热供应商缓存
     *
     * @return 预热结果
     */
    @Cacheable(value = "supplier", key = "'all'")
    public List<Supplier> warmupSupplierCache() {
        log.info("预热供应商缓存...");
        long startTime = System.currentTimeMillis();

        List<Supplier> suppliers = supplierRepository.findAll();

        long duration = System.currentTimeMillis() - startTime;
        log.info("供应商缓存预热完成: count={}, time={}ms", suppliers.size(), duration);

        return suppliers;
    }

    /**
     * 预热结果类
     */
    public static class WarmupResult {
        private boolean success = true;
        private long totalTime;
        private String errorMessage;
        private java.util.Map<String, CacheResult> results = new java.util.HashMap<>();

        public void addResult(String cacheName, Object data) {
            CacheResult result = new CacheResult();
            result.setCacheName(cacheName);
            result.setData(data);
            result.setCount(getCount(data));
            results.put(cacheName, result);
        }

        private int getCount(Object data) {
            if (data instanceof List) {
                return ((List<?>) data).size();
            }
            return 0;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public long getTotalTime() { return totalTime; }
        public void setTotalTime(long totalTime) { this.totalTime = totalTime; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public java.util.Map<String, CacheResult> getResults() { return results; }
        public void setResults(java.util.Map<String, CacheResult> results) { this.results = results; }

        @Override
        public String toString() {
            return String.format("WarmupResult{success=%s, totalTime=%dms, results=%s}",
                    success, totalTime, results.keySet());
        }
    }

    /**
     * 单个缓存预热结果
     */
    public static class CacheResult {
        private String cacheName;
        private int count;
        private Object data;

        public String getCacheName() { return cacheName; }
        public void setCacheName(String cacheName) { this.cacheName = cacheName; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
}
