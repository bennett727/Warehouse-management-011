# 组件开发规范

## 目录结构

```
components/
├── base/           # 基础组件 - 通用UI组件
├── business/       # 业务组件 - 特定业务逻辑组件
├── common/         # 公共组件 - 跨模块共享组件
├── layout/         # 布局组件 - 页面布局相关
└── [Component].vue # 独立组件
```

## 组件分类

### 1. Base 基础组件

位于 `components/base/`，提供通用的UI基础功能：

- `DataTable.vue` - 数据表格
- `PageLayout.vue` - 页面布局
- `BaseDialog.vue` - 基础对话框
- `ActionBar.vue` - 操作栏
- `Breadcrumb.vue` - 面包屑导航

### 2. Business 业务组件

位于 `components/business/`，按业务模块组织：

- `device/` - 设备管理相关
- `inventory/` - 库存管理相关
- `dialogs/` - 业务对话框
- `forms/` - 业务表单
- `selectors/` - 选择器组件

### 3. Common 公共组件

位于 `components/common/`，跨模块共享：

- `ErrorBoundary.vue` - 错误边界
- `ResponsiveLayout.vue` - 响应式布局
- `VirtualList.vue` - 虚拟列表

### 4. Layout 布局组件

位于 `components/layout/`，页面结构相关：

- `Layout.vue` - 主布局
- `Header.vue` - 顶部导航
- `Sidebar.vue` - 侧边栏

## 命名规范

### 文件命名

- **PascalCase**：`DeviceFormDialog.vue`
- **语义化**：组件名应清晰表达功能
- **后缀规范**：
  - 对话框：`xxxDialog.vue`
  - 表单：`xxxForm.vue`
  - 列表：`xxxList.vue`
  - 选择器：`xxxSelect.vue`

### 组件命名

```vue
<!-- 正确 -->
<DeviceFormDialog />
<InventoryList />

<!-- 错误 -->
<device-form-dialog />
<inventory-list />
```

## 组件结构

### 标准模板

```vue
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>

<script setup>
/**
 * @file: ComponentName.vue
 * @description: 组件功能描述
 * @author: 开发团队
 * @props:
 *   - prop1: 属性1描述
 *   - prop2: 属性2描述
 * @emits:
 *   - event1: 事件1描述
 *   - event2: 事件2描述
 */
import { ref, computed, watch } from 'vue';

// Props 定义
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// Emits 定义
const emit = defineEmits(['update:modelValue', 'change', 'submit']);

// 响应式数据
const localValue = ref('');
const loading = ref(false);

// 计算属性
const displayValue = computed(() => {
  return localValue.value || props.modelValue;
});

// 方法
const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped lang="scss">
.component-name {
  // 组件样式
}
</style>
```

## Props 规范

### 定义方式

```javascript
const props = defineProps({
  // 基础类型
  title: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },

  // 对象类型
  config: {
    type: Object,
    default: () => ({}),
  },

  // 数组类型
  list: {
    type: Array,
    default: () => [],
  },

  // 函数类型
  formatter: {
    type: Function,
    default: null,
  },

  // 枚举类型
  size: {
    type: String,
    validator: (value) => ['small', 'medium', 'large'].includes(value),
    default: 'medium',
  },
});
```

## Events 规范

### 命名规范

- 使用 **camelCase**
- 动词开头：`update`, `change`, `submit`, `cancel`
- 语义清晰：`update:modelValue`, `row-click`, `search-submit`

### 定义方式

```javascript
const emit = defineEmits(['update:modelValue', 'change', 'submit', 'cancel']);

// 触发事件
const handleSubmit = () => {
  emit('submit', formData);
};
```

## 样式规范

### Scoped 样式

所有组件样式必须添加 `scoped` 属性：

```vue
<style scoped lang="scss">
.component-name {
  // 样式
}
</style>
```

### BEM 命名

```scss
// Block
.device-form {
  // Element
  &__header {
    padding: 16px;
  }

  &__content {
    flex: 1;
  }

  // Modifier
  &--compact {
    padding: 8px;
  }

  &--expanded {
    padding: 24px;
  }
}
```

### 变量使用

```scss
@use '@/assets/styles/variables.scss' as *;

.component {
  color: $primary-color;
  font-size: $font-size-base;
  padding: $spacing-md;
}
```

## 最佳实践

### 1. 单一职责

每个组件只负责一个明确的功能，避免过于复杂。

### 2. 可复用性

- 提取通用逻辑到 composables
- 使用 slots 提供灵活性
- 避免硬编码业务逻辑

### 3. 性能优化

- 使用 `v-once` 渲染静态内容
- 大数据列表使用虚拟滚动
- 合理使用 `computed` 和 `watch`

### 4. 类型安全

- 为 Props 添加类型定义
- 使用 JSDoc 注释
- 复杂类型使用 TypeScript（可选）

### 5. 可访问性

- 添加适当的 ARIA 属性
- 支持键盘导航
- 提供加载和错误状态

## 组件示例

### 基础组件示例

参考 `components/base/DataTable.vue`

### 业务组件示例

参考 `components/business/device/DeviceFormDialog.vue`

### 表单组件示例

参考 `components/business/forms/UnifiedDeviceForm.vue`
