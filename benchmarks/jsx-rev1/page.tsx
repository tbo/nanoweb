import classNames from 'classnames';
import { stringify } from 'querystring';
import getProducts from '../get-products';
import { Readable, PassThrough } from 'stream';

(global as any).createElement = (
  type: any,
  props: Record<string, any> | undefined,
  ...children: any[]
): Promise<Element> | Element => ({
  type,
  props: props || {},
  children,
});

interface Element<P = Record<string, any> | undefined, C = any> {
  type: ((props: P, context?: C) => Promise<Element<P, C> | string> | Element<P, C> | string) | string;
  props: P;
  children: (Element<P, C> | Promise<Element<P, C>>)[];
}
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
      .map((entry) => [toKebapCase(entry[0]), entry[1]].join(':'))
      .join(';')
      .toLowerCase();
  }
  return ` ${key.toLowerCase()}="${value}"`;
};

type Node = JSX.Element | Promise<Element | string | number> | Element | string | number;

type OutputEntry = string | Promise<Node>;

export const render = (
  RootComponent: (context: any) => Promise<Node | Node[]> | Node | Node[],
  context?: any,
): Readable => {
  const outputQueue: OutputEntry[] = ['<!DOCTYPE html>'];
  const parseNode = (node: Promise<Node | Node[]> | Node | Node[]): OutputEntry[] => {
    if (node == null) {
      return [];
    } else if (typeof node === 'string') {
      return [node];
    } else if (typeof node === 'number') {
      return [String(node)];
    } else if (node instanceof Promise) {
      (node as any) = (node as Promise<any>).then(parseNode);
      (node as Promise<any>).then((elements) => spliceNode(elements, outputQueue.indexOf(node as any)));
      return [node as any];
    } else if (Array.isArray(node)) {
      return node.flatMap(parseNode);
    }
    const { type, props } = node;
    const children = (node.children as any).filter((child: any) => child != null);
    if (typeof node.type === 'function') {
      if (!children || !children.length) {
        return parseNode(node.type(node.props, context));
      }
      return parseNode(node.type({ ...node.props, children: parseNode(children) }, context));
    }
    const propString = props ? Object.entries(props).map(toString).join('') : '';
    if (!children || !children.length) {
      return [`<${type}${propString}/>`];
    }
    return [`<${type}${propString}>`, ...(children as any).flatMap(parseNode), `</${type}>`];
  };
  const processQueue = () => {
    let buffer = '';
    while (typeof outputQueue[0] === 'string') {
      buffer += outputQueue.shift();
    }
    sink.write(buffer);
    if (outputQueue[0] instanceof Promise) {
      outputQueue[0].then(processQueue);
    } else {
      sink.end();
    }
  };
  const spliceNode = (elements: OutputEntry[], position: number) => {
    if (position !== -1) {
      outputQueue.splice(position, 1, ...elements);
    }
  };
  const sink = new PassThrough({});

  outputQueue.push(...parseNode(RootComponent(context)));
  processQueue();
  return sink;
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
          {getRange(nbPages).map((page) => (
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
