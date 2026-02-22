import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';

import { useErrorHandler } from '@/composables/useErrorHandler.js';
import { useBusinessProcessStore } from '@/stores/businessProcess.js';
import { createLogger } from '@/utils/logger.js';

const logger = createLogger('useBusinessProcess');

export function useBusinessProcess() {
  const { handleAsyncError } = useErrorHandler();
  const businessProcessStore = useBusinessProcessStore();

  const currentDevice = ref(null);
  const operationDialogVisible = ref(false);
  const currentOperation = ref(null);
  const operationForm = ref({});

  const isProcessing = computed(() => {
    return Object.values(businessProcessStore.processLoading).some((value) => value);
  });

  const validateDeviceStatus = (device, operationType) => {
    const availableOperations = businessProcessStore.getAvailableOperations(device);
    if (!availableOperations.includes(operationType)) {
      const operationLabel = businessProcessStore.getOperationLabel(operationType);
      ElMessage.warning(`当前设备状态不允许执行${operationLabel}操作`);
      return false;
    }
    return true;
  };

  const handleInbound = async (deviceData) => {
    return handleAsyncError(
      async () => {
        const result = await businessProcessStore.executeInbound(deviceData);
        logger.info('入库流程执行成功', { deviceId: result.id });
        return result;
      },
      {
        errorMessage: '入库流程执行失败',
        onSuccess: () => {
          logger.info('入库流程成功');
        },
      }
    );
  };

  const handleOutbound = async (device, remark = '') => {
    try {
      await ElMessageBox.confirm(`确定要将设备 ${device.name} 出库吗？`, '确认出库', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      if (!validateDeviceStatus(device, 'outbound')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeOutbound(device.id, remark);
          logger.info('出库流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '出库流程执行失败',
          onSuccess: () => {
            logger.info('出库流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('出库流程失败', error);
      }
      return null;
    }
  };

  const handleInstall = async (device, installData) => {
    try {
      await ElMessageBox.confirm(`确定要将设备 ${device.name} 安装到 ${installData.location} 吗？`, '确认安装', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      if (!validateDeviceStatus(device, 'install')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeInstall(
            device.id,
            installData.areaId,
            installData.location,
            installData.installer,
            installData.remark
          );
          logger.info('安装流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '安装流程执行失败',
          onSuccess: () => {
            logger.info('安装流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('安装流程失败', error);
      }
      return null;
    }
  };

  const handleUninstall = async (device, uninstaller, remark = '') => {
    try {
      await ElMessageBox.confirm(`确定要将设备 ${device.name} 拆卸吗？`, '确认拆卸', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      if (!validateDeviceStatus(device, 'uninstall')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeUninstall(device.id, uninstaller, remark);
          logger.info('拆卸流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '拆卸流程执行失败',
          onSuccess: () => {
            logger.info('拆卸流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('拆卸流程失败', error);
      }
      return null;
    }
  };

  const handleRepair = async (device, repairData) => {
    try {
      await ElMessageBox.confirm(`确定要将设备 ${device.name} 送修吗？`, '确认送修', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      if (!validateDeviceStatus(device, 'repair')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeRepair(
            device.id,
            repairData.faultDescription,
            repairData.repairer,
            repairData.remark
          );
          logger.info('送修流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '送修流程执行失败',
          onSuccess: () => {
            logger.info('送修流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('送修流程失败', error);
      }
      return null;
    }
  };

  const handleRepairComplete = async (device, repairData) => {
    try {
      await ElMessageBox.confirm(`确定要完成设备 ${device.name} 的维修吗？`, '确认维修完成', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      });

      if (!validateDeviceStatus(device, 'repair_complete')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeRepairComplete(
            device.id,
            repairData.repairDescription,
            repairData.repairer,
            repairData.remark
          );
          logger.info('维修完成流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '维修完成流程执行失败',
          onSuccess: () => {
            logger.info('维修完成流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('维修完成流程失败', error);
      }
      return null;
    }
  };

  const handleScrap = async (device, scrapData) => {
    try {
      await ElMessageBox.confirm(`确定要将设备 ${device.name} 报废吗？此操作不可撤销！`, '确认报废', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      });

      if (!validateDeviceStatus(device, 'scrap')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeScrap(
            device.id,
            scrapData.scrapReason,
            scrapData.operator,
            scrapData.remark
          );
          logger.info('报废流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '报废流程执行失败',
          onSuccess: () => {
            logger.info('报废流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('报废流程失败', error);
      }
      return null;
    }
  };

  const handleMove = async (device, moveData) => {
    try {
      await ElMessageBox.confirm(`确定要将设备 ${device.name} 移动到 ${moveData.newLocation} 吗？`, '确认移库', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      if (!validateDeviceStatus(device, 'move')) {
        return null;
      }

      return handleAsyncError(
        async () => {
          const result = await businessProcessStore.executeMove(
            device.id,
            moveData.newAreaId,
            moveData.newLocation,
            moveData.operator,
            moveData.remark
          );
          logger.info('移库流程执行成功', { deviceId: device.id });
          return result;
        },
        {
          errorMessage: '移库流程执行失败',
          onSuccess: () => {
            logger.info('移库流程成功');
          },
        }
      );
    } catch (error) {
      if (error !== 'cancel') {
        logger.error('移库流程失败', error);
      }
      return null;
    }
  };

  const openOperationDialog = (device, operationType) => {
    currentDevice.value = device;
    currentOperation.value = operationType;
    operationForm.value = {};
    operationDialogVisible.value = true;
  };

  const closeOperationDialog = () => {
    currentDevice.value = null;
    currentOperation.value = null;
    operationForm.value = {};
    operationDialogVisible.value = false;
  };

  const submitOperation = async () => {
    if (!currentDevice.value || !currentOperation.value) {
      ElMessage.warning('请先选择设备和操作类型');
      return null;
    }

    let result = null;
    const device = currentDevice.value;
    const operationType = currentOperation.value;

    switch (operationType) {
      case 'inbound':
        result = await handleInbound(operationForm.value);
        break;
      case 'outbound':
        result = await handleOutbound(device, operationForm.value.remark);
        break;
      case 'install':
        result = await handleInstall(device, operationForm.value);
        break;
      case 'uninstall':
        result = await handleUninstall(device, operationForm.value.uninstaller, operationForm.value.remark);
        break;
      case 'repair':
        result = await handleRepair(device, operationForm.value);
        break;
      case 'repair_complete':
        result = await handleRepairComplete(device, operationForm.value);
        break;
      case 'scrap':
        result = await handleScrap(device, operationForm.value);
        break;
      case 'move':
        result = await handleMove(device, operationForm.value);
        break;
      default:
        ElMessage.error('未知的操作类型');
        return null;
    }

    if (result) {
      closeOperationDialog();
    }

    return result;
  };

  const loadProcessHistory = async (deviceId = null) => {
    return handleAsyncError(
      async () => {
        return await businessProcessStore.loadProcessHistory(deviceId);
      },
      {
        errorMessage: '加载流程历史失败',
      }
    );
  };

  const loadProcessStatistics = async () => {
    return handleAsyncError(
      async () => {
        return await businessProcessStore.loadProcessStatistics();
      },
      {
        errorMessage: '加载流程统计失败',
      }
    );
  };

  return {
    currentDevice,
    operationDialogVisible,
    currentOperation,
    operationForm,
    isProcessing,

    validateDeviceStatus,
    handleInbound,
    handleOutbound,
    handleInstall,
    handleUninstall,
    handleRepair,
    handleRepairComplete,
    handleScrap,
    handleMove,
    openOperationDialog,
    closeOperationDialog,
    submitOperation,
    loadProcessHistory,
    loadProcessStatistics,
  };
}

export default useBusinessProcess;
