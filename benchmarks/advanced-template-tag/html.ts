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
  let i;
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

class UnsafeHtml extends String {}
export const unsafeHtml = (value = '') => new UnsafeHtml(value);

const cache = new Map();
const repeatedWhitespace = /\s{1,}/g;
const whitespace = /\r\n|\n|\r|(\s{1,}(?=<))/g;

const resolve = (subst: any): Promise<string> | string => {
  if (subst instanceof Promise) {
    return subst.then(resolve);
  } else if (Array.isArray(subst)) {
    return Promise.all(subst).then(async t => {
      let result = '';
      for (let j = 0; j < t.length; j++) {
        const r2 = resolve(t[j]);
        result += r2 instanceof Promise ? await r2 : r2;
      }
      return result;
    });
  } else if (typeof subst === 'number' || (subst as any) instanceof UnsafeHtml) {
    return subst;
  } else if (!subst && subst !== 0) {
    return '';
  } else {
    return escapeText(String(subst));
  }
};

export const html = async (literalSections: any, ...substs: any[]) => {
  let raw = cache.get(literalSections);
  if (raw === undefined) {
    raw = literalSections.raw.map((item: string) => item.replace(whitespace, ' ').replace(repeatedWhitespace, ' '));
    cache.set(literalSections, raw);
  }
  let result = '';
  for (let i = 0; i < substs.length; i++) {
    result += raw[i];
    const r2 = resolve(substs[i]);
    result += r2 instanceof Promise ? await r2 : r2;
  }
  result += raw[raw.length - 1]; // (A)
  return new UnsafeHtml(result);
};
