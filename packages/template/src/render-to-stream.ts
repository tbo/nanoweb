import { PassThrough, Readable, Transform } from 'stream';
import { Template } from './html';

const resolve = async (stream: PassThrough, component: Template | Promise<Template>, webComponents: string[]) => {
  const list = await component;
  webComponents.push(...list.webComponents);
  for (const item of list) {
    if (item !== undefined) {
      const resolvedItem = await item;
      if (resolvedItem instanceof Template) {
        await resolve(stream, resolvedItem, webComponents);
      } else {
        stream.write(resolvedItem);
      }
    }
  }
};

type Transformer = (text: string, webComponents: string[]) => string;

export interface StreamRenderOptions {
  transformResult?: Transformer;
  bufferSize?: number;
}

const getBuffer = (bufferSize = 1024, webComponents: string[], transform?: Transformer) => {
  let buffer = '';
  return new Transform({
    decodeStrings: false,
    transform(text: string, _encoding, done) {
      buffer += text;
      if (buffer.length >= bufferSize) {
        this.push(transform?.(buffer, [...new Set(webComponents)]) || buffer);
        buffer = '';
      }
      done();
    },
    final(this, done) {
      this.push(transform?.(buffer, [...new Set(webComponents)]) || buffer);
      done();
    },
  });
};

export const renderToStream = (component: Template | Promise<Template>, options?: StreamRenderOptions): Readable => {
  const webComponents: string[] = [];
  const sink = getBuffer(options?.bufferSize, webComponents, options?.transformResult);
  setImmediate(async () => {
    await resolve(sink, component, webComponents);
    sink.end();
  });
  return sink;
};
