package com.backend.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DEFAULT_FORMATTER);
    }
    
    public static String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }
    
    public static LocalDateTime parse(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateString, DEFAULT_FORMATTER);
    }
    
    public static LocalDateTime parse(String dateString, String pattern) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateString, DateTimeFormatter.ofPattern(pattern));
    }
    
    public static boolean isBefore(LocalDateTime date1, LocalDateTime date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        return date1.isBefore(date2);
    }
    
    public static boolean isAfter(LocalDateTime date1, LocalDateTime date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        return date1.isAfter(date2);
    }
    
    public static boolean isBetween(LocalDateTime date, LocalDateTime start, LocalDateTime end) {
        if (date == null || start == null || end == null) {
            return false;
        }
        return !date.isBefore(start) && !date.isAfter(end);
    }
    
    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
    
    public static LocalDateTime plusDays(LocalDateTime date, long days) {
        if (date == null) {
            return null;
        }
        return date.plusDays(days);
    }
    
    public static LocalDateTime minusDays(LocalDateTime date, long days) {
        if (date == null) {
            return null;
        }
        return date.minusDays(days);
    }
}