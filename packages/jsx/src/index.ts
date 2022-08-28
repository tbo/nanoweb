///<reference path="./typings.d.ts" />
const rxUnescaped = new RegExp(/["'&<>]/);

export const render = async (element: any): Promise<string> => {
  const awaited = await element;
  if (awaited instanceof Template) {
    return '<!DOCTYPE html>' + (await resolve(element));
  }
  return String(element);
};

const resolve = async (elements: any): Promise<string> => {
  let result = '';
  console.log('------------------------------->', elements);
  if (Array.isArray(elements)) {
    console.log('a');
    for (const child of elements) {
      result += await resolve(child instanceof Promise ? await child : child);
    }
  } else if (elements || elements === 0) {
    console.log('b');
    return elements;
  }

  console.log('c');
  return result;
};

function escape(text: any): string {
  /* Much faster when there is no unescaped characters */
  if (typeof text !== 'string' || !rxUnescaped.test(text)) {
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

export class Template extends Array {}

export type TemplateType = typeof Template;

export const unsafe = (value = '') => Template.from([value]);

const SELF_CLOSING = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const jsx = (type: any, props: Record<string, any>): Template => {
  const children = !props.children
    ? []
    : Array.isArray(props?.children) && !(props.children instanceof Template)
    ? props.children
    : [props.children];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!(child instanceof Template)) {
      children[i] = escape(child);
    }
  }
  if (typeof type === 'undefined') {
    return Template.from(children);
  }
  if (typeof type === 'function') {
    return type(props);
  }
  let propString = '';
  if (props) {
    for (const i in props) {
      if (props[i] || props[i] === 0) {
        propString += toString(i, props[i]);
      }
    }
  }
  const template = new Template();
  if (!children.length) {
    if (SELF_CLOSING.has(type)) {
      template[0] = '<' + type + propString + '/>';
    } else {
      template[0] = '<' + type + propString + '></' + type + '>';
    }
    return template;
  }
  const length = children.length;
  template[0] = '<' + type + propString + '>';
  for (let i = 0; i < length; i++) {
    template[i + 1] = children[i];
  }
  template[length + 1] = '</' + type + '>';
  return template;
};

export const jsxs = jsx;

const CAMEL_CASE_PATTERN = new RegExp('[a-z]+((d)|([A-Z0-9][a-z0-9]+))*([A-Z])?', 'g');

const toKebapCase = (value: string) => value.match(CAMEL_CASE_PATTERN)!.join('-');

const kebapCache: Record<string, string> = {};
const keyCache: Record<string, string> = {};

const toString = (key: string, value: any) => {
  if (value == null || key === 'children') {
    return '';
  } else if (key === 'class' && Array.isArray(value)) {
    value = value.flat().filter(Boolean).join(' ');
  } else if (key === 'style') {
    value = Object.entries(value)
      .map(entry => [kebapCache[entry[0]] || (kebapCache[entry[0]] = toKebapCase(entry[0])), entry[1]].join(':'))
      .join(';')
      .toLowerCase();
  } else if (typeof value === 'object') {
    value = JSON.stringify(value);
  } else if (typeof value === 'boolean') {
    return ` ${keyCache[key] || (keyCache[key] = escape(key.toLowerCase()))}`;
  }
  return ` ${keyCache[key] || (keyCache[key] = escape(key.toLowerCase()))}="${escape(value)}"`;
};
