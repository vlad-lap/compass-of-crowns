// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

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
                    prefix: 'coiaf',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'coiaf',
                    style: 'kebab-case',
                },
            ],
            '@angular-eslint/prefer-inject': 'off',
            '@typescript-eslint/consistent-type-definitions': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    default: [
                        'public-static-field',
                        'public-instance-field',
                        'protected-static-field',
                        'protected-instance-field',
                        'private-static-field',
                        'private-instance-field',
                        'public-constructor',
                        'private-constructor',
                        'public-instance-method',
                        'protected-instance-method',
                        'private-instance-method',
                    ],
                },
            ],
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': 'allow-with-description',
                    'ts-nocheck': 'allow-with-description',
                    'ts-check': 'allow-with-description',
                },
            ],
            '@typescript-eslint/no-explicit-any': [
                'error',
                {
                    ignoreRestArgs: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowTernary: true,
                    allowShortCircuit: true,
                },
            ],
            curly: 'error',
            'guard-for-in': 'error',
            'max-len': [
                'error',
                {
                    code: 140,
                },
            ],
            'no-caller': 'error',
            'no-bitwise': 'error',
            'no-console': [
                'error',
                {
                    allow: ['warn', 'error', 'assert'],
                },
            ],
            'no-debugger': 'error',
            'no-shadow': 'off',
            'no-throw-literal': 'off',
            'no-fallthrough': 'error',
            'no-trailing-spaces': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            quotes: [
                'error',
                'single',
                {
                    avoidEscape: true,
                },
            ],
            eqeqeq: [
                'error',
                'always',
                {
                    null: 'ignore',
                },
            ],
            'no-duplicate-imports': 'error',
        },
    },
    {
        files: ['**/*.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
        rules: {},
    },
]);
