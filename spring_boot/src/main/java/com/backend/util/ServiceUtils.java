package com.backend.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ServiceUtils {

    public static <T> Map<String, Object> buildPageResponse(Page<T> page, int pageNum, int pageSize) {
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("records", page.getContent());
        result.put("total", page.getTotalElements());
        result.put("page", pageNum);
        result.put("pageSize", pageSize);
        result.put("totalPages", page.getTotalPages());
        return result;
    }

    public static Pageable createPageable(int pageNum, int pageSize, String sortBy, Sort.Direction direction) {
        int pageZeroBased = pageNum > 0 ? pageNum - 1 : 0;
        Sort sort = Sort.by(direction, sortBy);
        return PageRequest.of(pageZeroBased, pageSize, sort);
    }

    public static Pageable createPageable(int pageNum, int pageSize) {
        int pageZeroBased = pageNum > 0 ? pageNum - 1 : 0;
        return PageRequest.of(pageZeroBased, pageSize);
    }

    public static <T> List<T> safeList(List<T> list) {
        return list != null ? list : new java.util.ArrayList<>();
    }

    public static String safeString(String str) {
        return str != null ? str : "";
    }

    public static Integer safeInteger(Integer value) {
        return value != null ? value : 0;
    }

    public static Long safeLong(Long value) {
        return value != null ? value : 0L;
    }

    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }
}