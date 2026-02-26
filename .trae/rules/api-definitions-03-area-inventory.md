/*
 * @file: api-definitions-03-area-inventory.md
 * @description: API接口定义 - 区域管理、库存管理模块
 * @author: 开发团队
 * @createTime: 2023-01-01
 * @updateTime: 2026-02-26
 * @version: 1.2
 */

# API接口定义 - 区域与库存管理模块

> 本文档是 [API接口定义索引](./api-definitions-index.md) 的一部分

## 7. 区域管理模块 (Area)

### 7.1 获取区域列表
- **请求路径**：`/areas`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | areaName | String | 否 | 区域名称 |
  | parentId | Long | 否 | 父区域ID |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 7.2 获取区域详情
- **请求路径**：`/areas/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 区域ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "areaName": "机房A",
      "parentId": null,
      "description": "机房A区域",
      "sortOrder": 1,
      "deviceCount": 10,
      "children": []
    },
    "code": 200
  }
  ```

### 7.3 创建区域
- **请求路径**：`/areas`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "areaName": "机房B",
    "parentId": null,
    "description": "机房B区域",
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
      "areaName": "机房B",
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 7.4 更新区域
- **请求路径**：`/areas/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 区域ID |
- **请求参数**：
  ```json
  {
    "areaName": "更新后的机房B",
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

### 7.5 删除区域
- **请求路径**：`/areas/{id}`
- **请求方法**：`DELETE`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 区域ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null,
    "code": 200
  }
  ```

### 7.6 批量删除区域
- **请求路径**：`/areas/batch`
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

### 7.7 获取区域树结构
- **请求路径**：`/areas/tree`
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
        "areaName": "机房A",
        "parentId": null,
        "deviceCount": 10,
        "children": [
          {
            "id": 3,
            "areaName": "机柜1",
            "parentId": 1,
            "deviceCount": 5,
            "children": []
          }
        ]
      },
      {
        "id": 2,
        "areaName": "机房B",
        "parentId": null,
        "deviceCount": 8,
        "children": []
      }
    ],
    "code": 200
  }
  ```

### 7.8 获取子区域列表
- **请求路径**：`/areas/children/{parentId}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | parentId | Long | 父区域ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": [
      {
        "id": 3,
        "areaName": "机柜1",
        "parentId": 1,
        "deviceCount": 5
      }
    ],
    "code": 200
  }
  ```

## 8. 库存管理模块 (Inventory)

### 8.1 入库管理

#### 8.1.1 生成入库单号
- **请求路径**：`/inbound/generate-number`
- **请求方法**：`GET`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "生成成功",
    "data": {
      "inboundNumber": "RKD202301010001"
    },
    "code": 200
  }
  ```

#### 8.1.2 保存设备入库记录
- **请求路径**：`/inbound`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "inboundNumber": "RKD202301010001",
    "deviceId": 1,
    "quantity": 5,
    "inboundDate": "2023-01-01",
    "operatorId": 1,
    "remark": "入库备注"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "保存成功",
    "data": {
      "id": 1,
      "inboundNumber": "RKD202301010001"
    },
    "code": 200
  }
  ```

#### 8.1.3 获取入库记录列表
- **请求路径**：`/inbound`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | inboundNumber | String | 否 | 入库单号 |
  | deviceId | Long | 否 | 设备ID |
  | deviceName | String | 否 | 设备名称 |
  | status | Integer | 否 | 状态(1:待审核, 2:已审核, 3:已完成) |
  | inboundDateStart | String | 否 | 入库日期起始 |
  | inboundDateEnd | String | 否 | 入库日期结束 |
  | operatorId | Long | 否 | 操作人ID |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

#### 8.1.4 获取入库记录详情
- **请求路径**：`/inbound/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 入库记录ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "inboundNumber": "RKD202301010001",
      "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "deviceName": "服务器"
      },
      "quantity": 5,
      "inboundDate": "2023-01-01",
      "operator": {
        "id": 1,
        "username": "admin"
      },
      "remark": "入库备注",
      "status": 1,
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 8.2 出库管理

#### 8.2.1 获取出库申请列表
- **请求路径**：`/outbound`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | outboundNumber | String | 否 | 出库单号 |
  | deviceId | Long | 否 | 设备ID |
  | deviceName | String | 否 | 设备名称 |
  | status | Integer | 否 | 状态(1:待提交, 2:待审核, 3:已通过, 4:已拒绝) |
  | applicantId | Long | 否 | 申请人ID |
  | applyDateStart | String | 否 | 申请日期起始 |
  | applyDateEnd | String | 否 | 申请日期结束 |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

#### 8.2.2 获取出库申请详情
- **请求路径**：`/outbound/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 出库记录ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "outboundNumber": "CKD202301010001",
      "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "deviceName": "服务器"
      },
      "quantity": 2,
      "outboundDate": "2023-01-01",
      "applicant": {
        "id": 1,
        "username": "admin"
      },
      "approver": null,
      "remark": "出库备注",
      "status": 2,
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

#### 8.2.3 创建出库申请
- **请求路径**：`/outbound`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "outboundNumber": "CKD202301010001",
    "deviceId": 1,
    "quantity": 2,
    "outboundDate": "2023-01-01",
    "remark": "出库备注"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 1,
      "outboundNumber": "CKD202301010001"
    },
    "code": 200
  }
  ```

#### 8.2.4 提交出库申请
- **请求路径**：`/outbound/{id}/submit`
- **请求方法**：`POST`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 出库记录ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "提交成功",
    "data": null,
    "code": 200
  }
  ```

#### 8.2.5 审批出库申请
- **请求路径**：`/outbound/{id}/approve`
- **请求方法**：`POST`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 出库记录ID |
- **请求参数**：
  ```json
  {
    "status": 3, /* 3:已通过, 4:已拒绝 */
    "remark": "审批备注"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "审批成功",
    "data": null,
    "code": 200
  }
  ```

---

**相关文档**：
- [返回索引](./api-definitions-index.md)
- [上一部分：设备管理](./api-definitions-02-device.md)
- [下一部分：维护与统计管理](./api-definitions-04-maintenance-remote-stats.md)

**文档版本**：1.2
**文档更新时间**：2026-02-26
**文档维护人**：开发团队
