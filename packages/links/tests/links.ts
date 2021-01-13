import links, { navigateTo } from '../src/links';

const noop = () => undefined;
window.scrollTo = noop;
window.performance.mark = noop;
window.performance.measure = noop;

describe('Links', () => {
  test('without options', async () => {
    await links();
    await navigateTo('/test');
  });
});
