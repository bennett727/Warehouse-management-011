import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier/recommended'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import * as vueParser from 'vue-eslint-parser'
import importPlugin from 'eslint-plugin-import'

export default [
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  prettier,
  // 忽略不需要检查的文件和目录
  {
    ignores: ['node_modules/**', 'dist/**', 'dist-ssr/**', '*.local', '**/*.log', '*.log', 'coverage/**']
  },
  {
    files: ['**/*.vue', '**/*.js'],
    plugins: { vue, import: importPlugin },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        global: 'writable',
        // Vue 3 Composition API
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        onUpdated: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUnmount: 'readonly',
        onBeforeUpdate: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        defineComponent: 'readonly',
        provide: 'readonly',
        inject: 'readonly',
        toRef: 'readonly',
        toRefs: 'readonly',
        unref: 'readonly',
        isRef: 'readonly',
        isReactive: 'readonly',
        isReadonly: 'readonly',
        shallowRef: 'readonly',
        shallowReactive: 'readonly',
        // Vue Router
        useRouter: 'readonly',
        useRoute: 'readonly',
        onBeforeRouteLeave: 'readonly',
        onBeforeRouteUpdate: 'readonly',
        // Pinia
        defineStore: 'readonly',
        storeToRefs: 'readonly',
        // Element Plus
        ElMessage: 'readonly',
        ElMessageBox: 'readonly',
        ElNotification: 'readonly',
        ElLoading: 'readonly'
      }
    },
    rules: {
      // Vue 相关规则
      'vue/no-unused-components': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-side-effects-in-computed-properties': 'warn',
      'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
      'vue/prop-name-casing': ['warn', 'camelCase'],
      'vue/attribute-hyphenation': ['warn', 'always'],
      'vue/v-bind-style': ['warn', 'shorthand'],
      'vue/v-on-style': ['warn', 'shorthand'],
      // JavaScript 相关规则
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-use-before-define': ['warn', { functions: false, classes: true, variables: true, allowNamedExports: true }],
      'no-restricted-globals': 'off',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'no-duplicate-imports': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-return': 'warn',
      'no-else-return': ['warn', { allowElseIf: false }],
      'no-lonely-if': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-nested-ternary': 'warn',
      'no-mixed-operators': 'off',
      'no-multi-spaces': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 0 }],
      'no-trailing-spaces': 'warn',
      'no-irregular-whitespace': 'warn',
      'object-shorthand': ['warn', 'always'],
      'prefer-destructuring': ['warn', { array: false, object: true }],
      'prefer-spread': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-promise-reject-errors': 'warn',
      'eqeqeq': ['warn', 'always'],
      'curly': ['warn', 'all'],
      'brace-style': ['warn', '1tbs', { allowSingleLine: true }],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'semi': ['warn', 'always'],
      'comma-dangle': 'off',
      // 关闭 indent 规则，避免与 Prettier 冲突
      'indent': 'off',
      'space-before-function-paren': [
        'warn',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ],
      'keyword-spacing': ['warn', { before: true, after: true }],
      'space-infix-ops': 'warn',
      'space-unary-ops': ['warn', { words: true, nonwords: false }],
      'arrow-spacing': ['warn', { before: true, after: true }],
      'key-spacing': ['warn', { beforeColon: false, afterColon: true }],
      'comma-spacing': ['warn', { before: false, after: true }],
      'func-call-spacing': ['warn', 'never'],
      'array-bracket-spacing': ['warn', 'never'],
      'object-curly-spacing': ['warn', 'always'],
      'computed-property-spacing': ['warn', 'never'],
      'no-spaced-func': 'warn',
      'no-whitespace-before-property': 'warn',
      'template-curly-spacing': ['warn', 'never'],
      'yield-star-spacing': ['warn', 'both'],
      'rest-spread-spacing': ['warn', 'never'],
      // Import 检查规则 - 检测未定义的导入
      'import/named': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
      'import/no-unresolved': 'off',
      'import/order': 'off'
    }
  },
  {
    files: ['**/*.vue'],
    rules: {
      'no-use-before-define': 'off',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/*.cy.js'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off'
    },
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        cy: 'readonly'
      }
    }
  }
]
