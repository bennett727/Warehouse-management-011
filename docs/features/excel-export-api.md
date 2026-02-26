# 服务端Excel导出API使用文档

## 概述

本系统提供服务端Excel导出功能，使用阿里巴巴EasyExcel库实现高性能、低内存占用的Excel导出。

## 技术栈

- **后端**: Spring Boot + EasyExcel 4.0.3
- **前端**: Vue 3 + Element Plus
- **协议**: RESTful API

## 后端API

### 1. 导出设备列表

**接口**: `GET /api/excel/devices/export`

**权限**: ADMIN 或 OPERATOR

**响应**: Excel文件流 (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**示例**:
```bash
curl -X GET "http://localhost:8080/api/excel/devices/export" \
  -H "Authorization: Bearer {token}" \
  -o "设备列表.xlsx"
```

### 2. 导出库存报表

**接口**: `GET /api/excel/inventory/export`

**权限**: ADMIN 或 OPERATOR

**响应**: Excel文件流

**示例**:
```bash
curl -X GET "http://localhost:8080/api/excel/inventory/export" \
  -H "Authorization: Bearer {token}" \
  -o "库存报表.xlsx"
```

### 3. 导出综合报表（多工作表）

**接口**: `GET /api/excel/comprehensive/export`

**权限**: ADMIN

**响应**: Excel文件流（包含多个工作表）

**示例**:
```bash
curl -X GET "http://localhost:8080/api/excel/comprehensive/export" \
  -H "Authorization: Bearer {token}" \
  -o "综合报表.xlsx"
```

## 前端使用

### 组件导入

```vue
<template>
  <ExcelExport :allowed-types="['devices', 'inventory']" />
</template>

<script setup>
import ExcelExport from '@/components/ExcelExport/index.vue';
</script>
```

### API调用

```javascript
import { exportDevices, exportInventory, handleExcelExport } from '@/api/excelExport';

// 导出设备列表
async function downloadDevices() {
  try {
    const response = await exportDevices();
    await handleExcelExport(response, '设备列表.xlsx');
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message);
  }
}
```

## 数据格式

### 设备导出字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| deviceCode | String | 设备编号 |
| deviceName | String | 设备名称 |
| deviceType | String | 设备类型 |
| manufacturer | String | 制造商 |
| model | String | 型号 |
| serialNumber | String | 序列号 |
| purchaseDate | LocalDate | 购买日期 |
| purchasePrice | BigDecimal | 购买价格 |
| location | String | 存放位置 |
| status | String | 状态 |
| createTime | LocalDateTime | 创建时间 |

### 库存导出字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| materialCode | String | 物料编号 |
| materialName | String | 物料名称 |
| specification | String | 规格型号 |
| unit | String | 单位 |
| quantity | Integer | 库存数量 |
| safetyStock | Integer | 安全库存 |
| location | String | 存放位置 |
| entryDate | LocalDate | 入库日期 |
| batchNumber | String | 批次号 |
| status | String | 状态 |

## 安全特性

1. **权限控制**: 基于Spring Security的RBAC权限控制
2. **文件名安全**: 自动添加时间戳，URL编码处理
3. **响应头设置**: 正确的Content-Type和Content-Disposition
4. **缓存控制**: 禁用缓存，防止敏感数据泄露
5. **超时设置**: 前端请求超时60秒

## 性能优化

1. **EasyExcel优势**:
   - 内存占用低（默认10MB内存可处理百万级数据）
   - 写入速度快
   - 支持流式写入

2. **自动列宽**: 使用`LongestMatchColumnWidthStyleStrategy`自动调整列宽

3. **多工作表**: 支持单个Excel文件包含多个工作表

## 扩展开发

### 添加新的导出类型

1. **创建DTO类**:
```java
@Data
public class CustomExportDto {
    @ExcelProperty("字段名")
    @ColumnWidth(15)
    private String fieldName;
}
```

2. **添加Controller方法**:
```java
@GetMapping(ApiPathConstants.ExcelApi.CUSTOM_EXPORT)
@PreAuthorize("hasRole('ADMIN')")
public void exportCustom(HttpServletResponse response) throws IOException {
    List<CustomExportDto> data = fetchDataFromDatabase();
    excelExportService.exportExcel(response, data, CustomExportDto.class, "自定义报表", "数据");
}
```

3. **添加前端API**:
```javascript
export function exportCustom() {
  return request({
    url: EXCEL_API.CUSTOM_EXPORT,
    method: 'get',
    responseType: 'blob',
    timeout: 60000
  });
}
```

## 注意事项

1. **大数据量**: 对于超大数据量（百万级），建议使用分页导出或异步导出
2. **内存限制**: 虽然EasyExcel内存占用低，但仍需注意服务器内存配置
3. **超时设置**: 根据数据量调整前端超时时间
4. **文件名编码**: 自动处理中文文件名编码问题

## 故障排查

### 导出失败

1. 检查用户权限
2. 检查网络连接
3. 查看后端日志
4. 确认数据量是否过大

### 文件损坏

1. 检查响应头设置
2. 确认ExcelWriter正确关闭
3. 检查文件编码

## 版本历史

- **v1.0** (2026-02-23): 初始版本，支持设备、库存、综合报表导出
