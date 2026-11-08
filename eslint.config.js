// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

function boundaries(rules) {
  return Object.entries(rules).map(([files, group]) => ({
    files: [files],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group, message: 'Import interdit par les frontières d’architecture.' }] },
      ],
    },
  }));
}

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  // Frontières d'architecture (docs/adr/0004) : une couche n'importe que ce qui est en dessous d'elle.
  ...boundaries({
    'src/app/core/**/*.ts': ['@features/*'],
    'src/app/shared/**/*.ts': ['@features/*'],
    'src/app/features/admin/**/*.ts': [
      '@features/showcase/*',
      '@features/platform/*',
      '@features/alerts/*',
      '@features/account/*',
    ],
    'src/app/features/showcase/**/*.ts': [
      '@features/admin/*',
      '@features/platform/*',
      '@features/listings/*',
      '@features/alerts/*',
      '@features/account/*',
      '@features/auth/*',
      '@features/employer/*',
    ],
    'src/app/features/auth/**/*.ts': [
      '@features/admin/*',
      '@features/platform/*',
      '@features/showcase/*',
      '@features/listings/*',
      '@features/alerts/*',
      '@features/account/*',
      '@features/employer/*',
    ],
    'src/app/features/listings/**/*.ts': [
      '@features/admin/*',
      '@features/platform/*',
      '@features/showcase/*',
      '@features/alerts/*',
      '@features/account/*',
      '@features/employer/*',
    ],
    'src/app/features/alerts/**/*.ts': [
      '@features/admin/*',
      '@features/platform/*',
      '@features/showcase/*',
      '@features/account/*',
      '@features/employer/*',
    ],
    'src/app/features/account/**/*.ts': [
      '@features/admin/*',
      '@features/platform/*',
      '@features/showcase/*',
      '@features/alerts/*',
      '@features/employer/*',
    ],
    'src/app/features/employer/**/*.ts': [
      '@features/admin/*',
      '@features/platform/*',
      '@features/showcase/*',
      '@features/alerts/*',
      '@features/account/*',
    ],
  }),
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
