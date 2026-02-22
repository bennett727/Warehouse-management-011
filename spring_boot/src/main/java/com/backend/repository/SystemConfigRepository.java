package com.backend.repository;

import com.backend.entity.SystemConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 系统配置数据访问接口
 * 
 * 功能说明：
 * 提供系统配置实体的数据访问操作，支持按配置键查询、
 * 分页查询等功能
 * 
 * 使用场景：
 * - 系统参数管理
 * - 运行时配置读取
 * - 动态配置更新
 * 
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    /**
     * 根据配置键查询
     * 
     * @param configKey 配置键
     * @return 配置信息
     */
    Optional<SystemConfig> findByConfigKey(String configKey);

    /**
     * 检查配置键是否存在
     * 
     * @param configKey 配置键
     * @return 是否存在
     */
    boolean existsByConfigKey(String configKey);

    /**
     * 根据配置键模糊查询
     * 
     * @param configKey 配置键关键词
     * @param pageable  分页参数
     * @return 分页配置列表
     */
    Page<SystemConfig> findByConfigKeyContaining(String configKey, Pageable pageable);
}
