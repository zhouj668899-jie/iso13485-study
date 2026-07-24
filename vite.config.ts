import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // './' 让构建产物使用相对路径，部署到 GitHub Pages 子路径也能正确加载
  base: './',
  plugins: [react(), tailwindcss()],
})
