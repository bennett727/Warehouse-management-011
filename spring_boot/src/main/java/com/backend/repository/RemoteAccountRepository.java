package com.backend.repository;

import com.backend.entity.RemoteAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemoteAccountRepository extends JpaRepository<RemoteAccount, Long> {

    List<RemoteAccount> findByEnabledOrderByCreateTimeDesc(Boolean enabled);

    List<RemoteAccount> findByAccountTypeOrderByCreateTimeDesc(String accountType);
}