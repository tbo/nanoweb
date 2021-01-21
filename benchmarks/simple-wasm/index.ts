import Page from './page';
import getProducts from '../get-products';
import { render } from '../../wasm-html/pkg';

const executeBenchmark = async () => render(Page(await getProducts()));
export default executeBenchmark;
