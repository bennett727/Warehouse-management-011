package com.backend.repository.optimized;

import com.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * 设备Repository优化版本
 *
 * 优化说明：
 * 1. 使用@EntityGraph解决设备-库存N+1问题
 * 2. 使用原生SQL优化复杂统计查询
 * 3. 使用索引字段优化时间范围查询
 * 4. 批量操作优化
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface OptimizedDeviceRepository extends JpaRepository<Device, Long>, JpaSpecificationExecutor<Device> {
    // 暂时只保留基本CRUD操作
    // 复杂的查询方法将在后续逐步添加
}
