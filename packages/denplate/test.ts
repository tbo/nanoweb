import { html, renderToString } from './mod.ts';

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

console.log(await renderToString(Layout()));
