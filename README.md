# Generate sitemap for vite site

## Install

```sh
npm i -D vite @luban-ui/vite-plugun-sitemap
```

## Create config file

```ts
import { defineConfig } from 'vite';
import sitemap from '@luban-ui/vite-plugun-sitemap';

// vite.config.ts
export default defineConfig(() => {
  const root = __dirname;

  return {
    root,
    server: {
      host: '0.0.0.0',
      port: 5174
    },
    resolve: {
      alias: {
        '@': root
      }
    },
    plugins: [
      sitemap({
        files: [
          '**/*.module.scss'
        ],
        namedExports: true
      })
    ]
    // ...others
  };
});
