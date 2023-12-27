"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_node_process = __toESM(require("process"), 1);
var import_node_path2 = __toESM(require("path"), 1);

// src/sitemap/sitemap.ts
var import_node_path = __toESM(require("path"), 1);
var import_node_fs = __toESM(require("fs"), 1);
var import_ejs = __toESM(require("ejs"), 1);

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
      return import_node_path.default.join("/", l, p2);
    }
  } = opts;
  const defaultLang = page.defaultLanguage || opts.defaultLanguage;
  const pathWithLang = lang && lang !== defaultLang;
  const p = pathWithLang ? getLanguagePath(page.path, lang) : import_node_path.default.join("/", page.path);
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
  const content = import_ejs.default.render(template_default, { urls: res }).replace(/\n[\r\n\s]+\n/g, "\n").replace(/(^\s+)|(\s+$)/g, "");
  await import_node_fs.default.promises.writeFile(file, content, "utf-8");
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
      const started = !!import_node_process.default.env.LUBAN_SITEMAP_PLUGIN_STARTED;
      if (started) {
        return;
      }
      generate({
        domains: options.domains,
        pages: options.pages,
        languages: options.languages,
        defaultLanguage: options.defaultLanguage,
        getLanguagePath: options.getLanguagePath,
        filename: (d) => {
          if (options.domains.length > 1) {
            return import_node_path2.default.resolve(root, `${d}.sitemap.xml`);
          }
          return import_node_path2.default.resolve(root, `sitemap.xml`);
        }
      });
      import_node_process.default.env.LUBAN_SITEMAP_PLUGIN_STARTED = "true";
    },
    buildEnd: () => {
      stop?.();
    }
  };
};
var src_default = sitemapPlugin;
