import { render, html, Template } from '../src/html';

const nextTick = () => new Promise(resolve => setImmediate(resolve));

const matchSnapshot = async (getComponent: () => Template | Promise<Template>) =>
  expect(await render(getComponent())).toMatchSnapshot();

describe('Template tag', () => {
  test('Render simple template tag', async () => {
    await matchSnapshot(() => html`test`);
  });

  test('Render simple template tag with number substitution', async () => {
    await matchSnapshot(() => html`test${42}`);
  });

  test('Render async template tag ', async () => {
    await matchSnapshot(() => html`async test`);
  });

  test('Render embedded async string', async () => {
    await matchSnapshot(() => html`${Promise.resolve('async')} test`);
  });

  test('Render embedded async number', async () => {
    await matchSnapshot(() => html`async ${Promise.resolve(42)}`);
  });

  test('Render embedded template tag', async () => {
    await matchSnapshot(() => html`another ${html`template tag`}`);
  });

  test('Render embedded list', async () => {
    await matchSnapshot(() => html`another ${['Hello', '<b>World</b>']}`);
  });

  test('Render embedded async template tag', async () => {
    await matchSnapshot(() => html`another async ${Promise.resolve(html`template tag`)}`);
  });
});
