package com.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

       Optional<User> findByUsername(String username);

       boolean existsByUsername(String username);

       boolean existsByEmail(String email);

       boolean existsByPhone(String phone);

       @Query("SELECT u FROM User u WHERE " +
                     "(:keyword IS NULL OR u.username LIKE %:keyword% OR u.realName LIKE %:keyword%) AND " +
                     "(:roleId IS NULL OR EXISTS (SELECT 1 FROM u.roles r WHERE r.id = :roleId)) AND " +
                     "(:status IS NULL OR u.status = :status)")
       Page<User> findByConditions(@Param("keyword") String keyword,
                     @Param("roleId") Long roleId,
                     @Param("status") Integer status,
                     Pageable pageable);

       @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName")
       List<User> findByRole(@Param("roleName") String roleName);
}
