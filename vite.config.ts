import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile() // هذا السطر ضروري إذا كنت تريد دمج كل شيء في ملف واحد
  ],
})