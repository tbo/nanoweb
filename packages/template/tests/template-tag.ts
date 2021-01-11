import { html, Template, unsafeHtml, renderToString } from '../src/index';

const matchSnapshot = async (getComponent: () => Template | Promise<Template>) =>
  expect(await renderToString(getComponent())).toMatchSnapshot();

describe('Template tag', () => {
  test('Render simple template tag', async () => {
    await matchSnapshot(() => html`test`);
  });

  test('Render simple template tag with number substitution', async () => {
    await matchSnapshot(() => html`test${42}`);
  });

  test('Render async template tag ', async () => {
    await matchSnapshot(() => Promise.resolve(html`async test`));
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
    await matchSnapshot(() => html`another ${['Hello', '<b>World</b>', html`<b>!</b>`]}`);
  });

  test('Render unsafe values', async () => {
    await matchSnapshot(() => html`unsafe: ${unsafeHtml('<b>generated html</b>')}`);
    await matchSnapshot(() => html`unsafe: ${unsafeHtml(undefined)}`);
  });

  test('Do not render `null`', async () => {
    await matchSnapshot(() => html`null: ${null}`);
  });

  test('Do not render `false`', async () => {
    await matchSnapshot(() => html`false: ${false}`);
  });

  test('Render cached static strings', async () => {
    const getValue = () => html`This can be repeated`;
    await matchSnapshot(() => html`${getValue()}, ${getValue()}`);
  });

  test('Render embedded async template tag', async () => {
    await matchSnapshot(() => html`another async ${Promise.resolve(html`template tag`)}`);
  });
});
