import morphdom from 'morphdom';
const { performance } = window;

let revision: string;

const loadingAnimation = document.createElement('style');
loadingAnimation.innerHTML = `
  body { transition: opacity 150ms ease-in 16ms; }
  body.is-loading { opacity: 0.75; }
`;

const isLocalLink = (node: Node): boolean =>
  ((node as HTMLElement).closest('a')?.getAttribute('href') || '').indexOf('://') === -1;

const isTextInput = (node: Node): node is HTMLInputElement =>
  node.nodeName === 'INPUT' && ['email', 'text', 'password'].includes((node as HTMLInputElement).type);

// Browsers don't evaluate newly added scripts. We are cloning the node
// as a workaround.
const replaceWithClone = (to: HTMLScriptElement, from = to) => {
  const script = document.createElement('script');
  Array.from(to.attributes).forEach(attribute => {
    script.setAttribute(attribute.nodeName, attribute.nodeValue ?? '');
  });
  script.innerHTML = to.innerHTML;
  from.replaceWith(script);
};

const shouldUpdate = (isCacheRequest: boolean) => (from: Node, to: Node) => {
  if (
    (from === document.activeElement &&
      isTextInput(from) &&
      isTextInput(to) &&
      from.value !== from.getAttribute('value')) ||
    (isCacheRequest && (from as any).getAttribute('data-lazy') !== null)
  ) {
    return false;
  } else if (from.nodeName === 'SCRIPT' && to.nodeName === 'SCRIPT' && (to as HTMLScriptElement).innerText) {
    replaceWithClone(to as HTMLScriptElement, from as HTMLScriptElement);
    return false;
  }
  return !from.isEqualNode(to);
};

const shouldUpdateFromNetwork = shouldUpdate(false);
const shouldUpdateFromCache = shouldUpdate(true);
let abortController: AbortController | null = null;

const parser = new DOMParser();

const IMMUTABLE_TAGS = ['STYLE', 'SCRIPT', 'LINK'];

const morphHead = (from: HTMLHeadElement, to: HTMLHeadElement) => {
  Array.from(from.children)
    .filter(element => !IMMUTABLE_TAGS.includes(element.nodeName))
    .forEach(element => from.removeChild(element));
  Array.from(to.children)
    .filter(
      element =>
        !IMMUTABLE_TAGS.includes(element.nodeName) ||
        !Array.from(from.children).find(fromElement => fromElement.isEqualNode(element)),
    )
    .forEach(element => from.appendChild(element));
};

const removeUnusedHeaderElements = (from: HTMLHeadElement, to: HTMLHeadElement) => {
  Array.from(from.children)
    .filter(
      element =>
        IMMUTABLE_TAGS.includes(element.nodeName) &&
        element !== loadingAnimation &&
        !Array.from(to.children).find(toElement => toElement.isEqualNode(element)),
    )
    .forEach(element => from.removeChild(element));
};

const transformDom = (mode: 'cache' | 'network', newDom: Document) => {
  performance.mark('morph_dom');
  morphHead(document.head, newDom.head.cloneNode(true) as HTMLHeadElement);
  morphdom(document.body, newDom.body.cloneNode(true), {
    getNodeKey: node => (node as HTMLElement).id || (node.nodeName === 'SCRIPT' && (node as HTMLScriptElement).src),
    onBeforeElUpdated: mode === 'network' ? shouldUpdateFromNetwork : shouldUpdateFromCache,
    onNodeAdded: node => {
      if (node.nodeName === 'SCRIPT') {
        replaceWithClone(node as HTMLScriptElement);
      }
      return node;
    },
  });
  if (mode === 'network') {
    removeUnusedHeaderElements(document.head, newDom.head);
  }
  performance.measure('morphing', 'morph_dom');
};

const setUrl = (url: string, replace: boolean) => {
  if (url !== window.location.href) {
    history[replace ? 'replaceState' : 'pushState'](replace ? history.state : null, '', url);
  }
};

const restoreScrollPosition = () => {
  const position = window.history.state?.scrollPosition;
  if (position) {
    window.scrollTo(...position);
  } else {
    let anchor;
    const hash = location.hash.slice(1);
    if (hash && (anchor = document.querySelector(`[name="${hash}"], [id="${hash}"]`))) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }
};

type CacheEntry = { dom: Document; validUntil: number; url: string } | undefined;

const cacheMap: Record<string, CacheEntry> = {};

const parseResponse = async (response: Response, request: Request) => {
  performance.mark('parse_response_start');
  const validUntil = new Date(response.headers.get('Date') || 0).getTime() + 1800000;
  const dom = parser.parseFromString(await response.clone().text(), 'text/html');
  const [, hash] = request.url.split('#');
  performance.measure('Parse response', 'parse_response_start');
  return { dom, validUntil, url: response.url + (hash ? '#' + hash : '') };
};

const cacheResponse = (request: Request, response: Response, parsedResponse: CacheEntry) => {
  performance.mark('cache_response_start');
  if (response.status < 400) {
    cacheMap[response.url] = parsedResponse;
    if (response.status === 301) {
      cacheMap[request.url] = parsedResponse;
    }
  }
  performance.measure('Cache response', 'cache_response_start');
};

const getResponseFromCache = (request: Request): CacheEntry => {
  const hit = cacheMap[request.url];
  return hit ? { ...hit, dom: hit.dom.cloneNode(true) as Document } : undefined;
};

const handleNetworkResponse = async (
  request: Request,
  cacheRace: AbortController,
  replace: boolean,
): Promise<string | undefined> => {
  // We stop loading new images to improve the loading speed for the upcoming request
  document.querySelectorAll('img').forEach((image: HTMLImageElement) => {
    if (!image.complete) {
      image.style.visibility = 'hidden';
      image.setAttribute('src', '');
    }
  });
  performance.mark('fetch_request');
  const response = await fetch(request, { importance: 'high' } as any);
  performance.measure('Get initial network response', 'fetch_request');
  performance.mark('handle_network_response_start');
  const { headers } = response;
  if (
    headers.get('content-type')?.indexOf('text/html') === -1 ||
    (headers.get('x-revision') && revision && headers.get('x-revision') !== revision)
  ) {
    abortController?.abort();
    window.location.href = response.url;
    return undefined;
  }

  const parsed = await parseResponse(response, request);
  setUrl(parsed.url, replace);
  transformDom('network', parsed.dom);
  // Aborting requests of cached responses will lead to uncaught exceptions
  abortController = null;
  cacheResponse(request, response, parsed);
  cacheRace.abort();
  window.document.dispatchEvent(
    new Event('new-content', {
      bubbles: true,
      cancelable: true,
    }),
  );
  performance.measure('Handle network response', 'handle_network_response_start');
  return response.url;
};

const updateFromCache = (request: Request, cacheRace: AbortController, replace: boolean) => {
  performance.mark('update_from_cache_start');
  const parsed = getResponseFromCache(request);
  if (!parsed || cacheRace.signal.aborted || parsed.validUntil < Date.now()) {
    return;
  }
  setUrl(parsed.url, replace);
  transformDom('cache', parsed.dom);
  performance.measure('Update from cache', 'update_from_cache_start');
  return parsed.url;
};

const handleTransition = async (targetUrl: string, body?: BodyInit, replace = false) => {
  performance.mark('transition_start');
  abortController?.abort();
  abortController = new AbortController();
  const cacheRace = new AbortController();
  document.body.classList.add('is-loading');
  const request = new Request(targetUrl, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    redirect: 'follow',
    signal: abortController.signal,
    body,
  });
  performance.mark('trigger_requests');
  const cachedTransition =
    request.method.toUpperCase() === 'GET' ? updateFromCache(request, cacheRace, replace) : undefined;
  const networkTransition = handleNetworkResponse(request, cacheRace, replace).catch(error => {
    if (error.name !== 'AbortError') {
      console.error(error, `Unable to resolve "${targetUrl}". Doing hard load instead...`); // eslint-disable-line
      window.location.href = targetUrl;
    }
  });
  const result = cachedTransition || (await networkTransition);
  performance.measure('Transition', 'transition_start');
  return result;
};

const saveScrollPosition = () =>
  window.history.replaceState({ scrollPosition: [window.scrollX, window.scrollY] }, document.title);

/**
 * Triggers a page transition programmatically
 */
export const navigateTo = async (targetUrl: string, body?: BodyInit, target?: string | null, replace?: boolean) => {
  if (!targetUrl) {
    return;
  } else if (target === '_parent' && window.parent !== window) {
    window.top.postMessage({ type: 'NAVIGATE', targetUrl }, window.location.origin);
    return;
  }
  saveScrollPosition();
  if (targetUrl.startsWith('#')) {
    setUrl(location.pathname + targetUrl, false);
  } else if (await handleTransition(targetUrl, body, replace)) {
    window.document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  }
  restoreScrollPosition();
};

const handleClick = (event: MouseEvent) => {
  const element = (event!.target! as HTMLElement).closest('a');
  if (element && isLocalLink(element)) {
    event.preventDefault();
    navigateTo(
      element.getAttribute('href') ?? '',
      undefined,
      element.getAttribute?.('target'),
      element.dataset.replace !== undefined,
    );
  }
};

const handleSubmit = (event: Event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const action = form.getAttribute('action');
  if (!action) {
    return;
  }
  const data = new FormData(form);
  const target = form.getAttribute('target');
  const { activeElement } = document;
  // The submitter event property is not yet available in all browsers so we have to rely
  // on `activeElement`
  if (
    activeElement &&
    form.contains(activeElement) &&
    (activeElement.tagName === 'BUTTON' ||
      (activeElement.tagName === 'INPUT' && activeElement.getAttribute('type')?.toLowerCase() === 'submit')) &&
    activeElement.getAttribute('name') &&
    activeElement.getAttribute('value')
  ) {
    data.append(activeElement.getAttribute('name')!, activeElement.getAttribute('value')!);
  }
  if (form.method === 'post') {
    navigateTo(action, data, target);
  } else {
    const query = new URLSearchParams(data as any).toString();
    navigateTo(action + (query ? '?' + query : ''), undefined, target);
  }
};

let scrollSaveTimer: NodeJS.Timeout;
const handleScroll = () => {
  clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(saveScrollPosition, 100);
};

const handleMessage = (event: MessageEvent) => {
  if ((event.origin === window.location.origin, event.data?.type === 'NAVIGATE')) {
    navigateTo(event.data?.targetUrl, event.data?.body);
  }
};

const cacheInitialPageLoad = () => {
  const url = window.location.href;
  cacheMap[url] = {
    dom: document.cloneNode(true) as Document,
    validUntil: new Date().getTime() + 1800000,
    url,
  };
};

interface Options {
  revision?: string;
  defaultLoadingAnimation?: boolean;
}

export default (options?: Options) => {
  if ((window as any).__links__) {
    return;
  }
  (window as any).__links__ = true;
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  if (options?.revision) {
    revision = options?.revision;
  }
  cacheInitialPageLoad();

  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  window.addEventListener('message', handleMessage);
  window.onpopstate = async (event: PopStateEvent) => {
    await handleTransition((event?.target as Window).location.href, undefined, true);
    restoreScrollPosition();
  };
  // We need to save the scroll position constantly, because we can't access the previous history entry
  // after popstate: https://github.com/whatwg/html/issues/1042
  window.addEventListener('scroll', handleScroll, { passive: true });

  restoreScrollPosition();

  if (options?.defaultLoadingAnimation) {
    document.head.appendChild(loadingAnimation);
  }
};
