<!--
  @file: DeviceDetailDialog.vue
  @description: 设备详情对话框组件，用于展示设备详细信息
  @author: 开发团队
  @createTime: 2025-12-21
  @version: 1.0
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="设备详情"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    class="device-detail-dialog"
    data-cy="device-detail-dialog"
  >
    <div v-loading="loading" class="detail-content">
      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" type="border-card" data-cy="device-detail-tabs">
        <!-- 设备详情标签 -->
        <el-tab-pane name="detail" data-cy="device-detail-tab-pane">
          <template #label>
            <el-icon><InfoFilled /></el-icon>
            <span>设备详情</span>
          </template>
          <div class="device-detail-panel">
            <!-- 设备头部信息 -->
            <div class="device-header">
              <div class="device-image-section">
                <div v-if="device?.imageUrl" class="device-image-wrapper">
                  <el-image
                    :src="device.imageUrl"
                    :preview-src-list="[device.imageUrl]"
                    fit="cover"
                    class="device-image"
                  />
                </div>
                <div v-else class="device-image-placeholder">
                  <el-icon :size="48" color="#dcdfe6">
                    <Picture />
                  </el-icon>
                </div>
              </div>
              <div class="device-basic-info">
                <h3 class="device-name">{{ device?.deviceName || device?.name || '未命名设备' }}</h3>
                <p class="device-code">编号: {{ device?.deviceCode || '-' }}</p>
                <el-tag :type="getDeviceStatusTagType(device?.status)" size="default" class="device-status">
                  {{ getDeviceStatusText(device?.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 详细信息网格 -->
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">设备类型</span>
                <span class="info-value">{{ getDeviceTypeName(device) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">制造商</span>
                <span class="info-value">{{ device?.manufacturer || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">型号/规格</span>
                <span class="info-value">{{ device?.deviceModel || device?.model || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">序列号/SN</span>
                <span class="info-value">{{ device?.serialNumber || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">资产编号</span>
                <span class="info-value">{{ device?.assetCode || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">价格</span>
                <span class="info-value">{{ device?.price ? '¥' + device.price : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生产日期</span>
                <span class="info-value">{{ formatDate(device?.productionDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">入库日期</span>
                <span class="info-value">{{ formatDate(device?.purchaseDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">保修期</span>
                <span class="info-value">{{ device?.warrantyPeriod ? device.warrantyPeriod + '个月' : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">保修到期</span>
                <span class="info-value">{{ formatDate(device?.warrantyEnd) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">当前位置</span>
                <span class="info-value">{{ getCurrentLocation(device) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">负责人</span>
                <span class="info-value">{{ device?.principalName || device?.principal?.name || '-' }}</span>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="device?.remark" class="remark-section">
              <span class="remark-label">备注</span>
              <p class="remark-content">{{ device.remark }}</p>
            </div>
          </div>
        </el-tab-pane>

        <!-- 状态记录标签 -->
        <el-tab-pane name="status" data-cy="device-status-tab-pane">
          <template #label>
            <el-icon><Timer /></el-icon>
            <span>状态记录</span>
          </template>
          <el-empty v-if="!statusRecords.length" description="暂无状态记录" data-cy="device-status-empty" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="(record, index) in statusRecords"
              :key="index"
              :timestamp="record.createTime"
              placement="top"
              :data-cy="`device-status-timeline-item-${index}`"
            >
              <el-card shadow="hover" size="small" :data-cy="`device-status-card-${index}`">
                <template #header>
                  <span class="timeline-title" :data-cy="`device-status-title-${index}`">{{ record.statusName }}</span>
                </template>
                <p class="timeline-desc" :data-cy="`device-status-desc-${index}`">{{ record.description || '无描述' }}</p>
                <p class="timeline-operator" :data-cy="`device-status-operator-${index}`">操作人: {{ record.operatorName || '-' }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <!-- 操作记录标签 -->
        <el-tab-pane name="operation" data-cy="device-operation-tab-pane">
          <template #label>
            <el-icon><List /></el-icon>
            <span>操作记录</span>
          </template>
          <el-empty v-if="!operationRecords.length" description="暂无操作记录" data-cy="device-operation-empty" />
          <el-table v-else :data="operationRecords" border stripe size="small" data-cy="device-operation-table">
            <el-table-column prop="operationType" label="操作类型" width="120" data-cy="device-operation-type-column" />
            <el-table-column prop="operationTime" label="操作时间" width="160" data-cy="device-operation-time-column" />
            <el-table-column prop="operatorName" label="操作人" width="100" data-cy="device-operation-operator-column" />
            <el-table-column prop="description" label="操作描述" min-width="200" data-cy="device-operation-desc-column" />
          </el-table>
        </el-tab-pane>

        <!-- 安装记录标签 -->
        <el-tab-pane name="installation" data-cy="device-installation-tab-pane">
          <template #label>
            <el-icon><Location /></el-icon>
            <span>安装记录</span>
          </template>
          <el-empty v-if="!installationRecords.length" description="暂无安装记录" data-cy="device-installation-empty" />
          <el-table v-else :data="installationRecords" border stripe size="small" data-cy="device-installation-table">
            <el-table-column prop="installationId" label="安装单号" width="120" data-cy="device-installation-id-column" />
            <el-table-column prop="installationDate" label="安装日期" width="120" data-cy="device-installation-date-column" />
            <el-table-column prop="installerName" label="安装人" width="100" data-cy="device-installation-installer-column" />
            <el-table-column label="安装位置" min-width="200" data-cy="device-installation-location-column">
              <template #default="{ row }">
                {{ getFullInstallationLocation(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" data-cy="device-installation-status-column">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small" :data-cy="`device-installation-status-tag-${row.installationId}`">
                  {{ row.status === 'completed' ? '已完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 维修记录标签 -->
        <el-tab-pane name="repair" data-cy="device-repair-tab-pane">
          <template #label>
            <el-icon><FirstAidKit /></el-icon>
            <span>维修记录</span>
          </template>
          <el-empty v-if="!repairRecords.length" description="暂无维修记录" data-cy="device-repair-empty" />
          <el-table v-else :data="repairRecords" border stripe size="small" data-cy="device-repair-table">
            <el-table-column prop="repairId" label="维修单号" width="120" data-cy="device-repair-id-column" />
            <el-table-column prop="repairDate" label="维修日期" width="120" data-cy="device-repair-date-column" />
            <el-table-column prop="repairerName" label="维修人" width="100" data-cy="device-repair-repairer-column" />
            <el-table-column prop="faultDescription" label="故障描述" min-width="150" data-cy="device-repair-fault-column" />
            <el-table-column prop="repairContent" label="维修内容" min-width="150" data-cy="device-repair-content-column" />
            <el-table-column prop="status" label="状态" width="80" data-cy="device-repair-status-column">
              <template #default="{ row }">
                <el-tag :type="getRepairStatusType(row.status)" size="small" :data-cy="`device-repair-status-tag-${row.repairId}`">
                  {{ getRepairStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 附件文档标签 -->
        <el-tab-pane name="documents" data-cy="device-documents-tab-pane">
          <template #label>
            <el-icon><Folder /></el-icon>
            <span>附件文档</span>
          </template>
          <el-empty v-if="!documents.length" description="暂无附件文档" data-cy="device-documents-empty" />
          <div v-else class="document-list">
            <div v-for="doc in documents" :key="doc.id" class="document-item" :data-cy="`device-document-item-${doc.id}`">
              <el-icon><Document /></el-icon>
              <span class="doc-name">{{ doc.name }}</span>
              <el-button type="primary" link size="small" @click="downloadDocument(doc)" :data-cy="`device-document-download-btn-${doc.id}`">下载</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" data-cy="detail-close-btn">关闭</el-button>
        <el-button type="primary" @click="handleEdit" data-cy="detail-edit-btn">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
        <el-button type="success" @click="handleConnect" data-cy="detail-connect-btn">
          <el-icon><Connection /></el-icon>远程连接
        </el-button>
        <el-button type="danger" @click="handleDelete" data-cy="detail-delete-btn">删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  Connection,
  Document,
  Edit,
  FirstAidKit,
  Folder,
  InfoFilled,
  List,
  Location,
  Picture,
  Timer,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref, watch } from 'vue';

import { getDeviceHistory } from '@/api/device/device';
import installationApi from '@/api/installation/installation';
import { getDeviceMaintenanceHistory } from '@/api/maintenance/maintenance';
import { getDeviceStatusTagType, getDeviceStatusText } from '@/constants/deviceStatus';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceDetailDialog');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  device: {
    type: Object,
    default: () => ({}),
  },
  deviceTypeOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'edit', 'delete', 'connect', 'maintenance', 'history']);

const loading = ref(false);
const activeTab = ref('detail');
const statusRecords = ref([]);
const operationRecords = ref([]);
const installationRecords = ref([]);
const repairRecords = ref([]);
const documents = ref([]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formatDate = (date) => {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取设备类型显示名称
const getDeviceTypeName = (device) => {
  if (!device) {
    return '未分类';
  }

  // 优先使用后端直接返回的 deviceTypeName
  if (device.deviceTypeName) {
    return device.deviceTypeName;
  }

  // 如果 type 是对象且有 name 属性
  if (device.type && typeof device.type === 'object' && device.type.name) {
    return device.type.name;
  }

  // 如果 type 是数字 ID，从 deviceTypeOptions 中查找
  const typeId = device.deviceTypeId || device.typeId || device.type;
  if (typeId !== undefined && typeId !== null) {
    const typeOption = props.deviceTypeOptions.find((opt) => opt.value === typeId || opt.value === Number(typeId));
    if (typeOption) {
      return typeOption.label;
    }
    // 有typeId但找不到对应的类型名称
    return '未知类型';
  }

  // 完全没有类型信息
  return '未分类';
};

// 获取当前位置 - 统一的智能位置显示函数
const getCurrentLocation = (device) => {
  if (!device) {
    return '-';
  }

  // 优先使用后端计算的 currentLocation
  if (device.currentLocation && device.currentLocation !== '-') {
    return device.currentLocation;
  }

  // 根据状态智能判断显示哪种位置
  const { status } = device;

  // 在库状态 - 显示仓库位置
  if (status === 0) {
    const parts = [];
    if (device.warehouseName) {
      parts.push(device.warehouseName);
    }
    if (device.areaName) {
      parts.push(device.areaName);
    }
    if (device.binName) {
      parts.push(device.binName);
    }
    if (parts.length > 0) {
      return parts.join(' > ');
    }
    return '仓库中';
  }

  // 使用中状态 - 显示安装位置
  if (status === 1) {
    // 优先使用 installationLocation
    if (device.installationLocation) {
      return device.installationLocation;
    }

    // 尝试组合省市区地址
    const parts = [];
    if (device.installationProvince) {
      parts.push(device.installationProvince);
    }
    if (device.installationCity) {
      parts.push(device.installationCity);
    }
    if (device.installationDistrict) {
      parts.push(device.installationDistrict);
    }
    if (device.installationAddress) {
      parts.push(device.installationAddress);
    }
    if (parts.length > 0) {
      return parts.join(' > ');
    }
    return '使用中';
  }

  // 其他状态
  if (status === -1) {
    return '待入库';
  }
  if (status === 2) {
    return '维护中';
  }
  if (status === 3) {
    return '已报废';
  }

  return '-';
};

const getFullInstallationLocation = (record) => {
  if (!record) {
    return '-';
  }
  const parts = [record.province, record.city, record.district, record.detailAddr].filter(Boolean);
  return parts.length > 0 ? parts.join(' > ') : '-';
};

const getRepairStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'info',
  };
  return typeMap[status] || 'info';
};

const getRepairStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return textMap[status] || status;
};

const downloadDocument = (doc) => {
  if (doc.url) {
    window.open(doc.url, '_blank');
  } else {
    ElMessage.warning('文档链接不可用');
  }
};

const handleClose = () => {
  dialogVisible.value = false;
};

const handleEdit = () => {
  emit('edit', props.device);
  dialogVisible.value = false;
};

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该设备吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('delete', props.device);
      dialogVisible.value = false;
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

const handleConnect = () => {
  ElMessage.info('远程连接功能开发中');
  emit('connect', props.device);
};

// 加载设备历史记录
const loadDeviceHistory = async (deviceId) => {
  try {
    const response = await getDeviceHistory(deviceId);
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      operationRecords.value = dataArray.map((record) => ({
        operationType: record?.operationType || record?.type || '-',
        operationTime: record?.operationTime || record?.createTime || '-',
        operatorName: record?.operator?.realName || record?.operator?.username || record?.operatorName || '-',
        description: record?.description || record?.remark || '-',
      }));
    } else {
      operationRecords.value = [];
    }
  } catch (error) {
    logger.error('加载设备历史记录失败:', error);
    operationRecords.value = [];
  }
};

// 加载安装记录
const loadInstallationRecords = async (deviceId) => {
  try {
    logger.info('开始加载安装记录, deviceId:', deviceId);
    const response = await installationApi.getInstallationsByDevice(deviceId);
    logger.info('安装记录API响应:', response);
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      installationRecords.value = dataArray.map((record) => ({
        installationId: record.id || '-',
        installationDate: record.installTime || record.createTime || '-',
        installerName: record.operator?.realName || record.operator?.username || '-',
        province: record.province || '',
        city: record.city || '',
        district: record.district || '',
        detailAddr: record.detailAddr || '',
        status: record.status === 2 ? 'completed' : 'pending',
      }));
      logger.info('安装记录加载成功, 数量:', installationRecords.value.length);
    } else {
      logger.warn('安装记录API返回空数据:', response);
      installationRecords.value = [];
    }
  } catch (error) {
    logger.error('加载安装记录失败:', error);
    ElMessage.warning(`安装记录加载失败: ${error.message || '未知错误'}`);
    installationRecords.value = [];
  }
};

// 加载维修记录
const loadRepairRecords = async (deviceId) => {
  try {
    const response = await getDeviceMaintenanceHistory(deviceId);
    if (response.code === 200 && response.data) {
      // 确保 response.data 是数组
      const dataArray = Array.isArray(response.data)
        ? response.data
        : response.data.records || response.data.list || [];
      repairRecords.value = dataArray.map((record) => ({
        repairId: record.id || record.maintenanceNumber || '-',
        repairDate: record.createTime || record.startTime || '-',
        repairerName: record.operator?.realName || record.operator?.username || '-',
        faultDescription: record.faultDesc || '-',
        repairContent: record.repairContent || record.remark || '-',
        status: record.processStatus || record.status || 'pending',
      }));
    } else {
      repairRecords.value = [];
    }
  } catch (error) {
    logger.error('加载维修记录失败:', error);
    repairRecords.value = [];
  }
};

// 加载文档列表
const loadDocuments = async (_deviceId) => {
  // 暂时跳过文档加载，因为后端 /devices/{id}/attachments 接口未实现
  documents.value = [];
};

// 加载设备详情
const loadDeviceDetail = async () => {
  if (!props.device || !props.device.id) {
    return;
  }

  loading.value = true;
  try {
    const deviceId = props.device.id;
    await Promise.all([
      loadDeviceHistory(deviceId),
      // 暂时跳过安装记录加载，因为后端接口返回400错误
      // loadInstallationRecords(deviceId),
      loadRepairRecords(deviceId),
      loadDocuments(deviceId),
    ]);
  } catch (error) {
    logger.error('加载设备详情失败:', error);
    ElMessage.error('加载设备详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 监听对话框显示状态
watch(
  () => props.modelValue,
  (val) => {
    if (val && props.device && props.device.id) {
      loadDeviceDetail();
    }
  }
);
</script>

<style scoped>
.device-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

/* 标签页样式优化 */
:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

:deep(.el-tabs__header) {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-tabs__item) {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 20px;
  height: 40px;
  font-size: 14px;
}

:deep(.el-tabs__item .el-icon) {
  font-size: 16px;
}

:deep(.el-tabs__content) {
  padding: 20px;
  min-height: 350px;
}

/* 设备详情面板 */
.device-detail-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 设备头部 */
.device-header {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
}

/* 图片区域 */
.device-image-section {
  flex-shrink: 0;
}

.device-image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid #fff;
}

.device-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.device-image:hover {
  transform: scale(1.05);
}

.device-image-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  border: 2px dashed #dcdfe6;
}

/* 设备基本信息 */
.device-basic-info {
  flex: 1;
}

.device-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.device-code {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #606266;
}

.device-status {
  font-size: 13px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.info-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 备注区域 */
.remark-section {
  padding: 12px;
  background: #fdf6ec;
  border-radius: 6px;
  border-left: 3px solid #e6a23c;
}

.remark-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  font-weight: 500;
}

.remark-content {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 时间线样式 */
.timeline-title {
  font-weight: 600;
  color: #303133;
}

.timeline-desc {
  color: #606266;
  margin: 8px 0;
  font-size: 13px;
}

.timeline-operator {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

/* 文档列表样式 */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.doc-name {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.dialog-footer .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background: #f5f7fa;
  font-weight: 600;
}
</style>
