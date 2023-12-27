import path from 'node:path';
import fs from 'node:fs';
import ejs from 'ejs';
import template from './template';

interface Page {
  path: string;
  languages?: string[];
  defaultLanguage?: string;
  priority?: number;
}

type GetLanguagePath = (page: string, lang: string) => string;

const getUrl = (opts: {
  domain: string;
  page: Page;
  lang: string;
  defaultLanguage?: string;
  getLanguagePath?: GetLanguagePath;
}) => {
  const {
    domain,
    page,
    lang,
    getLanguagePath = (p, l) => {
      return path.join('/', l, p);
    }
  } = opts;
  const defaultLang = page.defaultLanguage || opts.defaultLanguage;
  const pathWithLang = lang && lang !== defaultLang;
  const p = pathWithLang ? getLanguagePath(page.path, lang) : path.join('/', page.path);
  return `https://${domain}${p}`;
};

const generateDomain = async (opts: {
  domain: string;
  languages: string[];
  pages: Page[];
  defaultLanguage?: string;
  getLanguagePath?: GetLanguagePath;
  filename: (domain: string) => string;
}) => {
  const { domain, languages, defaultLanguage, pages, getLanguagePath, filename } = opts;

  const generatePage = (page: Page) => {
    const langs = page.languages || languages;
    // <url>
    const generateLang = (lang: string) => {
      // loc
      const loc = getUrl({
        domain,
        page,
        lang,
        defaultLanguage,
        getLanguagePath
      });

      // rel="alternate"[]
      const alternates = [];

      for (const item of langs) {
        alternates.push({
          lang: item,
          link: getUrl({
            domain,
            page,
            lang: item,
            defaultLanguage,
            getLanguagePath
          })
        });
      }

      return {
        loc,
        priority: page.priority,
        alternates
      };
    };

    const res = [];
    for (const item of (langs.length ? langs : [''])) {
      res.push(generateLang(item));
    }

    return res;
  };

  const res = [];
  for (const item of pages) {
    res.push(...generatePage(item));
  }

  const file = filename(domain);
  const content = ejs
    .render(template, { urls: res })
    .replace(/\n[\r\n\s]+\n/g, '\n')
    .replace(/(^\s+)|(\s+$)/g, '');
  await fs.promises.writeFile(file, content, 'utf-8');
};

export const generate = async (options: {
  domains: string[];
  pages: Page[];
  languages: string[];
  defaultLanguage?: string;
  getLanguagePath?: GetLanguagePath;
  filename: (domain: string) => string;
}) => {
  for (const d of options.domains) {
    await generateDomain({
      domain: d,
      pages: options.pages,
      languages: options.languages,
      defaultLanguage: options.defaultLanguage,
      getLanguagePath: options.getLanguagePath,
      filename: options.filename
    });
  }
};

export type { Page as SitemapPage };
