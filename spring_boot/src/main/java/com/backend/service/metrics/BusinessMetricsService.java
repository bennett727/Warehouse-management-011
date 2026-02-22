package com.backend.service.metrics;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.backend.repository.DeviceRepository;
import com.backend.repository.StockOrderRepository;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 业务指标收集服务
 * 
 * 功能说明：
 * 收集和上报业务相关的性能指标
 * 
 * 收集指标：
 * - 设备总数
 * - 在线设备数
 * - 维修中设备数
 * - 库存预警设备数
 * - 今日订单数
 * - API响应时间
 * - 错误次数
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessMetricsService {

        private final MeterRegistry meterRegistry;
        private final DeviceRepository deviceRepository;
        private final StockOrderRepository stockOrderRepository;

        // 计数器
        private Counter apiErrorCounter;
        private Counter apiSuccessCounter;
        private Counter loginSuccessCounter;
        private Counter loginFailureCounter;

        // 计时器
        private Timer apiResponseTimer;
        private Timer dbQueryTimer;

        // 当前值
        private final AtomicInteger activeDeviceCount = new AtomicInteger(0);
        private final AtomicInteger maintenanceDeviceCount = new AtomicInteger(0);
        private final AtomicInteger alertDeviceCount = new AtomicInteger(0);

        /**
         * 初始化指标
         */
        @PostConstruct
        public void init() {
                log.info("初始化业务指标收集服务");

                // 注册设备总数指标
                Gauge.builder("wms.devices.total", deviceRepository, DeviceRepository::count)
                                .description("设备总数")
                                .register(meterRegistry);

                // 注册在线设备数指标
                Gauge.builder("wms.devices.active", activeDeviceCount, AtomicInteger::get)
                                .description("在线设备数")
                                .register(meterRegistry);

                // 注册维修中设备数指标
                Gauge.builder("wms.devices.maintenance", maintenanceDeviceCount, AtomicInteger::get)
                                .description("维修中设备数")
                                .register(meterRegistry);

                // 注册库存预警设备数指标
                Gauge.builder("wms.devices.stock.alert", alertDeviceCount, AtomicInteger::get)
                                .description("库存预警设备数")
                                .register(meterRegistry);

                // 初始化计数器
                apiErrorCounter = Counter.builder("wms.api.errors")
                                .description("API错误次数")
                                .register(meterRegistry);

                apiSuccessCounter = Counter.builder("wms.api.success")
                                .description("API成功次数")
                                .register(meterRegistry);

                loginSuccessCounter = Counter.builder("wms.login.success")
                                .description("登录成功次数")
                                .register(meterRegistry);

                loginFailureCounter = Counter.builder("wms.login.failure")
                                .description("登录失败次数")
                                .register(meterRegistry);

                // 初始化计时器
                apiResponseTimer = Timer.builder("wms.api.response.time")
                                .description("API响应时间")
                                .publishPercentiles(0.5, 0.95, 0.99)
                                .register(meterRegistry);

                dbQueryTimer = Timer.builder("wms.db.query.time")
                                .description("数据库查询时间")
                                .publishPercentiles(0.5, 0.95, 0.99)
                                .register(meterRegistry);

                log.info("业务指标收集服务初始化完成");
        }

        /**
         * 定时更新业务指标
         * 每30秒更新一次
         */
        @Scheduled(fixedRate = 30000)
        public void updateBusinessMetrics() {
                try {
                        // 更新在线设备数（状态为1表示在线）
                        Long onlineCount = deviceRepository.countByStatus("1");
                        activeDeviceCount.set(onlineCount != null ? onlineCount.intValue() : 0);

                        // 更新维修中设备数（状态为3表示维修中）
                        Long maintenanceCount = deviceRepository.countByStatus("3");
                        maintenanceDeviceCount.set(maintenanceCount != null ? maintenanceCount.intValue() : 0);

                        // 更新库存预警设备数
                        Long alertCount = deviceRepository.countByCurrentStockLessThanEqual(10);
                        alertDeviceCount.set(alertCount != null ? alertCount.intValue() : 0);

                        log.debug("业务指标更新完成 - 在线设备: {}, 维修中: {}, 预警: {}",
                                        activeDeviceCount.get(), maintenanceDeviceCount.get(), alertDeviceCount.get());

                } catch (Exception e) {
                        log.error("更新业务指标失败", e);
                }
        }

        /**
         * 记录API响应时间
         * 
         * @param duration 响应时间（毫秒）
         */
        public void recordApiResponseTime(long duration) {
                apiResponseTimer.record(duration, TimeUnit.MILLISECONDS);
        }

        /**
         * 记录数据库查询时间
         * 
         * @param duration 查询时间（毫秒）
         */
        public void recordDbQueryTime(long duration) {
                dbQueryTimer.record(duration, TimeUnit.MILLISECONDS);
        }

        /**
         * 记录API错误
         */
        public void incrementApiError() {
                apiErrorCounter.increment();
        }

        /**
         * 记录API成功
         */
        public void incrementApiSuccess() {
                apiSuccessCounter.increment();
        }

        /**
         * 记录登录成功
         */
        public void incrementLoginSuccess() {
                loginSuccessCounter.increment();
        }

        /**
         * 记录登录失败
         */
        public void incrementLoginFailure() {
                loginFailureCounter.increment();
        }

        /**
         * 获取当前在线设备数
         * 
         * @return 在线设备数
         */
        public int getActiveDeviceCount() {
                return activeDeviceCount.get();
        }

        /**
         * 获取当前维修中设备数
         * 
         * @return 维修中设备数
         */
        public int getMaintenanceDeviceCount() {
                return maintenanceDeviceCount.get();
        }

        /**
         * 获取当前库存预警设备数
         * 
         * @return 库存预警设备数
         */
        public int getAlertDeviceCount() {
                return alertDeviceCount.get();
        }
}
