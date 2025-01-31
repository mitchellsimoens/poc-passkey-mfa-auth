import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    ignores: ['**/lib/', '**/dist/', 'coverage/', 'public/'],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      'prettier/prettier': ['error', { singleQuote: true }],
      '@stylistic/lines-between-class-members': [
        'error',
        {
          enforce: [
            {
              blankLine: 'always',
              prev: '*',
              next: 'method',
            },
          ],
        },
      ],
      'no-async-promise-executor': 'off',
      'no-case-declarations': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement > ReturnStatement',
          message: 'One line conditional with return is not permitted.',
        },
      ],
    },
  },
];
