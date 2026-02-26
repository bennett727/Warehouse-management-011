# 生产环境监控配置指南

## 📊 监控体系架构

本系统采用多层次监控体系，涵盖前端性能监控、后端指标监控、日志监控和告警通知。

## 1. 前端性能监控

### 1.1 已集成功能

前端性能监控已集成在 [performanceMonitor.js](../../frontend/src/utils/performanceMonitor.js)，自动监控以下指标：

- **Web Vitals**: LCP、FID、CLS、FCP
- **导航计时**: DNS查询、TCP连接、TTFB、DOM解析、资源加载
- **API性能**: 接口响应时间、成功率
- **长任务**: JavaScript执行超过50ms的任务
- **内存使用**: JS堆内存使用情况

### 1.2 生产环境配置

在 [main.js](../../frontend/src/main.js) 中已配置：

```javascript
if (import.meta.env.PROD) {
  initPerformanceMonitor({
    enabled: true,
    reportUrl: '/performance-report',
    batchSize: 5,
    reportInterval: 30000,
  });
}
```

### 1.3 性能指标上报

性能数据会上报到后端 `/api/performance-report` 接口，存储在数据库中。

## 2. 后端监控

### 2.1 Prometheus + Grafana 监控

后端已集成 Micrometer + Prometheus 指标导出：

**配置位置**: [MetricsConfig.java](../../spring_boot/src/main/java/com/backend/config/MetricsConfig.java)

**监控指标**:
- HTTP请求指标（响应时间、请求次数、错误率）
- JVM指标（内存、GC、线程）
- 数据库连接池指标
- 自定义业务指标

### 2.2 访问端点

```
# Prometheus指标
GET /api/actuator/prometheus

# 健康检查
GET /api/actuator/health

# 应用信息
GET /api/actuator/info

# 所有指标
GET /api/actuator/metrics
```

### 2.3 生产环境配置

在 [application-prod.properties](../../spring_boot/src/main/resources/application-prod.properties) 中已配置：

```properties
# Actuator配置
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized
management.prometheus.metrics.export.enabled=true
management.metrics.tags.application=warehouse-management-system

# Tomcat访问日志
server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.directory=/var/log/wms/tomcat
server.tomcat.accesslog.pattern=combined
```

## 3. 日志监控

### 3.1 日志配置

**后端日志**: [application-prod.properties](../../spring_boot/src/main/resources/application-prod.properties)

```properties
logging.file.path=/var/log/wms
logging.level.root=WARN
logging.level.com.backend=INFO
```

**前端日志**: 使用 [logger.js](../../frontend/src/utils/logger.js) 统一记录

### 3.2 日志收集建议

生产环境建议使用 ELK Stack 或 Loki 收集日志：

```yaml
# docker-compose.yml 示例
version: '3'
services:
  elasticsearch:
    image: elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
  
  logstash:
    image: logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
  
  kibana:
    image: kibana:8.0.0
    ports:
      - "5601:5601"
```

## 4. 告警配置

### 4.1 告警规则

**配置位置**: [application-prod.properties](../../spring_boot/src/main/resources/application-prod.properties)

```properties
# 告警配置
wms.alert.enabled=true
wms.alert.api-response-time.warning=500
wms.alert.api-response-time.critical=2000
wms.alert.error-rate.warning=5.0
wms.alert.error-rate.critical=10.0
wms.alert.system-resource.memory-warning=80.0
wms.alert.system-resource.memory-critical=95.0
wms.alert.notification.cooldown-minutes=10
```

### 4.2 告警通知渠道

系统支持以下告警通知渠道：

- **钉钉**: 配置 `wms.alert.dingtalk.webhook`
- **企业微信**: 配置 `wms.alert.wechat.webhook`
- **邮件**: 配置 `wms.alert.email.enabled=true`

## 5. 监控部署步骤

### 5.1 部署 Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'wms-backend'
    metrics_path: '/api/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
    scrape_interval: 15s
```

### 5.2 部署 Grafana

```bash
# 使用Docker部署Grafana
docker run -d \
  --name=grafana \
  -p 3000:3000 \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana:latest
```

**导入Dashboard**:
- JVM监控: ID 4701
- Spring Boot监控: ID 10280
- MySQL监控: ID 7362

### 5.3 配置告警规则

```yaml
# prometheus-rules.yml
groups:
  - name: wms-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "高错误率告警"
          description: "错误率超过5%，当前值: {{ $value }}"
      
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API响应缓慢"
          description: "P95响应时间超过2秒，当前值: {{ $value }}s"
      
      - alert: HighMemoryUsage
        expr: jvm_memory_used_bytes / jvm_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率高"
          description: "JVM内存使用率超过80%"
```

## 6. 监控检查清单

### 6.1 部署前检查

- [ ] Prometheus配置正确，可以访问 `/api/actuator/prometheus`
- [ ] Grafana已部署，可以访问Web界面
- [ ] 告警规则已配置
- [ ] 日志收集系统已配置
- [ ] 告警通知渠道已测试

### 6.2 部署后验证

- [ ] 前端性能数据正常上报
- [ ] 后端指标正常采集
- [ ] 日志正常收集
- [ ] 告警正常触发
- [ ] Dashboard正常显示

## 7. 常用监控命令

```bash
# 检查Prometheus指标
curl http://localhost:8080/api/actuator/prometheus

# 检查健康状态
curl http://localhost:8080/api/actuator/health

# 查看JVM内存
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used

# 查看HTTP请求指标
curl http://localhost:8080/api/actuator/metrics/http.server.requests
```

## 8. 故障排查

### 8.1 监控数据缺失

1. 检查Actuator端点是否可访问
2. 检查Prometheus配置是否正确
3. 检查防火墙是否放行端口

### 8.2 告警不触发

1. 检查告警规则语法
2. 检查告警管理器配置
3. 检查通知渠道配置

### 8.3 性能数据上报失败

1. 检查前端配置是否正确
2. 检查后端接口是否正常
3. 检查网络连接

---

**文档版本**: 1.0  
**更新日期**: 2026-02-25  
**维护人员**: 运维团队
