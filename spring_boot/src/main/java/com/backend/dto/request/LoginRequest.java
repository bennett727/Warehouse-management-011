package com.backend.dto.request;

import com.backend.util.InputSanitizer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(max = 50, message = "用户名长度不能超过50个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(max = 100, message = "密码长度不能超过100个字符")
    private String password;

    private String captcha;

    /**
     * 净化输入数据
     */
    public void sanitize() {
        if (this.username != null) {
            InputSanitizer.validateInput(this.username, "用户名");
            this.username = InputSanitizer.sanitize(this.username);
        }
        if (this.captcha != null) {
            this.captcha = InputSanitizer.sanitize(this.captcha);
        }
    }
}
