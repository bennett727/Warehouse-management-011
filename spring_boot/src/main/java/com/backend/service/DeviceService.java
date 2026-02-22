package com.backend.service;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageResult;
import com.backend.entity.Device;
import com.backend.service.device.DeviceStatusTransitionService;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface DeviceService {

    Device createDevice(Device device);

    Device updateDevice(Long deviceId, Device device);

    void deleteDevice(Long deviceId);

    void batchDeleteDevices(List<Long> deviceIds);

    Device getDeviceById(Long deviceId);

    Device getDeviceByCode(String deviceCode);

    PageResult<Device> getDeviceList(String keyword, Long typeId, Integer status, Long areaId, Pageable pageable);

    Device changeStatus(Long deviceId, Integer targetStatus, Long operatorId, String remark);

    DeviceStatusTransitionService.BatchTransitionResult batchChangeStatus(
            List<Long> deviceIds, Integer targetStatus, Long operatorId, String remark);

    StatusStatistics getStatusStatistics();

    boolean existsByDeviceCode(String deviceCode);

    List<DeviceStatusTransitionService.StatusTransitionInfo> getAllowedTransitions(Long deviceId);

    Map<String, Object> getDeviceHistory(Long deviceId);

    class StatusStatistics {
        private int totalCount;
        private int inStockCount;
        private int borrowedCount;
        private int underMaintenanceCount;
        private int scrappedCount;

        public int getTotalCount() {
            return totalCount;
        }

        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }

        public int getInStockCount() {
            return inStockCount;
        }

        public void setInStockCount(int inStockCount) {
            this.inStockCount = inStockCount;
        }

        public int getBorrowedCount() {
            return borrowedCount;
        }

        public void setBorrowedCount(int borrowedCount) {
            this.borrowedCount = borrowedCount;
        }

        public int getUnderMaintenanceCount() {
            return underMaintenanceCount;
        }

        public void setUnderMaintenanceCount(int underMaintenanceCount) {
            this.underMaintenanceCount = underMaintenanceCount;
        }

        public int getScrappedCount() {
            return scrappedCount;
        }

        public void setScrappedCount(int scrappedCount) {
            this.scrappedCount = scrappedCount;
        }
    }
}
