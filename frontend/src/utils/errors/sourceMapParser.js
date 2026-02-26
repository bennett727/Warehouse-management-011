/**
 * SourceMap解析工具
 *
 * 功能说明：
 * 解析压缩后的JavaScript代码错误位置，还原到原始源码位置
 *
 * 特性：
 * - 支持解析SourceMap文件
 * - 还原压缩代码的错误行列号
 * - 支持内联SourceMap
 * - 缓存已解析的SourceMap
 *
 * @author 前端开发团队
 * @version 1.0
 * @since 2026-02-19
 */

const sourceMapCache = new Map();

class SourceMapParser {
  constructor() {
    this.cache = sourceMapCache;
  }

  async parseErrorPosition(errorInfo) {
    if (!errorInfo.filename || !errorInfo.lineno || !errorInfo.colno) {
      return null;
    }

    try {
      const sourceMapUrl = await this.getSourceMapUrl(errorInfo.filename);
      if (!sourceMapUrl) {
        return null;
      }

      const sourceMap = await this.loadSourceMap(sourceMapUrl);
      if (!sourceMap) {
        return null;
      }

      const originalPosition = this.findOriginalPosition(sourceMap, errorInfo.lineno, errorInfo.colno);

      return {
        source: originalPosition.source,
        line: originalPosition.line,
        column: originalPosition.column,
        name: originalPosition.name,
        generatedLine: errorInfo.lineno,
        generatedColumn: errorInfo.colno,
        filename: errorInfo.filename,
      };
    } catch (e) {
      return null;
    }
  }

  async getSourceMapUrl(scriptUrl) {
    if (this.cache.has(`url_${scriptUrl}`)) {
      return this.cache.get(`url_${scriptUrl}`);
    }

    try {
      const response = await fetch(scriptUrl);
      const content = await response.text();

      const inlineMapMatch = content.match(/\/\/[@#]\s*sourceMappingURL=data:application\/json;base64,([^\s]+)/);
      if (inlineMapMatch) {
        const sourceMapUrl = `data:application/json;base64,${inlineMapMatch[1]}`;
        this.cache.set(`url_${scriptUrl}`, sourceMapUrl);
        return sourceMapUrl;
      }

      const externalMapMatch = content.match(/\/\/[@#]\s*sourceMappingURL=([^\s]+)/);
      if (externalMapMatch) {
        const mapUrl = new URL(externalMapMatch[1], scriptUrl).href;
        this.cache.set(`url_${scriptUrl}`, mapUrl);
        return mapUrl;
      }

      const possibleMapUrl = `${scriptUrl}.map`;
      this.cache.set(`url_${scriptUrl}`, possibleMapUrl);
      return possibleMapUrl;
    } catch (e) {
      return null;
    }
  }

  async loadSourceMap(sourceMapUrl) {
    if (this.cache.has(`map_${sourceMapUrl}`)) {
      return this.cache.get(`map_${sourceMapUrl}`);
    }

    try {
      let content;

      if (sourceMapUrl.startsWith('data:application/json;base64,')) {
        const base64 = sourceMapUrl.replace('data:application/json;base64,', '');
        content = atob(base64);
      } else {
        const response = await fetch(sourceMapUrl);
        content = await response.text();
      }

      const sourceMap = JSON.parse(content);
      this.cache.set(`map_${sourceMapUrl}`, sourceMap);
      return sourceMap;
    } catch (e) {
      return null;
    }
  }

  findOriginalPosition(sourceMap, generatedLine, generatedColumn) {
    if (!sourceMap.mappings) {
      return { source: null, line: generatedLine, column: generatedColumn, name: null };
    }

    const decoded = this.decodeMappings(sourceMap.mappings);
    const sources = sourceMap.sources || [];
    const names = sourceMap.names || [];

    let closestMapping = null;
    let minDistance = Infinity;

    for (const mapping of decoded) {
      if (mapping.generatedLine === generatedLine) {
        const distance = Math.abs(mapping.generatedColumn - generatedColumn);
        if (distance < minDistance) {
          minDistance = distance;
          closestMapping = mapping;
        }
      }
    }

    if (closestMapping) {
      return {
        source: sources[closestMapping.sourceIndex] || null,
        line: closestMapping.originalLine + 1,
        column: closestMapping.originalColumn + 1,
        name: names[closestMapping.nameIndex] || null,
      };
    }

    return { source: null, line: generatedLine, column: generatedColumn, name: null };
  }

  decodeMappings(mappings) {
    const result = [];
    const lines = mappings.split(';');

    let generatedLine = 0;
    let generatedColumn = 0;
    let sourceIndex = 0;
    let originalLine = 0;
    let originalColumn = 0;
    let nameIndex = 0;

    for (const line of lines) {
      generatedColumn = 0;
      const segments = line.split(',');

      for (const segment of segments) {
        if (!segment) {
          continue;
        }

        const values = this.decodeVLQ(segment);

        generatedColumn += values[0] || 0;

        if (values.length >= 4) {
          sourceIndex += values[1] || 0;
          originalLine += values[2] || 0;
          originalColumn += values[3] || 0;

          const mapping = {
            generatedLine,
            generatedColumn,
            sourceIndex,
            originalLine,
            originalColumn,
            nameIndex: null,
          };

          if (values.length >= 5) {
            nameIndex += values[4] || 0;
            mapping.nameIndex = nameIndex;
          }

          result.push(mapping);
        }
      }

      generatedLine++;
    }

    return result;
  }

  decodeVLQ(encoded) {
    const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const BASE64_VALUES = {};
    for (let i = 0; i < BASE64_CHARS.length; i++) {
      BASE64_VALUES[BASE64_CHARS[i]] = i;
    }

    const VLQ_CONTINUATION_BIT = 32;
    const VLQ_BASE_SHIFT = 5;
    const VLQ_BASE_MASK = (1 << VLQ_BASE_SHIFT) - 1;

    const result = [];
    let value = 0;
    let shift = 0;

    for (const char of encoded) {
      const digit = BASE64_VALUES[char];
      if (digit === undefined) {
        continue;
      }

      const continuation = digit & VLQ_CONTINUATION_BIT;
      const digitValue = (digit & VLQ_BASE_MASK) << shift;
      value += digitValue;
      shift += VLQ_BASE_SHIFT;

      if (!continuation) {
        const isNegative = value & 1;
        value >>= 1;
        result.push(isNegative ? -value : value);
        value = 0;
        shift = 0;
      }
    }

    return result;
  }

  clearCache() {
    this.cache.clear();
  }
}

const sourceMapParser = new SourceMapParser();

export const parseErrorPosition = async (errorInfo) => {
  return await sourceMapParser.parseErrorPosition(errorInfo);
};

export const getSourceMapUrl = async (scriptUrl) => {
  return await sourceMapParser.getSourceMapUrl(scriptUrl);
};

export const clearSourceMapCache = () => {
  sourceMapParser.clearCache();
};

export default sourceMapParser;
