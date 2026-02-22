package com.backend.service;

import com.backend.entity.ZoneType;
import com.backend.repository.ZoneTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 功能区类型服务层
 *
 * @author 开发团队
 * @since 2026-02-12
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ZoneTypeService {

    private final ZoneTypeRepository zoneTypeRepository;

    /**
     * 创建功能区类型
     *
     * @param zoneType 类型信息
     * @return 创建后的类型
     */
    @Transactional
    public ZoneType createZoneType(ZoneType zoneType) {
        // 检查编码是否已存在
        if (zoneTypeRepository.existsByCode(zoneType.getCode())) {
            throw new IllegalArgumentException("类型编码已存在: " + zoneType.getCode());
        }
        // 检查名称是否已存在
        if (zoneTypeRepository.existsByName(zoneType.getName())) {
            throw new IllegalArgumentException("类型名称已存在: " + zoneType.getName());
        }
        
        zoneType.setIsSystem(false); // 自定义类型
        zoneType.setStatus(1);
        
        ZoneType saved = zoneTypeRepository.save(zoneType);
        log.info("创建功能区类型成功: {}", saved.getName());
        return saved;
    }

    /**
     * 更新功能区类型
     *
     * @param id       类型ID
     * @param zoneType 类型信息
     * @return 更新后的类型
     */
    @Transactional
    public ZoneType updateZoneType(Long id, ZoneType zoneType) {
        ZoneType existing = zoneTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("类型不存在: " + id));
        
        // 系统预设类型不允许修改编码
        if (existing.getIsSystem() && !existing.getCode().equals(zoneType.getCode())) {
            throw new IllegalArgumentException("系统预设类型不允许修改编码");
        }
        
        // 检查新编码是否与其他类型冲突
        if (!existing.getCode().equals(zoneType.getCode()) && 
            zoneTypeRepository.existsByCode(zoneType.getCode())) {
            throw new IllegalArgumentException("类型编码已存在: " + zoneType.getCode());
        }
        
        // 检查新名称是否与其他类型冲突
        if (!existing.getName().equals(zoneType.getName()) && 
            zoneTypeRepository.existsByName(zoneType.getName())) {
            throw new IllegalArgumentException("类型名称已存在: " + zoneType.getName());
        }
        
        existing.setName(zoneType.getName());
        existing.setCode(zoneType.getCode());
        existing.setDescription(zoneType.getDescription());
        existing.setIcon(zoneType.getIcon());
        existing.setColor(zoneType.getColor());
        existing.setSort(zoneType.getSort());
        
        ZoneType saved = zoneTypeRepository.save(existing);
        log.info("更新功能区类型成功: {}", saved.getName());
        return saved;
    }

    /**
     * 删除功能区类型
     *
     * @param id 类型ID
     */
    @Transactional
    public void deleteZoneType(Long id) {
        ZoneType zoneType = zoneTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("类型不存在: " + id));
        
        // 检查是否可以删除
        if (!zoneType.isDeletable()) {
            throw new IllegalArgumentException("系统预设类型或正在使用的类型不能删除");
        }
        
        zoneTypeRepository.delete(zoneType);
        log.info("删除功能区类型成功: {}", zoneType.getName());
    }

    /**
     * 根据ID查询类型
     *
     * @param id 类型ID
     * @return 类型对象
     */
    public Optional<ZoneType> findById(Long id) {
        return zoneTypeRepository.findById(id);
    }

    /**
     * 根据编码查询类型
     *
     * @param code 类型编码
     * @return 类型对象
     */
    public Optional<ZoneType> findByCode(String code) {
        return zoneTypeRepository.findByCode(code);
    }

    /**
     * 分页查询类型列表
     *
     * @param keyword  关键词
     * @param status   状态
     * @param isSystem 是否系统预设
     * @param pageable 分页参数
     * @return 分页结果
     */
    public Page<ZoneType> findByConditions(String keyword, Integer status, Boolean isSystem, Pageable pageable) {
        return zoneTypeRepository.findByConditions(keyword, status, isSystem, pageable);
    }

    /**
     * 查询所有启用的类型
     *
     * @return 类型列表
     */
    public List<ZoneType> findAllActive() {
        return zoneTypeRepository.findByStatusOrderBySortAsc(1);
    }

    /**
     * 查询所有类型
     *
     * @return 类型列表
     */
    public List<ZoneType> findAll() {
        return zoneTypeRepository.findAll();
    }

    /**
     * 更新类型状态
     *
     * @param id     类型ID
     * @param status 状态
     * @return 更新后的类型
     */
    @Transactional
    public ZoneType updateStatus(Long id, Integer status) {
        ZoneType zoneType = zoneTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("类型不存在: " + id));
        
        zoneType.setStatus(status);
        return zoneTypeRepository.save(zoneType);
    }

    /**
     * 初始化系统预设类型
     * 在应用启动时调用
     */
    @Transactional
    public void initializeSystemTypes() {
        String[][] systemTypes = {
            {"RECEIVING", "收货区", "用于接收货物的区域", "Box", "#409EFF"},
            {"STORAGE", "存储区", "用于存放货物的区域", "House", "#67C23A"},
            {"PICKING", "拣货区", "用于拣选货物的区域", "Pointer", "#E6A23C"},
            {"SHIPPING", "发货区", "用于发货的区域", "Promotion", "#F56C6C"},
            {"RETURN", "退货区", "用于处理退货的区域", "RefreshLeft", "#909399"},
            {"QC", "质检区", "用于质量检验的区域", "CircleCheck", "#409EFF"},
            {"REPAIR", "维修区", "用于维修作业的区域", "Tools", "#E6A23C"},
            {"TEMPORARY", "暂存区", "用于临时存放的区域", "Timer", "#67C23A"}
        };
        
        int sort = 0;
        for (String[] type : systemTypes) {
            if (!zoneTypeRepository.existsByCode(type[0])) {
                ZoneType zoneType = new ZoneType();
                zoneType.setCode(type[0]);
                zoneType.setName(type[1]);
                zoneType.setDescription(type[2]);
                zoneType.setIcon(type[3]);
                zoneType.setColor(type[4]);
                zoneType.setSort(sort++);
                zoneType.setStatus(1);
                zoneType.setIsSystem(true);
                
                zoneTypeRepository.save(zoneType);
                log.info("初始化系统预设功能区类型: {}", type[1]);
            }
        }
    }
}
