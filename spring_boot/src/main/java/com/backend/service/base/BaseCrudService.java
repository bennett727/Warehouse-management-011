package com.backend.service.base;

import com.backend.dto.PageResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BaseCrudService<T, ID> {
    
    List<T> findAll();
    
    T findById(ID id);
    
    T save(T entity);
    
    List<T> saveAll(List<T> entities);
    
    T update(ID id, T entity);
    
    void deleteById(ID id);
    
    void delete(T entity);
    
    void deleteAll(List<T> entities);
    
    PageResult<T> findAll(Pageable pageable);
    
    boolean existsById(ID id);
    
    long count();
}