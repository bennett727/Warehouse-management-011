package com.backend.test.repository;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.backend.entity.Device;
import com.backend.enums.DeviceStatus;
import com.backend.repository.DeviceRepository;

/**
 * Device Repository Test
 *
 * Tests CRUD operations and query methods for Device entity
 */
@DataJpaTest
@ActiveProfiles("test")
class DeviceRepositoryTest {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private TestEntityManager testEntityManager;

    private Device testDevice;

    @BeforeEach
    void setUp() {
        testDevice = new Device();
        testDevice.setDeviceCode("TEST001");
        testDevice.setDeviceName("Test Device");
        testDevice.setStatus(DeviceStatus.IN_STOCK.getCode());
        testDevice.setCreateTime(LocalDateTime.now());
        testDevice.setUpdateTime(LocalDateTime.now());
        testEntityManager.persist(testDevice);
        testEntityManager.flush();
    }

    @AfterEach
    void tearDown() {
        deviceRepository.deleteAll();
    }

    @Test
    void shouldSaveDevice() {
        Device newDevice = new Device();
        newDevice.setDeviceCode("NEW001");
        newDevice.setDeviceName("New Device");
        newDevice.setStatus(DeviceStatus.IN_STOCK.getCode());
        newDevice.setCreateTime(LocalDateTime.now());
        newDevice.setUpdateTime(LocalDateTime.now());

        Device saved = deviceRepository.save(newDevice);

        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getDeviceCode()).isEqualTo("NEW001");
    }

    @Test
    void shouldFindDeviceById() {
        Optional<Device> found = deviceRepository.findById(testDevice.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getDeviceCode()).isEqualTo("TEST001");
    }

    @Test
    void shouldUpdateDevice() {
        testDevice.setDeviceName("Updated Name");
        testDevice.setUpdateTime(LocalDateTime.now());

        Device updated = deviceRepository.save(testDevice);

        assertThat(updated.getDeviceName()).isEqualTo("Updated Name");
    }

    @Test
    void shouldDeleteDevice() {
        deviceRepository.delete(testDevice);
        testEntityManager.flush();

        Optional<Device> found = deviceRepository.findById(testDevice.getId());
        assertThat(found).isEmpty();
    }

    @Test
    void shouldFindByStatus() {
        List<Device> devices = deviceRepository.findByStatus(DeviceStatus.IN_STOCK.getCode());

        assertThat(devices).hasSize(1);
        assertThat(devices.get(0).getDeviceCode()).isEqualTo("TEST001");
    }

    @Test
    void shouldCheckDeviceCodeExists() {
        boolean exists = deviceRepository.existsByDeviceCode("TEST001");
        boolean notExists = deviceRepository.existsByDeviceCode("NONEXISTENT");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }
}
