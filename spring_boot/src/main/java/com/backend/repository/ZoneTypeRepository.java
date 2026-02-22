package com.backend.repository;

import com.backend.entity.ZoneType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 功能区类型数据访问层
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Repository
public interface ZoneTypeRepository extends JpaRepository<ZoneType, Long> {

    /**
     * 根据编码查找类型
     *
     * @param code 类型编码
     * @return 类型对象
     */
    Optional<ZoneType> findByCode(String code);

    /**
     * 根据名称查找类型
     *
     * @param name 类型名称
     * @return 类型对象
     */
    Optional<ZoneType> findByName(String name);

    /**
     * 检查编码是否存在
     *
     * @param code 类型编码
     * @return 是否存在
     */
    boolean existsByCode(String code);

    /**
     * 检查名称是否存在
     *
     * @param name 类型名称
     * @return 是否存在
     */
    boolean existsByName(String name);

    /**
     * 根据状态查询类型列表
     *
     * @param status 状态
     * @return 类型列表
     */
    List<ZoneType> findByStatusOrderBySortAsc(Integer status);

    /**
     * 查询所有启用的类型
     *
     * @return 类型列表
     */
    List<ZoneType> findByStatusOrderBySortAscIdAsc(Integer status);

    /**
     * 分页查询类型列表
     *
     * @param keyword  关键词
     * @param status   状态
     * @param isSystem 是否系统预设
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT zt FROM ZoneType zt WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR zt.name LIKE %:keyword% OR zt.code LIKE %:keyword% OR zt.description LIKE %:keyword%) AND " +
           "(:status IS NULL OR zt.status = :status) AND " +
           "(:isSystem IS NULL OR zt.isSystem = :isSystem)")
    Page<ZoneType> findByConditions(@Param("keyword") String keyword,
                                    @Param("status") Integer status,
                                    @Param("isSystem") Boolean isSystem,
                                    Pageable pageable);

    /**
     * 查询所有系统预设类型
     *
     * @return 类型列表
     */
    List<ZoneType> findByIsSystemTrueOrderBySortAsc();

    /**
     * 查询所有自定义类型
     *
     * @return 类型列表
     */
    List<ZoneType> findByIsSystemFalseOrderBySortAsc();

    /**
     * 查询所有系统预设类型
     * @return 类型列表
     */
    List<ZoneType> findByIsSystemTrue();

    /**
     * 统计系统预设类型数量
     * @return 数量
     */
    long countByIsSystemTrue();
}
