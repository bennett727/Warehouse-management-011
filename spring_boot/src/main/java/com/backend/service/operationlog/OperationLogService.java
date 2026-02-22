package com.backend.service.operationlog;

import com.backend.entity.OperationLog;
import com.backend.dto.PageResult;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OperationLogService {
    List<OperationLog> getAllOperationLogs();
    OperationLog getOperationLogById(Long id);
    OperationLog createOperationLog(OperationLog operationLog);
    void deleteOperationLog(Long id);
    PageResult<OperationLog> getOperationLogs(Pageable pageable);
    PageResult<OperationLog> getLogs(Pageable pageable, String keyword);
}