/**
 * 智能编码规则引擎
 * 提供可配置的编码生成规则，支持多种编码策略
 */

import { createLogger } from './logger';

const logger = createLogger('CodeGenerator');

/**
 * 编码规则类型
 */
export const CodeRuleTypes = {
  // 固定字符串
  FIXED: 'fixed',
  // 日期时间
  DATE: 'date',
  // 顺序编号
  SEQUENCE: 'sequence',
  // 随机字符
  RANDOM: 'random',
  // 父级编码引用
  PARENT: 'parent',
  // 属性引用
  ATTRIBUTE: 'attribute',
  // 自定义函数
  CUSTOM: 'custom',
};

/**
 * 日期格式映射
 */
const DateFormats = {
  YYYY: () => new Date().getFullYear().toString(),
  YY: () => new Date().getFullYear().toString().slice(-2),
  MM: () => String(new Date().getMonth() + 1).padStart(2, '0'),
  DD: () => String(new Date().getDate()).padStart(2, '0'),
  HH: () => String(new Date().getHours()).padStart(2, '0'),
  mm: () => String(new Date().getMinutes()).padStart(2, '0'),
  ss: () => String(new Date().getSeconds()).padStart(2, '0'),
  TIMESTAMP: () => Date.now().toString(),
};

/**
 * 常用汉字拼音首字母映射表
 * 用于编码生成时的拼音转换
 */
const PINYIN_INITIALS = {
  阿: 'A',
  吧: 'B',
  擦: 'C',
  搭: 'D',
  蛾: 'E',
  发: 'F',
  噶: 'G',
  哈: 'H',
  击: 'J',
  喀: 'K',
  拉: 'L',
  妈: 'M',
  拿: 'N',
  哦: 'O',
  啪: 'P',
  期: 'Q',
  然: 'R',
  撒: 'S',
  塌: 'T',
  挖: 'W',
  昔: 'X',
  压: 'Y',
  匝: 'Z',
};

/**
 * 提取字符串的拼音首字母
 * @param {string} str - 输入字符串
 * @returns {string} 拼音首字母组合
 */
function extractPinyinInitials(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  let result = '';
  for (const char of str) {
    if (/[a-zA-Z]/.test(char)) {
      result += char.toUpperCase();
    } else if (/[0-9]/.test(char)) {
      result += char;
    } else if (/[\u4e00-\u9fa5]/.test(char)) {
      const code = char.charCodeAt(0);
      if (code >= 0x4e00 && code <= 0x9fa5) {
        const pinyinCode = Math.floor((code - 0x4e00) / 94);
        const initials = 'ABCDEFGHJKLMNOPQRSTWXYZ';
        if (pinyinCode >= 0 && pinyinCode < initials.length) {
          result += initials[pinyinCode];
        } else if (PINYIN_INITIALS[char]) {
          result += PINYIN_INITIALS[char];
        }
      }
    }
  }
  return result;
}

/**
 * 编码段生成器
 */
const SegmentGenerators = {
  /**
   * 生成固定字符串段
   */
  [CodeRuleTypes.FIXED](config) {
    return config.value || '';
  },

  /**
   * 生成日期时间段
   */
  [CodeRuleTypes.DATE](config) {
    const format = config.format || 'YYYYMMDD';
    let result = format;

    Object.entries(DateFormats).forEach(([key, fn]) => {
      result = result.replace(new RegExp(key, 'g'), fn());
    });

    return result;
  },

  /**
   * 生成顺序编号段
   */
  [CodeRuleTypes.SEQUENCE](config, context) {
    const { sequenceKey, digits = 4, start = 1 } = config;
    const key = sequenceKey || 'default';

    // 从上下文或存储中获取当前序号
    const current = context.sequences?.[key] || start;

    // 格式化序号
    const result = String(current).padStart(digits, '0');

    // 更新序号
    if (!context.sequences) {
      context.sequences = {};
    }
    context.sequences[key] = current + 1;

    return result;
  },

  /**
   * 生成随机字符段
   */
  [CodeRuleTypes.RANDOM](config) {
    const { length = 4, charType = 'alphanumeric' } = config;

    const chars = {
      numeric: '0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      mixed: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    };

    const charSet = chars[charType] || chars.alphanumeric;
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }

    return result;
  },

  /**
   * 生成父级编码引用段
   */
  [CodeRuleTypes.PARENT](config, context) {
    const { parentKey = 'parentCode', segment = 'full' } = config;
    const parentCode = context[parentKey] || '';

    if (segment === 'full') {
      return parentCode;
    }

    // 提取指定段
    const segments = parentCode.split(config.delimiter || '-');
    if (segment === 'first') {
      return segments[0] || '';
    }
    if (segment === 'last') {
      return segments[segments.length - 1] || '';
    }
    if (typeof segment === 'number') {
      return segments[segment] || '';
    }

    return parentCode;
  },

  /**
   * 生成属性引用段
   */
  [CodeRuleTypes.ATTRIBUTE](config, context) {
    const { attribute, transform = 'none' } = config;
    let value = context[attribute] || '';

    // 应用转换
    switch (transform) {
      case 'uppercase':
        value = value.toUpperCase();
        break;
      case 'lowercase':
        value = value.toLowerCase();
        break;
      case 'first':
        value = value.charAt(0).toUpperCase();
        break;
      case 'pinyin':
        value = extractPinyinInitials(value);
        break;
      default:
        break;
    }

    return value;
  },

  /**
   * 执行自定义函数
   */
  [CodeRuleTypes.CUSTOM](config, context) {
    if (typeof config.generator === 'function') {
      try {
        return config.generator(context, config) || '';
      } catch (error) {
        logger.error('自定义编码生成器执行失败:', error);
        return '';
      }
    }
    return '';
  },
};

/**
 * 编码规则引擎类
 * 支持多标签页同步和序号冲突检测
 */
export class CodeRuleEngine {
  constructor(name, rules = []) {
    this.name = name;
    this.rules = rules;
    this.context = {};
    this.storageKey = `code_sequence_${name}`;
    this.tabId = this.generateTabId();

    // 初始化BroadcastChannel用于多标签页同步
    this.initBroadcastChannel();

    // 恢复序号状态
    this.restoreSequences();
  }

  /**
   * 生成唯一标签页ID
   * @returns {string}
   */
  generateTabId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化BroadcastChannel
   */
  initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`code_generator_${this.name}`);
      this.channel.onmessage = (event) => {
        if (event.data.tabId !== this.tabId && event.data.type === 'SEQUENCE_UPDATE') {
          // 同步其他标签页的序号更新
          this.syncSequencesFromOtherTab(event.data.sequences);
        }
      };
    }
  }

  /**
   * 从其他标签页同步序号
   * @param {Object} sequences - 序号对象
   */
  syncSequencesFromOtherTab(sequences) {
    if (!this.context.sequences) {
      this.context.sequences = {};
    }

    // 合并序号，取最大值避免冲突
    Object.entries(sequences).forEach(([key, value]) => {
      const currentValue = this.context.sequences[key] || 0;
      this.context.sequences[key] = Math.max(currentValue, value);
    });

    logger.debug(`[${this.name}] 从其他标签页同步序号:`, sequences);
  }

  /**
   * 广播序号更新
   */
  broadcastSequenceUpdate() {
    if (this.channel && this.context.sequences) {
      this.channel.postMessage({
        type: 'SEQUENCE_UPDATE',
        tabId: this.tabId,
        sequences: this.context.sequences,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 添加编码规则段
   * @param {Object} rule - 规则配置
   */
  addRule(rule) {
    this.rules.push(rule);
    return this;
  }

  /**
   * 设置上下文数据
   * @param {Object} context - 上下文数据
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * 生成编码
   * @returns {string}
   */
  generate() {
    const segments = this.rules.map((rule) => {
      const generator = SegmentGenerators[rule.type];
      if (!generator) {
        logger.warn(`未知的编码规则类型: ${rule.type}`);
        return '';
      }
      return generator(rule, this.context);
    });

    const code = segments.join('');
    logger.debug(`[${this.name}] 生成编码:`, code);

    // 保存序号状态
    this.persistSequences();

    return code;
  }

  /**
   * 批量生成编码
   * @param {number} count - 数量
   * @returns {Array}
   */
  generateBatch(count) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generate());
    }
    return codes;
  }

  /**
   * 预览编码（不消耗序号）
   * @returns {string}
   */
  preview() {
    // 保存当前序号状态
    const savedSequences = { ...this.context.sequences };

    // 生成编码
    const code = this.generate();

    // 恢复序号状态
    this.context.sequences = savedSequences;

    return code;
  }

  /**
   * 移除规则
   * @param {number} index - 规则索引
   */
  removeRule(index) {
    this.rules.splice(index, 1);
  }

  /**
   * 清空规则
   */
  clearRules() {
    this.rules = [];
  }

  /**
   * 克隆引擎
   * @returns {CodeRuleEngine}
   */
  clone() {
    const cloned = new CodeRuleEngine(`${this.name}_clone`, [...this.rules]);
    cloned.setContext({ ...this.context });
    return cloned;
  }

  /**
   * 重置序号
   * @param {string} sequenceKey - 序号键名
   */
  resetSequence(sequenceKey) {
    if (this.context.sequences) {
      delete this.context.sequences[sequenceKey];
    }
    this.persistSequences();
  }

  /**
   * 持久化序号状态
   */
  persistSequences() {
    try {
      if (this.context.sequences) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.context.sequences));
        // 广播序号更新到其他标签页
        this.broadcastSequenceUpdate();
      }
    } catch (error) {
      logger.error('持久化序号状态失败:', error);
    }
  }

  /**
   * 恢复序号状态
   */
  restoreSequences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.context.sequences = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('恢复序号状态失败:', error);
    }
  }

  /**
   * 验证编码是否符合规则
   * @param {string} code - 编码
   * @returns {boolean}
   */
  validate(code) {
    // 构建验证正则
    const patterns = this.rules.map((rule) => {
      switch (rule.type) {
        case CodeRuleTypes.FIXED:
          return escapeRegex(rule.value || '');
        case CodeRuleTypes.DATE:
          return `\\d{${(rule.format || 'YYYYMMDD').length}}`;
        case CodeRuleTypes.SEQUENCE:
          return `\\d{${rule.digits || 4}}`;
        case CodeRuleTypes.RANDOM:
          return `[${getCharSetRegex(rule.type)}]{${rule.length || 4}}`;
        case CodeRuleTypes.PARENT:
        case CodeRuleTypes.ATTRIBUTE:
        case CodeRuleTypes.CUSTOM:
          return '.*';
        default:
          return '.*';
      }
    });

    const regex = new RegExp(`^${patterns.join('')}$`);
    return regex.test(code);
  }

  /**
   * 解析编码
   * @param {string} code - 编码
   * @returns {Object}
   */
  parse(code) {
    const parts = [];
    let position = 0;
    let valid = true;

    this.rules.forEach((rule) => {
      const segment = this.extractSegment(code, rule, position);
      parts.push({
        type: rule.type,
        value: segment,
        config: rule,
      });
      position += segment.length;
    });

    // 验证解析结果
    const reconstructed = parts.map((p) => p.value).join('');
    valid = reconstructed === code;

    return { valid, parts };
  }

  /**
   * 提取编码段
   */
  extractSegment(code, rule, start) {
    // 根据规则类型确定段长度
    let length = 0;

    switch (rule.type) {
      case CodeRuleTypes.FIXED: {
        const { value = '' } = rule;
        const { length: valueLength } = value;
        length = valueLength;
        break;
      }
      case CodeRuleTypes.DATE: {
        const { format = 'YYYYMMDD' } = rule;
        const { length: formatLength } = format;
        length = formatLength;
        break;
      }
      case CodeRuleTypes.SEQUENCE: {
        const { digits = 4 } = rule;
        length = digits;
        break;
      }
      case CodeRuleTypes.RANDOM: {
        const { length: ruleLength = 4 } = rule;
        length = ruleLength;
        break;
      }
      default:
        // 对于可变长度，尝试匹配到下一个固定段
        length = code.length - start;
        break;
    }

    return code.substr(start, length);
  }
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 获取字符集正则
 */
function getCharSetRegex(type) {
  const charSets = {
    numeric: '0-9',
    alpha: 'A-Z',
    alphanumeric: '0-9A-Z',
    lowercase: 'a-z',
    mixed: '0-9A-Za-z',
  };
  return charSets[type] || charSets.alphanumeric;
}

/**
 * 预定义的编码规则模板
 */
export const CodeTemplates = {
  /**
   * 仓库编码: WH20240001
   */
  warehouse: [
    { type: CodeRuleTypes.FIXED, value: 'WH' },
    { type: CodeRuleTypes.DATE, format: 'YYYY' },
    { type: CodeRuleTypes.SEQUENCE, sequenceKey: 'warehouse', digits: 4, start: 1 },
  ],

  /**
   * 功能区编码: 继承仓库编码 + 功能区类型
   * 例如: WH20240001-RECEIVE
   */
  zone: [
    { type: CodeRuleTypes.PARENT, parentKey: 'warehouseCode', segment: 'full' },
    { type: CodeRuleTypes.FIXED, value: '-' },
    { type: CodeRuleTypes.ATTRIBUTE, attribute: 'zoneType', transform: 'uppercase' },
  ],

  /**
   * 货位编码: 坐标格式 A-01-02-03
   */
  bin: [
    { type: CodeRuleTypes.ATTRIBUTE, attribute: 'zoneCode', transform: 'first' },
    { type: CodeRuleTypes.FIXED, value: '-' },
    { type: CodeRuleTypes.SEQUENCE, sequenceKey: 'bin', digits: 2, start: 1 },
  ],

  /**
   * 设备编码: DEV20240001-A1B2
   */
  device: [
    { type: CodeRuleTypes.FIXED, value: 'DEV' },
    { type: CodeRuleTypes.DATE, format: 'YYYY' },
    { type: CodeRuleTypes.SEQUENCE, sequenceKey: 'device', digits: 4, start: 1 },
    { type: CodeRuleTypes.FIXED, value: '-' },
    { type: CodeRuleTypes.RANDOM, length: 4, charType: 'alphanumeric' },
  ],

  /**
   * 入库单号: IN202402130001
   */
  inboundOrder: [
    { type: CodeRuleTypes.FIXED, value: 'IN' },
    { type: CodeRuleTypes.DATE, format: 'YYYYMMDD' },
    { type: CodeRuleTypes.SEQUENCE, sequenceKey: 'inbound', digits: 4, start: 1 },
  ],

  /**
   * 出库单号: OUT202402130001
   */
  outboundOrder: [
    { type: CodeRuleTypes.FIXED, value: 'OUT' },
    { type: CodeRuleTypes.DATE, format: 'YYYYMMDD' },
    { type: CodeRuleTypes.SEQUENCE, sequenceKey: 'outbound', digits: 4, start: 1 },
  ],

  /**
   * 盘点单号: CHECK202402130001
   */
  checkOrder: [
    { type: CodeRuleTypes.FIXED, value: 'CHECK' },
    { type: CodeRuleTypes.DATE, format: 'YYYYMMDD' },
    { type: CodeRuleTypes.SEQUENCE, sequenceKey: 'check', digits: 4, start: 1 },
  ],

  /**
   * 行政区划编码: 440000 (6位数字)
   */
  division: [{ type: CodeRuleTypes.RANDOM, length: 6, charType: 'numeric' }],
};

/**
 * 编码生成器工厂
 */
export class CodeGeneratorFactory {
  static create(templateName, customRules = null) {
    const rules = customRules || CodeTemplates[templateName];
    if (!rules) {
      throw new Error(`未知的编码模板: ${templateName}`);
    }
    return new CodeRuleEngine(templateName, rules);
  }

  static createFromConfig(config) {
    const { name, rules } = config;
    return new CodeRuleEngine(name, rules);
  }
}

/**
 * 快速生成编码
 * @param {string} templateName - 模板名称或 'custom' 用于自定义规则
 * @param {Object} context - 上下文数据，如果是自定义规则则传入规则数组
 * @returns {string}
 */
export function generateCode(templateName, context = {}) {
  let engine;
  if (templateName === 'custom' && Array.isArray(context)) {
    // 自定义规则模式
    engine = new CodeRuleEngine('custom', context);
  } else {
    engine = CodeGeneratorFactory.create(templateName);
    engine.setContext(context);
  }
  return engine.generate();
}

/**
 * 批量生成编码
 * @param {string} templateName - 模板名称或 'custom' 用于自定义规则
 * @param {number} count - 数量
 * @param {Object} context - 上下文数据，如果是自定义规则则传入规则数组
 * @returns {Array}
 */
export function generateCodes(templateName, count, context = {}) {
  let engine;
  if (templateName === 'custom' && Array.isArray(context)) {
    // 自定义规则模式
    engine = new CodeRuleEngine('custom', context);
  } else {
    engine = CodeGeneratorFactory.create(templateName);
    engine.setContext(context);
  }
  return engine.generateBatch(count);
}

/**
 * 预览编码
 * @param {string} templateName - 模板名称或 'custom' 用于自定义规则
 * @param {Object} context - 上下文数据，如果是自定义规则则传入规则数组
 * @returns {string}
 */
export function previewCode(templateName, context = {}) {
  let engine;
  if (templateName === 'custom' && Array.isArray(context)) {
    // 自定义规则模式
    engine = new CodeRuleEngine('custom', context);
  } else {
    engine = CodeGeneratorFactory.create(templateName);
    engine.setContext(context);
  }
  return engine.preview();
}

/**
 * 注册自定义编码模板
 * @param {string} name - 模板名称
 * @param {Array} rules - 规则配置
 */
export function registerTemplate(name, rules) {
  CodeTemplates[name] = rules;
  logger.debug(`注册编码模板: ${name}`);
}

/**
 * 获取所有可用模板
 * @returns {Object}
 */
export function getTemplates() {
  return { ...CodeTemplates };
}

/**
 * Vue Composition API - 使用编码生成器
 * @param {string} templateName - 模板名称
 * @returns {Object}
 */
export function useCodeGenerator(templateName) {
  const engine = CodeGeneratorFactory.create(templateName);

  return {
    generate: (context) => {
      engine.setContext(context);
      return engine.generate();
    },
    preview: (context) => {
      engine.setContext(context);
      return engine.preview();
    },
    generateBatch: (count, context) => {
      engine.setContext(context);
      return engine.generateBatch(count);
    },
    validate: (code) => engine.validate(code),
    parse: (code) => engine.parse(code),
  };
}

export default {
  CodeRuleEngine,
  CodeGeneratorFactory,
  CodeRuleTypes,
  CodeTemplates,
  generateCode,
  generateCodes,
  previewCode,
  registerTemplate,
  getTemplates,
  useCodeGenerator,
};
