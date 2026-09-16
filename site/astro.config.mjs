// // @ts-check
// import { defineConfig } from 'astro/config';

// // https://astro.build/config
// export default defineConfig({});

// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const datumSource = fileURLToPath(
    new URL('../src/datum.js', import.meta.url)
);

// https://astro.build/config
export default defineConfig({
    vite: {
        resolve: {
            alias: [
                {
                    find: /^@psdpainter\/datum-js$/,
                    replacement: datumSource
                }
            ]
        }
    }
});