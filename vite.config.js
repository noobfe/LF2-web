import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    base: './',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        target: 'es2020',
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('jquery') || id.includes('jszip')) return 'vendor';
                },
            },
        },
    },
    optimizeDeps: {
        include: ['jquery', 'jquery-ui', 'jszip'],
    },
    server: {
        port: 3000,
    },
});
