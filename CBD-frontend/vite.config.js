import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 允许通过 .env.local 的 BACKEND_PORT 覆盖代理目标，默认 3000
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.BACKEND_PORT || '3000'

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false
        },
        '/string-api': {
          target: 'https://string-db.org/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/string-api/, ''),
          secure: false
        }
      }
    }
  }
})
