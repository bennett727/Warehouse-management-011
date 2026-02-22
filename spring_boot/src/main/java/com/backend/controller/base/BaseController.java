package com.backend.controller.base;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.backend.dto.ApiResponse;
import com.backend.dto.PageRequest;
import com.backend.entity.User;

public class BaseController {

    protected User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    protected Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    protected String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    protected <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }

    protected <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.success(message, data);
    }

    protected <T> ApiResponse<T> error(String message) {
        return ApiResponse.error(message);
    }

    protected <T> ApiResponse<T> error(Integer code, String message) {
        return ApiResponse.error(code, message);
    }

    protected int convertToZeroBasedPage(int page) {
        return page > 0 ? page - 1 : 0;
    }

    protected Pageable buildPageable(PageRequest pageReq) {
        int page = pageReq.getPage() != null ? pageReq.getPage() : 1;
        int size = pageReq.getSize() != null ? pageReq.getSize() : 10;
        String sortField = pageReq.getSort() != null ? pageReq.getSort() : "id";
        String sortOrder = pageReq.getOrder() != null ? pageReq.getOrder() : "desc";

        Sort sort = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortField).ascending()
                : Sort.by(sortField).descending();

        return org.springframework.data.domain.PageRequest.of(convertToZeroBasedPage(page), size, sort);
    }
}