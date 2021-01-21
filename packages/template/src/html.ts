const repeatedWhitespace = /\s{2,}/g;
const whitespace = /\r\n|\n|\r|(\s{1,}(?=<))/g;

const cache = new Map();

type AtomicValues = false | string | number | undefined | null | Template | UnsafeHtml;

export type Child = AtomicValues | Promise<AtomicValues> | Promise<AtomicValues[]>;

export type TemplateElement = Child | Child[];

export class Template extends Array<TemplateElement> {
  public webComponents: string[];

  constructor(webComponents?: string[]) {
    super();
    this.webComponents = webComponents || [];
  }
}

class UnsafeHtml extends String {}

export const unsafeHtml = (value = '') => new UnsafeHtml(value);

const WEB_COMPONENT_PATTERN = /(?:<| is=")([a-zA-Z0-9]+-[a-zA-Z0-9-]+)/g;

const resolve = (element: TemplateElement): any => {
  if (element instanceof Template) {
    return element;
  } else if (Array.isArray(element)) {
    return (Template as any).from(element.map(resolve));
  } else if (element instanceof Promise) {
    return (element as Promise<TemplateElement>).then(resolve);
  } else if (typeof element === 'string') {
    return element
      .replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/`/g, '&#96;');
  } else {
    return element;
  }
};

export const html = (literalSections: TemplateStringsArray, ...substs: TemplateElement[]) => {
  let [raw, webComponents] = cache.get(literalSections) || [undefined, undefined];
  if (raw === undefined) {
    raw = literalSections.raw.map((item: string) => item.replace(whitespace, '').replace(repeatedWhitespace, ' '));
    webComponents = Array.from(
      new Set(Array.from(raw.join().matchAll(WEB_COMPONENT_PATTERN)).map((hit: any) => hit[1])),
    );
    cache.set(literalSections, [raw, webComponents]);
  }
  const result = new Template(webComponents);
  for (let i = 0; i < substs.length; i++) {
    result.push(raw[i]);
    result.push(resolve(substs[i]));
  }
  result.push(raw[raw.length - 1]);
  return result;
};
