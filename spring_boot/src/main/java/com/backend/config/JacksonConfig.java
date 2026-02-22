package com.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.StreamWriteConstraints;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Jackson配置类
 *
 * 功能说明：
 * 配置Jackson序列化和反序列化行为，解决JSON序列化深度限制问题
 *
 * 优化记录：
 * - 2026-02-11: 增加最大嵌套深度限制，解决深层关联实体序列化问题
 * - 2026-02-11: 使用@JsonIdentityInfo处理循环引用，解决Hibernate懒加载代理对象序列化问题
 *
 * @author 系统开发团队
 * @version 1.0
 * @since 2026-02-11
 */
@Configuration
public class JacksonConfig {

    /**
     * 配置ObjectMapper
     *
     * 优化点：
     * 1. 增加最大嵌套深度限制到2000，解决深层关联实体序列化问题
     * 2. 使用@JsonIdentityInfo处理循环引用（在BaseEntity中配置）
     * 3. 配置不序列化null值，减少JSON体积
     * 4. 保持其他默认配置不变
     *
     * @return 配置好的ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // 注册JavaTimeModule，支持Java 8日期时间类型序列化
        mapper.registerModule(new JavaTimeModule());

        // 增加最大嵌套深度限制，解决深层关联实体序列化问题
        // 默认限制为1000，增加到2000以支持更深的关联关系
        mapper.getFactory().setStreamWriteConstraints(
                StreamWriteConstraints.builder()
                        .maxNestingDepth(2000)
                        .build());

        // 不序列化null值，减少JSON体积
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

        // 禁用将日期序列化为时间戳
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // 忽略JSON中未知属性，避免前端传递额外字段导致反序列化失败
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        return mapper;
    }
}
