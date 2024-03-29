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

const resolve = (subst: TemplateElement) => {
  if (subst instanceof Promise) {
    return subst.then(resolve);
  } else if (Array.isArray(subst)) {
    return Promise.all(subst as any).then(async t => {
      let result = '';
      for (let i = 0; i < t.length; i++) {
        const tmp = resolve(t[i]);
        result += tmp instanceof Promise ? await tmp : tmp;
      }
      return result;
    });
  } else if (typeof subst === 'number' || subst instanceof Template) {
    return subst;
  } else if (!subst) {
    return '';
  } else {
    return escapeText(String(subst));
  }
};

export const html = async (literalSections: TemplateStringsArray, ...substs: TemplateElement[]): Promise<Template> => {
  let raw = cache.get(literalSections);
  if (raw === undefined) {
    raw = literalSections.raw.map((item: string) => item.replace(/>\s+|\s+</g, m => m.trim()));
    cache.set(literalSections, raw);
  }
  let result = raw[0];
  for (let i = 0; i < substs.length; i++) {
    const tmp = resolve(substs[i]);
    result += tmp instanceof Promise ? await tmp : tmp;
    result += raw[i + 1];
  }
  return new Template(result);
};
