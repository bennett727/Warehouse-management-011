package com.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * JWT令牌提供者
 * 
 * 功能说明：
 * 提供JWT令牌的生成、解析和验证功能
 * 支持Access Token和Refresh Token双令牌机制
 * 
 * Token策略：
 * - Access Token：2小时有效期，用于接口认证
 * - Refresh Token：7天有效期，用于刷新Access Token
 * - 刷新窗口期：5分钟（到期前5分钟可自动刷新）
 * 
 * 安全特性：
 * - 使用HS256算法签名
 * - 支持Token黑名单（登出失效）
 * - 支持Token自动刷新
 * 
 * @author 后端开发团队
 * @version 2.0
 * @since 2025-01-01
 */
@Slf4j
@Component
@SuppressWarnings("deprecation")
public class JwtTokenProvider {

    @Value("${jwt.secret:warehouse-management-system-secret-key-2024-secure-key-for-jwt-signing}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration:7200000}") // 2小时
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration:604800000}") // 7天
    private long refreshTokenExpiration;

    @Value("${jwt.refresh-window:300000}") // 5分钟刷新窗口
    private long refreshWindow;

    /**
     * 获取签名密钥
     * 
     * @return SecretKey对象
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 从Token中提取用户名
     * 
     * @param token JWT令牌
     * @return 用户名
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * 从Token中提取过期时间
     * 
     * @param token JWT令牌
     * @return 过期时间
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 从Token中提取指定声明
     * 
     * @param token          JWT令牌
     * @param claimsResolver 声明解析器
     * @return 声明值
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 从Token中提取所有声明
     * 
     * @param token JWT令牌
     * @return Claims对象
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 生成Access Token
     *
     * @param authentication 认证信息
     * @return Access Token字符串
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("tokenId", generateTokenId());

        // 添加角色信息到 Token
        List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
        claims.put("roles", roles);

        return createToken(claims, userDetails.getUsername(), accessTokenExpiration);
    }

    /**
     * 生成Access Token（不带角色信息，用于特定场景）
     *
     * @param username 用户名
     * @return Access Token字符串
     * @deprecated 请使用带Authentication参数的方法
     */
    @Deprecated
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("tokenId", generateTokenId());

        return createToken(claims, username, accessTokenExpiration);
    }

    /**
     * 从Token中提取角色列表
     *
     * @param token JWT令牌
     * @return 角色列表
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("roles", List.class);
        } catch (Exception e) {
            log.warn("从Token中提取角色失败: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * 生成Refresh Token
     * 
     * @param username 用户名
     * @return Refresh Token字符串
     */
    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        claims.put("tokenId", generateTokenId());

        return createToken(claims, username, refreshTokenExpiration);
    }

    /**
     * 创建Token
     * 
     * @param claims     声明信息
     * @param subject    主题（用户名）
     * @param expiration 过期时间（毫秒）
     * @return Token字符串
     */
    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setId((String) claims.get("tokenId"))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 生成Token ID
     * 
     * @return Token ID字符串
     */
    private String generateTokenId() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 验证Token是否有效
     * 
     * @param token       JWT令牌
     * @param userDetails 用户详情
     * @return true表示有效
     */
    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * 验证Token是否过期
     * 
     * @param token JWT令牌
     * @return true表示已过期
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * 验证Token
     * 
     * @param token JWT令牌
     * @return true表示验证通过
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * 获取Token剩余有效时间（毫秒）
     * 
     * @param token JWT令牌
     * @return 剩余有效时间
     */
    public long getExpirationTime(String token) {
        Date expiration = extractExpiration(token);
        return expiration.getTime() - System.currentTimeMillis();
    }

    /**
     * 判断Token是否需要刷新
     * 
     * 在到期前5分钟内返回true
     * 
     * @param token JWT令牌
     * @return true表示需要刷新
     */
    public boolean shouldRefreshToken(String token) {
        try {
            long remainingTime = getExpirationTime(token);
            return remainingTime > 0 && remainingTime <= refreshWindow;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断Token是否为Access Token
     * 
     * @param token JWT令牌
     * @return true表示是Access Token
     */
    public boolean isAccessToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "access".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断Token是否为Refresh Token
     * 
     * @param token JWT令牌
     * @return true表示是Refresh Token
     */
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 获取Access Token过期时间
     * 
     * @return 过期时间（毫秒）
     */
    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    /**
     * 获取Refresh Token过期时间
     * 
     * @return 过期时间（毫秒）
     */
    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    /**
     * 获取Token信息
     * 
     * @param token JWT令牌
     * @return Token信息对象
     */
    public TokenInfo getTokenInfo(String token) {
        try {
            Claims claims = extractAllClaims(token);
            TokenInfo info = new TokenInfo();
            info.setUsername(claims.getSubject());
            info.setTokenId(claims.getId());
            info.setType((String) claims.get("type"));
            info.setIssuedAt(claims.getIssuedAt());
            info.setExpiration(claims.getExpiration());
            info.setRemainingTime(getExpirationTime(token));
            info.setValid(true);
            return info;
        } catch (Exception e) {
            TokenInfo info = new TokenInfo();
            info.setValid(false);
            return info;
        }
    }

    /**
     * Token信息内部类
     */
    @Data
    public static class TokenInfo {
        private String username;
        private String tokenId;
        private String type;
        private Date issuedAt;
        private Date expiration;
        private long remainingTime;
        private boolean valid;
    }
}
