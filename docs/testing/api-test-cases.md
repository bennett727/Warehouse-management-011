# API接口测试用例文档

## 测试环境
- **后端地址**: http://localhost:8080
- **前端地址**: http://localhost:5173
- **Swagger文档**: http://localhost:8080/api/swagger-ui.html

## 测试用例清单

### 1. 认证模块 (/auth)

#### 1.1 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
**预期结果**: 
- 状态码: 200
- 返回: accessToken, refreshToken, 用户信息

#### 1.2 刷新令牌
```http
POST /api/auth/refresh
Authorization: Bearer {refreshToken}
```
**预期结果**:
- 状态码: 200
- 返回: 新的accessToken

#### 1.3 获取用户信息
```http
GET /api/auth/info
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 当前登录用户信息

---

### 2. 仓库管理模块 (/warehouses)

#### 2.1 获取仓库列表
```http
GET /api/warehouses?page=0&size=10
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 仓库分页列表

#### 2.2 获取仓库详情
```http
GET /api/warehouses/{id}
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 仓库详细信息

#### 2.3 获取仓库概览统计
```http
GET /api/warehouses/overview/stats
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 仓库统计数据

#### 2.4 获取启用仓库列表
```http
GET /api/warehouses/active
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 启用的仓库列表

---

### 3. 设备管理模块 (/devices)

#### 3.1 获取设备列表
```http
GET /api/devices?page=0&size=10
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 设备分页列表

#### 3.2 创建设备
```http
POST /api/devices
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "deviceCode": "DEV001",
  "deviceName": "测试设备",
  "deviceTypeId": 1,
  "status": 0
}
```
**预期结果**:
- 状态码: 200
- 返回: 创建的设备信息

#### 3.3 获取设备详情
```http
GET /api/devices/{id}
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 设备详细信息

#### 3.4 更新设备状态
```http
POST /api/devices/{id}/status
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "status": 1,
  "remark": "状态变更"
}
```
**预期结果**:
- 状态码: 200
- 返回: 更新后的设备信息

---

### 4. 货位管理模块 (/bins)

#### 4.1 获取货位列表
```http
GET /api/bins?page=1&size=10
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 货位分页列表

#### 4.2 获取可用货位
```http
GET /api/bins/available
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 可用货位列表

---

### 5. 用户管理模块 (/users)

#### 5.1 获取用户列表
```http
GET /api/users?page=0&size=10
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 用户分页列表

#### 5.2 搜索用户
```http
GET /api/users?keyword=admin&status=1
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 符合条件的用户列表

---

### 6. 角色管理模块 (/roles)

#### 6.1 获取角色列表
```http
GET /api/roles?page=0&size=10
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 角色分页列表

---

### 7. 仪表盘模块 (/dashboard)

#### 7.1 获取系统概览
```http
GET /api/dashboard/overview
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 系统概览数据（设备数、库存数等）

#### 7.2 获取统计数据
```http
GET /api/dashboard/statistics
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 综合统计数据

#### 7.3 获取待办任务
```http
GET /api/dashboard/tasks
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 待办任务列表

---

### 8. 行政区划模块 (/system/divisions)

#### 8.1 获取行政区划树
```http
GET /api/system/divisions
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 行政区划树形数据

#### 8.2 获取省份列表
```http
GET /api/system/divisions/provinces
Authorization: Bearer {accessToken}
```
**预期结果**:
- 状态码: 200
- 返回: 省份列表

---

## 测试执行步骤

### 手动测试步骤

1. **启动服务**
   ```bash
   # 后端
   cd spring_boot && mvn spring-boot:run
   
   # 前端
   cd frontend && npm run dev
   ```

2. **获取Token**
   - 使用Postman或curl调用登录接口
   - 记录返回的accessToken

3. **测试各模块API**
   - 在请求头中添加: `Authorization: Bearer {accessToken}`
   - 按顺序测试各接口
   - 记录测试结果

### 自动化测试

建议使用以下工具进行自动化测试：
- **Postman**: 创建Collection，设置环境变量
- **JMeter**: 性能测试
- **Cypress**: 端到端测试

---

## 预期问题及解决方案

### 问题1: 401 Unauthorized
**原因**: Token过期或无效
**解决**: 调用刷新令牌接口或重新登录

### 问题2: 403 Forbidden
**原因**: 用户权限不足
**解决**: 使用具有相应权限的用户账号

### 问题3: 404 Not Found
**原因**: 路径错误或资源不存在
**解决**: 检查API路径是否正确

### 问题4: 500 Internal Server Error
**原因**: 服务器内部错误
**解决**: 查看后端日志，定位问题

---

## 测试报告模板

| 模块 | 接口 | 状态 | 备注 |
|-----|------|-----|------|
| 认证 | 登录 | ✅/❌ | |
| 认证 | 刷新令牌 | ✅/❌ | |
| 仓库 | 列表 | ✅/❌ | |
| 仓库 | 详情 | ✅/❌ | |
| 设备 | 列表 | ✅/❌ | |
| 设备 | 创建 | ✅/❌ | |
| 货位 | 列表 | ✅/❌ | |
| 用户 | 列表 | ✅/❌ | |
| 角色 | 列表 | ✅/❌ | |
| 仪表盘 | 概览 | ✅/❌ | |
| 仪表盘 | 待办 | ✅/❌ | |
| 行政区划 | 省份 | ✅/❌ | |

---

**文档版本**: 1.0  
**创建时间**: 2026-02-18  
**维护人员**: AI Assistant
