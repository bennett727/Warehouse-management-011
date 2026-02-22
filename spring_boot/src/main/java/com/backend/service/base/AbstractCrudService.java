package com.backend.service.base;

import com.backend.dto.PageResult;
import com.backend.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public abstract class AbstractCrudService<T, ID> implements BaseCrudService<T, ID> {
    
    protected final JpaRepository<T, ID> repository;
    protected final String entityName;
    
    public AbstractCrudService(JpaRepository<T, ID> repository, String entityName) {
        this.repository = repository;
        this.entityName = entityName;
    }
    
    @Override
    public List<T> findAll() {
        return repository.findAll();
    }
    
    @Override
    public T findById(ID id) {
        return repository.findById(id).orElse(null);
    }
    
    @Override
    public T save(T entity) {
        return repository.save(entity);
    }
    
    @Override
    public List<T> saveAll(List<T> entities) {
        return repository.saveAll(entities);
    }
    
    @Override
    public T update(ID id, T entity) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(entityName, "id", id);
        }
        return repository.save(entity);
    }

    @Override
    public void deleteById(ID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(entityName, "id", id);
        }
        repository.deleteById(id);
    }
    
    @Override
    public void delete(T entity) {
        repository.delete(entity);
    }
    
    @Override
    public void deleteAll(List<T> entities) {
        repository.deleteAll(entities);
    }
    
    @Override
    public PageResult<T> findAll(Pageable pageable) {
        Page<T> page = repository.findAll(pageable);
        return PageResult.of(page);
    }
    
    @Override
    public boolean existsById(ID id) {
        return repository.existsById(id);
    }
    
    @Override
    public long count() {
        return repository.count();
    }
}