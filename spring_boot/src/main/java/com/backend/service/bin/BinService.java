package com.backend.service.bin;

import com.backend.entity.Bin;
import com.backend.repository.BinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 货位服务类
 *
 * 功能说明：
 * 提供货位信息的业务逻辑处理，包括增删改查等操作
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2024-01-01
 */
@Service
@RequiredArgsConstructor
public class BinService {

    private final BinRepository binRepository;

    /**
     * 获取货位列表（分页）
     *
     * @param pageable 分页参数
     * @return 货位分页列表
     */
    public Page<Bin> getBinList(Pageable pageable) {
        return binRepository.findAll(pageable);
    }

    /**
     * 根据区域ID获取货位列表
     *
     * @param areaId 区域ID
     * @return 货位列表
     */
    public List<Bin> getBinsByAreaId(Long areaId) {
        return binRepository.findByAreaId(areaId);
    }

    /**
     * 根据ID获取货位详情
     *
     * @param id 货位ID
     * @return 货位信息
     */
    public Bin getBinById(Long id) {
        return binRepository.findById(id).orElse(null);
    }

    /**
     * 根据编码获取货位
     *
     * @param code 货位编码
     * @return 货位信息
     */
    public Bin getBinByCode(String code) {
        return binRepository.findByCode(code).orElse(null);
    }

    /**
     * 创建货位
     *
     * @param bin 货位信息
     * @return 创建的货位
     */
    @Transactional
    public Bin createBin(Bin bin) {
        return binRepository.save(bin);
    }

    /**
     * 更新货位
     *
     * @param id 货位ID
     * @param bin 货位信息
     * @return 更新后的货位
     */
    @Transactional
    public Bin updateBin(Long id, Bin bin) {
        Bin existingBin = getBinById(id);
        if (existingBin == null) {
            return null;
        }
        
        existingBin.setCode(bin.getCode());
        existingBin.setName(bin.getName());
        existingBin.setAreaId(bin.getAreaId());
        existingBin.setRowNo(bin.getRowNo());
        existingBin.setColumnNo(bin.getColumnNo());
        existingBin.setLevelNo(bin.getLevelNo());
        existingBin.setCapacity(bin.getCapacity());
        existingBin.setUsedCapacity(bin.getUsedCapacity());
        existingBin.setStatus(bin.getStatus());
        
        return binRepository.save(existingBin);
    }

    /**
     * 删除货位
     *
     * @param id 货位ID
     */
    @Transactional
    public void deleteBin(Long id) {
        binRepository.deleteById(id);
    }

    /**
     * 获取所有可用货位
     *
     * @return 可用货位列表
     */
    public List<Bin> getAvailableBins() {
        return binRepository.findByStatus(1);
    }

    /**
     * 批量创建货位
     *
     * @param bins 货位列表
     * @return 创建的货位列表
     */
    @Transactional
    public List<Bin> batchCreateBins(List<Bin> bins) {
        return binRepository.saveAll(bins);
    }
}
