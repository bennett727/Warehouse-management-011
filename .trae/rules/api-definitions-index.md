/*
 * @file: api-definitions-index.md
 * @description: API接口定义文档索引，提供各模块API文档的导航
 * @author: 开发团队
 * @createTime: 2023-01-01
 * @updateTime: 2026-02-26
 * @version: 1.2
 */

# 仓库管理系统API接口定义文档索引

## 文档版本信息

| 版本 | 更新日期 | 更新内容 | 更新人 |
|------|---------|---------|--------|
| 1.0 | 2023-01-01 | 初始版本 | 开发团队 |
| 1.1 | 2026-02-26 | 统一文档格式，添加版本控制信息 | 开发团队 |
| 1.2 | 2026-02-26 | 拆分文档，每个文件控制在1000行以内 | 开发团队 |

---

## 文档结构

由于API接口定义文档内容较多，为便于阅读和维护，已将文档拆分为以下4个文件：

| 文档 | 内容模块 | 行数 |
|------|---------|------|
| [api-definitions-01-auth-user-role.md](./api-definitions-01-auth-user-role.md) | 通用规则、认证授权、用户管理、角色管理 | ~700行 |
| [api-definitions-02-device.md](./api-definitions-02-device.md) | 设备管理、设备类型管理 | ~500行 |
| [api-definitions-03-area-inventory.md](./api-definitions-03-area-inventory.md) | 区域管理、库存管理 | ~400行 |
| [api-definitions-04-maintenance-remote-stats.md](./api-definitions-04-maintenance-remote-stats.md) | 维护管理、远程账号、设备统计 | ~300行 |

---

## 模块概览

### 1. 认证与用户管理模块
**文档**：[api-definitions-01-auth-user-role.md](./api-definitions-01-auth-user-role.md)

| 模块 | 主要接口 |
|------|---------|
| 通用规则 | 响应格式、分页格式、错误码、认证方式 |
| 认证授权 | 登录、注册、登出、刷新令牌、重置密码 |
| 用户管理 | 用户CRUD、状态管理、密码重置、导入导出 |
| 角色管理 | 角色CRUD、权限分配 |

### 2. 设备管理模块
**文档**：[api-definitions-02-device.md](./api-definitions-02-device.md)

| 模块 | 主要接口 |
|------|---------|
| 设备管理 | 设备CRUD、状态管理、故障标记、维修操作、导入导出 |
| 设备类型管理 | 类型CRUD、树结构查询、导入导出 |

### 3. 区域与库存管理模块
**文档**：[api-definitions-03-area-inventory.md](./api-definitions-03-area-inventory.md)

| 模块 | 主要接口 |
|------|---------|
| 区域管理 | 区域CRUD、树结构查询、状态管理 |
| 库存管理 | 入库管理、出库管理、库存查询 |

### 4. 维护与统计模块
**文档**：[api-definitions-04-maintenance-remote-stats.md](./api-definitions-04-maintenance-remote-stats.md)

| 模块 | 主要接口 |
|------|---------|
| 维护管理 | 维修记录CRUD、维护记录管理 |
| 远程账号管理 | 远程账号CRUD |
| 设备统计 | 设备状态统计、类型统计、区域统计 |

---

## 快速导航

### 按功能查找

| 功能 | 接口路径 | 所属文档 |
|------|---------|---------|
| 用户登录 | `/auth/login` | [认证授权](./api-definitions-01-auth-user-role.md#2-认证授权模块-auth) |
| 用户管理 | `/users` | [用户管理](./api-definitions-01-auth-user-role.md#3-用户管理模块-user) |
| 角色管理 | `/roles` | [角色管理](./api-definitions-01-auth-user-role.md#4-角色管理模块-role) |
| 设备管理 | `/devices` | [设备管理](./api-definitions-02-device.md#5-设备管理模块-device) |
| 设备类型 | `/device-types` | [设备类型](./api-definitions-02-device.md#6-设备类型管理模块-devicetype) |
| 区域管理 | `/areas` | [区域管理](./api-definitions-03-area-inventory.md#7-区域管理模块-area) |
| 入库管理 | `/inbound` | [库存管理](./api-definitions-03-area-inventory.md#8-库存管理模块-inventory) |
| 出库管理 | `/outbound` | [库存管理](./api-definitions-03-area-inventory.md#8-库存管理模块-inventory) |
| 维护管理 | `/maintenance` | [维护管理](./api-definitions-04-maintenance-remote-stats.md#9-维护管理模块-maintenance) |
| 远程账号 | `/remote-accounts` | [远程账号](./api-definitions-04-maintenance-remote-stats.md#10-远程账号管理模块-remoteaccount) |
| 设备统计 | `/device-statistics` | [设备统计](./api-definitions-04-maintenance-remote-stats.md#11-设备统计模块-device-statistics) |

---

## 使用说明

1. **查找接口**：根据功能模块在上方表格中定位对应文档
2. **阅读规范**：所有接口均遵循统一的响应格式和错误码体系
3. **权限控制**：接口权限要求请参考 [权限控制规则.md](./权限控制规则.md)
4. **错误处理**：错误码详细说明请参考 [错误处理规范.md](./错误处理规范.md)

---

**文档版本**：1.2
**文档更新时间**：2026-02-26
**文档维护人**：开发团队
