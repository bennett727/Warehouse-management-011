package com.backend.controller;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.backend.constants.ApiPathConstants;
import com.backend.service.ExcelExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Excel导出控制器
 * 提供服务端Excel导出功能
 *
 * @author Backend Team
 * @version 1.0
 * @since 2026-02-23
 */
@RestController
@RequestMapping(ApiPathConstants.ExcelApi.BASE)
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Excel导出", description = "服务端Excel导出功能")
public class ExcelExportController {

    private final ExcelExportService excelExportService;

    /**
     * 导出设备列表
     *
     * @param response HTTP响应对象
     * @throws IOException IO异常
     */
    @GetMapping(ApiPathConstants.ExcelApi.DEVICE_EXPORT)
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @Operation(summary = "导出设备列表", description = "导出所有设备信息到Excel文件")
    public void exportDevices(HttpServletResponse response) throws IOException {
        log.info("开始导出设备列表");

        // 模拟数据，实际应从数据库查询
        List<DeviceExportDto> data = generateMockDeviceData();

        excelExportService.exportExcel(
                response,
                data,
                DeviceExportDto.class,
                "设备列表",
                "设备信息"
        );
    }

    /**
     * 导出库存报表
     *
     * @param response HTTP响应对象
     * @throws IOException IO异常
     */
    @GetMapping(ApiPathConstants.ExcelApi.INVENTORY_EXPORT)
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @Operation(summary = "导出库存报表", description = "导出库存信息到Excel文件")
    public void exportInventory(HttpServletResponse response) throws IOException {
        log.info("开始导出库存报表");

        // 模拟数据，实际应从数据库查询
        List<InventoryExportDto> data = generateMockInventoryData();

        excelExportService.exportExcel(
                response,
                data,
                InventoryExportDto.class,
                "库存报表",
                "库存信息"
        );
    }

    /**
     * 导出综合报表（多工作表）
     *
     * @param response HTTP响应对象
     * @throws IOException IO异常
     */
    @GetMapping(ApiPathConstants.ExcelApi.COMPREHENSIVE_EXPORT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "导出综合报表", description = "导出包含多个工作表的综合报表")
    public void exportComprehensiveReport(HttpServletResponse response) throws IOException {
        log.info("开始导出综合报表");

        List<ExcelExportService.SheetData<?>> sheets = new ArrayList<>();

        // 设备信息工作表
        sheets.add(new ExcelExportService.SheetData<>(
                "设备信息",
                DeviceExportDto.class,
                generateMockDeviceData()
        ));

        // 库存信息工作表
        sheets.add(new ExcelExportService.SheetData<>(
                "库存信息",
                InventoryExportDto.class,
                generateMockInventoryData()
        ));

        excelExportService.exportExcelWithMultipleSheets(
                response,
                sheets,
                "综合报表"
        );
    }

    // ==================== DTO定义 ====================

    /**
     * 设备导出DTO
     */
    @Data
    public static class DeviceExportDto {
        @ExcelProperty("设备编号")
        @ColumnWidth(15)
        private String deviceCode;

        @ExcelProperty("设备名称")
        @ColumnWidth(20)
        private String deviceName;

        @ExcelProperty("设备类型")
        @ColumnWidth(15)
        private String deviceType;

        @ExcelProperty("制造商")
        @ColumnWidth(20)
        private String manufacturer;

        @ExcelProperty("型号")
        @ColumnWidth(15)
        private String model;

        @ExcelProperty("序列号")
        @ColumnWidth(20)
        private String serialNumber;

        @ExcelProperty("购买日期")
        @ColumnWidth(15)
        private LocalDate purchaseDate;

        @ExcelProperty("购买价格")
        @ColumnWidth(15)
        private BigDecimal purchasePrice;

        @ExcelProperty("存放位置")
        @ColumnWidth(20)
        private String location;

        @ExcelProperty("状态")
        @ColumnWidth(10)
        private String status;

        @ExcelProperty("创建时间")
        @ColumnWidth(20)
        private LocalDateTime createTime;
    }

    /**
     * 库存导出DTO
     */
    @Data
    public static class InventoryExportDto {
        @ExcelProperty("物料编号")
        @ColumnWidth(15)
        private String materialCode;

        @ExcelProperty("物料名称")
        @ColumnWidth(20)
        private String materialName;

        @ExcelProperty("规格型号")
        @ColumnWidth(15)
        private String specification;

        @ExcelProperty("单位")
        @ColumnWidth(10)
        private String unit;

        @ExcelProperty("库存数量")
        @ColumnWidth(15)
        private Integer quantity;

        @ExcelProperty("安全库存")
        @ColumnWidth(15)
        private Integer safetyStock;

        @ExcelProperty("存放位置")
        @ColumnWidth(20)
        private String location;

        @ExcelProperty("入库日期")
        @ColumnWidth(15)
        private LocalDate entryDate;

        @ExcelProperty("批次号")
        @ColumnWidth(20)
        private String batchNumber;

        @ExcelProperty("状态")
        @ColumnWidth(10)
        private String status;
    }

    // ==================== 模拟数据生成 ====================

    private List<DeviceExportDto> generateMockDeviceData() {
        List<DeviceExportDto> list = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            DeviceExportDto dto = new DeviceExportDto();
            dto.setDeviceCode("DEV" + String.format("%04d", i));
            dto.setDeviceName("测试设备" + i);
            dto.setDeviceType("电子设备");
            dto.setManufacturer("测试制造商");
            dto.setModel("MODEL-" + i);
            dto.setSerialNumber("SN" + System.currentTimeMillis() + i);
            dto.setPurchaseDate(LocalDate.now().minusMonths(i));
            dto.setPurchasePrice(new BigDecimal("10000.00").multiply(new BigDecimal(i)));
            dto.setLocation("仓库A-" + i + "区");
            dto.setStatus(i % 2 == 0 ? "正常" : "维修中");
            dto.setCreateTime(LocalDateTime.now().minusDays(i));
            list.add(dto);
        }
        return list;
    }

    private List<InventoryExportDto> generateMockInventoryData() {
        List<InventoryExportDto> list = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            InventoryExportDto dto = new InventoryExportDto();
            dto.setMaterialCode("MAT" + String.format("%04d", i));
            dto.setMaterialName("测试物料" + i);
            dto.setSpecification("规格" + i);
            dto.setUnit("个");
            dto.setQuantity(100 + i * 10);
            dto.setSafetyStock(50);
            dto.setLocation("货架" + i);
            dto.setEntryDate(LocalDate.now().minusDays(i));
            dto.setBatchNumber("BATCH" + System.currentTimeMillis() + i);
            dto.setStatus(i % 3 == 0 ? "预警" : "正常");
            list.add(dto);
        }
        return list;
    }
}
