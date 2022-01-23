import classNames from 'classnames';
import { stringify } from 'querystring';
import getProducts from '../get-products';

interface Element {
  type: ((opt: any) => Element) | ((opt: any) => Promise<Element>) | string;
  props: Record<string, any>;
  children: Element[];
}

const createElement = (type: any, props: Record<string, any> = {}, ...children: any[]): Element => ({
  type: typeof type === 'function' ? type(Object.assign({ children }, props)) : type,
  props,
  children: children.flat(),
});

export const render = async (element: Element): Promise<string> => {
  if (element.type instanceof Promise) {
    element = await element.type;
  }
  const { type, props, children } = element;
  const propString = props ? Object.entries(props).map(toString).join('') : '';
  if (!children || !children.length) {
    return `<${type}${propString} />`;
  }
  let result = `<${type}${propString}>`;

  for (const child of children) {
    const r = render(child);
    result += r instanceof Promise ? await r : r;
  }
  return result + `</${type}>`;
};

const CAMEL_CASE_PATTERN = new RegExp('[A-Z]*[a-z]+', 'g');

const toKebapCase = (value: string) => value.match(CAMEL_CASE_PATTERN)!.join('-');

const toString = (attribute: [string, any]) => {
  let [key, value] = attribute;
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
  return ` ${key.toLowerCase()}="${value}"`;
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
    </Base>
  );
};

export default Category;
