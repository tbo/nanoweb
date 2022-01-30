import { Readable, Transform, Writable } from 'stream';

const rxUnescaped = new RegExp(/["'&<>]/);

/* Copied from Inferno */
export function escapeText(text: any): string {
  /* Much faster when there is no unescaped characters */
  if (!rxUnescaped.test(text)) {
    return text;
  }

  let result = '';
  let escape = '';
  let start = 0;
  let i: number;
  for (i = 0; i < text.length; ++i) {
    switch (text.charCodeAt(i)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 39: // '
        escape = '&#039;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }
    if (i > start) {
      result += text.slice(start, i);
    }
    result += escape;
    start = i + 1;
  }
  return result + text.slice(start, i);
}

class Template extends String {}
export const unsafeHtml = (value = '') => new Template(value);

export type TemplateElement =
  | false
  | string
  | number
  | undefined
  | null
  | Template
  | TemplateElement[]
  | Promise<TemplateElement>;

const cache = new Map();

const resolve = async (sink: Writable, subst: TemplateElement): Promise<void> => {
  if (subst instanceof Promise) {
    await subst.then(t => resolve(sink, t));
  } else if (Array.isArray(subst)) {
    await Promise.all(subst as any).then(async t => {
      for (let i = 0; i < t.length; i++) {
        await resolve(sink, t[i]);
      }
    });
  } else if (typeof subst === 'number') {
    sink.write(String(subst));
  } else if (subst instanceof Readable) {
    subst.pipe(sink);
    await new Promise(resolve => subst.on('end', resolve));
  } else if (!subst) {
  } else {
    sink.write(escapeText(String(subst)));
  }
};

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

export const html = (literalSections: TemplateStringsArray, ...substs: TemplateElement[]): Readable => {
  let raw = cache.get(literalSections);
  if (raw === undefined) {
    raw = literalSections.raw.map((item: string) => item.replace(/>\s+|\s+</g, m => m.trim()));
    cache.set(literalSections, raw);
  }
  const sink = getBuffer();
  setImmediate(async () => {
    sink.write(raw[0]);
    for (let i = 0; i < substs.length; i++) {
      await resolve(sink, substs[i]);
      sink.write(raw[i + 1]);
    }
    sink.end();
  });
  return sink;
};
