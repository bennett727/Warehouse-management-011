package com.backend.repository;

import com.backend.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleCode(String roleCode);

    boolean existsByRoleCode(String roleCode);

    boolean existsByRoleName(String roleName);

    Page<Role> findByRoleNameContainingIgnoreCase(String roleName, Pageable pageable);

    Page<Role> findByRoleNameContainingIgnoreCaseAndStatus(String roleName, Integer status, Pageable pageable);

    Page<Role> findByStatus(Integer status, Pageable pageable);

    List<Role> findByStatus(Integer status);
}