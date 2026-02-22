import { ref, computed } from 'vue';

export function useLoading() {
  const loadingStates = ref({});

  const createLoadingState = (key, initialValue = false) => {
    if (!loadingStates.value[key]) {
      loadingStates.value[key] = ref(initialValue);
    }
    return loadingStates.value[key];
  };

  const setLoading = (key, value) => {
    if (loadingStates.value[key]) {
      loadingStates.value[key].value = value;
    }
  };

  const startLoading = (key) => {
    if (!loadingStates.value[key]) {
      createLoadingState(key);
    }
    loadingStates.value[key].value = true;
  };

  const stopLoading = (key) => {
    if (loadingStates.value[key]) {
      loadingStates.value[key].value = false;
    }
  };

  const isLoading = (key) => {
    return loadingStates.value[key]?.value || false;
  };

  const anyLoading = computed(() => {
    return Object.values(loadingStates.value).some((state) => state.value);
  });

  const allLoading = computed(() => {
    const states = Object.values(loadingStates.value);
    return states.length > 0 && states.every((state) => state.value);
  });

  const withLoading = async (key, asyncFn) => {
    if (!loadingStates.value[key]) {
      createLoadingState(key);
    }

    loadingStates.value[key].value = true;
    try {
      return await asyncFn();
    } finally {
      loadingStates.value[key].value = false;
    }
  };

  const resetLoading = (key) => {
    if (loadingStates.value[key]) {
      loadingStates.value[key].value = false;
    }
  };

  const resetAllLoading = () => {
    Object.keys(loadingStates.value).forEach((key) => {
      resetLoading(key);
    });
  };

  const removeLoadingState = (key) => {
    delete loadingStates.value[key];
  };

  const clearAllLoadingStates = () => {
    loadingStates.value = {};
  };

  return {
    loadingStates,
    createLoadingState,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    anyLoading,
    allLoading,
    withLoading,
    resetLoading,
    resetAllLoading,
    removeLoadingState,
    clearAllLoadingStates,
  };
}

export default useLoading;
