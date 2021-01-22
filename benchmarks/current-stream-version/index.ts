import Page from '../page';
import { html, renderToStream } from '../../packages/template/src';

const Subject = Page(html);
const executeBenchmark = () => renderToStream(Subject());
export default executeBenchmark;
