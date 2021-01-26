---
title: Render templates
slug: render-templates
---

`@nanoweb/template` supports to render modes: string and stream rendering. Each one has its advantages and disadvantages, but rendering to strings is in general easier to use and slightly more resource efficient, whereas rendering to streams can drastically reduce the *time to first byte* ([TTFB](https://en.wikipedia.org/wiki/Time_to_first_byte)).

## Render to String
`renderToString` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) with a string value. Check out the [API documentation](/api/modules/template_src.html#rendertostring) to check out all options.

### Usage
```js
renderToString(html`Hello, World!`).then(text => console.log(text));
```
... or with [async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await):
```js
const text = await renderToString(html`Hello, World!`);
console.log(text);
```
### Examples

```js
express()
  .get('/', async (req, res) => {
    res.send(await renderToString(html`Hello, World!`));
  })
  .listen(3000);
```

[Fastify](https://www.fastify.io/) natively handles promises:
```js
fastify()
  .get('/', () => renderToString(html`Hello, World!`))
  .listen(3000);
```
## Render to Stream
`renderToStream` returns a [Readable](https://nodejs.org/api/stream.html#stream_readable_streams), which can be directly consumed by most frameworks (e.g. [Express](https://expressjs.com/) or [Fastify](https://www.fastify.io/)). When using streams we need to pay special attention to error handling and header manipulation. Due to the nature of Streams some parts of the response can already be sent off to client before all templates have been processed. Some of these issues can circumvented by using HTTP [Trailers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Trailer) or [Redirects](https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx). Check out the [API documentation](/api/modules/template_src.html#rendertostream) to check out all options.

### Usage

This will print the rendered result in chunks:
```js
renderToStream(html`Hello, World!`).pipe(process.stdout);
```
### Examples
```js
express()
  .get('/', (req, res) => {
    renderToStream(html`Hello, World!`).pipe(res);
  })
  .listen(3000);
```

If you are sending a stream and you have not set a 'Content-Type' header, [Fastify](https://www.fastify.io/) will set it to 'application/octet-stream':
```js
fastify()
  .get('/', (request, reply) => {
    reply
      .type('text/html')
      .send(renderToStream(html`Hello, World!`);
  })
  .listen(3000);
```
