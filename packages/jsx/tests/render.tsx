import { render } from '@nanoweb/jsx';

const matchSnapshot = async (getComponent: () => JSX.Element) => expect(await render(getComponent())).toMatchSnapshot();

describe('Render to string', () => {
  test('Simple static component', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body>content</body>
      </html>
    ));
  });

  test('async component', async () => {
    await matchSnapshot(async () => (
      <html>
        <head></head>
        <body>content</body>
      </html>
    ));
  });

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
