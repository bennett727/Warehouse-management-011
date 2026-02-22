# 仓库管理系统实体关系图

## 实体关系图（ERD）

```mermaid
erDiagram
    AdministrativeDivision ||--o{ AdministrativeDivision : "父级关系"
    AdministrativeDivision ||--o{ Area : "省份"
    AdministrativeDivision ||--o{ Area : "城市"
    AdministrativeDivision ||--o{ Area : "区县"
    
    DeviceType ||--o{ DeviceType : "父级类型"
    DeviceType ||--o{ Device : "设备类型"
    
    Area ||--o{ Device : "所属区域"
    Area ||--o{ Bin : "包含货位"
    Area ||--o{ StockOrder : "源区域"
    Area ||--o{ StockOrder : "目标区域"
    Area ||--o{ StockOrder : "操作区域"
    Area ||--o{ StockOrderItem : "存放区域"
    
    Device ||--o{ StockOrderItem : "订单明细"
    Device ||--o{ MaintenanceRecord : "维护记录"
    Device ||--o{ InstallationRecord : "安装记录"
    Device ||--o{ InventoryAuditItem : "盘点明细"
    Device ||--o{ Barcode : "条码"
    
    Bin ||--o{ Device : "存放设备"
    Bin ||--o{ StockOrderItem : "货位"
    
    StockOrder ||--o{ StockOrderItem : "订单明细"
    
    User ||--o{ Device : "负责人"
    User ||--o{ StockOrder : "操作人"
    User ||--o{ StockOrder : "审核人"
    
    Supplier ||--o{ Device : "供应商"
    
    Batch ||--o{ Device : "批次"
    
    AdministrativeDivision {
        bigint id PK
        varchar code UK "行政区划代码"
        varchar name "行政区划名称"
        int level "层级：1-省，2-市，3-区县"
        bigint parent_id FK "父级ID"
        int sort "排序"
        int status "状态"
        varchar remark "备注"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    Area {
        bigint id PK
        bigint area_type_id FK "区域类型ID"
        bigint warehouse_id FK "仓库ID"
        bigint province_id FK "省份ID"
        bigint city_id FK "城市ID"
        bigint district_id FK "区县ID"
        varchar code UK "区域代码"
        int sort "排序"
        bigint version "版本号"
        int status "状态：0-禁用，1-启用（枚举类型）"
        varchar remark "备注"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    DeviceType {
        bigint id PK
        varchar name "类型名称"
        varchar code UK "类型编码"
        bigint parent_id FK "父级类型ID"
        int status "状态"
        bigint version "版本号"
        varchar description "描述"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    Device {
        bigint id PK
        varchar device_code UK "设备编号"
        varchar name "设备名称"
        varchar model "设备型号"
        int status "设备状态"
        int current_stock "当前库存"
        int min_stock "最小库存"
        int max_stock "最大库存"
        int reorder_point "再订货点"
        int safety_stock "安全库存"
        bigint version "版本号"
        bigint type_id FK "设备类型ID"
        bigint area_id FK "区域ID"
        bigint bin_id FK "货位ID"
        date purchase_date "购买日期"
        date production_date "生产日期"
        int warranty_period "保修期（月）"
        datetime installation_time "安装时间"
        varchar remark "备注"
        varchar manufacturer "厂商名称"
        varchar serial_number "序列号"
        text specifications "规格参数"
        decimal price "价格"
        decimal weight "重量"
        decimal length "长度"
        decimal width "宽度"
        decimal height "高度"
        varchar weight_unit "重量单位"
        varchar dimension_unit "尺寸单位"
        bigint principal_id FK "负责人ID"
        bigint supplier_id FK "供应商ID"
        bigint batch_id FK "批次ID"
        date warranty_end "保修结束日期"
        varchar scrap_reason "报废原因"
        decimal unit_price "单价"
        varchar supplier_batch_no "供应商批次号"
        varchar image_url "图片URL"
        text description "设备描述"
        datetime scrap_time "报废时间"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    StockOrder {
        bigint id PK
        varchar order_no UK "订单号"
        int order_type "订单类型：0-入库，1-出库，2-盘点，3-调拨"
        int status "状态：0-待审核，1-处理中，2-已通过，3-已完成，4-已驳回，5-已取消"
        bigint source_area_id FK "调拨源区域ID（transferSourceArea）"
        bigint target_area_id FK "调拨目标区域ID（transferTargetArea）"
        bigint area_id FK "盘点区域ID（auditArea）"
        bigint operator_id FK "操作人ID"
        bigint audit_id FK "审核人ID"
        datetime audit_time "审核时间"
        datetime count_date "盘点日期"
        datetime transfer_date "调拨日期"
        datetime inbound_date "入库日期"
        datetime outbound_date "出库日期"
        varchar remark "备注"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    StockOrderItem {
        bigint id PK
        bigint stock_order_id FK "库存订单ID"
        bigint device_id FK "设备ID"
        bigint area_id FK "区域ID"
        bigint bin_id FK "货位ID"
        int quantity "数量"
        decimal unit_price "单价"
        decimal total_price "总价"
        varchar remark "备注"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    Bin {
        bigint id PK
        varchar code UK "货位代码"
        varchar name "货位名称"
        bigint area_id FK "区域ID"
        varchar row "行号"
        varchar column "列号"
        varchar level "层号"
        varchar location "位置描述"
        int capacity "容量"
        int used_capacity "已用容量"
        int status "状态"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    User {
        bigint id PK
        varchar username UK "用户名"
        varchar password "密码"
        varchar real_name "真实姓名"
        varchar email "邮箱"
        varchar phone "电话"
        int status "状态"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    Supplier {
        bigint id PK
        varchar supplier_name UK "供应商名称"
        varchar contact_person "联系人"
        varchar phone "电话"
        varchar email "邮箱"
        varchar address "地址"
        int status "状态"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
    
    Batch {
        bigint id PK
        varchar batch_no UK "批次号"
        varchar batch_name "批次名称"
        date production_date "生产日期"
        date expiry_date "过期日期"
        int quantity "数量"
        int status "状态"
        datetime create_time "创建时间"
        datetime update_time "更新时间"
    }
```

## 核心实体说明

### 1. AdministrativeDivision（行政区划）
- **作用**：管理省、市、区县三级行政区划
- **层级关系**：通过parent_id实现自关联，支持多级嵌套
- **关联关系**：
  - 与Area：一对多（一个行政区划对应多个区域）

### 2. Area（区域）
- **作用**：管理仓库的区域划分，支持省市区三级结构
- **字段特点**：
  - 关联字段：province_id、city_id、district_id（关联AdministrativeDivision）
  - 状态字段：status使用枚举类型（AreaStatus：0-禁用，1-启用）
- **关联关系**：
  - 与AdministrativeDivision：多对一（区域属于行政区划）
  - 与Device：一对多（一个区域包含多个设备）
  - 与Bin：一对多（一个区域包含多个货位）

### 3. DeviceType（设备类型）
- **作用**：管理设备类型，支持层级分类
- **层级关系**：通过parent_id实现自关联，支持父子类型
- **关联关系**：
  - 与Device：一对多（一个类型对应多个设备）

### 4. Device（设备）
- **作用**：核心实体，管理设备信息
- **关键字段**：
  - device_code：设备编号（唯一）
  - type_id：设备类型ID
  - area_id：区域ID
  - bin_id：货位ID
  - status：设备状态
  - current_stock：当前库存
- **关联关系**：
  - 与DeviceType：多对一（设备属于某个类型）
  - 与Area：多对一（设备属于某个区域）
  - 与Bin：多对一（设备存放在某个货位）

### 5. StockOrder（库存订单）
- **作用**：管理入库、出库、盘点、调拨等库存操作
- **订单类型**：
  - 0：入库
  - 1：出库
  - 2：盘点
  - 3：调拨
- **关联关系**：
  - 与StockOrderItem：一对多（一个订单包含多个明细）
  - 与Area：多对一（订单关联区域）

### 6. StockOrderItem（库存订单明细）
- **作用**：记录库存订单的设备明细
- **关联关系**：
  - 与StockOrder：多对一（明细属于某个订单）
  - 与Device：多对一（明细关联某个设备）
  - 与Area：多对一（明细关联存放区域）
  - 与Bin：多对一（明细关联存放货位）

## 数据流转关系

### 入库流程
```
StockOrder (order_type=0) 
  → StockOrderItem 
    → Device (current_stock增加)
    → Area (设备存放区域)
    → Bin (设备存放货位)
```

### 出库流程
```
StockOrder (order_type=1) 
  → StockOrderItem 
    → Device (current_stock减少)
    → Area (设备来源区域)
    → Bin (设备来源货位)
```

### 盘点流程
```
StockOrder (order_type=2) 
  → StockOrderItem 
    → Device (库存核对)
    → Area (盘点区域)
```

### 调拨流程
```
StockOrder (order_type=3) 
  → StockOrderItem 
    → Device (current_stock不变，位置变更)
    → Area (source_area_id → target_area_id)
    → Bin (货位变更)
```

## 索引优化建议

### 高频查询索引
1. **Device表**：
   - idx_device_code（设备编号）
   - idx_device_area_bin_status（区域+货位+状态）
   - idx_device_type_status（类型+状态）

2. **Area表**：
   - idx_area_city_district（城市+区县）
   - idx_area_status_sort（状态+排序）

3. **StockOrder表**：
   - idx_order_no（订单号）
   - idx_order_type_status（类型+状态）
   - idx_create_time（创建时间）

4. **StockOrderItem表**：
   - idx_stock_order_id（订单ID）
   - idx_device_id（设备ID）
   - idx_area_id（区域ID）

### 复合索引策略
- 遵循最左前缀原则
- 高选择性字段放在前面
- 考虑查询的WHERE、ORDER BY、JOIN条件
