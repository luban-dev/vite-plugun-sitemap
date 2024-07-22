// src/index.ts
import process from "process";
import path2 from "path";

// src/sitemap/sitemap.ts
import path from "path";
import fs from "fs";
import ejs from "ejs";

// src/sitemap/template.ts
var template_default = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <% urls.forEach(function(url){ %>
  <url>
    <loc><%= url.loc %></loc>
    <% url.alternates.forEach(function(alternate){ %>
    <xhtml:link rel="alternate" hreflang="<%= alternate.lang %>" href="<%= alternate.link %>" />
    <% }); %>   
    <priority><%= \`\${url.priority || 1.0}\` %></priority>
  </url>
  <% }); %>
</urlset>
`;

// src/sitemap/sitemap.ts
var getUrl = (opts) => {
  const {
    domain,
    page,
    lang,
    getLanguagePath = (p2, l) => {
      return path.join("/", l, p2);
    }
  } = opts;
  const defaultLang = page.defaultLanguage || opts.defaultLanguage;
  const pathWithLang = lang && lang !== defaultLang;
  const p = pathWithLang ? getLanguagePath(page.path, lang) : path.join("/", page.path);
  return `https://${domain}${p}`;
};
var generateDomain = async (opts) => {
  const { domain, languages, defaultLanguage, pages, getLanguagePath, filename } = opts;
  const generatePage = (page) => {
    const langs = page.languages || languages;
    const generateLang = (lang) => {
      const loc = getUrl({
        domain,
        page,
        lang,
        defaultLanguage,
        getLanguagePath
      });
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
    const res2 = [];
    for (const item of langs.length ? langs : [""]) {
      res2.push(generateLang(item));
    }
    return res2;
  };
  const res = [];
  for (const item of pages) {
    res.push(...generatePage(item));
  }
  const file = filename(domain);
  const content = ejs.render(template_default, { urls: res }).replace(/\n[\r\n\s]+\n/g, "\n").replace(/(^\s+)|(\s+$)/g, "");
  await fs.promises.writeFile(file, content, "utf-8");
};
var generate = async (options) => {
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

// src/index.ts
var sitemapPlugin = (options) => {
  let root = "";
  let stop;
  return {
    name: "luban:sitemap",
    configResolved: (conf) => {
      root = conf.root;
    },
    buildStart: () => {
      const started = !!process.env.LUBAN_SITEMAP_PLUGIN_STARTED;
      if (started) {
        return;
      }
      generate({
        domains: options.domains,
        pages: options.pages,
        languages: options.languages,
        defaultLanguage: options.defaultLanguage,
        getLanguagePath: options.getLanguagePath,
        filename: options.filename || ((d) => {
          if (options.domains.length > 1) {
            return path2.resolve(root, `public/${d}.sitemap.xml`);
          }
          return path2.resolve(root, `public/sitemap.xml`);
        })
      });
      process.env.LUBAN_SITEMAP_PLUGIN_STARTED = "true";
    },
    buildEnd: () => {
      stop?.();
    }
  };
};
var src_default = sitemapPlugin;
export {
  src_default as default
};
