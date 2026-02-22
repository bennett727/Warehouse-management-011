<template>
  <PageLayout title="货位管理" description="管理仓库货位信息及状态" data-cy="binmanagement-page">
    <template #headerActions>
      <el-button data-cy="btn-2" type="primary" @click="handleAddBin" :loading="addBinLoading">
        <el-icon data-cy="icon-1">
          <Plus />
        </el-icon>
        新增货位
      </el-button>
      <el-button data-cy="btn-3" type="success" @click="handleBatchCreate" :loading="batchCreateLoading">
        <el-icon data-cy="icon-2">
          <Grid />
        </el-icon>
        批量生成
      </el-button>
      <el-button data-cy="btn-4" @click="handleImport">
        <el-icon data-cy="icon-3">
          <Upload />
        </el-icon>
        导入
      </el-button>
      <el-button data-cy="btn-5" @click="handleExport">
        <el-icon data-cy="icon-4">
          <Download />
        </el-icon>
        导出
      </el-button>
    </template>

    <UnifiedFilterBar
      v-model="searchForm"
      :fields="filterFields"
      :loading="loading"
      header-title="货位筛选"
      :header-icon="Grid"
      :result-count="pagination.total"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="bin-content">
      <div v-if="loading" class="loading-container">
        <TableSkeleton :row-count="10" :column-count="10" />
      </div>
      <el-table
        data-cy="table-0"
        v-else
        :data="binList"
        :row-key="(row) => row.id || row.code"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column data-cy="table-1" type="selection" width="55" align="center" />
        <el-table-column data-cy="table-2" prop="code" label="货位编号" min-width="120" align="center" />
        <el-table-column data-cy="table-3" prop="zone" label="区域" min-width="100" align="center" />
        <el-table-column data-cy="table-4" prop="row" label="排" min-width="80" align="center" />
        <el-table-column data-cy="table-5" prop="column" label="列" min-width="80" align="center" />
        <el-table-column data-cy="table-6" prop="level" label="层" min-width="80" align="center" />
        <el-table-column data-cy="table-7" label="货位类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag data-cy="tag-0" :type="getBinTypeTagType(row.type)">
              {{ getBinTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column data-cy="table-8" label="货位状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag data-cy="tag-1" :type="getBinStatusTagType(row.status)">
              {{ getBinStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column data-cy="table-9" label="使用率" min-width="120" align="center">
          <template #default="{ row }">
            <el-progress
              data-cy="progress-0"
              :percentage="getCapacityPercentage(row)"
              :color="getCapacityColor(row)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column data-cy="table-10" label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button data-cy="btn-6" type="primary" link size="small" @click="handleViewDetail(row)">
              查看
            </el-button>
            <el-button data-cy="btn-7" type="warning" link size="small" @click="handleEditBin(row)"> 编辑 </el-button>
            <el-button data-cy="btn-8" type="danger" link size="small" @click="handleDeleteBin(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          data-cy="pagination-0"
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      data-cy="dialog-0"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form data-cy="form-0" ref="binFormRef" :model="binForm" :rules="binRules" label-width="120px">
        <el-form-item data-cy="form-1" prop="code" label="货位编号">
          <el-input data-cy="input-1" v-model="binForm.code" placeholder="请输入货位编号" clearable />
        </el-form-item>
        <el-form-item data-cy="form-2" prop="zone" label="区域">
          <el-input data-cy="input-2" v-model="binForm.zone" placeholder="例如：A区" clearable />
        </el-form-item>
        <el-form-item data-cy="form-3" prop="row" label="排">
          <el-input data-cy="input-3" v-model="binForm.row" placeholder="例如：01排" clearable />
        </el-form-item>
        <el-form-item data-cy="form-4" prop="column" label="列">
          <el-input data-cy="input-4" v-model="binForm.column" placeholder="例如：01列" clearable />
        </el-form-item>
        <el-form-item data-cy="form-5" prop="level" label="层">
          <el-input data-cy="input-5" v-model="binForm.level" placeholder="例如：01层" clearable />
        </el-form-item>
        <el-form-item data-cy="form-6" prop="type" label="货位类型">
          <el-select data-cy="select-3" v-model="binForm.type" placeholder="请选择货位类型" style="width: 100%">
            <el-option label="普通货位" value="NORMAL" />
            <el-option label="冷藏货位" value="REFRIGERATED" />
            <el-option label="冷冻货位" value="FROZEN" />
            <el-option label="危险品货位" value="HAZARDOUS" />
            <el-option label="易碎品货位" value="FRAGILE" />
            <el-option label="重货货位" value="HEAVY" />
            <el-option label="轻货货位" value="LIGHT" />
            <el-option label="特殊货位" value="SPECIAL" />
          </el-select>
        </el-form-item>
        <el-form-item data-cy="form-7" prop="status" label="货位状态">
          <el-select data-cy="select-4" v-model="binForm.status" placeholder="请选择货位状态" style="width: 100%">
            <el-option label="空闲" value="AVAILABLE" />
            <el-option label="占用" value="OCCUPIED" />
            <el-option label="锁定" value="LOCKED" />
            <el-option label="维护中" value="MAINTENANCE" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item data-cy="form-8" prop="maxWeight" label="最大承重(kg)">
          <el-input-number data-cy="input-6" v-model="binForm.maxWeight" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item data-cy="form-9" prop="maxCapacity" label="最大容量(m3)">
          <el-input-number
            data-cy="input-7"
            v-model="binForm.maxCapacity"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item data-cy="form-10" prop="remark" label="备注">
          <el-input
            data-cy="input-8"
            v-model="binForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button data-cy="btn-9" @click="dialogVisible = false">取消</el-button>
        <el-button data-cy="btn-10" type="primary" @click="handleFormSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      data-cy="dialog-1"
      v-model="batchCreateDialogVisible"
      title="批量生成货位"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form data-cy="form-11" ref="batchFormRef" :model="batchForm" :rules="batchRules" label-width="120px">
        <el-form-item data-cy="form-12" prop="zone" label="区域">
          <el-input data-cy="input-9" v-model="batchForm.zone" placeholder="例如：A区" clearable />
        </el-form-item>
        <el-form-item data-cy="form-13" prop="startRow" label="起始排">
          <el-input data-cy="input-10" v-model="batchForm.startRow" placeholder="例如：01" clearable />
        </el-form-item>
        <el-form-item data-cy="form-14" prop="endRow" label="结束排">
          <el-input data-cy="input-11" v-model="batchForm.endRow" placeholder="例如：10" clearable />
        </el-form-item>
        <el-form-item data-cy="form-15" prop="startColumn" label="起始列">
          <el-input data-cy="input-12" v-model="batchForm.startColumn" placeholder="例如：01" clearable />
        </el-form-item>
        <el-form-item data-cy="form-16" prop="endColumn" label="结束列">
          <el-input data-cy="input-13" v-model="batchForm.endColumn" placeholder="例如：10" clearable />
        </el-form-item>
        <el-form-item data-cy="form-17" prop="startLevel" label="起始层">
          <el-input data-cy="input-14" v-model="batchForm.startLevel" placeholder="例如：01" clearable />
        </el-form-item>
        <el-form-item data-cy="form-18" prop="endLevel" label="结束层">
          <el-input data-cy="input-15" v-model="batchForm.endLevel" placeholder="例如：05" clearable />
        </el-form-item>
        <el-form-item data-cy="form-19" prop="type" label="货位类型">
          <el-select data-cy="select-5" v-model="batchForm.type" placeholder="请选择货位类型" style="width: 100%">
            <el-option label="普通货位" value="NORMAL" />
            <el-option label="冷藏货位" value="REFRIGERATED" />
            <el-option label="冷冻货位" value="FROZEN" />
            <el-option label="危险品货位" value="HAZARDOUS" />
            <el-option label="易碎品货位" value="FRAGILE" />
            <el-option label="重货货位" value="HEAVY" />
            <el-option label="轻货货位" value="LIGHT" />
            <el-option label="特殊货位" value="SPECIAL" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button data-cy="btn-11" @click="batchCreateDialogVisible = false">取消</el-button>
        <el-button data-cy="btn-12" type="primary" @click="handleBatchSubmit" :loading="batchSubmitLoading"
          >确定</el-button
        >
      </template>
    </el-dialog>

    <el-dialog data-cy="dialog-2" v-model="detailDialogVisible" title="货位详情" width="700px">
      <el-descriptions data-cy="descriptions-0" :column="2" border>
        <el-descriptions-item data-cy="descriptions-1" label="货位编号">{{ currentBin.code }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-2" label="完整位置">{{
          currentBin.fullLocation
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-3" label="区域">{{ currentBin.zone }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-4" label="排">{{ currentBin.row }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-5" label="列">{{ currentBin.column }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-6" label="层">{{ currentBin.level }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-7" label="货位类型">
          <el-tag data-cy="tag-2" :type="getBinTypeTagType(currentBin.type)">
            {{ getBinTypeText(currentBin.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-8" label="货位状态">
          <el-tag data-cy="tag-3" :type="getBinStatusTagType(currentBin.status)">
            {{ getBinStatusText(currentBin.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-9" label="最大承重"
          >{{ currentBin.maxWeight }} kg</el-descriptions-item
        >
        <el-descriptions-item data-cy="descriptions-10" label="当前重量"
          >{{ currentBin.currentWeight }} kg</el-descriptions-item
        >
        <el-descriptions-item data-cy="descriptions-11" label="最大容量"
          >{{ currentBin.maxCapacity }} m3</el-descriptions-item
        >
        <el-descriptions-item data-cy="descriptions-12" label="当前容量"
          >{{ currentBin.currentCapacity }} m3</el-descriptions-item
        >
        <el-descriptions-item data-cy="descriptions-13" label="创建时间">{{
          formatDate(currentBin.createTime)
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-14" label="更新时间">{{
          formatDate(currentBin.updateTime)
        }}</el-descriptions-item>
        <el-descriptions-item data-cy="descriptions-15" label="备注" :span="2">{{
          currentBin.remark || '-'
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button data-cy="btn-13" @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 快捷操作链 -->
    <QuickActionChain
      v-model="quickActionVisible"
      title="货位创建成功"
      :message="quickActionMessage"
      :actions="quickActions"
      storage-key="bin"
      @action="handleQuickAction"
      @close="handleQuickActionClose"
      @back="handleQuickActionBack"
      @disable="handleQuickActionDisabled"
    />
  </PageLayout>
</template>

<script setup>
import { Download, Grid, Plus, Upload } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { addBin, batchCreateBins, deleteBin, exportBins, getBinList, updateBin } from '@/api/inventory/bin';
import { getWarehouseList } from '@/api/inventory/warehouse';
import PageLayout from '@/components/base/PageLayout.vue';
import TableSkeleton from '@/components/base/TableSkeleton.vue';
import UnifiedFilterBar from '@/components/base/UnifiedFilterBar/index.vue';
import QuickActionChain from '@/components/business/workflow/QuickActionChain.vue';
import { extractListData } from '@/utils/dataNormalizer';
import { createLogger } from '@/utils/logger';
import { setBinContext } from '@/utils/workflowContext';

const logger = createLogger('BinManagement');
const router = useRouter();

// 快捷操作链
const quickActionVisible = ref(false);
const quickActions = ref([]);
const lastCreatedBin = ref(null);
const quickActionMessage = computed(() => {
  const name = lastCreatedBin.value?.code || '新货位';
  return `货位 "${name}" 创建成功！`;
});

// 搜索表单
const searchForm = reactive({
  searchQuery: '',
  filterWarehouse: '',
  filterStatus: '',
  filterType: '',
});

// 筛选字段配置
const filterFields = computed(() => [
  {
    prop: 'searchQuery',
    label: '货位编号/名称',
    type: 'input',
    placeholder: '搜索货位编号/名称',
    clearable: true,
    md: 6,
    lg: 6,
  },
  {
    prop: 'filterWarehouse',
    label: '仓库',
    type: 'select',
    placeholder: '选择仓库',
    clearable: true,
    md: 6,
    lg: 6,
    options: warehouseList.value.map((w) => ({ label: w.name, value: w.id })),
  },
  {
    prop: 'filterStatus',
    label: '货位状态',
    type: 'select',
    placeholder: '货位状态',
    clearable: true,
    md: 6,
    lg: 6,
    options: [
      { label: '空闲', value: 'AVAILABLE' },
      { label: '占用', value: 'OCCUPIED' },
      { label: '锁定', value: 'LOCKED' },
      { label: '维护中', value: 'MAINTENANCE' },
      { label: '禁用', value: 'DISABLED' },
    ],
  },
  {
    prop: 'filterType',
    label: '货位类型',
    type: 'select',
    placeholder: '货位类型',
    clearable: true,
    md: 6,
    lg: 6,
    options: [
      { label: '普通货位', value: 'NORMAL' },
      { label: '冷藏货位', value: 'REFRIGERATED' },
      { label: '冷冻货位', value: 'FROZEN' },
      { label: '危险品货位', value: 'HAZARDOUS' },
      { label: '易碎品货位', value: 'FRAGILE' },
      { label: '重货货位', value: 'HEAVY' },
      { label: '轻货货位', value: 'LIGHT' },
      { label: '特殊货位', value: 'SPECIAL' },
    ],
  },
]);

// 兼容旧代码的引用
const searchQuery = computed({
  get: () => searchForm.searchQuery,
  set: (val) => (searchForm.searchQuery = val),
});
const filterWarehouse = computed({
  get: () => searchForm.filterWarehouse,
  set: (val) => (searchForm.filterWarehouse = val),
});
const filterStatus = computed({
  get: () => searchForm.filterStatus,
  set: (val) => (searchForm.filterStatus = val),
});
const filterType = computed({
  get: () => searchForm.filterType,
  set: (val) => (searchForm.filterType = val),
});

const loading = ref(false);
const binList = ref([]);
const warehouseList = ref([]);
const selectedBins = ref([]);
const dialogVisible = ref(false);
const batchCreateDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogTitle = ref('新增货位');
const isEdit = ref(false);
const addBinLoading = ref(false);
const batchCreateLoading = ref(false);
const submitLoading = ref(false);
const batchSubmitLoading = ref(false);
const currentBin = ref({});

const binFormRef = ref(null);
const batchFormRef = ref(null);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const binForm = reactive({
  id: null,
  code: '',
  zone: '',
  row: '',
  column: '',
  level: '',
  type: 'NORMAL',
  status: 'AVAILABLE',
  maxWeight: 0,
  maxCapacity: 0,
  remark: '',
});

const batchForm = reactive({
  zone: '',
  startRow: '',
  endRow: '',
  startColumn: '',
  endColumn: '',
  startLevel: '',
  endLevel: '',
  type: 'NORMAL',
});

const binRules = {
  code: [
    { required: true, message: '请输入货位编号', trigger: 'blur' },
    { min: 2, max: 50, message: '货位编号长度应为 2 到 50 个字符', trigger: 'blur' },
  ],
  zone: [
    { required: true, message: '请输入区域', trigger: 'blur' },
    { min: 1, max: 50, message: '区域长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  row: [
    { required: true, message: '请输入排', trigger: 'blur' },
    { min: 1, max: 50, message: '排长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  column: [
    { required: true, message: '请输入列', trigger: 'blur' },
    { min: 1, max: 50, message: '列长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  level: [
    { required: true, message: '请输入层', trigger: 'blur' },
    { min: 1, max: 50, message: '层长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择货位类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择货位状态', trigger: 'change' }],
};

const batchRules = {
  zone: [
    { required: true, message: '请输入区域', trigger: 'blur' },
    { min: 1, max: 50, message: '区域长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  startRow: [
    { required: true, message: '请输入起始排', trigger: 'blur' },
    { min: 1, max: 50, message: '起始排长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  endRow: [
    { required: true, message: '请输入结束排', trigger: 'blur' },
    { min: 1, max: 50, message: '结束排长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  startColumn: [
    { required: true, message: '请输入起始列', trigger: 'blur' },
    { min: 1, max: 50, message: '起始列长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  endColumn: [
    { required: true, message: '请输入结束列', trigger: 'blur' },
    { min: 1, max: 50, message: '结束列长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  startLevel: [
    { required: true, message: '请输入起始层', trigger: 'blur' },
    { min: 1, max: 50, message: '起始层长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  endLevel: [
    { required: true, message: '请输入结束层', trigger: 'blur' },
    { min: 1, max: 50, message: '结束层长度应为 1 到 50 个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择货位类型', trigger: 'change' }],
};

const loadBinList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage, // 后端页码从1开始，直接使用前端值
      size: pagination.pageSize, // 使用size而非pageSize，与后端一致
      keyword: searchQuery.value,
      warehouseId: filterWarehouse.value,
      status: filterStatus.value,
      type: filterType.value,
    };
    const response = await getBinList(params);
    if (response.code === 200 || response.success === true) {
      const { list, total } = extractListData(response, {
        listFields: ['records', 'list', 'items', 'data'],
        totalField: 'total',
      });
      binList.value = list;
      pagination.total = total;
    } else {
      // API返回非成功状态，重置列表
      binList.value = [];
      pagination.total = 0;
      logger.warn('获取货位列表返回非成功状态:', response);
    }
  } catch (error) {
    logger.error('获取货位列表失败:', error);
    ElMessage.error('获取货位列表失败');
    // 发生错误时重置列表
    binList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const loadWarehouseList = async () => {
  try {
    const response = await getWarehouseList({ page: 0, pageSize: 1000 });
    if (response.code === 200 || response.success === true) {
      warehouseList.value = response.data.records || [];
    }
  } catch (error) {
    logger.error('获取仓库列表失败:', error);
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  loadBinList();
};

const handleReset = () => {
  searchForm.searchQuery = '';
  searchForm.filterWarehouse = '';
  searchForm.filterStatus = '';
  searchForm.filterType = '';
  pagination.currentPage = 1;
  loadBinList();
};

const handleSelectionChange = (selection) => {
  selectedBins.value = selection;
};

const handleAddBin = () => {
  isEdit.value = false;
  dialogTitle.value = '新增货位';
  resetForm();
  dialogVisible.value = true;
};

const handleEditBin = (row) => {
  isEdit.value = true;
  dialogTitle.value = '编辑货位';
  Object.assign(binForm, {
    id: row.id,
    code: row.code,
    zone: row.zone,
    row: row.row,
    column: row.column,
    level: row.level,
    type: row.type,
    status: row.status,
    maxWeight: row.maxWeight,
    maxCapacity: row.maxCapacity,
    remark: row.remark,
  });
  dialogVisible.value = true;
};

const handleDeleteBin = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除货位"${row.code}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteBin(row.id);
    if (response.code === 200 || response.success === true) {
      ElMessage.success('删除成功');
      loadBinList();
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('删除货位失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleFormSubmit = async () => {
  try {
    await binFormRef.value.validate();
    submitLoading.value = true;

    const api = isEdit.value ? updateBin : addBin;
    const response = await api(binForm);

    if (response.code === 200 || response.success === true) {
      dialogVisible.value = false;
      loadBinList();

      if (isEdit.value) {
        ElMessage.success('更新成功');
      } else {
        ElMessage.success('添加成功');

        // 保存创建的货位信息
        const newBin = {
          id: response.data?.id,
          code: binForm.code,
          zone: binForm.zone,
          row: binForm.row,
          column: binForm.column,
          level: binForm.level,
          type: binForm.type,
        };
        lastCreatedBin.value = newBin;
        setBinContext(newBin);

        // 配置快捷操作
        quickActions.value = [
          {
            key: 'createAnother',
            label: '继续创建货位',
            icon: 'Plus',
            type: 'primary',
            handler: () => {
              resetForm();
              // 保留区域、排、列、层信息，方便连续创建
              binForm.zone = newBin.zone;
              binForm.row = newBin.row;
              binForm.column = newBin.column;
              binForm.level = newBin.level;
              binForm.type = newBin.type;
              dialogVisible.value = true;
            },
          },
          {
            key: 'batchCreate',
            label: '批量生成货位',
            icon: 'Grid',
            type: 'success',
            handler: () => {
              resetBatchForm();
              // 预填区域信息
              batchForm.zone = newBin.zone;
              batchForm.type = newBin.type;
              batchCreateDialogVisible.value = true;
            },
          },
          {
            key: 'viewDetail',
            label: '查看货位详情',
            icon: 'View',
            type: 'info',
            handler: () => {
              currentBin.value = { ...newBin };
              detailDialogVisible.value = true;
            },
          },
        ];

        // 检查用户是否禁用了快捷操作链
        const isQuickActionDisabled = localStorage.getItem('quick_action_disabled_bin') === 'true';
        if (!isQuickActionDisabled) {
          quickActionVisible.value = true;
        } else {
          logger.debug('快捷操作链已被用户禁用，跳过显示');
        }
      }
    }
  } catch (error) {
    logger.error('保存货位失败:', error);
    ElMessage.error('保存失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleBatchCreate = () => {
  resetBatchForm();
  batchCreateDialogVisible.value = true;
};

const handleBatchSubmit = async () => {
  try {
    await batchFormRef.value.validate();
    batchSubmitLoading.value = true;

    const response = await batchCreateBins(batchForm);
    if (response.code === 200 || response.success === true) {
      ElMessage.success('批量生成成功');
      batchCreateDialogVisible.value = false;
      loadBinList();

      // 批量创建成功后也显示快捷操作
      const createdCount = response.data?.count || 0;
      quickActionMessage.value = `成功批量生成 ${createdCount} 个货位！`;

      quickActions.value = [
        {
          key: 'createSingle',
          label: '创建单个货位',
          icon: 'Plus',
          type: 'primary',
          handler: () => {
            resetForm();
            // 预填区域信息
            binForm.zone = batchForm.zone;
            binForm.type = batchForm.type;
            dialogVisible.value = true;
          },
        },
        {
          key: 'batchCreateAgain',
          label: '继续批量生成',
          icon: 'Grid',
          type: 'success',
          handler: () => {
            // 保留当前区域和类型信息
            const currentZone = batchForm.zone;
            const currentType = batchForm.type;
            resetBatchForm();
            // 恢复区域和类型信息
            batchForm.zone = currentZone;
            batchForm.type = currentType;
            batchCreateDialogVisible.value = true;
          },
        },
        {
          key: 'viewList',
          label: '查看货位列表',
          icon: 'View',
          type: 'info',
          handler: () => {
            // 刷新列表并聚焦到新创建的货位
            loadBinList();
          },
        },
      ];

      // 检查用户是否禁用了快捷操作链
      const isQuickActionDisabled = localStorage.getItem('quick_action_disabled_bin') === 'true';
      if (!isQuickActionDisabled) {
        quickActionVisible.value = true;
      } else {
        logger.debug('快捷操作链已被用户禁用，跳过显示');
      }
    }
  } catch (error) {
    logger.error('批量生成货位失败:', error);
    ElMessage.error('批量生成失败');
  } finally {
    batchSubmitLoading.value = false;
  }
};

const handleImport = () => {
  ElMessage.info('导入功能开发中');
};

const handleExport = async () => {
  try {
    const params = {
      keyword: searchQuery.value,
      warehouseId: filterWarehouse.value,
      status: filterStatus.value,
      type: filterType.value,
    };
    await exportBins(params);
    ElMessage.success('导出成功');
  } catch (error) {
    logger.error('导出货位失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleViewDetail = (row) => {
  currentBin.value = { ...row };
  detailDialogVisible.value = true;
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  loadBinList();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadBinList();
};

const resetForm = () => {
  binForm.id = null;
  binForm.code = '';
  binForm.zone = '';
  binForm.row = '';
  binForm.column = '';
  binForm.level = '';
  binForm.type = 'NORMAL';
  binForm.status = 'AVAILABLE';
  binForm.maxWeight = 0;
  binForm.maxCapacity = 0;
  binForm.remark = '';
};

const resetBatchForm = () => {
  batchForm.zone = '';
  batchForm.startRow = '';
  batchForm.endRow = '';
  batchForm.startColumn = '';
  batchForm.endColumn = '';
  batchForm.startLevel = '';
  batchForm.endLevel = '';
  batchForm.type = 'NORMAL';
};

const getBinTypeTagType = (type) => {
  const typeMap = {
    NORMAL: '',
    REFRIGERATED: 'primary',
    FROZEN: 'info',
    HAZARDOUS: 'danger',
    FRAGILE: 'warning',
    HEAVY: '',
    LIGHT: 'success',
    SPECIAL: 'warning',
  };
  return typeMap[type] || '';
};

const getBinTypeText = (type) => {
  const typeMap = {
    NORMAL: '普通货位',
    REFRIGERATED: '冷藏货位',
    FROZEN: '冷冻货位',
    HAZARDOUS: '危险品货位',
    FRAGILE: '易碎品货位',
    HEAVY: '重货货位',
    LIGHT: '轻货货位',
    SPECIAL: '特殊货位',
  };
  return typeMap[type] || type;
};

const getBinStatusTagType = (status) => {
  const statusMap = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    LOCKED: 'warning',
    MAINTENANCE: 'info',
    DISABLED: '',
  };
  return statusMap[status] || '';
};

const getBinStatusText = (status) => {
  const statusMap = {
    AVAILABLE: '空闲',
    OCCUPIED: '占用',
    LOCKED: '锁定',
    MAINTENANCE: '维护中',
    DISABLED: '禁用',
  };
  return statusMap[status] || status;
};

const getCapacityPercentage = (row) => {
  if (!row.maxCapacity || row.maxCapacity === 0) {
    return 0;
  }
  return Math.round((row.currentCapacity / row.maxCapacity) * 100);
};

const getCapacityColor = (row) => {
  const percentage = getCapacityPercentage(row);
  if (percentage >= 90) {
    return '#F56C6C';
  }
  if (percentage >= 70) {
    return '#E6A23C';
  }
  return '#67C23A';
};

const formatDate = (date) => {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleString();
};

// 快捷操作处理
const handleQuickAction = (action) => {
  logger.debug('执行快捷操作:', action);

  if (action.handler) {
    action.handler();
  } else if (action.route) {
    router.push({
      path: action.route,
      query: action.query,
    });
  }

  quickActionVisible.value = false;
};

// 快捷操作关闭
const handleQuickActionClose = () => {
  logger.debug('关闭快捷操作链');
  quickActionVisible.value = false;
  lastCreatedBin.value = null;
};

// 快捷操作返回
const handleQuickActionBack = () => {
  logger.debug('返回列表');
  quickActionVisible.value = false;
  lastCreatedBin.value = null;
  loadBinList();
};

// 处理快捷操作被禁用
const handleQuickActionDisabled = () => {
  logger.debug('用户禁用了货位快捷操作链');
  ElMessage.info('已记住您的选择，后续创建货位将不再显示快捷操作');
};

onMounted(() => {
  loadBinList();
  loadWarehouseList();
});
</script>

<style scoped>
.bin-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
  color: #409eff;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.bin-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.bin-content {
  min-height: 400px;
}

.loading-container {
  padding: 40px 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
