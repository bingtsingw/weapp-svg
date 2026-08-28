import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outExtensions() {
      return {
        js: '.js',
      };
    },
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
  },
});
