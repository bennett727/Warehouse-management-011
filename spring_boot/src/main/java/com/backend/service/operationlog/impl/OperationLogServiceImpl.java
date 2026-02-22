package com.backend.service.operationlog.impl;

import com.backend.entity.OperationLog;
import com.backend.service.operationlog.OperationLogService;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OperationLogServiceImpl implements OperationLogService {

    private final com.backend.repository.OperationLogRepository operationLogRepository;

    public OperationLogServiceImpl(com.backend.repository.OperationLogRepository operationLogRepository) {
        this.operationLogRepository = operationLogRepository;
    }

    @Override
    public List<OperationLog> getAllOperationLogs() {
        return operationLogRepository.findAll();
    }

    @Override
    public OperationLog getOperationLogById(Long id) {
        return operationLogRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public OperationLog createOperationLog(OperationLog operationLog) {
        return operationLogRepository.save(operationLog);
    }

    @Override
    @Transactional
    public void deleteOperationLog(Long id) {
        operationLogRepository.deleteById(id);
    }

    @Override
    public PageResult<OperationLog> getOperationLogs(Pageable pageable) {
        Page<OperationLog> page = operationLogRepository.findAll(pageable);
        return PageResult.of(page);
    }

    @Override
    public PageResult<OperationLog> getLogs(Pageable pageable, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            Page<OperationLog> page = operationLogRepository.findAll(pageable);
            return PageResult.of(page);
        } else {
            // 使用现有的查询方法，通过用户名或操作类型搜索
            Page<OperationLog> page = operationLogRepository.findByUsernameContaining(keyword, pageable);
            return PageResult.of(page);
        }
    }
}