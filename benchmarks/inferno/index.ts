import Page from './page';
import getProducts from '../get-products';
import { renderToString } from 'inferno-server';
const executeBenchmark = async () => renderToString(Page({ products: await getProducts() }));
export default executeBenchmark;
