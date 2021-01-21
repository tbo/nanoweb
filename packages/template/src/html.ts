const repeatedWhitespace = /\s{2,}/g;
const whitespace = /\r\n|\n|\r|(\s{1,}(?=<))/g;

const htmlEscape = (value: any) =>
  typeof value !== 'string' || (value as any) instanceof UnsafeHtml
    ? value
    : value
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');

const cache = new Map();

type AtomicValues = false | string | number | undefined | null | Template | UnsafeHtml;

export type Child = AtomicValues | Promise<AtomicValues> | Promise<AtomicValues[]>;

export type TemplateElement = Child | Child[];

export class Template extends Array<Child> {
  public webComponents: string[];

  constructor(webComponents?: string[]) {
    super();
    this.webComponents = webComponents || [];
  }
}

class UnsafeHtml extends String {}

export const unsafeHtml = (value = '') => new UnsafeHtml(value);

const WEB_COMPONENT_PATTERN = /(?:<| is=")([a-zA-Z0-9]+-[a-zA-Z0-9-]+)/g;

const resolve = (element: TemplateElement): Template | Promise<Template> => {
  const template = new Template();
  if (element instanceof Template) {
    return element;
  } else if (Array.isArray(element)) {
    // TODO consider using Template.from here
    template.push(...element.map(resolve));
  } else if (element instanceof Promise) {
    template.push((element as any).then(resolve));
  } else {
    template.push(htmlEscape(element));
  }
  return template;
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
    const subst = substs[i];
    result.push(raw[i]);
    if (subst instanceof Template) {
      result.push(...subst.flat());
      result.webComponents = [...result.webComponents, ...subst.webComponents];
    } else if (Array.isArray(subst)) {
      result.push(...subst.flatMap(htmlEscape));
      // TODO Check if needed
      subst.forEach(item => {
        if (item instanceof Template) {
          result.webComponents.push(...item.webComponents);
        }
      });
    } else if (subst instanceof Promise) {
      result.push(resolve(subst));
    } else {
      result.push(htmlEscape(subst));
    }
  }
  result.push(raw[raw.length - 1]);
  return result;
};
