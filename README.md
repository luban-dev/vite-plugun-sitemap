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
        domains: [
          'www.test.com'
        ],
        pages: [
          {
            path: '/',
            // languages: ['zh-CN', 'en-US'],
            // defaultLanguage: 'zh-CN',
            priority: 1.0
          }
        ],
        languages: ['zh-CN', 'en-US'],
        defaultLanguage: 'zh-CN',
        getLanguagePath: (page: string, lang: string) => `${lang}${page}`,
        filename: (domain: string) => `sitemap.xml`
      })
    ]
    // ...others
  };
});
