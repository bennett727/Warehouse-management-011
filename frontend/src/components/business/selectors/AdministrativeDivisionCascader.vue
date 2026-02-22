<template>
  <div class="administrative-division-cascader">
    <div class="cascader-wrapper">
      <el-cascader
        v-model="selectedValues"
        :options="cascaderOptions"
        :props="cascaderProps"
        :placeholder="placeholder"
        :clearable="clearable"
        :filterable="filterable"
        :disabled="disabled"
        :size="size"
        style="width: 100%"
        @change="handleChange"
        @visible-change="handleVisibleChange"
      >
        <template #empty>
          <div class="cascader-empty">
            <el-empty description="暂无数据" :image-size="60" />
            <el-button v-if="allowCreate" type="primary" link size="small" @click="handleQuickCreate">
              <el-icon><Plus /></el-icon>
              快速创建
            </el-button>
          </div>
        </template>
      </el-cascader>

      <!-- 快速创建按钮 -->
      <el-tooltip v-if="allowCreate" content="快速创建行政区划" placement="top">
        <el-button class="quick-create-btn" :size="size" circle @click="handleQuickCreate">
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- 最近使用 -->
    <div v-if="showRecent && recentDivisions.length > 0 && !selectedValues.length" class="recent-divisions">
      <span class="recent-label">最近使用:</span>
      <el-tag
        v-for="item in recentDivisions"
        :key="item.id"
        size="small"
        class="recent-tag"
        @click="handleRecentClick(item)"
      >
        {{ item.name }}
      </el-tag>
    </div>

    <!-- 快速创建对话框 -->
    <el-dialog v-model="createDialogVisible" title="快速创建行政区划" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="级别" prop="level">
          <el-radio-group v-model="createForm.level">
            <el-radio-button :label="1">省份</el-radio-button>
            <el-radio-button :label="2">城市</el-radio-button>
            <el-radio-button :label="3">区县</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="createForm.level > 1" label="上级区划" prop="parentId">
          <el-cascader
            v-model="createForm.parentId"
            :options="parentOptions"
            :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }"
            placeholder="请选择上级区划"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入行政区划名称" clearable />
        </el-form-item>

        <el-form-item label="编码" prop="code">
          <el-input v-model="createForm.code" placeholder="请输入行政区划编码" clearable />
          <div class="form-tip">编码规则：省份6位(如440000)，城市4位(如440100)，区县2位(如440106)</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateSubmit"> 创建 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, computed, watch, onMounted } from 'vue';

import {
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  createDivision,
  getDivisionTree,
} from '@/api/administrativeDivision';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AdministrativeDivisionCascader');

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择省/市/区',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  filterable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'default',
  },
  allowCreate: {
    type: Boolean,
    default: true,
  },
  // 是否返回完整路径数据
  emitPath: {
    type: Boolean,
    default: true,
  },
  // 是否显示最近使用
  showRecent: {
    type: Boolean,
    default: true,
  },
  // 最近使用存储键
  recentKey: {
    type: String,
    default: 'administrative_division_recent',
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'create']);

// 内部选中值
const selectedValues = ref([]);

// 级联选项数据
const cascaderOptions = ref([]);

// 最近使用的行政区划
const recentDivisions = ref([]);

// 加载最近使用
function loadRecentDivisions() {
  try {
    const stored = localStorage.getItem(props.recentKey);
    if (stored) {
      recentDivisions.value = JSON.parse(stored);
    }
  } catch (error) {
    logger.error('加载最近使用数据失败:', error);
  }
}

// 保存到最近使用
function saveToRecent(division) {
  try {
    const existingIndex = recentDivisions.value.findIndex((item) => item.id === division.id);
    if (existingIndex > -1) {
      recentDivisions.value.splice(existingIndex, 1);
    }
    recentDivisions.value.unshift({
      id: division.id,
      name: division.name,
      level: division.level,
      parentId: division.parentId,
      timestamp: Date.now(),
    });
    recentDivisions.value = recentDivisions.value.slice(0, 5);
    localStorage.setItem(props.recentKey, JSON.stringify(recentDivisions.value));
  } catch (error) {
    logger.error('保存最近使用数据失败:', error);
  }
}

// 处理最近使用点击
function handleRecentClick(item) {
  const path = buildPathFromItem(item);
  selectedValues.value = path;
  handleChange(path);
}

// 从item构建路径
function buildPathFromItem(item) {
  const path = [];
  if (item.level === 1) {
    path.push(item.id);
  } else if (item.level === 2) {
    path.push(item.parentId, item.id);
  } else if (item.level === 3) {
    const parent = recentDivisions.value.find((d) => d.id === item.parentId);
    if (parent && parent.parentId) {
      path.push(parent.parentId, item.parentId, item.id);
    } else {
      path.push(item.parentId, item.id);
    }
  }
  return path;
}

// 级联配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  lazy: true,
  lazyLoad: lazyLoadHandler,
  emitPath: props.emitPath,
};

// 创建对话框相关
const createDialogVisible = ref(false);
const creating = ref(false);
const formRef = ref(null);
const parentOptions = ref([]);

const createForm = ref({
  level: 1,
  parentId: null,
  name: '',
  code: '',
});

const createRules = {
  level: [{ required: true, message: '请选择级别', trigger: 'change' }],
  parentId: [
    {
      required: true,
      message: '请选择上级区划',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (createForm.value.level > 1 && (!value || value.length === 0)) {
          callback(new Error('请选择上级区划'));
        } else {
          callback();
        }
      },
    },
  ],
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入编码', trigger: 'blur' },
    { min: 6, max: 20, message: '编码长度不正确', trigger: 'blur' },
    {
      pattern: /^\d{6,20}$/,
      message: '编码必须为数字',
      trigger: 'blur',
    },
  ],
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    selectedValues.value = newVal || [];
  },
  { immediate: true }
);

// 监听内部值变化
watch(selectedValues, (newVal) => {
  emit('update:modelValue', newVal);
});

// 懒加载处理
async function lazyLoadHandler(node, resolve) {
  const { level, value } = node;

  try {
    let data = [];

    if (level === 0) {
      // 加载省份
      const res = await getProvinces();
      if (res.code === 200 && res.data) {
        data = res.data.map((item) => ({
          ...item,
          leaf: false,
        }));
      }
    } else if (level === 1) {
      // 加载城市
      const res = await getCitiesByProvince(value);
      if (res.code === 200 && res.data) {
        data = res.data.map((item) => ({
          ...item,
          leaf: false,
        }));
      }
    } else if (level === 2) {
      // 加载区县
      const res = await getDistrictsByCity(value);
      if (res.code === 200 && res.data) {
        data = res.data.map((item) => ({
          ...item,
          leaf: true,
        }));
      }
    }

    resolve(data);
  } catch (error) {
    logger.error('加载行政区划数据失败:', error);
    ElMessage.error('加载数据失败');
    resolve([]);
  }
}

// 处理选择变化
function handleChange(value) {
  logger.debug('行政区划选择变化:', value);

  // 获取选中的完整数据
  const selectedData = getSelectedData(value);

  emit('change', {
    value,
    data: selectedData,
    province: selectedData[0] || null,
    city: selectedData[1] || null,
    district: selectedData[2] || null,
    // 拼接完整地址
    fullAddress: selectedData
      .map((item) => item?.name)
      .filter(Boolean)
      .join(''),
  });
}

// 获取选中的完整数据
function getSelectedData(value) {
  if (!value || value.length === 0) {
    return [];
  }

  // 这里简化处理，实际可能需要从缓存或API获取完整数据
  return value.map((id, index) => ({
    id,
    name: '', // 实际应该根据ID查找名称
    level: index + 1,
  }));
}

// 处理下拉框显示变化
async function handleVisibleChange(visible) {
  if (visible && parentOptions.value.length === 0) {
    // 预加载父级选项数据（用于快速创建）
    try {
      const res = await getDivisionTree();
      if (res.code === 200 && res.data) {
        parentOptions.value = res.data;
      }
    } catch (error) {
      logger.error('预加载行政区划数据失败:', error);
    }
  }
}

// 处理快速创建
function handleQuickCreate() {
  createForm.value = {
    level: 1,
    parentId: null,
    name: '',
    code: '',
  };
  createDialogVisible.value = true;
}

// 监听级别变化，自动生成编码
watch(
  () => createForm.value.level,
  (newLevel) => {
    if (newLevel === 1) {
      // 省份编码：6位，后4位为0
      createForm.value.code = generateProvinceCode();
    } else if (newLevel === 2 && createForm.value.parentId) {
      // 城市编码：基于父级编码
      generateCityCode();
    } else if (newLevel === 3 && createForm.value.parentId) {
      // 区县编码：基于父级编码
      generateDistrictCode();
    }
  }
);

// 监听父级变化，更新编码
watch(
  () => createForm.value.parentId,
  (newParentId) => {
    if (createForm.value.level === 2 && newParentId) {
      generateCityCode();
    } else if (createForm.value.level === 3 && newParentId) {
      generateDistrictCode();
    }
  }
);

// 生成省份编码
function generateProvinceCode() {
  // 生成随机的2位数字前缀，后4位为0
  const prefix = Math.floor(Math.random() * 90 + 10).toString();
  return `${prefix}0000`;
}

// 生成城市编码
function generateCityCode() {
  const parentId = Array.isArray(createForm.value.parentId)
    ? createForm.value.parentId[createForm.value.parentId.length - 1]
    : createForm.value.parentId;

  if (!parentId) {
    return;
  }

  // 查找父级编码
  const parent = findDivisionById(parentId, parentOptions.value);
  if (parent && parent.code) {
    // 城市编码：父级前2位 + 随机2位 + 00
    const prefix = parent.code.substring(0, 2);
    const suffix = Math.floor(Math.random() * 90 + 10).toString();
    createForm.value.code = `${prefix + suffix}00`;
  }
}

// 生成区县编码
function generateDistrictCode() {
  const parentId = Array.isArray(createForm.value.parentId)
    ? createForm.value.parentId[createForm.value.parentId.length - 1]
    : createForm.value.parentId;

  if (!parentId) {
    return;
  }

  // 查找父级编码
  const parent = findDivisionById(parentId, parentOptions.value);
  if (parent && parent.code) {
    // 区县编码：父级前4位 + 随机2位
    const prefix = parent.code.substring(0, 4);
    const suffix = Math.floor(Math.random() * 90 + 10).toString();
    createForm.value.code = prefix + suffix;
  }
}

// 递归查找行政区划
function findDivisionById(id, divisions) {
  for (const division of divisions) {
    if (division.id === id) {
      return division;
    }
    if (division.children && division.children.length > 0) {
      const found = findDivisionById(id, division.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// 提交创建
async function handleCreateSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  creating.value = true;
  try {
    const data = {
      ...createForm.value,
      parentId: Array.isArray(createForm.value.parentId)
        ? createForm.value.parentId[createForm.value.parentId.length - 1]
        : createForm.value.parentId,
      status: 1,
    };

    const res = await createDivision(data);
    if (res.code === 200) {
      ElMessage.success('创建成功');
      createDialogVisible.value = false;

      // 保存到最近使用
      if (res.data) {
        saveToRecent(res.data);
      }

      // 触发创建成功事件
      emit('create', res.data);

      // 自动选中新创建的区划
      if (res.data) {
        autoSelectNewDivision(res.data);
      }
    } else {
      ElMessage.error(res.message || '创建失败');
    }
  } catch (error) {
    logger.error('创建行政区划失败:', error);
    ElMessage.error('创建失败');
  } finally {
    creating.value = false;
  }
}

// 自动选中新创建的区划
function autoSelectNewDivision(division) {
  // 根据级别构建选中路径
  const path = [];
  if (division.level === 1) {
    path.push(division.id);
  } else if (division.level === 2) {
    path.push(division.parentId, division.id);
  } else if (division.level === 3) {
    // 需要找到完整路径
    path.push(division.parentId, division.id);
  }

  selectedValues.value = path;
  handleChange(path);
}

// 组件挂载时加载初始数据
onMounted(async () => {
  // 加载最近使用
  loadRecentDivisions();

  // 如果有初始值，需要加载对应的数据
  if (props.modelValue && props.modelValue.length > 0) {
    // 这里可以加载初始数据
    selectedValues.value = props.modelValue;
  }
});
</script>

<style scoped>
.administrative-division-cascader {
  width: 100%;
}

.cascader-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cascader-wrapper :deep(.el-cascader) {
  flex: 1;
}

.quick-create-btn {
  flex-shrink: 0;
}

.recent-divisions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.recent-label {
  font-size: 12px;
  color: #909399;
  margin-right: 4px;
}

.recent-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.recent-tag:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.cascader-empty {
  padding: 20px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-cascader) {
  width: 100%;
}
</style>
