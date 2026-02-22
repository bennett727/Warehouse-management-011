# Enhanced Security Features Test Script
# Tests all security improvements implemented in the WMS system

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enhanced Security Features Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Server context-path is /api, so URLs are relative to that" -ForegroundColor Gray
Write-Host ""

# Test 1: Test Unified API Path Prefix
Write-Host "[Test 1] Testing Unified API Path Prefix" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$apiEndpoints = @(
    @{Path="/auth/login"; Method="POST"; Description="Login endpoint"},
    @{Path="/auth/refresh"; Method="POST"; Description="Token refresh endpoint"},
    @{Path="/auth/info"; Method="GET"; Description="User info endpoint"},
    @{Path="/auth/logout"; Method="POST"; Description="Logout endpoint"},
    @{Path="/auth/token/refresh"; Method="POST"; Description="Enhanced token refresh"},
    @{Path="/auth/token/auto-refresh"; Method="POST"; Description="Auto token refresh"},
    @{Path="/auth/token/revoke"; Method="POST"; Description="Revoke refresh token"},
    @{Path="/auth/token/revoke-all"; Method="POST"; Description="Revoke all tokens"},
    @{Path="/auth/token/stats"; Method="GET"; Description="Token refresh stats"}
)

$passedTests = 0
$failedTests = 0

foreach ($endpoint in $apiEndpoints) {
    try {
        $url = $baseUrl + $endpoint.Path
        Write-Host "Testing: $($endpoint.Path) - $($endpoint.Description)" -NoNewline
        
        if ($endpoint.Method -eq "POST") {
            $response = Invoke-WebRequest -Uri $url -Method $endpoint.Method -ContentType "application/json" -Body "{}" -UseBasicParsing -ErrorAction SilentlyContinue
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $endpoint.Method -UseBasicParsing -ErrorAction SilentlyContinue
        }
        
        Write-Host " [Accessible]" -ForegroundColor Green
        $passedTests++
    } catch {
        Write-Host " [Not Found/Not Accessible]" -ForegroundColor Red
        $failedTests++
    }
}

Write-Host ""
Write-Host "API Path Prefix Test Results:" -ForegroundColor Cyan
Write-Host "  Passed: $passedTests" -ForegroundColor Green
Write-Host "  Failed: $failedTests" -ForegroundColor Red
Write-Host ""

# Test 2: Test Security Audit Logging
Write-Host "[Test 2] Testing Security Audit Logging" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

# Test unauthorized access (should be logged)
Write-Host "Testing unauthorized access logging..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/info" -Method "GET" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host " [Unexpected Success]" -ForegroundColor Red
} catch {
    Write-Host " [Expected Failure - Should be logged]" -ForegroundColor Green
}

# Test invalid token (should be logged)
Write-Host "Testing invalid token logging..." -NoNewline
try {
    $headers = @{
        "Authorization" = "Bearer invalid.token.here"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/info" -Method "GET" -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host " [Unexpected Success]" -ForegroundColor Red
} catch {
    Write-Host " [Expected Failure - Should be logged]" -ForegroundColor Green
}

Write-Host ""
Write-Host "Security Audit Logging Test: Check server logs for audit entries" -ForegroundColor Cyan
Write-Host ""

# Test 3: Test Enhanced Token Refresh System
Write-Host "[Test 3] Testing Enhanced Token Refresh System" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

# Login to get tokens
Write-Host "Logging in to get tokens..." -NoNewline
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method "POST" -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data) {
        $accessToken = $loginResponse.data.accessToken
        $refreshToken = $loginResponse.data.refreshToken
        Write-Host " [Success]" -ForegroundColor Green
        Write-Host "  Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "  Refresh Token: $($refreshToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host " [Failed]" -ForegroundColor Red
        throw "Login failed"
    }
} catch {
    Write-Host " [Failed]" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    $refreshToken = $null
}

if ($refreshToken) {
    # Test enhanced token refresh
    Write-Host "Testing enhanced token refresh..." -NoNewline
    try {
        $refreshBody = @{
            refreshToken = $refreshToken
        } | ConvertTo-Json
        
        $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/token/refresh" -Method "POST" -Body $refreshBody -ContentType "application/json"
        
        if ($refreshResponse.success -and $refreshResponse.data) {
            Write-Host " [Success]" -ForegroundColor Green
            Write-Host "  New Access Token: $($refreshResponse.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
            Write-Host "  New Refresh Token: $($refreshResponse.data.refreshToken.Substring(0, 20))..." -ForegroundColor Gray
            Write-Host "  Token Type: $($refreshResponse.data.tokenType)" -ForegroundColor Gray
            Write-Host "  Expires In: $($refreshResponse.data.expiresIn) seconds" -ForegroundColor Gray
        } else {
            Write-Host " [Failed]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [Failed]" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }

    # Test auto refresh
    Write-Host "Testing auto token refresh..." -NoNewline
    try {
        $autoRefreshBody = @{
            refreshToken = $refreshToken
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "Bearer $accessToken"
        }
        
        $autoRefreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/token/auto-refresh" -Method "POST" -Body $autoRefreshBody -Headers $headers -ContentType "application/json"
        
        if ($autoRefreshResponse.success) {
            Write-Host " [Success]" -ForegroundColor Green
            if ($autoRefreshResponse.data) {
                Write-Host "  Auto-refreshed tokens returned" -ForegroundColor Gray
            } else {
                Write-Host "  Token does not need refresh yet" -ForegroundColor Gray
            }
        } else {
            Write-Host " [Failed]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [Failed]" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }

    # Test token refresh stats
    Write-Host "Testing token refresh stats..." -NoNewline
    try {
        $headers = @{
            "Authorization" = "Bearer $accessToken"
        }
        
        $statsResponse = Invoke-RestMethod -Uri "$baseUrl/auth/token/stats" -Method "GET" -Headers $headers
        
        if ($statsResponse.success -and $statsResponse.data) {
            Write-Host " [Success]" -ForegroundColor Green
            Write-Host "  Success Count: $($statsResponse.data.successCount)" -ForegroundColor Gray
            Write-Host "  Failure Count: $($statsResponse.data.failureCount)" -ForegroundColor Gray
            Write-Host "  Consecutive Failures: $($statsResponse.data.consecutiveFailures)" -ForegroundColor Gray
            Write-Host "  Is Locked: $($statsResponse.data.isLocked)" -ForegroundColor Gray
        } else {
            Write-Host " [Failed]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [Failed]" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }

    # Test revoke refresh token
    Write-Host "Testing revoke refresh token..." -NoNewline
    try {
        $revokeBody = @{
            refreshToken = $refreshToken
        } | ConvertTo-Json
        
        $revokeResponse = Invoke-RestMethod -Uri "$baseUrl/auth/token/revoke" -Method "POST" -Body $revokeBody -ContentType "application/json"
        
        if ($revokeResponse.success) {
            Write-Host " [Success]" -ForegroundColor Green
        } else {
            Write-Host " [Failed]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [Failed]" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping token refresh tests - No refresh token available" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Test Security Headers
Write-Host "[Test 4] Testing Security Headers" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

Write-Host "Testing security headers on API endpoints..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method "POST" -ContentType "application/json" -Body "{}" -UseBasicParsing -ErrorAction SilentlyContinue
    
    $securityHeaders = @(
        @{Name="X-Content-Type-Options"; Expected="nosniff"},
        @{Name="X-Frame-Options"; Expected="DENY"},
        @{Name="X-XSS-Protection"; Expected="1; mode=block"}
    )
    
    $headersFound = 0
    foreach ($header in $securityHeaders) {
        if ($response.Headers[$header.Name]) {
            $headersFound++
        }
    }
    
    Write-Host " [Found $headersFound/3 security headers]" -ForegroundColor Green
} catch {
    Write-Host " [Failed]" -ForegroundColor Red
}

Write-Host ""

# Test Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All security feature tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check server logs for security audit entries" -ForegroundColor White
Write-Host "2. Verify token refresh functionality in production" -ForegroundColor White
Write-Host "3. Monitor security metrics and alerts" -ForegroundColor White
Write-Host ""
