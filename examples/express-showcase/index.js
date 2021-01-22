const express = require('express');
const app = express();
const { html, cache, renderToString } = require('@nanoweb/template');
const CounterExample = require('./pages/counter');
const LiveSearchExample = require('./pages/search');

const Header = () => html`
  <nav class="navbar navbar-dark bg-dark">
    <a class="navbar-brand" href="/">Nanoweb Demo</a>
    Header cached at: ${new Date().toLocaleTimeString()}
  </nav>
  <nav class="navbar navbar-light bg-light">
    <div class="nav-item fg-light">
      Examples:
      <a href="/" style="margin: 0 30px;">Web Component</a>
      <a href="/search">Live Search</a>
    </div>
  </nav>
`;

const CachedHeader = cache(Header);

const Page = (title, ...children) => html`
  <html>
    <head>
      <title>${title}</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/flatly/bootstrap.min.css" />
    </head>
    <body>
      ${CachedHeader()} <br />
      ${children}
      <script src="/nanoweb/links.standalone.min.js"></script>
    </body>
  </html>
`;

const addWebComponentScripts = (text, webComponents) => {
  const scripts = webComponents.map(name => `<script src="/web-components/${name}.js"></script>`);
  return text.replace('</body>', scripts + '</body>');
};

const render = handler => async (req, res) =>
  res.send(
    await renderToString(Page('Nanoweb Demo', await handler(req, res)), {
      transformResult: addWebComponentScripts,
    }),
  );

app
  .use('/web-components', express.static('web-components/'))
  .use('/nanoweb/', express.static('./node_modules/@nanoweb/links/dist/'))
  .get('/', render(CounterExample))
  .get('/search', render(LiveSearchExample));

app.listen(8080);
