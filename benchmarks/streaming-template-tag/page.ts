import classNames from 'classnames';
import { stringify } from 'querystring';
import getProducts from '../get-products';
import { PassThrough } from 'stream';

const getRange = (to: number) => [...Array(to).keys()];

const getQuery = (params: Record<string, string | number>) =>
  stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value)));

const whitespace = /(\s{2,}|\r\n|\n|\r)/g;

const htmlEscape = (value: any) =>
  typeof value !== 'string'
    ? value
    : value
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');

const cache = new Map();

export const html = (literalSections: any, ...substs: any[]) => {
  let raw = cache.get(literalSections);
  if (!raw) {
    raw = literalSections.raw.map((item: any) => item.replace(whitespace, ''));
    cache.set(literalSections, raw);
  }
  const result = [];
  for (let i = 0; i < substs.length; i++) {
    const subst = substs[i];
    result.push(raw[i]);
    if (Array.isArray(subst)) {
      if ((subst as any).__internal) {
        result.push(...subst.flat());
      } else {
        result.push(...subst.flatMap(htmlEscape));
      }
    } else {
      result.push(htmlEscape(subst));
    }
  }
  result.push(raw[raw.length - 1]);
  (result as any).__internal = true;
  return result;
};

export const render = (component: any[] | Promise<any[]>) => {
  const sink = new PassThrough({});
  setImmediate(async () => {
    const list = await component;
    let buffer = '';
    for (const item of list) {
      if (buffer.length > 1024) {
        sink.write(buffer);
        buffer = '';
      }
      buffer += await item;
    }
    sink.write(buffer);
    sink.end();
  });
  return sink;
};

const Base = (contents: any) => html`
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <title>Hybrid Search</title>
    </head>
    <body>
      <nav>
        <div className="nav-wrapper">
          <a href="/" className="brand-logo" style="padding-left: 10">
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
      <main>${contents}</main>
    </body>
  </html>
`;

const getProductTile = ({ id, name, price, description, image }: any) => html`
  <div id="${id}" className="card blue-grey darken-1 hit">
    <div className="card-content white-text">
      <span className="card-title">${name}</span>
    </div>
    <div className="image-wrapper">
      <image loading="lazy" src=${image} />
    </div>
    <div className="card-content white-text">
      ${price} Euro
      <br />
      ${description}
    </div>
  </div>
`;

const getPaginationEntry = (activePage: number, query: string) => (page: number) => html`
  <li className="${classNames('waves-effect', { active: activePage === page })}>
    <a href="?${getQuery({ query, page })}">${page + 1}</a>
  </li>
`;

const getPagination = (total: number, activePage: number, query: string) => {
  if (!total) {
    return '';
  }
  return html`
    <ul className="pagination">
      ${getRange(total).map(getPaginationEntry(activePage, query))}
    </ul>
  `;
};

const Page = async () => {
  const products = await getProducts();
  const query = 'table';
  const { nbHits, nbPages, hits, page: activePage } = products;
  return Base(html`
      <p>
        <div className="chip">Hits: ${nbHits}</div>
      </p>
      <div className="hits">
        ${hits.map(getProductTile)}
      </div>
      ${getPagination(nbPages, activePage, query)}
  `);
};

export default Page;
