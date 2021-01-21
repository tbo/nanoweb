import Page from './page';
import { renderToString } from '../../packages/template/src/index';

const executeBenchmark = () => renderToString(Page());
export default executeBenchmark;
