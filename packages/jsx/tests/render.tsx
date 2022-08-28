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

  test('Simple nesting', async () => {
    await matchSnapshot(() => (
      <html>
        <head>
          <title>{'a title'}</title>
        </head>
        <body>
          {123}
          {undefined}
          <p>{null}test</p>
        </body>
      </html>
    ));
  });

  test('Component nesting', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body>{<div>123</div>}</body>
      </html>
    ));
  });

  test('Self closing tags', async () => {
    await matchSnapshot(() => (
      <html>
        <head>
          <meta name="test" />
        </head>
        <body>
          <br />
          <hr />
          <img src="" />
        </body>
      </html>
    ));
  });

  test('Escape dangerous strings', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body>{'<script>alert("hacked")</script>'}</body>
      </html>
    ));
  });

  test('Async netsting', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body class="main">
          {Promise.resolve('hello')}
          {Promise.resolve(['world'])}
          <p>
            {Promise.resolve(
              <span style={{ color: 'red' }}>
                some {'text'}
                {Promise.resolve('!')}
              </span>,
            )}
          </p>
        </body>
      </html>
    ));
  });
});
