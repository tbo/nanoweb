import { Cache } from 'https://deno.land/x/local_cache@1.0/mod.ts';
import { Template } from './html.ts';
import { resolve } from './render-to-string.ts';

type CacheKeyFunction<TFn> = TFn extends (...a: infer A) => any ? (...a: A) => false | string : never;

type CacheResult = Template | Promise<Template>;

interface Options<T> {
  ttl?: number;
  cacheKey?: CacheKeyFunction<T>;
}

/**
 * Caches component responses in an optimized format
 */
export const cache = <T extends (...args: any[]) => CacheResult>(
  func: T,
  options: Options<T> = {},
): ((...funcArgs: Parameters<T>) => CacheResult) => {
  const { ttl, cacheKey } = options;
  const componentCache = new Cache<string, CacheResult>(ttl);
  return (...args: Parameters<T>): CacheResult => {
    const key = cacheKey?.(...args) || 'static';
    if (componentCache.has(key)) {
      return componentCache.get(key)!;
    } else {
      const result = func(...args);
      setImmediate(async () => {
        const webComponents: string[] = [];
        const compiledString = await resolve(result, webComponents);
        const compiledTemplate = new Template(webComponents);
        compiledTemplate[0] = compiledString;
        componentCache.set(key, compiledTemplate);
      });
      return result;
    }
  };
};
