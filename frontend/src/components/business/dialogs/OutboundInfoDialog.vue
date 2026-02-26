<!--
  @file: OutboundInfoDialog.vue
  @description: 出库信息填写对话框 - 包含人员选择、出库类型、安装位置等
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close :close-on-click-modal="false" data-cy="outbound-info-dialog">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" data-cy="outbound-info-form">
      <!-- 设备信息展示 -->
      <el-divider content-position="left">设备信息</el-divider>
      <div class="device-summary">
        <el-space wrap>
          <el-tag v-for="device in selectedDevices" :key="device.id" type="info" size="large">
            <el-avatar :size="20" :src="device.imageUrl" style="margin-right: 4px">
              <el-icon><Picture /></el-icon>
            </el-avatar>
            {{ device.deviceName }}
            <span class="stock-quantity">(库存: {{ device.stockQuantity }})</span>
          </el-tag>
        </el-space>
      </div>

      <!-- 出库类型 -->
      <el-form-item label="出库类型" prop="outboundType" data-cy="outbound-info-type">
        <el-select
          v-model="formData.outboundType"
          placeholder="请选择出库类型"
          style="width: 100%"
          @change="handleTypeChange"
          data-cy="outbound-info-type-select"
        >
          <el-option v-for="type in outboundTypes" :key="type.value" :label="type.label" :value="type.value">
            <div class="type-option">
              <el-icon :size="16">
                <component :is="type.icon" />
              </el-icon>
              <span>{{ type.label }}</span>
              <span class="type-desc">{{ type.description }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 出库数量 -->
      <el-form-item label="出库数量" prop="quantity" data-cy="outbound-info-quantity">
        <el-input-number
          v-model="formData.quantity"
          :min="1"
          :max="maxQuantity"
          data-cy="outbound-info-quantity-input"
          :precision="0"
          style="width: 100%"
          placeholder="请输入出库数量"
        />
        <div class="form-tip">最大可出库数量: {{ maxQuantity }}</div>
      </el-form-item>

      <!-- 出库人员 -->
      <el-form-item label="出库人员" prop="operatorId" data-cy="outbound-info-operator">
        <el-select v-model="formData.operatorId" placeholder="请选择出库人员" filterable style="width: 100%" data-cy="outbound-info-operator-select">
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.realName || user.username"
            :value="user.id"
          >
            <div class="user-option">
              <el-avatar :size="24" :src="user.avatar">
                {{ user.realName?.charAt(0) || user.username?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ user.realName || user.username }}</span>
              <el-tag v-if="user.roleName" size="small" type="info">{{ user.roleName }}</el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 安装位置（仅安装出库显示） -->
      <template v-if="formData.outboundType === 'INSTALLATION'">
        <el-form-item label="安装位置" prop="installationLocation" data-cy="outbound-info-location">
          <el-cascader
            v-model="formData.installationLocation"
            :options="locationOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择安装位置"
            style="width: 100%"
            clearable
            data-cy="outbound-info-location-cascader"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="installationAddress" data-cy="outbound-info-address">
          <el-input v-model="formData.installationAddress" type="textarea" :rows="2" placeholder="请输入详细安装地址" data-cy="outbound-info-address-input" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName" data-cy="outbound-info-customer">
          <el-input v-model="formData.customerName" placeholder="请输入客户名称" data-cy="outbound-info-customer-input" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone" data-cy="outbound-info-phone">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" data-cy="outbound-info-phone-input" />
        </el-form-item>
      </template>

      <!-- 修复信息（仅修复出库显示） -->
      <template v-if="formData.outboundType === 'REPAIR'">
        <el-form-item label="修复人员" prop="repairPersonId" data-cy="outbound-info-repair-person">
          <el-select v-model="formData.repairPersonId" placeholder="请选择修复人员" filterable style="width: 100%" data-cy="outbound-info-repair-person-select">
            <el-option
              v-for="user in repairUserOptions"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="faultDescription" data-cy="outbound-info-fault-desc">
          <el-input v-model="formData.faultDescription" type="textarea" :rows="3" placeholder="请描述设备故障情况" data-cy="outbound-info-fault-desc-input" />
        </el-form-item>
        <el-form-item label="预计周期" prop="estimatedDays" data-cy="outbound-info-est-days">
          <el-input-number
            v-model="formData.estimatedDays"
            :min="1"
            :max="365"
            style="width: 100%"
            placeholder="预计修复天数"
            data-cy="outbound-info-est-days-input"
          >
            <template #append>天</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="修复地点" prop="repairLocation" data-cy="outbound-info-repair-location">
          <el-radio-group v-model="formData.repairLocation" data-cy="outbound-info-repair-location-group">
            <el-radio label="INTERNAL" data-cy="outbound-info-repair-location-internal">内部维修</el-radio>
            <el-radio label="EXTERNAL" data-cy="outbound-info-repair-location-external">外部维修</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.repairLocation === 'EXTERNAL'" label="维修单位" prop="repairVendor" data-cy="outbound-info-repair-vendor">
          <el-input v-model="formData.repairVendor" placeholder="请输入外部维修单位" data-cy="outbound-info-repair-vendor-input" />
        </el-form-item>
      </template>

      <!-- 调拨信息（仅调拨出库显示） -->
      <template v-if="formData.outboundType === 'TRANSFER'">
        <el-form-item label="目标仓库" prop="targetWarehouseId" data-cy="outbound-info-target-warehouse">
          <el-select v-model="formData.targetWarehouseId" placeholder="请选择目标仓库" style="width: 100%" data-cy="outbound-info-target-warehouse-select">
            <el-option
              v-for="warehouse in warehouseOptions"
              :key="warehouse.id"
              :label="warehouse.warehouseName"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标区域" prop="targetAreaId" data-cy="outbound-info-target-area">
          <el-select v-model="formData.targetAreaId" placeholder="请选择目标区域" style="width: 100%" data-cy="outbound-info-target-area-select">
            <el-option v-for="area in targetAreaOptions" :key="area.id" :label="area.areaName" :value="area.id" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 报废信息（仅报废出库显示） -->
      <template v-if="formData.outboundType === 'SCRAP'">
        <el-form-item label="报废原因" prop="scrapReason" data-cy="outbound-info-scrap-reason">
          <el-select v-model="formData.scrapReason" placeholder="请选择报废原因" style="width: 100%" data-cy="outbound-info-scrap-reason-select">
            <el-option label="达到使用年限" value="EXPIRED" data-cy="outbound-info-scrap-reason-expired" />
            <el-option label="严重损坏无法修复" value="DAMAGED" data-cy="outbound-info-scrap-reason-damaged" />
            <el-option label="技术淘汰" value="OBSOLETE" data-cy="outbound-info-scrap-reason-obsolete" />
            <el-option label="其他原因" value="OTHER" data-cy="outbound-info-scrap-reason-other" />
          </el-select>
        </el-form-item>
        <el-form-item label="报废说明" prop="scrapDescription" data-cy="outbound-info-scrap-desc">
          <el-input v-model="formData.scrapDescription" type="textarea" :rows="3" placeholder="请详细说明报废原因" data-cy="outbound-info-scrap-desc-input" />
        </el-form-item>
      </template>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark" data-cy="outbound-info-remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" data-cy="outbound-info-remark-input" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel" data-cy="outbound-info-cancel-btn">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit" data-cy="outbound-info-submit-btn">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { getWarehouseList } from '@/api/inventory/warehouse';
import { getAreaList } from '@/api/system/area';
import { getUserList } from '@/api/system/user';
import { createLogger } from '@/utils/logger';

const logger = createLogger('OutboundInfoDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedDevices: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'create', // create, repair
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const dialogTitle = computed(() => {
  return props.mode === 'repair' ? '修复出库' : '填写出库信息';
});

// 表单引用
const formRef = ref(null);
const submitLoading = ref(false);

// 选项数据
const userOptions = ref([]);
const repairUserOptions = ref([]);
const warehouseOptions = ref([]);
const targetAreaOptions = ref([]);

// 出库类型选项
const outboundTypes = [
  {
    value: 'INSTALLATION',
    label: '安装出库',
    icon: 'SetUp',
    description: '设备出库用于现场安装',
  },
  {
    value: 'REPAIR',
    label: '修复出库',
    icon: 'Tools',
    description: '设备出库用于维修',
  },
  {
    value: 'TRANSFER',
    label: '调拨出库',
    icon: 'Switch',
    description: '设备调拨到其他仓库',
  },
  {
    value: 'SCRAP',
    label: '报废出库',
    icon: 'Delete',
    description: '设备报废处理',
  },
  {
    value: 'OTHER',
    label: '其他出库',
    icon: 'Document',
    description: '其他原因出库',
  },
];

// 安装位置选项（示例数据，实际应从API获取）
const locationOptions = [
  {
    id: 'building1',
    name: '1号楼',
    children: [
      { id: 'floor1', name: '1层' },
      { id: 'floor2', name: '2层' },
      { id: 'floor3', name: '3层' },
    ],
  },
  {
    id: 'building2',
    name: '2号楼',
    children: [
      { id: 'floor1', name: '1层' },
      { id: 'floor2', name: '2层' },
    ],
  },
];

// 计算最大可出库数量
const maxQuantity = computed(() => {
  if (props.selectedDevices.length === 0) {
    return 0;
  }
  return Math.min(...props.selectedDevices.map((d) => d.stockQuantity || 0));
});

// 表单数据
const formData = reactive({
  outboundType: '',
  quantity: 1,
  operatorId: null,
  // 安装相关
  installationLocation: [],
  installationAddress: '',
  customerName: '',
  contactPhone: '',
  // 修复相关
  repairPersonId: null,
  faultDescription: '',
  estimatedDays: 7,
  repairLocation: 'INTERNAL',
  repairVendor: '',
  // 调拨相关
  targetWarehouseId: null,
  targetAreaId: null,
  // 报废相关
  scrapReason: '',
  scrapDescription: '',
  // 通用
  remark: '',
});

// 动态表单验证规则
const formRules = computed(() => {
  const baseRules = {
    outboundType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
    quantity: [
      { required: true, message: '请输入出库数量', trigger: 'blur' },
      { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' },
    ],
    operatorId: [{ required: true, message: '请选择出库人员', trigger: 'change' }],
  };

  // 根据出库类型添加特定验证规则
  if (formData.outboundType === 'INSTALLATION') {
    baseRules.installationLocation = [{ required: true, message: '请选择安装位置', trigger: 'change' }];
    baseRules.installationAddress = [{ required: true, message: '请输入详细地址', trigger: 'blur' }];
    baseRules.customerName = [{ required: true, message: '请输入客户名称', trigger: 'blur' }];
  }

  if (formData.outboundType === 'REPAIR') {
    baseRules.repairPersonId = [{ required: true, message: '请选择修复人员', trigger: 'change' }];
    baseRules.faultDescription = [{ required: true, message: '请输入故障描述', trigger: 'blur' }];
    baseRules.estimatedDays = [{ required: true, message: '请输入预计修复周期', trigger: 'blur' }];
    if (formData.repairLocation === 'EXTERNAL') {
      baseRules.repairVendor = [{ required: true, message: '请输入维修单位', trigger: 'blur' }];
    }
  }

  if (formData.outboundType === 'TRANSFER') {
    baseRules.targetWarehouseId = [{ required: true, message: '请选择目标仓库', trigger: 'change' }];
  }

  if (formData.outboundType === 'SCRAP') {
    baseRules.scrapReason = [{ required: true, message: '请选择报废原因', trigger: 'change' }];
    baseRules.scrapDescription = [{ required: true, message: '请输入报废说明', trigger: 'blur' }];
  }

  return baseRules;
});

// 监听目标仓库变化，加载对应区域
watch(
  () => formData.targetWarehouseId,
  async (warehouseId) => {
    if (!warehouseId) {
      targetAreaOptions.value = [];
      formData.targetAreaId = null;
      return;
    }
    try {
      const response = await getAreaList({ warehouseId, page: 1, size: 100 });
      if (response.code === 200) {
        targetAreaOptions.value = response.data?.list || response.data || [];
      }
    } catch (error) {
      logger.error('加载目标区域失败', error);
    }
  }
);

// 出库类型变化
const handleTypeChange = (type) => {
  // 重置特定类型的字段
  if (type !== 'REPAIR') {
    formData.repairPersonId = null;
    formData.faultDescription = '';
    formData.estimatedDays = 7;
  }
  if (type !== 'INSTALLATION') {
    formData.installationLocation = [];
    formData.installationAddress = '';
  }
};

// 加载基础数据
const loadBasicData = async () => {
  try {
    // 加载用户列表
    const userResponse = await getUserList({ page: 1, size: 100, status: true });
    if (userResponse.code === 200) {
      userOptions.value = userResponse.data?.list || userResponse.data || [];
      // 筛选有维修权限的用户（示例逻辑）
      repairUserOptions.value = userOptions.value.filter(
        (u) => u.roleName?.includes('维修') || u.roleName?.includes('技术')
      );
    }

    // 加载仓库列表
    const warehouseResponse = await getWarehouseList({ page: 1, size: 100 });
    if (warehouseResponse.code === 200) {
      warehouseOptions.value = warehouseResponse.data?.list || warehouseResponse.data || [];
    }
  } catch (error) {
    logger.error('加载基础数据失败', error);
  }
};

// 取消
const handleCancel = () => {
  dialogVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formData.outboundType = props.mode === 'repair' ? 'REPAIR' : '';
  formData.quantity = 1;
  formData.operatorId = null;
  formData.installationLocation = [];
  formData.installationAddress = '';
  formData.customerName = '';
  formData.contactPhone = '';
  formData.repairPersonId = null;
  formData.faultDescription = '';
  formData.estimatedDays = 7;
  formData.repairLocation = 'INTERNAL';
  formData.repairVendor = '';
  formData.targetWarehouseId = null;
  formData.targetAreaId = null;
  formData.scrapReason = '';
  formData.scrapDescription = '';
  formData.remark = '';
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) {
    return;
  }

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const selectedUser = userOptions.value.find((u) => u.id === formData.operatorId);
    const selectedRepairPerson = repairUserOptions.value.find((u) => u.id === formData.repairPersonId);

    const result = {
      ...formData,
      deviceIds: props.selectedDevices.map((d) => d.id),
      deviceNames: props.selectedDevices.map((d) => d.deviceName),
      operatorName: selectedUser?.realName || selectedUser?.username,
      repairPersonName: selectedRepairPerson?.realName || selectedRepairPerson?.username,
    };

    emit('confirm', result);
    dialogVisible.value = false;
    resetForm();
  } catch (error) {
    logger.error('表单验证失败', error);
  } finally {
    submitLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadBasicData();
  if (props.mode === 'repair') {
    formData.outboundType = 'REPAIR';
  }
});
</script>

<style scoped>
.device-summary {
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stock-quantity {
  color: #909399;
  margin-left: 4px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-desc {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  flex: 1;
}
</style>
