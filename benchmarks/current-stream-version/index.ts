import Page from '../page';
import { html, renderToStream } from '../../packages/template/src';

const addWebComponentScripts = (text: string, webComponents: string[]) => {
  if (!webComponents.length) {
    return text;
  }
  const to = webComponents.map((name: string) => `<script src="/assets/${name}.js"></script>`).join('') + 'body';
  return text.replace('</body>', to);
};

const Subject = Page(html);
const executeBenchmark = () => renderToStream(Subject(), { transformResult: addWebComponentScripts });
export default executeBenchmark;
