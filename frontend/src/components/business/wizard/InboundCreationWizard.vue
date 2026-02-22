<!--
  @file: InboundCreationWizard.vue
  @description: 入库申请向导 - 支持多种入库类型的动态步骤式引导
  @author: AI架构专家
  @createTime: 2026-02-13
  @version: 4.0
  @features:
    - 四步引导式流程
    - 根据入库类型动态显示不同表单
    - 实时表单验证
    - 设备智能选择
    - 数据自动保存
    - 提交后自动跳转审批
-->
<template>
  <el-dialog
    v-model="visible"
    title="入库申请向导"
    width="95%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    class="inbound-wizard-dialog"
    @close="handleDialogClose"
  >
    <div class="wizard-container">
      <div class="wizard-sidebar">
        <div class="wizard-title">
          <el-icon :size="24" color="#67C23A"><Download /></el-icon>
          <h2>入库申请</h2>
        </div>

        <div class="step-navigation">
          <div
            v-for="(step, index) in currentSteps"
            :key="index"
            class="step-item"
            :class="{
              active: currentStep === index,
              completed: currentStep > index,
              clickable: index < currentStep || (index === currentStep + 1 && canProceedToNext),
            }"
            @click="goToStep(index)"
          >
            <div class="step-number">
              <el-icon v-if="currentStep > index" :size="16"><Check /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-info">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.description }}</div>
            </div>
            <div
              v-if="index < currentSteps.length - 1"
              class="step-connector"
              :class="{ completed: currentStep > index }"
            />
          </div>
        </div>

        <div class="wizard-progress">
          <el-progress :percentage="progressPercentage" :stroke-width="8" :show-text="false" :color="progressColor" />
          <span class="progress-text">完成进度 {{ progressPercentage }}%</span>
        </div>

        <div class="wizard-tips">
          <el-alert v-if="currentStep === 0" title="提示" type="info" :closable="false" show-icon>
            请填写入库单的基本信息，带 * 的为必填项
          </el-alert>
          <el-alert v-else-if="currentStep === 1" title="提示" type="info" :closable="false" show-icon>
            请添加需要入库的设备，支持批量添加
          </el-alert>
          <el-alert v-else-if="currentStep === 2" title="提示" type="info" :closable="false" show-icon>
            {{ getDetailStepTip() }}
          </el-alert>
          <el-alert v-else-if="currentStep === 3" title="提示" type="warning" :closable="false" show-icon>
            请仔细核对以下信息，确认无误后提交审批
          </el-alert>

          <!-- 键盘快捷键提示 -->
          <el-alert
            title="键盘快捷键"
            type="info"
            :closable="false"
            class="keyboard-shortcuts"
            style="margin-top: 12px"
          >
            <div class="shortcut-list">
              <span class="shortcut-item"><kbd>←</kbd> <kbd>↑</kbd> 上一步</span>
              <span class="shortcut-item"><kbd>→</kbd> <kbd>↓</kbd> 下一步</span>
              <span class="shortcut-item"><kbd>Enter</kbd> 确认</span>
              <span class="shortcut-item"><kbd>Esc</kbd> 关闭</span>
              <span class="shortcut-item"><kbd>Ctrl</kbd>+<kbd>S</kbd> 保存草稿</span>
            </div>
          </el-alert>
        </div>
      </div>

      <div class="wizard-main">
        <transition name="slide-fade" mode="out-in">
          <div v-if="currentStep === 0" key="step0" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><Document /></el-icon> 基本信息
              </h3>
              <p>填写入库单的基础信息</p>
            </div>

            <el-form
              ref="basicFormRef"
              :model="formData.basic"
              :rules="basicRules"
              label-width="120px"
              label-position="right"
              class="wizard-form"
            >
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="入库单号" prop="orderNo">
                    <el-input v-model="formData.basic.orderNo" placeholder="系统自动生成" disabled>
                      <template #prefix>
                        <el-icon><Tickets /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="入库日期" prop="orderDate">
                    <el-date-picker
                      v-model="formData.basic.orderDate"
                      type="date"
                      placeholder="选择入库日期"
                      style="width: 100%"
                      :disabled-date="disabledDate"
                      value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="入库类型" prop="inboundType">
                    <el-select
                      v-model="formData.basic.inboundType"
                      placeholder="请选择入库类型"
                      style="width: 100%"
                      @change="handleInboundTypeChange"
                    >
                      <el-option label="采购入库" value="purchase">
                        <el-icon><ShoppingCart /></el-icon> 采购入库
                      </el-option>
                      <el-option label="退货入库" value="return">
                        <el-icon><RefreshLeft /></el-icon> 退货入库
                      </el-option>
                      <el-option label="调拨入库" value="transfer">
                        <el-icon><Sort /></el-icon> 调拨入库
                      </el-option>
                      <el-option label="其他入库" value="other">
                        <el-icon><MoreFilled /></el-icon> 其他入库
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="入库仓库" prop="warehouseId">
                    <el-select
                      v-model="formData.basic.warehouseId"
                      placeholder="请选择入库仓库"
                      style="width: 100%"
                      filterable
                    >
                      <el-option v-for="wh in warehouseList" :key="wh.id" :label="wh.name" :value="wh.id">
                        <span>{{ wh.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 12px">
                          {{ wh.code }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="经办人" prop="operatorId">
                    <el-select
                      v-model="formData.basic.operatorId"
                      placeholder="请选择经办人"
                      style="width: 100%"
                      filterable
                    >
                      <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id">
                        <span>{{ user.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 12px">
                          {{ user.department || '' }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="入库原因" prop="reason">
                    <el-input v-model="formData.basic.reason" placeholder="请输入入库原因" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.basic.remark"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入备注信息（选填）"
                  maxlength="300"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </div>

          <div v-else-if="currentStep === 1" key="step1" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><Box /></el-icon> 设备入库录入
              </h3>
              <p>添加需要入库的设备信息，支持批量和单个两种模式</p>
            </div>

            <InboundDeviceForm
              ref="deviceFormRef"
              v-model="formData.devices"
              :warehouse-list="warehouseList"
              :zone-list="zoneList"
              :bin-list="binList"
            />
          </div>

          <div v-else-if="currentStep === 2" key="step2" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><List /></el-icon> {{ getDetailStepTitle() }}
              </h3>
              <p>{{ getDetailStepDescription() }}</p>
            </div>

            <PurchaseDetailForm
              v-if="formData.basic.inboundType === 'purchase'"
              ref="detailFormRef"
              v-model="formData.detail"
              :supplier-list="supplierList"
            />
            <ReturnDetailForm
              v-else-if="formData.basic.inboundType === 'return'"
              ref="detailFormRef"
              v-model="formData.detail"
            />
            <TransferInboundDetailForm
              v-else-if="formData.basic.inboundType === 'transfer'"
              ref="detailFormRef"
              v-model="formData.detail"
              :warehouse-list="warehouseList"
              :source-warehouse-id="formData.basic.warehouseId"
            />
            <OtherInboundDetailForm v-else ref="detailFormRef" v-model="formData.detail" />
          </div>

          <div v-else-if="currentStep === 3" key="step3" class="step-content">
            <div class="step-header">
              <h3>
                <el-icon><CircleCheck /></el-icon> 确认提交
              </h3>
              <p>请仔细核对以下信息，确认无误后提交审批</p>
            </div>

            <div class="confirm-content">
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="基本信息" name="basic">
                  <template #title>
                    <div class="collapse-title">
                      <el-icon><Document /></el-icon>
                      <span>基本信息</span>
                      <el-tag type="success" size="small" v-if="isBasicInfoComplete">已填写</el-tag>
                      <el-tag type="warning" size="small" v-else>待完善</el-tag>
                    </div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="入库单号">
                      {{ formData.basic.orderNo || '自动生成' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="入库日期">
                      {{ formData.basic.orderDate || '未选择' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="入库类型">
                      <el-tag size="small">{{ getInboundTypeText(formData.basic.inboundType) }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="入库仓库">
                      {{ getWarehouseName(formData.basic.warehouseId) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="经办人">
                      {{ getUserName(formData.basic.operatorId) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="入库原因">
                      {{ formData.basic.reason || '未填写' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="备注" :span="2">
                      {{ formData.basic.remark || '无' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>

                <el-collapse-item title="设备列表" name="devices">
                  <template #title>
                    <div class="collapse-title">
                      <el-icon><Box /></el-icon>
                      <span>设备列表</span>
                      <el-tag type="success" size="small" v-if="totalQuantity > 0"> {{ totalQuantity }} 台 </el-tag>
                      <el-tag type="warning" size="small" v-else>未添加</el-tag>
                    </div>
                  </template>
                  <!-- 批量模式显示 -->
                  <template v-if="formData.devices.mode === 'batch' && formData.devices.batchList.length > 0">
                    <el-table :data="formData.devices.batchList" size="small" border max-height="200">
                      <el-table-column type="index" label="序号" width="50" align="center" />
                      <el-table-column label="设备类型" min-width="120">
                        <template #default="{ row }">
                          {{ row.deviceTypeName }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="quantity" label="数量" width="70" align="center" />
                      <el-table-column label="单价" width="100" align="right">
                        <template #default="{ row }"> ¥{{ row.unitPrice?.toFixed(2) || '0.00' }} </template>
                      </el-table-column>
                      <el-table-column label="小计" width="100" align="right">
                        <template #default="{ row }">
                          ¥{{ ((row.quantity || 0) * (row.unitPrice || 0)).toFixed(2) }}
                        </template>
                      </el-table-column>
                      <el-table-column label="存放位置" min-width="150">
                        <template #default="{ row }">
                          {{ getWarehouseName(row.warehouseId) }} - {{ getZoneName(row.zoneId) }} -
                          {{ getBinName(row.binId) }}
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                  <!-- 单个模式显示 -->
                  <template v-else-if="formData.devices.mode === 'single' && formData.devices.singleList.length > 0">
                    <el-table :data="formData.devices.singleList" size="small" border max-height="200">
                      <el-table-column type="index" label="序号" width="50" align="center" />
                      <el-table-column label="设备编号" width="120">
                        <template #default="{ row }">
                          {{ row.deviceCode }}
                        </template>
                      </el-table-column>
                      <el-table-column label="设备类型" min-width="120">
                        <template #default="{ row }">
                          {{ row.deviceTypeName }}
                        </template>
                      </el-table-column>
                      <el-table-column label="序列号" width="120">
                        <template #default="{ row }">
                          {{ row.serialNumber || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column label="采购价" width="100" align="right">
                        <template #default="{ row }"> ¥{{ row.purchasePrice?.toFixed(2) || '0.00' }} </template>
                      </el-table-column>
                      <el-table-column label="存放位置" min-width="150">
                        <template #default="{ row }">
                          {{ getWarehouseName(row.warehouseId) }} - {{ getZoneName(row.zoneId) }} -
                          {{ getBinName(row.binId) }}
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                  <div class="total-amount" v-if="totalQuantity > 0">
                    合计数量：<strong>{{ totalQuantity }} 台</strong>， 合计金额：<strong
                      >¥{{ totalAmount.toFixed(2) }}</strong
                    >
                  </div>
                </el-collapse-item>

                <el-collapse-item title="详细信息" name="detail">
                  <template #title>
                    <div class="collapse-title">
                      <el-icon><List /></el-icon>
                      <span>{{ getDetailStepTitle() }}</span>
                      <el-tag type="success" size="small" v-if="isDetailInfoComplete">已填写</el-tag>
                      <el-tag type="warning" size="small" v-else>待完善</el-tag>
                    </div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <template v-if="formData.basic.inboundType === 'purchase'">
                      <el-descriptions-item label="采购单号">{{
                        formData.detail.purchaseOrderNo || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="采购日期">{{
                        formData.detail.purchaseDate || '未选择'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="采购类型">{{
                        getPurchaseTypeText(formData.detail.purchaseType)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="供应商">{{
                        getSupplierName(formData.detail.supplierId)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="发票号码">{{
                        formData.detail.invoiceNo || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="发票金额"
                        >¥{{ formData.detail.invoiceAmount?.toFixed(2) || '0.00' }}</el-descriptions-item
                      >
                    </template>
                    <template v-else-if="formData.basic.inboundType === 'return'">
                      <el-descriptions-item label="原出库单号">{{
                        formData.detail.originalOutboundNo || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="退货日期">{{
                        formData.detail.returnDate || '未选择'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="退货类型">{{
                        getReturnTypeText(formData.detail.returnType)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="设备状态">{{
                        getDeviceStatusText(formData.detail.deviceStatus)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="客户名称">{{
                        formData.detail.customerName || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="是否退款">{{
                        formData.detail.isRefund ? '是' : '否'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="退货原因" :span="2">{{
                        formData.detail.returnReason || '未填写'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else-if="formData.basic.inboundType === 'transfer'">
                      <el-descriptions-item label="原调拨单号">{{
                        formData.detail.originalTransferNo || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="调拨日期">{{
                        formData.detail.transferDate || '未选择'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="调拨类型">{{
                        getTransferTypeText(formData.detail.transferType)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="运输方式">{{
                        getTransportMethodText(formData.detail.transportMethod)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="发货人">{{
                        formData.detail.senderName || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="发货人电话">{{
                        formData.detail.senderPhone || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="调拨原因" :span="2">{{
                        formData.detail.transferReason || '未填写'
                      }}</el-descriptions-item>
                    </template>
                    <template v-else>
                      <el-descriptions-item label="入库来源">{{
                        getInboundSourceText(formData.detail.inboundSource)
                      }}</el-descriptions-item>
                      <el-descriptions-item label="入库日期">{{
                        formData.detail.inboundDate || '未选择'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="来源方">{{
                        formData.detail.sourceName || '未填写'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="是否计价">{{
                        formData.detail.hasValue ? '是' : '否'
                      }}</el-descriptions-item>
                      <el-descriptions-item label="入库说明" :span="2">{{
                        formData.detail.description || '未填写'
                      }}</el-descriptions-item>
                    </template>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>

              <div class="confirm-actions">
                <el-checkbox v-model="confirmed" size="large"> 我已确认以上信息准确无误，同意提交审批 </el-checkbox>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <template #footer>
      <div class="wizard-footer">
        <div class="footer-left">
          <el-button link @click="handleSaveDraft" :loading="savingDraft">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
          <span v-if="lastSaveTime" class="last-save-time"> 上次保存: {{ lastSaveTime }} </span>
        </div>
        <div class="footer-right">
          <el-button v-if="currentStep > 0" @click="handlePrev">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="handleNext" :disabled="!canProceedToNext">
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-else type="success" :loading="submitting" :disabled="!confirmed" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            提交审批
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CircleCheck,
  Delete,
  Document,
  Download,
  Goods,
  List,
  Money,
  MoreFilled,
  Plus,
  RefreshLeft,
  Search,
  ShoppingCart,
  Sort,
  Tickets,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import OtherInboundDetailForm from './inbound-detail-forms/OtherInboundDetailForm.vue';
import PurchaseDetailForm from './inbound-detail-forms/PurchaseDetailForm.vue';
import ReturnDetailForm from './inbound-detail-forms/ReturnDetailForm.vue';
import TransferInboundDetailForm from './inbound-detail-forms/TransferInboundDetailForm.vue';
import InboundDeviceForm from './inbound-device-forms/InboundDeviceForm.vue';

import { createLogger } from '@/utils/logger';

const logger = createLogger('InboundCreationWizard');
const router = useRouter();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  warehouseList: {
    type: Array,
    default: () => [],
  },
  zoneList: {
    type: Array,
    default: () => [],
  },
  binList: {
    type: Array,
    default: () => [],
  },
  userList: {
    type: Array,
    default: () => [],
  },
  deviceList: {
    type: Array,
    default: () => [],
  },
  deviceTypeList: {
    type: Array,
    default: () => [],
  },
  supplierList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'save-draft']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const baseSteps = [
  { title: '基本信息', description: '填写入库单基础信息' },
  { title: '设备选择', description: '添加入库设备' },
  { title: '详细信息', description: '填写详细信息' },
  { title: '确认提交', description: '核对并提交申请' },
];

const stepTitlesByType = {
  purchase: { title: '采购信息', description: '填写采购单号和供应商信息' },
  return: { title: '退货信息', description: '填写退货原因和客户信息' },
  transfer: { title: '调拨信息', description: '填写调拨来源和运输信息' },
  other: { title: '详细信息', description: '填写入库来源和说明' },
};

const currentSteps = computed(() => {
  const steps = [...baseSteps];
  const type = formData.basic.inboundType;
  if (type && stepTitlesByType[type]) {
    steps[2] = {
      title: stepTitlesByType[type].title,
      description: stepTitlesByType[type].description,
    };
  }
  return steps;
});

const currentStep = ref(0);
const submitting = ref(false);
const savingDraft = ref(false);
const confirmed = ref(false);
const lastSaveTime = ref('');
const deviceLoading = ref(false);

const basicFormRef = ref(null);
const detailFormRef = ref(null);
const deviceTableRef = ref(null);

const deviceSearchKeyword = ref('');
const deviceTypeFilter = ref('');
const activeCollapse = ref(['basic', 'devices', 'detail']);

const deviceTypes = ref([
  { label: '服务器', value: 'server' },
  { label: '网络设备', value: 'network' },
  { label: '存储设备', value: 'storage' },
  { label: '终端设备', value: 'terminal' },
]);

let rowKeyCounter = 0;

const getInitialDetail = () => ({
  purchaseOrderNo: '',
  purchaseDate: null,
  purchaseType: '',
  purchaseDepartment: '',
  supplierId: '',
  supplierContact: '',
  supplierPhone: '',
  supplierAddress: '',
  contractNo: '',
  invoiceNo: '',
  invoiceType: '',
  invoiceAmount: 0,
  transportMethod: '',
  trackingNo: '',
  expectedArrivalDate: null,
  receiverName: '',
  remark: '',
  originalOutboundNo: '',
  returnDate: null,
  returnType: '',
  priority: 'medium',
  returnReason: '',
  deviceStatus: '',
  needsInspection: false,
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  customerAddress: '',
  isRefund: false,
  refundAmount: 0,
  refundMethod: '',
  refundAccount: '',
  handlingOpinion: '',
  originalTransferNo: '',
  transferDate: null,
  transferType: '',
  sourceWarehouseId: '',
  sourceWarehouseAddress: '',
  senderName: '',
  senderPhone: '',
  transferReason: '',
  transportCost: 0,
  costBearer: '',
  inboundDate: null,
  inboundSource: '',
  relatedOrderNo: '',
  description: '',
  sourceName: '',
  sourceContactPerson: '',
  sourceContactPhone: '',
  sourceAddress: '',
  hasValue: false,
  totalValue: 0,
  valueType: '',
  appraiser: '',
});

// 初始化设备列表（新的数据结构）
const getInitialDevices = () => ({
  mode: 'batch', // 'batch' 或 'single'
  batchList: [], // 批量模式设备列表
  singleList: [], // 单个模式设备列表
});

const formData = reactive({
  basic: {
    orderNo: '',
    orderDate: null,
    inboundType: '',
    warehouseId: '',
    operatorId: '',
    reason: '',
    remark: '',
  },
  devices: getInitialDevices(),
  detail: getInitialDetail(),
});

const basicRules = {
  orderDate: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  inboundType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择入库仓库', trigger: 'change' }],
  operatorId: [{ required: true, message: '请选择经办人', trigger: 'change' }],
};

const progressPercentage = computed(() => {
  return Math.round((currentStep.value / (currentSteps.value.length - 1)) * 100);
});

const progressColor = computed(() => {
  const colors = ['#67C23A', '#409EFF', '#E6A23C', '#67C23A'];
  return colors[currentStep.value];
});

const canProceedToNext = computed(() => {
  if (currentStep.value === 0) {
    return !!(
      formData.basic.orderDate &&
      formData.basic.inboundType &&
      formData.basic.warehouseId &&
      formData.basic.operatorId
    );
  }
  if (currentStep.value === 1) {
    // 检查是否有设备数据
    const { mode, batchList, singleList } = formData.devices;
    if (mode === 'batch') {
      return batchList.length > 0 && batchList.every((d) => d.deviceTypeId && d.quantity > 0);
    }
    return singleList.length > 0 && singleList.every((d) => d.deviceTypeId && d.deviceCode);
  }
  if (currentStep.value === 2) {
    return isDetailInfoComplete.value;
  }
  return true;
});

const isBasicInfoComplete = computed(() => {
  return !!(
    formData.basic.orderDate &&
    formData.basic.inboundType &&
    formData.basic.warehouseId &&
    formData.basic.operatorId
  );
});

const isDetailInfoComplete = computed(() => {
  const type = formData.basic.inboundType;
  const { detail } = formData;

  switch (type) {
    case 'purchase':
      return !!(detail.purchaseOrderNo && detail.purchaseDate && detail.purchaseType && detail.supplierId);
    case 'return':
      return !!(
        detail.originalOutboundNo &&
        detail.returnDate &&
        detail.returnType &&
        detail.returnReason &&
        detail.deviceStatus
      );
    case 'transfer':
      return !!(
        detail.originalTransferNo &&
        detail.transferDate &&
        detail.transferType &&
        detail.transferReason &&
        detail.senderName &&
        detail.senderPhone &&
        detail.transportMethod
      );
    case 'other':
      return !!(detail.inboundDate && detail.inboundSource && detail.description && detail.sourceName);
    default:
      return false;
  }
});

const filteredAvailableDevices = computed(() => {
  let list = props.deviceList;

  if (deviceSearchKeyword.value) {
    const keyword = deviceSearchKeyword.value.toLowerCase();
    list = list.filter(
      (device) =>
        device.deviceCode?.toLowerCase().includes(keyword) ||
        device.deviceName?.toLowerCase().includes(keyword) ||
        device.model?.toLowerCase().includes(keyword)
    );
  }

  if (deviceTypeFilter.value) {
    list = list.filter((device) => device.deviceType === deviceTypeFilter.value);
  }

  return list;
});

const totalQuantity = computed(() => {
  const { mode, batchList, singleList } = formData.devices;
  if (mode === 'batch') {
    return batchList.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
  return singleList.length;
});

const totalAmount = computed(() => {
  const { mode, batchList, singleList } = formData.devices;
  if (mode === 'batch') {
    return batchList.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  }
  return singleList.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
});

const disabledDate = (date) => {
  return date > new Date(new Date().setHours(23, 59, 59, 999));
};

const getInboundTypeText = (type) => {
  const typeMap = {
    purchase: '采购入库',
    return: '退货入库',
    transfer: '调拨入库',
    other: '其他入库',
  };
  return typeMap[type] || '未知类型';
};

const getWarehouseName = (id) => {
  const warehouse = props.warehouseList.find((w) => w.id === id);
  return warehouse?.name || '未选择';
};

const getZoneName = (id) => {
  const zone = props.zoneList.find((z) => z.id === id);
  return zone?.name || '-';
};

const getBinName = (id) => {
  const bin = props.binList.find((b) => b.id === id);
  return bin?.code || '-';
};

const getUserName = (id) => {
  const user = props.userList.find((u) => u.id === id);
  return user?.name || '未选择';
};

const getSupplierName = (id) => {
  const supplier = props.supplierList.find((s) => s.id === id);
  return supplier?.name || '未选择';
};

const getDeviceName = (id) => {
  const device = props.deviceList.find((d) => d.id === id);
  return device?.deviceName || '';
};

const getDeviceCode = (id) => {
  const device = props.deviceList.find((d) => d.id === id);
  return device?.deviceCode || '';
};

const getDeviceType = (id) => {
  const device = props.deviceList.find((d) => d.id === id);
  return device?.deviceType || '';
};

const getDeviceModel = (id) => {
  const device = props.deviceList.find((d) => d.id === id);
  return device?.model || '';
};

const getPurchaseTypeText = (type) => {
  const typeMap = {
    normal: '常规采购',
    urgent: '紧急采购',
    supplementary: '补充采购',
    project: '项目采购',
  };
  return typeMap[type] || '未选择';
};

const getReturnTypeText = (type) => {
  const typeMap = {
    quality: '质量问题退货',
    specification: '规格不符退货',
    quantity: '数量错误退货',
    rejection: '客户拒收退货',
    other: '其他原因退货',
  };
  return typeMap[type] || '未选择';
};

const getTransferTypeText = (type) => {
  const typeMap = {
    normal: '正常调拨',
    emergency: '紧急调拨',
    borrow_return: '借调归还',
    cross_company: '跨公司调拨',
  };
  return typeMap[type] || '未选择';
};

const getTransportMethodText = (method) => {
  const methodMap = {
    self_pickup: '自提',
    express: '快递',
    logistics: '物流',
    dedicated: '专车配送',
  };
  return methodMap[method] || '未选择';
};

const getDeviceStatusText = (status) => {
  const statusMap = {
    good: '完好无损',
    minor_damage: '轻微损坏',
    major_damage: '严重损坏',
    needs_repair: '需要维修',
    unusable: '无法使用',
  };
  return statusMap[status] || '未选择';
};

const getInboundSourceText = (source) => {
  const sourceMap = {
    donation: '捐赠',
    borrow_return: '借用归还',
    sample: '样品入库',
    inventory_gain: '盘盈',
    other: '其他',
  };
  return sourceMap[source] || '未选择';
};

const getDetailStepTitle = () => {
  const type = formData.basic.inboundType;
  return stepTitlesByType[type]?.title || '详细信息';
};

const getDetailStepDescription = () => {
  const type = formData.basic.inboundType;
  return stepTitlesByType[type]?.description || '填写详细信息';
};

const getDetailStepTip = () => {
  const type = formData.basic.inboundType;
  const tips = {
    purchase: '请填写采购单号、供应商信息和发票信息',
    return: '请填写退货原因、设备状态和客户信息',
    transfer: '请填写调拨来源、运输信息和发货人信息',
    other: '请填写入库来源和详细说明',
  };
  return tips[type] || '请填写详细信息';
};

const handleInboundTypeChange = (type) => {
  logger.info('入库类型变更', type);
  formData.detail = getInitialDetail();
};

const handleDeviceSearch = () => {
  logger.info('设备搜索', {
    keyword: deviceSearchKeyword.value,
    type: deviceTypeFilter.value,
  });
};

const handleDeviceSelect = (deviceId, index) => {
  const device = props.deviceList.find((d) => d.id === deviceId);
  if (device) {
    formData.devices[index].deviceName = device.deviceName;
    formData.devices[index].deviceCode = device.deviceCode;
  }
};

// 设备表单相关方法已由 InboundDeviceForm 组件内部处理
// 这些方法保留用于兼容性，实际逻辑在子组件中

const goToStep = (index) => {
  if (index <= currentStep.value || (index === currentStep.value + 1 && canProceedToNext.value)) {
    currentStep.value = index;
  }
};

const deviceFormRef = ref(null);

const validateCurrentStep = async () => {
  if (currentStep.value === 0) {
    const isValid = await basicFormRef.value?.validate().catch(() => false);
    if (!isValid) {
      // 验证失败时滚动到第一个错误字段
      scrollToFirstError(basicFormRef.value);
    }
    return isValid;
  }
  if (currentStep.value === 1) {
    // 通过 ref 调用子组件的验证方法
    const isValid = await deviceFormRef.value?.validate?.();
    if (!isValid) {
      ElMessage.warning('请完善设备信息');
      // 滚动到设备表单区域
      scrollToDeviceForm();
      return false;
    }
    // 检查是否有设备数据
    const { mode, batchList, singleList } = formData.devices;
    const hasDevices = mode === 'batch' ? batchList.length > 0 : singleList.length > 0;
    if (!hasDevices) {
      ElMessage.warning('请至少添加一条设备记录');
      scrollToDeviceForm();
      return false;
    }
    return true;
  }
  if (currentStep.value === 2) {
    const isValid = await detailFormRef.value?.validate().catch(() => false);
    if (!isValid) {
      // 验证失败时滚动到第一个错误字段
      scrollToFirstError(detailFormRef.value);
    }
    return isValid;
  }
  return true;
};

// 滚动到第一个错误字段
const scrollToFirstError = (formRef) => {
  if (!formRef) {
    return;
  }

  setTimeout(() => {
    // 查找第一个有错误提示的表单项
    const errorItem = document.querySelector('.is-error, .el-form-item__error');
    if (errorItem) {
      // 找到对应的表单项并滚动到可视区域
      const formItem = errorItem.closest('.el-form-item') || errorItem;
      formItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 高亮错误字段
      const input = formItem.querySelector('input, textarea, .el-select');
      if (input) {
        input.focus();
        input.classList.add('error-shake');
        setTimeout(() => input.classList.remove('error-shake'), 500);
      }
    }
  }, 100);
};

// 滚动到设备表单区域
const scrollToDeviceForm = () => {
  setTimeout(() => {
    const deviceForm = document.querySelector('.inbound-device-form, .device-input-card');
    if (deviceForm) {
      deviceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const handleNext = async () => {
  const valid = await validateCurrentStep();
  if (valid) {
    currentStep.value++;
  }
};

const handlePrev = () => {
  currentStep.value--;
};

const handleSaveDraft = async () => {
  savingDraft.value = true;
  try {
    const draftData = {
      step: currentStep.value,
      formData: JSON.parse(JSON.stringify(formData)),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('inbound_wizard_draft', JSON.stringify(draftData));
    lastSaveTime.value = new Date().toLocaleTimeString('zh-CN');
    ElMessage.success('草稿已保存');
    emit('save-draft', draftData);
  } catch (error) {
    logger.error('保存草稿失败', error);
    ElMessage.error('保存草稿失败');
  } finally {
    savingDraft.value = false;
  }
};

const loadDraft = () => {
  const draftStr = localStorage.getItem('inbound_wizard_draft');
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      const savedTime = new Date(draft.savedAt);
      const now = new Date();
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        ElMessageBox.confirm('检测到未完成的入库单草稿，是否恢复？', '恢复草稿', {
          confirmButtonText: '恢复',
          cancelButtonText: '重新开始',
          type: 'info',
        })
          .then(() => {
            currentStep.value = draft.step;
            Object.assign(formData.basic, draft.formData.basic);
            formData.devices = draft.formData.devices;
            Object.assign(formData.detail, draft.formData.detail);
            ElMessage.success('草稿已恢复');
          })
          .catch(() => {
            localStorage.removeItem('inbound_wizard_draft');
          });
      }
    } catch (e) {
      logger.error('加载草稿失败', e);
    }
  }
};

const handleSubmit = async () => {
  if (!confirmed.value) {
    ElMessage.warning('请确认信息后再提交');
    return;
  }

  submitting.value = true;
  try {
    // 根据模式获取设备列表
    const deviceList = formData.devices.mode === 'batch' ? formData.devices.batchList : formData.devices.singleList;

    const submitData = {
      ...formData.basic,
      ...formData.detail,
      devices: deviceList
        .filter((d) => d.deviceId || d.deviceTypeId)
        .map((d) => ({
          deviceId: d.deviceId || d.deviceTypeId,
          deviceCode: d.deviceCode || getDeviceCode(d.deviceId),
          deviceName: d.deviceName || getDeviceName(d.deviceId),
          quantity: d.quantity,
          unitPrice: d.unitPrice,
        })),
      totalQuantity: totalQuantity.value,
      totalAmount: totalAmount.value,
    };

    emit('submit', submitData);
    localStorage.removeItem('inbound_wizard_draft');
    ElMessage.success('入库单已提交，等待审批');
    visible.value = false;
    resetForm();
  } catch (error) {
    logger.error('提交失败', error);
    ElMessage.error('提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消吗？未保存的数据将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      visible.value = false;
      resetForm();
    })
    .catch(() => {});
};

const handleDialogClose = () => {
  resetForm();
};

const resetForm = () => {
  currentStep.value = 0;
  confirmed.value = false;
  rowKeyCounter = 0;
  Object.assign(formData, {
    basic: {
      orderNo: '',
      orderDate: null,
      inboundType: '',
      warehouseId: '',
      operatorId: '',
      reason: '',
      remark: '',
    },
    devices: getInitialDevices(),
    detail: getInitialDetail(),
  });
};

watch(visible, (val) => {
  if (val) {
    loadDraft();
    // 对话框打开时添加键盘事件监听
    document.addEventListener('keydown', handleKeydown);
  } else {
    // 对话框关闭时移除键盘事件监听
    document.removeEventListener('keydown', handleKeydown);
  }
});

// 键盘事件处理
const handleKeydown = (event) => {
  // 忽略在输入框、文本域中的按键
  const { activeElement } = document;
  const isInputElement =
    activeElement &&
    (activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true');

  if (isInputElement) {
    // 在输入框中时，只处理 Escape 键
    if (event.key === 'Escape') {
      activeElement.blur();
    }
    return;
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      // 右箭头或下箭头：下一步
      if (canProceedToNext.value && currentStep.value < currentSteps.value.length - 1) {
        event.preventDefault();
        handleNext();
      }
      break;

    case 'ArrowLeft':
    case 'ArrowUp':
      // 左箭头或上箭头：上一步
      if (currentStep.value > 0) {
        event.preventDefault();
        handlePrev();
      }
      break;

    case 'Enter':
      // Enter 键：根据当前步骤执行相应操作
      event.preventDefault();
      if (currentStep.value < currentSteps.value.length - 1) {
        // 不是最后一步，执行下一步
        handleNext();
      } else {
        // 最后一步，尝试提交
        const submitBtn = document.querySelector('.wizard-footer .el-button--success');
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      }
      break;

    case 'Escape':
      // Escape 键：关闭向导
      event.preventDefault();
      handleCancel();
      break;

    case 's':
    case 'S':
      // Ctrl+S 或 Cmd+S：保存草稿
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        handleSaveDraft();
      }
      break;

    case 'Home':
      // Home 键：跳转到第一步
      event.preventDefault();
      if (currentStep.value > 0) {
        goToStep(0);
      }
      break;

    case 'End':
      // End 键：跳转到最后一步
      event.preventDefault();
      {
        const lastStep = currentSteps.value.length - 1;
        if (currentStep.value < lastStep && canProceedToNext.value) {
          goToStep(lastStep);
        }
      }
      break;
  }
};

// 组件挂载时添加键盘快捷键提示
onMounted(() => {
  logger.info('入库向导组件已挂载，键盘快捷键已启用');
});

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  logger.info('入库向导组件已卸载，键盘快捷键已清理');
});
</script>

<style scoped>
.inbound-wizard-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.wizard-container {
  display: flex;
  min-height: 600px;
}

.wizard-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #f8fdf8 0%, #f0f9f0 100%);
  border-right: 1px solid var(--el-border-color-light);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.wizard-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.wizard-title h2 {
  margin: 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.step-navigation {
  flex: 1;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: default;
  transition: all 0.3s;
  position: relative;
  margin-bottom: 8px;
}

.step-item.clickable {
  cursor: pointer;
}

.step-item.clickable:hover {
  background: rgba(103, 194, 58, 0.1);
}

.step-item.active {
  background: rgba(103, 194, 58, 0.15);
}

.step-item.completed .step-number {
  background: var(--el-color-success);
  color: white;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
  transition: all 0.3s;
}

.step-item.active .step-number {
  background: var(--el-color-success);
  color: white;
}

.step-info {
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.step-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.step-connector {
  position: absolute;
  left: 27px;
  top: 44px;
  width: 2px;
  height: 24px;
  background: var(--el-border-color);
}

.step-connector.completed {
  background: var(--el-color-success);
}

.wizard-progress {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.wizard-tips {
  margin-top: 16px;
}

/* 键盘快捷键提示样式 */
.keyboard-shortcuts {
  :deep(.el-alert__content) {
    width: 100%;
  }

  .shortcut-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .shortcut-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-regular);

    kbd {
      display: inline-block;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.4;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    }
  }
}

.wizard-main {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-header {
  margin-bottom: 24px;
}

.step-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-header h3 .el-icon {
  color: var(--el-color-success);
}

.step-header p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.wizard-form {
  max-width: 100%;
}

.device-selection-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selection-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.device-table-wrapper {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}

.subtotal {
  font-weight: 500;
  color: var(--el-color-primary);
}

.selection-summary {
  display: flex;
  gap: 32px;
  padding: 16px 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item strong {
  color: var(--el-color-success);
  font-size: 18px;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-title .el-icon {
  color: var(--el-color-success);
}

.confirm-actions {
  margin-top: 24px;
  padding: 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  text-align: center;
}

.total-amount {
  text-align: right;
  padding: 12px 0;
  font-size: 16px;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 12px;
}

.total-amount strong {
  color: var(--el-color-danger);
  font-size: 20px;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.last-save-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.footer-right {
  display: flex;
  gap: 10px;
}

@media (max-width: 1200px) {
  .wizard-container {
    flex-direction: column;
  }

  .wizard-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 16px;
  }

  .step-navigation {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .step-item {
    flex: 1;
    min-width: 200px;
  }

  .step-connector {
    display: none;
  }
}
/* 错误字段抖动动画 */
@keyframes errorShake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}

.error-shake {
  animation: errorShake 0.5s ease-in-out;
  border-color: var(--el-color-danger) !important;
}

/* 错误字段高亮 */
:deep(.is-error) {
  .el-input__wrapper,
  .el-textarea__inner,
  .el-select .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }
}

/* 平滑滚动 */
.wizard-main {
  scroll-behavior: smooth;
}
</style>
