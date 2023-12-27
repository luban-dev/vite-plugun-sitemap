export default `
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
