import Page from './page';
import getProducts from '../get-products';

const executeBenchmark = async () => Page({ products: await getProducts() });
export default executeBenchmark;
