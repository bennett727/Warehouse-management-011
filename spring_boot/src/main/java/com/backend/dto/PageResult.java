package com.backend.dto;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 分页响应结果封装
 * 
 * 功能说明：
 * 统一封装分页查询的响应结构，与前端分页组件对接
 * 
 * 格式： 
 *  
 * "records": [. // 数据列表
 * "total": 10 // 总记录数
 * "current":  // 当前页码（从1开始）
 * "size": 20,      // 每页大小
 * "pages": 5,          // 总页数
 *   "hasNext": true,         // 是否有下一页
 *   "hasPrevious": false     // 是否有上一页
 * }
 * 
 * 使用示例：
 * - 从Spring Data Page转换：PageResult.of(page)
 * - 手动创建：PageResult.of(records, total, current, size)
 * - 空分页：PageResult.empty()
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "分页响应结果")
@SuppressWarnings("deprecation")
public class PageResult<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 数据列表
     */
    @Schema(description = "数据列表", required = true)
    private List<T> records;

    /**
     * 总记录数
     */
    @Schema(description = "总记录数", required = true, example = "100")
    private Long total;

    /**
     * 当前页码（从1开始）
     */
    @Schema(description = "当前页码（从1开始）", required = true, example = "1")
    private Long current;

    /**
     * 每页大小
     */
    @Schema(description = "每页大小", required = true, example = "20")
    private Long size;

    /**
     * 总页数
     */
    @Schema(description = "总页数", required = true, example = "5")
    private Long pages;

    /**
     * 是否有下一页
     */
    @Schema(description = "是否有下一页", example = "true")
    private Boolean hasNext;

    /**
     * 是否有上一页
     */
    @Schema(description = "是否有上一页", example = "false")
    private Boolean hasPrevious;

    /**
     * 是否为第一页
     */
    @Schema(description = "是否为第一页", example = "true")
    private Boolean isFirst;

    /**
     * 是否为最后一页
     */
    @Schema(description = "是否为最后一页", example = "false")
    private Boolean isLast;

    // Getter方法
    public List<T> getRecords() {
        return records;
    }

    public Long getTotal() {
        return total;
    }

    public Long getCurrent() {
        return current;
    }

    public Long getSize() {
        return size;
    }

    public Long getPages() {
        return pages;
    }

    public Boolean getHasNext() {
        return hasNext;
    }

    public Boolean getHasPrevious() {
        return hasPrevious;
    }

    public Boolean getIsFirst() {
        return isFirst;
    }

    public Boolean getIsLast() {
        return isLast;
    }

    // Setter方法
    public void setRecords(List<T> records) {
        this.records = records;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public void setCurrent(Long current) {
        this.current = current;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public void setPages(Long pages) {
        this.pages = pages;
    }

    public void setHasNext(Boolean hasNext) {
        this.hasNext = hasNext;
    }

    public void setHasPrevious(Boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }

    public void setIsFirst(Boolean isFirst) {
        this.isFirst = isFirst;
    }

    public void setIsLast(Boolean isLast) {
        this.isLast = isLast;
    }

    /**
     * 从Spring Data Page对象创建分页结果
     * 
     * @param page Spring Data Page对象
     * @return PageResult对象
     */
    public static <T> PageResult<T> of(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(page.getContent());
        result.setTotal(page.getTotalElements());
        result.setCurrent((long) page.getPageable().getPageNumber() + 1);
        result.setSize((long) page.getPageable().getPageSize());
        result.setPages((long) page.getTotalPages());
        result.setHasNext(page.hasNext());
        result.setHasPrevious(page.hasPrevious());
        result.setIsFirst(!page.hasPrevious());
        result.setIsLast(!page.hasNext());
        return result;
    }

    /**
     * 从Spring Dat     Page对象创建分页结果（带数据转换）
     * 
     * @param page Spring Data Page对象
     * @param records 转换后的数据列表
     * @return PageResult对象
     */
    public static <T, E> PageResult<T> of(Page<E> page, List<T> records) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(page.getTotalElements());
        result.setCurrent((long) page.getPageable().getPageNumber() + 1);
        result.setSize((long) page.getPageable().getPageSize());
        result.setPages((long) page.getTotalPages());
        result.setHasNext(page.hasNext());
        result.setHasPrevious(page.hasPrevious());
        result.setIsFirst(!page.hasPrevious());
        result.setIsLast(!page.hasNext());
        return result;
    }

    /**
     * 手动创建分页结果
     *    
     * @param records 数据列表
     * @param tota     总记录数
     * @param current 当前页码
     * @param size 每页大小
     * @return PageResult对象
     */
    public static <T> PageResult<T> of(List<T> records, long total, long current, long size) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(total);
        result.setCurrent(current);
        result.setSize(size);
        result.setPages((total + size - 1) / size);
        result.setHasNext(current < result.getPages());
        result.setHasPrevious(current > 1);
        result.setIsFirst(current == 1);
        result.setIsLast(current >= result.getPages());
        return result;
    }

    /**
     * 创建空分页结果
     * 
     * @return 空PageResult对象
     */
    public static <T> PageResult<T> empty() {
        PageResult<T> result = new PageResult<>();
        result.setRecords(Collections.emptyList());
        result.setTotal(0L);
        result.setCurrent(1L);
        result.setSize(20L);
        result.setPages(0L);
        result.setHasNext(false);
        result.setHasPrevious(false);
        result.setIsFirst(true);
        result.setIsLast(true);
        return result;
    }

    /**
     * 创建空分页结果（指定每页大小）
     * 
     * @param size 每页大小
     * @return 空PageResult对象
     */
    public static <T> PageResult<T> empty(long size) {
        PageResult<T> result = empty();
        result.setSize(size);
        return result;
    }

    /**
     * 获取当前页起始记录索引（用于SQL查询）
     * 
     * @return 起始索引（从0开始）
     */
    public long getOffset() {
        return (current - 1) * size;
    }

    /**
     * 获取当前页结束记录索引
     * 
     * @return 结束索引
     */
    public long getEndOffset() {
        return Math.min(current * size, total);
    }

    /**
     * 判断分页结果是否为空
     * 
     * @return true表示没有数据
     */
    public boolean isEmpty() {
        return records == null || records.isEmpty();
    }

    /**
     * 获取记录数量
     * 
     * @return 当前页记录数
     */
    public int getRecordCount() {
        return records == null ? 0 : records.size();
    }
}
