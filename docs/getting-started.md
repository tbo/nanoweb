---
layout: post
title: Getting Started
slug: getting-started
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

The example is also available on <a href="https://github.com/tbo/nanoweb/tree/master/examples/express-showcase" target="_blank">Github</a>.

## Importing

`@nanoweb/template` and `@nanoweb/links` run in different environments and therefore support different import options.

### Template
NodeJs supports importing via [ECMAScript modules](https://nodejs.org/api/esm.html):
```js
import {html, renderToString} from '@nanoweb/template';
```
... or [CommonJs](https://nodejs.org/docs/latest/api/modules.html):

```js
const {html, renderToString} = require('@nanoweb/template');
```
Choosing a format is a matter of personal preference.

### Links

Using `@nanoweb/links` can be as simple as adding a script tag to a page:
```js
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
```ts
import {html, renderToString} from '@nanoweb/template';

// Define a template
const myTemplate = (name) => html`<p>Hello ${name}</p>`;

// Render the template
renderToString(myTemplate('World'))
  .then(text => console.log(text); // => "<p>Hello World</p>"

```

To learn more about templates, see [Writing Templates](./template/writing-templates).
