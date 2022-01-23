import { Readable } from 'stream';
import { html, Template, unsafeHtml, renderToString, renderToStream } from '../src/index';

const toString = (stream: Readable): Promise<string> => {
  let buffer = '';
  stream.on('data', (data: string) => (buffer += data));
  return new Promise(resolve => stream.on('end', () => resolve(buffer)));
};

const matchSnapshot = async (getComponent: () => Template | Promise<Template>) => {
  const syncResult = await renderToString(getComponent());
  const asyncResult = await toString(renderToStream(getComponent()));
  expect(syncResult).toEqual(asyncResult);
  expect(syncResult).toMatchSnapshot();
};

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

  test('Escape harmful values', async () => {
    await matchSnapshot(() => html`escaped: ${'<b">generated html<\'/b&>'}`);
  });

  test('Render zero', async () => {
    await matchSnapshot(() => html`zero: ${0}`);
    await matchSnapshot(() => html`zero: ${Promise.resolve(0)}`);
  });

  test('Do not render `null`', async () => {
    await matchSnapshot(() => html`null: ${null}`);
    await matchSnapshot(() => html`null: ${Promise.resolve(null)}`);
  });

  test('Do not render `false`', async () => {
    await matchSnapshot(() => html`false: ${false}`);
    await matchSnapshot(() => html`false: ${Promise.resolve(false)}`);
  });

  test('Do not render `undefined`', async () => {
    await matchSnapshot(() => html`undefined: ${undefined}`);
    await matchSnapshot(() => html`undefined: ${Promise.resolve(undefined)}`);
  });

  test('Render cached static strings', async () => {
    const getValue = () => html`This can be repeated`;
    await matchSnapshot(() => html`${getValue()}, ${getValue()}`);
  });

  test('Render embedded async template tag', async () => {
    await matchSnapshot(() => html`another async ${Promise.resolve(html`template tag`)}`);
  });

  test('Render embedded async lists', async () => {
    await matchSnapshot(
      () => html`
        <div>
          ${Promise.resolve([
            html`<h1>headline</h1>`,
            undefined,
            unsafeHtml('<div>test</div>'),
            123,
            'some text',
            null,
          ])}
        </div>
      `,
    );
  });

  test('Render embedded nested async lists', async () => {
    await matchSnapshot(
      () => html`
        <div>
          ${Promise.resolve([
            html`<h1>headline</h1>`,
            undefined,
            unsafeHtml('<div>test</div>'),
            '<script>escaped</script>',
            123,
            'some text',
            null,
            Promise.resolve([
              html`<h1>headline</h1>`,
              undefined,
              unsafeHtml('<div>test</div>'),
              '<script>escaped</script>',
              123,
              'some text',
              null,
            ]) as any,
          ])}
        </div>
      `,
    );
  });
});
