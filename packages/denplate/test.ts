import { html, renderToString } from './mod.ts';
import { assertEquals } from 'https://deno.land/std@0.104.0/testing/asserts.ts';

const MyComponent = () => html`<div style="color: red;">TEST</div>`;

const Layout = () => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      ${MyComponent()}
    </body>
  </html>
`;

const RESULT =
  ' <!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>Document</title> </head> <body> <div style="color: red;">TEST</div> </body> </html> ';

Deno.test({
  name: 'Render to string - without options',
  fn: async () => {
    assertEquals(await renderToString(Layout()), RESULT);
  },
});
