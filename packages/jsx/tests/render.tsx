import { render } from '@nanoweb/jsx';

const matchSnapshot = async (getComponent: () => JSX.Element) => expect(await render(getComponent())).toMatchSnapshot();

describe('Render to string', () => {
  test('without options', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body>content</body>
      </html>
    ));
  });

  // test('with web components, but without options', async () => {
  //   await matchSnapshot(
  //     () => html`
  //       <html>
  //         <head></head>
  //         <body>
  //           <x-button>
  //             content
  //           </x-button>
  //         </body>
  //       </html>
  //     `,
  //   );
  // });

  // test('with web components and transformer', async () => {
  //   await matchSnapshot(
  //     () => html`
  //       <html>
  //         <head></head>
  //         <body>
  //           <x-button>
  //             content
  //           </x-button>
  //         </body>
  //       </html>
  //     `,
  //     { transformResult: addWebComponentScripts },
  //   );

  //   await matchSnapshot(
  //     () => html`
  //       <html>
  //         <head></head>
  //         <body>
  //           ${html`
  //             <x-button>
  //               content
  //             </x-button>
  //           `}
  //         </body>
  //       </html>
  //     `,
  //     { transformResult: addWebComponentScripts },
  //   );

  //   await matchSnapshot(
  //     () => html`
  //       <html>
  //         <head></head>
  //         <body>
  //           ${[
  //             html`
  //               <x-button>
  //                 content
  //               </x-button>
  //             `,
  //           ]}
  //         </body>
  //       </html>
  //     `,
  //     { transformResult: addWebComponentScripts },
  //   );

  //   await matchSnapshot(
  //     () => html`
  //       <html>
  //         <head></head>
  //         <body>
  //           ${Promise.resolve(
  //             html`
  //               <x-button>
  //                 content
  //               </x-button>
  //             `,
  //           )}
  //         </body>
  //       </html>
  //     `,
  //     { transformResult: addWebComponentScripts },
  //   );

  //   await matchSnapshot(
  //     () => html`
  //       <html>
  //         <head></head>
  //         <body>
  //           ${Promise.resolve([
  //             html`
  //               <x-button>
  //                 content
  //               </x-button>
  //             `,
  //           ])}
  //         </body>
  //       </html>
  //     `,
  //     { transformResult: addWebComponentScripts },
  //   );
  // });
});
