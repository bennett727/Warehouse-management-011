package com.backend.service.stock.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.common.ErrorCode;
import com.backend.dto.PageResult;
import com.backend.entity.Batch;
import com.backend.exception.BusinessException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.BatchRepository;
import com.backend.service.stock.BatchService;

@Service
public class BatchServiceImpl implements BatchService {

    private static final Logger logger = LoggerFactory.getLogger(BatchServiceImpl.class);

    private final BatchRepository batchRepository;

    public BatchServiceImpl(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @Override
    public List<Batch> getAllBatches() {
        logger.info("获取所有批次");
        return batchRepository.findAll();
    }

    @Override
    public Batch getBatchById(Long id) {
        logger.info("获取批次，ID: {}", id);
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", id));
    }

    @Override
    public Batch getBatchByBatchNo(String batchNo) {
        logger.info("获取批次，批次号: {}", batchNo);
        return batchRepository.findByBatchNo(batchNo)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "batchNo", batchNo));
    }

    @Override
    @Transactional
    public Batch createBatch(Batch batch) {
        logger.info("创建批次: {}", batch.getBatchNo());

        batch.setCreateTime(LocalDateTime.now());
        Batch saved = batchRepository.save(batch);
        logger.info("批次创建成功，ID: {}", saved.getId());

        return saved;
    }

    @Override
    @Transactional
    public Batch updateBatch(Long id, Batch batch) {
        logger.info("更新批次，ID: {}", id);

        Batch existingBatch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", id));

        existingBatch.setBatchNo(batch.getBatchNo());
        existingBatch.setBatchName(batch.getBatchName());
        existingBatch.setQuantity(batch.getQuantity());
        existingBatch.setStatus(batch.getStatus());
        existingBatch.setExpiryDate(batch.getExpiryDate());
        existingBatch.setProductionDate(batch.getProductionDate());
        existingBatch.setUpdateTime(LocalDateTime.now());

        Batch updated = batchRepository.save(existingBatch);
        logger.info("批次更新成功，ID: {}", updated.getId());

        return updated;
    }

    @Override
    @Transactional
    public void deleteBatch(Long id) {
        logger.info("删除批次，ID: {}", id);

        if (!batchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Batch", "id", id);
        }

        batchRepository.deleteById(id);
        logger.info("批次删除成功，ID: {}", id);
    }

    @Override
    public PageResult<Batch> getBatches(Pageable pageable) {
        logger.info("获取批次列表，分页: {}", pageable);

        Page<Batch> page = batchRepository.findAll(pageable);
        return PageResult.of(page);
    }

    @Override
    public List<Batch> getBatchesByDeviceId(Long deviceId) {
        logger.info("获取设备的批次列表，设备ID: {}", deviceId);
        // 由于Batch实体没有deviceId字段，暂时返回空列表
        return new ArrayList<>();
    }

    @Override
    public List<Batch> getAvailableBatchesByDeviceId(Long deviceId) {
        logger.info("获取设备的可用批次列表，设备ID: {}", deviceId);
        // 由于Batch实体没有deviceId字段，暂时返回空列表
        return new ArrayList<>();
    }

    @Override
    @Transactional
    public void updateBatchStatus(Long batchId, Integer status) {
        logger.info("更新批次状态，批次ID: {}，状态: {}", batchId, status);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", batchId));

        batch.setStatus(status);
        batch.setUpdateTime(LocalDateTime.now());

        batchRepository.save(batch);
        logger.info("批次状态更新成功，ID: {}", batchId);
    }
}
