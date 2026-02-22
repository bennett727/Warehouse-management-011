<template>
  <WorkflowGuide
    v-model="visible"
    title="仓库初始化向导"
    storage-key="warehouse_init"
    :steps="wizardSteps"
    :initial-data="initialData"
    :show-skip="true"
    @complete="handleComplete"
    @save-draft="handleSaveDraft"
    @step-change="handleStepChange"
  >
    <!-- 步骤3：功能区规划 - 自定义内容 -->
    <template #step-2="{ form }">
      <div class="zone-planning">
        <div class="zone-list">
          <div v-for="(zone, index) in form.zones" :key="index" class="zone-item">
            <el-card shadow="hover">
              <template #header>
                <div class="zone-header">
                  <span>功能区 {{ index + 1 }}</span>
                  <el-button
                    v-if="form.zones.length > 1"
                    type="danger"
                    link
                    size="small"
                    @click="removeZone(form, index)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </template>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item :label="`功能区名称`" required>
                    <el-input v-model="zone.name" placeholder="如：收货区" maxlength="20" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`功能区编码`" required>
                    <el-input
                      v-model="zone.code"
                      placeholder="如：RECEIVE"
                      maxlength="10"
                      @blur="formatZoneCode(zone)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`功能区类型`" required>
                    <el-select v-model="zone.type" placeholder="选择类型" style="width: 100%">
                      <el-option v-for="type in zoneTypes" :key="type.value" :label="type.label" :value="type.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="面积(m²)">
                    <el-input-number v-model="zone.area" :min="0" :precision="2" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="容量">
                    <el-input-number v-model="zone.capacity" :min="0" :precision="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="功能说明">
                <el-input
                  v-model="zone.description"
                  type="textarea"
                  :rows="2"
                  placeholder="描述该区域的主要功能"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-card>
          </div>
        </div>

        <el-button type="primary" plain class="add-zone-btn" @click="addZone(form)">
          <el-icon><Plus /></el-icon>
          添加功能区
        </el-button>

        <!-- 推荐模板 -->
        <div class="zone-templates">
          <span class="template-label">快速应用模板：</span>
          <el-button
            v-for="template in zoneTemplates"
            :key="template.name"
            size="small"
            @click="applyZoneTemplate(form, template)"
          >
            {{ template.name }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 步骤4：货位规划 - 自定义内容 -->
    <template #step-3="{ form }">
      <div class="bin-planning">
        <el-alert
          title="货位批量生成"
          description="根据功能区规划，系统将自动生成货位编码。您可以调整生成规则。"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        />

        <el-form-item label="货位编码规则">
          <el-radio-group v-model="form.binRule.type">
            <el-radio label="sequential">顺序编号</el-radio>
            <el-radio label="coordinate">坐标编码</el-radio>
            <el-radio label="custom">自定义规则</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 顺序编号规则 -->
        <template v-if="form.binRule.type === 'sequential'">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="起始编号">
                <el-input-number v-model="form.binRule.startNumber" :min="1" :max="9999" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="编号位数">
                <el-input-number v-model="form.binRule.digits" :min="2" :max="6" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 坐标编码规则 -->
        <template v-if="form.binRule.type === 'coordinate'">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="排数">
                <el-input-number v-model="form.binRule.rows" :min="1" :max="99" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="列数">
                <el-input-number v-model="form.binRule.cols" :min="1" :max="99" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="层数">
                <el-input-number v-model="form.binRule.layers" :min="1" :max="20" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 预览 -->
        <div class="bin-preview">
          <div class="preview-title">货位预览（前10个）：</div>
          <div class="preview-list">
            <el-tag v-for="code in binPreviewCodes" :key="code" size="small" class="preview-tag">
              {{ code }}
            </el-tag>
            <span v-if="binPreviewCodes.length >= 10" class="preview-more">...</span>
          </div>
          <div class="preview-count">
            预计生成货位数量：<strong>{{ estimatedBinCount }}</strong> 个
          </div>
        </div>
      </div>
    </template>

    <!-- 步骤5：确认信息 - 自定义内容 -->
    <template #step-4="{ form }">
      <div class="confirm-summary">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="仓库名称">{{ form.name }}</el-descriptions-item>
          <el-descriptions-item label="仓库编码">{{ form.code }}</el-descriptions-item>
          <el-descriptions-item label="所在地区" :span="2">
            {{ form.divisionName || '未选择' }}
          </el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">{{ form.address }}</el-descriptions-item>
          <el-descriptions-item label="总面积">{{ form.totalArea }} m²</el-descriptions-item>
          <el-descriptions-item label="总容量">{{ form.totalCapacity }}</el-descriptions-item>
        </el-descriptions>

        <div class="summary-section">
          <div class="summary-title">功能区规划（{{ form.zones.length }}个）</div>
          <el-table :data="form.zones" size="small" border>
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="code" label="编码" width="100" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                {{ getZoneTypeLabel(row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="area" label="面积(m²)" width="100" />
            <el-table-column prop="capacity" label="容量" width="100" />
            <el-table-column prop="description" label="说明" show-overflow-tooltip />
          </el-table>
        </div>

        <div class="summary-section">
          <div class="summary-title">货位规划</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="编码规则">
              {{ getBinRuleLabel(form.binRule.type) }}
            </el-descriptions-item>
            <el-descriptions-item label="预计数量"> {{ estimatedBinCount }} 个 </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </template>
  </WorkflowGuide>
</template>

<script setup>
import { Plus, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, computed, watch } from 'vue';

import { batchCreateBins } from '@/api/inventory/bin';
import { addWarehouse as createWarehouse } from '@/api/inventory/warehouse';
import { createWarehouseZone as createZone } from '@/api/warehouse/zone';
import WorkflowGuide from '@/components/business/workflow/WorkflowGuide.vue';
import { createLogger } from '@/utils/logger';
import { warehouseRules, commonRules } from '@/utils/validation/formValidation';

const logger = createLogger('WarehouseInitWizard');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'complete']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 初始数据
const initialData = {
  name: '',
  code: '',
  divisionId: [],
  divisionName: '',
  address: '',
  contactName: '',
  contactPhone: '',
  totalArea: undefined,
  totalCapacity: undefined,
  description: '',
  zones: [
    {
      name: '',
      code: '',
      type: '',
      area: undefined,
      capacity: undefined,
      description: '',
    },
  ],
  binRule: {
    type: 'sequential',
    startNumber: 1,
    digits: 4,
    rows: 10,
    cols: 10,
    layers: 3,
  },
};

// 功能区类型
const zoneTypes = [
  { value: 'receive', label: '收货区' },
  { value: 'storage', label: '存储区' },
  { value: 'pick', label: '拣货区' },
  { value: 'pack', label: '包装区' },
  { value: 'ship', label: '发货区' },
  { value: 'return', label: '退货区' },
  { value: 'quarantine', label: '隔离区' },
  { value: 'value_added', label: '增值服务区' },
];

// 功能区模板
const zoneTemplates = [
  {
    name: '标准仓库',
    zones: [
      { name: '收货区', code: 'RECEIVE', type: 'receive' },
      { name: '存储区', code: 'STORAGE', type: 'storage' },
      { name: '拣货区', code: 'PICK', type: 'pick' },
      { name: '发货区', code: 'SHIP', type: 'ship' },
    ],
  },
  {
    name: '电商仓库',
    zones: [
      { name: '收货区', code: 'RECEIVE', type: 'receive' },
      { name: '存储区', code: 'STORAGE', type: 'storage' },
      { name: '爆款区', code: 'HOT', type: 'pick' },
      { name: '拣货区', code: 'PICK', type: 'pick' },
      { name: '包装区', code: 'PACK', type: 'pack' },
      { name: '发货区', code: 'SHIP', type: 'ship' },
      { name: '退货区', code: 'RETURN', type: 'return' },
    ],
  },
  {
    name: '冷链仓库',
    zones: [
      { name: '收货暂存区', code: 'RECEIVE', type: 'receive' },
      { name: '冷藏区', code: 'COLD', type: 'storage' },
      { name: '冷冻区', code: 'FROZEN', type: 'storage' },
      { name: '恒温区', code: 'TEMP', type: 'storage' },
      { name: '拣货区', code: 'PICK', type: 'pick' },
      { name: '发货区', code: 'SHIP', type: 'ship' },
      { name: '隔离区', code: 'QUARANTINE', type: 'quarantine' },
    ],
  },
];

// 向导步骤配置
const wizardSteps = [
  {
    title: '基本信息',
    description: '填写仓库的基本信息',
    form: [
      {
        prop: 'name',
        label: '仓库名称',
        type: 'input',
        placeholder: '请输入仓库名称',
        maxlength: 50,
        showWordLimit: true,
      },
      {
        prop: 'code',
        label: '仓库编码',
        type: 'input',
        placeholder: '请输入仓库编码，如：WH001',
        maxlength: 20,
        tip: '编码规则：2-20位大写字母和数字',
      },
      {
        prop: 'divisionId',
        label: '所在地区',
        type: 'division',
        placeholder: '请选择省/市/区',
      },
      {
        prop: 'address',
        label: '详细地址',
        type: 'textarea',
        placeholder: '请输入详细地址',
        rows: 2,
        maxlength: 200,
        showWordLimit: true,
      },
    ],
    rules: {
      name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }, ...warehouseRules.warehouseName],
      code: [{ required: true, message: '请输入仓库编码', trigger: 'blur' }, ...warehouseRules.warehouseCode],
      divisionId: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
      address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }, ...warehouseRules.address],
    },
  },
  {
    title: '联系信息',
    description: '填写仓库联系人和容量信息',
    form: [
      {
        prop: 'contactName',
        label: '联系人',
        type: 'input',
        placeholder: '请输入联系人姓名',
        maxlength: 20,
      },
      {
        prop: 'contactPhone',
        label: '联系电话',
        type: 'input',
        placeholder: '请输入联系电话',
        maxlength: 20,
      },
      {
        prop: 'totalArea',
        label: '总面积(m²)',
        type: 'number',
        min: 0,
        precision: 2,
      },
      {
        prop: 'totalCapacity',
        label: '总容量',
        type: 'number',
        min: 0,
        precision: 0,
      },
      {
        prop: 'description',
        label: '仓库说明',
        type: 'textarea',
        placeholder: '请输入仓库说明（可选）',
        rows: 3,
        maxlength: 500,
        showWordLimit: true,
      },
    ],
    rules: {
      contactName: [commonRules.required],
      contactPhone: [commonRules.phone],
      totalArea: [commonRules.nonNegativeNumber],
      totalCapacity: [commonRules.nonNegativeNumber],
    },
  },
  {
    title: '功能区规划',
    description: '规划仓库的功能区域',
    tip: {
      title: '提示',
      description: '建议根据实际业务需求规划功能区，常见的功能区包括：收货区、存储区、拣货区、包装区、发货区等。',
      type: 'info',
    },
    // 使用自定义内容插槽
  },
  {
    title: '货位规划',
    description: '配置货位编码规则',
    tip: {
      title: '货位编码规则说明',
      description: '顺序编号：A0001, A0002...；坐标编码：A-01-02-03（区-排-列-层）；自定义规则：可根据需要灵活配置。',
      type: 'info',
    },
    // 使用自定义内容插槽
  },
  {
    title: '确认信息',
    description: '确认所有信息无误后完成创建',
    // 使用自定义内容插槽
  },
];

// 当前表单数据（用于计算预览）
const currentForm = ref({ ...initialData });

// 监听步骤变化，更新当前表单数据
const handleStepChange = ({ formData }) => {
  currentForm.value = formData;
};

// 格式化功能区编码
const formatZoneCode = (zone) => {
  if (zone.code) {
    zone.code = zone.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
};

// 添加功能区
const addZone = (form) => {
  form.zones.push({
    name: '',
    code: '',
    type: '',
    area: undefined,
    capacity: undefined,
    description: '',
  });
};

// 删除功能区
const removeZone = (form, index) => {
  form.zones.splice(index, 1);
};

// 应用功能区模板
const applyZoneTemplate = (form, template) => {
  form.zones = template.zones.map((zone) => ({
    ...zone,
    area: undefined,
    capacity: undefined,
    description: '',
  }));
  ElMessage.success(`已应用"${template.name}"模板`);
};

// 获取功能区类型标签
const getZoneTypeLabel = (type) => {
  const found = zoneTypes.find((t) => t.value === type);
  return found ? found.label : type;
};

// 获取货位规则标签
const getBinRuleLabel = (type) => {
  const labels = {
    sequential: '顺序编号',
    coordinate: '坐标编码',
    custom: '自定义规则',
  };
  return labels[type] || type;
};

// 计算货位预览编码
const binPreviewCodes = computed(() => {
  const rule = currentForm.value?.binRule;
  if (!rule) {
    return [];
  }

  const codes = [];
  const count = Math.min(10, estimatedBinCount.value);

  for (let i = 0; i < count; i++) {
    if (rule.type === 'sequential') {
      const num = (rule.startNumber || 1) + i;
      codes.push(num.toString().padStart(rule.digits || 4, '0'));
    } else if (rule.type === 'coordinate') {
      const rows = rule.rows || 10;
      const cols = rule.cols || 10;
      const layer = Math.floor(i / (rows * cols)) + 1;
      const row = Math.floor((i % (rows * cols)) / cols) + 1;
      const col = (i % cols) + 1;
      codes.push(
        `${String.fromCharCode(64 + layer)}-${row.toString().padStart(2, '0')}-${col.toString().padStart(2, '0')}`
      );
    }
  }

  return codes;
});

// 计算预计货位数量
const estimatedBinCount = computed(() => {
  const rule = currentForm.value?.binRule;
  if (!rule) {
    return 0;
  }

  if (rule.type === 'sequential') {
    return 100; // 默认生成100个
  }
  if (rule.type === 'coordinate') {
    return (rule.rows || 10) * (rule.cols || 10) * (rule.layers || 3);
  }
  return 0;
});

// 处理完成
const handleComplete = async ({ formData }) => {
  try {
    // 1. 创建仓库
    const warehouseData = {
      name: formData.name,
      code: formData.code,
      provinceId: formData.divisionId[0],
      cityId: formData.divisionId[1],
      districtId: formData.divisionId[2],
      address: formData.address,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      totalArea: formData.totalArea,
      totalCapacity: formData.totalCapacity,
      description: formData.description,
    };

    logger.debug('创建仓库:', warehouseData);
    const warehouseRes = await createWarehouse(warehouseData);

    if (warehouseRes.code !== 200) {
      throw new Error(warehouseRes.message || '创建仓库失败');
    }

    const warehouseId = warehouseRes.data?.id;
    if (!warehouseId) {
      throw new Error('创建仓库失败：未返回仓库ID');
    }

    // 2. 创建功能区
    const zonePromises = formData.zones.map((zone) =>
      createZone({
        warehouseId,
        name: zone.name,
        code: zone.code,
        type: zone.type,
        area: zone.area,
        capacity: zone.capacity,
        description: zone.description,
      })
    );

    const zoneResults = await Promise.all(zonePromises);
    const zoneIds = zoneResults
      .filter((res) => res.code === 200)
      .map((res) => res.data?.id)
      .filter(Boolean);

    logger.debug('创建功能区成功，数量:', zoneIds.length);

    // 3. 批量创建货位
    if (zoneIds.length > 0 && estimatedBinCount.value > 0) {
      const binsData = generateBinsData(formData.binRule, zoneIds);
      if (binsData.length > 0) {
        await batchCreateBins({
          warehouseId,
          zoneIds,
          bins: binsData,
        });
        logger.debug('批量创建货位成功，数量:', binsData.length);
      }
    }

    ElMessage.success('仓库初始化完成');
    emit('complete', {
      warehouseId,
      zoneCount: zoneIds.length,
      binCount: estimatedBinCount.value,
    });
  } catch (error) {
    logger.error('仓库初始化失败:', error);
    ElMessage.error(error.message || '仓库初始化失败');
    throw error;
  }
};

// 生成货位数据
const generateBinsData = (rule, zoneIds) => {
  const bins = [];
  const binsPerZone = Math.floor(estimatedBinCount.value / zoneIds.length);

  zoneIds.forEach((zoneId, zoneIndex) => {
    for (let i = 0; i < binsPerZone; i++) {
      const globalIndex = zoneIndex * binsPerZone + i;
      let code = '';

      if (rule.type === 'sequential') {
        const num = (rule.startNumber || 1) + globalIndex;
        code = num.toString().padStart(rule.digits || 4, '0');
      } else if (rule.type === 'coordinate') {
        const rows = rule.rows || 10;
        const cols = rule.cols || 10;
        const layer = Math.floor(i / (rows * cols)) + 1;
        const row = Math.floor((i % (rows * cols)) / cols) + 1;
        const col = (i % cols) + 1;
        code = `${String.fromCharCode(64 + layer)}-${row.toString().padStart(2, '0')}-${col.toString().padStart(2, '0')}`;
      }

      bins.push({
        zoneId,
        code,
        status: 'empty',
      });
    }
  });

  return bins;
};

// 处理保存草稿
const handleSaveDraft = ({ step, formData }) => {
  logger.debug('保存草稿:', { step, formData });
  // 草稿已自动保存到localStorage，这里可以添加额外逻辑
};

// 暴露方法
defineExpose({
  open: () => {
    visible.value = true;
  },
  close: () => {
    visible.value = false;
  },
});
</script>

<style scoped>
.zone-planning {
  .zone-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .zone-item {
    :deep(.el-card__header) {
      padding: 12px 20px;
    }
  }

  .zone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }

  .add-zone-btn {
    margin-top: 16px;
    width: 100%;
  }

  .zone-templates {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    .template-label {
      font-size: 13px;
      color: #606266;
    }
  }
}

.bin-planning {
  .bin-preview {
    margin-top: 24px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .preview-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 12px;
    }

    .preview-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .preview-tag {
      font-family: monospace;
    }

    .preview-more {
      color: #909399;
      font-size: 12px;
    }

    .preview-count {
      font-size: 13px;
      color: #606266;

      strong {
        color: #409eff;
        font-size: 16px;
      }
    }
  }
}

.confirm-summary {
  .summary-section {
    margin-top: 24px;

    .summary-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #409eff;
    }
  }
}
</style>
