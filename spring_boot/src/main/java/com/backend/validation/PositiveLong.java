package com.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PositiveLongValidator.class)
@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PositiveLong {
    String message() default "ID必须大于0";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}