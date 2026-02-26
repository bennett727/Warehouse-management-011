package com.backend.config;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.nio.charset.Charset;
import java.util.Locale;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;

import lombok.extern.slf4j.Slf4j;

/**
 * 端口占用检测环境后置处理器
 * 在Spring环境准备好后、上下文刷新前执行端口检测
 * 用于检测后端服务器端口是否被占用，防止多实例运行导致的端口冲突
 *
 * @author 后端开发团队
 * @version 1.0
 * @since 2026-02-09
 */
@Slf4j
public class PortCheckEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // 从环境中获取端口配置
        int serverPort = 8080; // 默认值

        // 从环境属性获取端口
        String portProperty = environment.getProperty("server.port");
        if (portProperty != null && !portProperty.isEmpty()) {
            try {
                serverPort = Integer.parseInt(portProperty);
            } catch (NumberFormatException e) {
                log.error("[端口检测] 无效的端口配置: {}, 使用默认端口 8080", portProperty);
            }
        }

        log.info("[端口检测] 正在检测端口 {} 是否可用...", serverPort);

        if (isPortInUse(serverPort)) {
            String processInfo = getProcessUsingPort(serverPort);

            log.error("[端口检测] 端口 {} 已被占用！", serverPort);
            if (processInfo != null) {
                log.error("[端口检测] 占用进程信息: {}", processInfo);
            }

            // 尝试自动终止旧进程
            log.info("[端口检测] 正在尝试自动终止旧进程...");
            if (killProcessUsingPort(serverPort)) {
                log.info("[端口检测] 旧进程已终止，等待端口释放...");
                // 等待端口完全释放
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }

                // 再次检查端口
                if (!isPortInUse(serverPort)) {
                    log.info("[端口检测] 端口 {} 已释放，继续启动应用", serverPort);
                    return;
                } else {
                    log.error("[端口检测] 端口仍然被占用，无法自动释放");
                }
            } else {
                log.error("[端口检测] 自动终止旧进程失败");
            }

            log.error("[端口检测] 解决方案:");
            log.error("   1. 手动停止已运行的后端服务");
            log.error("   2. 或者修改配置文件中的 server.port 为其他端口");
            log.error("   3. 强制终止进程: taskkill /F /IM java.exe");

            // 抛出异常阻止应用启动
            throw new PortInUseException(
                    String.format("端口 %d 已被占用，请停止其他实例或更换端口", serverPort));
        }

        log.info("[端口检测] 端口 {} 可用，继续启动应用", serverPort);
    }

    /**
     * 检测端口是否被占用
     *
     * @param port 端口号
     * @return 是否被占用
     */
    private boolean isPortInUse(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port, 1, InetAddress.getByName("0.0.0.0"))) {
            // 如果能成功创建ServerSocket，说明端口未被占用
            return false;
        } catch (Exception e) {
            // 端口被占用或无法绑定
            return true;
        }
    }

    /**
     * 获取占用端口的进程信息（Windows系统）
     *
     * @param port 端口号
     * @return 进程信息
     */
    private String getProcessUsingPort(int port) {
        try {
            // 使用netstat查找占用端口的进程
            ProcessBuilder pb = new ProcessBuilder(
                    "cmd.exe",
                    "/c",
                    "netstat -ano | findstr :" + port);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), Charset.forName("GBK")))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.contains("LISTENING") || line.contains("ESTABLISHED")) {
                        String[] parts = line.split("\\s+");
                        if (parts.length >= 5) {
                            String pid = parts[parts.length - 1];
                            String processName = getProcessNameByPid(pid);
                            if (processName != null && processName.toLowerCase(Locale.ROOT).contains("java")) {
                                return String.format("PID: %s, 进程: %s", pid, processName);
                            }
                        }
                    }
                }
            }

            process.waitFor();
        } catch (Exception e) {
            log.warn("获取进程信息失败: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 根据PID获取进程名称
     *
     * @param pid 进程ID
     * @return 进程名称
     */
    private String getProcessNameByPid(String pid) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "cmd.exe",
                    "/c",
                    "tasklist /FI \"PID eq " + pid + "\" /FO CSV /NH");
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), Charset.forName("GBK")))) {

                String line = reader.readLine();
                if (line != null && !line.isEmpty()) {
                    // CSV格式: "进程名","PID","会话名","会话#","内存使用"
                    String[] parts = line.split("\",");
                    if (parts.length > 0) {
                        return parts[0].replace("\"", "");
                    }
                }
            }

            process.waitFor();
        } catch (Exception e) {
            log.warn("获取进程名称失败: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 终止占用指定端口的进程
     *
     * @param port 端口号
     * @return 是否成功终止
     */
    private boolean killProcessUsingPort(int port) {
        try {
            // 使用netstat查找占用端口的进程PID
            ProcessBuilder pb = new ProcessBuilder(
                    "cmd.exe",
                    "/c",
                    "netstat -ano | findstr :" + port);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String pid = null;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), Charset.forName("GBK")))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.contains("LISTENING") || line.contains("ESTABLISHED")) {
                        String[] parts = line.split("\\s+");
                        if (parts.length >= 5) {
                            String currentPid = parts[parts.length - 1];
                            String processName = getProcessNameByPid(currentPid);
                            // 只终止Java进程
                            if (processName != null && processName.toLowerCase(Locale.ROOT).contains("java")) {
                                pid = currentPid;
                                break;
                            }
                        }
                    }
                }
            }
            process.waitFor();

            if (pid != null) {
                log.info("[端口检测] 正在终止Java进程 (PID: {})...", pid);
                // 终止进程
                ProcessBuilder killPb = new ProcessBuilder(
                        "cmd.exe",
                        "/c",
                        "taskkill /F /PID " + pid);
                killPb.redirectErrorStream(true);
                Process killProcess = killPb.start();
                int exitCode = killProcess.waitFor();

                if (exitCode == 0) {
                    log.info("[端口检测] 成功终止进程 (PID: {})", pid);
                    return true;
                } else {
                    log.error("[端口检测] 终止进程失败，退出码: {}", exitCode);
                    return false;
                }
            } else {
                log.error("[端口检测] 未找到占用端口的Java进程");
                return false;
            }
        } catch (Exception e) {
            log.error("[端口检测] 终止进程时发生错误: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 端口被占用异常
     */
    public static class PortInUseException extends RuntimeException {
        public PortInUseException(String message) {
            super(message);
        }
    }
}
