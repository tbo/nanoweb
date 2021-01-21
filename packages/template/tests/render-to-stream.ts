import { Readable } from 'stream';
import { html, Template, renderToStream, StreamRenderOptions } from '../src/index';

const toString = (stream: Readable) => {
  let buffer = '';
  stream.on('data', (data: string) => (buffer += data));
  return new Promise(resolve => stream.on('end', () => resolve(buffer)));
};

const matchSnapshot = async (getComponent: () => Template | Promise<Template>, options?: StreamRenderOptions) =>
  expect(await toString(renderToStream(getComponent(), options))).toMatchSnapshot();

describe('Render to stream', () => {
  test('without options', async () => {
    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            content
          </body>
        </html>
      `,
    );
  });

  test('with web components, but without options', async () => {
    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            <x-button>
              content
            </x-button>
          </body>
        </html>
      `,
    );
  });
});
