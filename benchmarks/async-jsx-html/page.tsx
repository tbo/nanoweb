import classs from 'classnames';
import { stringify } from 'querystring';
import getProducts from '../get-products';
import { React } from 'async-jsx-html';

const createElement = React.createElement;

const getRange = (to: number) => [...Array(to).keys()];

const getQuery = (params: Record<string, string | number>) =>
  stringify(Object.fromEntries(Object.entries(params).filter(([, value]) => value)));

const ProductTile = ({ id, name, price, description, image }: any) => (
  <div id={id} class="card blue-grey darken-1 hit">
    <div class="card-content white-text">
      <span class="card-title">{name}</span>
    </div>
    <div class="image-wrapper">
      <image loading="lazy" src={image} />
    </div>
    <div class="card-content white-text">
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
        <div class="nav-wrapper">
          <a href="/" class="brand-logo" style={{ paddingLeft: 10 }}>
            Hybrid Search
          </a>
          <ul id="nav-mobile" class="right hide-on-med-and-down">
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

export const render = async () => ((<Category />) as any).render();

const Category = async (props: any) => {
  const products = await getProducts();
  const query = 'table';
  const { nbHits, nbPages, hits, page: activePage } = products;
  return (
    <Base>
      <p>
        <div class="chip">Hits: {nbHits}</div>
      </p>
      <div class="hits">
        {hits.map((product: any) => (
          <ProductTile key={product.id} {...product} />
        ))}
      </div>
      {nbPages > 0 && (
        <ul class="pagination">
          {getRange(nbPages).map(page => (
            <li class={classs('waves-effect', { active: activePage === page })} key={page}>
              <a href={`?${getQuery({ query, page })}`}>{page + 1}</a>
            </li>
          ))}
        </ul>
      )}
    </Base>
  );
};

export default Category;
