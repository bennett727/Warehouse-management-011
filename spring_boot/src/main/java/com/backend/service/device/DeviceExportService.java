package com.backend.service.device;

import java.io.OutputStream;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.dto.DeviceExportTask;
import com.backend.entity.Device;
import com.backend.repository.DeviceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 设备导出服务
 * 
 * 功能说明：
 * 提供设备数据的异步导出功能，支持大数据量分页导出
 * 
 * 核心特性：
 * - 分页导出：大数据量时分页处理，避免内存溢出
 * - 异步处理：导出任务在后台执行，不阻塞用户请求
 * - 进度跟踪：实时跟踪导出进度
 * - 流式写入：使用流式写入，降低内存占用
 * 
 * 使用场景：
 * - 设备列表导出（超过1万条记录）
 * - 设备统计报表导出
 * - 批量设备数据备份
 * 
 * @author 技术架构团队
 * @version 1.0
 * @since 2026-02-19
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceExportService {

    private final DeviceRepository deviceRepository;
    
    // 每页导出数量
    private static final int PAGE_SIZE = 1000;
    
    /**
     * 异步导出设备数据
     * 
     * @param task 导出任务
     * @param outputStream 输出流
     * @return CompletableFuture对象
     */
    @Async("taskExecutor")
    @Transactional(readOnly = true)
    public CompletableFuture<Void> exportDevicesAsync(DeviceExportTask task, OutputStream outputStream) {
        log.info("开始异步导出设备数据, 任务ID: {}", task.getTaskId());
        
        try {
            // 获取总记录数
            long totalCount = deviceRepository.count();
            log.info("设备总记录数: {}", totalCount);
            
            // 计算总页数
            int totalPages = (int) Math.ceil((double) totalCount / PAGE_SIZE);
            log.info("总页数: {}", totalPages);
            
            // 创建CSV头部
            writeCsvHeader(outputStream);
            
            // 分页导出数据
            for (int page = 0; page < totalPages; page++) {
                // 检查任务是否被取消
                if (task.isCancelled()) {
                    log.info("导出任务被取消, 任务ID: {}", task.getTaskId());
                    break;
                }
                
                // 分页查询
                Pageable pageable = PageRequest.of(page, PAGE_SIZE);
                Page<Device> devicePage = deviceRepository.findAll(pageable);
                List<Device> devices = devicePage.getContent();
                
                // 写入数据
                writeCsvData(outputStream, devices);
                
                // 更新进度
                int progress = (int) ((page + 1) * 100.0 / totalPages);
                task.updateProgress(progress);
                
                log.info("导出进度: {}/{} 页, 进度: {}%", page + 1, totalPages, progress);
                
                // 每10页刷新一次缓冲区
                if (page % 10 == 0) {
                    outputStream.flush();
                }
            }
            
            // 完成导出
            outputStream.flush();
            task.complete();
            log.info("设备数据导出完成, 任务ID: {}", task.getTaskId());
            
        } catch (Exception e) {
            log.error("设备数据导出失败, 任务ID: {}", task.getTaskId(), e);
            task.fail(e.getMessage());
            throw new RuntimeException("导出失败: " + e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 分页导出设备数据（同步方法，适用于小数据量）
     * 
     * @param outputStream 输出流
     * @param pageable 分页参数
     */
    @Transactional(readOnly = true)
    public void exportDevicesPage(OutputStream outputStream, Pageable pageable) {
        log.info("分页导出设备数据, 页码: {}, 页大小: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        try {
            Page<Device> devicePage = deviceRepository.findAll(pageable);
            List<Device> devices = devicePage.getContent();
            
            // 如果是第一页，写入头部
            if (pageable.getPageNumber() == 0) {
                writeCsvHeader(outputStream);
            }
            
            // 写入数据
            writeCsvData(outputStream, devices);
            outputStream.flush();
            
            log.info("分页导出完成, 导出记录数: {}", devices.size());
            
        } catch (Exception e) {
            log.error("分页导出设备数据失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 写入CSV头部
     * 
     * @param outputStream 输出流
     */
    private void writeCsvHeader(OutputStream outputStream) throws Exception {
        String header = "设备编号,设备名称,设备类型,型号,序列号,状态,区域,仓库,负责人,供应商,采购日期,保修结束日期,创建时间\n";
        outputStream.write(header.getBytes("UTF-8"));
    }
    
    /**
     * 写入CSV数据
     * 
     * @param outputStream 输出流
     * @param devices 设备列表
     */
    private void writeCsvData(OutputStream outputStream, List<Device> devices) throws Exception {
        StringBuilder sb = new StringBuilder();
        
        for (Device device : devices) {
            sb.append(escapeCsv(device.getDeviceCode())).append(",")
              .append(escapeCsv(device.getDeviceName())).append(",")
              .append(escapeCsv(device.getDeviceType() != null ? device.getDeviceType().getTypeName() : "")).append(",")
              .append(escapeCsv(device.getModel())).append(",")
              .append(escapeCsv(device.getSerialNumber())).append(",")
              .append(device.getStatus()).append(",")
              .append(escapeCsv(device.getArea() != null ? device.getArea().getName() : "")).append(",")
              .append(escapeCsv(device.getArea() != null && device.getArea().getWarehouse() != null ? device.getArea().getWarehouse().getWarehouseName() : "")).append(",")
              .append(escapeCsv(device.getPrincipal() != null ? device.getPrincipal().getRealName() : "")).append(",")
              .append(escapeCsv(device.getSupplier() != null ? device.getSupplier().getName() : "")).append(",")
              .append(device.getPurchaseDate()).append(",")
              .append(device.getWarrantyEnd()).append(",")
              .append(device.getCreateTime())
              .append("\n");
        }
        
        outputStream.write(sb.toString().getBytes("UTF-8"));
    }
    
    /**
     * 转义CSV字段
     * 
     * @param value 字段值
     * @return 转义后的值
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        
        // 如果包含逗号、换行或双引号，需要用双引号包裹
        if (value.contains(",") || value.contains("\n") || value.contains("\"") || value.contains("\r")) {
            // 将双引号替换为两个双引号
            value = value.replace("\"", "\"\"");
            return "\"" + value + "\"";
        }
        
        return value;
    }
}
