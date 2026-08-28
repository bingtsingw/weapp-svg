import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts'],
  },
  staged: {
    '**/*.{js,jsx,ts,tsx}': 'vp check',
    '**/*.{html,css,md,json}': 'vp fmt',
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ['typescript'],
    env: {
      node: true,
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  fmt: {
    printWidth: 120,
    proseWrap: 'never',
    singleQuote: true,
  },
});
