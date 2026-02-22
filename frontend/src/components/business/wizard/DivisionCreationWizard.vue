<template>
  <el-dialog
    v-model="visible"
    :title="isQuickMode ? '快速创建行政区划' : '创建行政区划'"
    width="650px"
    :close-on-click-modal="false"
    destroy-on-close
    class="division-creation-wizard"
  >
    <!-- 模式切换和步骤条 -->
    <div class="wizard-header">
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step :title="isQuickMode ? '快速填写' : '选择类型'" />
        <el-step :title="isQuickMode ? '确认' : '选择上级'" v-if="!isQuickMode || creationType !== 'province'" />
        <el-step title="填写信息" v-if="!isQuickMode" />
        <el-step title="确认创建" v-if="!isQuickMode" />
      </el-steps>
      <el-switch
        v-model="isQuickMode"
        active-text="快速模式"
        inactive-text="向导模式"
        @change="handleModeChange"
        class="mode-switch"
      />
    </div>

    <!-- 步骤1: 选择类型 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="step-description">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>请选择要创建的行政区划类型</template>
        </el-alert>
      </div>

      <div class="creation-type-cards">
        <div class="type-card" :class="{ active: creationType === 'province' }" @click="creationType = 'province'">
          <div class="type-icon province">
            <el-icon><MapLocation /></el-icon>
          </div>
          <div class="type-info">
            <div class="type-name">省级行政区</div>
            <div class="type-desc">如：广东省、湖南省</div>
          </div>
          <div class="type-check" v-if="creationType === 'province'">
            <el-icon><Check /></el-icon>
          </div>
        </div>

        <div
          class="type-card"
          :class="{ active: creationType === 'city', disabled: provinceOptions.length === 0 }"
          @click="provinceOptions.length > 0 && (creationType = 'city')"
        >
          <div class="type-icon city">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="type-info">
            <div class="type-name">市级行政区</div>
            <div class="type-desc">如：广州市、深圳市</div>
          </div>
          <div class="type-check" v-if="creationType === 'city'">
            <el-icon><Check /></el-icon>
          </div>
        </div>

        <div
          class="type-card"
          :class="{ active: creationType === 'district', disabled: provinceOptions.length === 0 }"
          @click="provinceOptions.length > 0 && (creationType = 'district')"
        >
          <div class="type-icon district">
            <el-icon><Location /></el-icon>
          </div>
          <div class="type-info">
            <div class="type-name">区县级行政区</div>
            <div class="type-desc">如：天河区、海珠区</div>
          </div>
          <div class="type-check" v-if="creationType === 'district'">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>

      <!-- 快捷创建路径展示 -->
      <div v-if="creationType !== 'province'" class="creation-path-preview">
        <el-divider>创建路径预览</el-divider>
        <el-steps :active="getPathActiveIndex()" simple>
          <el-step v-for="(item, index) in getCreationPath()" :key="index" :title="item" />
        </el-steps>
      </div>
    </div>

    <!-- 步骤2: 选择上级 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="step-description">
        <el-alert type="info" :closable="false" show-icon>
          <template #title> 请选择{{ creationType === 'city' ? '所属省份' : '所属省市' }} </template>
        </el-alert>
      </div>

      <el-form label-width="100px">
        <!-- 选择上级 - 省份 -->
        <el-form-item label="所属省份" required>
          <el-select
            v-model="parentSelection.provinceId"
            placeholder="请选择省份"
            filterable
            clearable
            style="width: 100%"
            @change="handleParentProvinceChange"
          >
            <el-option
              v-for="province in provinceOptions"
              :key="province.id"
              :label="province.name"
              :value="province.id"
            />
          </el-select>
        </el-form-item>

        <!-- 选择上级 - 城市 -->
        <el-form-item v-if="creationType === 'district'" label="所属城市" required>
          <el-select
            v-model="parentSelection.cityId"
            placeholder="请选择城市"
            filterable
            clearable
            style="width: 100%"
            :disabled="!parentSelection.provinceId || parentCityOptions.length === 0"
          >
            <el-option v-for="city in parentCityOptions" :key="city.id" :label="city.name" :value="city.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 已选路径展示 -->
      <div v-if="getSelectedPath().length > 0" class="selected-path">
        <el-divider>已选路径</el-divider>
        <el-breadcrumb separator=">">
          <el-breadcrumb-item v-for="(item, index) in getSelectedPath()" :key="index">
            {{ item }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <el-tag type="primary" size="small">待创建{{ getLevelText() }}</el-tag>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- 步骤3: 填写信息 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="step-description">
        <el-alert type="info" :closable="false" show-icon>
          <template #title> 请填写{{ getLevelText() }}的详细信息，编码可自动生成 </template>
        </el-alert>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="区划名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入区划名称" clearable @blur="handleNameBlur" />
        </el-form-item>

        <el-form-item label="区划编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入区划编码" clearable>
            <template #append>
              <el-button @click="generateCode" :disabled="!form.name">
                <el-icon><MagicStick /></el-icon>自动生成
              </el-button>
            </template>
          </el-input>
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            编码规则：{{ getCodeRuleTip() }}
          </div>
        </el-form-item>

        <el-form-item label="上级区划" v-if="creationType !== 'province'">
          <el-tag v-if="parentInfo.name" type="info" size="large">{{ parentInfo.name }}</el-tag>
          <el-tag v-else type="warning" size="large">未选择</el-tag>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮政编码" prop="zipCode">
              <el-input v-model="form.zipCode" placeholder="选填" clearable maxlength="6" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话区号" prop="areaCode">
              <el-input v-model="form.areaCode" placeholder="选填" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤4: 确认创建 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="step-description">
        <el-alert type="success" :closable="false" show-icon>
          <template #title>请确认以下信息无误后提交创建</template>
        </el-alert>
      </div>

      <el-descriptions :column="1" border class="confirm-descriptions">
        <el-descriptions-item label="区划名称">
          <span class="highlight-text">{{ form.name }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="区划编码">
          <el-tag type="primary">{{ form.code }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="区划等级">
          <el-tag :type="getLevelTagType()">{{ getLevelText() }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上级区划" v-if="creationType !== 'province'">
          {{ parentInfo.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮政编码">{{ form.zipCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话区号">{{ form.areaCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序号">{{ form.sort }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ form.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 创建后操作选项 -->
      <div class="post-creation-options">
        <el-divider>创建后操作</el-divider>
        <el-checkbox v-model="postCreationOptions.continueCreate"> 继续创建同级区划 </el-checkbox>
        <el-checkbox v-model="postCreationOptions.createChild" v-if="creationType !== 'district'">
          立即创建下级区划
        </el-checkbox>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <!-- 向导模式按钮 -->
        <template v-if="!isQuickMode">
          <el-button v-if="currentStep > 0" @click="prevStep">
            <el-icon><ArrowLeft /></el-icon>上一步
          </el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="nextStep">
            下一步<el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-if="currentStep === 3" type="primary" :loading="submitLoading" @click="handleSubmit">
            <el-icon><Check /></el-icon>确认创建
          </el-button>
        </template>
        <!-- 快速模式按钮 -->
        <template v-else>
          <el-button type="primary" :loading="submitLoading" @click="handleQuickSubmit">
            <el-icon><Check /></el-icon>立即创建
          </el-button>
        </template>
        <el-button @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  MapLocation,
  OfficeBuilding,
  Location,
  Check,
  MagicStick,
  InfoFilled,
  ArrowLeft,
  ArrowRight,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, watch, computed } from 'vue';

import { getProvinces, getCitiesByProvince, createDivision } from '@/api/administrativeDivision';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DivisionCreationWizard');

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  defaultParentId: {
    type: [Number, String],
    default: null,
  },
  defaultLevel: {
    type: Number,
    default: null,
  },
});

// Emits
const emit = defineEmits(['update:modelValue', 'success', 'continue']);

// 可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 当前步骤
const currentStep = ref(0);

// 创建类型
const creationType = ref('province');

// 上级选择
const parentSelection = reactive({
  provinceId: null,
  cityId: null,
});

// 上级信息
const parentInfo = reactive({
  name: '',
  level: null,
  code: '',
});

// 选项数据
const provinceOptions = ref([]);
const parentCityOptions = ref([]);

// 表单
const formRef = ref(null);
const form = reactive({
  name: '',
  code: '',
  level: 1,
  parentId: null,
  zipCode: '',
  areaCode: '',
  sort: 0,
  remark: '',
});

// 创建后选项
const postCreationOptions = reactive({
  continueCreate: false,
  createChild: false,
});

// 加载状态
const submitLoading = ref(false);

// 快速模式
const isQuickMode = ref(false);

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入区划名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入区划编码', trigger: 'blur' },
    { pattern: /^\d{6,12}$/, message: '编码必须是6-12位数字', trigger: 'blur' },
  ],
};

// 监听创建类型变化
watch(creationType, (type) => {
  switch (type) {
    case 'province':
      form.level = 1;
      form.parentId = null;
      break;
    case 'city':
      form.level = 2;
      break;
    case 'district':
      form.level = 3;
      break;
  }
  // 清空上级选择
  parentSelection.provinceId = null;
  parentSelection.cityId = null;
  parentInfo.name = '';
  parentCityOptions.value = [];
});

// 监听上级选择变化
watch(
  () => parentSelection.provinceId,
  async (provinceId) => {
    if (provinceId) {
      const province = provinceOptions.value.find((p) => p.id === provinceId);
      if (province) {
        if (creationType.value === 'city') {
          parentInfo.name = province.name;
          parentInfo.level = province.level;
          parentInfo.code = province.code;
        }
      }
      await loadParentCities(provinceId);
    } else {
      if (creationType.value === 'city') {
        parentInfo.name = '';
      }
      parentCityOptions.value = [];
    }
    parentSelection.cityId = null;
  }
);

watch(
  () => parentSelection.cityId,
  (cityId) => {
    if (cityId && creationType.value === 'district') {
      const city = parentCityOptions.value.find((c) => c.id === cityId);
      if (city) {
        parentInfo.name = city.name;
        parentInfo.level = city.level;
        parentInfo.code = city.code;
      }
    }
  }
);

// 加载省份列表
const loadProvinces = async () => {
  try {
    const res = await getProvinces();
    if (res.code === 200) {
      provinceOptions.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载省份列表失败:', error);
  }
};

// 加载父级城市
const loadParentCities = async (provinceId) => {
  if (!provinceId) {
    parentCityOptions.value = [];
    return;
  }
  try {
    const res = await getCitiesByProvince(provinceId);
    if (res.code === 200) {
      parentCityOptions.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载城市列表失败:', error);
  }
};

// 父级省份变化
const handleParentProvinceChange = (provinceId) => {
  parentSelection.cityId = null;
  if (creationType.value === 'city') {
    form.parentId = provinceId;
  }
};

// 获取等级文本
const getLevelText = () => {
  const levelMap = {
    1: '省级行政区',
    2: '市级行政区',
    3: '区县级行政区',
  };
  return levelMap[form.level] || '未知';
};

// 获取等级标签类型
const getLevelTagType = () => {
  const typeMap = {
    1: 'danger',
    2: 'warning',
    3: 'success',
  };
  return typeMap[form.level] || 'info';
};

// 获取编码规则提示
const getCodeRuleTip = () => {
  const ruleMap = {
    1: '省份编码为6位数字，如：440000（广东省）',
    2: '城市编码前2位为省份编码，如：440100（广州市）',
    3: '区县编码前4位为城市编码，如：440106（天河区）',
  };
  return ruleMap[form.level] || '请输入6-12位数字编码';
};

// 获取创建路径
const getCreationPath = () => {
  const path = [];
  if (creationType.value === 'city') {
    path.push('选择省份');
    path.push('创建城市');
  } else if (creationType.value === 'district') {
    path.push('选择省份');
    path.push('选择城市');
    path.push('创建区县');
  }
  return path;
};

// 获取路径激活索引
const getPathActiveIndex = () => {
  if (creationType.value === 'city') {
    return parentSelection.provinceId ? 1 : 0;
  }
  if (creationType.value === 'district') {
    if (parentSelection.cityId) {
      return 2;
    }
    if (parentSelection.provinceId) {
      return 1;
    }
    return 0;
  }
  return 0;
};

// 获取已选路径
const getSelectedPath = () => {
  const path = [];
  if (parentSelection.provinceId) {
    const province = provinceOptions.value.find((p) => p.id === parentSelection.provinceId);
    if (province) {
      path.push(province.name);
    }
  }
  if (parentSelection.cityId) {
    const city = parentCityOptions.value.find((c) => c.id === parentSelection.cityId);
    if (city) {
      path.push(city.name);
    }
  }
  return path;
};

// 处理名称失焦
const handleNameBlur = () => {
  if (form.name && !form.code) {
    generateCode();
  }
};

// 生成编码
const generateCode = () => {
  if (!form.name) {
    ElMessage.warning('请先输入区划名称');
    return;
  }

  let prefix = '';
  if (parentInfo.code) {
    prefix = parentInfo.code.substring(0, (form.level - 1) * 2);
  }

  // 根据级别生成编码
  let suffix = '';
  if (form.level === 1) {
    // 省份: 2位随机 + 0000
    suffix = `${Math.floor(Math.random() * 90 + 10).toString()}0000`;
  } else if (form.level === 2) {
    // 城市: 2位随机 + 00
    suffix = `${Math.floor(Math.random() * 90 + 10).toString()}00`;
  } else {
    // 区县: 2位随机
    suffix = Math.floor(Math.random() * 90 + 10).toString();
  }

  form.code = prefix + suffix;
  ElMessage.success('编码已自动生成，可根据需要修改');
};

// 下一步
const nextStep = async () => {
  if (currentStep.value === 0) {
    // 从选择类型到选择上级（如果需要）
    if (creationType.value === 'province') {
      currentStep.value = 2; // 省份直接跳到填写信息
      return;
    }
  } else if (currentStep.value === 1) {
    // 验证是否选择了必要的上级
    if (creationType.value === 'city' && !parentSelection.provinceId) {
      ElMessage.warning('请先选择所属省份');
      return;
    }
    if (creationType.value === 'district' && !parentSelection.cityId) {
      ElMessage.warning('请先选择所属城市');
      return;
    }
    // 设置parentId
    if (creationType.value === 'district') {
      form.parentId = parentSelection.cityId;
    } else if (creationType.value === 'city') {
      form.parentId = parentSelection.provinceId;
    }
  } else if (currentStep.value === 2) {
    // 验证表单
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) {
      return;
    }
  }

  currentStep.value++;
};

// 上一步
const prevStep = () => {
  if (currentStep.value === 2 && creationType.value === 'province') {
    currentStep.value = 0; // 省份从填写信息回到选择类型
  } else {
    currentStep.value--;
  }
};

// 处理模式切换
const handleModeChange = (val) => {
  logger.debug('切换模式:', val ? '快速模式' : '向导模式');
  if (val) {
    // 切换到快速模式，重置到第一步
    currentStep.value = 0;
  } else {
    // 切换到向导模式，也重置
    resetWizard();
  }
};

// 快速模式提交
const handleQuickSubmit = async () => {
  // 快速模式下的验证
  if (!form.name) {
    ElMessage.warning('请输入区划名称');
    return;
  }
  if (creationType.value !== 'province' && !form.parentId) {
    ElMessage.warning('请先选择上级区划');
    return;
  }
  if (!form.code) {
    generateCode();
  }

  await handleSubmit();
};

// 提交
const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    const res = await createDivision(form);
    if (res.code === 200) {
      ElMessage.success('创建成功');

      const createdDivision = res.data;

      // 根据选项决定后续操作
      if (postCreationOptions.createChild && creationType.value !== 'district') {
        emit('continue', {
          type: 'child',
          parentId: createdDivision.id,
          level: form.level + 1,
        });
        resetForContinue(createdDivision);
      } else if (postCreationOptions.continueCreate) {
        emit('continue', {
          type: 'sibling',
          parentId: form.parentId,
          level: form.level,
        });
        resetForContinue(null, true);
      } else {
        visible.value = false;
        emit('success', createdDivision);
      }
    } else {
      ElMessage.error(res.message || '创建失败');
    }
  } catch (error) {
    logger.error('创建行政区划失败:', error);
    ElMessage.error('创建失败');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单用于继续创建
const resetForContinue = (parentDivision, keepParent = false) => {
  form.name = '';
  form.code = '';
  form.zipCode = '';
  form.areaCode = '';
  form.remark = '';

  if (parentDivision) {
    form.level = parentDivision.level + 1;
    form.parentId = parentDivision.id;
    parentInfo.name = parentDivision.name;
    parentInfo.code = parentDivision.code;
    parentInfo.level = parentDivision.level;

    if (form.level === 2) {
      creationType.value = 'city';
      parentSelection.provinceId = parentDivision.id;
    } else if (form.level === 3) {
      creationType.value = 'district';
      parentSelection.cityId = parentDivision.id;
    }
  } else if (!keepParent) {
    form.parentId = null;
    parentInfo.name = '';
    parentInfo.code = '';
    parentInfo.level = null;
    parentSelection.provinceId = null;
    parentSelection.cityId = null;
  }

  postCreationOptions.continueCreate = false;
  postCreationOptions.createChild = false;

  // 回到填写信息步骤
  currentStep.value = creationType.value === 'province' ? 2 : 1;
};

// 重置整个向导
const resetWizard = () => {
  currentStep.value = 0;
  creationType.value = 'province';
  parentSelection.provinceId = null;
  parentSelection.cityId = null;
  parentInfo.name = '';
  parentInfo.code = '';
  parentInfo.level = null;
  parentCityOptions.value = [];

  form.name = '';
  form.code = '';
  form.level = 1;
  form.parentId = null;
  form.zipCode = '';
  form.areaCode = '';
  form.sort = 0;
  form.remark = '';

  postCreationOptions.continueCreate = false;
  postCreationOptions.createChild = false;
};

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    resetWizard();
    loadProvinces();

    if (props.defaultLevel) {
      const typeMap = { 1: 'province', 2: 'city', 3: 'district' };
      creationType.value = typeMap[props.defaultLevel] || 'province';
      form.level = props.defaultLevel;
    }
    if (props.defaultParentId) {
      form.parentId = props.defaultParentId;
    }
  }
});

// 暴露方法
defineExpose({
  resetWizard,
  resetForContinue,
});
</script>

<style scoped lang="scss">
.division-creation-wizard {
  .wizard-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;

    .mode-switch {
      align-self: flex-end;
    }
  }

  .step-content {
    padding: 24px 0;
    min-height: 300px;
  }

  .step-description {
    margin-bottom: 20px;
  }

  .creation-type-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .type-card {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border: 2px solid var(--el-border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover:not(.disabled) {
        border-color: var(--el-color-primary-light-5);
        background-color: var(--el-color-primary-light-9);
      }

      &.active {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .type-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        &.province {
          background-color: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }

        &.city {
          background-color: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }

        &.district {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        .el-icon {
          font-size: 24px;
        }
      }

      .type-info {
        flex: 1;

        .type-name {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .type-desc {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }

      .type-check {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .creation-path-preview,
  .selected-path {
    margin-top: 24px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .confirm-descriptions {
    .highlight-text {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-color-primary);
    }
  }

  .post-creation-options {
    margin-top: 20px;
    padding: 20px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;

    .el-checkbox {
      display: block;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>
