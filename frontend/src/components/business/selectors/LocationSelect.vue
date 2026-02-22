<!--
  @file: LocationSelect.vue
  @description: 统一的区域选择组件，提供省市区三级级联选择功能
  @author: 开发团队
  @createTime: 2026-02-06
  @version: 1.0
-->
<template>
  <div class="location-select-container">
    <el-cascader
      v-model="selectedLocation"
      :options="cascaderOptions"
      :props="cascaderProps"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :filterable="filterable"
      :show-all-levels="showAllLevels"
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="collapseTagsTooltip"
      :max-collapse-tags="maxCollapseTags"
      @change="handleChange"
      @expand-change="handleExpandChange"
      class="location-cascader"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';

import { useAreaStore } from '@/stores/area';
import { createLogger } from '@/utils/logger';

const logger = createLogger('LocationSelect');

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择省市区',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  filterable: {
    type: Boolean,
    default: true,
  },
  showAllLevels: {
    type: Boolean,
    default: true,
  },
  collapseTags: {
    type: Boolean,
    default: false,
  },
  collapseTagsTooltip: {
    type: Boolean,
    default: true,
  },
  maxCollapseTags: {
    type: Number,
    default: 1,
  },
  showDeviceCount: {
    type: Boolean,
    default: false,
  },
  lazy: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'expand-change']);

const areaStore = useAreaStore();

const selectedLocation = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const cascaderProps = computed(() => ({
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: true,
  lazy: props.lazy,
  lazyLoad: props.lazy ? lazyLoad : null,
  expandTrigger: 'hover',
}));

const cascaderOptions = computed(() => {
  if (!areaStore.areaTree || areaStore.areaTree.length === 0) {
    return [];
  }

  return transformAreaTreeToCascaderOptions(areaStore.areaTree);
});

function transformAreaTreeToCascaderOptions(areas) {
  return areas.map((area) => {
    const option = {
      id: area.id,
      name: area.name,
      code: area.code,
      leaf: !area.children || area.children.length === 0,
    };

    if (area.children && area.children.length > 0) {
      option.children = transformAreaTreeToCascaderOptions(area.children);
    }

    if (props.showDeviceCount && area.deviceCount !== undefined) {
      option.name = `${area.name} (${area.deviceCount})`;
    }

    return option;
  });
}

async function lazyLoad(node, resolve) {
  const { level, data } = node;

  if (level === 0) {
    const provinces = await areaStore.loadAreas();
    const options = transformAreaTreeToCascaderOptions(provinces);
    resolve(options);
  } else if (level === 1) {
    const cities = await areaStore.loadSubAreas(data.id);
    const options = transformAreaTreeToCascaderOptions(cities);
    resolve(options);
  } else if (level === 2) {
    const districts = await areaStore.loadSubAreas(data.id);
    const options = transformAreaTreeToCascaderOptions(districts);
    resolve(options);
  } else {
    resolve([]);
  }
}

function handleChange(value) {
  emit('change', value);
}

function handleExpandChange(value) {
  emit('expand-change', value);
}

async function loadAreaData() {
  try {
    await areaStore.loadAreaTree();
  } catch (error) {
    logger.error('加载区域数据失败', error);
  }
}

onMounted(() => {
  loadAreaData();
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      selectedLocation.value = newVal;
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.location-select-container {
  width: 100%;
}

.location-cascader {
  width: 100%;
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-cascader__tags) {
  flex-wrap: nowrap;
  overflow: hidden;
}

:deep(.el-cascader__tags-text) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
