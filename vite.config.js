import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Әдепкі 5173 портын басқа жоба иеленіп қалуы мүмкін — сонда Vite үнсіз
  // басқа портқа көшіп, 5173-те мүлдем бөгде сайт ашылып тұрады. Сондықтан
  // Focus10-ға өз портын бекітеміз.
  server: {
    port: 5180,
    strictPort: true,
    // /api сұраныстарын Express серверіне жібереміз — сол арқылы браузер
    // үшін бәрі бір origin болып қалады, cookie де қиындықсыз жүреді.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT ?? 3080}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4180,
    strictPort: true,
  },
})
