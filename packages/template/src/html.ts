const repeatedWhitespace = /\s{2,}/g;
const whitespace = /\r\n|\n|\r|(\s{1,}(?=<))/g;

const cache = new Map();

export type TemplateElement =
  | false
  | string
  | number
  | undefined
  | null
  | Template
  | UnsafeHtml
  | TemplateElement[]
  | Promise<TemplateElement>;

export class Template extends Array {
  public webComponents: string[];

  constructor(webComponents?: string[]) {
    super();
    this.webComponents = webComponents || [];
  }
}

class UnsafeHtml extends String {}

/**
 * Marks strings that shouldn't be escaped
 */
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
  } else if (element || element === 0) {
    return String(element);
  }
};

export const html = (literalSections: TemplateStringsArray, ...expressions: TemplateElement[]) => {
  let [raw, webComponents] = cache.get(literalSections) || [undefined, undefined];
  if (raw === undefined) {
    raw = literalSections.raw.map((item: string) => item.replace(whitespace, '').replace(repeatedWhitespace, ' '));
    webComponents = Array.from(
      new Set(Array.from(raw.join().matchAll(WEB_COMPONENT_PATTERN)).map((hit: any) => hit[1])),
    );
    cache.set(literalSections, [raw, webComponents]);
  }
  const result = new Template(webComponents);
  for (let i = 0; i < expressions.length; i++) {
    result.push(raw[i]);
    result.push(resolve(expressions[i]));
  }
  result.push(raw[raw.length - 1]);
  return result;
};
