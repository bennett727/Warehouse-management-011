package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.AreaType;

/**
 * 区域类型数据访问接口
 *
 * 功能说明：
 * 提供区域类型实体的数据访问操作，包括基本的CRUD操作和自定义查询方法
 *
 * 使用场景：
 * - 区域类型信息的增删改查
 * - 按状态查询区域类型
 * - 区域类型排序查询
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface AreaTypeRepository extends JpaRepository<AreaType, Long> {

        /**
         * 根据编码查询区域类型
         *
         * @param code 区域类型编码
         * @return 区域类型信息
         */
        Optional<AreaType> findByCode(String code);

        /**
         * 根据名称查询区域类型
         *
         * @param name 区域类型名称
         * @return 区域类型信息
         */
        Optional<AreaType> findByName(String name);

        /**
         * 根据状态查询区域类型列表
         *
         * @param status 状态
         * @return 区域类型列表
         */
        List<AreaType> findByStatus(Integer status);

        /**
         * 根据状态查询区域类型列表（按排序号升序）
         *
         * @param status 状态
         * @return 区域类型列表
         */
        List<AreaType> findByStatusOrderBySortAsc(Integer status);

        /**
         * 分页查询区域类型列表（带条件）
         *
         * @param keyword  关键词（编码或名称）
         * @param status   状态
         * @param pageable 分页参数
         * @return 分页区域类型列表
         */
        @Query("SELECT at FROM AreaType at WHERE " +
                        "(:keyword IS NULL OR at.code LIKE %:keyword% OR at.name LIKE %:keyword%) AND " +
                        "(:status IS NULL OR at.status = :status)")
        Page<AreaType> findByConditions(@Param("keyword") String keyword,
                        @Param("status") Integer status,
                        Pageable pageable);

        /**
         * 检查区域类型编码是否存在
         *
         * @param code 区域类型编码
         * @return 是否存在
         */
        boolean existsByCode(String code);

        /**
         * 检查区域类型名称是否存在
         *
         * @param name 区域类型名称
         * @return 是否存在
         */
        boolean existsByName(String name);
}
