---
title: Caching templates
slug: caching-templates
---


Some templates might be large, complicated or access external data sources, but don't change that often. In those cases [caching](https://en.wikipedia.org/wiki/Cache_(computing)) is a good technique to safe the cost of frequent, needless template constructions. Since dynamic templates are constructed by normal JavaScript functions [Memoization](https://en.wikipedia.org/wiki/Memoization) is a valid and straight-forward approach to implement caching. The `cache` helper improves on that and caches an optimized/simplified version of the original return value in memory. This further improves the performance and memory efficiency.

<div class="alert alert-info">

`cache` doesn't take changing parameters into account. Provide a cache key via the [cache key option](#cache-key) to handle this properly.

</div>

```js
import { html, renderToString, cache } from '@nanoweb/template';

let counter = 0;
const template = () => html`Counter: ${++counter}`;

const cachedTemplate = cache(template);

renderToString(cachedTemplate())
  .then(text => console.log(text)); // => "Counter: 1";

// time goes by...

renderToString(template()) // Uncached
  .then(text => console.log(text)); // => "Counter: 2";

renderToString(cachedTemplate()) // Cached
  .then(text => console.log(text)); // => "Counter: 1";
```

## Options

### Node Cache

`cache` uses [node-cache](https://github.com/node-cache/node-cache) under the hood and passes [options](https://github.com/node-cache/node-cache#options) through.


```js
import { html, renderToString, cache } from '@nanoweb/template';

let counter = 0;
const template = () => html`Counter: ${++counter}`;

const cachedTemplate = cache(template, { stdTTL: 10 });

renderToString(cachedTemplate())
  .then(text => console.log(text)); // => "Counter: 1";

// Wait 5 seconds ...

renderToString(cachedTemplate())
  .then(text => console.log(text)); // => "Counter: 1";

// Wait another 5 seconds ...

renderToString(cachedTemplate())
  .then(text => console.log(text)); // => "Counter: 2";

```

### Cache key

`cache` doesn't take changing parameters into account, but you can provide a cache key function to solve this.
```js

import { html, renderToString, cache } from '@nanoweb/template';

let counter = 0;
const template = (input) => html`Input: ${input}, Counter: ${++counter}`;

const cacheKey = (input) => String(input);
const cachedTemplate = cache(template, { cackeKey });

renderToString(cachedTemplate('A'))
  .then(text => console.log(text)); // => "Input: A, Counter: 1";

renderToString(cachedTemplate('B'))
  .then(text => console.log(text)); // => "Input: B, Counter: 2";

renderToString(cachedTemplate('A'))
  .then(text => console.log(text)); // => "Input: A, Counter: 1";

```
