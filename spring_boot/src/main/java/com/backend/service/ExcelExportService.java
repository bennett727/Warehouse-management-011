package com.backend.service;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.write.metadata.WriteSheet;
import com.alibaba.excel.write.style.column.LongestMatchColumnWidthStyleStrategy;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Excel导出服务
 * 使用EasyExcel实现高性能Excel导出
 *
 * @author Backend Team
 * @version 1.0
 * @since 2026-02-23
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelExportService {

    /**
     * 导出Excel文件
     *
     * @param response HTTP响应对象
     * @param data 数据列表
     * @param clazz 数据类型Class
     * @param fileName 文件名（不含扩展名）
     * @param sheetName 工作表名称
     * @param <T> 数据类型
     * @throws IOException IO异常
     */
    public <T> void exportExcel(HttpServletResponse response,
                                List<T> data,
                                Class<T> clazz,
                                String fileName,
                                String sheetName) throws IOException {
        // 设置响应头
        setResponseHeader(response, fileName);

        // 写入Excel
        EasyExcel.write(response.getOutputStream(), clazz)
                .sheet(sheetName)
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                .doWrite(data);

        log.info("Excel导出成功: fileName={}, sheetName={}, dataSize={}",
                fileName, sheetName, data.size());
    }

    /**
     * 导出Excel文件（多工作表）
     *
     * @param response HTTP响应对象
     * @param sheets 工作表数据列表
     * @param fileName 文件名（不含扩展名）
     * @throws IOException IO异常
     */
    public void exportExcelWithMultipleSheets(HttpServletResponse response,
                                              List<SheetData<?>> sheets,
                                              String fileName) throws IOException {
        // 设置响应头
        setResponseHeader(response, fileName);

        // 创建ExcelWriter
        ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build();

        try {
            // 写入多个工作表
            for (int i = 0; i < sheets.size(); i++) {
                SheetData<?> sheetData = sheets.get(i);
                WriteSheet writeSheet = EasyExcel.writerSheet(i, sheetData.getSheetName())
                        .head(sheetData.getClazz())
                        .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                        .build();

                excelWriter.write(sheetData.getData(), writeSheet);
            }
        } finally {
            // 关闭writer
            if (excelWriter != null) {
                excelWriter.finish();
            }
        }

        log.info("多工作表Excel导出成功: fileName={}, sheetCount={}",
                fileName, sheets.size());
    }

    /**
     * 设置HTTP响应头
     *
     * @param response HTTP响应对象
     * @param fileName 文件名
     */
    private void setResponseHeader(HttpServletResponse response, String fileName) {
        // 添加时间戳到文件名
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fullFileName = fileName + "_" + timestamp + ".xlsx";

        // URL编码文件名
        String encodedFileName = URLEncoder.encode(fullFileName, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        // 设置响应头
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment;filename=" + encodedFileName);
        response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

        // 禁用缓存
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
    }

    /**
     * 工作表数据封装类
     */
    public static class SheetData<T> {
        private final String sheetName;
        private final Class<T> clazz;
        private final List<T> data;

        public SheetData(String sheetName, Class<T> clazz, List<T> data) {
            this.sheetName = sheetName;
            this.clazz = clazz;
            this.data = data;
        }

        public String getSheetName() {
            return sheetName;
        }

        public Class<T> getClazz() {
            return clazz;
        }

        public List<T> getData() {
            return data;
        }
    }
}
