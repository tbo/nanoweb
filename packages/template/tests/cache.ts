import cache from '../src/cache';
import { html, Template, renderToString, RenderOptions } from '../src/index';

const nextTick = () => new Promise(resolve => setImmediate(resolve));

const matchSnapshot = async (getComponent: () => Template | Promise<Template>, options?: RenderOptions) =>
  expect(await renderToString(getComponent(), options)).toMatchSnapshot();

describe('Cache templates', () => {
  test('without options', async () => {
    let counter = 0;
    const Component = () => html`Counter: ${++counter}`;
    const cachedComponent = cache(Component);
    await matchSnapshot(cachedComponent);
    await nextTick();
    await matchSnapshot(cachedComponent);
  });

  test('with TTL option', async () => {
    let counter = 0;
    const Component = () => html`Counter: ${++counter}`;
    const cachedComponent = cache(Component, { stdTTL: 0.1 });
    await matchSnapshot(cachedComponent);
    await nextTick();
    await matchSnapshot(cachedComponent);
    await new Promise(resolve => setTimeout(resolve, 120));
    await matchSnapshot(cachedComponent);
  });

  test('with cache key generator', async () => {
    let counter = 0;
    const Component = (id: string) => html`ID: ${id}, Counter: ${++counter}`;
    const cachedComponent = cache(Component, { cacheKey: (id: string) => id });
    await matchSnapshot(() => cachedComponent('A'));
    await nextTick();
    await matchSnapshot(() => cachedComponent('B'));
    await nextTick();
    await matchSnapshot(() => cachedComponent('A'));
  });
});
