import { renderToStaticNodeStream } from 'react-dom/server';
import Page from './page';
import getProducts from '../get-products';

const executeBenchmark = async () => renderToStaticNodeStream(Page({ products: await getProducts() }));
export default executeBenchmark;
