import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    root: './frontend',
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './frontend/src'),
            '#shared': path.resolve(__dirname, './shared'),
        },
    },
    server: {
        port: 5173,
        proxy: { '/api': 'http://localhost:3000' },
    },
});
