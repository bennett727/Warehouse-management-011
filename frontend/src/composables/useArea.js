import { ref } from 'vue';

import { getAllCities, getDistrictsByCity, getLocationsByCityAndDistrict } from '@/api/system/area';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('useArea');

export function useArea() {
  const cities = ref([]);
  const districts = ref([]);
  const locations = ref([]);

  const loadingCities = ref(false);
  const loadingDistricts = ref(false);
  const loadingLocations = ref(false);

  const loadCities = async () => {
    if (cities.value.length > 0) {
      return;
    }

    loadingCities.value = true;
    try {
      const response = await getAllCities();
      if (response.success && response.data) {
        // 确保 response.data 是数组
        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data.records || response.data.list || [];
        cities.value = dataArray.map((city) => ({
          label: city.name || city.cityName,
          value: city.id || city.code || city.name,
          raw: city,
        }));
      }
    } catch (error) {
      logger.error('加载城市列表失败:', error);
    } finally {
      loadingCities.value = false;
    }
  };

  const loadDistricts = async (cityId) => {
    if (!cityId) {
      districts.value = [];
      return;
    }

    loadingDistricts.value = true;
    try {
      const response = await getDistrictsByCity(cityId);
      if (response.success && response.data) {
        // 确保 response.data 是数组
        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data.records || response.data.list || [];
        districts.value = dataArray.map((district) => ({
          label: district.name || district.districtName,
          value: district.id || district.code || district.name,
          raw: district,
        }));
      }
    } catch (error) {
      logger.error('加载区县列表失败:', error);
    } finally {
      loadingDistricts.value = false;
    }
  };

  const loadLocations = async (cityId, districtId) => {
    if (!cityId || !districtId) {
      locations.value = [];
      return;
    }

    loadingLocations.value = true;
    try {
      const response = await getLocationsByCityAndDistrict(cityId, districtId);
      if (response.success && response.data) {
        // 确保 response.data 是数组
        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data.records || response.data.list || [];
        locations.value = dataArray.map((loc) => ({
          label: loc.name || loc.locationName,
          value: loc.id || loc.code || loc.name,
          raw: loc,
        }));
      }
    } catch (error) {
      logger.error('加载地点列表失败:', error);
    } finally {
      loadingLocations.value = false;
    }
  };

  const handleCityChange = async (cityId) => {
    districts.value = [];
    locations.value = [];
    if (cityId) {
      await loadDistricts(cityId);
    }
  };

  const handleDistrictChange = async (districtId) => {
    locations.value = [];
    if (districtId) {
      const cityId = cities.value.find((c) => c.value === districtId)?.raw?.cityId;
      if (cityId) {
        await loadLocations(cityId, districtId);
      }
    }
  };

  const resetAreaSelection = () => {
    districts.value = [];
    locations.value = [];
  };

  return {
    cities,
    districts,
    locations,
    loadingCities,
    loadingDistricts,
    loadingLocations,
    loadCities,
    loadDistricts,
    loadLocations,
    handleCityChange,
    handleDistrictChange,
    resetAreaSelection,
  };
}

export default useArea;
