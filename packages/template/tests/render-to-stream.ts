import { Readable } from 'stream';
import { html, Template, renderToStream, StreamRenderOptions } from '../src/index';

const toString = (stream: Readable) => {
  let buffer = '';
  stream.on('data', (data: string) => (buffer += data));
  return new Promise(resolve => stream.on('end', () => resolve(buffer)));
};

const matchSnapshot = async (getComponent: () => Template | Promise<Template>, options?: StreamRenderOptions) =>
  expect(await toString(renderToStream(getComponent(), options))).toMatchSnapshot();

const nextTick = () => new Promise(resolve => setImmediate(resolve));

export const addWebComponentScripts = (text: string, webComponents: string[]) => {
  if (!webComponents.length) {
    return text;
  }
  const to = webComponents.map((name: string) => `<script src="/assets/${name}.js"></script>`).join('') + '</body>';
  return text.replace('</body>', to);
};

const getAsyncGenerator = () => {
  const triggered: string[] = [];
  const getComponent = (
    id: string,
    Custom?: () => Template | Promise<Template>,
  ): [() => Promise<Template>, () => Promise<void>] => {
    let resolvePromise: (value?: unknown) => void;
    const signal = new Promise(resolve => (resolvePromise = resolve));
    return [
      async () => {
        triggered.push(id);
        await signal;
        return Custom?.() ?? html`<div>Leaf ${id}</div>`;
      },
      async () => {
        resolvePromise();
        await nextTick();
      },
    ];
  };
  return { triggered, getComponent };
};

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

  test('Trigger and stream components eagerly', async () => {
    const { triggered, getComponent } = getAsyncGenerator();

    const [LeafComponentA, triggerA] = getComponent('A');
    const [LeafComponentB, triggerB] = getComponent('B');
    const [LeafComponentD, triggerD] = getComponent('D');
    const [LeafComponentC, triggerC] = getComponent('C', () => html`Nested: ${LeafComponentD()}`);
    const [LeafComponentE, triggerE] = getComponent('E');
    const [LeafComponentF, triggerF] = getComponent('F', () => html`Nested: ${LeafComponentE()}`);
    const [LeafComponentG, triggerG] = getComponent('G');
    const [LeafComponentH, triggerH] = getComponent('H');

    const RootComponent = html`
      <div>
        ${LeafComponentA()}
        ${[LeafComponentB(), html`static1`, LeafComponentC(), 'static2', LeafComponentF(), 'static3', LeafComponentG()]}
        ${LeafComponentH()}
      </div>
    `;

    let output = '';
    const execute = () => renderToStream(RootComponent, { bufferSize: 0 }).on('data', data => (output += data));

    // Trigger all components from top to bottom

    execute();
    await nextTick();
    expect(output).toMatchSnapshot();
    await triggerA();
    expect(output).toMatchSnapshot();
    await triggerB();
    expect(output).toMatchSnapshot();
    await triggerC();
    expect(output).toMatchSnapshot();
    await triggerD();
    expect(output).toMatchSnapshot();
    await triggerE();
    expect(output).toMatchSnapshot();
    await triggerF();
    expect(output).toMatchSnapshot();
    await triggerG();
    expect(output).toMatchSnapshot();
    await triggerH();
    expect(output).toMatchSnapshot();

    // Every component should only be triggered once
    expect(triggered).toMatchObject(['A', 'B', 'C', 'F', 'G', 'H', 'D', 'E']);
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
