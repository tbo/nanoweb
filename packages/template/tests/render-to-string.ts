import { html, Template, renderToString, RenderOptions } from '../src/index';

const matchSnapshot = async (getComponent: () => Template | Promise<Template>, options?: RenderOptions) =>
  expect(await renderToString(getComponent(), options)).toMatchSnapshot();

const addWebComponentScripts = (text: string, webComponents: string[]) => {
  if (!webComponents.length) {
    return text;
  }
  const index = text.lastIndexOf('</body>');
  return (
    text.slice(0, index) +
    webComponents.map((name: string) => `<script src="/assets/${name}.js"></script>`).join('') +
    text.slice(index)
  );
};

describe('Render to string', () => {
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

  test('with web components and transformer', async () => {
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
      { transformResult: addWebComponentScripts },
    );

    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            ${html`
              <x-button>
                content
              </x-button>
            `}
          </body>
        </html>
      `,
      { transformResult: addWebComponentScripts },
    );

    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            ${[
              html`
                <x-button>
                  content
                </x-button>
              `,
            ]}
          </body>
        </html>
      `,
      { transformResult: addWebComponentScripts },
    );

    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            ${Promise.resolve(
              html`
                <x-button>
                  content
                </x-button>
              `,
            )}
          </body>
        </html>
      `,
      { transformResult: addWebComponentScripts },
    );

    await matchSnapshot(
      () => html`
        <html>
          <head></head>
          <body>
            ${Promise.resolve([
              html`
                <x-button>
                  content
                </x-button>
              `,
            ])}
          </body>
        </html>
      `,
      { transformResult: addWebComponentScripts },
    );
  });
});
