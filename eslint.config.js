import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import stylisticJs from '@stylistic/eslint-plugin-js'


export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.browser } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { '@stylistic/js': stylisticJs },
    rules: {
      'no-console': ['error', { allow: ['info', 'error'] }],
      'no-var': 'error',
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    },
  }
]);