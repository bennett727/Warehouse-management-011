# 仓库管理系统 API 文档

## 概述

本文档描述了仓库管理系统(WMS)的所有API接口，包括设备管理、库存管理、用户管理等核心功能。

## 基础信息

- **基础URL**: `http://localhost:8080/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证说明

所有需要认证的API请求都需要在请求头中包含JWT Token：

```http
Authorization: Bearer <token>
```

### 获取Token

**端点**: `POST /auth/login`

**请求体**:
```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

## 设备管理 API

### 获取设备列表

**端点**: `GET /devices`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |
| search | String | 否 | 搜索关键字 |
| status | String | 否 | 设备状态 |
| warehouseId | Long | 否 | 仓库ID |
| deviceTypeId | Long | 否 | 设备类型ID |

**响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "id": 1,
        "deviceCode": "DEV001",
        "deviceName": "测试设备1",
        "status": "AVAILABLE",
        "warehouse": {
          "id": 1,
          "warehouseName": "主仓库"
        },
        "deviceType": {
          "id": 1,
            "typeName": "电子设备"
        }
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "number": 0,
    "size": 10
  }
}
```

### 创建设备

**端点**: `POST /devices`

**权限**: `ADMIN`, `OPERATOR`

**请求体**:
```json
{
  "deviceCode": "DEV002",
  "deviceName": "新设备",
  "deviceTypeId": 1,
  "warehouseId": 1,
  "binId": 1,
  "status": "AVAILABLE",
  "purchaseDate": "2024-01-01",
  "price": 1000.00,
  "remark": "备注信息"
}
```

### 更新设备

**端点**: `PUT /devices/{id}`

**权限**: `ADMIN`, `OPERATOR`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 设备ID |

**请求体**: 同创建设备

### 删除设备

**端点**: `DELETE /devices/{id}`

**权限**: `ADMIN`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 设备ID |

### 获取设备历史记录

**端点**: `GET /devices/{id}/history`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 设备ID |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recordType": "INSTALLATION",
      "operationTime": "2024-01-01T10:00:00",
      "operator": "admin",
      "details": "设备安装到主仓库"
    }
  ]
}
```

## 库存管理 API

### 获取库存列表

**端点**: `GET /inventory`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |
| warehouseId | Long | 否 | 仓库ID |
| binId | Long | 否 | 货位ID |
| deviceCode | String | 否 | 设备编码 |

### 获取入库单列表

**端点**: `GET /stock/orders/inbound/list`

**权限**: `ADMIN`, `OPERATOR`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |
| status | String | 否 | 订单状态 |

### 创建入库单

**端点**: `POST /stock/orders/inbound`

**权限**: `ADMIN`, `OPERATOR`

**请求体**:
```json
{
  "orderNumber": "INB20240101001",
  "supplierId": 1,
  "warehouseId": 1,
  "items": [
    {
      "deviceCode": "DEV001",
      "quantity": 10,
      "price": 1000.00
    }
  ],
  "remark": "备注信息"
}
```

### 获取出库单列表

**端点**: `GET /stock/orders/outbound/list`

**权限**: `ADMIN`, `OPERATOR`

**查询参数**: 同入库单

### 创建出库单

**端点**: `POST /stock/orders/outbound`

**权限**: `ADMIN`, `OPERATOR`

**请求体**:
```json
{
  "orderNumber": "OUT20240101001",
  "warehouseId": 1,
  "items": [
    {
      "deviceCode": "DEV001",
      "quantity": 5
    }
  ],
  "remark": "备注信息"
}
```

## 仓库管理 API

### 获取仓库列表

**端点**: `GET /warehouses`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |

### 创建仓库

**端点**: `POST /warehouses`

**权限**: `ADMIN`

**请求体**:
```json
{
  "warehouseName": "新仓库",
  "warehouseCode": "WH001",
  "address": "仓库地址",
  "contactPerson": "联系人",
  "contactPhone": "联系电话",
  "remark": "备注信息"
}
```

### 获取货位列表

**端点**: `GET /bins`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| warehouseId | Long | 否 | 仓库ID |
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |

## 供应商管理 API

### 获取供应商列表

**端点**: `GET /suppliers`

**权限**: `ADMIN`, `OPERATOR`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |
| search | String | 否 | 搜索关键字 |

### 创建供应商

**端点**: `POST /suppliers`

**权限**: `ADMIN`

**请求体**:
```json
{
  "supplierName": "供应商名称",
  "supplierCode": "SUP001",
  "contactPerson": "联系人",
  "contactPhone": "联系电话",
  "address": "地址",
  "email": "email@example.com",
  "remark": "备注信息"
}
```

## 安装记录 API

### 获取安装记录列表

**端点**: `GET /installations/list`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |
| deviceId | Long | 否 | 设备ID |

### 创建安装记录

**端点**: `POST /installations`

**权限**: `ADMIN`, `OPERATOR`

**请求体**:
```json
{
  "deviceId": 1,
  "warehouseId": 1,
  "binId": 1,
  "installDate": "2024-01-01",
  "operator": "admin",
  "remark": "安装备注"
}
```

## 维修记录 API

### 获取维修记录列表

**端点**: `GET /maintenance/list`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |
| deviceId | Long | 否 | 设备ID |
| status | String | 否 | 维修状态 |

### 创建维修记录

**端点**: `POST /maintenance`

**权限**: `ADMIN`, `OPERATOR`

**请求体**:
```json
{
  "deviceId": 1,
  "faultDescription": "故障描述",
  "repairDate": "2024-01-01",
  "operator": "admin",
  "remark": "维修备注"
}
```

## 用户管理 API

### 获取用户列表

**端点**: `GET /users`

**权限**: `ADMIN`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认0 |
| size | Integer | 否 | 每页大小，默认10 |

### 创建用户

**端点**: `POST /users`

**权限**: `ADMIN`

**请求体**:
```json
{
  "username": "newuser",
  "password": "Password@123",
  "realName": "真实姓名",
  "email": "email@example.com",
  "phone": "联系电话",
  "role": "OPERATOR"
}
```

### 更新用户

**端点**: `PUT /users/{id}`

**权限**: `ADMIN`

### 删除用户

**端点**: `DELETE /users/{id}`

**权限**: `ADMIN`

## 系统管理 API

### 获取设备类型列表

**端点**: `GET /device-types`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

### 创建设备类型

**端点**: `POST /device-types`

**权限**: `ADMIN`

### 获取区域列表

**端点**: `GET /areas`

**权限**: `ADMIN`, `OPERATOR`, `TECHNICIAN`

### 创建区域

**端点**: `POST /areas`

**权限**: `ADMIN`

## 错误响应

所有API在出错时会返回统一的错误格式：

```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE",
  "data": null
}
```

### 常见错误码

| HTTP状态码 | 错误码 | 说明 |
|-----------|--------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未认证或Token无效 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | NOT_FOUND | 资源不存在 |
| 422 | VALIDATION_ERROR | 数据验证失败 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |

## 分页规范

所有列表查询API都支持分页，分页参数如下：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | Integer | 0 | 页码（从0开始） |
| size | Integer | 10 | 每页大小（最大100） |

分页响应格式：

```json
{
  "success": true,
  "data": {
    "content": [],           // 数据列表
    "totalElements": 100,    // 总记录数
    "totalPages": 10,        // 总页数
    "number": 0,             // 当前页码
    "size": 10,              // 每页大小
    "first": true,           // 是否第一页
    "last": false            // 是否最后一页
  }
}
```

## 数据验证规则

### 设备数据验证

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| deviceCode | String | 是 | 长度1-50，唯一 |
| deviceName | String | 是 | 长度1-100 |
| deviceTypeId | Long | 是 | 必须存在 |
| warehouseId | Long | 是 | 必须存在 |
| binId | Long | 否 | 必须存在 |
| status | String | 否 | 枚举值 |
| price | BigDecimal | 否 | 必须≥0 |

### 仓库数据验证

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| warehouseName | String | 是 | 长度1-100 |
| warehouseCode | String | 是 | 长度1-50，唯一 |
| contactPhone | String | 否 | 手机号格式 |

## 性能优化建议

1. **分页查询**: 始终使用分页参数，避免一次性查询大量数据
2. **字段过滤**: 使用查询参数过滤不需要的数据
3. **缓存策略**: 对频繁访问的数据使用缓存
4. **批量操作**: 使用批量API减少请求次数

## 安全建议

1. **HTTPS**: 生产环境必须使用HTTPS
2. **Token管理**: Token应定期刷新，不要存储在localStorage
3. **输入验证**: 所有输入数据必须进行验证
4. **权限控制**: 严格遵循RBAC权限模型

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2024-01-01 | 初始版本 |
| 1.1.0 | 2024-02-12 | 新增设备历史记录API |

## 联系方式

- **技术支持**: tech.support@example.com
- **问题反馈**: 通过GitHub Issues提交

---

**文档版本**: 1.1.0
**最后更新**: 2026-02-12
**维护人员**: 开发团队
