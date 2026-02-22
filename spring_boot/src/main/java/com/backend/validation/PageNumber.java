package com.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PageNumberValidator.class)
@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PageNumber {
    String message() default "页码必须大于0";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}