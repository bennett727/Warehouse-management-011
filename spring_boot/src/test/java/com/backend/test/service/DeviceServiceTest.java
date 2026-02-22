package com.backend.test.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.repository.DeviceRepository;
import com.backend.service.impl.DeviceServiceImpl;

/**
 * Device Service Test
 *
 * Tests business logic for Device operations
 */
@ExtendWith(MockitoExtension.class)
class DeviceServiceTest {

    @Mock
    private DeviceRepository deviceRepository;

    @InjectMocks
    private DeviceServiceImpl deviceService;

    private Device testDevice;

    @BeforeEach
    void setUp() {
        testDevice = new Device();
        testDevice.setId(1L);
        testDevice.setDeviceCode("TEST001");
        testDevice.setDeviceName("Test Device");
        testDevice.setStatus(DeviceStatus.IN_STOCK.getCode());
        testDevice.setCreateTime(LocalDateTime.now());
        testDevice.setUpdateTime(LocalDateTime.now());
    }

    @Test
    void shouldGetDeviceById() {
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(testDevice));

        Device result = deviceService.getDeviceById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getDeviceCode()).isEqualTo("TEST001");
    }

    @Test
    void shouldDeleteDevice() {
        when(deviceRepository.findById(1L)).thenReturn(Optional.of(testDevice));
        doNothing().when(deviceRepository).deleteById(1L);

        deviceService.deleteDevice(1L);

        verify(deviceRepository).deleteById(1L);
    }

    @Test
    void shouldCheckDeviceCodeExists() {
        when(deviceRepository.existsByDeviceCode("TEST001")).thenReturn(true);

        boolean exists = deviceService.existsByDeviceCode("TEST001");

        assertThat(exists).isTrue();
    }
}
