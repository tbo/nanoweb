import Page, { render } from './page';

const executeBenchmark = async () => render(await Page());
export default executeBenchmark;
