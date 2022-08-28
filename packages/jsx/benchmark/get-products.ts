import products from './products.json';

const p = products.results[0];
const getProducts = (): Promise<any> => new Promise(resolve => resolve(p));

export default getProducts;
