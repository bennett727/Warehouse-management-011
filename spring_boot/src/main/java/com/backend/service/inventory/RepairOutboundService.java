package com.backend.service.inventory;

import com.backend.dto.repair.RepairOutboundDTO;
import com.backend.dto.repair.RepairOutboundProgressDTO;
import com.backend.dto.repair.RepairOutboundCompleteDTO;
import com.backend.entity.RepairOutbound;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 修复出库服务接口
 *
 * 功能说明：
 * 提供设备修复出库的完整业务流程管理，包括创建、查询、进度更新、完成入库等操作
 *
 * 业务规则：
 * - 修复出库需关联设备和库存订单
 * - 支持修复状态跟踪（待出库→已出库→修复中→修复完成→已入库）
 * - 支持内部和外部两种修复方式
 * - 修复完成后需要重新入库
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
public interface RepairOutboundService {

    /**
     * 创建修复出库单
     *
     * @param dto 修复出库数据
     * @param creatorId 创建人ID
     * @return 创建的修复出库记录
     */
    RepairOutbound createRepairOutbound(RepairOutboundDTO dto, Long creatorId);

    /**
     * 获取修复出库列表
     *
     * @param status 状态
     * @param deviceName 设备名称
     * @param pageable 分页参数
     * @return 分页修复出库列表
     */
    Page<RepairOutbound> getRepairOutboundList(Integer status, String deviceName, Pageable pageable);

    /**
     * 获取修复出库详情
     *
     * @param id 修复出库ID
     * @return 修复出库详情
     */
    RepairOutbound getRepairOutboundDetail(Long id);

    /**
     * 更新修复进度
     *
     * @param id 修复出库ID
     * @param dto 进度数据
     * @param updaterId 更新人ID
     * @return 更新后的修复出库记录
     */
    RepairOutbound updateRepairProgress(Long id, RepairOutboundProgressDTO dto, Long updaterId);

    /**
     * 完成修复入库
     *
     * @param id 修复出库ID
     * @param dto 完成数据
     * @param operatorId 操作人ID
     * @return 完成后的修复出库记录
     */
    RepairOutbound completeRepairInbound(Long id, RepairOutboundCompleteDTO dto, Long operatorId);

    /**
     * 取消修复出库
     *
     * @param id 修复出库ID
     * @param reason 取消原因
     * @param operatorId 操作人ID
     */
    void cancelRepairOutbound(Long id, String reason, Long operatorId);

    /**
     * 获取修复统计信息
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计信息
     */
    Map<String, Object> getRepairStatistics(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 获取指定设备的修复历史
     *
     * @param deviceId 设备ID
     * @return 修复历史列表
     */
    List<RepairOutbound> getDeviceRepairHistory(Long deviceId);

    /**
     * 生成修复出库单号
     *
     * @return 修复出库单号
     */
    String generateRepairNo();
}
