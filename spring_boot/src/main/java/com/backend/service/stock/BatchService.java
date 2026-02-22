package com.backend.service.stock;

import com.backend.entity.Batch;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BatchService {
    List<Batch> getAllBatches();
    Batch getBatchById(Long id);
    Batch getBatchByBatchNo(String batchNo);
    Batch createBatch(Batch batch);
    Batch updateBatch(Long id, Batch batch);
    void deleteBatch(Long id);
    PageResult<Batch> getBatches(Pageable pageable);
    List<Batch> getBatchesByDeviceId(Long deviceId);
    List<Batch> getAvailableBatchesByDeviceId(Long deviceId);
    void updateBatchStatus(Long batchId, Integer status);
}