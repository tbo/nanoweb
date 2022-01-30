import { renderToString } from 'react-dom/server';
import Page from './page';
import getProducts from '../get-products';

const executeBenchmark = async () => renderToString(Page({ products: await getProducts() }));
export default executeBenchmark;
