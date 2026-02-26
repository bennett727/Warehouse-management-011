/*
 * @file: api-definitions-02-device.md
 * @description: API接口定义 - 设备管理、设备类型管理模块
 * @author: 开发团队
 * @createTime: 2023-01-01
 * @updateTime: 2026-02-26
 * @version: 1.2
 */

# API接口定义 - 设备管理模块

> 本文档是 [API接口定义索引](./api-definitions-index.md) 的一部分

## 5. 设备管理模块 (Device)

### 5.1 获取设备列表
- **请求路径**：`/devices`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | deviceCode | String | 否 | 设备编码 |
  | deviceName | String | 否 | 设备名称 |
  | deviceTypeId | Long | 否 | 设备类型ID |
  | areaId | Long | 否 | 区域ID |
  | status | Integer | 否 | 设备状态(1:正常, 2:故障, 3:维修中, 4:报废) |
  | manufacturer | String | 否 | 制造商 |
  | model | String | 否 | 设备型号 |
  | purchaseDateStart | String | 否 | 购买日期起始(格式: yyyy-MM-dd) |
  | purchaseDateEnd | String | 否 | 购买日期结束(格式: yyyy-MM-dd) |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 5.2 获取设备详情
- **请求路径**：`/devices/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "deviceCode": "DEV001",
      "deviceName": "服务器",
      "deviceTypeId": 1,
      "areaId": 1,
      "status": 1,
      "purchaseDate": "2023-01-01T00:00:00Z",
      "warrantyPeriod": 12,
      "price": 10000.00,
      "manufacturer": "华为",
      "model": "RH2288H V5",
      "description": "高性能服务器",
      "createTime": "2023-01-01T12:00:00Z",
      "updateTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 5.3 创建设备
- **请求路径**：`/devices`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "deviceCode": "DEV002",
    "deviceName": "交换机",
    "deviceTypeId": 2,
    "areaId": 1,
    "status": 1,
    "purchaseDate": "2023-01-01",
    "warrantyPeriod": 12,
    "price": 5000.00,
    "manufacturer": "华为",
    "model": "S5700-28C-EI",
    "description": "企业级交换机"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 2,
      "deviceCode": "DEV002",
      "deviceName": "交换机",
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 5.4 更新设备
- **请求路径**：`/devices/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备ID |
- **请求参数**：
  ```json
  {
    "deviceName": "更新后的交换机",
    "status": 2,
    "description": "更新后的描述"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": null,
    "code": 200
  }
  ```

### 5.5 删除设备
- **请求路径**：`/devices/{id}`
- **请求方法**：`DELETE`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null,
    "code": 200
  }
  ```

### 5.6 批量删除设备
- **请求路径**：`/devices/batch`
- **请求方法**：`DELETE`
- **请求参数**：
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "批量删除成功",
    "data": null,
    "code": 200
  }
  ```

### 5.7 更新设备状态
- **请求路径**：`/devices/{id}/status`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备ID |
- **请求参数**：
  ```json
  {
    "status": 2 /* 1:正常, 2:故障, 3:维修中, 4:报废 */
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "状态更新成功",
    "data": null,
    "code": 200
  }
  ```

### 5.8 标记设备为故障
- **请求路径**：`/devices/mark-faulty`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "id": 1,
    "faultDescription": "设备无法正常启动"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "设备已标记为故障",
    "data": null,
    "code": 200
  }
  ```

### 5.9 批量标记设备为故障
- **请求路径**：`/devices/batch-mark-faulty`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "ids": [1, 2, 3],
    "faultDescription": "批量故障标记"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "批量标记故障成功",
    "data": null,
    "code": 200
  }
  ```

### 5.10 开始维修设备
- **请求路径**：`/devices/{id}/repair/start`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备ID |
- **请求参数**：
  ```json
  {
    "repairPerson": "维修人员",
    "repairDescription": "开始维修"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "开始维修成功",
    "data": null,
    "code": 200
  }
  ```

### 5.11 完成维修设备
- **请求路径**：`/devices/{id}/repair/complete`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备ID |
- **请求参数**：
  ```json
  {
    "repairResult": "维修完成",
    "cost": 100.00
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "维修完成成功",
    "data": null,
    "code": 200
  }
  ```

### 5.12 导入设备数据
- **请求路径**：`/devices/import`
- **请求方法**：`POST`
- **请求参数**：
  - `file`：MultipartFile，Excel文件
- **响应数据**：同用户导入

### 5.13 导出设备数据
- **请求路径**：`/devices/export`
- **请求方法**：`GET`
- **请求参数**：同获取设备列表
- **响应数据**：Excel文件流

### 5.14 根据区域获取设备列表
- **请求路径**：`/devices/by-area/{areaId}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | areaId | Long | 区域ID |
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | status | Integer | 否 | 设备状态 |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": [
      {
        "id": 1,
        "deviceCode": "DEV001",
        "deviceName": "服务器",
        "status": 1
      }
    ],
    "code": 200
  }
  ```

## 6. 设备类型管理模块 (DeviceType)

### 6.1 获取设备类型列表
- **请求路径**：`/device-types`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | typeName | String | 否 | 类型名称 |
  | parentId | Long | 否 | 父类型ID |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 6.2 获取设备类型详情
- **请求路径**：`/device-types/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备类型ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "typeName": "服务器",
      "parentId": null,
      "description": "服务器设备类型",
      "sortOrder": 1,
      "children": []
    },
    "code": 200
  }
  ```

### 6.3 添加设备类型
- **请求路径**：`/device-types`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "typeName": "网络设备",
    "parentId": null,
    "description": "网络设备类型",
    "sortOrder": 2
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 2,
      "typeName": "网络设备",
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 6.4 更新设备类型
- **请求路径**：`/device-types/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备类型ID |
- **请求参数**：
  ```json
  {
    "typeName": "更新后的网络设备",
    "description": "更新后的描述",
    "sortOrder": 3
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": null,
    "code": 200
  }
  ```

### 6.5 删除设备类型
- **请求路径**：`/device-types/{id}`
- **请求方法**：`DELETE`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 设备类型ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null,
    "code": 200
  }
  ```

### 6.6 批量删除设备类型
- **请求路径**：`/device-types/batch`
- **请求方法**：`DELETE`
- **请求参数**：
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "批量删除成功",
    "data": null,
    "code": 200
  }
  ```

### 6.7 获取设备类型树结构
- **请求路径**：`/device-types/tree`
- **请求方法**：`GET`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": [
      {
        "id": 1,
        "typeName": "服务器",
        "parentId": null,
        "children": [
          {
            "id": 3,
            "typeName": "机架式服务器",
            "parentId": 1,
            "children": []
          }
        ]
      },
      {
        "id": 2,
        "typeName": "网络设备",
        "parentId": null,
        "children": []
      }
    ],
    "code": 200
  }
  ```

---

**相关文档**：
- [返回索引](./api-definitions-index.md)
- [上一部分：认证与用户管理](./api-definitions-01-auth-user-role.md)
- [下一部分：区域与库存管理](./api-definitions-03-area-inventory.md)

**文档版本**：1.2
**文档更新时间**：2026-02-26
**文档维护人**：开发团队
