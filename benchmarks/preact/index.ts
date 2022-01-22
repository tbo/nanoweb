import Page from './page';
import getProducts from '../get-products';
import render from 'preact-render-to-string';
const executeBenchmark = async () => render(Page({ products: await getProducts() }));
export default executeBenchmark;
