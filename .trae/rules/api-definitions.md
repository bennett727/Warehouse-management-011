# 仓库管理系统API接口定义文档

## 1. 通用规则

### 1.1 响应格式
所有API接口返回统一的响应格式：

```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": { /* 返回数据 */ },
  "code": 200 /* 状态码 */
}
```

### 1.2 分页响应格式
分页接口返回统一的分页响应格式：

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "records": [ /* 数据列表 */ ],
    "total": 100, /* 总记录数 */
    "size": 10, /* 每页大小 */
    "current": 1, /* 当前页码 */
    "pages": 10 /* 总页数 */
  },
  "code": 200
}
```

### 1.3 错误码定义
| 错误码 | 描述 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 接口未实现 |

### 1.4 认证方式
使用Bearer Token认证，在请求头中添加：
```
Authorization: Bearer {token}
```

## 2. 认证授权模块 (Auth)

### 2.1 登录
- **请求路径**：`/auth/login`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "username": "admin",
    "password": "123456",
    "captcha": "ABCD" /* 可选 */
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiredTime": 1628985600000,
      "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "roles": ["ADMIN"],
        "permissions": ["user:list", "device:list"]
      }
    },
    "code": 200
  }
  ```

### 2.2 注册
- **请求路径**：`/auth/register`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "username": "newuser",
    "password": "123456",
    "email": "newuser@example.com",
    "phone": "13800138000"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "注册成功，等待管理员审核",
    "data": null,
    "code": 200
  }
  ```

### 2.3 登出
- **请求路径**：`/auth/logout`
- **请求方法**：`POST`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "登出成功",
    "data": null,
    "code": 200
  }
  ```

### 2.4 获取当前用户信息
- **请求路径**：`/auth/me`
- **请求方法**：`GET`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "获取成功",
    "data": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "phone": "13800138000",
      "roles": ["ADMIN"],
      "permissions": ["user:list", "device:list", "device:create"],
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 2.5 刷新令牌
- **请求路径**：`/auth/refresh`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "令牌刷新成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiredTime": 1628985600000
    },
    "code": 200
  }
  ```

### 2.6 重置密码
- **请求路径**：`/auth/reset-password`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "重置密码链接已发送到您的邮箱",
    "data": null,
    "code": 200
  }
  ```

### 2.7 验证令牌
- **请求路径**：`/auth/validate`
- **请求方法**：`GET`
- **请求参数**：无
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "令牌有效",
    "data": null,
    "code": 200
  }
  ```

## 3. 用户管理模块 (User)

### 3.1 获取用户列表
- **请求路径**：`/users`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | keyword | String | 否 | 搜索关键词 |
  | status | Integer | 否 | 用户状态(0:禁用, 1:启用) |
  | roleId | Long | 否 | 角色ID |
  | createTimeStart | String | 否 | 创建时间起始(格式: yyyy-MM-dd HH:mm:ss) |
  | createTimeEnd | String | 否 | 创建时间结束(格式: yyyy-MM-dd HH:mm:ss) |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 3.2 获取用户详情
- **请求路径**：`/users/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 用户ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "phone": "13800138000",
      "status": 1,
      "roles": [{
        "id": 1,
        "name": "ADMIN",
        "description": "系统管理员"
      }],
      "permissions": ["user:list", "device:list", "device:create"],
      "createTime": "2023-01-01T12:00:00Z",
      "updateTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 3.3 创建用户
- **请求路径**：`/users`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "username": "newuser",
    "password": "123456",
    "email": "newuser@example.com",
    "phone": "13800138000",
    "status": 1,
    "roleIds": [1, 2]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 2,
      "username": "newuser",
      "email": "newuser@example.com",
      "phone": "13800138000",
      "status": 1,
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 3.4 更新用户
- **请求路径**：`/users/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 用户ID |
- **请求参数**：
  ```json
  {
    "email": "updateuser@example.com",
    "phone": "13800138001",
    "status": 1,
    "roleIds": [1]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": {
      "id": 2,
      "username": "newuser",
      "email": "updateuser@example.com",
      "phone": "13800138001",
      "status": 1,
      "updateTime": "2023-01-02T12:00:00Z"
    },
    "code": 200
  }
  ```

### 3.5 删除用户
- **请求路径**：`/users/{id}`
- **请求方法**：`DELETE`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 用户ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null,
    "code": 200
  }
  ```

### 3.6 批量删除用户
- **请求路径**：`/users/batch`
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

### 3.7 更新用户状态
- **请求路径**：`/users/{id}/status`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 用户ID |
- **请求参数**：
  ```json
  {
    "status": 0 /* 0:禁用, 1:启用 */
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

### 3.8 重置用户密码
- **请求路径**：`/users/{id}/password`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 用户ID |
- **请求参数**：
  ```json
  {
    "password": "newpassword" /* 可选，不提供则重置为默认密码 */
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "密码重置成功",
    "data": null,
    "code": 200
  }
  ```

### 3.9 更新用户角色
- **请求路径**：`/users/{id}/role`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 用户ID |
- **请求参数**：
  ```json
  {
    "roleIds": [1, 2]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "角色更新成功",
    "data": null,
    "code": 200
  }
  ```

### 3.10 导出用户列表
- **请求路径**：`/users/export`
- **请求方法**：`GET`
- **请求参数**：同3.1获取用户列表
- **响应数据**：Excel文件流

### 3.11 导入用户数据
- **请求路径**：`/users/import`
- **请求方法**：`POST`
- **请求参数**：
  - `file`：MultipartFile，Excel文件
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "导入成功，共导入10条数据",
    "data": {
      "successCount": 10,
      "failCount": 0,
      "failDetails": []
    },
    "code": 200
  }
  ```

## 4. 角色管理模块 (Role)

### 4.1 获取角色列表
- **请求路径**：`/roles`
- **请求方法**：`GET`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | current | Integer | 否 | 当前页码，默认1 |
  | size | Integer | 否 | 每页大小，默认10 |
  | keyword | String | 否 | 搜索关键词 |
  | sortField | String | 否 | 排序字段 |
  | sortOrder | String | 否 | 排序方式(asc/desc) |
- **响应数据**：分页响应格式

### 4.2 获取角色详情
- **请求路径**：`/roles/{id}`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 角色ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": {
      "id": 1,
      "name": "ADMIN",
      "description": "系统管理员",
      "permissions": [{
        "id": 1,
        "name": "user:list",
        "description": "用户列表查询权限"
      }],
      "createTime": "2023-01-01T12:00:00Z",
      "updateTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 4.3 创建角色
- **请求路径**：`/roles`
- **请求方法**：`POST`
- **请求参数**：
  ```json
  {
    "name": "MANAGER",
    "description": "部门管理员",
    "permissionIds": [1, 2, 3]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 2,
      "name": "MANAGER",
      "description": "部门管理员",
      "createTime": "2023-01-01T12:00:00Z"
    },
    "code": 200
  }
  ```

### 4.4 更新角色
- **请求路径**：`/roles/{id}`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 角色ID |
- **请求参数**：
  ```json
  {
    "name": "MANAGER",
    "description": "部门管理员(更新)",
    "permissionIds": [1, 2, 3, 4]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "更新成功",
    "data": {
      "id": 2,
      "name": "MANAGER",
      "description": "部门管理员(更新)",
      "updateTime": "2023-01-02T12:00:00Z"
    },
    "code": 200
  }
  ```

### 4.5 删除角色
- **请求路径**：`/roles/{id}`
- **请求方法**：`DELETE`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 角色ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "删除成功",
    "data": null,
    "code": 200
  }
  ```

### 4.6 批量删除角色
- **请求路径**：`/roles/batch`
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

### 4.7 获取所有权限列表
- **请求路径**：`/permissions`
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
        "name": "user:list",
        "description": "用户列表查询权限",
        "parentId": null,
        "children": []
      }
    ],
    "code": 200
  }
  ```

### 4.8 获取角色权限
- **请求路径**：`/roles/{id}/permissions`
- **请求方法**：`GET`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 角色ID |
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "查询成功",
    "data": [
      {
        "id": 1,
        "name": "user:list",
        "description": "用户列表查询权限"
      }
    ],
    "code": 200
  }
  ```

### 4.9 更新角色权限
- **请求路径**：`/roles/{id}/permissions`
- **请求方法**：`PUT`
- **路径参数**：
  | 参数名 | 类型 | 描述 |
  |-------|------|------|
  | id | Long | 角色ID |
- **请求参数**：
  ```json
  {
    "permissionIds": [1, 2, 3]
  }
  ```
- **响应数据**：
  ```json
  {
    "success": true,
    "message": "权限更新成功",
    "data": null,
    "code": 200
  }
  ```

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
