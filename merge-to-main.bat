@echo off
chcp 65001
cls

echo ==========================================
echo  合并分支到 main
echo ==========================================
echo.

cd /d "d:\Warehouse management-011"

echo [1/4] 切换到 main 分支...
git checkout main
if errorlevel 1 (
    echo 错误：无法切换到 main 分支
    pause
    exit /b 1
)

echo.
echo [2/4] 拉取最新代码...
git pull origin main

echo.
echo [3/4] 合并 backup-before-cleanup-20260111 分支...
git merge backup-before-cleanup-20260111 --no-ff -m "Merge: 完善E2E测试，修复路由问题，建立CI/CD流程"
if errorlevel 1 (
    echo 错误：合并失败，请解决冲突后重试
    pause
    exit /b 1
)

echo.
echo [4/4] 推送到远程仓库...
git push origin main
if errorlevel 1 (
    echo 错误：推送失败
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  ✅ 合并完成！
echo ==========================================
echo.
echo 已完成的操作：
echo   - 合并 backup-before-cleanup-20260111 到 main
echo   - 推送到 GitHub
echo.
echo 请访问查看：
echo   https://github.com/bennett727/Warehouse-management-011
echo.
pause
