---
layout: post
title: Getting Started
slug: getting-started
---

## Installation

The template utilities are distributed on npm, in the [@nanoweb/template package](https://www.npmjs.com/package/@nanoweb/template).

```bash
npm install @nanoweb/template
```

<!-- ### Online editors -->
<!--  -->
<!-- You can try out lit-html without installing anything using an online editor. Below are links to a simple lit-html starter project in some popular online editors: -->
<!--  -->
<!-- *   [CodeSandbox](https://codesandbox.io/s/wq2wm73o28){:target="_blank"} -->
<!-- *   [JSBin](https://jsbin.com/nahocaq/1/edit?html,output){:target="_blank"} -->
<!-- *   [StackBlitz](https://stackblitz.com/edit/js-pku9ae?file=index.js){:target="_blank"} -->

## Rendering a Template

`@nanoweb/template` has two main APIs:

*   The `html` template tag used to write templates.
*   The `renderToString()` function used to render a template and return it as a string.

```ts
// Import lit-html
import {html, renderToString} from '@nanoweb/template';

// Define a template
const myTemplate = (name) => html`<p>Hello ${name}</p>`;

// Render the template
renderToString(myTemplate('World'))
  .then(text => console.log(text); // => "<p>Hello World</p>"

```

To learn more about templates, see [Writing Templates](./writing-templates).

[lit-html package]: https://www.npmjs.com/package/lit-html
