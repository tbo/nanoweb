import { render, unsafe } from '@nanoweb/jsx';

const matchSnapshot = async (getComponent: () => JSX.Element) => expect(await render(getComponent())).toMatchSnapshot();

const Custom = (props: any) => <span>{props.children}</span>;

const AsyncCustom = async (props: any) => {
  await new Promise(resolve => setTimeout(resolve, 10));
  return <span>{props.children}</span>;
};

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

  test('Custom component', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body class="main">
          <Custom>abc</Custom>
          <p>
            <AsyncCustom>def</AsyncCustom>
          </p>
          {[<Custom>ghi</Custom>, <AsyncCustom>jkm</AsyncCustom>]}
        </body>
      </html>
    ));
  });

  test('Unsafe', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body class="main">
          <div>{unsafe('<script>alert("hacked")</script>')}</div>
          <div>{Promise.resolve(unsafe('<script>alert("hacked")</script>'))}</div>
          <div>{Promise.resolve(unsafe('<script>alert("hacked")</script>'))}</div>
          {[unsafe('<script>alert("hacked")</script>'), Promise.resolve(unsafe('<script>alert("hacked")</script>'))]}
        </body>
      </html>
    ));
  });

  test('Falsy values', async () => {
    await matchSnapshot(() => (
      <html>
        <head>
          <title>{'a title'}</title>
        </head>
        <body>
          {0}
          {undefined}
          <p>{null}test</p>
          {[undefined, null, 0]}
          <Custom>{0}</Custom>
          <Custom>{undefined}</Custom>
          <Custom>{null}</Custom>
          <Custom>{[undefined, null, 0]}</Custom>
        </body>
      </html>
    ));
  });

  test('Render null alt attribute', async () => {
    await matchSnapshot(() => <img src="./test.jpg" alt="" />);
  });

  test('Render boolean attributes', async () => {
    await matchSnapshot(() => <input type="checkbox" checked={false} />);
    await matchSnapshot(() => <input type="checkbox" checked={true} />);
    await matchSnapshot(() => <input type="checkbox" checked />);
  });

  test('Render className attribute as class', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body className="awesome">content</body>
      </html>
    ));
  });

  test('Render string styles', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body style="text-align: center; border: 1px">content</body>
      </html>
    ));
  });

  test('Render object styles', async () => {
    await matchSnapshot(() => (
      <html>
        <head></head>
        <body style={{ textAlign: 'center', border: '1px', zIndex: 2 }}>content</body>
      </html>
    ));
  });
});
