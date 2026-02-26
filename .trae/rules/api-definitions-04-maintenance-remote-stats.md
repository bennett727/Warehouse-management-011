/*
 * @file: api-definitions-04-maintenance-remote-stats.md
 * @description: API接口定义 - 维护管理、远程账号管理、设备统计模块
 * @author: 开发团队
 * @createTime: 2023-01-01
 * @updateTime: 2026-02-26
 * @version: 1.2
 */

# API接口定义 - 维护与统计管理模块

> 本文档是 [API接口定义索引](./api-definitions-index.md) 的一部分

## 9. 维护管理模块 (Maintenance)

### 9.1 生成维修单号
- **请求路径**：`/maintenance/generate-number`
- **请求方法**：`GET`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "生成成功",
    "data": {
      "maintenanceNumber": "WXDH202301010001"
    },
    "code": 200
  }
  ```

### 9.2 保存维护记录
- **请求路径**：`/maintenance`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "maintenanceNumber": "WXDH202301010001",
    "deviceId": 1,
    "maintenanceType": 1, /* 1:日常维护, 2:故障维修 */
    "maintenanceDate": "2023-01-01",
    "maintenancePerson": "维修人员",
    "content": "维护内容",
    "result": "维护结果",
    "cost": 100.00,
    "status": 1 /* 1:待维护, 2:维护中, 3:已完成 */
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "保存成功",
    "data": {
      "id": 1,
      "maintenanceNumber": "WXDH202301010001"
    },
    "code": 200
  }
  ```

### 9.3 批量保存维护记录
- **请求路径**：`/maintenance/batch`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "records": [
      {
        "maintenanceNumber": "WXDH202301010001",
        "deviceId": 1,
        "maintenanceType": 1,
        "maintenanceDate": "2023-01-01"
      },
      {
        "maintenanceNumber": "WXDH202301010002",
        "deviceId": 2,
        "maintenanceType": 2,
        "maintenanceDate": "2023-01-01"
      }
    ]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "批量保存成功",
    "data": {
      "successCount": 2,
      "failCount": 0
    },
    "code": 200
  }
  ```

### 9.4 更新维护记录
- **请求路径**：`/maintenance/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 维护记录ID |
- **请求参数**：
  ```json
  {
    "maintenancePerson": "更新后的维修人员",
    "content": "更新后的维护内容",
    "result": "更新后的维护结果",
    "cost": 200.00,
    "status": 2
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

### 9.5 获取维护记录列表
- **请求路径**：`/maintenance`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | maintenanceNumber | String | 否 | 维护单号 |
  | deviceId | Long | 否 | 设备ID |
  | deviceName | String | 否 | 设备名称 |
  | maintenanceType | Integer | 否 | 维护类型 |
  | status | Integer | 否 | 状态 |
  | maintenanceDateStart | String | 否 | 维护日期起始 |
  | maintenanceDateEnd | String | 否 | 维护日期结束 |
  | maintenancePerson | String | 否 | 维护人员 |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 9.6 获取设备维护历史
- **请求路径**：`/maintenance/device/{deviceId}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | deviceId | Long | 设备ID |
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | maintenanceType | Integer | 否 | 维护类型 |
  | status | Integer | 否 | 状态 |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": [
      {
        "id": 1,
        "maintenanceNumber": "WXDH202301010001",
        "maintenanceType": 1,
        "maintenanceDate": "2023-01-01",
        "maintenancePerson": "维修人员",
        "status": 3
      }
    ],
    "code": 200
  }
  ```

### 9.7 完成维护操作
- **请求路径**：`/maintenance/{id}/complete`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 维护记录ID |
- **请求参数**：
  ```json
  {
    "result": "维护完成结果",
    "cost": 150.00
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "维护完成",
    "data": null,
    "code": 200
  }
  ```

## 10. 远程账号管理模块 (RemoteAccount)

### 10.1 获取远程账号列表
- **请求路径**：`/remote-accounts`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | deviceId | Long | 否 | 设备ID |
  | accountName | String | 否 | 账号名称 |
  | ipAddress | String | 否 | IP地址 |
  | protocol | String | 否 | 协议类型(SSH, RDP等) |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 10.2 获取远程账号详情
- **请求路径**：`/remote-accounts/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 远程账号ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "deviceId": 1,
      "deviceName": "服务器",
      "accountName": "admin",
      "password": "********", /* 密码脱敏显示 */
      "ipAddress": "192.168.1.100",
      "port": 22,
      "protocol": "SSH",
      "remark": "远程账号备注",
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 10.3 创建远程账号
- **请求路径**：`/remote-accounts`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "deviceId": 1,
    "accountName": "admin",
    "password": "password123",
    "ipAddress": "192.168.1.100",
    "port": 22,
    "protocol": "SSH",
    "remark": "远程账号备注"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 1,
      "deviceId": 1,
      "accountName": "admin"
    },
    "code": 200
  }
  ```

### 10.4 更新远程账号
- **请求路径**：`/remote-accounts/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 远程账号ID |
- **请求参数**：
  ```json
  {
    "accountName": "updateadmin",
    "password": "newpassword123",
    "ipAddress": "192.168.1.101",
    "port": 2222,
    "protocol": "SSH",
    "remark": "更新后的备注"
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

### 10.5 删除远程账号
- **请求路径**：`/remote-accounts/{id}`
- **请求方法**：`DELETE`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 远程账号ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null,
    "code": 200
  }
  ```

### 10.6 批量删除远程账号
- **请求路径**：`/remote-accounts/batch`
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

## 11. 设备统计模块 (Device Statistics)

### 11.1 获取设备整体统计信息
- **请求路径**：`/device-statistics`
- **请求方法**：`GET`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "totalDevices": 100,
      "normalDevices": 85,
      "faultDevices": 10,
      "maintainingDevices": 5,
      "deviceStatusDistribution": [
        { "status": 1, "count": 85, "statusName": "正常" },
        { "status": 2, "count": 10, "statusName": "故障" },
        { "status": 3, "count": 5, "statusName": "维修中" }
      ]
    },
    "code": 200
  }
  ```

### 11.2 获取特定区域设备统计信息
- **请求路径**：`/device-statistics/by-area/{areaId}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | areaId | Long | 区域ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "areaId": 1,
      "areaName": "机房A",
      "totalDevices": 50,
      "normalDevices": 42,
      "faultDevices": 5,
      "maintainingDevices": 3,
      "deviceStatusDistribution": [
        { "status": 1, "count": 42, "statusName": "正常" },
        { "status": 2, "count": 5, "statusName": "故障" },
        { "status": 3, "count": 3, "statusName": "维修中" }
      ]
    },
    "code": 200
  }
  ```

---

**相关文档**：
- [返回索引](./api-definitions-index.md)
- [上一部分：区域与库存管理](./api-definitions-03-area-inventory.md)

**文档版本**：1.2
**文档更新时间**：2026-02-26
**文档维护人**：开发团队
