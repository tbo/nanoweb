import products from './products.json';

const getProducts = (): Promise<any> => new Promise((resolve) => resolve(products.results[0]));

export default getProducts;
