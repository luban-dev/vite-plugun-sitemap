import { Plugin } from 'vite';

interface Page {
    path: string;
    languages?: string[];
    defaultLanguage?: string;
    priority?: number;
}

interface Options {
    domains: string[];
    pages: Page[];
    languages: string[];
    defaultLanguage?: string;
    getLanguagePath?: (page: string, lang: string) => string;
    filename?: (domain: string) => string;
}
declare const sitemapPlugin: (options: Options) => Plugin;

export { type Options, sitemapPlugin as default };
