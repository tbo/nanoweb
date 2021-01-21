import React from 'react';
import classNames from 'classnames';
import { stringify } from 'querystring';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createElement = React.createElement;

const getRange = (to: number) => [...Array(to).keys()];

const getQuery = (params: Record<string, string | number>) =>
  stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value)));

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

const Page = (props: any) => {
  const query = 'table';
  const { nbHits, nbPages, hits, page: activePage } = props.products;
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

export default Page;
