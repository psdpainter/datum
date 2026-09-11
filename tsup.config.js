import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/datum.js'],
  format: ['esm', 'iife'],
  globalName: 'Datum',
  minify: true,
  clean: true,
  outExtension({ format }) {
    if (format === 'iife') {
      return { js: '.min.js' }; // Outputs dist/datum.min.js
    }
    return { js: '.js' };       // Outputs dist/datum.js (ESM)
  },
});