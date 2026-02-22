package com.backend.controller;

import com.backend.dto.ApiResponse;
import com.backend.dto.request.LoginRequest;
import com.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        // 净化输入数据
        request.sanitize();
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return authService.logout();
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refreshToken(@RequestHeader("Refresh-Token") String refreshToken) {
        return authService.refreshToken(refreshToken);
    }

    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> getUserInfo(@AuthenticationPrincipal UserDetails userDetails) {
        return authService.getUserInfo(userDetails.getUsername());
    }
}
