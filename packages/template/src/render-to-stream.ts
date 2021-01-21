import { PassThrough, Readable } from 'stream';
import { Template } from './html';

const resolve = async (stream: PassThrough, component: Template | Promise<Template>, webComponents: string[]) => {
  const list = await component;
  webComponents.push(...list.webComponents);
  for (const item of list) {
    if (item != null && item !== false) {
      const resolvedItem = await item;
      if (resolvedItem instanceof Template) {
        await resolve(stream, resolvedItem, webComponents);
      } else {
        stream.write(String(resolvedItem));
      }
    }
  }
};

export interface StreamRenderOptions {
  transformResult?: (text: Readable, webComponents: string[]) => Readable;
}

export const renderToStream = (component: Template | Promise<Template>, options?: StreamRenderOptions): Readable => {
  const sink = new PassThrough({});
  const webComponents: string[] = [];
  setImmediate(async () => {
    await resolve(sink, component, webComponents);
    sink.end();
  });
  if (options?.transformResult) {
    return options.transformResult(sink, [...new Set(webComponents)]);
  }
  return sink;
};
