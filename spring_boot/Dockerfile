# ===========================================
# 仓库管理系统 - Docker构建文件
# 支持环境: 开发、预生产、生产
# ===========================================

# 构建阶段
FROM eclipse-temurin:17-jdk-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制Maven配置
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# 下载依赖（利用Docker缓存层）
RUN ./mvnw dependency:go-offline -B

# 复制源代码
COPY src src

# 构建应用
RUN ./mvnw clean package -DskipTests -B && \
    mkdir -p target/dependency && \
    cd target/dependency && \
    jar -xf ../*.jar

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 安装必要的工具
RUN apk add --no-cache curl tzdata

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建非root用户
RUN addgroup -S wms && adduser -S wms -G wms

# 设置工作目录
WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /app/target/dependency/BOOT-INF/lib /app/lib
COPY --from=builder /app/target/dependency/META-INF /app/META-INF
COPY --from=builder /app/target/dependency/BOOT-INF/classes /app

# 创建日志目录
RUN mkdir -p /app/logs && chown -R wms:wms /app

# 切换到非root用户
USER wms

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# 暴露端口
EXPOSE 8080

# 启动命令
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-cp", "/app:/app/lib/*", \
    "com.backend.BackendApplication" \
]
