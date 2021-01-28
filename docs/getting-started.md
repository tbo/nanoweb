---
layout: post
title: Getting Started
---

## Installation

The nanoweb utilities are distributed via separate autonomous npm packages: [@nanoweb/template](https://www.npmjs.com/package/@nanoweb/template) and [@nanoweb/links](https://www.npmjs.com/package/@nanoweb/links).

```bash
npm install @nanoweb/template @nanoweb/links
```

### Online editors

You can try out nanoweb without installing anything using an online editor. Below is a link to a complete express showcase:


<a href="https://codesandbox.io/s/determined-noyce-b5fbf" target="_blank">Express Showcase on CodeSandbox</a>

<div class="alert alert-info">

Some editors (e.g. CodeSandbox) require a `/*html*/` comment before the template literal for proper syntax highlighting. You can improve the experience with the plugins outlined under [Tools](./template/08-tools.html).

</div>

The example is also available on <a href="https://github.com/tbo/nanoweb/tree/master/examples/express-showcase" target="_blank">GitHub</a>.

## Importing

`@nanoweb/template` and `@nanoweb/links` run in different environments and therefore support different import options.

### Template
Node.js supports importing via [ECMAScript modules](https://nodejs.org/api/esm.html):
```js
import { html, renderToString } from '@nanoweb/template';
```
... or [CommonJS](https://nodejs.org/docs/latest/api/modules.html):

```js
const { html, renderToString } = require('@nanoweb/template');
```
Choosing a format is a matter of personal preference.

### Links

Using `@nanoweb/links` can be as simple as adding a script tag to a page:
```html
<script src="https://unpkg.com/@nanoweb/links"></script>
```
This will include the latest standalone version of `@nanoweb/links`. Yet it is recommended to import and bundle it with a module bundler (e.g. [Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/) or [Parcel](https://parceljs.org/)).
```js
import links from '@nanoweb/links';

window.addEventListener('DOMContentLoaded', () => {
  links({ defaultLoadingAnimation: true });
});
```
This is the only way to provide `@nanoweb/links` with [options]().

## Echo Example

An example is worth a thousand words:
```bash
$ mkdir echo-demo
$ cd echo-demo
$ npm init # follow the instructions
$ npm install --save @nanoweb/template @nanoweb/links express
```
Save this under `index.js`:
```ts
const express = require("express");
const { renderToStream, html } = require("@nanoweb/template");

const Page = (name) => html`
  <html>
    <head>
      <title>Echo Example</title>
    </head>
    <body style="text-align: center">
      <h1>Echo Example</h1>
      <form method="GET" action="/" autocomplete="off">
        <input type="text" name="name" autofocus />
      </form>
      ${name
        ? html`<b>Hello ${name}!</b>`
        : "Enter your name above and press enter!"}
      <script src="/static/links.standalone.min.js"></script>
    </body>
  </html>
`;

express()
  .use("/static/", express.static("./node_modules/@nanoweb/links/dist/"))
  .get("/", (req, res) => renderToStream(Page(req.query.name)).pipe(res))
  .listen(3000);
```

Run it with:
```bash
$ node index.js
```
You can access it on [http://localhost:3000/](http://localhost:3000/).

To learn more about templates, see [Writing Templates](./template/01-writing-templates.html).
