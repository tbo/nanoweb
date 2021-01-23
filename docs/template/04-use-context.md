---
title: Use context
slug: use-context
---

`@nanoweb/template` has no own solution for broadcasting data across function boundaries as for example [React](https://reactjs.org/docs/context.html) does, but it pairs very well with [AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#async_hooks_class_asynclocalstorage).

## Example

```js
const { renderToString, html } = require("@nanoweb/template");
const { AsyncLocalStorage } = require("async_hooks");
const express = require("express");

const asyncLocalStorage = new AsyncLocalStorage();

const UrlPanel = () => {
  const req = asyncLocalStorage.getStore().req;
  return html`<p>Requested Url: ${req.url}</p>`;
};

express()
  .use((req, res) => {
    asyncLocalStorage.run({ req, res }, async () => {
      res.send(await renderToString(html`<div>${UrlPanel()}</div>`));
    });
  })
  .listen(3000);
```
