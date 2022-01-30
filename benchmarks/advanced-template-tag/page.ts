import classNames from 'classnames';
import { stringify } from 'querystring';
import getProducts from '../get-products';

const getRange = (to: number) => [...Array(to).keys()];

const getQuery = (params: Record<string, string | number>) =>
  stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value)));

const rxUnescaped = new RegExp(/["'&<>]/);

/* Copied from Inferno */
export function escapeText(text: any): string {
  /* Much faster when there is no unescaped characters */
  if (!rxUnescaped.test(text)) {
    return text;
  }

  let result = '';
  let escape = '';
  let start = 0;
  let i;
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

class UnsafeHtml extends String {}
export const unsafeHtml = (value = '') => new UnsafeHtml(value);

const cache = new Map();
const repeatedWhitespace = /\s{1,}/g;
const whitespace = /\r\n|\n|\r|(\s{1,}(?=<))/g;
export const html = async (literalSections: any, ...substs: any[]) => {
  let raw = cache.get(literalSections);
  if (raw === undefined) {
    raw = literalSections.raw.map((item: string) => item.replace(whitespace, ' ').replace(repeatedWhitespace, ' '));
    cache.set(literalSections, raw);
  }
  let result = '';
  for (let i = 0; i < substs.length; i++) {
    const subst = substs[i] instanceof Promise ? await substs[i] : substs[i];
    result += raw[i];
    if (Array.isArray(subst)) {
      for (let j = 0; j < subst.length; j++) {
        result += subst[j] instanceof Promise ? await subst[j] : subst[j];
      }
    } else if (typeof subst === 'number' || (subst as any) instanceof UnsafeHtml) {
      result += subst;
    } else if (subst == null) {
      result += '';
    } else {
      result += escapeText(String(subst));
    }
  }
  result += raw[raw.length - 1]; // (A)
  return new UnsafeHtml(result);
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
          <a href="/" className="brand-logo" style="padding-left: 10"> Hybrid Search </a>
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

const getPaginationEntry = (activePage: number, query: string) => (page: number) =>
  html`
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
      ${'<test/>'}
  `);
};

export default Page;
