import { describe, it, expect } from 'vitest';
import {
  chunk,
  compact,
  flatten,
  flattenDeep,
  groupBy,
  keyBy,
  orderBy,
  sortBy,
  unique,
  uniqueBy,
  intersection,
  difference,
  union,
  shuffle,
  sample,
  sampleSize,
  partition,
  zip,
  unzip
} from '../../../src/utils/array.js';

describe('数组工具函数测试', () => {
  describe('chunk', () => {
    it('应该正确分块数组', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('应该处理空数组', () => {
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe('compact', () => {
    it('应该移除假值', () => {
      expect(compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([1, 2, 3]);
    });

    it('应该处理空数组', () => {
      expect(compact([])).toEqual([]);
    });
  });

  describe('flatten', () => {
    it('应该扁平化一级数组', () => {
      expect(flatten([1, [2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该处理嵌套数组', () => {
      expect(flatten([1, [2, [3, 4]]])).toEqual([1, 2, [3, 4]]);
    });
  });

  describe('flattenDeep', () => {
    it('应该深度扁平化数组', () => {
      expect(flattenDeep([1, [2, [3, [4, 5]]]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该处理空数组', () => {
      expect(flattenDeep([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    it('应该按属性分组', () => {
      const users = [
        { name: '张三', age: 20 },
        { name: '李四', age: 20 },
        { name: '王五', age: 30 }
      ];
      const result = groupBy(users, 'age');
      expect(result[20]).toHaveLength(2);
      expect(result[30]).toHaveLength(1);
    });

    it('应该支持函数迭代器', () => {
      const numbers = [1.3, 2.1, 2.4];
      const result = groupBy(numbers, Math.floor);
      expect(result[1]).toEqual([1.3]);
      expect(result[2]).toEqual([2.1, 2.4]);
    });
  });

  describe('keyBy', () => {
    it('应该按属性创建对象', () => {
      const users = [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' }
      ];
      const result = keyBy(users, 'id');
      expect(result[1].name).toBe('张三');
      expect(result[2].name).toBe('李四');
    });
  });

  describe('orderBy', () => {
    it('应该按多个字段排序', () => {
      const users = [
        { name: '张三', age: 30 },
        { name: '李四', age: 20 },
        { name: '王五', age: 30 }
      ];
      const result = orderBy(users, ['age', 'name'], ['asc', 'desc']);
      expect(result[0].name).toBe('李四');
      expect(result[1].name).toBe('王五');
    });
  });

  describe('sortBy', () => {
    it('应该按字段升序排序', () => {
      const users = [
        { name: '张三', age: 30 },
        { name: '李四', age: 20 }
      ];
      const result = sortBy(users, 'age');
      expect(result[0].name).toBe('李四');
      expect(result[1].name).toBe('张三');
    });
  });

  describe('unique', () => {
    it('应该去重数组', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('应该处理对象数组', () => {
      expect(unique([{a: 1}, {a: 1}, {a: 2}], 'a')).toEqual([{a: 1}, {a: 2}]);
    });
  });

  describe('uniqueBy', () => {
    it('应该按属性去重', () => {
      const users = [
        { id: 1, name: '张三' },
        { id: 1, name: '李四' },
        { id: 2, name: '王五' }
      ];
      expect(uniqueBy(users, 'id')).toHaveLength(2);
    });
  });

  describe('intersection', () => {
    it('应该返回交集', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    });

    it('应该处理多个数组', () => {
      expect(intersection([1, 2, 3], [2, 3, 4], [3, 4, 5])).toEqual([3]);
    });
  });

  describe('difference', () => {
    it('应该返回差集', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
    });
  });

  describe('union', () => {
    it('应该返回并集', () => {
      expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('shuffle', () => {
    it('应该打乱数组', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...arr]);
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });
  });

  describe('sample', () => {
    it('应该随机返回一个元素', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = sample(arr);
      expect(arr).toContain(result);
    });

    it('应该处理空数组', () => {
      expect(sample([])).toBeUndefined();
    });
  });

  describe('sampleSize', () => {
    it('应该随机返回指定数量的元素', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = sampleSize(arr, 3);
      expect(result).toHaveLength(3);
      result.forEach(item => {
        expect(arr).toContain(item);
      });
    });
  });

  describe('partition', () => {
    it('应该按条件分组', () => {
      const users = [
        { user: 'barney', age: 36, active: false },
        { user: 'fred', age: 40, active: true },
        { user: 'pebbles', age: 1, active: false }
      ];
      const [active, inactive] = partition(users, u => u.active);
      expect(active).toHaveLength(1);
      expect(inactive).toHaveLength(2);
    });
  });

  describe('zip', () => {
    it('应该合并数组', () => {
      expect(zip(['a', 'b'], [1, 2], [true, false])).toEqual([
        ['a', 1, true],
        ['b', 2, false]
      ]);
    });
  });

  describe('unzip', () => {
    it('应该解压数组', () => {
      expect(unzip([['a', 1, true], ['b', 2, false]])).toEqual([
        ['a', 'b'],
        [1, 2],
        [true, false]
      ]);
    });
  });
});
