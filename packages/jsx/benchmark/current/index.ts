import { render } from '../../src';
import Page from './page';

const executeBenchmark = async () => render(await Page());
export default executeBenchmark;
