import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    target: 'https://quick-court-wrx0.onrender.com', // Your Render backend URL
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix when forwarding
                },
            },
        },
        build: {
            // Use terser for smaller production bundles and strip console/debugger
            minify: isProd ? 'terser' : false,
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
                format: {
                    comments: false,
                },
            },
            // Split vendor code into separate chunks for better caching
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('react')) return 'vendor_react';
                            return 'vendor';
                        }
                    },
                },
            },
            sourcemap: !isProd,
            brotliSize: isProd,
        },
    };
});
