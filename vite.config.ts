import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import cssAutoImport from 'vite-plugin-css-auto-import'
import path from 'node:path'

const config = defineConfig({
  plugins: [
    cssAutoImport({
      styleExtensions: ['.module.scss'],
      matchComponentName: true,
      shouldTransformComponent(filename, filepath) {
        const shouldTransform = !filepath.startsWith('\x00') && filename.includes('.tsx') && !filename.startsWith('__') && (filepath.includes('/routes/') || filepath.includes('/components/'));
        if (shouldTransform) {
          console.log({ filename, filepath, shouldTransform });
        }
        return Promise.resolve(shouldTransform);
      },
      resolveStyleForComponent(_componentName, _directoryName, filePath) {
        // 1. Remove any query parameters (e.g., ?tsr-split=component)
        const cleanPath = filePath.split('?')[0];

        // 2. Parse the path to get the directory and the filename without extension
        const { dir, name } = path.parse(cleanPath);

        // 3. Construct the new path: /original/path/to/filename.module.scss
        // This ensures it stays in the "same dir" as requested.
        const stylepath = path.join(dir, `${name}.module.scss`);

        console.log({stylepath, _componentName})
        return {
          isModule: true,
          filePath: stylepath
        }
      },
    }),
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart(),
    viteReact(),
  ],
  css: {
    modules: {
      localsConvention: 'dashes',
      generateScopedName: '[name]__[local]__[hash:5]',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})

export default config
