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

export interface StreamRenderOptions {
  transformResult?: (text: Readable, webComponents: string[]) => Readable;
  bufferSize?: number;
}

const getBuffer = (bufferSize = 1024) => {
  let buffer = '';
  return new Transform({
    decodeStrings: false,
    transform(text: string, _encoding, done) {
      buffer += text;
      if (buffer.length >= bufferSize) {
        this.push(buffer);
        buffer = '';
      }
      done();
    },
    final(this, done) {
      this.push(buffer);
      done();
    },
  });
};

export const renderToStream = (component: Template | Promise<Template>, options?: StreamRenderOptions): Readable => {
  const sink = getBuffer(options?.bufferSize);
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
