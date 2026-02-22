package com.backend.service.remote;

import com.backend.entity.RemoteAccount;

import java.util.List;
import java.util.Map;

public interface RemoteAccountService {

    List<RemoteAccount> getAllAccounts();

    RemoteAccount getAccountById(Long id);

    RemoteAccount createAccount(RemoteAccount account);

    RemoteAccount updateAccount(Long id, RemoteAccount account);

    void deleteAccount(Long id);

    Map<String, Object> testConnection(Long id);
}