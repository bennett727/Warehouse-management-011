import { ElMessage } from 'element-plus';

import { createLogger } from '../logger';

import { isDeviceCode, isIdCard, isNumber, isPhone, isPostalCode } from './validators';

const logger = createLogger('FormValidation');

const createRequiredRule = (message = '该字段不能为空') => ({
  required: true,
  message,
  trigger: 'blur',
});

const createLengthRule = (min, max, message) => ({
  min,
  max,
  message: message || `长度在 ${min} 到 ${max} 个字符`,
  trigger: 'blur',
});

const createPatternRule = (pattern, message) => ({
  pattern,
  message,
  trigger: 'blur',
});

export const validationRules = {
  required: (message = '此项为必填项') => ({
    required: true,
    message,
    trigger: ['blur', 'change'],
  }),

  length: (min, max, message) => ({
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符之间`,
    trigger: 'blur',
  }),

  numberRange: (min, max, message) => ({
    validator: (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback();
        return;
      }
      const num = Number(value);
      if (isNaN(num)) {
        callback(new Error('请输入有效的数字'));
      } else if (num < min || num > max) {
        callback(new Error(message || `数值必须在 ${min} 到 ${max} 之间`));
      } else {
        callback();
      }
    },
    trigger: ['blur', 'change'],
  }),

  email: (message = '请输入有效的邮箱地址') => ({
    type: 'email',
    message,
    trigger: 'blur',
  }),

  phone: (message = '请输入有效的手机号码') => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: 'blur',
  }),

  idCard: (message = '请输入有效的身份证号码') => ({
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      const pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if (!pattern.test(value)) {
        callback(new Error(message));
        return;
      }
      if (value.length === 18) {
        const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        let sum = 0;
        for (let i = 0; i < 17; i++) {
          sum += parseInt(value[i]) * weights[i];
        }
        const checkCode = checkCodes[sum % 11];
        if (value[17].toUpperCase() !== checkCode) {
          callback(new Error('身份证号码校验位错误'));
          return;
        }
      }
      callback();
    },
    trigger: 'blur',
  }),

  url: (message = '请输入有效的URL地址') => ({
    type: 'url',
    message,
    trigger: 'blur',
  }),

  code: (min = 1, max = 50, message) => ({
    pattern: new RegExp(`^[a-zA-Z0-9_]{${min},${max}}$`),
    message: message || `只能包含字母、数字和下划线，长度 ${min}-${max}`,
    trigger: 'blur',
  }),

  money: (message = '请输入有效的金额') => ({
    pattern: /^\d+(\.\d{1,2})?$/,
    message,
    trigger: 'blur',
  }),

  positiveInt: (message = '请输入正整数') => ({
    pattern: /^[1-9]\d*$/,
    message,
    trigger: 'blur',
  }),
};

export const commonRules = {
  required: createRequiredRule('该字段不能为空'),
  email: {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: 'blur',
  },
  phone: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      } else if (!isPhone(value)) {
        callback(new Error('请输入正确的手机号码'));
      } else {
        callback();
      }
    },
    trigger: 'blur',
  },
  idCard: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      } else if (!isIdCard(value)) {
        callback(new Error('请输入正确的身份证号码'));
      } else {
        callback();
      }
    },
    trigger: 'blur',
  },
  url: {
    type: 'url',
    message: '请输入正确的URL地址',
    trigger: 'blur',
  },
  number: {
    type: 'number',
    message: '请输入数字',
    trigger: 'blur',
  },
  positiveNumber: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      } else if (!isNumber(value) || Number(value) <= 0) {
        callback(new Error('请输入大于0的数字'));
      } else {
        callback();
      }
    },
    trigger: 'blur',
  },
  nonNegativeNumber: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      } else if (!isNumber(value) || Number(value) < 0) {
        callback(new Error('请输入大于等于0的数字'));
      } else {
        callback();
      }
    },
    trigger: 'blur',
  },
  postalCode: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      } else if (!isPostalCode(value)) {
        callback(new Error('请输入正确的邮政编码'));
      } else {
        callback();
      }
    },
    trigger: 'blur',
  },
  date: {
    type: 'date',
    message: '请选择正确的日期',
    trigger: 'change',
  },
};

export const userRules = {
  username: [
    createRequiredRule('用户名不能为空'),
    createLengthRule(3, 50, '用户名长度在3到50个字符之间'),
    createPatternRule(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  ],
  password: [
    createRequiredRule('密码不能为空'),
    createLengthRule(6, 100, '密码长度在6到100个字符之间'),
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
        } else if (!/[A-Z]/.test(value)) {
          callback(new Error('密码必须包含大写字母'));
        } else if (!/[a-z]/.test(value)) {
          callback(new Error('密码必须包含小写字母'));
        } else if (!/\d/.test(value)) {
          callback(new Error('密码必须包含数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  realName: [
    createRequiredRule('真实姓名不能为空'),
    createLengthRule(2, 50, '姓名长度在2到50个字符之间'),
    createPatternRule(/^[\u4e00-\u9fa5]+$/, '姓名只能包含中文字符'),
  ],
  email: [commonRules.email],
  phone: [commonRules.phone],
  idCard: [commonRules.idCard],
};

export const deviceRules = {
  deviceCode: [
    createRequiredRule('请输入设备编号'),
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
        } else if (!isDeviceCode(value)) {
          callback(new Error('设备编号格式错误，正确格式：DEV-XXX-XXXX（如：DEV-ABC-1234）'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  name: [createRequiredRule('设备名称不能为空'), createLengthRule(2, 100, '设备名称长度在2到100个字符之间')],
  type: [createRequiredRule('请选择设备类型')],
  model: [createRequiredRule('设备型号不能为空'), createLengthRule(1, 50, '设备型号长度在1到50个字符之间')],
};

export const inventoryRules = {
  quantity: [
    createRequiredRule('数量不能为空'),
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
        } else if (!isNumber(value) || Number(value) <= 0) {
          callback(new Error('数量必须大于0'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  unit: [createRequiredRule('请选择单位')],
  minStock: [createRequiredRule('最小库存不能为空'), commonRules.nonNegativeNumber],
};

export const warehouseRules = {
  warehouseName: [createRequiredRule('仓库名称不能为空'), createLengthRule(2, 50, '仓库名称长度在2到50个字符之间')],
  warehouseCode: [
    createRequiredRule('仓库编号不能为空'),
    createPatternRule(/^[A-Z]{2}\d{4}$/, '仓库编号格式不正确，应为2位大写字母+4位数字'),
  ],
  address: [createRequiredRule('仓库地址不能为空'), createLengthRule(5, 200, '仓库地址长度在5到200个字符之间')],
};

export const areaRules = {
  areaName: [createRequiredRule('区域名称不能为空'), createLengthRule(2, 50, '区域名称长度在2到50个字符之间')],
  areaCode: [
    createRequiredRule('区域编号不能为空'),
    createPatternRule(/^[A-Z]{3}\d{3}$/, '区域编号格式不正确，应为3位大写字母+3位数字'),
  ],
};

export const inboundOrderRules = {
  orderDate: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  inboundType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择入库仓库', trigger: 'change' }],
  supplier: [createRequiredRule('请输入供应商名称'), createLengthRule(2, 100, '供应商名称长度应在2-100个字符之间')],
};

export const outboundOrderRules = {
  orderDate: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
  outboundType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  customer: [createRequiredRule('请输入客户名称'), createLengthRule(2, 100, '客户名称长度应在2-100个字符之间')],
};

export const transferOrderRules = (formData) => ({
  transferDate: [{ required: true, message: '请选择调拨日期', trigger: 'change' }],
  fromWarehouseId: [{ required: true, message: '请选择调出仓库', trigger: 'change' }],
  toWarehouseId: [
    { required: true, message: '请选择调入仓库', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value === formData.fromWarehouseId) {
          callback(new Error('调入仓库不能与调出仓库相同'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
});

export const installationRules = {
  location: [createRequiredRule('请输入详细安装地址'), createLengthRule(2, 200, '详细地址长度应在2-200个字符之间')],
  installer: [createRequiredRule('请输入安装人员'), createLengthRule(2, 50, '安装人员姓名长度应在2-50个字符之间')],
};

export const repairRules = {
  repairType: [{ required: true, message: '请选择维修类型', trigger: 'change' }],
  repairContent: [createRequiredRule('请输入维修内容'), createLengthRule(2, 500, '维修内容长度应在2-500个字符之间')],
  technician: [createRequiredRule('请输入维修人员'), createLengthRule(2, 50, '维修人员姓名长度应在2-50个字符之间')],
};

export class FormValidator {
  constructor() {
    this.errors = [];
  }

  async validateField(value, rules, fieldName = '') {
    for (const rule of rules) {
      try {
        await new Promise((resolve, reject) => {
          if (rule.validator) {
            rule.validator(rule, value, (error) => {
              if (error) {
                reject(new Error(error.message || error));
              } else {
                resolve();
              }
            });
          } else if (rule.required && (value === undefined || value === null || value === '')) {
            reject(new Error(rule.message || `${fieldName}为必填项`));
          } else if (rule.pattern && !rule.pattern.test(value)) {
            reject(new Error(rule.message || `${fieldName}格式不正确`));
          } else if (rule.min !== undefined && rule.max !== undefined) {
            const length = typeof value === 'string' ? value.length : String(value).length;
            if (length < rule.min || length > rule.max) {
              reject(new Error(rule.message || `${fieldName}长度应在${rule.min}-${rule.max}之间`));
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      } catch (error) {
        this.errors.push({
          field: fieldName,
          message: error.message,
        });
        return false;
      }
    }
    return true;
  }

  async validate(form, rules) {
    this.errors = [];
    const fields = Object.keys(rules);

    for (const field of fields) {
      const value = form[field];
      const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
      await this.validateField(value, fieldRules, field);
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  getFirstError() {
    return this.errors.length > 0 ? this.errors[0].message : null;
  }

  getAllErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export async function validateForm(formRef) {
  if (!formRef) {
    logger.warn('表单引用为空');
    return false;
  }

  try {
    await formRef.validate();
    return true;
  } catch (_error) {
    setTimeout(() => {
      const errorElement = document.querySelector('.el-form-item.is-error');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    return false;
  }
}

export async function validateAndNotify(formRef, successMessage = null) {
  const valid = await validateForm(formRef);

  if (valid && successMessage) {
    ElMessage.success(successMessage);
  }

  return valid;
}

export function combineRules(...rules) {
  return rules.flat();
}

export function debounceValidate(validator, delay = 300) {
  let timer = null;

  return function (...args) {
    return new Promise((resolve) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const result = await validator(...args);
        resolve(result);
      }, delay);
    });
  };
}

export const getRulesByType = (type) => {
  const ruleMap = {
    common: commonRules,
    user: userRules,
    device: deviceRules,
    inventory: inventoryRules,
    warehouse: warehouseRules,
    area: areaRules,
    inbound: inboundOrderRules,
    outbound: outboundOrderRules,
    installation: installationRules,
    repair: repairRules,
  };

  return ruleMap[type] || {};
};

export const mergeRules = (...ruleSets) => {
  return ruleSets.reduce((merged, rules) => {
    return { ...merged, ...rules };
  }, {});
};

export default {
  validationRules,
  commonRules,
  userRules,
  deviceRules,
  inventoryRules,
  warehouseRules,
  areaRules,
  inboundOrderRules,
  outboundOrderRules,
  transferOrderRules,
  installationRules,
  repairRules,
  FormValidator,
  validateForm,
  validateAndNotify,
  combineRules,
  debounceValidate,
  getRulesByType,
  mergeRules,
};
