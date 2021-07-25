import { Template } from './html.ts';

export const resolve = async (component: Template | Promise<Template>, webComponents: string[]) => {
  const list = await component;
  webComponents.push(...list.webComponents);
  let buffer = '';
  for (const item of list) {
    const resolvedItem = await item;
    if (resolvedItem || resolvedItem === 0) {
      buffer += resolvedItem instanceof Template ? await resolve(resolvedItem, webComponents) : resolvedItem;
    }
  }
  return buffer;
};

export interface StringRenderOptions {
  /** Allows to apply a final transformation of the rendered string */
  transformResult?: (text: string, webComponents: string[]) => string;
}

export const renderToString = async (component: Template | Promise<Template>, options?: StringRenderOptions) => {
  const webComponents: string[] = [];
  const buffer = await resolve(component, webComponents);
  if (options?.transformResult) {
    return options.transformResult(buffer, [...new Set(webComponents)]);
  }
  return buffer;
};
