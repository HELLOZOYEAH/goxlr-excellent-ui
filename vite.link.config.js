import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// The GoXLR Link window (gaming PC), built on its own so goxlr-link can embed just this:
//   npm run build:link   ->  dist-link/  (copy into goxlr-utility/link/web/)
export default defineConfig({
    plugins: [vue()],
    base: './',
    // The main app's public files (device images ...) aren't used here
    publicDir: false,
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist-link',
        emptyOutDir: true,
        rollupOptions: {
            input: fileURLToPath(new URL('./link.html', import.meta.url)),
        },
    },
})
