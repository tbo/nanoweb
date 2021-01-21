import Page from '../page';
import { html, renderToString } from '@nanoweb/template';

const Subject = Page(html);
const executeBenchmark = () => renderToString(Subject());
export default executeBenchmark;
