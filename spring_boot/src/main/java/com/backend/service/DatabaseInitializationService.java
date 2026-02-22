package com.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.Area;
import com.backend.entity.AreaType;
import com.backend.entity.Bin;
import com.backend.entity.Device;
import com.backend.entity.DeviceType;
import com.backend.entity.InstallationRecord;
import com.backend.entity.MaintenanceRecord;
import com.backend.entity.RepairRecord;
import com.backend.entity.ScrapRecord;
import com.backend.entity.StockOrder;
import com.backend.entity.StockOrderItem;
import com.backend.entity.Supplier;
import com.backend.entity.User;
import com.backend.entity.Warehouse;
import com.backend.entity.Role;
import com.backend.enums.DeviceStatus;
import com.backend.enums.StockOrderStatus;
import com.backend.enums.UserRole;
import com.backend.repository.AreaRepository;
import com.backend.repository.AreaTypeRepository;
import com.backend.repository.BinRepository;
import com.backend.repository.DeviceRepository;
import com.backend.repository.DeviceTypeRepository;
import com.backend.repository.InstallationRecordRepository;
import com.backend.repository.MaintenanceRecordRepository;
import com.backend.repository.RepairRecordRepository;
import com.backend.repository.RoleRepository;
import com.backend.repository.ScrapRecordRepository;
import com.backend.repository.StockOrderItemRepository;
import com.backend.repository.StockOrderRepository;
import com.backend.repository.SupplierRepository;
import com.backend.repository.UserRepository;
import com.backend.repository.WarehouseRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 数据库初始化服务
 *
 * 功能说明：
 * 在应用启动时自动初始化数据库基础数据，包括：
 * 1. 系统用户和角色
 * 2. 设备类型
 * 3. 仓库和区域
 * 4. 库位
 * 5. 供应商
 * 6. 示例设备
 * 7. 示例业务记录
 *
 * @author 开发团队
 * @version 1.0.0
 * @since 2026-02-13
 */
@Slf4j
@Service
@Order(100)
@RequiredArgsConstructor
public class DatabaseInitializationService implements ApplicationRunner {

    @Value("${app.data.initialize:true}")
    private boolean initializeData;

    @Value("${app.initialization.skip-core:false}")
    private boolean skipCoreData;

    @Value("${app.initialization.skip-business:false}")
    private boolean skipBusinessData;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final WarehouseRepository warehouseRepository;
    private final AreaTypeRepository areaTypeRepository;
    private final AreaRepository areaRepository;
    private final BinRepository binRepository;
    private final SupplierRepository supplierRepository;
    private final DeviceRepository deviceRepository;
    private final StockOrderRepository stockOrderRepository;
    private final StockOrderItemRepository stockOrderItemRepository;
    private final InstallationRecordRepository installationRecordRepository;
    private final RepairRecordRepository repairRecordRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final ScrapRecordRepository scrapRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void run(ApplicationArguments args) throws Exception {
        if (!initializeData) {
            log.info("数据库初始化已禁用，跳过初始化");
            return;
        }

        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║          数据库初始化开始                                  ║");
        log.info("╚════════════════════════════════════════════════════════════╝");

        long startTime = System.currentTimeMillis();

        try {
            if (!skipCoreData) {
                initializeCoreData();
            } else {
                log.info("核心数据初始化已跳过");
            }

            if (!skipBusinessData) {
                initializeBusinessData();
            } else {
                log.info("业务数据初始化已跳过");
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("╔════════════════════════════════════════════════════════════╗");
            log.info("║          数据库初始化完成，耗时: {}ms                      ║", duration);
            log.info("╚════════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            log.error("数据库初始化失败", e);
            throw e;
        }
    }

    private void initializeCoreData() {
        log.info("开始初始化核心数据...");

        initializeUsers();
        initializeDeviceTypes();
        initializeWarehouses();
        initializeAreaTypes();
        initializeAreas();
        initializeBins();
        initializeSuppliers();

        log.info("核心数据初始化完成");
    }

    private void initializeBusinessData() {
        log.info("开始初始化业务数据...");

        initializeDevices();
        initializeStockOrders();
        initializeInstallationRecords();
        initializeRepairRecords();
        initializeMaintenanceRecords();
        initializeScrapRecords();

        log.info("业务数据初始化完成");
    }

    private void initializeUsers() {
        log.info("初始化用户数据...");

        if (userRepository.count() > 0) {
            log.info("用户数据已存在，跳过初始化");
            return;
        }

        List<Role> roles = new ArrayList<>();

        Role adminRole = new Role();
        adminRole.setRoleName("管理员");
        adminRole.setRoleCode("ADMIN");
        adminRole.setDescription("系统管理员角色");
        adminRole.setStatus(1);
        adminRole.setCreateTime(LocalDateTime.now());
        adminRole.setUpdateTime(LocalDateTime.now());
        roles.add(adminRole);

        Role operatorRole = new Role();
        operatorRole.setRoleName("操作员");
        operatorRole.setRoleCode("OPERATOR");
        operatorRole.setDescription("操作员角色");
        operatorRole.setStatus(1);
        operatorRole.setCreateTime(LocalDateTime.now());
        operatorRole.setUpdateTime(LocalDateTime.now());
        roles.add(operatorRole);

        Role technicianRole = new Role();
        technicianRole.setRoleName("技术员");
        technicianRole.setRoleCode("TECHNICIAN");
        technicianRole.setDescription("技术员角色");
        technicianRole.setStatus(1);
        technicianRole.setCreateTime(LocalDateTime.now());
        technicianRole.setUpdateTime(LocalDateTime.now());
        roles.add(technicianRole);

        roles = roleRepository.saveAll(roles);
        roleRepository.flush();
        log.info("角色数据已保存，共 {} 个角色", roles.size());

        String defaultPassword = passwordEncoder.encode("123456");
        log.info("默认密码已加密");

        List<User> users = new ArrayList<>();

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(defaultPassword);
        admin.setRealName("系统管理员");
        admin.setEmail("admin@warehouse.com");
        admin.setPhone("13800138000");
        admin.setStatus(1);
        admin.setCreateTime(LocalDateTime.now());
        admin.setUpdateTime(LocalDateTime.now());
        admin.addRole(roles.get(0));
        users.add(admin);

        User operator = new User();
        operator.setUsername("operator");
        operator.setPassword(defaultPassword);
        operator.setRealName("操作员");
        operator.setEmail("operator@warehouse.com");
        operator.setPhone("13800138001");
        operator.setStatus(1);
        operator.setCreateTime(LocalDateTime.now());
        operator.setUpdateTime(LocalDateTime.now());
        operator.addRole(roles.get(1));
        users.add(operator);

        User technician = new User();
        technician.setUsername("technician");
        technician.setPassword(defaultPassword);
        technician.setRealName("技术员");
        technician.setEmail("technician@warehouse.com");
        technician.setPhone("13800138002");
        technician.setStatus(1);
        technician.setCreateTime(LocalDateTime.now());
        technician.setUpdateTime(LocalDateTime.now());
        technician.addRole(roles.get(2));
        users.add(technician);

        userRepository.saveAll(users);
        log.info("用户数据初始化完成，共 {} 个用户，默认密码: 123456", users.size());
    }

    private void initializeDeviceTypes() {
        log.info("初始化设备类型...");

        if (deviceTypeRepository.count() > 0) {
            log.info("设备类型数据已存在，跳过初始化");
            return;
        }

        List<DeviceType> deviceTypes = new ArrayList<>();

        DeviceType server = new DeviceType();
        server.setTypeCode("SERVER");
        server.setTypeName("服务器");
        server.setDescription("各类服务器设备");
        server.setStatus(1);
        server.setCreateTime(LocalDateTime.now());
        server.setUpdateTime(LocalDateTime.now());
        deviceTypes.add(server);

        DeviceType network = new DeviceType();
        network.setTypeCode("NETWORK");
        network.setTypeName("网络设备");
        network.setDescription("交换机、路由器等网络设备");
        network.setStatus(1);
        network.setCreateTime(LocalDateTime.now());
        network.setUpdateTime(LocalDateTime.now());
        deviceTypes.add(network);

        DeviceType storage = new DeviceType();
        storage.setTypeCode("STORAGE");
        storage.setTypeName("存储设备");
        storage.setDescription("磁盘阵列、NAS等存储设备");
        storage.setStatus(1);
        storage.setCreateTime(LocalDateTime.now());
        storage.setUpdateTime(LocalDateTime.now());
        deviceTypes.add(storage);

        DeviceType computer = new DeviceType();
        computer.setTypeCode("COMPUTER");
        computer.setTypeName("计算机");
        computer.setDescription("台式机、笔记本等计算机设备");
        computer.setStatus(1);
        computer.setCreateTime(LocalDateTime.now());
        computer.setUpdateTime(LocalDateTime.now());
        deviceTypes.add(computer);

        DeviceType peripheral = new DeviceType();
        peripheral.setTypeCode("PERIPHERAL");
        peripheral.setTypeName("外设");
        peripheral.setDescription("打印机、扫描仪等外设");
        peripheral.setStatus(1);
        peripheral.setCreateTime(LocalDateTime.now());
        peripheral.setUpdateTime(LocalDateTime.now());
        deviceTypes.add(peripheral);

        deviceTypeRepository.saveAll(deviceTypes);
        log.info("设备类型初始化完成，共 {} 个类型", deviceTypes.size());
    }

    private void initializeWarehouses() {
        log.info("初始化仓库数据...");

        if (warehouseRepository.count() > 0) {
            log.info("仓库数据已存在，跳过初始化");
            return;
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseCode("WH001");
        warehouse.setWarehouseName("主仓库");
        warehouse.setAddress("北京市朝阳区科技园区");
        warehouse.setContactPerson("张三");
        warehouse.setContactPhone("010-12345678");
        warehouse.setStatus(1);
        warehouse.setCreateTime(LocalDateTime.now());
        warehouse.setUpdateTime(LocalDateTime.now());

        warehouseRepository.save(warehouse);
        log.info("仓库数据初始化完成");
    }

    private void initializeAreaTypes() {
        log.info("初始化区域类型...");

        if (areaTypeRepository.count() > 0) {
            log.info("区域类型数据已存在，跳过初始化");
            return;
        }

        List<AreaType> areaTypes = new ArrayList<>();

        AreaType serverRoom = new AreaType();
        serverRoom.setCode("SERVER_ROOM");
        serverRoom.setName("服务器机房");
        serverRoom.setDescription("存放服务器设备的专用机房");
        serverRoom.setStatus(1);
        serverRoom.setCreateTime(LocalDateTime.now());
        serverRoom.setUpdateTime(LocalDateTime.now());
        areaTypes.add(serverRoom);

        AreaType networkRoom = new AreaType();
        networkRoom.setCode("NETWORK_ROOM");
        networkRoom.setName("网络机房");
        networkRoom.setDescription("存放网络设备的专用机房");
        networkRoom.setStatus(1);
        networkRoom.setCreateTime(LocalDateTime.now());
        networkRoom.setUpdateTime(LocalDateTime.now());
        areaTypes.add(networkRoom);

        AreaType storageArea = new AreaType();
        storageArea.setCode("STORAGE_AREA");
        storageArea.setName("存储区");
        storageArea.setDescription("存放存储设备的区域");
        storageArea.setStatus(1);
        storageArea.setCreateTime(LocalDateTime.now());
        storageArea.setUpdateTime(LocalDateTime.now());
        areaTypes.add(storageArea);

        areaTypeRepository.saveAll(areaTypes);
        log.info("区域类型初始化完成，共 {} 个类型", areaTypes.size());
    }

    private void initializeAreas() {
        log.info("初始化区域数据...");

        if (areaRepository.count() > 0) {
            log.info("区域数据已存在，跳过初始化");
            return;
        }

        Warehouse warehouse = warehouseRepository.findByWarehouseCode("WH001").orElse(null);
        if (warehouse == null) {
            log.warn("仓库不存在，跳过区域初始化");
            return;
        }

        List<Area> areas = new ArrayList<>();

        Area area1 = new Area();
        area1.setCode("A01");
        area1.setName("A区-服务器机房");
        area1.setDescription("主要存放服务器设备");
        area1.setWarehouse(warehouse);
        area1.setWarehouseId(warehouse.getId());
        area1.setStatus(1);
        area1.setCreateTime(LocalDateTime.now());
        area1.setUpdateTime(LocalDateTime.now());
        areas.add(area1);

        Area area2 = new Area();
        area2.setCode("A02");
        area2.setName("A区-网络机房");
        area2.setDescription("主要存放网络设备");
        area2.setWarehouse(warehouse);
        area2.setWarehouseId(warehouse.getId());
        area2.setStatus(1);
        area2.setCreateTime(LocalDateTime.now());
        area2.setUpdateTime(LocalDateTime.now());
        areas.add(area2);

        Area area3 = new Area();
        area3.setCode("B01");
        area3.setName("B区-存储区");
        area3.setDescription("主要存放存储设备");
        area3.setWarehouse(warehouse);
        area3.setWarehouseId(warehouse.getId());
        area3.setStatus(1);
        area3.setCreateTime(LocalDateTime.now());
        area3.setUpdateTime(LocalDateTime.now());
        areas.add(area3);

        areaRepository.saveAll(areas);
        log.info("区域数据初始化完成，共 {} 个区域", areas.size());
    }

    private void initializeBins() {
        log.info("初始化库位数据...");

        if (binRepository.count() > 0) {
            log.info("库位数据已存在，跳过初始化");
            return;
        }

        List<Area> areas = areaRepository.findAll();
        if (areas.isEmpty()) {
            log.warn("区域不存在，跳过库位初始化");
            return;
        }

        List<Bin> bins = new ArrayList<>();

        for (Area area : areas) {
            for (int i = 1; i <= 3; i++) {
                Bin bin = new Bin();
                bin.setCode(area.getCode() + "-" + String.format("%02d", i));
                bin.setName(area.getName() + "-" + i + "号库位");
                bin.setArea(area);
                bin.setAreaId(area.getId());
                bin.setStatus(1);
                bins.add(bin);
            }
        }

        binRepository.saveAll(bins);
        log.info("库位数据初始化完成，共 {} 个库位", bins.size());
    }

    private void initializeSuppliers() {
        log.info("初始化供应商数据...");

        if (supplierRepository.count() > 0) {
            log.info("供应商数据已存在，跳过初始化");
            return;
        }

        List<Supplier> suppliers = new ArrayList<>();

        Supplier supplier1 = new Supplier();
        supplier1.setSupplierCode("SUP001");
        supplier1.setSupplierName("戴尔中国有限公司");
        supplier1.setAddress("北京市海淀区中关村");
        supplier1.setContactPerson("李四");
        supplier1.setPhone("010-87654321");
        supplier1.setEmail("contact@dell.com");
        supplier1.setStatus(1);
        supplier1.setCreateTime(LocalDateTime.now());
        supplier1.setUpdateTime(LocalDateTime.now());
        suppliers.add(supplier1);

        Supplier supplier2 = new Supplier();
        supplier2.setSupplierCode("SUP002");
        supplier2.setSupplierName("华为技术有限公司");
        supplier2.setAddress("深圳市龙岗区坂田");
        supplier2.setContactPerson("王五");
        supplier2.setPhone("0755-12345678");
        supplier2.setEmail("contact@huawei.com");
        supplier2.setStatus(1);
        supplier2.setCreateTime(LocalDateTime.now());
        supplier2.setUpdateTime(LocalDateTime.now());
        suppliers.add(supplier2);

        supplierRepository.saveAll(suppliers);
        log.info("供应商数据初始化完成，共 {} 个供应商", suppliers.size());
    }

    private void initializeDevices() {
        log.info("初始化设备数据...");

        if (deviceRepository.count() > 0) {
            log.info("设备数据已存在，跳过初始化");
            return;
        }

        Warehouse warehouse = warehouseRepository.findByWarehouseCode("WH001").orElse(null);
        DeviceType serverType = deviceTypeRepository.findByTypeCode("SERVER").orElse(null);
        Area area = areaRepository.findByCode("A01").orElse(null);
        Bin bin = binRepository.findByCode("A01-01").orElse(null);

        if (serverType == null || area == null || bin == null) {
            log.warn("基础数据不完整，跳过设备初始化");
            return;
        }

        List<Device> devices = new ArrayList<>();

        for (int i = 1; i <= 10; i++) {
            Device device = new Device();
            device.setDeviceCode("DEV-2024-" + String.format("%03d", i));
            device.setDeviceName("Dell PowerEdge R750服务器-" + i);
            device.setModel("PowerEdge R750");
            device.setSerialNumber("SN" + System.currentTimeMillis() + i);
            device.setDeviceType(serverType);
            device.setTypeId(serverType.getId());
            device.setStatus(DeviceStatus.IN_STOCK.getCode());
            device.setCurrentStock(10);
            device.setMinStock(5);
            device.setMaxStock(20);
            device.setArea(area);
            device.setAreaId(area.getId());
            device.setBin(bin);
            device.setBinId(bin.getId());
            device.setStatus(1);
            device.setCreateTime(LocalDateTime.now());
            device.setUpdateTime(LocalDateTime.now());
            devices.add(device);
        }

        deviceRepository.saveAll(devices);
        log.info("设备数据初始化完成，共 {} 个设备", devices.size());
    }

    private void initializeStockOrders() {
        log.info("初始化出入库单数据...");

        if (stockOrderRepository.count() > 0) {
            log.info("出入库单数据已存在，跳过初始化");
            return;
        }

        User operator = userRepository.findByUsername("operator").orElse(null);
        List<Device> devices = deviceRepository.findAll();

        if (operator == null || devices.isEmpty()) {
            log.warn("基础数据不完整，跳过出入库单初始化");
            return;
        }

        Device device = devices.get(0);

        StockOrder outboundOrder = new StockOrder();
        outboundOrder.setOrderNo("OUT20240101001");
        outboundOrder.setOrderType(1);
        outboundOrder.setStatus(StockOrderStatus.COMPLETED.getCode());
        outboundOrder.setOperatorName(operator.getRealName());
        outboundOrder.setOperatorId(operator.getId());
        outboundOrder.setRemark("测试出库单");
        outboundOrder.setCreateTime(LocalDateTime.now());
        outboundOrder.setUpdateTime(LocalDateTime.now());
        stockOrderRepository.save(outboundOrder);

        StockOrderItem item = new StockOrderItem();
        item.setDevice(device);
        item.setDeviceId(device.getId());
        item.setQuantity(1);
        item.setActualQuantity(1);
        item.setRemark("测试出库项");
        item.setCreateTime(LocalDateTime.now());
        item.setUpdateTime(LocalDateTime.now());
        stockOrderItemRepository.save(item);

        log.info("出入库单数据初始化完成");
    }

    private void initializeInstallationRecords() {
        log.info("初始化安装记录数据...");

        if (installationRecordRepository.count() > 0) {
            log.info("安装记录数据已存在，跳过初始化");
            return;
        }

        List<Device> devices = deviceRepository.findAll();
        StockOrder order = stockOrderRepository.findByOrderNo("OUT20240101001").orElse(null);

        if (devices.isEmpty() || order == null) {
            log.warn("基础数据不完整，跳过安装记录初始化");
            return;
        }

        Device device = devices.get(0);

        InstallationRecord record = new InstallationRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());
        record.setInstallNo("INS20240101001");
        record.setInstallDate(LocalDateTime.now().toLocalDate());
        record.setInstallerName("技术员");
        record.setInstallLocation("客户现场");
        record.setStatus(1);
        record.setSourceOrderNo(order.getOrderNo());
        record.setSourceOrderId(order.getId());
        record.setRemark("测试安装记录");
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        installationRecordRepository.save(record);
        log.info("安装记录数据初始化完成");
    }

    private void initializeRepairRecords() {
        log.info("初始化维修记录数据...");

        if (repairRecordRepository.count() > 0) {
            log.info("维修记录数据已存在，跳过初始化");
            return;
        }

        List<Device> devices = deviceRepository.findAll();

        if (devices.isEmpty()) {
            log.warn("基础数据不完整，跳过维修记录初始化");
            return;
        }

        Device device = devices.get(0);

        RepairRecord record = new RepairRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());
        record.setRepairNo("REP20240101001");
        record.setRepairDate(LocalDateTime.now().toLocalDate());
        record.setRepairPerson("技术员");
        record.setFaultDescription("电源故障");
        record.setStatus(1);
        record.setRemark("测试维修记录");
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        repairRecordRepository.save(record);
        log.info("维修记录数据初始化完成");
    }

    private void initializeMaintenanceRecords() {
        log.info("初始化保养记录数据...");

        if (maintenanceRecordRepository.count() > 0) {
            log.info("保养记录数据已存在，跳过初始化");
            return;
        }

        List<Device> devices = deviceRepository.findAll();

        if (devices.isEmpty()) {
            log.warn("基础数据不完整，跳过保养记录初始化");
            return;
        }

        Device device = devices.get(0);

        MaintenanceRecord record = new MaintenanceRecord();
        record.setDevice(device);
        record.setDeviceId(device.getId());
        record.setDeviceCode(device.getDeviceCode());
        record.setDeviceName(device.getDeviceName());
        record.setMaintenanceNo("BY20240101001");
        record.setMaintenanceDate(LocalDateTime.now().toLocalDate());
        record.setMaintenanceType(2);
        record.setStatus(1);
        record.setRemark("测试保养记录");
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());

        maintenanceRecordRepository.save(record);
        log.info("保养记录数据初始化完成");
    }

    private void initializeScrapRecords() {
        log.info("初始化报废记录数据...");

        if (scrapRecordRepository.count() > 0) {
            log.info("报废记录数据已存在，跳过初始化");
            return;
        }

        log.info("报废记录数据初始化完成");
    }
}
