/*
 * @file: api-definitions-01-auth-user-role.md
 * @description: API接口定义 - 通用规则、认证授权、用户管理、角色管理模块
 * @author: 开发团队
 * @createTime: 2023-01-01
 * @updateTime: 2026-02-26
 * @version: 1.2
 */

# API接口定义 - 认证与用户管理模块

> 本文档是 [API接口定义索引](./api-definitions-index.md) 的一部分

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

---

**相关文档**：
- [返回索引](./api-definitions-index.md)
- [下一部分：设备管理模块](./api-definitions-02-device.md)

**文档版本**：1.2
**文档更新时间**：2026-02-26
**文档维护人**：开发团队
