# Data-Cy 属性清单文档

## 概述

本文档详细列出了仓库管理系统(WMS)前端所有组件的 `data-cy` 属性，用于自动化测试定位和元素识别。

## 命名规范

### 基本格式
```
[页面/模块]-[元素类型]-[动作/描述]
```

### 元素类型后缀
| 类型 | 后缀 | 说明 |
|------|------|------|
| 页面容器 | `-page` | 页面根元素 |
| 按钮 | `-btn` / `-button` | 可点击按钮 |
| 输入框 | `-input` | 文本输入 |
| 选择器 | `-select` | 下拉选择 |
| 表格 | `-table` | 数据表格 |
| 表单 | `-form` | 表单容器 |
| 对话框 | `-dialog` | 模态对话框 |
| 卡片 | `-card` | 卡片容器 |
| 标签 | `-tag` | 状态标签 |
| 菜单 | `-menu` | 导航菜单 |

---

## 1. 基础组件 (Base Components)

### 1.1 PageLayout.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 页面布局容器 | `page-layout` | 页面根容器 |
| 页面头部 | `page-header` | 标题区域 |
| 页面标题 | `page-title` | 标题文本 |
| 页面描述 | `page-description` | 描述文本 |
| 头部操作区 | `header-actions` | 操作按钮区 |
| 操作栏 | `page-action-bar` | 页面操作栏 |
| 页面内容 | `page-content` | 主要内容区 |
| 页面底部 | `page-footer` | 底部区域 |

### 1.2 ActionBar.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 操作栏容器 | `action-bar` | 操作栏根元素 |
| 左侧区域 | `action-bar-left` | 左侧操作区 |
| 右侧区域 | `action-bar-right` | 右侧操作区 |

### 1.3 Breadcrumb.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 面包屑导航 | `breadcrumb-nav` | 导航容器 |
| 首页链接 | `breadcrumb-home` | 第一个导航项 |
| 导航项 | `breadcrumb-item-{index}` | 第N个导航项 |
| 当前页面 | `breadcrumb-current` | 当前页面名称 |

### 1.4 DataTable.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 数据表格 | `data-table` | 表格根元素 |
| 分页组件 | `data-table-pagination` | 表格分页 |

### 1.5 BaseDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 对话框覆盖层 | `dialog-overlay` | 背景遮罩 |
| 对话框容器 | `dialog-container` | 对话框主体 |
| 对话框头部 | `dialog-header` | 标题区域 |
| 关闭按钮 | `dialog-header__close` | 关闭图标 |
| 对话框内容 | `dialog-body` | 内容区域 |
| 对话框底部 | `dialog-footer` | 底部按钮区 |
| 确认按钮 | `dialog-confirm-button` | 确认操作 |
| 取消按钮 | `dialog-cancel-button` | 取消操作 |

### 1.6 BaseEmptyState.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 空状态容器 | `empty-state` | 普通空状态 |
| 加载状态 | `empty-state-loading` | 加载中空状态 |
| 描述文本 | `empty-state-description` | 描述信息 |
| 操作按钮 | `empty-state-action-btn` | 刷新/操作按钮 |
| 加载容器 | `empty-state-loading-container` | 加载动画区 |
| 加载文本 | `empty-state-loading-text` | 加载提示文字 |

### 1.7 BaseStatusTag.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 状态标签 | `status-tag-{status}` | 根据状态动态生成 |
| 标签文本 | `status-tag-text` | 状态文本 |

### 1.8 BaseDetailDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 详情对话框 | `base-detail-dialog` | 对话框容器 |
| 底部区域 | `detail-dialog-footer` | 底部按钮区 |
| 关闭按钮 | `detail-dialog-close-btn` | 关闭操作 |
| 编辑按钮 | `detail-dialog-edit-btn` | 编辑操作 |
| 删除按钮 | `detail-dialog-delete-btn` | 删除操作 |

---

## 2. 筛选栏组件 (FilterBar Components)

### 2.1 UnifiedFilterBar/index.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 筛选栏容器 | `unified-filter-bar` | 根容器 |

### 2.2 FilterBarHeader.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 头部容器 | `filter-bar-header` | 头部区域 |
| 标题 | `filter-bar-title` | 标题文本 |
| 结果数量 | `filter-bar-result-count` | 统计标签 |
| 收起按钮 | `filter-bar-collapse-btn` | 展开/收起 |

### 2.3 FilterBarFooter.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 底部容器 | `filter-bar-footer` | 底部区域 |
| 左侧区域 | `filter-bar-footer-left` | 左侧插槽 |
| 右侧区域 | `filter-bar-footer-right` | 右侧按钮区 |
| 搜索按钮 | `filter-bar-search-btn` | 查询操作 |
| 重置按钮 | `filter-bar-reset-btn` | 重置操作 |

### 2.4 FilterBarForm.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 表单容器 | `filter-bar-form` | 表单区域 |
| 筛选字段 | `filter-field-{prop}` | 动态字段标识 |
| 输入框 | `filter-{prop}-input` | 文本输入框 |
| 选择框 | `filter-{prop}-select` | 下拉选择框 |
| 选择选项 | `filter-{prop}-option-{value}` | 下拉选项 |
| 日期选择器 | `filter-{prop}-date-picker` | 日期选择 |
| 日期范围选择器 | `filter-{prop}-date-range-picker` | 日期范围 |
| 数字输入框 | `filter-{prop}-number-input` | 数字输入 |
| 级联选择器 | `filter-{prop}-cascader` | 级联选择 |

---

## 3. 布局组件 (Layout Components)

### 3.1 Layout.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 应用布局 | `app-layout` | 根布局容器 |
| 移动端遮罩 | `mobile-overlay` | 移动端遮罩层 |
| 侧边栏 | `sidebar` | 侧边导航 |
| 头部 | `header` | 顶部导航栏 |
| 面包屑 | `page-breadcrumb` | 面包屑区域 |
| 主内容 | `main-content` | 页面内容区 |

### 3.2 Header.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 头部容器 | `header` | 顶部栏 |
| 侧边栏切换 | `sidebar-toggle-button` | 菜单切换 |
| 用户菜单 | `user-menu` | 用户下拉 |
| 用户信息 | `user-info` | 用户展示 |
| 个人中心 | `user-center-menu-item` | 菜单项 |
| 快捷键帮助 | `shortcut-help-menu-item` | 菜单项 |
| 退出登录 | `logout-menu-item` | 菜单项 |

### 3.3 Sidebar.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 侧边栏 | `sidebar` | 侧边导航容器 |
| 主菜单 | `main-menu` | 菜单根元素 |
| 仪表盘 | `menu-dashboard` | 首页菜单 |
| 资产管理 | `menu-asset-management` | 资产菜单 |
| 设备台账 | `menu-device-ledger` | 子菜单 |
| 设备列表 | `menu-device-list` | 子菜单 |
| 设备类型 | `menu-device-types` | 子菜单 |
| 状态审批 | `menu-device-status` | 子菜单 |
| 库存管理 | `menu-inventory` | 库存菜单 |
| 入库管理 | `menu-inbound` | 子菜单 |
| 出库管理 | `menu-outbound` | 子菜单 |
| 库存调拨 | `menu-transfer` | 子菜单 |
| 库存盘点 | `menu-count` | 子菜单 |
| 库存状态 | `menu-stock-status` | 子菜单 |
| 库存预警 | `menu-alerts` | 子菜单 |
| 批次管理 | `menu-batch` | 子菜单 |
| 仓库管理 | `menu-warehouse` | 子菜单 |
| 功能区类型 | `menu-zone-type` | 子菜单 |
| 仓库地图 | `menu-warehouse-map` | 子菜单 |
| 货位管理 | `menu-bin` | 子菜单 |
| 区域管理 | `menu-area` | 子菜单 |
| 业务记录 | `menu-business` | 业务菜单 |
| 安装记录 | `menu-installation` | 子菜单 |
| 维修记录 | `menu-repair` | 子菜单 |
| 保养记录 | `menu-maintenance` | 子菜单 |
| 报废记录 | `menu-scrap` | 子菜单 |
| 库存记录 | `menu-inventory-history` | 子菜单 |
| 业务管理中心 | `menu-business-management` | 子菜单 |
| 查询统计 | `menu-query-stats` | 查询菜单 |
| 综合查询 | `menu-comprehensive-query` | 子菜单 |
| 数据报表 | `menu-reports` | 子菜单 |
| 数据分析 | `menu-analysis` | 子菜单 |
| 系统管理 | `menu-system` | 系统菜单 |
| 用户管理 | `menu-users` | 子菜单 |
| 角色管理 | `menu-roles` | 子菜单 |
| 系统参数 | `menu-config` | 子菜单 |
| 预警配置 | `menu-alert-config` | 子菜单 |
| 操作日志 | `menu-logs` | 子菜单 |
| 行政区划 | `menu-administrative-division` | 子菜单 |
| 个人中心 | `menu-user-center` | 菜单项 |
| 帮助中心 | `menu-help` | 菜单项 |

---

## 4. 页面组件 (Page Components)

### 4.1 Login.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 登录页面 | `login-page` | 页面容器 |
| 登录表单 | `login-form` | 表单容器 |
| 用户名输入 | `login-username-input` | 用户名 |
| 密码输入 | `login-password-input` | 密码 |
| 记住我 | `login-remember-checkbox` | 复选框 |
| 登录按钮 | `login-submit-button` | 提交按钮 |
| 进度条 | `login-progress` | 登录进度 |

### 4.2 Dashboard.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 仪表盘页面 | `dashboard-page` | 页面容器 |
| 刷新按钮 | `refresh-btn` | 刷新数据 |
| 日期选择器 | `date-range-picker` | 日期范围 |
| KPI卡片 | `kpi-card` | 关键指标 |
| 状态图表 | `status-chart` | 设备状态 |
| 更多按钮 | `more-btn` | 查看更多 |
| 趋势图表 | `trend-chart` | 库存趋势 |
| 周期选择器 | `period-selector` | 时间周期 |
| 业务图表 | `business-chart` | 业务统计 |
| 区域图表 | `area-chart` | 区域分布 |
| 仓库概览 | `warehouse-overview` | 仓库数据 |
| 快捷入口 | `quick-access` | 快捷操作 |
| 快捷项 | `quick-access-item` | 单个入口 |

### 4.3 DeviceList.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 设备列表页 | `device-list-page` | 页面容器 |
| 列配置按钮 | `device-column-config-button` | 配置列 |
| 导出按钮 | `device-export-button` | 导出数据 |
| 添加按钮 | `device-add-button` | 添加设备 |
| 统计卡片 | `stats-card` | 统计信息 |
| 设备表格 | `device-table` | 数据表格 |
| 设备编号 | `device-code-cell` | 编号单元格 |
| 设备名称 | `device-name-cell` | 名称单元格 |
| 设备类型 | `device-type-cell` | 类型标签 |
| 查看按钮 | `device-view-button` | 查看详情 |
| 编辑按钮 | `device-edit-button` | 编辑设备 |
| 分页器 | `device-pagination` | 表格分页 |
| 列配置对话框 | `device-column-config-dialog` | 配置弹窗 |

### 4.4 DivisionManagement.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 区划管理页 | `division-management-page` | 页面容器 |
| 添加按钮 | `division-add-btn` | 添加区划 |
| 导入按钮 | `division-import-btn` | 导入数据 |
| 导出按钮 | `division-export-btn` | 导出数据 |
| 树形卡片 | `division-tree-card` | 树形容器 |
| 区划树 | `division-tree` | 树形组件 |
| 树添加按钮 | `division-tree-add-btn` | 树操作 |
| 树编辑按钮 | `division-tree-edit-btn` | 树操作 |
| 树删除按钮 | `division-tree-delete-btn` | 树操作 |
| 空状态 | `division-empty-state` | 无选择 |
| 详情描述 | `division-descriptions` | 详情展示 |
| 对话框 | `division-dialog` | 编辑弹窗 |
| 表单 | `division-form` | 表单容器 |

### 4.5 AreaManagement.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 区域管理页 | `area-management-page` | 页面容器 |
| 添加按钮 | `area-add-btn` | 添加区域 |
| 导入按钮 | `area-import-btn` | 导入数据 |
| 导出按钮 | `area-export-btn` | 导出数据 |
| 树形卡片 | `area-tree-card` | 树形容器 |
| 区域树 | `area-tree` | 树形组件 |
| 树编辑按钮 | `area-tree-edit-btn` | 树操作 |
| 树删除按钮 | `area-tree-delete-btn` | 树操作 |
| 空状态 | `area-empty-state` | 无选择 |
| 详情描述 | `area-descriptions` | 详情展示 |
| 对话框 | `area-dialog` | 编辑弹窗 |
| 表单 | `area-form` | 表单容器 |

---

## 5. 业务对话框组件 (Business Dialogs)

### 5.0 ApprovalDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 审批对话框 | `approval-dialog` | 弹窗容器 |
| 业务信息区域 | `approval-business-info` | 业务信息展示 |
| 业务描述列表 | `approval-business-descriptions` | 描述列表 |
| 业务编号 | `approval-business-no` | 业务编号 |
| 业务类型 | `approval-business-type` | 业务类型 |
| 申请人 | `approval-applicant` | 申请人 |
| 申请时间 | `approval-apply-time` | 申请时间 |
| 当前状态 | `approval-status` | 当前状态 |
| 审批表单 | `approval-form` | 表单容器 |
| 审批结果表单项 | `approval-result-form-item` | 结果选择区 |
| 审批结果单选组 | `approval-result-radio-group` | 单选按钮组 |
| 通过选项 | `approval-approve-radio` | 通过单选 |
| 驳回选项 | `approval-reject-radio` | 驳回单选 |
| 审批意见表单项 | `approval-comment-form-item` | 意见输入区 |
| 审批意见输入 | `approval-comment-input` | 文本域 |
| 底部区域 | `approval-dialog-footer` | 底部按钮区 |
| 取消按钮 | `approval-cancel-button` | 取消操作 |
| 通过按钮 | `approval-approve-button` | 审批通过 |
| 驳回按钮 | `approval-reject-button` | 审批驳回 |

### 5.1 DeviceSelector.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 选择器对话框 | `device-selector-dialog` | 弹窗容器 |
| 筛选区 | `device-selector-filter` | 筛选区域 |
| 搜索输入 | `device-selector-search-input` | 搜索框 |
| 类型选择 | `device-selector-type-select` | 类型筛选 |
| 状态选择 | `device-selector-status-select` | 状态筛选 |
| 搜索按钮 | `device-selector-search-btn` | 搜索操作 |
| 重置按钮 | `device-selector-reset-btn` | 重置操作 |
| 分页器 | `device-selector-pagination` | 分页组件 |
| 已选区域 | `device-selector-selected` | 已选展示 |
| 清空按钮 | `device-selector-clear-btn` | 清空选择 |
| 已选标签 | `device-selector-tag-{id}` | 动态标签 |
| 底部区域 | `device-selector-footer` | 底部按钮 |
| 取消按钮 | `device-selector-cancel-btn` | 取消操作 |
| 确认按钮 | `device-selector-confirm-btn` | 确认操作 |

### 5.2 DeviceFormDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 表单对话框 | `device-form-dialog` | 弹窗容器 |
| 设备编号 | `device-code-input` | 编号输入 |
| 设备名称 | `device-name-input` | 名称输入 |
| 设备类型 | `device-type-select` | 类型选择 |
| 规格型号 | `device-model-input` | 型号输入 |
| 序列号 | `device-serial-number-input` | SN输入 |
| 制造商 | `device-manufacturer-input` | 厂商输入 |
| 供应商 | `device-supplier-input` | 供应商 |
| 负责人 | `device-principal-input` | 负责人 |
| 设备状态 | `device-status-select` | 状态选择 |
| 存放位置 | `device-location-input` | 位置输入 |
| 采购日期 | `device-purchase-date-input` | 日期选择 |
| 保修日期 | `device-warranty-date-input` | 日期选择 |

### 5.3 DeviceDetailDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 详情对话框 | `device-detail-dialog` | 弹窗容器 |

### 5.4 InventoryAuditDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 审核对话框 | `inventory-audit-dialog` | 弹窗容器 |
| 内容区域 | `inventory-audit-content` | 内容容器 |
| 审核表单 | `inventory-audit-form` | 表单容器 |
| 审核结果表单项 | `audit-result-form-item` | 结果选择区 |
| 审核结果单选组 | `audit-result-radio-group` | 单选按钮组 |
| 通过选项 | `audit-result-approved` | 通过单选 |
| 拒绝选项 | `audit-result-rejected` | 拒绝单选 |
| 拒绝原因表单项 | `reject-reason-form-item` | 原因输入区 |
| 拒绝原因输入 | `reject-reason-input` | 文本域 |
| 审核备注表单项 | `audit-remark-form-item` | 备注输入区 |
| 审核备注输入 | `audit-remark-input` | 文本域 |
| 底部区域 | `inventory-audit-footer` | 底部按钮区 |
| 取消按钮 | `inventory-audit-cancel-btn` | 取消操作 |
| 通过按钮 | `inventory-audit-approve-btn` | 审核通过 |
| 拒绝按钮 | `inventory-audit-reject-btn` | 审核拒绝 |
| 提交按钮 | `inventory-audit-submit-btn` | 提交审核 |

### 5.5 InventoryDetailDialog.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 详情对话框 | `inventory-detail-dialog` | 弹窗容器 |
| 详情容器 | `inventory-detail-container` | 内容容器 |
| 加载状态 | `inventory-detail-loading` | 加载骨架屏 |
| 基本信息区域 | `inventory-basic-info-section` | 基本信息卡片 |
| 基本信息标题 | `inventory-basic-info-title` | 标题文本 |
| 状态标签 | `inventory-status-tag` | 状态展示 |
| 详情项 | `inventory-detail-item-{key}` | 动态详情项 |

### 5.6 InventoryStatisticsCard.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 统计容器 | `inventory-statistics-container` | 根容器 |
| 库存总数卡片 | `stat-card-total-stock` | 总数统计 |
| 库存总数数值 | `stat-value-total-stock` | 数值展示 |
| 库存总数标签 | `stat-label-total-stock` | 标签文本 |
| 本月入库卡片 | `stat-card-monthly-inbound` | 入库统计 |
| 本月入库数值 | `stat-value-monthly-inbound` | 数值展示 |
| 本月入库标签 | `stat-label-monthly-inbound` | 标签文本 |
| 本月出库卡片 | `stat-card-monthly-outbound` | 出库统计 |
| 本月出库数值 | `stat-value-monthly-outbound` | 数值展示 |
| 本月出库标签 | `stat-label-monthly-outbound` | 标签文本 |
| 预警数量卡片 | `stat-card-alert-count` | 预警统计 |
| 预警数量数值 | `stat-value-alert-count` | 数值展示 |
| 预警数量标签 | `stat-label-alert-count` | 标签文本 |
| 今日入库卡片 | `stat-card-today-inbound` | 今日入库 |
| 今日入库数值 | `stat-value-today-inbound` | 数值展示 |
| 今日入库标签 | `stat-label-today-inbound` | 标签文本 |
| 今日出库卡片 | `stat-card-today-outbound` | 今日出库 |
| 今日出库数值 | `stat-value-today-outbound` | 数值展示 |
| 今日出库标签 | `stat-label-today-outbound` | 标签文本 |
| 累计入库卡片 | `stat-card-total-inbound` | 累计入库 |
| 累计入库数值 | `stat-value-total-inbound` | 数值展示 |
| 累计入库标签 | `stat-label-total-inbound` | 标签文本 |

---

## 6. 入库管理页面 (Inbound Management)

### 6.1 InboundManagementOptimized.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 入库管理页面 | `inbound-management-page` | 页面容器 |
| 操作指引按钮 | `inbound-guide-btn` | 帮助文档 |
| 新建入库单按钮 | `inbound-create-btn` | 创建操作 |
| 导出按钮 | `inbound-export-btn` | 导出数据 |
| 批量操作栏 | `inbound-batch-operation-bar` | 批量工具栏 |
| 全选复选框 | `inbound-select-all-checkbox` | 全选操作 |
| 已选数量 | `inbound-selected-count` | 数量展示 |
| 批量操作按钮 | `inbound-batch-{key}-btn` | 动态批量按钮 |
| 取消选择按钮 | `inbound-clear-selection-btn` | 清空选择 |

---

## 7. 货位管理页面 (Bin Management)

### 7.1 BinManagement.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 货位管理页面 | `bin-management-page` | 页面容器 |
| 新增货位按钮 | `bin-add-button` | 新增操作 |
| 批量生成按钮 | `bin-batch-create-button` | 批量生成 |
| 导入按钮 | `bin-import-button` | 导入数据 |
| 导出按钮 | `bin-export-button` | 导出数据 |
| 货位表格 | `bin-table` | 数据表格 |
| 货位类型标签 | `bin-type-tag` | 类型标签 |
| 货位状态标签 | `bin-status-tag` | 状态标签 |
| 查看按钮 | `bin-view-button` | 查看详情 |
| 编辑按钮 | `bin-edit-button` | 编辑货位 |
| 删除按钮 | `bin-delete-button` | 删除货位 |
| 分页器 | `bin-pagination` | 表格分页 |
| 货位表单对话框 | `bin-form-dialog` | 表单弹窗 |
| 货位表单 | `bin-form` | 表单容器 |
| 货位编号输入 | `bin-code-input` | 编号输入 |
| 区域输入 | `bin-zone-input` | 区域输入 |
| 排输入 | `bin-row-input` | 排输入 |
| 列输入 | `bin-column-input` | 列输入 |
| 层输入 | `bin-level-input` | 层输入 |
| 货位类型选择 | `bin-type-select` | 类型选择 |
| 货位状态选择 | `bin-status-select` | 状态选择 |
| 最大承重输入 | `bin-max-weight-input` | 承重输入 |
| 最大容量输入 | `bin-max-capacity-input` | 容量输入 |
| 备注输入 | `bin-remark-input` | 备注输入 |
| 表单取消按钮 | `bin-form-cancel-button` | 取消操作 |
| 表单提交按钮 | `bin-form-submit-button` | 提交操作 |
| 批量生成对话框 | `bin-batch-create-dialog` | 批量弹窗 |
| 批量生成表单 | `bin-batch-form` | 批量表单 |
| 批量区域输入 | `bin-batch-zone-input` | 区域输入 |
| 批量起始排输入 | `bin-batch-start-row-input` | 起始排 |
| 批量结束排输入 | `bin-batch-end-row-input` | 结束排 |
| 批量起始列输入 | `bin-batch-start-column-input` | 起始列 |
| 批量结束列输入 | `bin-batch-end-column-input` | 结束列 |
| 批量起始层输入 | `bin-batch-start-level-input` | 起始层 |
| 批量结束层输入 | `bin-batch-end-level-input` | 结束层 |
| 批量类型选择 | `bin-batch-type-select` | 类型选择 |
| 批量取消按钮 | `bin-batch-cancel-button` | 取消操作 |
| 批量提交按钮 | `bin-batch-submit-button` | 提交操作 |
| 货位详情对话框 | `bin-detail-dialog` | 详情弹窗 |
| 货位详情描述列表 | `bin-detail-descriptions` | 详情展示 |
| 货位详情类型标签 | `bin-detail-type-tag` | 类型标签 |
| 货位详情状态标签 | `bin-detail-status-tag` | 状态标签 |
| 货位详情关闭按钮 | `bin-detail-close-button` | 关闭操作 |

---

## 8. 用户管理页面 (Users Management)

### 8.1 Users.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 用户管理页面 | `users-management-page` | 页面容器 |
| 操作指引按钮 | `users-guide-button` | 帮助文档 |
| 添加用户按钮 | `users-add-button` | 添加用户 |
| 批量删除按钮 | `users-batch-delete-button` | 批量删除 |
| 内容卡片 | `users-content` | 内容容器 |
| 加载状态 | `users-loading` | 加载骨架屏 |
| 用户表格 | `users-table` | 数据表格 |
| 查看按钮 | `users-view-button` | 查看详情 |
| 编辑按钮 | `users-edit-button` | 编辑用户 |
| 删除按钮 | `users-delete-button` | 删除用户 |
| 添加用户对话框 | `users-add-dialog` | 添加弹窗 |
| 添加用户表单 | `users-add-form` | 表单容器 |
| 用户名输入 | `users-add-username-input` | 用户名 |
| 密码输入 | `users-add-password-input` | 密码 |
| 真实姓名输入 | `users-add-realname-input` | 真实姓名 |
| 邮箱输入 | `users-add-email-input` | 邮箱 |
| 手机号码输入 | `users-add-phone-input` | 手机号码 |
| 角色选择 | `users-add-role-select` | 角色选择 |
| 状态单选组 | `users-add-status-radio-group` | 状态选择 |
| 启用状态选项 | `users-add-status-active-radio` | 启用 |
| 禁用状态选项 | `users-add-status-inactive-radio` | 禁用 |
| 备注输入 | `users-add-remark-input` | 备注输入 |
| 添加取消按钮 | `users-add-cancel-button` | 取消操作 |
| 添加提交按钮 | `users-add-submit-button` | 提交操作 |
| 编辑用户对话框 | `users-edit-dialog` | 编辑弹窗 |
| 编辑用户表单 | `users-edit-form` | 表单容器 |
| 编辑用户名输入 | `users-edit-username-input` | 用户名(禁用) |
| 编辑真实姓名输入 | `users-edit-realname-input` | 真实姓名 |
| 编辑邮箱输入 | `users-edit-email-input` | 邮箱 |
| 编辑手机号码输入 | `users-edit-phone-input` | 手机号码 |
| 编辑角色选择 | `users-edit-role-select` | 角色选择 |
| 编辑状态单选组 | `users-edit-status-radio-group` | 状态选择 |
| 编辑启用状态选项 | `users-edit-status-active-radio` | 启用 |
| 编辑禁用状态选项 | `users-edit-status-inactive-radio` | 禁用 |
| 编辑备注输入 | `users-edit-remark-input` | 备注输入 |
| 编辑取消按钮 | `users-edit-cancel-button` | 取消操作 |
| 编辑提交按钮 | `users-edit-submit-button` | 提交操作 |
| 用户详情对话框 | `users-detail-dialog` | 详情弹窗 |
| 用户详情描述列表 | `users-detail-descriptions` | 详情展示 |
| 用户详情ID | `users-detail-id` | 用户ID |
| 用户详情用户名 | `users-detail-username` | 用户名 |
| 用户详情真实姓名 | `users-detail-realname` | 真实姓名 |
| 用户详情邮箱 | `users-detail-email` | 邮箱 |
| 用户详情手机号码 | `users-detail-phone` | 手机号码 |
| 用户详情角色 | `users-detail-role` | 角色 |
| 用户详情状态 | `users-detail-status` | 状态 |
| 用户详情创建时间 | `users-detail-create-time` | 创建时间 |
| 用户详情更新时间 | `users-detail-update-time` | 更新时间 |
| 用户详情备注 | `users-detail-remark` | 备注 |
| 用户详情关闭按钮 | `users-detail-close-button` | 关闭操作 |
| 操作指引对话框 | `users-guide-dialog` | 指引弹窗 |

---

## 9. 库存盘点页面 (Inventory Audit)

### 9.1 InventoryAuditPage.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 盘点管理页面 | `inventory-audit-page` | 页面容器 |
| 创建盘点单按钮 | `inventory-audit-create-btn` | 创建操作 |
| 刷新按钮 | `inventory-audit-refresh-btn` | 刷新操作 |
| 表格卡片 | `inventory-audit-table-card` | 表格容器 |
| 盘点单列表表格 | `inventory-audit-list-table` | 数据表格 |
| 开始盘点按钮 | `inventory-audit-start-btn` | 开始盘点 |
| 盘点明细按钮 | `inventory-audit-detail-btn` | 查看明细 |
| 查看差异按钮 | `inventory-audit-diff-btn` | 查看差异 |
| 取消盘点按钮 | `inventory-audit-cancel-btn` | 取消盘点 |
| 创建盘点单对话框 | `inventory-audit-create-dialog` | 创建弹窗 |
| 创建盘点单表单 | `inventory-audit-create-form` | 表单容器 |
| 盘点类型选择 | `inventory-audit-type-select` | 类型选择 |
| 盘点日期选择 | `inventory-audit-date-picker` | 日期选择 |
| 创建取消按钮 | `inventory-audit-create-cancel-btn` | 取消操作 |
| 创建确认按钮 | `inventory-audit-create-confirm-btn` | 确认操作 |
| 盘点明细对话框 | `inventory-audit-items-dialog` | 明细弹窗 |
| 盘点明细表格 | `inventory-audit-items-table` | 明细数据 |
| 实际数量输入 | `inventory-audit-actual-qty-input` | 数量输入 |
| 备注输入 | `inventory-audit-notes-input` | 备注输入 |
| 记录按钮 | `inventory-audit-record-btn` | 记录操作 |
| 调整库存按钮 | `inventory-audit-adjust-btn` | 调整库存 |
| 关闭明细按钮 | `inventory-audit-items-close-btn` | 关闭弹窗 |
| 完成盘点按钮 | `inventory-audit-complete-btn` | 完成操作 |

---

## 10. 数据报表页面 (Data Reports)

### 10.1 DataReportsPage.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 数据报表页面 | `data-reports-page` | 页面容器 |
| 操作指引按钮 | `data-reports-guide-btn` | 帮助文档 |
| 导出报表按钮 | `data-reports-export-btn` | 导出操作 |
| 数据汇总卡片 | `data-reports-summary-card` | 汇总容器 |
| 总记录数项 | `data-reports-total-item` | 总数统计 |
| 今日新增项 | `data-reports-today-item` | 今日统计 |
| 本月新增项 | `data-reports-month-item` | 本月统计 |
| 总价值项 | `data-reports-value-item` | 价值统计 |
| 图表卡片 | `data-reports-chart-card` | 图表容器 |
| 图表类型选择 | `data-reports-chart-type-radio` | 图表类型 |
| 数据表格卡片 | `data-reports-table-card` | 表格容器 |
| 刷新按钮 | `data-reports-refresh-btn` | 刷新操作 |
| 数据表格 | `data-reports-table` | 详细数据 |
| 分页器 | `data-reports-pagination` | 分页组件 |
| 操作指引对话框 | `data-reports-guide-dialog` | 指引弹窗 |
| 操作指引步骤 | `data-reports-guide-steps` | 步骤组件 |

---

## 11. 个人中心页面 (User Center)

### 11.1 UserCenter.vue

| 元素 | data-cy 值 | 说明 |
|------|------------|------|
| 个人中心页面 | `user-center-page` | 页面容器 |
| 标签页容器 | `user-center-tabs` | 标签页组 |
| 个人信息标签 | `user-center-info-tab` | 信息标签页 |
| 用户头像 | `user-center-avatar` | 头像展示 |
| 头像上传组件 | `user-center-avatar-upload` | 上传组件 |
| 上传头像按钮 | `user-center-upload-avatar-btn` | 上传操作 |
| 移除头像按钮 | `user-center-remove-avatar-btn` | 移除操作 |
| 个人信息表单 | `user-center-info-form` | 表单容器 |
| 用户名输入 | `user-center-username-input` | 用户名(禁用) |
| 真实姓名输入 | `user-center-realname-input` | 真实姓名 |
| 性别选择 | `user-center-gender-select` | 性别选择 |
| 邮箱输入 | `user-center-email-input` | 邮箱地址 |
| 手机号输入 | `user-center-phone-input` | 手机号码 |
| 部门输入 | `user-center-department-input` | 部门信息 |
| 职位输入 | `user-center-position-input` | 职位信息 |
| 个性签名输入 | `user-center-signature-input` | 签名输入 |
| 保存信息按钮 | `user-center-save-info-btn` | 保存操作 |
| 重置信息按钮 | `user-center-reset-info-btn` | 重置操作 |
| 修改密码标签 | `user-center-password-tab` | 密码标签页 |
| 修改密码表单 | `user-center-password-form` | 密码表单 |
| 当前密码输入 | `user-center-old-password-input` | 旧密码 |
| 新密码输入 | `user-center-new-password-input` | 新密码 |
| 确认密码输入 | `user-center-confirm-password-input` | 确认密码 |
| 修改密码按钮 | `user-center-change-password-btn` | 修改操作 |
| 重置密码按钮 | `user-center-reset-password-btn` | 重置操作 |
| 登录日志标签 | `user-center-logs-tab` | 日志标签页 |
| 登录日志表格 | `user-center-login-logs-table` | 日志数据 |
| 日志分页器 | `user-center-logs-pagination` | 分页组件 |
| 密码保护标签 | `user-center-security-tab` | 密保标签页 |
| 密码保护表单 | `user-center-security-form` | 密保表单 |
| 当前密码输入(密保) | `user-center-security-password-input` | 验证密码 |
| 密保问题1选择 | `user-center-question1-select` | 问题选择 |
| 密保答案1输入 | `user-center-answer1-input` | 答案输入 |
| 密保问题2选择 | `user-center-question2-select` | 问题选择 |
| 密保答案2输入 | `user-center-answer2-input` | 答案输入 |
| 保存密保按钮 | `user-center-save-security-btn` | 保存操作 |
| 重置密保按钮 | `user-center-reset-security-btn` | 重置操作 |
| 操作日志标签 | `user-center-operation-tab` | 操作日志标签页 |
| 操作日志搜索表单 | `user-center-operation-search-form` | 搜索表单 |
| 操作类型选择 | `user-center-operation-type-select` | 类型筛选 |

---

## 12. 测试命令参考

### 6.1 Cypress 选择器使用示例

```javascript
// 获取页面元素
cy.get('[data-cy="login-page"]')
cy.get('[data-cy="device-list-page"]')

// 获取按钮并点击
cy.get('[data-cy="device-add-button"]').click()

// 获取输入框并输入
cy.get('[data-cy="login-username-input"]').type('admin')

// 获取表格行
cy.get('[data-cy="device-table"] tbody tr')

// 获取动态元素
cy.get(`[data-cy="device-selector-tag-${deviceId}"]`)
```

### 6.2 常用测试模式

```javascript
// 表单填写
cy.get('[data-cy="device-name-input"]').clear().type('新设备名称')
cy.get('[data-cy="device-type-select"]').click()
cy.contains('服务器').click()

// 表格操作
cy.get('[data-cy="device-table"]').find('[data-cy="device-edit-button"]').first().click()

// 对话框操作
cy.get('[data-cy="device-form-dialog"]').should('be.visible')
cy.get('[data-cy="device-form-dialog"] [data-cy="detail-dialog-confirm-btn"]').click()
```

---

## 7. 维护指南

### 7.1 添加新选择器

1. 确定元素所在组件和页面
2. 按照命名规范生成选择器名称
3. 在元素上添加 `data-cy` 属性
4. 更新本文档
5. 编写对应的测试用例

### 7.2 修改选择器

1. 评估影响范围
2. 同步更新测试代码
3. 更新本文档
4. 通知测试团队

### 7.3 版本记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-02-25 | 初始版本，完成所有基础组件和页面 |
| 1.1.0 | 2026-02-26 | 新增货位管理、用户管理、审批对话框等组件的data-cy属性；优化FilterBarForm动态属性命名；修复BaseDialog按钮命名规范 |
| 1.2.0 | 2026-02-26 | 修复库存盘点、数据报表、个人中心页面的通用命名问题；将btn-0、table-0等通用命名替换为符合规范的描述性命名；新增三个页面的完整data-cy属性清单 |

---

## 8. 验证检查清单

- [x] 所有交互元素都有唯一的 `data-cy` 属性
- [x] 命名符合 `[页面]-[元素类型]-[动作]` 格式
- [x] 使用小写字母和连字符
- [x] 避免使用动态生成的ID或索引（除特定场景外）
- [x] 权限控制的元素有明确的选择器
- [x] 动态生成的列表项使用ID作为后缀
- [x] 表单元素有明确的字段标识
- [x] 对话框按钮有操作类型标识
- [x] 筛选栏表单字段使用动态命名 `filter-{prop}-{type}`
- [x] 货位管理页面所有交互元素已添加data-cy属性
- [x] 用户管理页面所有对话框表单元素已添加data-cy属性
- [x] 审批对话框所有交互元素已添加data-cy属性
- [x] 库存盘点页面已修复通用命名问题，使用描述性命名
- [x] 数据报表页面已修复通用命名问题，使用描述性命名
- [x] 个人中心页面已修复通用命名问题，使用描述性命名
