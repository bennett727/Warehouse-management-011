package com.backend.service.devicestatus;

import com.backend.entity.DeviceStatusApproval;

import java.util.List;
import java.util.Map;

public interface DeviceStatusApprovalService {

    List<DeviceStatusApproval> getAllApprovals();

    DeviceStatusApproval getApprovalById(Long id);

    List<DeviceStatusApproval> getPendingApprovals();

    List<DeviceStatusApproval> getMyApprovals(Long applicantId);

    DeviceStatusApproval createApproval(DeviceStatusApproval approval);

    DeviceStatusApproval approveApproval(Long id, String comment, Long approverId, String approverName);

    DeviceStatusApproval rejectApproval(Long id, String comment, Long approverId, String approverName);

    DeviceStatusApproval cancelApproval(Long id);

    void batchApprove(List<Long> ids, String comment, Long approverId, String approverName);

    void batchReject(List<Long> ids, String comment, Long approverId, String approverName);

    Map<String, Object> getStats();
}