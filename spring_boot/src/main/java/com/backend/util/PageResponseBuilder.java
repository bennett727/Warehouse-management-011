package com.backend.util;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.util.List;

public class PageResponseBuilder {

    public static <T> ResponseEntity<List<T>> build(Page<T> page) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(page.getTotalElements()));
        headers.add("X-Total-Pages", String.valueOf(page.getTotalPages()));
        headers.add("X-Current-Page", String.valueOf(page.getPageable().getPageNumber() + 1));
        headers.add("X-Page-Size", String.valueOf(page.getPageable().getPageSize()));
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(page.getContent());
    }

    public static <T> ResponseEntity<List<T>> build(Page<T> page, List<T> content) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(page.getTotalElements()));
        headers.add("X-Total-Pages", String.valueOf(page.getTotalPages()));
        headers.add("X-Current-Page", String.valueOf(page.getPageable().getPageNumber() + 1));
        headers.add("X-Page-Size", String.valueOf(page.getPageable().getPageSize()));
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    public static <T> java.util.Map<String, Object> buildPageResponse(Page<T> page, int pageNum, int pageSize) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("records", page.getContent());
        result.put("total", page.getTotalElements());
        result.put("page", pageNum);
        result.put("pageSize", pageSize);
        result.put("totalPages", page.getTotalPages());
        return result;
    }
}