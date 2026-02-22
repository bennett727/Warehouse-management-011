package com.backend.common;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PageResult<T> {

    private List<T> list;
    private Long total;
    private Integer page;
    private Integer size;
    private Integer pages;
    private Boolean hasNext;
    private Boolean hasPrevious;

    public PageResult() {
    }

    public PageResult(List<T> list, Long total, Integer page, Integer size) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.pages = (int) Math.ceil((double) total / size);
        this.hasNext = page < this.pages;
        this.hasPrevious = page > 1;
    }

    public PageResult(List<T> list, Long total, Integer page, Integer size, Integer pages) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.pages = pages;
        this.hasNext = page < pages;
        this.hasPrevious = page > 1;
    }

    public static <T> PageResult<T> of(List<T> list, Long total, Integer page, Integer size) {
        return new PageResult<>(list, total, page, size);
    }

    public static <T> PageResult<T> of(List<T> list, Long total, Integer page, Integer size, Integer pages) {
        return new PageResult<>(list, total, page, size, pages);
    }

    public static <T> PageResult<T> empty(Integer page, Integer size) {
        return new PageResult<>(List.of(), 0L, page, size, 0);
    }

    public static <T> PageResult<T> from(org.springframework.data.domain.Page<T> page) {
        return new PageResult<>(
                page.getContent(),
                page.getTotalElements(),
                page.getPageable().getPageNumber() + 1,
                page.getPageable().getPageSize(),
                page.getTotalPages());
    }
}