import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/static/', // Указывает базовый URL для размещения статических ресурсов
  plugins: [react()],
})
