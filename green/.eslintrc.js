module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],

  parserOptions: {
    ecmaVersion: 2020
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-multiple-template-root': 0,
    'prettier/prettier': [
      'error',
      {
        singleQuote: false,
        semi: true,
        useTabs: true,
        tabWidth: 2,
        trailingComma: 'all',
        printWidth: 90,
        bracketSpacing: true,
        arrowParens: 'avoid',
      },
    ],
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ],

  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ]
}
