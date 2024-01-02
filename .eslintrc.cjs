module.exports = {
  extends: [
    'airbnb',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // === NextJS overriden rules ===
    '@next/next/no-img-element': 'off',

    // === React rules ===

    // Enforce a defaultProps definition for every prop that is not a required prop
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/require-default-props.md
    'react/require-default-props': [
      'error',
      { ignoreFunctionalComponents: true },
    ],

    // Enforces where React component static properties should be positioned.
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/static-property-placement.md
    'react/static-property-placement': ['error', 'static public field'],

    // Disallow JSX props spreading
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md
    'react/jsx-props-no-spreading': 'warn',

    // only .jsx files may have JSX
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],

    // Disallow JSX no bind
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md
    'react/jsx-no-bind': 'off',

    // === import extension overriden rules ===
    'import/extensions': [
      'error',
      {
        ts: 'never',
        tsx: 'never',
        jsx: 'never',
        css: 'always',
        json: 'always',
      },
    ],

    // sort imports. see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
    // TLDR; sorted by : ['react', 'external packages', 'mapado packages', 'internal']
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@mapado/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: 'mapado-*',
            group: 'external',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],

    // When there is only a single export from a module, prefer using default export over named export.
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/prefer-default-export.md
    'import/prefer-default-export': 'off',

    'import/no-extraneous-dependencies': 'off',

    // === default overriden rules ===

    // Require braces in arrow function body
    // https://eslint.org/docs/rules/arrow-body-style
    'arrow-body-style': 'off',

    // disallow the unary operators ++ and --
    // https://eslint.org/docs/rules/no-plusplus
    'no-plusplus': 'off',

    // Disallow Early Use
    // https://eslint.org/docs/rules/no-use-before-define
    'no-use-before-define': 'off',

    // Allow padding line between statements
    // https://eslint.org/docs/latest/rules/padding-line-between-statements
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: ['return', 'throw'] },
      {
        blankLine: 'always',
        prev: '*',
        next: ['const', 'let', 'var', 'function', 'class', 'block-like'],
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var', 'function', 'class', 'block-like'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
    ],

    'no-console': 'off',
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
      },
    },
  },

  ignorePatterns: ['dist/'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
      },
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'react/static-property-placement': ['error', 'property assignment'],
      },
    },
    {
      files: [
        'setup_tests.js',
        '*.test.js',
        '*.test.ts',
        '**/__mocks__/*.js',
        '**/__mocks__/*.ts',
      ],
      env: { jest: true },
    },
  ],
};
