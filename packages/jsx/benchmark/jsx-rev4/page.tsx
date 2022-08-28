import classNames from 'classnames';
import { stringify } from 'querystring';
import getProducts from '../get-products';

const rxUnescaped = new RegExp(/["'&<>]/);

export function escape(text: any): string {
  /* Much faster when there is no unescaped characters */
  if (typeof text !== 'string' || !rxUnescaped.test(text)) {
    return text;
  }

  let result = '';
  let escape = '';
  let start = 0;
  let i: number;
  for (i = 0; i < text.length; ++i) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 39: // '
        escape = '&#039;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }
    if (i > start) {
      result += text.slice(start, i);
    }
    result += escape;
    start = i + 1;
  }
  return result + text.slice(start, i);
}

export class Template extends Array {}

const createElement = (type: any, props: Record<string, any> | null, ...children: any[]): any[] => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!(child instanceof Template)) {
      children[i] = escape(child);
    }
  }
  if (typeof type === 'function') {
    if (props) {
      props.children = children;
    } else {
      props = { children };
    }
    return type(props);
  }
  let propString = '';
  if (props) {
    for (const i in props) {
      propString += toString(i, props[i]);
    }
  }
  const template = new Template();
  if (!children || !children.length) {
    template[0] = '<' + type + propString + '/>';
    return template;
  }
  const length = children.length;
  template[0] = '<' + type + propString + '>';
  for (let i = 0; i < length; i++) {
    template[i + 1] = children[i];
  }
  template[length + 1] = '</' + type + '>';
  return template;
};

export const render = async (elements: any[]): Promise<string> => {
  let result = '';
  for (const child of elements.flat(1000)) {
    result += child instanceof Promise ? await child : child;
  }
  return result;
};

const CAMEL_CASE_PATTERN = new RegExp('[A-Z]*[a-z]+', 'g');

const toKebapCase = (value: string) => value.match(CAMEL_CASE_PATTERN)!.join('-');

const toString = (key: string, value: any) => {
  if (value == null) {
    return '';
  } else if (key === 'className') {
    key = 'class';
  } else if (key === 'style') {
    value = Object.entries(value)
      .map(entry => [toKebapCase(entry[0]), entry[1]].join(':'))
      .join(';')
      .toLowerCase();
  }
  return ` ${key.toLowerCase()}="${escape(value)}"`;
};

const getRange = (to: number) => [...Array(to).keys()];

const getQuery = (params: Record<string, string | number>) =>
  stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value)));

const ProductTile = ({ id, name, price, description, image }: any) => (
  <div id={id} className="card blue-grey darken-1 hit">
    <div className="card-content white-text">
      <span className="card-title">{name}</span>
    </div>
    <div className="image-wrapper">
      <image loading="lazy" src={image} />
    </div>
    <div className="card-content white-text">
      {price} Euro
      <br />
      {description}
    </div>
  </div>
);

const Base = (props: any) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <title>Hybrid Search</title>
    </head>
    <body>
      <nav>
        <div className="nav-wrapper">
          <a href="/" className="brand-logo" style={{ paddingLeft: 10 }}>
            Hybrid Search
          </a>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li>
              <a href="/post-search">POST Example</a>
            </li>
            <li>
              <a href="/time">Time</a>
            </li>
            <li>
              <a href="/assets/sample.pdf">PDF</a>
            </li>
            <li>
              <a href="/assets/tcpip.html">TCP Spec</a>
            </li>
            <li>
              <a href="/examples">Examples</a>
            </li>
          </ul>
        </div>
      </nav>
      <br />
      <main>{props.children}</main>
    </body>
  </html>
);

const Category = async () => {
  const query = 'table';
  const { nbHits, nbPages, hits, page: activePage } = await getProducts();
  return (
    <Base>
      <p>
        <div className="chip">Hits: {nbHits}</div>
      </p>
      <div className="hits">
        {hits.map((product: any) => (
          <ProductTile key={product.id} {...product} />
        ))}
      </div>
      {nbPages > 0 && (
        <ul className="pagination">
          {getRange(nbPages).map(page => (
            <li className={classNames('waves-effect', { active: activePage === page })} key={page}>
              <a href={`?${getQuery({ query, page })}`}>{page + 1}</a>
            </li>
          ))}
        </ul>
      )}
      {['<test/>']}
    </Base>
  );
};

export default Category;
