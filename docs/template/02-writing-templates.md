---
title: Writing templates
slug: writing-templates
---

`@nanoweb/template` is a templating library that provides fast, efficient rendering of asynchronous HTML components. It lets you express web UI as a function of data.

This section introduces the main features and concepts in `@nanoweb/template`.


## Render static HTML

The simplest thing to do in `@nanoweb/template` is to render some static HTML.

```js
import {html, renderToString} from '@nanoweb/template';

// Declare a template
const myTemplate = html`<div>Hello World</div>`;

// Render the template
renderToString(myTemplate)
  .then(text => console.log(text)); // Use the result
```

The template is a [_tagged template literal_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). The template itself looks like a regular JavaScript string, but enclosed in backticks (`` ` ``) instead of quotes. The browser passes the string to `@nanoweb/template`'s `html` tag function.

The `html` tag function returns a `Template`—a lightweight object that represents the template to be rendered.

The `renderToString` function resolves any asynchronous calls and returns a compiled string.

## Render dynamic text content

You can't get very far with a static template. `@nanoweb/template` lets you create bindings using <code>${<em>expression</em>}</code> placeholders in the template literal:

```js
const aTemplate = html`<h1>${title}</h1>`;
```

To make your template dynamic, you can create a _template function_. Call the template function any time your data changes.

```js
import {html, renderToString} from '@nanoweb/template';

// Define a template function
const myTemplate = (name) => html`<div>Hello ${name}</div>`;

// Render the template with some data
renderToString(myTemplate('world'))
  .then(text => console.log(text)); // => "<div>Hello world</div>"

// ... Later on ...
// Render the template with different data
renderToString(myTemplate('there'))
  .then(text => console.log(text)); // => "<div>Hello there</div>"
```

When you call the template function, `@nanoweb/template` captures the current expression values. The template function returns a `Template` that's a function of the input data. This is one of the main principles behind using `@nanoweb/template`: **creating UI as a _function_ of state**.

## Using expressions

The previous example shows interpolating a simple text value, but the binding can include any kind of JavaScript expression:

```js
const myTemplate = (subtotal, tax) =>
  html`<div>Total: ${subtotal + tax}</div>`;

const myTemplate2 = (name) =>
  html`<div>${formatName(name.given, name.family, name.title)}</div>`;
```

Expression values can have the following atomic types or any variation of them in lists and promises:

- `string`
- `number`
- `boolean`
- `undefined`
- `null`
- `Template`
- `UnsafeHtml`

## Nest and compose templates

You can also compose templates to create more complex templates. When a binding in the text content of a template returns a `Template`, the `Template` is interpolated in place.

```js
const myHeader = html`<h1>Header</h1>`;
const myPage = html`
  ${myHeader}
  <div>Here's my main page.</div>
`;
```

You can use any expression that returns a `Template`, like another template function:

```js
// some complex view
const myListView = (items) => html`<ul>...</ul>`;

const myPage = (data) => html`
  ${myHeader}
  ${myListView(data.items)}
`;
```

Composing templates opens a number of possibilities, including conditional and repeating templates.

### Conditional templates

`@nanoweb/template` has no built-in control-flow constructs. Instead you use normal JavaScript expressions and statements.

#### Conditionals with ternary operators

Ternary expressions are a great way to add inline conditionals:

```js
html`
  ${user.isloggedIn
      ? html`Welcome ${user.name}`
      : html`Please log in`
  }
`;
```


#### Conditionals with if statements

You can express conditional logic with if statements outside of a template to compute values to use inside of the template:

```js
getUserMessage() {
  if (user.isloggedIn) {
    return html`Welcome ${user.name}`;
  } else {
    return html`Please log in`;
  }
}

html`
  ${getUserMessage()}
`
```

#### Guard statements

You can add guard statements to display certain values if certain conditions are met or nothing if not. Falsy values are
ignored by `html`.
```js
html`Welcome ${user.isLoggedIn && user.name}`
```
### Repeating templates

You can use standard JavaScript constructs to create repeating templates.

####  Repeating templates with Array.map

To render lists, you can use `Array.map` to transform a list of data into a list of templates:

```js
html`
  <ul>
    ${items.map((item) => html`<li>${item}</li>`)}
  </ul>
`;
```

Note that this expression returns an array of `Template` objects. `nanoweb/template` will render an array of subtemplates and other values.

#### Repeating templates with looping statements

You can also build an array of templates and pass it into a template binding.

```js
const itemTemplates = [];
for (const i of items) {
  itemTemplates.push(html`<li>${i}</li>`);
}

html`
  <ul>
    ${itemTemplates}
  </ul>
`;
```

## Asynchronous templates

Most applications have to reach out to other systems to query for or persist data and therefore often have to handle [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). `@nanoweb/template` makes consuming promises a breeze:

```js
const fetchPost = async (postId) => {
  const response = await fetch(`/api/posts/${id}`);
  return response.json();
}

const getPost = async (postId) => {
  const post = await fetchPost(postId);
  return html`<h1>${post.title}</h1>...`;
}

html`
  <header>My Blog<header>
  <main>
    ${getPost(42)}
  </main>
  <footer>Fancy Footer</footer>
`;
```

`renderToString` collects all templates upfront and tries to execute them as deep as possible. This guarantees best
possible execution plan.

```js
const asyncTemplate = (waitFor) =>
  new Promise(resolve =>
    setTimeout(() => resolve(html`This took ${waitFor}ms`), waitFor)
  );

const page = html`
  <header>${asyncTemplate(200)}<header>
  <main>${asyncTemplate(100)}</main>
  <footer>${asyncTemplate(50)}</footer>
`;

// This should take about 200ms to resolve
renderToString(page).then(text => console.log(text));
```

## Render unsafe strings

`html` escapes all string expressions by default to thwart [XSS attacks](https://owasp.org/www-community/attacks/xss/). Yet sometimes we want to allow arbitrary html strings to be embedded in our html templates. `@nanoweb/template` provides `unsafeHtml` for this. Wrapping any string expression with it will exclude this particular string from being escaped.

```js

// Safe
html`
  Hello
  ${'mamalicious_user42<script>alert("possible xss attack")</script>'}
`

// Unsafe
html`
  This is
  ${unsafeHtml('<b>UNSAFE</b>'}
  ${unsafeHtml('<script>alert("possible xss attack")</script>'}
`
```
