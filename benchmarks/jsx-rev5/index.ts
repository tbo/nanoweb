import Page from './page';
import { renderToString } from '../../packages/template/src';

const executeBenchmark = () => renderToString(Page());
export default executeBenchmark;
