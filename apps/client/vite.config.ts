import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() || 'http://localhost:3001';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // Relative baseURL `/api/v1` → NestJS global prefix `/v1`
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
        },
      },
    },
  };
});
