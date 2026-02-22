package com.backend.service.inventory;

import com.backend.entity.InventoryAdjustment;

import java.util.List;

public interface InventoryAdjustmentService {

    List<InventoryAdjustment> getAllAdjustments();

    InventoryAdjustment getAdjustmentById(Long id);

    List<InventoryAdjustment> getMyAdjustments(Long applicantId);

    InventoryAdjustment createAdjustment(InventoryAdjustment adjustment);

    InventoryAdjustment approveAdjustment(Long id, String comment, Long approverId, String approverName);

    void deleteAdjustment(Long id);
}