package com.backend.test.entity;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.backend.entity.StockTransferItem;

@DisplayName("调拨明细实体测试")
class StockTransferItemTest {

    private StockTransferItem item;

    @BeforeEach
    void setUp() {
        item = new StockTransferItem();
        item.setId(1L);
        item.setTransferId(100L);
        item.setDeviceId(10L);
        item.setDeviceCode("DEV001");
        item.setDeviceName("测试设备");
        item.setSourceBinId(20L);
        item.setSourceBinCode("BIN-A-01");
        item.setTargetBinId(30L);
        item.setTargetBinCode("BIN-B-02");
    }

    @Test
    @DisplayName("应正确判断是否已调拨")
    void shouldCheckIfTransferred() {
        item.setStatus(0);
        assertThat(item.isTransferred()).isFalse();
        
        item.setStatus(1);
        assertThat(item.isTransferred()).isTrue();
        
        item.setStatus(2);
        assertThat(item.isTransferred()).isTrue();
    }

    @Test
    @DisplayName("应正确设置和获取基本属性")
    void shouldSetAndGetBasicProperties() {
        item.setQuantity(5);
        item.setStatus(1);
        item.setTransferTime(LocalDateTime.now());
        item.setRemark("测试调拨");

        assertThat(item.getQuantity()).isEqualTo(5);
        assertThat(item.getStatus()).isEqualTo(1);
        assertThat(item.getTransferTime()).isNotNull();
        assertThat(item.getRemark()).isEqualTo("测试调拨");
    }

    @Test
    @DisplayName("默认值应正确设置")
    void shouldHaveCorrectDefaultValues() {
        StockTransferItem newItem = new StockTransferItem();
        
        assertThat(newItem.getQuantity()).isEqualTo(1);
        assertThat(newItem.getStatus()).isEqualTo(0);
    }

    @Test
    @DisplayName("应正确处理空状态判断")
    void shouldHandleNullStatus() {
        item.setStatus(null);
        assertThat(item.isTransferred()).isFalse();
    }

    @Test
    @DisplayName("应正确设置源货位和目标货位")
    void shouldSetSourceAndTargetBin() {
        assertThat(item.getSourceBinId()).isEqualTo(20L);
        assertThat(item.getSourceBinCode()).isEqualTo("BIN-A-01");
        assertThat(item.getTargetBinId()).isEqualTo(30L);
        assertThat(item.getTargetBinCode()).isEqualTo("BIN-B-02");
    }

    @Test
    @DisplayName("应正确设置设备信息")
    void shouldSetDeviceInfo() {
        assertThat(item.getDeviceId()).isEqualTo(10L);
        assertThat(item.getDeviceCode()).isEqualTo("DEV001");
        assertThat(item.getDeviceName()).isEqualTo("测试设备");
    }
}
