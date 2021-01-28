---
layout: post
title: nanoweb
---

## What is nanoweb?

nanoweb is a minimal library for building server-centric multi page web applications that behave like SPAs.

- **HTML-over-the-wire**: Merges HTML responses instead of replacing the complete page.
- **Based on standards**: Doesn't reinvent the wheel. It uses [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
- **Minimal**: Currently 560 LOC and the API consists of **only 5 functions**.
- **Component-based**: Build encapsulated components, then compose them to make complex UIs.

nanoweb's ideas can be freely combined with other server-centric frameworks while avoiding a technology lock-in, which makes it a perfect fit for [micro-frontends](https://martinfowler.com/articles/micro-frontends.html).

## Motivation

Frontend development has become increasingly complex over the past few years and the time required to manage this **complexity often goes at the expense of the user experience**. The amount of JavaScript and related payloads doesn't seem to be tenable in a time where the mobile web traffic eclipses that of desktops. [React](https://reactjs.org/), [Vue.js](https://vuejs.org/) and [Angular](https://angular.io/) are great frameworks, yet they are primarily geared towards highly interactive and long-running web applications. Anything outside of this scope has to live with the diminishing returns of those frameworks.

This sentiment is shared by [more](https://macwright.com/2020/05/10/spa-fatigue.html) and [more people](https://twitter.com/dan_abramov/status/1259614150386425858) while new initiatives pop up: [Hotwire](https://hotwire.dev/), [Phoenix LiveView](https://github.com/phoenixframework/phoenix_live_view), [React Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html), [Livewire](https://laravel-livewire.com/). These solutions are usually rooted in pre-existing frameworks that add more abstraction. nanoweb, on the other hand, is just a small **set of documented and tested helper functions for the framework-fatigued**.

nanoweb consists of [two packages](https://www.npmjs.com/search?q=%40nanoweb) which can be used together or separately in combination with other frameworks.

## Links
The [nanoweb links package](https://www.npmjs.com/package/@nanoweb/links) makes navigating your web application faster. You get the performance benefits of a single page application without the added complexity of a client-side JavaScript framework. Use HTML to render your views on the server side and link to pages as usual. When you follow a link, `@nanoweb/links` automatically fetches the page, merges it into the current page, all without incurring the cost of a full page load. Besides performance optimizations and loading animations the page interaction will be indistinguishable from a static page.

The real benefit of this solution kicks in once we need to keep state on the client. It is not required to repeatedly rehydrate the frontend anymore. We can keep the UI state always in memory and avoid flashing content. It shares some resemblance with [Turbolinks](https://github.com/turbolinks/turbolinks). But instead of simply swapping `body` content, we merge it with [morphdom](https://github.com/patrick-steele-idem/morphdom) to avoid loosing form state.

## Templates

Templates are tagged [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) - they look like JavaScript strings but are enclosed in backticks (`` ` ``) instead of quotes - and tagged with `@nanoweb/template`'s `html` tag:

```js
html`<h1>Hello ${name}</h1>`
```

Since templates almost always need to merge in data from JavaScript values, they'll most often be written within functions that take some data and return a template, so that the function can be called multiple times:

```js
const myTemplate = (data) => html`
  <h1>${data.title}</h1>
  <p>${data.body}</p>
`;
```
Template values are not limited to primitive data types, but they can contain [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) as well.
```js
const fetchUsername = async (userId) => { [... fetch from DB ...] };

const myTemplate = (userId) => html`
  <div>Username: ${fetchUsername(userId)}</div>
`;
```

`html` returns a `Template`, which can be transformed into a string by passing it to `renderToString`.
```js
const result = myTemplate({title: 'Hello', body: 'nanoweb is cool'});
const text = await renderToString(result);
```
Ready to try it yourself? Head over to [Getting Started](/getting-started.html).
