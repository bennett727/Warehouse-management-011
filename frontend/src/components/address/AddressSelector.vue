<!--
  @file: AddressSelector.vue
  @description: 行政区划地址选择器组件 - 用于选择省市区和详细地址
  @author: 开发团队
  @createTime: 2026-02-13
  @version: 1.0
-->
<template>
  <div class="address-selector">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-select
          v-model="selectedProvince"
          placeholder="选择省份"
          filterable
          clearable
          :disabled="disabled"
          @change="handleProvinceChange"
          style="width: 100%"
        >
          <el-option v-for="province in provinceList" :key="province.id" :label="province.name" :value="province.id" />
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-select
          v-model="selectedCity"
          placeholder="选择城市"
          filterable
          clearable
          :disabled="disabled || !selectedProvince"
          @change="handleCityChange"
          style="width: 100%"
        >
          <el-option v-for="city in cityList" :key="city.id" :label="city.name" :value="city.id" />
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-select
          v-model="selectedDistrict"
          placeholder="选择区县"
          filterable
          clearable
          :disabled="disabled || !selectedCity"
          @change="handleDistrictChange"
          style="width: 100%"
        >
          <el-option v-for="district in districtList" :key="district.id" :label="district.name" :value="district.id" />
        </el-select>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="margin-top: 10px">
      <el-col :span="24">
        <el-input
          v-model="detailAddress"
          placeholder="请输入详细地址（街道、门牌号等）"
          :disabled="disabled"
          maxlength="200"
          show-word-limit
          @input="handleDetailChange"
        />
      </el-col>
    </el-row>
    <!-- 地址预览 -->
    <div v-if="showPreview && fullAddress" class="address-preview">
      <el-icon><Location /></el-icon>
      <span>{{ fullAddress }}</span>
    </div>
  </div>
</template>

<script setup>
import { Location } from '@element-plus/icons-vue';
import { ref, computed, watch, onMounted } from 'vue';

import { getProvinces, getCities, getDistricts } from '@/api/administrativeDivision';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AddressSelector');

const props = defineProps({
  province: {
    type: [Number, String],
    default: null,
  },
  city: {
    type: [Number, String],
    default: null,
  },
  district: {
    type: [Number, String],
    default: null,
  },
  detail: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showPreview: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:province', 'update:city', 'update:district', 'update:detail', 'change']);

// 选中的值
const selectedProvince = ref(props.province);
const selectedCity = ref(props.city);
const selectedDistrict = ref(props.district);
const detailAddress = ref(props.detail);

// 列表数据
const provinceList = ref([]);
const cityList = ref([]);
const districtList = ref([]);

// 加载状态
const loading = ref(false);

// 计算完整地址
const fullAddress = computed(() => {
  const province = provinceList.value.find((p) => p.id === selectedProvince.value)?.name || '';
  const city = cityList.value.find((c) => c.id === selectedCity.value)?.name || '';
  const district = districtList.value.find((d) => d.id === selectedDistrict.value)?.name || '';
  const detail = detailAddress.value || '';

  const parts = [province, city, district, detail].filter(Boolean);
  return parts.join('');
});

// 监听props变化
watch(
  () => props.province,
  (val) => {
    selectedProvince.value = val;
    if (val) {
      loadCities(val);
    }
  }
);

watch(
  () => props.city,
  (val) => {
    selectedCity.value = val;
    if (val) {
      loadDistricts(val);
    }
  }
);

watch(
  () => props.district,
  (val) => {
    selectedDistrict.value = val;
  }
);

watch(
  () => props.detail,
  (val) => {
    detailAddress.value = val;
  }
);

// 加载省份列表
const loadProvinces = async () => {
  try {
    const res = await getProvinces();
    if (res.success) {
      provinceList.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载省份列表失败', error);
  }
};

// 加载城市列表
const loadCities = async (provinceId) => {
  if (!provinceId) {
    cityList.value = [];
    return;
  }
  try {
    const res = await getCities(provinceId);
    if (res.success) {
      cityList.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载城市列表失败', error);
  }
};

// 加载区县列表
const loadDistricts = async (cityId) => {
  if (!cityId) {
    districtList.value = [];
    return;
  }
  try {
    const res = await getDistricts(cityId);
    if (res.success) {
      districtList.value = res.data || [];
    }
  } catch (error) {
    logger.error('加载区县列表失败', error);
  }
};

// 省份变化处理
const handleProvinceChange = (val) => {
  selectedCity.value = null;
  selectedDistrict.value = null;
  cityList.value = [];
  districtList.value = [];

  emit('update:province', val);
  emit('update:city', null);
  emit('update:district', null);
  emit('change', {
    province: val,
    city: null,
    district: null,
    detail: detailAddress.value,
    fullAddress: fullAddress.value,
  });

  if (val) {
    loadCities(val);
  }
};

// 城市变化处理
const handleCityChange = (val) => {
  selectedDistrict.value = null;
  districtList.value = [];

  emit('update:city', val);
  emit('update:district', null);
  emit('change', {
    province: selectedProvince.value,
    city: val,
    district: null,
    detail: detailAddress.value,
    fullAddress: fullAddress.value,
  });

  if (val) {
    loadDistricts(val);
  }
};

// 区县变化处理
const handleDistrictChange = (val) => {
  emit('update:district', val);
  emit('change', {
    province: selectedProvince.value,
    city: selectedCity.value,
    district: val,
    detail: detailAddress.value,
    fullAddress: fullAddress.value,
  });
};

// 详细地址变化处理
const handleDetailChange = (val) => {
  emit('update:detail', val);
  emit('change', {
    province: selectedProvince.value,
    city: selectedCity.value,
    district: selectedDistrict.value,
    detail: val,
    fullAddress: fullAddress.value,
  });
};

// 初始化
onMounted(() => {
  loadProvinces();
  if (props.province) {
    loadCities(props.province).then(() => {
      if (props.city) {
        loadDistricts(props.city);
      }
    });
  }
});
</script>

<style scoped>
.address-selector {
  width: 100%;
}

.address-preview {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.address-preview .el-icon {
  color: #409eff;
  font-size: 16px;
}
</style>
