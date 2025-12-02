import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:4000',
            '/ws': {
                target: 'http://localhost:4000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    plugins: [react(), tailwindcss()],
})