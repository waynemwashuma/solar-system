import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    port: 8082,
    strictPort: true,
    open: "./index.html",
    base: isBuild ? '/solar-system/' : '/'
  }
})