const express = require('express');
const app = express();
const { html, cache, renderToString } = require('@nanoweb/template');
const fetch = require('node-fetch');

const Header = () => html/*html*/ `
  <nav class="navbar navbar-dark bg-dark">
    <a class="navbar-brand" href="/">Nanoweb Demo</a>
    Header cached at: ${new Date().toLocaleTimeString()}
  </nav>
  <nav class="navbar navbar-light bg-light">
    <div class="nav-item fg-light">
      Examples:
      <a href="/" style="margin: 0 30px;">Web Component</a>
      <a href="/form">Form</a>
    </div>
  </nav>
`;

const CachedHeader = cache(Header);

const Page = (title, ...children) => html/*html*/ `
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

const WebComponentExample = () => html/*html*/ `
  <div style="display: grid; place-items: center; height: 300px">
    <x-counter>
      <button type="button" class="btn btn-primary" style="margin-right: 30px">
        Increase
      </button>
    </x-counter>
  </div>
`;

const SearchResult = async search => {
  const response = await (
    await fetch(
      'https://latency-dsn.algolia.net/1/indexes/ikea?x-algolia-api-key=6be0576ff61c053d5f9a3225e2a90f76&x-algolia-application-id=latency&hitsPerPage=150&query=green',
    )
  ).json();

  console.log(response.hits);
  return html`<div>${response.hits.map(hit => hit.name)}</div>`;
};

const FormExample = req => {
  const { search } = req.query;
  return html/*html*/ `
    <div style="text-align: center;">
      <form method="GET" action="/form">
        <input
          type="text"
          placeholder="Search term"
          name="search"
          oninput="this.form.dispatchEvent(new Event('submit', {bubbles: true}))"
          value="${search}"
          autocomplete="off"
          autofocus
        />
      </form>
      ${search ? SearchResult(search) : html`Enter a search term above`}
    </div>
  `;
};

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
  .get('/', render(WebComponentExample))
  .get('/form', render(FormExample));

app.listen(8080);
