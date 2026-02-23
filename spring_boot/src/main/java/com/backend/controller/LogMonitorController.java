package com.backend.controller;

import com.backend.common.ErrorCode;
import com.backend.dto.ApiResponse;
import com.backend.exception.BusinessException;
import com.backend.util.LogMonitor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 日志监控管理控制器
 * 提供日志查看、下载、统计等管理接口
 * 仅管理员可访问
 */
@RestController
@RequestMapping("/system/logs")
public class LogMonitorController {

    private static final Logger logger = LoggerFactory.getLogger(LogMonitorController.class);

    @Value("${logging.file.path:logs}")
    private String logPath;

    @Autowired
    private LogMonitor logMonitor;

    /**
     * 获取日志统计信息
     */
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getLogStatistics() {
        logger.info("获取日志统计信息");
        Map<String, Object> stats = logMonitor.getLogStatistics();
        return ApiResponse.success(stats);
    }

    /**
     * 获取日志文件列表
     */
    @GetMapping("/files")
    public ApiResponse<List<Map<String, Object>>> getLogFiles() {
        logger.info("获取日志文件列表");
        List<Map<String, Object>> fileList = new ArrayList<>();

        try {
            File logDir = new File(logPath);
            if (!logDir.exists()) {
                return ApiResponse.error("日志目录不存在");
            }

            File[] files = logDir.listFiles((dir, name) -> name.endsWith(".log"));
            if (files != null) {
                for (File file : files) {
                    Map<String, Object> fileInfo = new HashMap<>();
                    fileInfo.put("name", file.getName());
                    fileInfo.put("size", file.length());
                    fileInfo.put("sizeFormatted", formatFileSize(file.length()));
                    fileInfo.put("lastModified", new Date(file.lastModified()));
                    fileList.add(fileInfo);
                }
            }

            // 按修改时间倒序
            fileList.sort((a, b) -> ((Date) b.get("lastModified")).compareTo((Date) a.get("lastModified")));

        } catch (Exception e) {
            logger.error("获取日志文件列表失败", e);
            return ApiResponse.error("获取日志文件列表失败: " + e.getMessage());
        }

        return ApiResponse.success(fileList);
    }

    /**
     * 查看日志内容（支持分页）
     */
    @GetMapping("/content/{fileName}")
    public ApiResponse<Map<String, Object>> getLogContent(
            @PathVariable String fileName,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int pageSize,
            @RequestParam(required = false) String keyword) {

        logger.info("查看日志内容: {}, page: {}, pageSize: {}", fileName, page, pageSize);

        // 安全检查：防止目录遍历攻击
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ApiResponse.error("非法文件名");
        }

        Map<String, Object> result = new HashMap<>();
        List<String> lines = new ArrayList<>();

        try {
            File logFile = new File(logPath, fileName);
            if (!logFile.exists()) {
                return ApiResponse.error("日志文件不存在");
            }

            // 读取文件内容
            List<String> allLines = Files.readAllLines(logFile.toPath());

            // 关键词过滤
            if (keyword != null && !keyword.isEmpty()) {
                allLines.removeIf(line -> !line.toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT)));
            }

            // 分页
            int totalLines = allLines.size();
            int totalPages = (int) Math.ceil((double) totalLines / pageSize);
            int start = (page - 1) * pageSize;
            int end = Math.min(start + pageSize, totalLines);

            if (start < totalLines) {
                lines = allLines.subList(start, end);
            }

            result.put("fileName", fileName);
            result.put("totalLines", totalLines);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            result.put("pageSize", pageSize);
            result.put("lines", lines);

        } catch (Exception e) {
            logger.error("读取日志文件失败", e);
            return ApiResponse.error("读取日志文件失败: " + e.getMessage());
        }

        return ApiResponse.success(result);
    }

    /**
     * 获取日志文件最后N行（类似tail命令）
     */
    @GetMapping("/tail/{fileName}")
    public ApiResponse<List<String>> tailLog(
            @PathVariable String fileName,
            @RequestParam(defaultValue = "50") int lines) {

        logger.info("查看日志尾部: {}, lines: {}", fileName, lines);

        // 安全检查
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ApiResponse.error("非法文件名");
        }

        List<String> result = new ArrayList<>();

        try {
            File logFile = new File(logPath, fileName);
            if (!logFile.exists()) {
                return ApiResponse.error("日志文件不存在");
            }

            // 使用RandomAccessFile从后向前读取
            try (RandomAccessFile raf = new RandomAccessFile(logFile, "r")) {
                long fileLength = raf.length();
                long pos = fileLength - 1;
                int lineCount = 0;
                StringBuilder line = new StringBuilder();

                while (pos >= 0 && lineCount < lines) {
                    raf.seek(pos);
                    int c = raf.read();

                    if (c == '\n') {
                        if (line.length() > 0) {
                            result.add(0, line.reverse().toString());
                            lineCount++;
                            line = new StringBuilder();
                        }
                    } else if (c != '\r') {
                        line.append((char) c);
                    }

                    pos--;
                }

                // 添加最后一行
                if (line.length() > 0 && lineCount < lines) {
                    result.add(0, line.reverse().toString());
                }
            }

        } catch (Exception e) {
            logger.error("读取日志尾部失败", e);
            return ApiResponse.error("读取日志尾部失败: " + e.getMessage());
        }

        return ApiResponse.success(result);
    }

    /**
     * 下载日志文件
     */
    @GetMapping("/download/{fileName}")
    public byte[] downloadLog(@PathVariable String fileName) {
        logger.info("下载日志文件: {}", fileName);

        // 安全检查
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new BusinessException(ErrorCode.FILE_NAME_INVALID);
        }

        try {
            File logFile = new File(logPath, fileName);
            if (!logFile.exists()) {
                throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
            }

            return Files.readAllBytes(logFile.toPath());

        } catch (Exception e) {
            logger.error("下载日志文件失败", e);
            throw new BusinessException(ErrorCode.FILE_DOWNLOAD_ERROR);
        }
    }

    /**
     * 清理日志文件（仅清理归档文件）
     */
    @PostMapping("/cleanup")
    public ApiResponse<String> cleanupLogs(@RequestParam(defaultValue = "7") int keepDays) {
        logger.info("清理日志文件，保留 {} 天", keepDays);

        try {
            File archiveDir = new File(logPath, "archive");
            if (!archiveDir.exists()) {
                return ApiResponse.success("归档目录不存在，无需清理");
            }

            long cutoffTime = System.currentTimeMillis() - (keepDays * 24 * 60 * 60 * 1000L);
            int deletedCount = 0;

            File[] files = archiveDir.listFiles((dir, name) -> name.endsWith(".log"));
            if (files != null) {
                for (File file : files) {
                    if (file.lastModified() < cutoffTime) {
                        if (file.delete()) {
                            deletedCount++;
                            logger.info("删除过期日志文件: {}", file.getName());
                        }
                    }
                }
            }

            return ApiResponse.success("清理完成，删除 " + deletedCount + " 个文件");

        } catch (Exception e) {
            logger.error("清理日志文件失败", e);
            return ApiResponse.error("清理日志文件失败: " + e.getMessage());
        }
    }

    /**
     * 搜索日志（跨文件搜索）
     */
    @GetMapping("/search")
    public ApiResponse<List<Map<String, Object>>> searchLogs(
            @RequestParam String keyword,
            @RequestParam(required = false) String filePattern) {

        logger.info("搜索日志，关键词: {}, 文件模式: {}", keyword, filePattern);

        List<Map<String, Object>> results = new ArrayList<>();

        try {
            File logDir = new File(logPath);
            if (!logDir.exists()) {
                return ApiResponse.error("日志目录不存在");
            }

            File[] files;
            if (filePattern != null && !filePattern.isEmpty()) {
                files = logDir.listFiles((dir, name) -> name.contains(filePattern) && name.endsWith(".log"));
            } else {
                files = logDir.listFiles((dir, name) -> name.endsWith(".log"));
            }

            if (files != null) {
                for (File file : files) {
                    List<String> lines = Files.readAllLines(file.toPath());
                    int lineNum = 0;
                    for (String line : lines) {
                        lineNum++;
                        if (line.toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT))) {
                            Map<String, Object> match = new HashMap<>();
                            match.put("fileName", file.getName());
                            match.put("lineNumber", lineNum);
                            match.put("content", line);
                            results.add(match);

                            // 限制结果数量
                            if (results.size() >= 100) {
                                break;
                            }
                        }
                    }
                    if (results.size() >= 100) {
                        break;
                    }
                }
            }

        } catch (Exception e) {
            logger.error("搜索日志失败", e);
            return ApiResponse.error("搜索日志失败: " + e.getMessage());
        }

        return ApiResponse.success(results);
    }

    /**
     * 格式化文件大小
     */
    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.2f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024) return String.format("%.2f MB", size / 1024.0 / 1024.0);
        return String.format("%.2f GB", size / 1024.0 / 1024.0 / 1024.0);
    }
}
