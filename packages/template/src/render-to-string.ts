import { Template } from './html';

export const resolve = async (component: Template | Promise<Template>, webComponents: string[]) => {
  const list = await component;
  webComponents.push(...list.webComponents);
  let buffer = '';
  for (const item of list) {
    if (item !== undefined) {
      const resolvedItem = await item;
      buffer += resolvedItem instanceof Template ? await resolve(resolvedItem, webComponents) : resolvedItem;
    }
  }
  return buffer;
};

export interface RenderOptions {
  transformResult?: (text: string, webComponents: string[]) => string;
}

export const renderToString = async (component: Template | Promise<Template>, options?: RenderOptions) => {
  const webComponents: string[] = [];
  const buffer = await resolve(component, webComponents);
  if (options?.transformResult) {
    return options.transformResult(buffer, [...new Set(webComponents)]);
  }
  return buffer;
};
