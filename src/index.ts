/*
 * Copyright (c) 2024 John Newton
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @remarks
 * The data optionally passed to a route on dispatch.
 */
export interface RouteData {}

/**
 * @remarks
 * Constructed during dispatch, the RouteContext is passed to a handler callback on a match.
 */
export type RouteContext<D extends RouteData> = {
  /**
   * @remarks
   * The current URL to test against the defined router path patterns.
   */
  url: URL;
  /**
   * @remarks
   * Mapping between URL path parameter names and the corresponding values extracted from the URL path.
   * Example: path "/widgets/xyz" matched against pattern "/widgets/:widget" would result in {widget: "xyz"}.
   */
  binding: {
    [key: string]: string;
  };
  /**
   * @remarks
   * Arbitrary data passed along to the route handler.
   */
  data: D;
}

/**
 * @remarks
 * A route definition: the regex is compiled from the defined path-pattern.
 */
export type Route<T, D extends RouteData> = {
  regex: RegExp,
  callback: RouteCallback<T, D>;
}

/**
 * @remarks
 * Mapping between path-patterns and callbacks, as passed during Router initialization.
 */
export type RouteHandlers<P extends string, T, D extends RouteData> = {
  [pathname in P]: RouteCallback<T, D>;
}

/**
 * @remarks
 * Handler called when a route has been successfully matched.
 */
export type RouteCallback<T, D extends RouteData> = {
  /**
   * @remarks
   * The callback function: receives a route context and returns a specified type.
   *
   * @param context
   * Handler-callback with context.
   */
  (context: RouteContext<D>): T;
}

/**
 * @remarks
 * The options passed during Router initialization.
 */
export interface RouterConfig<P extends string, T, D extends RouteData> {
  /**
   * @remarks
   * Handler called when no defined path-pattern matches the given URL.
   */
  notFound: RouteCallback<T, D>;
  /**
   * @remarks
   * Mapping between path-patterns and handler callbacks.
   */
  routes: RouteHandlers<P, T, D>;
}

/**
 * @remarks
 * Simple URL dispatcher that compiles regular expressions from the given path patterns.
 * Routes are tested in the order in which they are defined. Method `dispatch` must
 * be called in order to dispatch a URL: there is no built-in integration for the DOM,
 * thereby making the router suitable for running in a Worker or SharedWorker.
 */
export default class Router<P extends string, T, D extends RouteData> {
  private config: RouterConfig<P, T, D>;
  private notFound: Route<T, D>;
  private routes: Route<T, D>[];

  constructor(config: RouterConfig<P, T, D>) {
    this.config = config;
    this.notFound = {
      regex: new RegExp(''),
      callback: config.notFound
    };
    this.routes = this.initializeRoutes();
  };

  /**
   * @remarks
   * Dispatches the route-handler callback function associated with the given path.
   */
  public dispatch(url: URL, data?: D): T {
    const pathname = url.pathname;

    const context: RouteContext<D> = {
      url,
      binding: {},
      data: data || {} as D
    };

    const routeHandler: Route<T, D> = this.routes.find((route: Route<T, D>) => {
      const result: RegExpExecArray | null = route.regex.exec(pathname);

      if (!result) return;

      context.binding = result.groups || {};

      return route;
    }) || this.notFound;

    const result: T = routeHandler.callback(context);

    return result;
  }

  private initializeRoutes = (): Route<T, D>[] => {
    return Object.keys(this.config.routes).map(path => {
      if (path[0] !== '/') {
        throw new Error(`route must start with '/': ${path}`);
      }

      const pathComponents: string[] = path.split('/');
      const regexPathComponents: string[] = [];

      pathComponents.forEach((pathComponent: string) => {
        if (pathComponent[0] === ':') {
          const key: string = encodeURIComponent(pathComponent.slice(1, pathComponent.length));
          regexPathComponents.push(`(?<${key}>[^/]+)`);
        } else {
          regexPathComponents.push(encodeURIComponent(pathComponent));
        }
      });
      const regexPath = regexPathComponents.join('/');
      const callback = this.config.routes[path as P];

      if (!callback) {
        throw new Error(`No callback defined for path: ${path}`);
      }

      return {
        regex: new RegExp(`^${regexPath}$`, 'u'),
        callback
      };
    });
  };
};
