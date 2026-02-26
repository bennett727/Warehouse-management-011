# Data-Cy 选择器规范文档

## 1. 概述

本文档定义了仓库管理系统(WMS)前端自动化测试中 `data-cy` 属性的命名规范和使用标准。统一的命名规范确保测试框架能够精确定位元素，提高测试的可维护性和稳定性。

## 2. 命名规范

### 2.1 基本原则

- **唯一性**：每个 `data-cy` 值在页面范围内必须是唯一的
- **语义化**：名称应清晰表达元素的功能和用途
- **一致性**：相同类型的元素使用统一的命名模式
- **可读性**：使用小写字母和连字符，避免缩写

### 2.2 命名格式

```
[页面/模块]-[元素类型]-[动作/描述]
```

#### 页面/模块前缀

| 页面/模块 | 前缀 |
|-----------|------|
| 登录页 | `login-` |
| 仪表盘 | `dashboard-` |
| 设备列表 | `device-list-` |
| 设备详情 | `device-detail-` |
| 入库管理 | `inbound-` |
| 出库管理 | `outbound-` |
| 库存管理 | `inventory-` |
| 仓库管理 | `warehouse-` |
| 系统管理 | `system-` |
| 用户管理 | `user-` |
| 角色管理 | `role-` |
| 报表 | `report-` |
| 通用组件 | `[组件名]-` |

#### 元素类型

| 元素类型 | 后缀 |
|----------|------|
| 页面容器 | `-page` |
| 按钮 | `-button` / `-btn` |
| 输入框 | `-input` |
| 选择器 | `-select` |
| 表格 | `-table` |
| 表单 | `-form` |
| 对话框 | `-dialog` |
| 卡片 | `-card` |
| 标签/徽章 | `-tag` |
| 菜单 | `-menu` |
| 导航项 | `-nav-item` |
| 搜索框 | `-search` |
| 分页器 | `-pagination` |
| 日期选择器 | `-datepicker` |
| 复选框 | `-checkbox` |
| 单选框 | `-radio` |

#### 动作/描述

| 动作 | 后缀 |
|------|------|
| 添加/创建 | `-add` / `-create` |
| 编辑/修改 | `-edit` / `-update` |
| 删除 | `-delete` |
| 查看/详情 | `-view` / `-detail` |
| 搜索 | `-search` |
| 重置 | `-reset` |
| 导出 | `-export` |
| 导入 | `-import` |
| 保存 | `-save` |
| 取消 | `-cancel` |
| 确认 | `-confirm` |
| 提交 | `-submit` |
| 刷新 | `-refresh` |
| 筛选 | `-filter` |
| 排序 | `-sort` |

## 3. 页面选择器规范

### 3.1 登录页 (Login.vue)

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 页面容器 | `login-page` | 整个登录页面 |
| 用户名输入框 | `login-username-input` | 用户名输入 |
| 密码输入框 | `login-password-input` | 密码输入 |
| 登录按钮 | `login-submit-button` | 提交登录 |
| 记住我复选框 | `login-remember-checkbox` | 记住登录状态 |
| 登录表单 | `login-form` | 登录表单容器 |
| 进度条 | `login-progress` | 登录进度显示 |

### 3.2 仪表盘 (Dashboard.vue)

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 页面容器 | `dashboard-page` | 仪表盘页面 |
| 刷新按钮 | `dashboard-refresh-button` | 刷新数据 |
| 日期范围选择器 | `dashboard-date-range-picker` | 选择日期范围 |
| KPI卡片 | `dashboard-kpi-card` | 关键指标卡片 |
| 状态分布图表 | `dashboard-status-chart` | 设备状态分布 |
| 库存趋势图表 | `dashboard-trend-chart` | 库存变动趋势 |
| 业务统计图表 | `dashboard-business-chart` | 业务记录统计 |
| 区域分布图表 | `dashboard-area-chart` | 区域设备分布 |
| 仓库概览 | `dashboard-warehouse-overview` | 仓库数据概览 |

### 3.3 设备列表 (DeviceList.vue)

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 页面容器 | `device-list-page` | 设备列表页面 |
| 添加设备按钮 | `device-list-add-button` | 添加新设备 |
| 导出按钮 | `device-list-export-button` | 导出设备数据 |
| 列配置按钮 | `device-list-column-config-button` | 配置显示列 |
| 统计卡片 | `device-list-stats-card` | 统计信息卡片 |
| 设备表格 | `device-list-table` | 设备数据表格 |
| 设备编号单元格 | `device-list-code-cell` | 表格中的设备编号 |
| 设备名称单元格 | `device-list-name-cell` | 表格中的设备名称 |
| 设备类型标签 | `device-list-type-tag` | 设备类型标签 |
| 搜索框 | `device-list-search-input` | 搜索设备 |
| 筛选按钮 | `device-list-filter-button` | 打开筛选面板 |
| 分页器 | `device-list-pagination` | 表格分页 |

### 3.4 通用组件

#### PageLayout 组件

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 页面标题 | `page-title` | 页面标题 |
| 页面描述 | `page-description` | 页面描述 |
| 头部操作区 | `page-header-actions` | 头部操作按钮区 |
| 内容区 | `page-content` | 页面主要内容 |

#### BaseDialog 组件

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 对话框容器 | `[action]-dialog` | 对话框容器 |
| 确认按钮 | `[action]-confirm-button` | 确认操作 |
| 取消按钮 | `[action]-cancel-button` | 取消操作 |
| 关闭按钮 | `[action]-close-button` | 关闭对话框 |

#### DataTable 组件

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 表格容器 | `[module]-table` | 数据表格 |
| 表头 | `[module]-table-header` | 表格头部 |
| 表行 | `[module]-table-row` | 表格行 |
| 单元格 | `[module]-[column]-cell` | 表格单元格 |
| 空状态 | `[module]-empty-state` | 无数据状态 |
| 加载状态 | `[module]-loading` | 加载中状态 |

## 4. 权限相关选择器

### 4.1 权限控制按钮

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 编辑按钮 | `[module]-edit-button` | 编辑操作（受权限控制） |
| 删除按钮 | `[module]-delete-button` | 删除操作（受权限控制） |
| 审批按钮 | `[module]-approve-button` | 审批操作（受权限控制） |
| 禁用/启用按钮 | `[module]-toggle-status-button` | 状态切换（受权限控制） |

### 4.2 权限提示

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 无权限提示 | `permission-denied-message` | 权限不足提示 |
| 403页面 | `forbidden-page` | 无权限访问页面 |

## 5. 表单相关选择器

### 5.1 表单元素

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 表单容器 | `[module]-form` | 表单容器 |
| 提交按钮 | `[module]-submit-button` | 表单提交 |
| 重置按钮 | `[module]-reset-button` | 表单重置 |
| 必填标记 | `[field]-required` | 必填字段标记 |
| 错误提示 | `[field]-error` | 字段错误提示 |

### 5.2 表单字段命名

```
[模块]-[字段名]-[类型]
```

示例：
- `device-name-input` - 设备名称输入框
- `device-type-select` - 设备类型选择器
- `device-status-radio` - 设备状态单选框
- `device-remark-textarea` - 设备备注文本域

## 6. 导航相关选择器

### 6.1 侧边栏菜单

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 侧边栏容器 | `sidebar-menu` | 侧边栏菜单容器 |
| 菜单项 | `sidebar-menu-item-[name]` | 具体菜单项 |
| 子菜单 | `sidebar-submenu-[name]` | 子菜单容器 |
| 折叠按钮 | `sidebar-collapse-button` | 折叠/展开菜单 |

### 6.2 面包屑导航

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 面包屑容器 | `breadcrumb-nav` | 面包屑导航容器 |
| 首页链接 | `breadcrumb-home` | 首页链接 |
| 当前页面 | `breadcrumb-current` | 当前页面名称 |

## 7. 验证规则

### 7.1 选择器验证检查清单

- [ ] 每个交互元素都有唯一的 `data-cy` 属性
- [ ] 命名符合 `[页面]-[元素类型]-[动作]` 格式
- [ ] 使用小写字母和连字符
- [ ] 避免使用动态生成的ID或索引
- [ ] 权限控制的元素有明确的选择器

### 7.2 禁止事项

- ❌ 不要使用动态值作为 data-cy 值
- ❌ 不要使用数组索引作为后缀
- ❌ 不要混合使用驼峰命名和下划线
- ❌ 不要使用过长的名称（超过50个字符）
- ❌ 不要使用无意义的缩写

## 8. 示例代码

### 8.1 正确示例

```vue
<!-- 页面容器 -->
<template>
  <PageLayout data-cy="device-list-page">
    <!-- 操作按钮 -->
    <el-button data-cy="device-list-add-button" @click="handleAdd">
      添加设备
    </el-button>
    
    <!-- 搜索框 -->
    <el-input data-cy="device-list-search-input" v-model="searchQuery" />
    
    <!-- 数据表格 -->
    <el-table data-cy="device-list-table">
      <el-table-column>
        <template #default="{ row }">
          <span :data-cy="`device-list-code-${row.id}`">{{ row.code }}</span>
        </template>
      </el-table-column>
    </el-table>
  </PageLayout>
</template>
```

### 8.2 错误示例

```vue
<!-- ❌ 错误：使用动态索引 -->
<el-button :data-cy="`btn-${index}`">按钮</el-button>

<!-- ❌ 错误：使用驼峰命名 -->
<el-button data-cy="addDeviceButton">添加</el-button>

<!-- ❌ 错误：无意义缩写 -->
<el-input data-cy="dev-nm-inp" />

<!-- ❌ 错误：没有模块前缀 -->
<el-button data-cy="submit-button">提交</el-button>
```

## 9. 维护指南

### 9.1 新增选择器流程

1. 根据元素所在页面/模块确定前缀
2. 根据元素类型选择正确的类型后缀
3. 根据元素功能添加动作/描述后缀
4. 检查是否与现有选择器冲突
5. 更新本文档

### 9.2 修改选择器流程

1. 评估修改影响范围
2. 同步更新测试代码
3. 更新相关文档
4. 通知测试团队

### 9.3 版本控制

- 文档版本：1.0.0
- 最后更新：2026-02-25
- 维护人：开发团队

---

**注意**：本文档应与项目代码同步更新，确保测试团队始终使用最新的选择器规范。
