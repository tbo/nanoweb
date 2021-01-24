---
title: Recipes
slug: recipes
---

`@nanoweb/links` tries to be indiscernible in its functionality from Multi Page Applications as possible. Yet there are some instances that require a special "touch" to provide the best UX possible.

## Keep scroll position despite page transition

Static web pages reset the scroll position on every page navigation. This can be quite disruptive if only very change occurred. You can opt-out of this default behavior by annotating links with a `replace` data attribute:
```html
<a href="..." data-replace >...</a>
```

## Preloading

Preloading pages can make a big impact on the perceived performance of a website. Due to nanoweb's reliance on standard HTML it is possible to select from a number of different techniques and tools. Most approaches are based on [Resource Hints](https://www.smashingmagazine.com/2019/04/optimization-performance-resource-hints/). Yet it is not always easy to guess which pages to preload. There are a number of libs that can help you with this:

- [Quicklink](https://getquick.link/)
- [InstantClick](http://instantclick.io/)
- [instant.page](https://instant.page/)

`@nanoweb/links` standalone bundle ships with [instant.page](https://instant.page/) by default.

## Opt-out of DOM updates

Manual changes to the DOM will always be overridden by any following page transition. This can result in UI components loosing their visual state (e.g. closing Accordions or Dropdowns). To avoid these issues [WebComponents](https://www.webcomponents.org/introduction) can be used to encapsulate UI state. `@nanoweb/links` will not mutate any elements contained inside a [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

```js
class Toggle extends HTMLElement {
  constructor() {
    super();
    const toggleButton = document.createElement('BUTTON');
    const slot = document.createElement('SLOT');
    const root = this.attachShadow({ mode: 'open' });
    toggleButton.innerText = 'Click here to toggle';
    const toggle = () => {
        slot.style.display =
            slot.style.display === 'none' ? 'block' : 'none';
    }
    toggleButton.addEventListener('click', toggle);
    toggle();
    root.appendChild(toggleButton);
    root.appendChild(slot);
  }
}

window.customElements.define('x-toggle', Toggle);
```
This toggle component will retain its UI state even if other parts of the page or its children are being updated. Usage:
```html
<x-toggle>
  This will be visible once you click on the button.
<x-toggle>
```

## Opt-out of optimistic updates

To improve the perceived performance of page navigations `@nanoweb/links` applies optimistic updates. It will use a cached version first (if available) and replace it later seamlessly with an up-to-date version. This works well for pages that change infrequently. Yet elements that do change frequently can cause a visible flicker. You can add the `lazy` data attribute to opt-out certain elements from optimistic updates.

```html
<div>
    Items in basket: <span data-lazy>6</span>
</div>
```

## Animate page transitions

`@nanoweb/links` adds an `is-loading` class to the body element while a page transition is in progress. This can be used to animate the transition:
```css
body {
  transition: opacity 150ms ease-in 16ms;
}

body.is-loading {
  opacity: 0.75;
}
```
A default animation is already included and can be used by setting the `defaultLoadingAnimation` option.

```js
import links from './links';

window.addEventListener('DOMContentLoaded', () => {
  links({ defaultLoadingAnimation: true });
});
```

## Handle conflicting revisions

User sessions can be surprisingly long. This is usually not a problem for MPAs, because all resources are being reevaluated on every request. SPAs however have to handle updated APIs and bundles. `@nanoweb/links` is not directly affected by this, because it can handle any form of HTML. Yet your frontend components might be impacted. You can handle these scenarios by adding an revision ID for every release.

```js
import links from './links';

window.addEventListener('DOMContentLoaded', () => {
  links({ revision: '4.2'});
});
```

`@nanoweb/links` will then check the `X-REVSISION` header on every response. A fullpage load is triggered, if both values are defined (links configuration and revision header) but differ.

