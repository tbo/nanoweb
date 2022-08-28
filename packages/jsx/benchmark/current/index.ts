import { render } from '@nanoweb/jsx';
import Page from './page';

const executeBenchmark = async () => render(await Page());
export default executeBenchmark;
