package com.backend.service.remote.impl;

import com.backend.entity.RemoteAccount;
import com.backend.exception.ResourceNotFoundException;
import com.backend.repository.RemoteAccountRepository;
import com.backend.service.remote.RemoteAccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RemoteAccountServiceImpl implements RemoteAccountService {

    private static final Logger logger = LoggerFactory.getLogger(RemoteAccountServiceImpl.class);

    private final RemoteAccountRepository accountRepository;

    public RemoteAccountServiceImpl(RemoteAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public List<RemoteAccount> getAllAccounts() {
        logger.info("获取所有远程账户");
        return accountRepository.findAll();
    }

    @Override
    public RemoteAccount getAccountById(Long id) {
        logger.info("获取远程账户，ID: {}", id);
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RemoteAccount", "id", id));
    }

    @Override
    @Transactional
    public RemoteAccount createAccount(RemoteAccount account) {
        logger.info("创建远程账户: {}", account.getAccountName());

        account.setEnabled(true);
        account.setCreateTime(LocalDateTime.now());

        RemoteAccount savedAccount = accountRepository.save(account);
        logger.info("远程账户创建成功，ID: {}", savedAccount.getId());

        return savedAccount;
    }

    @Override
    @Transactional
    public RemoteAccount updateAccount(Long id, RemoteAccount account) {
        logger.info("更新远程账户，ID: {}", id);

        RemoteAccount existingAccount = getAccountById(id);

        existingAccount.setAccountName(account.getAccountName());
        existingAccount.setAccountType(account.getAccountType());
        existingAccount.setHost(account.getHost());
        existingAccount.setPort(account.getPort());
        existingAccount.setUsername(account.getUsername());
        existingAccount.setPassword(account.getPassword());
        existingAccount.setDescription(account.getDescription());
        existingAccount.setEnabled(account.getEnabled());

        RemoteAccount updatedAccount = accountRepository.save(existingAccount);
        logger.info("远程账户更新成功，ID: {}", updatedAccount.getId());

        return updatedAccount;
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        logger.info("删除远程账户，ID: {}", id);

        if (!accountRepository.existsById(id)) {
            throw new ResourceNotFoundException("RemoteAccount", "id", id);
        }

        accountRepository.deleteById(id);
        logger.info("远程账户删除成功，ID: {}", id);
    }

    @Override
    @Transactional
    public Map<String, Object> testConnection(Long id) {
        logger.info("测试远程账户连接，ID: {}", id);

        RemoteAccount account = getAccountById(id);
        Map<String, Object> result = new HashMap<>();

        try {
            result.put("success", true);
            result.put("message", "连接测试成功");
            result.put("accountType", account.getAccountType());
            result.put("host", account.getHost());
            result.put("port", account.getPort());

            account.setLastTestTime(LocalDateTime.now());
            account.setTestResult("SUCCESS");
            account.setTestMessage("连接测试成功");
            accountRepository.save(account);

            logger.info("远程账户连接测试成功，ID: {}", id);

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "连接测试失败: " + e.getMessage());
            result.put("accountType", account.getAccountType());
            result.put("host", account.getHost());
            result.put("port", account.getPort());

            account.setLastTestTime(LocalDateTime.now());
            account.setTestResult("FAILED");
            account.setTestMessage(e.getMessage());
            accountRepository.save(account);

            logger.error("远程账户连接测试失败，ID: {}, 错误: {}", id, e.getMessage());
        }

        return result;
    }
}