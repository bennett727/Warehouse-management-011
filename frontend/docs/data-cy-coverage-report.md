# data-cy 属性覆盖报告

> 生成时间: 2026-02-26
> 文档版本: 2.0

## 1. 覆盖率概览

### 1.1 总体统计

| 指标 | 数值 |
|------|------|
| 扫描文件数 | 123 |
| 含data-cy文件 | 112 |
| 总元素数 | 1068 |
| 已覆盖元素 | 922 |
| **覆盖率** | **86.33%** |
| 覆盖率评级 | B (良好) |

### 1.2 元素类型覆盖情况

| 元素类型 | 已覆盖 | 总数 | 覆盖率 |
|----------|--------|------|--------|
| el-input | 245 | 278 | 88.1% |
| el-select | 114 | 119 | 95.8% |
| el-button | 396 | 466 | 85.0% |
| el-dialog | 59 | 75 | 78.7% |
| el-form | 50 | 62 | 80.6% |
| button | 1 | 1 | 100.0% |
| el-table | 33 | 39 | 84.6% |
| el-pagination | 19 | 21 | 90.5% |
| el-tabs | 4 | 6 | 66.7% |
| el-menu | 1 | 1 | 100.0% |

## 2. 命名规范

本项目遵循以下data-cy命名规范：

```
[页面/模块]-[元素类型]-[动作/描述]
```

### 2.1 命名示例

- `inventory-list-table` - 库存列表表格
- `inbound-order-no-column` - 入库单号列
- `outbound-status-tag` - 出库状态标签
- `device-view-btn` - 设备查看按钮
- `division-create-form` - 区划创建表单

### 2.2 常见前缀

| 前缀 | 含义 |
|------|------|
| `inventory-*` | 库存管理模块 |
| `inbound-*` | 入库管理模块 |
| `outbound-*` | 出库管理模块 |
| `device-*` | 设备管理模块 |
| `division-*` | 行政区划模块 |
| `alert-config-*` | 预警配置模块 |
| `stock-count-*` | 盘点管理模块 |
| `maintenance-*` | 保养管理模块 |
| `repair-*` | 维修管理模块 |
| `scrap-*` | 报废管理模块 |
| `installation-*` | 安装记录模块 |

## 3. 已覆盖组件清单

### 3.1 库存管理模块

#### InventoryList.vue
- `inventory-list-search-form` - 搜索表单
- `inventory-list-form-item-${field.prop}` - 表单项
- `inventory-list-input-${field.prop}` - 输入框
- `inventory-list-select-${field.prop}` - 选择框
- `inventory-search-btn` - 搜索按钮
- `inventory-reset-btn` - 重置按钮
- `inventory-add-btn` - 新增按钮
- `inventory-batch-delete-btn` - 批量删除按钮
- `inventory-batch-export-btn` - 批量导出按钮
- `inventory-list-table` - 表格
- `inventory-selection-column` - 选择列
- `inventory-index-column` - 序号列
- `inventory-actions-column` - 操作列
- `inventory-view-btn` - 查看按钮
- `inventory-edit-btn` - 编辑按钮
- `inventory-delete-btn` - 删除按钮
- `inventory-list-pagination` - 分页组件

#### InventoryAuditPage.vue
- `audit-pending-table` - 待审核表格
- `audit-pending-selection-column` - 选择列
- `audit-pending-index-column` - 序号列
- `audit-pending-order-no-column` - 单号列
- `audit-pending-type-column` - 类型列
- `audit-pending-type-tag` - 类型标签
- `audit-pending-status-column` - 状态列
- `audit-pending-status-tag` - 状态标签
- `audit-pending-actions-column` - 操作列
- `audit-pending-view-btn` - 查看按钮
- `audit-pending-approve-btn` - 通过按钮
- `audit-pending-reject-btn` - 驳回按钮
- `audit-history-table` - 历史记录表格
- `audit-history-selection-column` - 选择列
- `audit-history-index-column` - 序号列
- `audit-history-order-no-column` - 单号列
- `audit-history-type-column` - 类型列
- `audit-history-type-tag` - 类型标签
- `audit-history-status-column` - 状态列
- `audit-history-status-tag` - 状态标签
- `audit-history-actions-column` - 操作列
- `audit-history-view-btn` - 查看按钮

### 3.2 入库管理模块

#### InboundManagementOptimized.vue
- `inbound-selection-column` - 选择列
- `inbound-index-column` - 序号列
- `inbound-order-no-column` - 入库单号列
- `inbound-type-column` - 入库类型列
- `inbound-type-tag-${row.id}` - 类型标签
- `inbound-date-column` - 入库日期列
- `inbound-supplier-column` - 供应商列
- `inbound-warehouse-column` - 入库仓库列
- `inbound-operator-column` - 经办人列
- `inbound-total-qty-column` - 总数量列
- `inbound-total-amount-column` - 总金额列
- `inbound-status-column` - 状态列
- `inbound-status-tag-${row.id}` - 状态标签
- `inbound-remark-column` - 备注列
- `inbound-actions-column` - 操作列
- `inbound-view-btn` - 查看按钮
- `inbound-edit-btn` - 编辑按钮
- `inbound-delete-btn` - 删除按钮
- `inbound-submit-btn` - 提交按钮
- `inbound-audit-btn` - 审核按钮
- `inbound-execute-btn` - 执行按钮
- `inbound-resubmit-btn` - 重新提交按钮
- `inbound-detail-table` - 详情表格
- `detail-index-column` - 序号列
- `detail-device-code-column` - 设备编号列
- `detail-device-name-column` - 设备名称列
- `detail-spec-column` - 规格型号列
- `detail-bin-code-column` - 货位列
- `detail-quantity-column` - 数量列
- `detail-unit-price-column` - 单价列
- `detail-total-price-column` - 金额列
- `detail-batch-no-column` - 批次号列
- `detail-remark-column` - 备注列

### 3.3 出库管理模块

#### OutboundManagementOptimized.vue
- `outbound-selection-column` - 选择列
- `outbound-order-no-column` - 出库单号列
- `outbound-date-column` - 出库日期列
- `outbound-type-column` - 出库类型列
- `outbound-type-tag-${row.id}` - 类型标签
- `outbound-customer-column` - 客户/单位列
- `outbound-operator-column` - 经办人列
- `outbound-total-qty-column` - 总数量列
- `outbound-status-column` - 状态列
- `outbound-status-tag-${row.id}` - 状态标签
- `outbound-actions-column` - 操作列
- `outbound-view-btn` - 查看按钮
- `outbound-edit-btn` - 编辑按钮
- `outbound-delete-btn` - 删除按钮
- `outbound-submit-btn` - 提交审核按钮
- `outbound-audit-btn` - 审核按钮
- `outbound-execute-btn` - 执行出库按钮
- `outbound-resubmit-btn` - 重新提交按钮
- `outbound-detail-table` - 详情表格
- `detail-index-column` - 序号列
- `detail-device-code-column` - 设备编号列
- `detail-device-name-column` - 设备名称列
- `detail-model-column` - 规格型号列
- `detail-quantity-column` - 数量列
- `detail-location-column` - 货位列

### 3.4 盘点管理模块

#### StockCountPage.vue
- `stock-count-index-column` - 序号列
- `stock-count-no-column` - 盘点单号列
- `stock-count-type-column` - 盘点类型列
- `stock-count-type-tag-${row.id}` - 类型标签
- `stock-count-date-column` - 盘点日期列
- `stock-count-warehouse-column` - 盘点仓库列
- `stock-count-zone-column` - 盘点区域列
- `stock-count-operator-column` - 盘点人员列
- `stock-count-total-items-column` - 盘点项数列
- `stock-count-diff-items-column` - 差异项数列
- `stock-count-diff-tag-${row.id}` - 差异标签
- `stock-count-status-column` - 状态列
- `stock-count-status-tag-${row.id}` - 状态标签
- `stock-count-remark-column` - 备注列
- `stock-count-actions-column` - 操作列
- `stock-count-detail-table` - 详情表格
- `detail-index-column` - 序号列
- `detail-device-code-column` - 设备编号列
- `detail-device-name-column` - 设备名称列
- `detail-spec-column` - 规格型号列
- `detail-bin-code-column` - 货位列
- `detail-book-qty-column` - 账面数量列
- `detail-actual-qty-column` - 实盘数量列
- `detail-diff-qty-column` - 差异数量列
- `detail-diff-value-${row.id}` - 差异值
- `detail-diff-reason-column` - 差异原因列
- `detail-remark-column` - 备注列

### 3.5 保养管理模块

#### MaintenancePage.vue
- `maintenance-index-column` - 序号列
- `maintenance-no-column` - 保养单号列
- `maintenance-device-code-column` - 设备编号列
- `maintenance-device-name-column` - 设备名称列
- `maintenance-type-column` - 保养类型列
- `maintenance-type-tag-${row.id}` - 类型标签
- `maintenance-date-column` - 保养日期列
- `maintenance-operator-column` - 保养人员列
- `maintenance-status-column` - 状态列
- `maintenance-status-tag-${row.id}` - 状态标签
- `maintenance-actions-column` - 操作列

### 3.6 维修管理模块

#### RepairPage.vue
- `repair-index-column` - 序号列
- `repair-no-column` - 维修单号列
- `repair-source-type-column` - 来源类型列
- `repair-source-type-tag-${row.id}` - 来源类型标签
- `repair-source-no-column` - 来源单号列
- `repair-source-no-link-${row.id}` - 来源单号链接
- `repair-manual-tag-${row.id}` - 手动创建标签
- `repair-device-code-column` - 设备编号列
- `repair-device-name-column` - 设备名称列
- `repair-device-model-column` - 规格型号列
- `repair-fault-desc-column` - 故障描述列
- `repair-status-column` - 状态列
- `repair-status-tag-${row.id}` - 状态标签
- `repair-create-time-column` - 创建时间列
- `repair-actions-column` - 操作列

### 3.7 报废管理模块

#### ScrapPage.vue
- `scrap-index-column` - 序号列
- `scrap-no-column` - 报废单号列
- `scrap-source-outbound-column` - 来源出库单列
- `scrap-source-outbound-link-${row.id}` - 来源出库单链接
- `scrap-manual-tag-${row.id}` - 手动创建标签
- `scrap-device-code-column` - 设备编号列
- `scrap-device-name-column` - 设备名称列
- `scrap-device-model-column` - 规格型号列
- `scrap-reason-column` - 报废原因列
- `scrap-status-column` - 状态列
- `scrap-status-tag-${row.id}` - 状态标签
- `scrap-create-time-column` - 创建时间列
- `scrap-actions-column` - 操作列

### 3.8 安装记录模块

#### InstallationPage.vue
- `installation-index-column` - 序号列
- `installation-no-column` - 安装单号列
- `installation-source-type-column` - 来源类型列
- `installation-source-type-tag-${row.id}` - 来源类型标签
- `installation-source-no-column` - 来源单号列
- `installation-source-no-link-${row.id}` - 来源单号链接
- `installation-manual-tag-${row.id}` - 手动创建标签
- `installation-device-code-column` - 设备编号列
- `installation-device-name-column` - 设备名称列
- `installation-device-model-column` - 规格型号列
- `installation-location-column` - 安装位置列
- `installation-status-column` - 状态列
- `installation-status-tag-${row.id}` - 状态标签
- `installation-create-time-column` - 创建时间列
- `installation-actions-column` - 操作列

### 3.9 预警配置模块

#### EnhancedAlertConfigPage.vue
- `alert-config-index-column` - 序号列
- `alert-config-name-column` - 配置名称列
- `alert-config-type-column` - 预警类型列
- `alert-config-type-tag-${row.id}` - 类型标签
- `alert-config-threshold-column` - 阈值列
- `alert-config-status-column` - 状态列
- `alert-config-status-switch-${row.id}` - 状态开关
- `alert-config-create-time-column` - 创建时间列
- `alert-config-actions-column` - 操作列

### 3.10 货位管理模块

#### BinManagement.vue
- `bin-selection-column` - 选择列
- `bin-code-column` - 货位编号列
- `bin-zone-column` - 区域列
- `bin-row-column` - 排列
- `bin-column-column` - 列列
- `bin-level-column` - 层列
- `bin-type-column` - 货位类型列
- `bin-type-tag-${row.id}` - 类型标签
- `bin-status-column` - 货位状态列
- `bin-status-tag-${row.id}` - 状态标签
- `bin-usage-column` - 使用率列
- `bin-actions-column` - 操作列
- `bin-view-button` - 查看按钮
- `bin-edit-button` - 编辑按钮
- `bin-delete-button` - 删除按钮
- `bin-pagination` - 分页组件

### 3.11 行政区划模块

#### AdministrativeDivisionCascader.vue
- `division-create-dialog` - 创建对话框
- `division-create-form` - 创建表单
- `division-create-name-input` - 名称输入框
- `division-create-code-input` - 编码输入框
- `division-create-cancel-btn` - 取消按钮
- `division-create-confirm-btn` - 确认按钮

#### DivisionCreationWizard.vue
- `division-parent-form` - 上级区划表单
- `division-province-select` - 省份选择框
- `division-city-select` - 城市选择框
- `division-detail-form` - 详细信息表单
- `division-name-input` - 名称输入框
- `division-code-input` - 编码输入框
- `division-zipcode-input` - 邮编输入框
- `division-areacode-input` - 区号输入框
- `division-sort-input` - 排序号输入框
- `division-remark-input` - 备注输入框

### 3.12 入库明细表单模块

#### OtherInboundDetailForm.vue
- `other-inbound-description-input` - 描述输入框
- `other-inbound-device-status-select` - 设备状态选择框
- `other-inbound-contact-phone-input` - 联系电话输入框
- `other-inbound-source-address-input` - 来源地址输入框
- `other-inbound-value-type-select` - 价值类型选择框
- `other-inbound-appraiser-input` - 评估人输入框
- `other-inbound-remark-input` - 备注输入框

## 4. 待完善组件清单

以下组件仍需添加data-cy属性（共23个文件）：

### 4.1 入库明细表单
- `ReturnDetailForm.vue` (4个元素) - 退货类型、优先级、设备状态选择框
- `TransferInboundDetailForm.vue` (6个元素) - 调拨类型、优先级、源仓库等选择框

### 4.2 入库设备表单
- `InboundDeviceForm.vue` (4个元素) - 设备编码预览、图片预览对话框等

### 4.3 创建向导
- `InboundCreationWizard.vue` (2个元素) - 设备列表表格
- `OutboundCreationWizard.vue` (4个元素) - 出库仓库选择、设备搜索等

### 4.4 业务管理
- `UnifiedBusinessManagement.vue` (2个元素) - 分页组件、搜索输入框

### 4.5 库存管理
- `EnhancedAlertConfigPage.vue` (5个元素) - 表单输入框
- `AreaManagement.vue` (7个元素) - 区域表单输入框
- `InboundManagementOptimized.vue` (20个元素) - 详情对话框按钮
- `InstallationPage.vue` (8个元素) - 操作按钮和对话框
- `MaintenancePage.vue` (3个元素) - 操作按钮和对话框
- `OutboundManagementOptimized.vue` (2个元素) - 操作按钮和对话框

### 4.6 其他
- `InventoryManagementPage.vue` (1个元素) - 标签页

## 5. 改进建议

### 5.1 已完成目标 ✅
1. ✅ 将覆盖率提升至80%以上 (当前86.33%)
2. ✅ 优先处理核心业务流程组件
3. ✅ 完善表单类组件的data-cy属性

### 5.2 短期目标
1. 将覆盖率提升至90%以上
2. 完成剩余23个文件的data-cy属性添加
3. 重点处理对话框和表格组件

### 5.3 长期目标
1. 实现100%覆盖率
2. 建立自动化测试流程
3. 在代码审查中强制执行data-cy规范

### 5.3 最佳实践
1. 使用有意义的命名，避免使用无意义的缩写
2. 避免使用动态生成的data-cy值（除非必要）
3. 保持命名的一致性，遵循项目规范
4. 在添加新功能时同步添加data-cy属性
5. 定期运行覆盖率检查脚本

## 6. 工具使用

### 6.1 覆盖率检查
```bash
cd frontend
node scripts/check-data-cy-coverage.js
```

### 6.2 命名规范验证
确保所有data-cy属性遵循 `[模块]-[元素]-[动作]` 的命名规范。

## 7. 附录

### 7.1 相关文档
- [data-cy命名规范](./data-cy-naming-conventions.md)
- [测试策略文档](./testing-strategy.md)
- [前端开发规范](./frontend-development-guide.md)

### 7.2 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0 | 2026-02-26 | 初始版本，覆盖率73.22% |
| 2.0 | 2026-02-26 | 覆盖率提升至86.33%，新增140个data-cy属性，覆盖23个新增文件 |
| 3.0 | 2026-02-26 | 覆盖率提升至91.85%，评级达到A(优秀)，el-select达到100%覆盖 |
