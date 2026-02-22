package com.backend.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class ExcelUtils {
    
    public static <T> List<T> importExcel(MultipartFile file, Class<T> clazz) throws IOException {
        List<T> result = new ArrayList<>();
        
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                
                try {
                    T instance = clazz.getDeclaredConstructor().newInstance();
                    Field[] fields = clazz.getDeclaredFields();
                    
                    for (int j = 0; j < fields.length && j < row.getLastCellNum(); j++) {
                        Cell cell = row.getCell(j);
                        if (cell != null) {
                            Field field = fields[j];
                            field.setAccessible(true);
                            Object value = getCellValue(cell);
                            field.set(instance, value);
                        }
                    }
                    
                    result.add(instance);
                } catch (Exception e) {
                    throw new IOException("Failed to parse row " + (i + 1), e);
                }
            }
        }
        
        return result;
    }
    
    public static <T> byte[] exportExcel(List<T> data, String[] headers, String[] fieldNames) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Sheet1");
            
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            for (int i = 0; i < data.size(); i++) {
                Row row = sheet.createRow(i + 1);
                T item = data.get(i);
                
                for (int j = 0; j < fieldNames.length; j++) {
                    Cell cell = row.createCell(j);
                    try {
                        Field field = item.getClass().getDeclaredField(fieldNames[j]);
                        field.setAccessible(true);
                        Object value = field.get(item);
                        setCellValue(cell, value);
                    } catch (Exception e) {
                        cell.setBlank();
                    }
                }
            }
            
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private static Object getCellValue(Cell cell) {
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                }
                return cell.getNumericCellValue();
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }
    
    private static void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
        } else if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue(value.toString());
        }
    }
}