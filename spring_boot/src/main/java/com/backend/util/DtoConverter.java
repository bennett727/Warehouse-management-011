package com.backend.util;

import com.backend.common.ErrorCode;
import com.backend.exception.BusinessException;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

@Component
public class DtoConverter {

    public <T, D> D convertToDto(T entity, Class<D> dtoClass) {
        if (entity == null) {
            return null;
        }
        try {
            D dto = dtoClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(entity, dto);
            return dto;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.DTO_CONVERT_ERROR);
        }
    }

    public <T, D> T convertToEntity(D dto, Class<T> entityClass) {
        if (dto == null) {
            return null;
        }
        try {
            T entity = entityClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(dto, entity);
            return entity;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.ENTITY_CONVERT_ERROR);
        }
    }

    public <T, D> List<D> convertToDtoList(List<T> entities, Class<D> dtoClass) {
        if (entities == null || entities.isEmpty()) {
            return new ArrayList<>();
        }
        List<D> dtoList = new ArrayList<>(entities.size());
        for (T entity : entities) {
            D dto = convertToDto(entity, dtoClass);
            if (dto != null) {
                dtoList.add(dto);
            }
        }
        return dtoList;
    }

    public <T, D> List<T> convertToEntityList(List<D> dtos, Class<T> entityClass) {
        if (dtos == null || dtos.isEmpty()) {
            return new ArrayList<>();
        }
        List<T> entityList = new ArrayList<>(dtos.size());
        for (D dto : dtos) {
            T entity = convertToEntity(dto, entityClass);
            if (entity != null) {
                entityList.add(entity);
            }
        }
        return entityList;
    }

    public <T, D> List<D> convertToDtoList(List<T> entities, Function<T, D> converter) {
        if (entities == null || entities.isEmpty()) {
            return new ArrayList<>();
        }
        List<D> dtoList = new ArrayList<>(entities.size());
        for (T entity : entities) {
            D dto = converter.apply(entity);
            if (dto != null) {
                dtoList.add(dto);
            }
        }
        return dtoList;
    }

    public <T, D> void copyProperties(T source, D target) {
        if (source == null || target == null) {
            return;
        }
        BeanUtils.copyProperties(source, target);
    }

    public <T, D> void copyProperties(T source, D target, String... ignoreProperties) {
        if (source == null || target == null) {
            return;
        }
        BeanUtils.copyProperties(source, target, ignoreProperties);
    }
}