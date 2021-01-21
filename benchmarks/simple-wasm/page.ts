import classNames from 'classnames';
import { stringify } from 'querystring';
import { html } from '../../wasm-html/pkg';

const getRange = (to: number) => [...Array(to).keys()];

const getQuery = (params: Record<string, string | number>) =>
  stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value)));

const Base = (contents: any) => (html as any)`
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

const getProductTile = ({ id, name, price, description, image }: any) => (html as any)`
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

const getPaginationEntry = (activePage: number, query: string) => (page: number) => (html as any)`
  <li className="${classNames('waves-effect', { active: activePage === page })}>
    <a href="?${getQuery({ query, page })}">${page + 1}</a>
  </li>
`;

const getPagination = (total: number, activePage: number, query: string) => {
  if (!total) {
    return '';
  }
  return (html as any)`
    <ul className="pagination">
      ${getRange(total).map(getPaginationEntry(activePage, query))}
    </ul>
  `;
};

const Page = (products: any) => {
  const query = 'table';
  const { nbHits, nbPages, hits, page: activePage } = products;
  return Base((html as any)`
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
