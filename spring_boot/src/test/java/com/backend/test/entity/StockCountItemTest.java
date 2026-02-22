package com.backend.test.entity;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.backend.entity.StockCountItem;

@DisplayName("盘点明细实体测试")
class StockCountItemTest {

    private StockCountItem item;

    @BeforeEach
    void setUp() {
        item = new StockCountItem();
        item.setId(1L);
        item.setStockCountId(100L);
        item.setDeviceId(10L);
        item.setDeviceCode("DEV001");
        item.setDeviceName("测试设备");
        item.setBinId(20L);
        item.setBinCode("BIN-A-01");
    }

    @Test
    @DisplayName("应正确计算盘盈差异")
    void shouldCalculateSurplusDifference() {
        item.setBookQuantity(10);
        item.setActualQuantity(12);
        
        item.calculateDifference();
        
        assertThat(item.getDifference()).isEqualTo(2);
        assertThat(item.getDifferenceType()).isEqualTo(1);
    }

    @Test
    @DisplayName("应正确计算盘亏差异")
    void shouldCalculateLossDifference() {
        item.setBookQuantity(10);
        item.setActualQuantity(8);
        
        item.calculateDifference();
        
        assertThat(item.getDifference()).isEqualTo(-2);
        assertThat(item.getDifferenceType()).isEqualTo(2);
    }

    @Test
    @DisplayName("应正确处理无差异情况")
    void shouldCalculateNoDifference() {
        item.setBookQuantity(10);
        item.setActualQuantity(10);
        
        item.calculateDifference();
        
        assertThat(item.getDifference()).isEqualTo(0);
        assertThat(item.getDifferenceType()).isEqualTo(0);
    }

    @Test
    @DisplayName("当实际数量为空时不应计算差异")
    void shouldNotCalculateWhenActualIsNull() {
        item.setBookQuantity(10);
        item.setActualQuantity(null);
        
        item.calculateDifference();
        
        assertThat(item.getDifference()).isNull();
        assertThat(item.getDifferenceType()).isEqualTo(0);
    }

    @Test
    @DisplayName("应正确判断是否已盘点")
    void shouldCheckIfCounted() {
        item.setActualQuantity(null);
        item.setStatus(0);
        assertThat(item.isCounted()).isFalse();
        
        item.setActualQuantity(10);
        item.setStatus(1);
        assertThat(item.isCounted()).isTrue();
        
        item.setStatus(2);
        assertThat(item.isCounted()).isTrue();
    }

    @Test
    @DisplayName("应正确判断是否存在差异")
    void shouldCheckIfHasDifference() {
        item.setDifference(null);
        assertThat(item.hasDifference()).isFalse();
        
        item.setDifference(0);
        assertThat(item.hasDifference()).isFalse();
        
        item.setDifference(5);
        assertThat(item.hasDifference()).isTrue();
        
        item.setDifference(-3);
        assertThat(item.hasDifference()).isTrue();
    }

    @Test
    @DisplayName("应正确设置和获取基本属性")
    void shouldSetAndGetBasicProperties() {
        item.setBookQuantity(100);
        item.setActualQuantity(98);
        item.setDifferenceReason("设备损坏");
        item.setStatus(1);
        item.setCounterId(5L);
        item.setCounterName("张三");
        item.setCountTime(LocalDateTime.now());
        item.setRemark("测试备注");

        assertThat(item.getBookQuantity()).isEqualTo(100);
        assertThat(item.getActualQuantity()).isEqualTo(98);
        assertThat(item.getDifferenceReason()).isEqualTo("设备损坏");
        assertThat(item.getStatus()).isEqualTo(1);
        assertThat(item.getCounterId()).isEqualTo(5L);
        assertThat(item.getCounterName()).isEqualTo("张三");
        assertThat(item.getCountTime()).isNotNull();
        assertThat(item.getRemark()).isEqualTo("测试备注");
    }

    @Test
    @DisplayName("默认值应正确设置")
    void shouldHaveCorrectDefaultValues() {
        StockCountItem newItem = new StockCountItem();
        
        assertThat(newItem.getBookQuantity()).isEqualTo(0);
        assertThat(newItem.getDifferenceType()).isEqualTo(0);
        assertThat(newItem.getStatus()).isEqualTo(0);
    }
}
