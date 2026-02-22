<!--
  @file: AreaTree.vue
  @description: 区域树组件，展示区域层级结构
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <div class="area-tree" v-loading="loading">
    <el-empty v-if="!loading && data.length === 0" description="暂无区域数据" />
    <el-tree
      v-else
      :data="data"
      :props="defaultProps"
      node-key="id"
      highlight-current
      default-expand-all
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <span class="tree-node">
          <el-icon class="node-icon">
            <OfficeBuilding v-if="data.type === 'building'" />
            <Location v-else-if="data.type === 'floor'" />
            <HomeFilled v-else />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
          <span v-if="data.deviceCount" class="node-count">({{ data.deviceCount }})</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { OfficeBuilding, Location, HomeFilled } from '@element-plus/icons-vue';

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['node-click']);

const defaultProps = {
  children: 'children',
  label: 'name',
};

const handleNodeClick = (data, node) => {
  emit('node-click', data, node);
};
</script>

<style scoped>
.area-tree {
  height: 100%;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  color: #409eff;
  font-size: 16px;
}

.node-label {
  font-size: 14px;
}

.node-count {
  font-size: 12px;
  color: #909399;
}
</style>
